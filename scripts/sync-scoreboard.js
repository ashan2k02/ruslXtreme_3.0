import { getSharedSyncEngine } from './sync-engine.js'

async function run() {
  console.log('Running Scoreboard Synchronization Snapshot Generator...')
  const engine = getSharedSyncEngine()
  const result = await engine.syncNow()

  console.log('\n======================================================')
  console.log(`Synchronization Result: ${result.status.toUpperCase()}`)
  console.log(`Source: ${result.sourceName}`)
  console.log(`Authenticated: ${result.authenticated ? 'YES' : 'NO'}`)
  console.log(`Total Rajarata University Teams: ${result.numRajarataTeams}`)
  console.log('======================================================\n')

  result.teams.forEach((t) => {
    console.log(
      `  #${t.universityRank.toString().padStart(2, '0')} RUSL | World #${t.worldRank.toString().padStart(4, ' ')} | Island #${(t.islandRank || 0).toString().padStart(3, ' ')} | ${t.teamName.padEnd(16)} | ${t.score.toFixed(2)} pts | ${t.penalty}m penalty | Solved: ${t.solved}`
    )
  })
}

run().catch((err) => {
  console.error('Fatal sync failure:', err)
  process.exit(1)
})
