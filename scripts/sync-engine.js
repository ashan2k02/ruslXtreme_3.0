import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/scoreboard.json')
const ENV_FILE = path.resolve(__dirname, '../.env.local')

export const CONTEST_ID = 133706
export const CSACADEMY_BASE = 'https://csacademy.com'
export const SCOREBOARD_STATE_URL = `${CSACADEMY_BASE}/contest/scoreboard_state/?contestId=${CONTEST_ID}`

// Verified pointsWorth weights for IEEEXtreme 20.0
export const DEFAULT_TASK_WEIGHTS = {
  '52351': 82.55,
  '52352': 91.712,
  '52354': 90.91,
  '52355': 72.544,
  '52356': 90.0,
  '52357': 85.0,
  '52381': 100.0,
  '52436': 87.83,
}

// Canonical challenge names for readable breakdown
export const KNOWN_TASK_NAMES = {
  '52351': 'Star Formation',
  '52352': 'One Junction Box',
  '52354': 'Orbital Rendezvous',
  '52355': 'Quantum Telemetry',
  '52356': 'Deep Space Beacon',
  '52357': 'Constellation Matrix',
  '52381': 'Chronos Calibration',
  '52436': 'Space Station Navigation (Game)',
}

/**
 * Load .env.local without external dependencies
 */
export function loadLocalEnv() {
  const env = { ...process.env }
  if (fs.existsSync(ENV_FILE)) {
    try {
      const content = fs.readFileSync(ENV_FILE, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (env[key] === undefined) {
            env[key] = val
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }
  return env
}

/**
 * Strict Rajarata University validation
 */
export function isRajarataUniversity(uni) {
  if (!uni || typeof uni !== 'string') return false
  const clean = uni.trim().toLowerCase().replace(/\s+/g, ' ')
  return (
    clean === 'rajarata university of sri lanka' ||
    clean === 'rajarata university' ||
    clean.includes('rajarata university of sri lanka') ||
    clean.includes('rajarata university')
  )
}

function formatMinutes(minutes) {
  if (minutes == null || isNaN(minutes) || minutes < 0) return '00:00'
  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export class ScoreboardSyncEngine {
  constructor(options = {}) {
    this.env = loadLocalEnv()

    this.upstreamIntervalMs = options.upstreamIntervalMs || Number(this.env.UPSTREAM_SYNC_INTERVAL_MS) || 10000
    this.frontendIntervalMs = options.frontendIntervalMs || Number(this.env.FRONTEND_POLL_INTERVAL_MS) || 5000

    this.taskWeights = { ...DEFAULT_TASK_WEIGHTS, ...(options.taskWeights || {}) }

    // Auth state
    this.email = this.env.CSACADEMY_EMAIL || null
    this.password = this.env.CSACADEMY_PASSWORD || null
    this.sessionId = this.env.CSACADEMY_SESSION_ID || this.env.CSACADEMY_CROSS_SESSION_ID || null
    this.csrfToken = this.env.CSACADEMY_CSRF_TOKEN || null
    this.isAuthenticated = Boolean(this.sessionId)

    // Synchronization state
    this.isRunning = false
    this.isSyncing = false
    this.currentSyncPromise = null
    this.timer = null
    this.syncCount = 0
    this.consecutiveFailures = 0
    this.lastSyncTime = null
    this.lastError = null

    // In-memory cached payload
    this.cachedState = this.loadInitialCache()
  }

  loadInitialCache() {
    if (fs.existsSync(OUTPUT_FILE)) {
      try {
        const raw = fs.readFileSync(OUTPUT_FILE, 'utf8')
        const data = JSON.parse(raw)
        if (data && Array.isArray(data.teams) && data.teams.length > 0) {
          return {
            status: 'cached',
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            lastUpdatedFormatted: new Date(data.lastUpdated || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            sourceName: 'CS Academy Verified Standings Snapshot',
            authenticated: false,
            syncCount: 0,
            upstreamIntervalMs: this.upstreamIntervalMs,
            frontendIntervalMs: this.frontendIntervalMs,
            numRegistered: data.numRegistered || 8683,
            numOfficialTeams: data.teams.length,
            numRajarataTeams: data.teams.length,
            teams: data.teams,
            error: null,
          }
        }
      } catch {
        // Fallback below
      }
    }

    return {
      status: 'cached',
      lastUpdated: new Date().toISOString(),
      lastUpdatedFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sourceName: 'CS Academy Scoring Engine Initializing',
      authenticated: false,
      syncCount: 0,
      upstreamIntervalMs: this.upstreamIntervalMs,
      frontendIntervalMs: this.frontendIntervalMs,
      numRegistered: 8683,
      numOfficialTeams: 0,
      numRajarataTeams: 0,
      teams: [],
      error: null,
    }
  }

  getCookieHeader() {
    const cookies = []
    if (this.sessionId) {
      cookies.push(`sessionid=${this.sessionId}`)
      cookies.push(`crossSessionId=${this.sessionId}`)
    }
    if (this.csrfToken) cookies.push(`csrftoken=${this.csrfToken}`)
    return cookies.join('; ')
  }

  async authenticate() {
    if (!this.email || !this.password) {
      return false
    }

    try {
      // 1. Initial handshake to obtain CSRF token
      const handshakeRes = await fetch(`${CSACADEMY_BASE}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (RUSLXTREME Synchronizer)',
        },
      })

      const setCookies = handshakeRes.headers.getSetCookie
        ? handshakeRes.headers.getSetCookie()
        : [handshakeRes.headers.get('set-cookie')].filter(Boolean)

      for (const c of setCookies) {
        if (c.includes('csrftoken=')) {
          this.csrfToken = c.split('csrftoken=')[1].split(';')[0]
        }
      }

      if (!this.csrfToken) {
        return false
      }

      // 2. Perform official login
      const loginRes = await fetch(`${CSACADEMY_BASE}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-csrftoken': this.csrfToken,
          Cookie: `csrftoken=${this.csrfToken}`,
          'User-Agent': 'Mozilla/5.0 (RUSLXTREME Synchronizer)',
          Referer: `${CSACADEMY_BASE}/`,
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          remember: true,
        }),
      })

      if (!loginRes.ok) {
        return false
      }

      const loginData = await loginRes.json()
      if (loginData.error) {
        this.lastError = `CS Academy Auth: ${loginData.error.message || 'Authentication rejected'}`
        return false
      }

      const loginCookies = loginRes.headers.getSetCookie
        ? loginRes.headers.getSetCookie()
        : [loginRes.headers.get('set-cookie')].filter(Boolean)

      for (const c of loginCookies) {
        if (c.includes('sessionid=')) {
          this.sessionId = c.split('sessionid=')[1].split(';')[0]
        }
        if (c.includes('crossSessionId=')) {
          this.sessionId = c.split('crossSessionId=')[1].split(';')[0]
        }
        if (c.includes('csrftoken=')) {
          this.csrfToken = c.split('csrftoken=')[1].split(';')[0]
        }
      }

      this.isAuthenticated = Boolean(this.sessionId)
      return this.isAuthenticated
    } catch (err) {
      this.lastError = `Auth error: ${err.message}`
      return false
    }
  }

  async fetchScoreboardData() {
    const headers = {
      'x-requested-with': 'XMLHttpRequest',
      Accept: 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (RUSLXTREME Official Scoreboard Sync)',
    }

    if (this.sessionId) {
      headers['Cookie'] = this.getCookieHeader()
      if (this.csrfToken) {
        headers['x-csrftoken'] = this.csrfToken
      }
    }

    const res = await fetch(SCOREBOARD_STATE_URL, { headers })

    if (res.status === 401 || res.status === 403) {
      // Invalidate session and re-authenticate if credentials available
      this.isAuthenticated = false
      this.sessionId = null
      if (this.email && this.password) {
        await this.authenticate()
      }
      throw new Error(`Upstream returned HTTP ${res.status} (Authentication required or expired)`)
    }

    if (!res.ok) {
      throw new Error(`CS Academy returned HTTP ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    // If authenticated, also retrieve dynamic pointsWorth from contest tasks
    if (this.sessionId) {
      try {
        const tasksRes = await fetch(`${CSACADEMY_BASE}/contest/get_contest_tasks/?contestId=${CONTEST_ID}`, { headers })
        if (tasksRes.ok) {
          const taskData = await tasksRes.json()
          if (taskData.state?.ContestTask && Array.isArray(taskData.state.ContestTask)) {
            for (const ct of taskData.state.ContestTask) {
              if (ct.id && typeof ct.pointsWorth === 'number' && ct.pointsWorth > 0) {
                this.taskWeights[String(ct.id)] = ct.pointsWorth
              }
            }
          }
        }
      } catch {
        // Fallback to verified default weights
      }
    }

    return json
  }

  processRawState(raw) {
    if (!raw || !raw.state || !Array.isArray(raw.state.contestuser)) {
      throw new Error('Invalid scoreboard state structure received from CS Academy')
    }

    const contestUsers = raw.state.contestuser
    const publicUsers = Array.isArray(raw.state.publicuser) ? raw.state.publicuser : []
    const contestInfo = raw.state.contest && typeof raw.state.contest === 'object' ? raw.state.contest : {}
    const startTime = typeof contestInfo.startTime === 'number' ? contestInfo.startTime : 1793404800.0

    // Extract dynamic task points if present in state
    if (raw.state.ContestTask && Array.isArray(raw.state.ContestTask)) {
      for (const ct of raw.state.ContestTask) {
        if (ct.id && typeof ct.pointsWorth === 'number' && ct.pointsWorth > 0) {
          this.taskWeights[String(ct.id)] = ct.pointsWorth
        }
      }
    }

    const puMap = new Map()
    for (const pu of publicUsers) {
      if (pu && pu.id != null) {
        puMap.set(pu.id, pu)
      }
    }

    const allOfficialTeams = []

    for (const cu of contestUsers) {
      const teamType = cu.ieeeTeamType ?? 1
      // IEEE official participant filter (1 = official, 2 = late official)
      if (teamType !== 1 && teamType !== 2) {
        continue
      }

      const pu = puMap.get(cu.userId) || {}
      const teamName = pu.name || pu.username || `Team ${cu.userId}`
      const countryId = pu.countryId != null ? Number(pu.countryId) : null
      const university = (cu.university || '').trim()
      const isSriLanka = countryId === 211 || (pu.country && String(pu.country).toLowerCase() === 'sri lanka')
      const isRajarata = isRajarataUniversity(university)

      const solvedProblems = []
      let solvedCount = 0
      let partialCount = 0
      let recalculatedScore = 0

      if (cu.scores && typeof cu.scores === 'object') {
        for (const [taskId, tScoreRaw] of Object.entries(cu.scores)) {
          const tScore = tScoreRaw || {}
          const scoreFrac = typeof tScore.score === 'number' ? tScore.score : 0
          const attempts = typeof tScore.penalty === 'number' ? Math.max(1, tScore.penalty) : 1
          const scoreTimeSec = typeof tScore.scoreTime === 'number' ? tScore.scoreTime : 0

          let relMinutes = 0
          if (scoreTimeSec > 0 && startTime > 0 && scoreTimeSec >= startTime) {
            relMinutes = (scoreTimeSec - startTime) / 60
          } else if (scoreTimeSec > 0 && scoreTimeSec < 2000) {
            relMinutes = scoreTimeSec
          }

          const weight = this.taskWeights[taskId] || 100.0
          const points = Math.round(scoreFrac * weight * 10) / 10
          recalculatedScore += scoreFrac * weight

          if (scoreFrac >= 0.999) {
            solvedCount++
          } else if (scoreFrac > 0) {
            partialCount++
          }

          solvedProblems.push({
            id: `Task-${taskId}`,
            name: KNOWN_TASK_NAMES[taskId] || `Challenge ${taskId}`,
            points,
            score: scoreFrac,
            time: formatMinutes(relMinutes),
            attempts,
          })
        }
      }

      // Exact 2-decimal rounded official display score
      const finalScore = Math.round(recalculatedScore * 100) / 100
      // Official CS Academy integer penalty display
      const finalPenalty = Math.round(typeof cu.penalty === 'number' ? cu.penalty : 0)

      allOfficialTeams.push({
        teamId: `csa-${cu.id || cu.userId}`,
        teamName,
        score: finalScore,
        penalty: finalPenalty,
        solved: solvedCount,
        partiallySolved: partialCount,
        country: isSriLanka ? 'Sri Lanka' : 'International',
        countryCode: isSriLanka ? 'LK' : 'GL',
        university: isRajarata ? 'Rajarata University of Sri Lanka' : university,
        isSriLanka,
        isRajarata,
        worldRank: 0,
        solvedProblems,
      })
    }

    // Official CS Academy sorting comparator: score DESC, then penalty ASC
    allOfficialTeams.sort((a, b) => {
      const diff = b.score - a.score
      if (Math.abs(diff) > 1e-4) return diff
      return a.penalty - b.penalty
    })

    // Assign official World Rank and Island Rank across ALL official participants
    let slRankCounter = 1
    allOfficialTeams.forEach((team, index) => {
      team.worldRank = index + 1
      if (team.isSriLanka) {
        team.islandRank = slRankCounter++
      }
    })

    // STRICT REQUIREMENT: Filter ONLY Rajarata University of Sri Lanka teams
    const ruslTeams = allOfficialTeams.filter((t) => t.isRajarata)

    // Assign Rajarata internal University Rank (1 to N)
    ruslTeams.forEach((team, index) => {
      team.universityRank = index + 1
    })

    return {
      totalRegistered: contestUsers.length,
      allOfficialTeamsCount: allOfficialTeams.length,
      ruslTeams,
    }
  }

  async syncNow() {
    if (this.currentSyncPromise) {
      return this.currentSyncPromise
    }

    this.currentSyncPromise = (async () => {
      this.isSyncing = true
      const now = new Date()

      try {
        // If credentials exist but not logged in, attempt login
        if (!this.isAuthenticated && this.email && this.password) {
          await this.authenticate()
        }

        const raw = await this.fetchScoreboardData()
        const { totalRegistered, allOfficialTeamsCount, ruslTeams } = this.processRawState(raw)

        this.syncCount++
        this.consecutiveFailures = 0
        this.lastSyncTime = now
        this.lastError = null

        const newState = {
          status: 'connected',
          lastUpdated: now.toISOString(),
          lastUpdatedFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sourceName: this.isAuthenticated
            ? 'CS Academy Authenticated Live Engine'
            : 'CS Academy Official Scoring Engine',
          authenticated: this.isAuthenticated,
          syncCount: this.syncCount,
          upstreamIntervalMs: this.upstreamIntervalMs,
          frontendIntervalMs: this.frontendIntervalMs,
          numRegistered: totalRegistered,
          numOfficialTeams: allOfficialTeamsCount,
          numRajarataTeams: ruslTeams.length,
          teams: ruslTeams,
          error: null,
        }

        this.cachedState = newState

        // Persist verified snapshot to disk
        try {
          const payload = {
            contestId: CONTEST_ID,
            contestName: 'IEEEXtreme 20.0 — Rajarata University Delegations',
            lastUpdated: now.toISOString(),
            numRegistered: totalRegistered,
            numRajarataTeams: ruslTeams.length,
            isLive: true,
            isRealData: true,
            authenticated: this.isAuthenticated,
            source: 'https://csacademy.com/ieeextreme20/scoreboard/',
            teams: ruslTeams,
          }
          fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
          fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8')
        } catch {
          // Disk write error ignored
        }

        return newState
      } catch (err) {
        this.consecutiveFailures++
        this.lastError = err.message

        // Retain last successful teams, downgrade status appropriately
        const fallbackState = {
          ...this.cachedState,
          status: this.cachedState.teams.length > 0 ? 'cached' : 'error',
          sourceName: 'CS Academy Standings (Cached)',
          error: `Sync note (${this.consecutiveFailures}x): ${err.message}`,
        }

        this.cachedState = fallbackState
        return fallbackState
      } finally {
        this.isSyncing = false
      }
    })().finally(() => {
      this.currentSyncPromise = null
    })

    return this.currentSyncPromise
  }

  scheduleNextSync() {
    if (!this.isRunning) return

    // Exponential backoff if consecutive failures: 10s, 20s, 40s, max 60s
    let delay = this.upstreamIntervalMs
    if (this.consecutiveFailures > 0) {
      delay = Math.min(60000, this.upstreamIntervalMs * Math.pow(2, Math.min(3, this.consecutiveFailures)))
    }

    this.timer = setTimeout(async () => {
      if (!this.isRunning) return
      await this.syncNow()
      this.scheduleNextSync()
    }, delay)
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true

    // Trigger immediate first sync
    this.syncNow().finally(() => {
      this.scheduleNextSync()
    })
  }

  stop() {
    this.isRunning = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  getLatestState() {
    return this.cachedState
  }
}

// Singleton instance for server environments
let sharedEngine = null

export function getSharedSyncEngine(options = {}) {
  if (!sharedEngine) {
    sharedEngine = new ScoreboardSyncEngine(options)
  }
  return sharedEngine
}
