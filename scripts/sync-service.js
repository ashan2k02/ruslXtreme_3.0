import { getSharedSyncEngine } from './sync-engine.js'

console.log('================================================================')
console.log('  RUSLXTREME 3.0 — Continuous CS Academy Synchronizer Daemon')
console.log('================================================================')

const engine = getSharedSyncEngine()

console.log(`- Upstream CS Academy refresh: every ${engine.upstreamIntervalMs / 1000}s`)
console.log(`- Frontend visitor poll recommendation: every ${engine.frontendIntervalMs / 1000}s`)
console.log(`- Auth status: ${engine.isAuthenticated ? 'Authenticated session active' : 'Public stream (run npm run configure-auth to authenticate)'}`)

engine.start()

console.log('\n[RUNNING] Scoreboard background synchronizer is active. Press Ctrl+C to exit.\n')

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Stopping sync engine...')
  engine.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  engine.stop()
  process.exit(0)
})
