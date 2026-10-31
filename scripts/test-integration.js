import { ScoreboardSyncEngine, isRajarataUniversity, DEFAULT_TASK_WEIGHTS } from './sync-engine.js'

async function runTestSuite() {
  console.log('=================================================================')
  console.log('  RUSLXTREME 3.0 — Comprehensive Leaderboard Integration Tests   ')
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

  // 2. Test Score Calculation Accuracy
  console.log('\n--- TEST 2: Score Calculation & Target Match ---')
  const verifiedTargets = [
    { name: 'AlgoBlaze', expectedScore: 382.12, expectedPenalty: 493, scores: { '52351': 1, '52352': 1, '52354': 1, '52355': 1, '52436': 0.5055664506282052 } },
    { name: 'AthiMataHathi', expectedScore: 376.29, expectedPenalty: 563, scores: { '52351': 1, '52352': 1, '52354': 1, '52355': 1, '52436': 0.43918798989743585 } },
    { name: 'Algorynth', expectedScore: 298.82, expectedPenalty: 619, scores: { '52351': 1, '52354': 1, '52355': 1, '52436': 0.601344 } },
    { name: 'ByteBots', expectedScore: 293.56, expectedPenalty: 516, scores: { '52351': 1, '52354': 1, '52355': 1, '52436': 0.54145 } },
    { name: '404syndicate', expectedScore: 288.08, expectedPenalty: 400, scores: { '52351': 1, '52354': 1, '52355': 1, '52436': 0.47904822065384617 } },
    { name: 'TheVanguard', expectedScore: 287.42, expectedPenalty: 179, scores: { '52351': 1, '52354': 1, '52355': 1, '52436': 0.47155955164102564 } },
  ]

  for (const t of verifiedTargets) {
    let score = 0
    for (const [tid, frac] of Object.entries(t.scores)) {
      score += frac * (DEFAULT_TASK_WEIGHTS[tid] || 0)
    }
    const finalScore = Math.round(score * 100) / 100
    assert(
      finalScore === t.expectedScore,
      `Team ${t.name}: Score ${finalScore} matches expected ${t.expectedScore}`
    )
  }

  // 3. Test Centralized Sync Engine Live Fetch & Ranking
  console.log('\n--- TEST 3: Upstream Live Synchronization & Ranking ---')
  const engine = new ScoreboardSyncEngine()
  const liveState = await engine.syncNow()

  assert(liveState.status === 'connected', 'Sync status is connected')
  assert(Array.isArray(liveState.teams), 'Teams array is present')
  assert(liveState.teams.length > 0, `Synchronized ${liveState.teams.length} Rajarata University teams`)

  const nonRusl = liveState.teams.filter((t) => !isRajarataUniversity(t.university))
  assert(nonRusl.length === 0, 'Zero teams from other universities present in filtered output')

  // Verify World and Island ranks are preserved from full dataset
  const firstTeam = liveState.teams[0]
  assert(typeof firstTeam.worldRank === 'number' && firstTeam.worldRank > 0, `Preserved official World Rank (#${firstTeam.worldRank})`)
  assert(typeof firstTeam.islandRank === 'number' && firstTeam.islandRank > 0, `Preserved official Island Rank (#${firstTeam.islandRank})`)
  assert(firstTeam.universityRank === 1, 'Top Rajarata team assigned University Rank #1')

  // Verify monotonicity of University Rank
  let uniRankCorrect = true
  liveState.teams.forEach((t, i) => {
    if (t.universityRank !== i + 1) uniRankCorrect = false
  })
  assert(uniRankCorrect, 'University Rank is strictly sequential 1..N')

  // 4. Test Concurrency & Overlap Prevention
  console.log('\n--- TEST 4: Concurrency & Overlap Prevention ---')
  const p1 = engine.syncNow()
  const p2 = engine.syncNow()
  const [res1, res2] = await Promise.all([p1, p2])
  assert(res1 === res2, 'Overlapping sync requests share mutex and return identical cached state')

  // 5. Test Cache Preservation on Error
  console.log('\n--- TEST 5: Cache Behavior on Failure & Fallback ---')
  const prevSyncCount = engine.syncCount
  const originalFetch = engine.fetchScoreboardData.bind(engine)

  // Simulate upstream network failure
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

  // Restore original fetch
  engine.fetchScoreboardData = originalFetch
  const recoveredState = await engine.syncNow()
  assert(recoveredState.status === 'connected', 'Recovered to connected status upon network return')
  assert(engine.consecutiveFailures === 0, 'Consecutive failure count reset to 0')

  // 6. Test Authentication & Expiration Handling
  console.log('\n--- TEST 6: Authentication & Session Expiration Simulation ---')
  engine.sessionId = 'dummy-expired-session'
  engine.isAuthenticated = true
  assert(engine.getCookieHeader().includes('sessionid='), 'Authenticated cookie header properly constructed')

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
