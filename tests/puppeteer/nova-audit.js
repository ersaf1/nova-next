/**
 * NOVA Travel — Full-Site Error Detector Audit
 * Uses puppeteer-error-detector inspectPage on every route.
 * Requires: dev server on http://localhost:3000
 * Run: node tests/puppeteer/nova-audit.js
 */

const { inspectPage } = require('C:/Users/lulus/.agents/skills/puppeteer-error-detector/scripts/detect-errors.js')
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const BASE = 'http://localhost:3001'
const EMAIL = 'ersaf@gmail.com'
const PASS = '11111111'

const OUT_DIR = path.join(__dirname, 'screenshots', 'audit')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m'
const C = '\x1b[36m', W = '\x1b[0m',  B = '\x1b[1m'

function log(m)  { console.log(`${C}  →${W} ${m}`) }
function ok(m)   { console.log(`${G}  ✓${W} ${m}`) }
function warn(m) { console.log(`${Y}  ⚠${W} ${m}`) }
function err(m)  { console.log(`${R}  ✗${W} ${m}`) }
function sec(t)  { console.log(`\n${B}${Y}━━ ${t} ━━${W}`) }

// ─── Public pages (no auth needed) ───────────────────────────────────────────
const PUBLIC_PAGES = [
  { name: 'Homepage',      url: '/' },
  { name: 'Login',         url: '/login' },
  { name: 'Register',      url: '/register' },
  { name: 'Destinations',  url: '/destinations' },
  { name: 'Packages',      url: '/packages' },
  { name: 'Search',        url: '/search' },
  { name: 'FAQ',           url: '/faq' },
  { name: 'How It Works',  url: '/how-it-works' },
  { name: 'Promo',         url: '/promo' },
  { name: 'Reviews',       url: '/reviews' },
  { name: 'AI Planner',    url: '/ai-planner' },
]

// ─── Auth-required pages ──────────────────────────────────────────────────────
const AUTH_PAGES = [
  { name: 'Dashboard',              url: '/dashboard' },
  { name: 'Dashboard Bookings',     url: '/dashboard/bookings' },
  { name: 'Dashboard Itineraries',  url: '/dashboard/itineraries' },
  { name: 'Dashboard Notifications',url: '/dashboard/notifications' },
  { name: 'Dashboard Wishlist',     url: '/dashboard/wishlist' },
  { name: 'Profile',                url: '/profile' },
  { name: 'Wishlist',               url: '/wishlist' },
  { name: 'Itinerary',              url: '/itinerary' },
  { name: 'Booking',                url: '/booking' },
]

// ─── Admin pages ──────────────────────────────────────────────────────────────
const ADMIN_PAGES = [
  { name: 'Admin Dashboard',     url: '/admin' },
  { name: 'Admin Destinations',  url: '/admin/destinations' },
  { name: 'Admin Packages',      url: '/admin/packages' },
  { name: 'Admin Departures',    url: '/admin/departures' },
  { name: 'Admin Bookings',      url: '/admin/bookings' },
  { name: 'Admin Users',         url: '/admin/users' },
  { name: 'Admin Testimonials',  url: '/admin/testimonials' },
  { name: 'Admin FAQs',          url: '/admin/faqs' },
  { name: 'Admin Coupons',       url: '/admin/coupons' },
  { name: 'Admin Refunds',       url: '/admin/refunds' },
  { name: 'Admin Reports',       url: '/admin/reports' },
  { name: 'Admin Newsletter',    url: '/admin/newsletter' },
  { name: 'Admin Features',      url: '/admin/features' },
  { name: 'Admin Hero',          url: '/admin/hero' },
  { name: 'Admin How It Works',  url: '/admin/how-it-works' },
  { name: 'Admin Settings',      url: '/admin/settings' },
  { name: 'Admin Audit Logs',    url: '/admin/audit-logs' },
]

// ─── Login helper — returns cookies ──────────────────────────────────────────
async function doLogin(browser) {
  const page = await browser.newPage()
  try {
    log('Logging in...')
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 20000 })

    // Suspense skeleton resolves → wait for actual input (id="email")
    await page.waitForSelector('#email', { timeout: 15000, visible: true })
    await page.click('#email', { clickCount: 3 })
    await page.type('#email', EMAIL, { delay: 40 })

    // Fill password
    await page.waitForSelector('#password', { timeout: 5000, visible: true })
    await page.click('#password', { clickCount: 3 })
    await page.type('#password', PASS, { delay: 40 })

    // Submit
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {})
    await new Promise(r => setTimeout(r, 2000))

    const cookies = await page.cookies()
    const url = page.url()
    if (url.includes('/login')) {
      warn('Still on login page — auth may have failed')
    } else {
      ok(`Logged in → ${url}`)
    }
    return cookies
  } finally {
    await page.close()
  }
}

// ─── Audit a single page ──────────────────────────────────────────────────────
async function auditPage({ name, url }, cookies = []) {
  const fullUrl = `${BASE}${url}`
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const screenshotPath = path.join(OUT_DIR, `${slug}.png`)
  const htmlPath = path.join(OUT_DIR, `${slug}.html`)
  const jsonPath = path.join(OUT_DIR, `${slug}.json`)

  log(`Auditing: ${name} (${url})`)

  try {
    const results = await inspectPage(fullUrl, {
      screenshotPath,
      htmlReportPath: htmlPath,
      reportPath: jsonPath,
      waitTime: 3000,
      headless: true,
      cookies,
    })

    const { summary } = results
    const total = summary?.totalErrors ?? 0
    const critical = summary?.critical ?? 0

    if (total === 0) {
      ok(`${name} — no issues`)
    } else if (critical > 0) {
      err(`${name} — ${total} issues (${critical} critical)  → ${htmlPath}`)
    } else {
      warn(`${name} — ${total} issues (0 critical)  → ${htmlPath}`)
    }

    return { name, url, total, critical, results }
  } catch (e) {
    err(`${name} — audit threw: ${e.message}`)
    return { name, url, total: -1, critical: -1, error: e.message }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n${B}${C}${'━'.repeat(56)}${W}`)
  console.log(`${B}${C}  NOVA Travel — Full-Site Puppeteer Audit${W}`)
  console.log(`${B}${C}${'━'.repeat(56)}${W}`)
  console.log(`  Base URL  : ${BASE}`)
  console.log(`  Output    : ${OUT_DIR}`)
  console.log(`  Pages     : ${PUBLIC_PAGES.length + AUTH_PAGES.length + ADMIN_PAGES.length} total\n`)

  // Launch one browser for login cookie extraction only
  const loginBrowser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  let cookies = []
  try {
    cookies = await doLogin(loginBrowser)
  } finally {
    await loginBrowser.close()
  }

  const allResults = []

  // ── Public pages ────────────────────────────────────────────────────────────
  sec('Public Pages')
  for (const p of PUBLIC_PAGES) {
    const r = await auditPage(p)
    allResults.push(r)
  }

  // ── Auth pages ──────────────────────────────────────────────────────────────
  sec('Authenticated User Pages')
  for (const p of AUTH_PAGES) {
    const r = await auditPage(p, cookies)
    allResults.push(r)
  }

  // ── Admin pages ─────────────────────────────────────────────────────────────
  sec('Admin Pages')
  for (const p of ADMIN_PAGES) {
    const r = await auditPage(p, cookies)
    allResults.push(r)
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const pagesWithIssues = allResults.filter(r => r.total > 0)
  const criticalPages   = allResults.filter(r => r.critical > 0)
  const errorPages      = allResults.filter(r => r.total === -1)
  const cleanPages      = allResults.filter(r => r.total === 0)

  console.log(`\n${B}${C}${'━'.repeat(56)}${W}`)
  console.log(`${B}  Audit Summary${W}`)
  console.log(`${G}  Clean         : ${cleanPages.length} pages${W}`)
  console.log(`${Y}  Has issues    : ${pagesWithIssues.length} pages${W}`)
  console.log(`${R}  Critical      : ${criticalPages.length} pages${W}`)
  console.log(`${R}  Audit errors  : ${errorPages.length} pages${W}`)
  console.log(`${B}${C}${'━'.repeat(56)}${W}`)

  if (pagesWithIssues.length > 0) {
    console.log(`\n${B}Pages with issues:${W}`)
    pagesWithIssues.forEach(r => {
      const tag = r.critical > 0 ? `${R}[CRITICAL]${W}` : `${Y}[warn]${W}`
      console.log(`  ${tag} ${r.name} — ${r.total} issues  → ${path.join(OUT_DIR, r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html')}`)
    })
  }

  if (errorPages.length > 0) {
    console.log(`\n${B}${R}Pages that failed to audit:${W}`)
    errorPages.forEach(r => console.log(`  ${R}✗${W} ${r.name}: ${r.error}`))
  }

  // Save master summary JSON
  const summaryPath = path.join(OUT_DIR, 'audit-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    base: BASE,
    pages: allResults,
  }, null, 2))
  console.log(`\n  Full summary → ${summaryPath}`)
  console.log(`  HTML reports → ${OUT_DIR}\n`)

  process.exit(criticalPages.length > 0 || errorPages.length > 0 ? 1 : 0)
}

run().catch(e => {
  console.error(`${R}Fatal:${W}`, e)
  process.exit(1)
})
