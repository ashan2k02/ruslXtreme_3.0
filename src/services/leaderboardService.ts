import type {
  LeaderboardCategory,
  LeaderboardTeam,
  ConnectionStatus,
  ScoreboardState,
  ScoreboardPayload,
} from '../types/leaderboard'
import { demoLeaderboardTeams } from '../data/leaderboard'

const CENTRAL_ENDPOINT = `/api/leaderboard`
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
  return (
    clean === 'rajarata university of sri lanka' ||
    clean === 'rajarata university' ||
    clean.includes('rajarata university of sri lanka') ||
    clean.includes('rajarata university')
  )
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Never'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} mins ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hr ago'
  return `${hours} hrs ago`
}

/**
 * Fetch the latest scoreboard data following the reliable fallback hierarchy:
 * 1. Centralized server-side sync service (/api/leaderboard)
 * 2. Static verified scoreboard snapshot (/data/scoreboard.json)
 * 3. In-memory demo dataset
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

    // 1. Attempt to fetch from centralized server-side sync service
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      let res: Response
      if (force) {
        // Trigger manual upstream refresh
        res = await fetch(`${CENTRAL_ENDPOINT}/sync`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
      } else {
        // Fetch cached shared state
        res = await fetch(`${CENTRAL_ENDPOINT}?_t=${Date.now()}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
      }

      clearTimeout(timeoutId)

      if (res.ok) {
        const payload = await res.json()
        if (payload && Array.isArray(payload.teams)) {
          // Strictly validate teams
          const ruslTeams = payload.teams.filter(
            (t: any) => isRajarataUniversity(t.university) || t.isRajarata
          )

          ruslTeams.forEach((t: any, idx: number) => {
            t.university = 'Rajarata University of Sri Lanka'
            t.isRajarata = true
            t.isSriLanka = true
            t.country = 'Sri Lanka'
            t.countryCode = 'LK'
            if (!t.universityRank) {
              t.universityRank = idx + 1
            }
          })

          const updateDate = payload.lastUpdated ? new Date(payload.lastUpdated) : now
          const status: ConnectionStatus = payload.status || 'connected'

          return {
            status,
            lastUpdated: updateDate,
            lastUpdatedFormatted: formatTimestamp(updateDate),
            sourceName: payload.sourceName || (payload.authenticated ? 'CS Academy Authenticated Engine' : 'CS Academy Live Engine'),
            authenticated: payload.authenticated ?? false,
            totalRegistered: payload.numRegistered || ruslTeams.length,
            numRajarataTeams: ruslTeams.length,
            teams: ruslTeams,
            error: payload.error || null,
          }
        }
      }
    } catch {
      // Server-side endpoint unavailable or network error, proceed to snapshot fallback
    }

    // 2. Attempt to fetch verified pre-cached snapshot (/data/scoreboard.json)
    try {
      const snapshotResponse = await fetch(`${SNAPSHOT_ENDPOINT}?_t=${Date.now()}`, {
        cache: 'no-store',
      })

      if (snapshotResponse.ok) {
        const snapshotData: ScoreboardPayload = await snapshotResponse.json()
        if (snapshotData && Array.isArray(snapshotData.teams) && snapshotData.teams.length > 0) {
          const strictlyRuslTeams = snapshotData.teams.filter(
            (t) => isRajarataUniversity(t.university) || t.isRajarata
          )

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
            authenticated: Boolean(snapshotData.authenticated),
            totalRegistered: snapshotData.numRegistered || strictlyRuslTeams.length,
            numRajarataTeams: strictlyRuslTeams.length,
            teams: strictlyRuslTeams,
            error: null,
          }
        }
      }
    } catch {
      // Snapshot fetch failed, fallback to demo mode
    }

    // 3. Fallback to demo dataset (strictly Rajarata teams only)
    const strictlyDemoRusl = demoLeaderboardTeams.filter((t) => isRajarataUniversity(t.university) || t.isRajarata)
    return {
      status: 'demo_mode' as ConnectionStatus,
      lastUpdated: now,
      lastUpdatedFormatted: formatTimestamp(now),
      sourceName: 'Simulated Preview Feed',
      authenticated: false,
      totalRegistered: strictlyDemoRusl.length,
      numRajarataTeams: strictlyDemoRusl.length,
      teams: strictlyDemoRusl,
      error: 'Scoreboard streaming in demo mode.',
    }
  })().finally(() => {
    isFetching = false
  })

  return lastFetchPromise
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
