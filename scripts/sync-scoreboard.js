import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/scoreboard.json')

const CONTEST_ID = 133706
const URL = `https://csacademy.com/contest/scoreboard_state/?contestId=${CONTEST_ID}`

const COUNTRIES = {
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

  const teams = []

  for (const cu of contestUsers) {
    const teamType = cu.ieeeTeamType ?? 1
    if (teamType !== 1 && teamType !== 2) continue

    const pu = puMap.get(cu.userId) || {}
    const teamName = pu.name || pu.username || `Team ${cu.userId}`
    const countryId = pu.countryId != null ? Number(pu.countryId) : null
    const countryMeta = countryId != null ? COUNTRIES[countryId] : null
    const country = countryMeta ? countryMeta.name : 'International'
    const countryCode = countryMeta ? countryMeta.code : 'GL'

    const university = (cu.university || '').trim()
    const isSriLanka = countryId === 211 || country.toLowerCase() === 'sri lanka'
    const isRajarata = university.toLowerCase() === 'rajarata university of sri lanka'

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

    teams.push({
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
      worldRank: 0,
      solvedProblems,
    })
  }

  // Official Sort: score DESC, then penalty ASC
  teams.sort((a, b) => {
    const diff = b.score - a.score
    if (Math.abs(diff) > 1e-4) return diff
    return a.penalty - b.penalty
  })

  // Assign World, Island, and University ranks
  let slRank = 1
  let ruslRank = 1

  teams.forEach((team, index) => {
    team.worldRank = index + 1
    if (team.isSriLanka) {
      team.islandRank = slRank++
    }
    if (team.isRajarata) {
      team.universityRank = ruslRank++
    }
  })

  // Filter snapshot: Top 100 World, Top 100 Sri Lanka, and ALL Rajarata teams
  const selectedMap = new Map()

  teams.slice(0, 100).forEach(t => selectedMap.set(t.teamId, t))
  teams.filter(t => t.isSriLanka).slice(0, 100).forEach(t => selectedMap.set(t.teamId, t))
  teams.filter(t => t.isRajarata).forEach(t => selectedMap.set(t.teamId, t))

  const snapshotTeams = Array.from(selectedMap.values())
  // Keep original sorted order
  snapshotTeams.sort((a, b) => a.worldRank - b.worldRank)

  const payload = {
    contestId: CONTEST_ID,
    contestName: 'IEEEXtreme 20.0',
    lastUpdated: new Date().toISOString(),
    numRegistered: contestUsers.length,
    isLive: true,
    isRealData: true,
    source: 'https://csacademy.com/ieeextreme20/scoreboard/',
    teams: snapshotTeams,
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8')

  const ruslTeams = snapshotTeams.filter(t => t.isRajarata)
  const slTeams = snapshotTeams.filter(t => t.isSriLanka)

  console.log(`\nSuccessfully updated snapshot at: ${OUTPUT_FILE}`)
  console.log(`- Total Snapshot Teams: ${snapshotTeams.length}`)
  console.log(`- Sri Lanka Teams: ${slTeams.length}`)
  console.log(`- Rajarata University Teams: ${ruslTeams.length}`)
  if (ruslTeams.length > 0) {
    console.log(`- #1 Rajarata Team: ${ruslTeams[0].teamName} (Score: ${ruslTeams[0].score}, World #${ruslTeams[0].worldRank}, Island #${ruslTeams[0].islandRank})`)
  }
}

syncScoreboard().catch((err) => {
  console.error('Failed to sync scoreboard:', err)
  process.exit(1)
})
