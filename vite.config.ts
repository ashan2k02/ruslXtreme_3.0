import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore - JavaScript sync engine
import { getSharedSyncEngine } from './scripts/sync-engine.js'

function scoreboardSyncPlugin(): Plugin {
  return {
    name: 'scoreboard-sync-plugin',
    configureServer(server) {
      const engine = getSharedSyncEngine()
      engine.start()

      server.middlewares.use('/api/leaderboard', async (req: any, res: any, next: any) => {
        const url: string = req.url || '/'

        // Shared cached scoreboard feed for all visitors
        if (url === '' || url === '/' || url.startsWith('/?') || url.startsWith('?')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.statusCode = 200
          res.end(JSON.stringify(engine.getLatestState()))
          return
        }

        // Engine health & status telemetry
        if (url === '/status' || url.startsWith('/status?')) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(
            JSON.stringify({
              status: engine.cachedState.status,
              authenticated: engine.isAuthenticated,
              syncCount: engine.syncCount,
              lastSyncTime: engine.lastSyncTime,
              upstreamIntervalMs: engine.upstreamIntervalMs,
              frontendIntervalMs: engine.frontendIntervalMs,
              consecutiveFailures: engine.consecutiveFailures,
              lastError: engine.lastError,
              numRajarataTeams: engine.cachedState.numRajarataTeams,
            })
          )
          return
        }

        // Force manual synchronization trigger
        if ((url === '/sync' || url.startsWith('/sync?')) && req.method === 'POST') {
          const fresh = await engine.syncNow()
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(fresh))
          return
        }

        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), scoreboardSyncPlugin()],
  server: {
    proxy: {
      '/api/csacademy': {
        target: 'https://csacademy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/csacademy/, ''),
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          Origin: 'https://csacademy.com',
          Referer: 'https://csacademy.com/ieeextreme20/scoreboard/',
        },
      },
    },
  },
})
