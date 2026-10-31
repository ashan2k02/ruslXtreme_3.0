export type LeaderboardCategory = 'world' | 'island' | 'university'

export type ConnectionStatus = 'connected' | 'updating' | 'cached' | 'demo_mode'

export interface SolvedProblem {
  id: string
  name: string
  points: number
  score?: number
  time: string
  attempts: number
}

export interface LeaderboardTeam {
  teamId: string
  teamName: string
  score: number
  penalty: number // in minutes
  solved: number
  partiallySolved?: number
  country: string
  countryCode: string
  university: string
  isSriLanka: boolean
  isRajarata: boolean
  worldRank: number
  islandRank?: number
  universityRank?: number
  solvedProblems: SolvedProblem[]
  displayRank?: number
}

export interface ScoreboardState {
  status: ConnectionStatus
  lastUpdated: Date | null
  lastUpdatedFormatted: string
  sourceName: string
  totalRegistered?: number
  teams: LeaderboardTeam[]
  error?: string | null
}

export interface ScoreboardPayload {
  contestId: number | string
  contestName: string
  lastUpdated: string
  numRegistered?: number
  isLive: boolean
  isRealData: boolean
  source: string
  teams: LeaderboardTeam[]
}
