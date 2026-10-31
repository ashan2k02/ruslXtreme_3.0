import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_FILE = path.resolve(__dirname, '../.env.local')
const GITIGNORE_FILE = path.resolve(__dirname, '../.gitignore')

function promptHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const stdin = process.openStdin()
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

    rl.question(query, (value) => {
      resolve(value.trim())
      rl.close()
    })
  })
}

function promptVisible(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(query, (value) => {
      resolve(value.trim())
      rl.close()
    })
  })
}

async function testCSAcademyLogin(email, password) {
  console.log('\n[1/3] Performing initial handshake with CS Academy...')
  const initialRes = await fetch('https://csacademy.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    throw new Error('Could not obtain CSRF token from CS Academy initial handshake.')
  }

  console.log('[2/3] Verifying credentials with official CS Academy login endpoint...')
  const loginRes = await fetch('https://csacademy.com/accounts/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': csrf,
      Cookie: `csrftoken=${csrf}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    throw new Error(`CS Academy Authentication Failed: ${loginData.error.message || JSON.stringify(loginData.error)}`)
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

  return { sessionId, csrfToken: updatedCsrf }
}

async function main() {
  console.log('================================================================')
  console.log('  RUSLXTREME 3.0 — Secure CS Academy Authentication Setup')
  console.log('================================================================')
  console.log('This utility configures official authenticated scoreboard synchronization.')
  console.log('Credentials will be saved ONLY to local .env.local with 0600 file permissions.')
  console.log('Credentials are NEVER committed to Git or exposed to frontend visitors.\n')

  const email = await promptVisible('Enter CS Academy Account Email / Username: ')
  if (!email) {
    console.error('Error: Email or username cannot be empty.')
    process.exit(1)
  }

  const password = await promptHidden('Enter CS Academy Account Password: ')
  console.log('\n')
  if (!password) {
    console.error('Error: Password cannot be empty.')
    process.exit(1)
  }

  let sessionInfo = null
  try {
    sessionInfo = await testCSAcademyLogin(email, password)
    console.log('[OK] Authentication verified successfully with CS Academy!')
    if (sessionInfo.sessionId) {
      console.log('[OK] Authenticated session ID established.')
    }
  } catch (err) {
    console.warn(`\n[WARNING] Online verification note: ${err.message}`)
    console.warn('Saving credentials to .env.local; background sync engine will retry during polling.\n')
  }

  // Ensure .gitignore has .env.local
  if (fs.existsSync(GITIGNORE_FILE)) {
    const gitignoreContent = fs.readFileSync(GITIGNORE_FILE, 'utf8')
    if (!gitignoreContent.includes('.env.local') && !gitignoreContent.includes('*.local')) {
      fs.appendFileSync(GITIGNORE_FILE, '\n.env.local\n', 'utf8')
      console.log('[OK] Added .env.local to .gitignore')
    }
  }

  // Write .env.local
  const envLines = [
    '# RUSLXTREME 3.0 — Server-side CS Academy Credentials',
    '# Automatically generated by npm run configure-auth',
    '# Never commit this file to Git or expose to website visitors',
    `CSACADEMY_EMAIL=${email}`,
    `CSACADEMY_PASSWORD=${password}`,
  ]

  if (sessionInfo?.sessionId) {
    envLines.push(`CSACADEMY_SESSION_ID=${sessionInfo.sessionId}`)
  }
  if (sessionInfo?.csrfToken) {
    envLines.push(`CSACADEMY_CSRF_TOKEN=${sessionInfo.csrfToken}`)
  }

  envLines.push('UPSTREAM_SYNC_INTERVAL_MS=10000')
  envLines.push('FRONTEND_POLL_INTERVAL_MS=5000')

  fs.writeFileSync(ENV_FILE, envLines.join('\n') + '\n', { mode: 0o600, encoding: 'utf8' })
  console.log(`[3/3] Configuration securely saved to: ${ENV_FILE}`)
  console.log('[OK] File permissions set to 0600 (read/write only by owner).')
  console.log('\nYou can now start the continuous live synchronizer:')
  console.log('  npm run dev          # Runs Vite dev server with integrated sync engine')
  console.log('  npm run sync-service # Runs standalone background synchronization service')
}

main().catch((err) => {
  console.error('\nConfiguration failed:', err.message)
  process.exit(1)
})
