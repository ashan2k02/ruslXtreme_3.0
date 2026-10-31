import type {
  LeaderboardCategory,
  LeaderboardTeam,
  ConnectionStatus,
  ScoreboardState,
  ScoreboardPayload,
  SolvedProblem,
} from '../types/leaderboard'
import { demoLeaderboardTeams } from '../data/leaderboard'

const CONTEST_ID = 133706
const PROXY_ENDPOINT = `/api/csacademy/contest/scoreboard_state/?contestId=${CONTEST_ID}`
const SNAPSHOT_ENDPOINT = `/data/scoreboard.json`

let isFetching = false
let lastFetchPromise: Promise<ScoreboardState> | null = null

/**
 * Normalizes and verifies whether a university string belongs to Rajarata University of Sri Lanka.
 * Handles whitespace discrepancies, capitalization variations, and common abbreviations.
 */
export function isRajarataUniversity(uni?: string | null): boolean {
  if (!uni || typeof uni !== 'string') return false
  const clean = uni.trim().toLowerCase().replace(/\s+/g, ' ')
  return clean === 'rajarata university of sri lanka' || clean === 'rajarata university'
}

function formatMinutesToTime(minutes: number): string {
  if (minutes == null || isNaN(minutes) || minutes < 0) return '00:00'
  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Parses raw CS Academy scoreboard state:
 * 1. Computes original official World Rank across all participating teams worldwide.
 * 2. Computes original official Island Rank across all Sri Lankan teams.
 * 3. STRICT FILTER: Keeps ONLY teams belonging to Rajarata University of Sri Lanka.
 * 4. Calculates University Rank strictly within Rajarata teams.
 */
export function parseCSAcademyRawState(raw: any): LeaderboardTeam[] {
  if (!raw || !raw.state || !Array.isArray(raw.state.contestuser)) {
    return []
  }

  const contestUsers = raw.state.contestuser
  const publicUsers = Array.isArray(raw.state.publicuser) ? raw.state.publicuser : []
  const contestInfo = raw.state.contest && typeof raw.state.contest === 'object' ? raw.state.contest : {}
  const startTime = typeof contestInfo.startTime === 'number' ? contestInfo.startTime : 1793404800.0

  const publicUserMap = new Map<number, any>()
  for (const pu of publicUsers) {
    if (pu && pu.id != null) {
      publicUserMap.set(pu.id, pu)
    }
  }

  const allOfficialTeams: LeaderboardTeam[] = []

  for (const cu of contestUsers) {
    const teamType = cu.ieeeTeamType ?? 1
    if (teamType !== 1 && teamType !== 2) {
      continue
    }

    const pu = publicUserMap.get(cu.userId) || {}
    const teamName = pu.name || pu.username || `Team ${cu.userId}`
    const countryId = pu.countryId != null ? Number(pu.countryId) : null
    const university = (cu.university || '').trim()
    const isSriLanka = countryId === 211 || (pu.country && String(pu.country).toLowerCase() === 'sri lanka')
    const isRajarata = isRajarataUniversity(university)

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

        let relMinutes = 0
        if (scoreTimeSec > 0 && startTime > 0 && scoreTimeSec >= startTime) {
          relMinutes = (scoreTimeSec - startTime) / 60
        } else if (scoreTimeSec > 0 && scoreTimeSec < 2000) {
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

    allOfficialTeams.push({
      teamId: `csa-${cu.id || cu.userId}`,
      teamName,
      score: totalScore,
      penalty,
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

  // CS Academy official sort comparator across the complete dataset
  allOfficialTeams.sort((a, b) => {
    const diff = b.score - a.score
    if (Math.abs(diff) > 1e-4) return diff
    return a.penalty - b.penalty
  })

  // Assign official global World Rank and national Island Rank
  let slRankCounter = 1
  allOfficialTeams.forEach((team, index) => {
    team.worldRank = index + 1
    if (team.isSriLanka) {
      team.islandRank = slRankCounter++
    }
  })

  // CRITICAL REQUIREMENT: Strictly filter to include ONLY Rajarata University teams
  const ruslTeams = allOfficialTeams.filter((team) => team.isRajarata)

  // Calculate University Rank (1 to N) strictly among Rajarata University teams
  ruslTeams.forEach((team, index) => {
    team.universityRank = index + 1
  })

  return ruslTeams
}

/**
 * Fetch the latest scoreboard data following the reliable fallback hierarchy:
 * 1. Live CS Academy proxy endpoint
 * 2. Static verified scoreboard snapshot (/data/scoreboard.json)
 * 3. In-memory demo data
 *
 * Enforces that only Rajarata University teams are ever accepted into state.
 */
export async function fetchScoreboardData(force = false): Promise<ScoreboardState> {
  if (isFetching && lastFetchPromise && !force) {
    return lastFetchPromise
  }

  isFetching = true
  lastFetchPromise = (async () => {
    const now = new Date()

    // 1. Attempt to fetch live from CS Academy via dev server proxy
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
          const parsedRuslTeams = parseCSAcademyRawState(rawJson)
          if (parsedRuslTeams.length > 0) {
            return {
              status: 'connected' as ConnectionStatus,
              lastUpdated: now,
              lastUpdatedFormatted: formatTimestamp(now),
              sourceName: 'CS Academy Live Scoring Engine',
              totalRegistered: parsedRuslTeams.length,
              teams: parsedRuslTeams,
              error: null,
            }
          }
        }
      }
    } catch {
      // Live fetch failed or timed out, proceed to verified snapshot
    }

    // 2. Attempt to fetch verified pre-cached snapshot (/data/scoreboard.json)
    try {
      const snapshotResponse = await fetch(`${SNAPSHOT_ENDPOINT}?_t=${Date.now()}`, {
        cache: 'no-store',
      })

      if (snapshotResponse.ok) {
        const snapshotData: ScoreboardPayload = await snapshotResponse.json()
        if (snapshotData && Array.isArray(snapshotData.teams) && snapshotData.teams.length > 0) {
          // Strict validation: enforce that every team is a Rajarata University team
          const strictlyRuslTeams = snapshotData.teams.filter(
            (t) => isRajarataUniversity(t.university) || t.isRajarata
          )

          // Ensure university name is uniformly formatted
          strictlyRuslTeams.forEach((t, idx) => {
            t.university = 'Rajarata University of Sri Lanka'
            t.country = 'Sri Lanka'
            t.countryCode = 'LK'
            t.isSriLanka = true
            t.isRajarata = true
            if (!t.universityRank) {
              t.universityRank = idx + 1
            }
          })

          const snapTime = snapshotData.lastUpdated ? new Date(snapshotData.lastUpdated) : now
          return {
            status: 'cached' as ConnectionStatus,
            lastUpdated: snapTime,
            lastUpdatedFormatted: formatTimestamp(snapTime),
            sourceName: 'CS Academy Verified Standings Snapshot',
            totalRegistered: strictlyRuslTeams.length,
            teams: strictlyRuslTeams,
            error: null,
          }
        }
      }
    } catch {
      // Snapshot fetch failed, fallback to demo dataset
    }

    // 3. Fallback to demo dataset (strictly Rajarata teams only)
    const strictlyDemoRusl = demoLeaderboardTeams.filter((t) => isRajarataUniversity(t.university) || t.isRajarata)
    return {
      status: 'demo_mode' as ConnectionStatus,
      lastUpdated: now,
      lastUpdatedFormatted: formatTimestamp(now),
      sourceName: 'Simulated Preview Feed',
      totalRegistered: strictlyDemoRusl.length,
      teams: strictlyDemoRusl,
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
 * Returns strictly Rajarata University teams ranked for the selected category:
 * - 'world': Preserves original official global rank.
 * - 'island': Preserves original official Sri Lankan rank.
 * - 'university': Shows internal position among Rajarata University teams only.
 */
export function getScopedLeaderboard(
  teams: LeaderboardTeam[],
  category: LeaderboardCategory,
  searchQuery = ''
): (LeaderboardTeam & { displayRank: number })[] {
  // STRICT FILTER: Guarantee zero teams from other universities
  const ruslTeams = teams.filter((t) => isRajarataUniversity(t.university) || t.isRajarata)

  // Map each team with the appropriate display rank for the selected category
  const mapped = ruslTeams.map((team) => {
    let displayRank = team.universityRank ?? 1
    if (category === 'world') {
      displayRank = team.worldRank
    } else if (category === 'island') {
      displayRank = team.islandRank ?? team.worldRank
    } else {
      displayRank = team.universityRank ?? 1
    }

    return {
      ...team,
      displayRank,
    }
  })

  // Sort according to category rank:
  // - World tab: sorted by worldRank ASC (preserves global standing order)
  // - Island tab: sorted by islandRank ASC (preserves island standing order)
  // - University tab: sorted by universityRank ASC (preserves university standing order)
  mapped.sort((a, b) => {
    if (category === 'world') {
      return a.worldRank - b.worldRank
    }
    if (category === 'island') {
      return (a.islandRank ?? a.worldRank) - (b.islandRank ?? b.worldRank)
    }
    return (a.universityRank ?? 1) - (b.universityRank ?? 1)
  })

  const q = searchQuery.trim().toLowerCase()
  if (!q) return mapped

  return mapped.filter(
    (t) =>
      t.teamName.toLowerCase().includes(q) ||
      t.university.toLowerCase().includes(q)
  )
}
