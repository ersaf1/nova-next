/**
 * Create admin test account for testing
 * Run: node scripts/create-admin-test.js
 */
const puppeteer = require('puppeteer')

const BASE = 'http://localhost:3000'
const EMAIL = 'admin_test@nova.com'
const PASS = 'TestAdmin123!'

const G = '\x1b[32m', R = '\x1b[31m', C = '\x1b[36m', W = '\x1b[0m', B = '\x1b[1m'

async function run() {
  console.log(`\n${B}${C}=== Creating Admin Test Account ===${W}\n`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  try {
    // Navigate to homepage first so fetch has a valid origin
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await new Promise(r => setTimeout(r, 2000))

    // Step 1: Create user via signup API
    console.log(`Creating user: ${EMAIL}`)
    const result = await page.evaluate(async (email, password) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      return await res.json()
    }, EMAIL, PASS)

    console.log('Signup result:', JSON.stringify(result, null, 2))

    if (result.error && !result.error.includes('already')) {
      console.log(`${R}Failed to create user: ${result.error}${W}`)
    } else if (result.error && result.error.includes('already')) {
      console.log(`${G}User already exists — OK${W}`)
    } else {
      console.log(`${G}User created successfully${W}`)
    }

    console.log(`\n${G}Account ready: ${EMAIL} / ${PASS}${W}`)
    console.log(`${B}Note: Assign super_admin role via Supabase dashboard or seed-admin-role.ts${W}`)

  } catch (err) {
    console.error(`${R}Error:${W}`, err.message)
  } finally {
    await browser.close()
  }
}

run()
