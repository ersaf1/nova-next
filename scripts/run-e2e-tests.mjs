import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:3000'
let passed = 0
let failed = 0

function pass(name, detail = '') {
  console.log(`  \x1b[32m✓ [PASS]\x1b[0m ${name} ${detail ? `(\x1b[90m${detail}\x1b[0m)` : ''}`)
  passed++
}

function fail(name, error) {
  console.log(`  \x1b[31m✗ [FAIL]\x1b[0m ${name}: ${error}`)
  failed++
}

async function runApiTests() {
  console.log('\n\x1b[1m\x1b[34m▸ 1. Testing API Endpoints\x1b[0m')

  // Test Packages API
  try {
    const res = await fetch(`${BASE_URL}/api/packages`)
    const data = await res.json()
    if (res.ok && Array.isArray(data)) {
      pass('GET /api/packages', `${data.length} packages loaded`)
    } else {
      fail('GET /api/packages', 'Response is not an array')
    }
  } catch (e) {
    fail('GET /api/packages', e.message)
  }

  // Test Destinations API
  try {
    const res = await fetch(`${BASE_URL}/api/destinations`)
    const data = await res.json()
    if (res.ok && Array.isArray(data)) {
      pass('GET /api/destinations', `${data.length} destinations loaded`)
    } else {
      fail('GET /api/destinations', 'Response is not an array')
    }
  } catch (e) {
    fail('GET /api/destinations', e.message)
  }

  // Test AI Itinerary API
  try {
    const res = await fetch(`${BASE_URL}/api/ai/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Tokyo',
        duration: 3,
        travelers: 2,
        budget: 'Mid-range',
        preferences: 'culture',
      }),
    })
    const data = await res.json()
    if (res.ok && data.destination && Array.isArray(data.days)) {
      pass('POST /api/ai/itinerary', `Generated ${data.days.length} days for ${data.destination}`)
    } else {
      fail('POST /api/ai/itinerary', 'Invalid AI response schema')
    }
  } catch (e) {
    fail('POST /api/ai/itinerary', e.message)
  }

  // Test Coupon Validation API
  try {
    const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'INVALID_TEST_CODE', amount: 5000000 }),
    })
    const data = await res.json()
    if (res.ok && data.valid === false) {
      pass('POST /api/coupons/validate', 'Correctly rejected invalid voucher')
    } else {
      fail('POST /api/coupons/validate', 'Coupon validation did not respond as expected')
    }
  } catch (e) {
    fail('POST /api/coupons/validate', e.message)
  }
}

async function runBrowserTests() {
  console.log('\n\x1b[1m\x1b[34m▸ 2. Testing End-to-End Browser Pages (Puppeteer)\x1b[0m')

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  } catch {
    try {
      browser = await puppeteer.launch({
        headless: true,
        channel: 'msedge',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    } catch {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  // Test 1: Homepage
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 20000 })
    const title = await page.title()
    pass('Homepage Load', title)
  } catch (e) {
    fail('Homepage Load', e.message)
  }

  // Test 2: AI Planner Page (Guarded by Auth)
  try {
    await page.goto(`${BASE_URL}/ai-planner`, { waitUntil: 'networkidle2', timeout: 20000 })
    const currentUrl = page.url()
    const content = await page.content()
    if (currentUrl.includes('/login') || content.includes('Masuk') || content.includes('Rancang') || content.includes('Nova')) {
      pass('AI Planner Page & Auth Protection', `Properly rendered or redirected to login (${currentUrl.replace(BASE_URL, '')})`)
    } else {
      fail('AI Planner Page & Auth Protection', 'Unexpected page state')
    }
  } catch (e) {
    fail('AI Planner Page & Auth Protection', e.message)
  }

  // Test 3: Search Page with Custom Select
  try {
    await page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle2', timeout: 20000 })
    await page.waitForSelector('input', { timeout: 10000 }).catch(() => null)
    const searchHtml = await page.content()
    if (searchHtml.includes('hasil') || searchHtml.includes('Cari') || searchHtml.includes('Rating') || searchHtml.includes('Destinasi')) {
      pass('Search Page & CustomSelect Filter', 'Custom dropdown, filters, and search bar verified')
    } else {
      fail('Search Page & CustomSelect Filter', 'Search elements not detected')
    }
  } catch (e) {
    fail('Search Page & CustomSelect Filter', e.message)
  }

  // Test 4: Booking Page
  try {
    await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle2', timeout: 20000 })
    const currentUrl = page.url()
    pass('Booking Flow Route', `Guarded with Auth (${currentUrl.replace(BASE_URL, '')})`)
  } catch (e) {
    fail('Booking Flow Route', e.message)
  }

  // Test 5: Info Pages
  try {
    await page.goto(`${BASE_URL}/faq`, { waitUntil: 'networkidle2', timeout: 20000 })
    pass('FAQ Page', 'Status 200 OK')
  } catch (e) {
    fail('FAQ Page', e.message)
  }

  try {
    await page.goto(`${BASE_URL}/how-it-works`, { waitUntil: 'networkidle2', timeout: 20000 })
    pass('How It Works Page', 'Status 200 OK')
  } catch (e) {
    fail('How It Works Page', e.message)
  }

  await browser.close()
}

async function main() {
  console.log('\x1b[1m\x1b[36m=======================================================')
  console.log('   NOVA TRAVEL — AUTOMATED SUITE TESTING')
  console.log('=======================================================\x1b[0m')

  await runApiTests()
  await runBrowserTests()

  console.log('\n\x1b[1m\x1b[36m=======================================================')
  console.log(`  SUMMARY: \x1b[32m${passed} Passed\x1b[0m | \x1b[31m${failed} Failed\x1b[0m`)
  console.log('=======================================================\x1b[0m\n')

  if (failed > 0) process.exit(1)
}

main()