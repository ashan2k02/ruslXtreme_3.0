import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/csacademy': {
        target: 'https://csacademy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/csacademy/, ''),
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'Origin': 'https://csacademy.com',
          'Referer': 'https://csacademy.com/ieeextreme20/scoreboard/',
        },
      },
    },
  },
})
