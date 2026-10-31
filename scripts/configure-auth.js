import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_FILE = path.resolve(__dirname, '../.env.local')
const GITIGNORE_FILE = path.resolve(__dirname, '../.gitignore')

function prompt(query, isHidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    if (isHidden) {
      process.stdin.on('data', (char) => {
        char = char + ''
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            break
          default:
            process.stdout.write('\x1B[2K\x1B[200D' + query + Array(rl.line.length + 1).join('*'))
            break
        }
      })
    }

    rl.question(query, (value) => {
      resolve(value.trim())
      rl.close()
    })
  })
}

export async function verifyActiveSession(sessionId, csrfToken) {
  const res = await fetch('https://csacademy.com/accounts/get_user_notifications/', {
    headers: {
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': csrfToken || '',
      Cookie: `sessionid=${sessionId}; csrftoken=${csrfToken || ''}`,
      'User-Agent': 'Mozilla/5.0 (RUSLXTREME Authenticator)',
      Referer: 'https://csacademy.com/',
    },
  })

  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` }
  }

  const data = await res.json()
  if (data.error && data.error.code === 1004) {
    return { ok: false, error: 'Session cookie rejected: not authenticated or expired' }
  }

  return { ok: true, data }
}

export async function loginWithCredentials(email, password) {
  // 1. Initial handshake to obtain CSRF token
  const initialRes = await fetch('https://csacademy.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (RUSLXTREME Authenticator)',
    },
  })

  let csrf = ''
  const setCookies = initialRes.headers.getSetCookie
    ? initialRes.headers.getSetCookie()
    : [initialRes.headers.get('set-cookie')].filter(Boolean)

  for (const c of setCookies) {
    if (c.includes('csrftoken=')) {
      csrf = c.split('csrftoken=')[1].split(';')[0]
    }
  }

  if (!csrf) {
    throw new Error('Failed to obtain initial CSRF token from CS Academy.')
  }

  // 2. Execute login
  const loginRes = await fetch('https://csacademy.com/accounts/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': csrf,
      Cookie: `csrftoken=${csrf}`,
      'User-Agent': 'Mozilla/5.0 (RUSLXTREME Authenticator)',
      Referer: 'https://csacademy.com/',
    },
    body: JSON.stringify({
      email,
      password,
      remember: true,
    }),
  })

  const loginData = await loginRes.json()
  if (loginData.error) {
    throw new Error(`CS Academy Login Failed: ${loginData.error.message || JSON.stringify(loginData.error)}`)
  }

  const loginCookies = loginRes.headers.getSetCookie
    ? loginRes.headers.getSetCookie()
    : [loginRes.headers.get('set-cookie')].filter(Boolean)

  let sessionId = ''
  let updatedCsrf = csrf

  for (const c of loginCookies) {
    if (c.includes('sessionid=')) {
      sessionId = c.split('sessionid=')[1].split(';')[0]
    }
    if (c.includes('csrftoken=')) {
      updatedCsrf = c.split('csrftoken=')[1].split(';')[0]
    }
  }

  if (!sessionId) {
    throw new Error('Login response did not return a sessionid cookie.')
  }

  return { sessionId, csrfToken: updatedCsrf }
}

async function main() {
  console.log('================================================================')
  console.log('  RUSLXTREME 3.0 — Secure CS Academy Authentication Setup')
  console.log('================================================================')
  console.log('Choose your preferred authentication method:')
  console.log('  [1] Email and Password (direct automated login)')
  console.log('  [2] Active Browser Session Cookie (from your open Chrome tab)\n')

  const choice = await prompt('Enter choice (1 or 2, default: 1): ')
  let sessionId = ''
  let csrfToken = ''
  let email = ''
  let password = ''

  if (choice === '2') {
    console.log('\nTo get your session cookie from your browser:')
    console.log('1. Open your logged-in CS Academy tab (e.g. scoreboard).')
    console.log('2. Press F12 (or right-click -> Inspect) -> Application -> Cookies -> https://csacademy.com')
    console.log('3. Copy the value of "sessionid" and "csrftoken".\n')

    sessionId = await prompt('Enter "sessionid" cookie: ', true)
    console.log('\n')
    csrfToken = await prompt('Enter "csrftoken" cookie: ')

    if (!sessionId) {
      console.error('Error: sessionid cannot be empty.')
      process.exit(1)
    }

    console.log('\nVerifying session with CS Academy...')
    const verification = await verifyActiveSession(sessionId, csrfToken)
    if (!verification.ok) {
      console.error(`\n[FAIL] ${verification.error}`)
      process.exit(1)
    }
    console.log('[OK] Session verified active! Successfully authenticated as account owner.')
  } else {
    email = await prompt('Enter CS Academy Account Email / Username: ')
    if (!email) {
      console.error('Error: Email or username cannot be empty.')
      process.exit(1)
    }

    password = await prompt('Enter CS Academy Account Password: ', true)
    console.log('\n')
    if (!password) {
      console.error('Error: Password cannot be empty.')
      process.exit(1)
    }

    console.log('Authenticating directly with CS Academy...')
    try {
      const authResult = await loginWithCredentials(email, password)
      sessionId = authResult.sessionId
      csrfToken = authResult.csrfToken
      console.log('[OK] Authentication succeeded! Active session ID established.')
    } catch (err) {
      console.error(`\n[FAIL] ${err.message}`)
      console.log('\nTip: If you signed up via Google SSO or IEEE login, use Option 2 (Browser Session Cookie).')
      process.exit(1)
    }
  }

  // Ensure .gitignore has .env.local
  if (fs.existsSync(GITIGNORE_FILE)) {
    const gitignoreContent = fs.readFileSync(GITIGNORE_FILE, 'utf8')
    if (!gitignoreContent.includes('.env.local') && !gitignoreContent.includes('*.local')) {
      fs.appendFileSync(GITIGNORE_FILE, '\n.env.local\n', 'utf8')
    }
  }

  const envLines = [
    '# RUSLXTREME 3.0 — Server-side CS Academy Credentials',
    '# Generated by npm run configure-auth',
    '# This file is strictly excluded from Git and never exposed to the frontend',
  ]

  if (email) envLines.push(`CSACADEMY_EMAIL=${email}`)
  if (password) envLines.push(`CSACADEMY_PASSWORD=${password}`)
  if (sessionId) envLines.push(`CSACADEMY_SESSION_ID=${sessionId}`)
  if (csrfToken) envLines.push(`CSACADEMY_CSRF_TOKEN=${csrfToken}`)

  envLines.push('UPSTREAM_SYNC_INTERVAL_MS=10000')
  envLines.push('FRONTEND_POLL_INTERVAL_MS=5000')

  fs.writeFileSync(ENV_FILE, envLines.join('\n') + '\n', { mode: 0o600, encoding: 'utf8' })
  console.log(`\n[OK] Configuration securely saved to: ${ENV_FILE} (mode 0600)`)
  console.log('\nTesting live authenticated sync...')

  // Run initial test sync
  const { getSharedSyncEngine } = await import('./sync-engine.js')
  const engine = getSharedSyncEngine()
  engine.sessionId = sessionId
  engine.csrfToken = csrfToken
  engine.isAuthenticated = true
  const state = await engine.syncNow()

  console.log(`\n[SUCCESS] Scoreboard live sync active:`)
  console.log(`- Status: ${state.status.toUpperCase()}`)
  console.log(`- Authenticated: ${state.authenticated ? 'YES' : 'NO'}`)
  console.log(`- Rajarata University Teams Synced: ${state.numRajarataTeams}`)
  console.log('\nYou can now start the continuous live server:')
  console.log('  npm run dev')
}

main().catch((err) => {
  console.error('\nConfiguration error:', err.message)
  process.exit(1)
})
