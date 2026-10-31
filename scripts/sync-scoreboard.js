import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/scoreboard.json')

const CONTEST_ID = 133706
const URL = `https://csacademy.com/contest/scoreboard_state/?contestId=${CONTEST_ID}`

export function isRajarataUniversity(uni) {
  if (!uni || typeof uni !== 'string') return false
  const clean = uni.trim().toLowerCase().replace(/\s+/g, ' ')
  return clean === 'rajarata university of sri lanka' || clean === 'rajarata university'
}

function formatMinutes(minutes) {
  if (minutes == null || isNaN(minutes) || minutes < 0) return '00:00'
  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

async function syncScoreboard() {
  console.log(`Connecting to CS Academy IEEEXtreme scoreboard (Contest #${CONTEST_ID})...`)

  const res = await fetch(URL, {
    headers: {
      'x-requested-with': 'XMLHttpRequest',
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (RUSLXTREME Scoreboard Sync)',
    },
  })

  if (!res.ok) {
    throw new Error(`CS Academy returned HTTP ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()
  const state = data.state || {}
  const contestUsers = state.contestuser || []
  const publicUsers = state.publicuser || []
  const contest = state.contest || {}
  const startTime = contest.startTime || 1793404800.0

  console.log(`Fetched ${contestUsers.length} contest users and ${publicUsers.length} public profiles.`)

  const puMap = new Map()
  for (const pu of publicUsers) {
    if (pu && pu.id != null) {
      puMap.set(pu.id, pu)
    }
  }

  // 1. Process all official participants to determine global World Rank and national Island Rank
  const allOfficialTeams = []

  for (const cu of contestUsers) {
    const teamType = cu.ieeeTeamType ?? 1
    if (teamType !== 1 && teamType !== 2) continue

    const pu = puMap.get(cu.userId) || {}
    const teamName = pu.name || pu.username || `Team ${cu.userId}`
    const countryId = pu.countryId != null ? Number(pu.countryId) : null
    const university = (cu.university || '').trim()
    const isSriLanka = countryId === 211 || (pu.country && pu.country.toLowerCase() === 'sri lanka')
    const isRajarata = isRajarataUniversity(university)

    const solvedProblems = []
    let solvedCount = 0
    let partialCount = 0

    if (cu.scores && typeof cu.scores === 'object') {
      for (const [taskId, tScore] of Object.entries(cu.scores)) {
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
          time: formatMinutes(relMinutes),
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
      country: 'Sri Lanka',
      countryCode: 'LK',
      university: isRajarata ? 'Rajarata University of Sri Lanka' : university,
      isSriLanka,
      isRajarata,
      worldRank: 0,
      islandRank: undefined,
      universityRank: undefined,
      solvedProblems,
    })
  }

  // Official CS Academy sort: totalScore DESC, then penalty ASC
  allOfficialTeams.sort((a, b) => {
    const diff = b.score - a.score
    if (Math.abs(diff) > 1e-4) return diff
    return a.penalty - b.penalty
  })

  // Assign original official World Rank and Island Rank across all participants
  let slRankCounter = 1
  allOfficialTeams.forEach((team, index) => {
    team.worldRank = index + 1
    if (team.isSriLanka) {
      team.islandRank = slRankCounter++
    }
  })

  // 2. STRICT FILTER: Keep ONLY Rajarata University of Sri Lanka teams
  const ruslTeams = allOfficialTeams.filter((team) => team.isRajarata)

  // Assign internal University Rank (1 to N) among Rajarata University teams
  ruslTeams.forEach((team, index) => {
    team.universityRank = index + 1
  })

  const payload = {
    contestId: CONTEST_ID,
    contestName: 'IEEEXtreme 20.0 — Rajarata University Delegations',
    lastUpdated: new Date().toISOString(),
    numRegistered: contestUsers.length,
    numRajarataTeams: ruslTeams.length,
    isLive: true,
    isRealData: true,
    source: 'https://csacademy.com/ieeextreme20/scoreboard/',
    teams: ruslTeams,
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8')

  console.log(`\nSuccessfully updated snapshot at: ${OUTPUT_FILE}`)
  console.log(`- Strictly Rajarata University Teams ONLY: ${ruslTeams.length}`)
  ruslTeams.forEach((t) => {
    console.log(
      `  #${t.universityRank.toString().padStart(2, '0')} RUSL | World #${t.worldRank.toString().padStart(4, ' ')} | Island #${t.islandRank.toString().padStart(3, ' ')} | ${t.teamName} (${t.score} pts)`
    )
  })
}

syncScoreboard().catch((err) => {
  console.error('Failed to sync scoreboard:', err)
  process.exit(1)
})
