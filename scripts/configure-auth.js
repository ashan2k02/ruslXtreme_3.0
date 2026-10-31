import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_FILE = path.resolve(__dirname, '../.env.local')
const GITIGNORE_FILE = path.resolve(__dirname, '../.gitignore')

/**
 * Robust terminal reader using standard async iterator.
 * Eliminates duplicate prompts, lingering listeners, and terminal redraw bugs.
 */
class TerminalPrompt {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: Boolean(process.stdin.isTTY),
    })
    this.iterator = this.rl[Symbol.asyncIterator]()
  }

  async ask(query) {
    process.stdout.write(query)
    const { value, done } = await this.iterator.next()
    if (done) return ''
    return (value || '').trim()
  }

  close() {
    this.rl.close()
  }
}

/**
 * Sanitize cookie values in case user copied the name or quotes from DevTools
 */
export function sanitizeCookieValue(input, cookieNames = []) {
  if (!input || typeof input !== 'string') return ''
  let val = input.trim()

  for (const name of cookieNames) {
    const prefix = `${name}=`
    if (val.toLowerCase().startsWith(prefix.toLowerCase())) {
      val = val.slice(prefix.length).trim()
      break
    }
  }

  val = val.replace(/;+$/, '').trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1).trim()
  }
  return val
}

/**
 * Build the exact Cookie header required by CS Academy.
 * Formats: sessionid=<sessionid>; crossSessionId=<sessionid>; csrftoken=<csrftoken>
 */
export function buildCookieHeader(sessionId, csrfToken) {
  const parts = []
  if (sessionId) {
    parts.push(`sessionid=${sessionId}`)
    parts.push(`crossSessionId=${sessionId}`)
  }
  if (csrfToken) {
    parts.push(`csrftoken=${csrfToken}`)
  }
  return parts.join('; ')
}

/**
 * Official user-session verification endpoint on CS Academy
 */
export async function verifyActiveSession(sessionId, csrfToken) {
  if (!sessionId || !csrfToken) {
    return { ok: false, error: 'Both session ID and CSRF token are required.' }
  }

  try {
    const res = await fetch('https://csacademy.com/accounts/get_user_notifications/', {
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        'x-csrftoken': csrfToken,
        Cookie: buildCookieHeader(sessionId, csrfToken),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://csacademy.com/',
      },
    })

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` }
    }

    const data = await res.json()

    if (data.error) {
      if (data.error.code === 1004) {
        return {
          ok: false,
          error: 'Session cookie rejected: not authenticated or expired',
        }
      }
      return {
        ok: false,
        error: `CS Academy error (${data.error.code}): ${data.error.message || 'Authentication rejected'}`,
      }
    }

    const user = data.state?.user?.[0]
    if (!user) {
      return {
        ok: false,
        error: 'Session cookie rejected: not authenticated or expired',
      }
    }

    return {
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.firstName || user.username,
      },
    }
  } catch (err) {
    return { ok: false, error: `Network error during verification: ${err.message}` }
  }
}

/**
 * Direct login via credentials (Option 2)
 */
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
    if (c.includes('crossSessionId=')) {
      sessionId = c.split('crossSessionId=')[1].split(';')[0]
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
  // Support non-interactive CLI arguments: --session <id> --csrf <token>
  const args = process.argv.slice(2)
  let cliSession = ''
  let cliCsrf = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--session' && args[i + 1]) cliSession = args[i + 1]
    if (args[i] === '--csrf' && args[i + 1]) cliCsrf = args[i + 1]
  }

  let sessionId = sanitizeCookieValue(cliSession, ['sessionid', 'crossSessionId'])
  let csrfToken = sanitizeCookieValue(cliCsrf, ['csrftoken'])
  let email = ''
  let password = ''

  if (!sessionId || !csrfToken) {
    const prompt = new TerminalPrompt()
    try {
      console.log('================================================================')
      console.log('  RUSLXTREME 3.0 — Secure CS Academy Authentication Setup')
      console.log('================================================================')
      console.log('Choose your preferred authentication method:')
      console.log('  [1] Active Browser Session Cookies (from your Chrome tab)')
      console.log('  [2] Email and Password (direct automated login)\n')

      const rawChoice = await prompt.ask('Enter choice (1 or 2, default: 1): ')
      const choice = rawChoice.trim() || '1'

      if (choice === '1' || choice === 'browser') {
        console.log('\n--- How to get your cookies from Google Chrome ---')
        console.log('1. Open your logged-in CS Academy tab (e.g. scoreboard):')
        console.log('   https://csacademy.com/ieeextreme20/scoreboard/')
        console.log('2. Open Developer Tools (Press F12, or Right-Click -> Inspect, or Cmd+Opt+I on Mac).')
        console.log('3. In DevTools, go to: Application -> Storage -> Cookies -> https://csacademy.com')
        console.log('4. Copy the "Value" of "crossSessionId" (or "sessionid").')
        console.log('5. Copy the "Value" of "csrftoken".\n')

        const inputSession = await prompt.ask('Step 1/2 — Enter "sessionid" or "crossSessionId" cookie: ')
        const inputCsrf = await prompt.ask('Step 2/2 — Enter "csrftoken" cookie: ')

        sessionId = sanitizeCookieValue(inputSession, ['sessionid', 'crossSessionId'])
        csrfToken = sanitizeCookieValue(inputCsrf, ['csrftoken'])

        // 3. Validate that both cookie values are present before attempting authentication
        if (!sessionId || !csrfToken) {
          console.error('\n[FAIL] Both session cookie ("sessionid" or "crossSessionId") and "csrftoken" are required.')
          console.error('Neither value can be empty. Please copy both values from Chrome DevTools.')
          process.exit(1)
        }
      } else {
        email = await prompt.ask('Enter CS Academy Account Email / Username: ')
        if (!email) {
          console.error('\n[FAIL] Error: Email or username cannot be empty.')
          process.exit(1)
        }

        password = await prompt.ask('Enter CS Academy Account Password: ')
        if (!password) {
          console.error('\n[FAIL] Error: Password cannot be empty.')
          process.exit(1)
        }

        console.log('\nAuthenticating directly with CS Academy...')
        try {
          const authResult = await loginWithCredentials(email, password)
          sessionId = authResult.sessionId
          csrfToken = authResult.csrfToken
          console.log('[OK] Authentication handshake succeeded.')
        } catch (err) {
          console.error(`\n[FAIL] ${err.message}`)
          console.log('\nTip: If you signed in to CS Academy via Google SSO, use Option 1 (Browser Session Cookie).')
          process.exit(1)
        }
      }
    } finally {
      prompt.close()
    }
  }

  // 6. Verify authentication using the official user-session verification endpoint
  console.log('\nVerifying session with CS Academy official endpoint...')
  const verification = await verifyActiveSession(sessionId, csrfToken)

  // 8. Never save invalid or expired sessions
  // 10. Provide a clear error message if the browser session is invalid
  if (!verification.ok) {
    console.error(`\n[FAIL] ${verification.error}`)
    console.error('\nTroubleshooting:')
    console.error('1. Make sure you are actively logged in to https://csacademy.com in Chrome.')
    console.error('2. Open DevTools (F12 or Cmd+Opt+I) -> Application -> Storage -> Cookies -> https://csacademy.com')
    console.error('3. Check "crossSessionId" and "csrftoken". Copy the full values without trailing characters.')
    console.error('4. Re-run: npm run configure-auth')
    process.exit(1)
  }

  // 7. Never print cookie values, passwords, or authentication tokens
  console.log(`[OK] Session verified active! Successfully authenticated as account owner: ${verification.user.name} (@${verification.user.username})`)

  // 9. Keep .env.local protected and excluded from Git
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
  if (sessionId) {
    envLines.push(`CSACADEMY_SESSION_ID=${sessionId}`)
    envLines.push(`CSACADEMY_CROSS_SESSION_ID=${sessionId}`)
  }
  if (csrfToken) envLines.push(`CSACADEMY_CSRF_TOKEN=${csrfToken}`)

  envLines.push('UPSTREAM_SYNC_INTERVAL_MS=10000')
  envLines.push('FRONTEND_POLL_INTERVAL_MS=5000')

  fs.writeFileSync(ENV_FILE, envLines.join('\n') + '\n', { mode: 0o600, encoding: 'utf8' })
  console.log(`\n[OK] Configuration securely saved to: ${ENV_FILE} (permissions mode 0600)`)
  console.log('\nTesting live authenticated scoreboard synchronization...')

  // Run test sync
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
