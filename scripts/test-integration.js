import { ScoreboardSyncEngine, isRajarataUniversity } from './sync-engine.js'

async function runTestSuite() {
  console.log('=================================================================')
  console.log('  RUSLXTREME 3.0 — Official Rankings Integration Tests           ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`)
      if (details) console.log(`       ${details}`)
      passed++
    } else {
      console.error(`[FAIL] ${testName}`)
      if (details) console.error(`       ${details}`)
      failed++
    }
  }

  // 1. Test Rajarata-only filtering
  console.log('--- TEST 1: Rajarata-Only University Filtering ---')
  assert(isRajarataUniversity('Rajarata University of Sri Lanka'), 'Exact canonical name matches')
  assert(isRajarataUniversity('rajarata university of sri lanka'), 'Lowercase matches')
  assert(isRajarataUniversity('  Rajarata   University   of   Sri   Lanka  '), 'Padded whitespace matches')
  assert(isRajarataUniversity('Rajarata University'), 'Short form matches')
  assert(!isRajarataUniversity('University of Moratuwa'), 'Rejects University of Moratuwa')
  assert(!isRajarataUniversity('University of Colombo'), 'Rejects University of Colombo')
  assert(!isRajarataUniversity('Sabaragamuwa University of Sri Lanka'), 'Rejects Sabaragamuwa University')
  assert(!isRajarataUniversity(''), 'Rejects empty string')
  assert(!isRajarataUniversity(null), 'Rejects null')
  assert(!isRajarataUniversity(undefined), 'Rejects undefined')

  // 2. Test Live Fetch & Ranking Accuracy
  console.log('\n--- TEST 2: Upstream Live Synchronization & Official Rankings ---')
  const engine = new ScoreboardSyncEngine()
  const liveState = await engine.syncNow()

  assert(liveState.status === 'connected', 'Sync status is connected')
  assert(Array.isArray(liveState.teams), 'Teams array is present')
  assert(liveState.teams.length === 21, `Synchronized exactly 21 Rajarata University teams (found: ${liveState.teams.length})`)

  const nonRusl = liveState.teams.filter((t) => !isRajarataUniversity(t.university))
  assert(nonRusl.length === 0, 'Zero teams from other universities present in output')

  // 3. Verify Three Official Rankings for all 21 Teams
  console.log('\n--- TEST 3: Three Official Rankings Verification ---')
  let allRanksValid = true
  let uniRankSequential = true

  liveState.teams.forEach((t, i) => {
    if (typeof t.worldRank !== 'number' || t.worldRank <= 0) allRanksValid = false
    if (typeof t.islandRank !== 'number' || t.islandRank <= 0) allRanksValid = false
    if (t.universityRank !== i + 1) uniRankSequential = false
  })

  assert(allRanksValid, 'All 21 teams possess valid positive World Rank and Sri Lanka Rank')
  assert(uniRankSequential, 'University Rank is strictly 1..21 according to official competition order')

  const topTeam = liveState.teams[0]
  assert(topTeam.universityRank === 1, `Rank 1 team is assigned University Rank #1 (${topTeam.teamName})`)
  assert(typeof topTeam.worldRank === 'number' && topTeam.worldRank > 0, `Top team has preserved official World Rank (#${topTeam.worldRank})`)
  assert(typeof topTeam.islandRank === 'number' && topTeam.islandRank > 0, `Top team has preserved official Sri Lanka Rank (#${topTeam.islandRank})`)

  // Verify that score, penalty, and solved problem information is removed
  console.log('\n--- TEST 4: Score Removal & Clean Output Verification ---')
  let noScoresExposed = true
  liveState.teams.forEach((t) => {
    if (t.score !== undefined || t.penalty !== undefined || t.solvedProblems !== undefined) {
      noScoresExposed = false
    }
  })
  assert(noScoresExposed, 'Zero score, penalty, or solved problem stats present in public team payload')

  // 5. Test Concurrency & Mutex
  console.log('\n--- TEST 5: Concurrency & Overlap Prevention ---')
  const p1 = engine.syncNow()
  const p2 = engine.syncNow()
  const [res1, res2] = await Promise.all([p1, p2])
  assert(res1 === res2, 'Overlapping sync requests share mutex and return identical cached state')

  // 6. Test Cache Behavior on Network Failure
  console.log('\n--- TEST 6: Cache Behavior on Failure & Fallback ---')
  const originalFetch = engine.fetchScoreboardData.bind(engine)

  engine.fetchScoreboardData = async () => {
    throw new Error('Simulated upstream network disconnect')
  }

  const fallbackState = await engine.syncNow()
  assert(
    fallbackState.teams.length === liveState.teams.length,
    'Preserved last successful response teams on network failure'
  )
  assert(fallbackState.status === 'cached', 'Status downgraded to cached on failure')
  assert(engine.consecutiveFailures === 1, 'Failure count incremented for backoff')

  engine.fetchScoreboardData = originalFetch
  const recoveredState = await engine.syncNow()
  assert(recoveredState.status === 'connected', 'Recovered to connected status upon network return')
  assert(engine.consecutiveFailures === 0, 'Consecutive failure count reset to 0')

  // Summary
  console.log('\n=================================================================')
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`)
  console.log('=================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err)
  process.exit(1)
})
