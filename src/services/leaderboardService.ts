import type {
  LeaderboardCategory,
  LeaderboardTeam,
  ConnectionStatus,
  ScoreboardState,
  ScoreboardPayload,
  SolvedProblem,
} from '../types/leaderboard'
import { demoLeaderboardTeams } from '../data/leaderboard'

// Known country ID mapping from CS Academy IEEEXtreme
const CS_ACADEMY_COUNTRIES: Record<number, { name: string; code: string }> = {
  211: { name: 'Sri Lanka', code: 'LK' },
  46: { name: 'China', code: 'CN' },
  103: { name: 'Indonesia', code: 'ID' },
  234: { name: 'United States', code: 'US' },
  102: { name: 'India', code: 'IN' },
  18: { name: 'Bangladesh', code: 'BD' },
  233: { name: 'United Kingdom', code: 'GB' },
  38: { name: 'Canada', code: 'CA' },
  10: { name: 'Australia', code: 'AU' },
  34: { name: 'Brazil', code: 'BR' },
  72: { name: 'France', code: 'FR' },
  78: { name: 'Germany', code: 'DE' },
  110: { name: 'Japan', code: 'JP' },
  198: { name: 'Singapore', code: 'SG' },
  113: { name: 'Jordan', code: 'JO' },
  121: { name: 'Lebanon', code: 'LB' },
  162: { name: 'Pakistan', code: 'PK' },
  170: { name: 'Philippines', code: 'PH' },
  219: { name: 'Tunisia', code: 'TN' },
  220: { name: 'Turkey', code: 'TR' },
  63: { name: 'Egypt', code: 'EG' },
  84: { name: 'Greece', code: 'GR' },
}

const CONTEST_ID = 133706
const PROXY_ENDPOINT = `/api/csacademy/contest/scoreboard_state/?contestId=${CONTEST_ID}`
const SNAPSHOT_ENDPOINT = `/data/scoreboard.json`

let isFetching = false
let lastFetchPromise: Promise<ScoreboardState> | null = null

// Helper to format minutes into HH:MM or minutes string
function formatMinutesToTime(minutes: number): string {
  if (minutes == null || isNaN(minutes) || minutes < 0) return '00:00'
  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Parses raw CS Academy scoreboard state into normalized LeaderboardTeam objects
 */
export function parseCSAcademyRawState(raw: any): LeaderboardTeam[] {
  if (!raw || !raw.state || !Array.isArray(raw.state.contestuser)) {
    return []
  }

  const contestUsers = raw.state.contestuser
  const publicUsers = Array.isArray(raw.state.publicuser) ? raw.state.publicuser : []
  const contestInfo = raw.state.contest && typeof raw.state.contest === 'object' ? raw.state.contest : {}
  const startTime = typeof contestInfo.startTime === 'number' ? contestInfo.startTime : 1793404800.0

  // Index public users by user ID
  const publicUserMap = new Map<number, any>()
  for (const pu of publicUsers) {
    if (pu && pu.id != null) {
      publicUserMap.set(pu.id, pu)
    }
  }

  const rawTeams: LeaderboardTeam[] = []

  for (const cu of contestUsers) {
    // Official participants only (1 = official, 2 = late official)
    const teamType = cu.ieeeTeamType ?? 1
    if (teamType !== 1 && teamType !== 2) {
      continue
    }

    const pu = publicUserMap.get(cu.userId) || {}
    const teamName = pu.name || pu.username || `Team ${cu.userId}`
    const countryId = pu.countryId != null ? Number(pu.countryId) : null
    const countryMeta = countryId != null ? CS_ACADEMY_COUNTRIES[countryId] : null
    const country = countryMeta ? countryMeta.name : 'International'
    const countryCode = countryMeta ? countryMeta.code : 'GL'

    const university = (cu.university || '').trim()
    const isSriLanka = countryId === 211 || country.toLowerCase() === 'sri lanka'
    const isRajarata = university.toLowerCase() === 'rajarata university of sri lanka'

    // Challenge score breakdown
    const solvedProblems: SolvedProblem[] = []
    let solvedCount = 0
    let partialCount = 0

    if (cu.scores && typeof cu.scores === 'object') {
      const taskEntries = Object.entries(cu.scores)
      for (const [taskId, tScoreRaw] of taskEntries) {
        const tScore = tScoreRaw as any
        const scoreFrac = typeof tScore.score === 'number' ? tScore.score : 0
        const attempts = typeof tScore.penalty === 'number' ? Math.max(1, tScore.penalty) : 1
        const scoreTimeSec = typeof tScore.scoreTime === 'number' ? tScore.scoreTime : 0

        // Calculate time relative to contest start in minutes
        let relMinutes = 0
        if (scoreTimeSec > 0 && startTime > 0 && scoreTimeSec >= startTime) {
          relMinutes = (scoreTimeSec - startTime) / 60
        } else if (scoreTimeSec > 0 && scoreTimeSec < 2000) {
          // Already in minutes or small relative seconds
          relMinutes = scoreTimeSec
        }

        const points = Math.round(scoreFrac * 100 * 10) / 10

        if (scoreFrac >= 0.999) {
          solvedCount++
        } else if (scoreFrac > 0) {
          partialCount++
        }

        solvedProblems.push({
          id: `Task-${taskId}`,
          name: `Challenge ${taskId}`,
          points,
          score: scoreFrac,
          time: formatMinutesToTime(relMinutes),
          attempts,
        })
      }
    }

    const totalScore = typeof cu.totalScore === 'number' ? Math.round(cu.totalScore * 100) / 100 : 0
    const penalty = typeof cu.penalty === 'number' ? Math.round(cu.penalty * 100) / 100 : 0

    rawTeams.push({
      teamId: `csa-${cu.id || cu.userId}`,
      teamName,
      score: totalScore,
      penalty,
      solved: solvedCount,
      partiallySolved: partialCount,
      country,
      countryCode,
      university: university || 'Independent / Not specified',
      isSriLanka,
      isRajarata,
      worldRank: 0, // assigned after sorting
      solvedProblems,
    })
  }

  // CS Academy official sort: score DESC, then penalty ASC
  rawTeams.sort((a, b) => {
    const diff = b.score - a.score
    if (Math.abs(diff) > 1e-4) return diff
    return a.penalty - b.penalty
  })

  // Assign world, island, and university ranks
  let islandCounter = 1
  let universityCounter = 1

  rawTeams.forEach((team, index) => {
    team.worldRank = index + 1
    if (team.isSriLanka) {
      team.islandRank = islandCounter++
    }
    if (team.isRajarata) {
      team.universityRank = universityCounter++
    }
  })

  return rawTeams
}

/**
 * Fetch the latest scoreboard data following the reliable fallback hierarchy:
 * 1. Live CS Academy proxy endpoint
 * 2. Static verified scoreboard snapshot (/data/scoreboard.json)
 * 3. In-memory demo data
 */
export async function fetchScoreboardData(force = false): Promise<ScoreboardState> {
  if (isFetching && lastFetchPromise && !force) {
    return lastFetchPromise
  }

  isFetching = true
  lastFetchPromise = (async () => {
    const now = new Date()

    // 1. Attempt to fetch live from CS Academy via dev server proxy or direct endpoint
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const liveResponse = await fetch(PROXYEndpointWithCacheBust(), {
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          Accept: 'application/json, text/plain, */*',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (liveResponse.ok) {
        const rawJson = await liveResponse.json()
        if (rawJson && rawJson.state && Array.isArray(rawJson.state.contestuser)) {
          const parsedTeams = parseCSAcademyRawState(rawJson)
          if (parsedTeams.length > 0) {
            return {
              status: 'connected' as ConnectionStatus,
              lastUpdated: now,
              lastUpdatedFormatted: formatTimestamp(now),
              sourceName: 'CS Academy Live Scoring Engine',
              totalRegistered: rawJson.state.contestuser.length,
              teams: parsedTeams,
              error: null,
            }
          }
        }
      }
    } catch {
      // Live fetch failed or timed out, seamlessly proceed to verified snapshot
    }

    // 2. Attempt to fetch verified pre-cached snapshot (/data/scoreboard.json)
    try {
      const snapshotResponse = await fetch(`${SNAPSHOT_ENDPOINT}?_t=${Date.now()}`, {
        cache: 'no-store',
      })

      if (snapshotResponse.ok) {
        const snapshotData: ScoreboardPayload = await snapshotResponse.json()
        if (snapshotData && Array.isArray(snapshotData.teams) && snapshotData.teams.length > 0) {
          const snapTime = snapshotData.lastUpdated ? new Date(snapshotData.lastUpdated) : now
          return {
            status: 'cached' as ConnectionStatus,
            lastUpdated: snapTime,
            lastUpdatedFormatted: formatTimestamp(snapTime),
            sourceName: snapshotData.source || 'CS Academy Verified Standings Snapshot',
            totalRegistered: snapshotData.numRegistered || 8683,
            teams: snapshotData.teams,
            error: null,
          }
        }
      }
    } catch {
      // Snapshot fetch failed, fallback to demo dataset
    }

    // 3. Fallback to demo dataset
    return {
      status: 'demo_mode' as ConnectionStatus,
      lastUpdated: now,
      lastUpdatedFormatted: formatTimestamp(now),
      sourceName: 'Simulated Preview Feed',
      totalRegistered: demoLeaderboardTeams.length,
      teams: demoLeaderboardTeams,
      error: 'Scoreboard streaming in demo mode.',
    }
  })().finally(() => {
    isFetching = false
  })

  return lastFetchPromise
}

function PROXYEndpointWithCacheBust(): string {
  const sep = PROXY_ENDPOINT.includes('?') ? '&' : '?'
  return `${PROXY_ENDPOINT}${sep}_t=${Date.now()}`
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Never'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} mins ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hr ago'
  return `${hours} hrs ago`
}

/**
 * Filters and re-ranks teams for the selected category
 */
export function getScopedLeaderboard(
  teams: LeaderboardTeam[],
  category: LeaderboardCategory,
  searchQuery = ''
): (LeaderboardTeam & { displayRank: number })[] {
  let list: LeaderboardTeam[] = []

  if (category === 'island') {
    list = teams.filter((t) => t.isSriLanka)
  } else if (category === 'university') {
    list = teams.filter((t) => t.isRajarata)
  } else {
    list = [...teams]
  }

  // Sort by score DESC, penalty ASC
  list.sort((a, b) => {
    const diff = b.score - a.score
    if (Math.abs(diff) > 1e-4) return diff
    return a.penalty - b.penalty
  })

  // Assign relative display rank
  const ranked = list.map((team, idx) => ({
    ...team,
    displayRank: idx + 1,
  }))

  const q = searchQuery.trim().toLowerCase()
  if (!q) return ranked

  return ranked.filter(
    (t) =>
      t.teamName.toLowerCase().includes(q) ||
      t.university.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q)
  )
}
