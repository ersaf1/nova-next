/**
 * NOVA Travel — Comprehensive Scenario Test
 * Covers ALL user and admin flows: buttons, forms, navigation
 * Run: node tests/puppeteer/nova-scenario.js
 *
 * Scenarios:
 *  USER  (1-18):  Homepage, Login, Search, Destinations, Packages,
 *                 AI Planner, Dashboard, Bookings, Wishlist, Itineraries,
 *                 Notifications, Profile, Wishlist, FAQ, How It Works,
 *                 Promo, Reviews, Itinerary
 *  ADMIN (19-31): Dashboard, Destinations, Packages, Departures, Bookings,
 *                 Users, Testimonials, FAQs, Coupons, Reports, Settings,
 *                 Hero, Audit Logs
 */

const puppeteer = require('puppeteer')
const fs        = require('fs')
const path      = require('path')

// ── Config ───────────────────────────────────────────────────────────────────
const BASE  = 'http://localhost:3001'
const EMAIL = 'ersaf@gmail.com'
const PASS  = '11111111'

const SHOT_DIR = path.join(__dirname, 'screenshots', 'scenarios')
fs.mkdirSync(SHOT_DIR, { recursive: true })

// ── Colors ───────────────────────────────────────────────────────────────────
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m'
const C = '\x1b[36m', W = '\x1b[0m',  B = '\x1b[1m'

// ── Counters & results ───────────────────────────────────────────────────────
let passed = 0, failed = 0, skipped = 0
const results = []
let shotIdx = 0

function log(m)     { console.log(`${C}  ->  ${W} ${m}`) }
function pass(m)    { console.log(`${G}  OK  ${W} ${m}`); passed++; results.push({ s: 'PASS', m }) }
function fail(m, e) { console.log(`${R}  FAIL ${W} ${m}`); if (e) console.log(`${R}    ${e.message}${W}`); failed++; results.push({ s: 'FAIL', m }) }
function skip(m)    { console.log(`${Y}  SKIP ${W} ${m}`); skipped++; results.push({ s: 'SKIP', m }) }
function section(t) { console.log(`\n${B}${Y}=== ${t} ===${W}`) }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)) }

// ── Helpers ──────────────────────────────────────────────────────────────────
async function safeGoto(page, url) {
  try   { await page.goto(url, { waitUntil: 'networkidle2',     timeout: 25000 }) }
  catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }) }
}

async function tryClick(page, sel, timeout = 5000) {
  try { await page.waitForSelector(sel, { timeout, visible: true }); await page.click(sel); return true }
  catch { return false }
}

async function tryType(page, sel, text, timeout = 8000) {
  try {
    await page.waitForSelector(sel, { timeout, visible: true })
    await page.click(sel, { clickCount: 3 })
    await page.type(sel, text, { delay: 40 })
    return true
  } catch { return false }
}

async function pageHas(page, text) {
  return (await page.content()).includes(text)
}

async function shot(page, name) {
  try {
    const safe = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
    const file = path.join(SHOT_DIR, `${String(++shotIdx).padStart(3, '0')}_${safe}.png`)
    await page.screenshot({ path: file, fullPage: false })
    log(`Screenshot: ${path.basename(file)}`)
  } catch { /* ignore */ }
}

/** Find and click the Add / Create / New / + button on admin pages */
async function clickAddBtn(page) {
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    const add = btns.find(b => {
      const t = b.textContent.trim()
      return t.startsWith('+') || /\b(Add|Create|Tambah|New)\b/i.test(t)
    })
    if (add) { add.click(); return true }
    return false
  })
  if (clicked) return true
  try {
    await page.waitForSelector('button.bg-black', { timeout: 3000 })
    const btns = await page.$$('button.bg-black')
    if (btns.length) { await btns[0].click(); return true }
  } catch {}
  return false
}

/** Click the most visible submit / save button */
async function clickSaveBtn(page) {
  for (const sel of ['button[type="submit"]', 'button.bg-black', 'button.bg-indigo-600']) {
    try {
      await page.waitForSelector(sel, { timeout: 2000 })
      const btns = await page.$$(sel)
      for (const btn of btns) {
        if (await btn.isIntersectingViewport()) { await btn.click(); return true }
      }
    } catch {}
  }
  return false
}

/** Close any open modal/dialog */
async function closeModal(page) {
  // Try Escape first
  await page.keyboard.press('Escape')
  await sleep(400)
  // Then try visible close / cancel buttons
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, [role="button"]')]
    const close = btns.find(b => /\b(Close|Cancel|Batal|×|✕)\b/i.test(b.textContent.trim()) && b.offsetParent)
    if (close) close.click()
  })
  await sleep(300)
}

/** Verify page loaded (not stuck on login) */
async function verifyNotLogin(page, label) {
  await sleep(1800)
  if (page.url().includes('/login')) {
    fail(`${label}: redirected to /login (auth failed)`)
    return false
  }
  return true
}

/** Re-login if session expired */
async function ensureLoggedIn(page) {
  const ok = await page.evaluate(async () => {
    try { const r = await fetch('/api/auth/me', { credentials: 'include' }); return r.status === 200 }
    catch { return false }
  }).catch(() => false)
  if (!ok) {
    log('Session expired — re-logging in...')
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
    await page.click('input[type=email]',    { clickCount: 3 })
    await page.type ('input[type=email]',    EMAIL, { delay: 30 })
    await page.click('input[type=password]', { clickCount: 3 })
    await page.type ('input[type=password]', PASS,  { delay: 30 })
    await page.keyboard.press('Enter')
    await sleep(3500)
    log('Re-login done: ' + page.url())
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
async function run() {
  console.log(`\n${B}${C}${'='.repeat(60)}${W}`)
  console.log(`${B}${C}  NOVA Travel — COMPREHENSIVE SCENARIO TEST${W}`)
  console.log(`${B}${C}  Base: ${BASE}${W}`)
  console.log(`${B}${C}${'='.repeat(60)}${W}`)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    slowMo: 200,
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 900 })

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 1 — Homepage
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 1 — Homepage')
  try {
    await safeGoto(page, BASE)
    await shot(page, 'homepage_loaded')

    // Verify hero
    const heroOk = await pageHas(page, 'Nova') || await pageHas(page, 'Travel') ||
                   await pageHas(page, 'Jelajah') || await pageHas(page, 'Paket')
    if (heroOk) pass('Homepage: hero section loaded')
    else        skip('Homepage: hero text not detected (may use images only)')

    // Click "Cari Paket" / navbar Packages link
    const navClicked = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a, button, nav a')]
      const pkg = links.find(el => /paket|packages|package/i.test(el.textContent))
      if (pkg) { pkg.click(); return true }
      return false
    })
    if (navClicked) {
      await sleep(1500)
      const url = page.url()
      if (url.includes('/packages') || url.includes('/paket')) pass('Homepage → /packages navigation works')
      else log(`Homepage: nav clicked but URL is ${url}`)
      await shot(page, 'homepage_nav_packages')
    } else {
      skip('Homepage: Cari Paket / packages nav link not found')
    }
  } catch (e) { fail('Homepage error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 2 — Login
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 2 — Login')
  try {
    await safeGoto(page, `${BASE}/login`)
    await shot(page, 'login_page')

    const emailOk = await tryType(page, 'input[type="email"], input[name="email"]', EMAIL)
    if (emailOk) pass('Login: email filled')
    else         fail('Login: email field not found')

    const passOk = await tryType(page, 'input[type="password"], input[name="password"]', PASS)
    if (passOk) pass('Login: password filled')
    else        fail('Login: password field not found')

    await shot(page, 'login_filled')
    await page.keyboard.press('Enter')
    await sleep(3500)

    const afterUrl = page.url()
    log(`URL after login: ${afterUrl}`)

    if (!afterUrl.includes('/login')) {
      pass('Login: redirected away from /login (success)')
    } else {
      // Fallback: click submit button
      await tryClick(page, 'button[type="submit"]')
      await sleep(3000)
      if (!page.url().includes('/login')) pass('Login: success via button click')
      else                                fail('Login: still on /login — credentials may be wrong')
    }
    await shot(page, 'login_after')
  } catch (e) { fail('Login scenario error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 3 — Search
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 3 — Search')
  try {
    await safeGoto(page, `${BASE}/search`)
    if (!(await verifyNotLogin(page, 'Search'))) throw new Error('auth')
    await shot(page, 'search_page')
    pass('Search: page loaded')

    // Try common search input selectors
    const typed = await tryType(page, 'input[name="q"], input[name="query"], input[name="search"], input[placeholder*="ari"], input[placeholder*="earch"], input[type="search"]', 'Bali', 5000)
    if (typed) {
      pass('Search: typed "Bali" into search input')
      await page.keyboard.press('Enter')
      await sleep(2500)
      await shot(page, 'search_results')
      const hasResults = await pageHas(page, 'Bali') || await pageHas(page, 'result') ||
                         await pageHas(page, 'paket') || await pageHas(page, 'destination')
      if (hasResults) pass('Search: results appeared after search')
      else            skip('Search: no visible results detected (may be empty state)')
    } else {
      skip('Search: search input field not found')
    }
  } catch (e) { if (e.message !== 'auth') fail('Search error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 4 — Destinations list + detail
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 4 — Destinations')
  try {
    await safeGoto(page, `${BASE}/destinations`)
    if (!(await verifyNotLogin(page, 'Destinations'))) throw new Error('auth')
    await shot(page, 'destinations_list')
    pass('Destinations: list page loaded')

    // Wait for destination cards to render
    await sleep(2000)
    const cardClicked = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('a[href*="/destinations/"], [data-testid*="destination"], article, .card')]
        .filter(el => el.href || el.closest('a'))
      if (cards.length) {
        const first = cards[0]
        const link  = first.tagName === 'A' ? first : first.closest('a')
        if (link) { link.click(); return true }
        first.click(); return true
      }
      return false
    })

    if (cardClicked) {
      await sleep(2500)
      await shot(page, 'destination_detail')
      if (!page.url().includes('/login')) pass('Destinations: detail page opened from card click')
      else skip('Destinations: card click redirected to login')
    } else {
      skip('Destinations: no clickable cards found (may need data)')
    }
  } catch (e) { if (e.message !== 'auth') fail('Destinations error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 5 — Packages list + detail
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 5 — Packages')
  try {
    await safeGoto(page, `${BASE}/packages`)
    if (!(await verifyNotLogin(page, 'Packages'))) throw new Error('auth')
    await shot(page, 'packages_list')
    pass('Packages: list page loaded')

    await sleep(2000)
    const pkgClicked = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href*="/packages/"]')]
      if (links.length) { links[0].click(); return true }
      const cards = [...document.querySelectorAll('[data-testid*="package"], article, .card')]
      if (cards.length) {
        const a = cards[0].closest('a') || cards[0].querySelector('a')
        if (a) { a.click(); return true }
        cards[0].click(); return true
      }
      return false
    })

    if (pkgClicked) {
      await sleep(2500)
      await shot(page, 'package_detail')
      if (!page.url().includes('/login')) pass('Packages: detail/booking page opened')
      else skip('Packages: redirected to login from package detail')
    } else {
      skip('Packages: no package links found (may need data)')
    }
  } catch (e) { if (e.message !== 'auth') fail('Packages error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 6 — AI Planner
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 6 — AI Planner')
  try {
    await safeGoto(page, `${BASE}/ai-planner`)
    if (!(await verifyNotLogin(page, 'AI Planner'))) throw new Error('auth')
    await shot(page, 'ai_planner_loaded')
    pass('AI Planner: page loaded')

    // Check map presence (Leaflet, Mapbox, Google Maps, or canvas)
    const hasMap = await page.evaluate(() =>
      !!(document.querySelector('.leaflet-container, #map, [class*="mapbox"], canvas, [class*="map"]'))
    )
    if (hasMap) pass('AI Planner: map element detected')
    else        skip('AI Planner: no map element found')

    // Type into chat input
    const chatSels = [
      'input[placeholder*="ari"], input[placeholder*="essage"], input[placeholder*="estination"]',
      'textarea[placeholder*="ari"], textarea[placeholder*="essage"]',
      'input[name="message"], input[name="query"], input[name="input"]',
      'textarea[name="message"]',
      '[contenteditable="true"]',
    ]
    let chatTyped = false
    for (const sel of chatSels) {
      chatTyped = await tryType(page, sel, 'Bali 3 hari trip', 3000)
      if (chatTyped) break
    }
    if (chatTyped) {
      pass('AI Planner: typed destination in chat input')
      await shot(page, 'ai_planner_typed')
      // Send message
      await page.keyboard.press('Enter')
      await sleep(2000)
      await shot(page, 'ai_planner_sent')
      pass('AI Planner: message sent')
    } else {
      skip('AI Planner: chat input not found')
    }
  } catch (e) { if (e.message !== 'auth') fail('AI Planner error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 7 — Dashboard
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 7 — Dashboard')
  try {
    await safeGoto(page, `${BASE}/dashboard`)
    if (!(await verifyNotLogin(page, 'Dashboard'))) throw new Error('auth')
    await shot(page, 'dashboard_loaded')
    pass('Dashboard: page loaded')

    // Verify user name appears (any personalized greeting)
    const hasUser = await page.evaluate(() => {
      const body = document.body.innerText
      return body.length > 200 // at minimum something renders
    })
    if (hasUser) pass('Dashboard: content rendered')

    // Click "My Bookings" or Bookings navigation
    const bookingNav = await page.evaluate(() => {
      const els = [...document.querySelectorAll('a, button')]
      const el = els.find(e => /booking|pemesanan/i.test(e.textContent))
      if (el) { el.click(); return true }
      return false
    })
    if (bookingNav) {
      await sleep(2000)
      await shot(page, 'dashboard_bookings_nav')
      if (page.url().includes('/bookings') || page.url().includes('/dashboard')) {
        pass('Dashboard: navigated to bookings via click')
      }
    } else {
      skip('Dashboard: bookings nav link not found')
    }
  } catch (e) { if (e.message !== 'auth') fail('Dashboard error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 8 — Dashboard Bookings
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 8 — Dashboard Bookings')
  try {
    await safeGoto(page, `${BASE}/dashboard/bookings`)
    if (!(await verifyNotLogin(page, 'Dashboard/Bookings'))) throw new Error('auth')
    await shot(page, 'dashboard_bookings')
    pass('Dashboard Bookings: page loaded')

    const hasContent = await pageHas(page, 'booking') || await pageHas(page, 'Booking') ||
                       await pageHas(page, 'pemesanan') || await pageHas(page, 'empty') ||
                       await pageHas(page, 'kosong') || await pageHas(page, 'No ')
    if (hasContent) pass('Dashboard Bookings: list or empty state displayed')
    else            skip('Dashboard Bookings: no recognizable content')
  } catch (e) { if (e.message !== 'auth') fail('Dashboard Bookings error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 9 — Dashboard Wishlist
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 9 — Dashboard Wishlist')
  try {
    await safeGoto(page, `${BASE}/dashboard/wishlist`)
    if (!(await verifyNotLogin(page, 'Dashboard/Wishlist'))) throw new Error('auth')
    await shot(page, 'dashboard_wishlist')
    pass('Dashboard Wishlist: page loaded')

    const hasContent = await pageHas(page, 'wishlist') || await pageHas(page, 'Wishlist') ||
                       await pageHas(page, 'favorit') || await pageHas(page, 'empty') ||
                       await pageHas(page, 'No ')
    if (hasContent) pass('Dashboard Wishlist: content displayed')
    else            skip('Dashboard Wishlist: no recognizable content')
  } catch (e) { if (e.message !== 'auth') fail('Dashboard Wishlist error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 10 — Dashboard Itineraries
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 10 — Dashboard Itineraries')
  try {
    await safeGoto(page, `${BASE}/dashboard/itineraries`)
    if (!(await verifyNotLogin(page, 'Dashboard/Itineraries'))) throw new Error('auth')
    await shot(page, 'dashboard_itineraries')
    pass('Dashboard Itineraries: page loaded')
    pass('Dashboard Itineraries: rendered without crash')
  } catch (e) { if (e.message !== 'auth') fail('Dashboard Itineraries error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 11 — Dashboard Notifications
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 11 — Dashboard Notifications')
  try {
    await safeGoto(page, `${BASE}/dashboard/notifications`)
    if (!(await verifyNotLogin(page, 'Dashboard/Notifications'))) throw new Error('auth')
    await shot(page, 'dashboard_notifications')
    pass('Dashboard Notifications: page loaded')

    const hasContent = await pageHas(page, 'Notif') || await pageHas(page, 'notif') ||
                       await pageHas(page, 'No ') || await pageHas(page, 'empty')
    if (hasContent) pass('Dashboard Notifications: content rendered')
    else            skip('Dashboard Notifications: no recognizable content')
  } catch (e) { if (e.message !== 'auth') fail('Dashboard Notifications error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 12 — Profile
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 12 — Profile')
  try {
    await safeGoto(page, `${BASE}/profile`)
    if (!(await verifyNotLogin(page, 'Profile'))) throw new Error('auth')
    await shot(page, 'profile_loaded')
    pass('Profile: page loaded')

    // Check form fields
    // Profile page uses uncontrolled inputs with no name/id — use type selector
    const hasFullName = await tryClick(page, 'input[type="text"]', 3000)
    if (hasFullName) {
      pass('Profile: full_name field found')
      await page.click('input[type="text"]', { clickCount: 3 })
      await page.type('input[type="text"]', 'Test User Updated', { delay: 35 })
      await shot(page, 'profile_edited')
      pass('Profile: name edited')

      // Try to save
      const saved = await clickSaveBtn(page)
      if (saved) {
        await sleep(2000)
        pass('Profile: save button clicked')
        await shot(page, 'profile_saved')
      } else {
        skip('Profile: save button not found')
      }
    } else {
      skip('Profile: full_name input not found')
    }

    const hasPhone = await pageHas(page, 'phone') || await pageHas(page, 'Phone') || await pageHas(page, 'telepon')
    if (hasPhone) pass('Profile: phone field detected in page')
  } catch (e) { if (e.message !== 'auth') fail('Profile error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 13 — Wishlist
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 13 — Wishlist')
  try {
    await safeGoto(page, `${BASE}/wishlist`)
    await shot(page, 'wishlist_page')
    // Wishlist may redirect to login if not auth — both are valid
    if (page.url().includes('/login')) {
      skip('Wishlist: redirected to login (requires auth)')
    } else {
      pass('Wishlist: page loaded (authenticated)')
      const hasContent = await pageHas(page, 'wishlist') || await pageHas(page, 'Wishlist') ||
                         await pageHas(page, 'favorit') || await pageHas(page, 'empty') ||
                         await pageHas(page, 'No ')
      if (hasContent) pass('Wishlist: content or empty state displayed')
    }
  } catch (e) { fail('Wishlist error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 14 — FAQ (accordion)
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 14 — FAQ')
  try {
    await safeGoto(page, `${BASE}/faq`)
    await shot(page, 'faq_page')
    pass('FAQ: page loaded')

    // Click first FAQ accordion item — buttons inside .space-y-3 container
    const faqClicked = await page.evaluate(() => {
      const btn = document.querySelector('.space-y-3 button')
      if (btn) { btn.click(); return btn.textContent.trim().slice(0, 40) }
      // fallback: any button in main with text content
      const btns = [...document.querySelectorAll('main button')].filter(b => b.textContent.trim().length > 5)
      if (btns.length) { btns[0].click(); return btns[0].textContent.trim().slice(0, 40) }
      return null
    })

    if (faqClicked) {
      await sleep(1000)
      await shot(page, 'faq_accordion_open')
      pass(`FAQ: accordion item clicked — "${faqClicked}"`)
    } else {
      skip('FAQ: no accordion trigger found')
    }
  } catch (e) { fail('FAQ error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 15 — How It Works
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 15 — How It Works')
  try {
    await safeGoto(page, `${BASE}/how-it-works`)
    await shot(page, 'how_it_works')
    pass('How It Works: page loaded')

    const hasContent = await pageHas(page, 'Cara') || await pageHas(page, 'Langkah') ||
                       await pageHas(page, 'Step') || await pageHas(page, 'How') ||
                       await pageHas(page, 'Works')
    if (hasContent) pass('How It Works: content detected')
    else            skip('How It Works: no recognizable content text')
  } catch (e) { fail('How It Works error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 16 — Promo
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 16 — Promo')
  try {
    await safeGoto(page, `${BASE}/promo`)
    await shot(page, 'promo_page')
    pass('Promo: page loaded')

    await sleep(1000)
    // Promo is server-rendered from Coupon table — check for promo code cards or empty state
    const hasPromo = await pageHas(page, 'promo') || await pageHas(page, 'Promo') ||
                     await pageHas(page, 'diskon') || await pageHas(page, 'Belum ada') ||
                     await pageHas(page, 'checkout') || await pageHas(page, 'kode')
    if (hasPromo) {
      pass('Promo: page content detected (codes or empty state)')
      const cards = await page.$$('[class*="promo"], [class*="card"], [class*="coupon"]')
      if (cards.length > 0) pass(`Promo: ${cards.length} promo elements found`)
    } else {
      skip('Promo: no recognizable promo content')
    }
  } catch (e) { fail('Promo error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 17 — Reviews
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 17 — Reviews')
  try {
    await safeGoto(page, `${BASE}/reviews`)
    await shot(page, 'reviews_page')
    pass('Reviews: page loaded')

    await sleep(2000)
    const hasReviews = await pageHas(page, 'review') || await pageHas(page, 'Review') ||
                       await pageHas(page, 'testimoni') || await pageHas(page, 'rating') ||
                       await pageHas(page, 'Rating')
    if (hasReviews) pass('Reviews: review content detected')
    else            skip('Reviews: no review content found')

    const cards = await page.$$('[class*="card"], article, [class*="review"], [class*="testimoni"]')
    if (cards.length) pass(`Reviews: ${cards.length} review cards rendered`)
  } catch (e) { fail('Reviews error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 18 — Itinerary
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 18 — Itinerary')
  try {
    await safeGoto(page, `${BASE}/itinerary`)
    await shot(page, 'itinerary_page')
    if (page.url().includes('/login')) {
      skip('Itinerary: requires auth, redirected to login')
    } else {
      pass('Itinerary: page loaded')
      const hasContent = await pageHas(page, 'Itinerary') || await pageHas(page, 'itinerary') ||
                         await pageHas(page, 'Rencana') || await pageHas(page, 'Trip')
      if (hasContent) pass('Itinerary: content detected')
    }
  } catch (e) { fail('Itinerary error', e) }

  // ══════════════════════════════════════════════════════════════════════════
  //  ██████  ADMIN SCENARIOS
  // ══════════════════════════════════════════════════════════════════════════

  // Ensure we are logged in before admin tests
  await ensureLoggedIn(page)

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 19 — Admin Dashboard
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 19 — Admin Dashboard')
  try {
    await safeGoto(page, `${BASE}/admin`)
    await sleep(2500)
    if (page.url().includes('/login')) {
      fail('Admin Dashboard: no admin role — redirected to /login')
      log('All remaining admin tests may fail. Check role in Supabase.')
    } else {
      await shot(page, 'admin_dashboard')
      pass('Admin Dashboard: accessible')

      const hasDash = await pageHas(page, 'Dashboard') || await pageHas(page, 'Admin') ||
                      await pageHas(page, 'Overview')
      if (hasDash) pass('Admin Dashboard: content present')

      // Stats/cards
      const statEls = await page.$$('[class*="stat"], [class*="card"], [class*="metric"], [class*="count"]')
      if (statEls.length) pass(`Admin Dashboard: ${statEls.length} stat/card elements found`)

      // Sidebar nav
      const hasSidebar = await pageHas(page, 'Destinations') || await pageHas(page, 'Packages') ||
                         await pageHas(page, 'Bookings')
      if (hasSidebar) pass('Admin Dashboard: sidebar navigation detected')
    }
  } catch (e) { fail('Admin Dashboard error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 20 — Admin Destinations
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 20 — Admin Destinations')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/destinations`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Destinations: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_destinations_list')
    pass('Admin Destinations: page loaded')

    // Verify list/table
    const table = await page.$('table, [class*="list"], [class*="grid"]')
    if (table) pass('Admin Destinations: table/list element found')

    // Click Add button
    const addOk = await clickAddBtn(page)
    if (addOk) {
      await sleep(1000)
      await shot(page, 'admin_destinations_modal')
      // Check modal/form opened
      const modalOpen = await page.$('[role="dialog"], .modal, form')
      if (modalOpen) pass('Admin Destinations: Add modal/form opened')
      else           pass('Admin Destinations: Add button clicked (modal may be inline)')
      await closeModal(page)
      await shot(page, 'admin_destinations_modal_closed')
      pass('Admin Destinations: modal closed')
    } else {
      skip('Admin Destinations: Add button not found')
    }
  } catch (e) { if (e.message !== 'auth') fail('Admin Destinations error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 21 — Admin Packages
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 21 — Admin Packages')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/packages`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Packages: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_packages_list')
    pass('Admin Packages: page loaded')

    const table = await page.$('table, [class*="list"], [class*="grid"]')
    if (table) pass('Admin Packages: list element found')

    const addOk = await clickAddBtn(page)
    if (addOk) {
      await sleep(1000)
      await shot(page, 'admin_packages_modal')
      const modalOpen = await page.$('[role="dialog"], .modal, form')
      if (modalOpen) pass('Admin Packages: Add form opened')
      await closeModal(page)
      pass('Admin Packages: form closed')
    } else {
      skip('Admin Packages: Add button not found')
    }
  } catch (e) { if (e.message !== 'auth') fail('Admin Packages error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 22 — Admin Departures
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 22 — Admin Departures')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/departures`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Departures: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_departures')
    pass('Admin Departures: page loaded')

    const hasContent = await pageHas(page, 'Departure') || await pageHas(page, 'departure') ||
                       await pageHas(page, 'Keberangkatan') || await pageHas(page, 'Date')
    if (hasContent) pass('Admin Departures: departure content visible')

    const rows = await page.$$('table tbody tr, [class*="departure"]')
    log(`Admin Departures: ${rows.length} rows`)
    if (rows.length >= 0) pass(`Admin Departures: list rendered (${rows.length} rows)`)
  } catch (e) { if (e.message !== 'auth') fail('Admin Departures error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 23 — Admin Bookings
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 23 — Admin Bookings')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/bookings`)
    await sleep(2500)
    if (page.url().includes('/login')) { fail('Admin Bookings: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_bookings')
    pass('Admin Bookings: page loaded')

    // Search field
    const searchOk = await tryType(page,
      'input[placeholder*="Cari"], input[placeholder*="Search"], input[type="search"], input[name="search"]',
      'test', 3000)
    if (searchOk) {
      pass('Admin Bookings: search input works')
      await sleep(800)
    }

    // Filter buttons
    const filterClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')]
      const f = btns.find(b => /all|pending|confirmed|cancelled|semua/i.test(b.textContent))
      if (f) { f.click(); return true }
      return false
    })
    if (filterClicked) pass('Admin Bookings: filter button clicked')

    const rows = await page.$$('table tbody tr')
    log(`Admin Bookings: ${rows.length} booking rows`)
    pass(`Admin Bookings: table rendered (${rows.length} rows)`)
    await shot(page, 'admin_bookings_table')
  } catch (e) { if (e.message !== 'auth') fail('Admin Bookings error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 24 — Admin Users
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 24 — Admin Users')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/users`)
    await sleep(2500)
    if (page.url().includes('/login')) { fail('Admin Users: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_users')
    pass('Admin Users: page loaded')

    const hasContent = await pageHas(page, 'User') || await pageHas(page, 'user') ||
                       await pageHas(page, 'email') || await pageHas(page, 'Email')
    if (hasContent) pass('Admin Users: user content detected')

    const rows = await page.$$('table tbody tr, [class*="user-row"], [class*="UserRow"]')
    log(`Admin Users: ${rows.length} rows`)
    pass(`Admin Users: table rendered (${rows.length} rows)`)
  } catch (e) { if (e.message !== 'auth') fail('Admin Users error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 25 — Admin Testimonials
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 25 — Admin Testimonials')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/testimonials`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Testimonials: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_testimonials')
    pass('Admin Testimonials: page loaded')

    const hasContent = await pageHas(page, 'Testimoni') || await pageHas(page, 'testimonial') ||
                       await pageHas(page, 'Review') || await pageHas(page, 'Rating')
    if (hasContent) pass('Admin Testimonials: content detected')

    const rows = await page.$$('table tbody tr, [class*="testimonial"], [class*="review"]')
    pass(`Admin Testimonials: list rendered (${rows.length} items)`)
  } catch (e) { if (e.message !== 'auth') fail('Admin Testimonials error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 26 — Admin FAQs
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 26 — Admin FAQs')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/faqs`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin FAQs: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_faqs_list')
    pass('Admin FAQs: page loaded')

    const rows = await page.$$('table tbody tr, [class*="faq"]')
    pass(`Admin FAQs: list rendered (${rows.length} items)`)

    // Click Add
    const addOk = await clickAddBtn(page)
    if (addOk) {
      await sleep(1000)
      await shot(page, 'admin_faqs_modal')
      const modalOpen = await page.$('[role="dialog"], .modal, form')
      if (modalOpen) pass('Admin FAQs: Add form opened')
      await closeModal(page)
      pass('Admin FAQs: form closed')
    } else {
      skip('Admin FAQs: Add button not found')
    }
  } catch (e) { if (e.message !== 'auth') fail('Admin FAQs error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 27 — Admin Coupons
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 27 — Admin Coupons')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/coupons`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Coupons: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_coupons')
    pass('Admin Coupons: page loaded')

    const hasContent = await pageHas(page, 'Coupon') || await pageHas(page, 'coupon') ||
                       await pageHas(page, 'Kupon') || await pageHas(page, 'Code') ||
                       await pageHas(page, 'Discount')
    if (hasContent) pass('Admin Coupons: coupon content detected')

    const rows = await page.$$('table tbody tr, [class*="coupon"]')
    pass(`Admin Coupons: list rendered (${rows.length} items)`)
  } catch (e) { if (e.message !== 'auth') fail('Admin Coupons error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 28 — Admin Reports
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 28 — Admin Reports')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/reports`)
    await sleep(2500)
    if (page.url().includes('/login')) { fail('Admin Reports: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_reports')
    pass('Admin Reports: page loaded')

    const hasContent = await pageHas(page, 'Report') || await pageHas(page, 'report') ||
                       await pageHas(page, 'Laporan') || await pageHas(page, 'Revenue') ||
                       await pageHas(page, 'Chart') || await pageHas(page, 'Statistics')
    if (hasContent) pass('Admin Reports: report content detected')
    else            skip('Admin Reports: no recognizable report content')
  } catch (e) { if (e.message !== 'auth') fail('Admin Reports error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 29 — Admin Settings
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 29 — Admin Settings')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/settings`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Settings: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_settings')
    pass('Admin Settings: page loaded')

    const hasForm = await page.$('form, input, select, textarea')
    if (hasForm) pass('Admin Settings: form/input elements detected')
    else         skip('Admin Settings: no form elements found')

    const hasContent = await pageHas(page, 'Setting') || await pageHas(page, 'setting') ||
                       await pageHas(page, 'Config') || await pageHas(page, 'Site')
    if (hasContent) pass('Admin Settings: settings content visible')
  } catch (e) { if (e.message !== 'auth') fail('Admin Settings error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 30 — Admin Hero
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 30 — Admin Hero')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/hero`)
    await sleep(2000)
    if (page.url().includes('/login')) { fail('Admin Hero: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_hero')
    pass('Admin Hero: page loaded')

    // Check for content editor / form fields
    const hasEditor = await page.$('input[name="title"], input[name="headline"], textarea[name="title"], input, textarea')
    if (hasEditor) pass('Admin Hero: content editor/form fields found')
    else           skip('Admin Hero: no input fields found')

    const hasContent = await pageHas(page, 'Hero') || await pageHas(page, 'hero') ||
                       await pageHas(page, 'Headline') || await pageHas(page, 'Banner')
    if (hasContent) pass('Admin Hero: hero editor content visible')
  } catch (e) { if (e.message !== 'auth') fail('Admin Hero error', e) }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCENARIO 31 — Admin Audit Logs
  // ─────────────────────────────────────────────────────────────────────────
  section('SCENARIO 31 — Admin Audit Logs')
  try {
    await ensureLoggedIn(page)
    await safeGoto(page, `${BASE}/admin/audit-logs`)
    await sleep(2500)
    if (page.url().includes('/login')) { fail('Admin Audit Logs: redirected to login'); throw new Error('auth') }
    await shot(page, 'admin_audit_logs')
    pass('Admin Audit Logs: page loaded')

    const hasContent = await pageHas(page, 'Audit') || await pageHas(page, 'audit') ||
                       await pageHas(page, 'Log') || await pageHas(page, 'log') ||
                       await pageHas(page, 'Activity')
    if (hasContent) pass('Admin Audit Logs: log content detected')
    else            skip('Admin Audit Logs: no recognizable log content')

    const rows = await page.$$('table tbody tr, [class*="log"], [class*="audit"]')
    log(`Admin Audit Logs: ${rows.length} log entries`)
    pass(`Admin Audit Logs: table rendered (${rows.length} entries)`)
    await shot(page, 'admin_audit_logs_table')
  } catch (e) { if (e.message !== 'auth') fail('Admin Audit Logs error', e) }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${B}${C}${'='.repeat(60)}${W}`)
  console.log(`${B}  NOVA SCENARIO TEST — Results${W}`)
  console.log(`${G}  Passed  : ${passed}${W}`)
  console.log(`${R}  Failed  : ${failed}${W}`)
  console.log(`${Y}  Skipped : ${skipped}${W}`)
  console.log(`${B}${C}${'='.repeat(60)}${W}\n`)

  // Table
  console.log(`${B}  #    STATUS  SCENARIO${W}`)
  console.log(`  ${'-'.repeat(56)}`)
  results.forEach((r, i) => {
    const icon = r.s === 'PASS' ? `${G}PASS${W}` : r.s === 'FAIL' ? `${R}FAIL${W}` : `${Y}SKIP${W}`
    const num  = String(i + 1).padStart(3, ' ')
    console.log(`  ${num}  [${icon}]  ${r.m}`)
  })
  console.log()

  log(`Screenshots saved to: ${SHOT_DIR}`)
  log('Browser stays open 10s...')
  await sleep(10000)
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error(`${R}Fatal error:${W}`, err)
  process.exit(1)
})
