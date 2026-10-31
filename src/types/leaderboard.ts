export type LeaderboardCategory = 'world' | 'island' | 'university'

export type ConnectionStatus = 'connected' | 'syncing' | 'cached' | 'error' | 'demo_mode'

export interface SolvedProblem {
  id: string
  name: string
  points?: number
  score?: number
  time?: string
  attempts?: number
}

export interface LeaderboardTeam {
  teamId: string
  teamName: string
  country: string
  countryCode: string
  university: string
  isSriLanka: boolean
  isRajarata: boolean
  worldRank: number | null
  islandRank: number | null
  universityRank: number | null
  displayRank?: number | null
  // Optional legacy fields for backward compatibility
  score?: number
  penalty?: number
  solved?: number
  partiallySolved?: number
  solvedProblems?: SolvedProblem[]
}

export interface ScoreboardState {
  status: ConnectionStatus
  lastUpdated: Date | null
  lastUpdatedFormatted: string
  sourceName: string
  authenticated?: boolean
  totalRegistered?: number
  numOfficialTeams?: number
  numSriLankaTeams?: number
  numRajarataTeams?: number
  teams: LeaderboardTeam[]
  error?: string | null
}

export interface ScoreboardPayload {
  contestId: number | string
  contestName: string
  lastUpdated: string
  numRegistered?: number
  numOfficialTeams?: number
  numSriLankaTeams?: number
  numRajarataTeams?: number
  isLive: boolean
  isRealData: boolean
  authenticated?: boolean
  source: string
  teams: LeaderboardTeam[]
}
