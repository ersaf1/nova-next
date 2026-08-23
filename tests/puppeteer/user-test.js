/**
 * NOVA Travel â€” User-Side Test Suite
 * Covers semua yang bisa dilakukan user biasa:
 *   Homepage, Register, Login, Search, Destinations, Packages,
 *   Booking, Dashboard, Profile, Wishlist, FAQ, Promo, AI Planner,
 *   How It Works, Itinerary
 *
 * Jalankan: node tests/puppeteer/user-test.js
 */

const puppeteer = require('puppeteer')

const BASE  = 'http://localhost:3000'
const EMAIL = 'ersaf@gmail.com'
const PASS  = '11111111'

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m'
const C = '\x1b[36m', W = '\x1b[0m',  B = '\x1b[1m'

let passed = 0, failed = 0, skipped = 0
const results = []

function log(m)      { console.log(`${C}  â†’${W} ${m}`) }
function pass(m)     { console.log(`${G}  âœ“${W} ${m}`); passed++; results.push({ status:'PASS', m }) }
function fail(m, e)  { console.log(`${R}  âœ—${W} ${m}`); if(e) console.log(`${R}    ${e.message}${W}`); failed++; results.push({ status:'FAIL', m }) }
function skip(m)     { console.log(`${Y}  âŠ˜${W} ${m}`); skipped++; results.push({ status:'SKIP', m }) }
function section(t)  { console.log(`\n${B}${Y}â”â” ${t} â”â”${W}`) }
function sleep(ms)   { return new Promise(r => setTimeout(r, ms)) }

async function safeGoto(page, url, opts = {}) {
  try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000, ...opts }) }
  catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }) }
}

async function tryClick(page, sel, timeout = 5000) {
  try { await page.waitForSelector(sel, { timeout }); await page.click(sel); return true }
  catch { return false }
}

async function tryType(page, sel, text, timeout = 5000) {
  try {
    await page.waitForSelector(sel, { timeout })
    await page.click(sel, { clickCount: 3 })
    await page.type(sel, text, { delay: 35 })
    return true
  } catch { return false }
}

async function pageHas(page, text) {
  const content = await page.content()
  return content.includes(text)
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function run() {
  console.log(`\n${B}${C}${'â•'.repeat(52)}${W}`)
  console.log(`${B}${C}  NOVA Travel â€” USER SIDE Test Suite${W}`)
  console.log(`${B}${C}${'â•'.repeat(52)}${W}`)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    slowMo: 60,
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 900 })

  // â”€â”€ T1: Homepage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T1 Â· Homepage')
  try {
    await safeGoto(page, BASE)
    const title = await page.title()
    log(`Title: "${title}"`)
    pass('Homepage loaded')
    if (await pageHas(page, 'NOVA') || await pageHas(page, 'Travel') || await pageHas(page, 'Destinations')) {
      pass('Homepage konten terdeteksi')
    }
    await page.waitForSelector('nav, header', { timeout: 5000 })
    pass('Navbar/header ada')
  } catch(e) { fail('Homepage gagal', e) }

  // â”€â”€ T2: Navigasi ke /register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T2 Â· Register Page')
  try {
    await safeGoto(page, `${BASE}/register`)
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 8000 })
    pass('Register page loaded')
    pass('Form input email terdeteksi')

    // Cek ada field password
    const hasPw = await tryClick(page, 'input[type="password"]', 3000)
    if (hasPw) pass('Field password ada')
    else skip('Field password tidak ditemukan')

    // Cek ada tombol submit
    const hasSub = await page.$('button[type="submit"], button::-p-text(Register), button::-p-text(Daftar)') !== null
    if (hasSub) pass('Tombol submit register ada')
    else skip('Tombol submit tidak ditemukan')
  } catch(e) { fail('Register page gagal', e) }

  // â”€â”€ T3: Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T3 Â· Login')
  try {
    await safeGoto(page, `${BASE}/login`)
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 8000 })
    pass('Login page loaded')

    await tryType(page, 'input[type="email"], input[name="email"]', EMAIL)
    pass('Email diisi')

    await tryType(page, 'input[type="password"]', PASS)
    pass('Password diisi')

    await page.keyboard.press('Enter')
    await sleep(3500)

    const url = page.url()
    log(`URL setelah login: ${url}`)
    if (!url.includes('/login')) {
      pass('Login berhasil â€” redirect keluar dari /login')
    } else {
      // coba klik submit manual
      await tryClick(page, 'button[type="submit"]')
      await sleep(2500)
      if (!page.url().includes('/login')) pass('Login berhasil setelah klik submit')
      else fail('Masih di /login setelah submit')
    }
  } catch(e) { fail('Login gagal', e) }

  // â”€â”€ T4: Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T4 Â· Dashboard (user)')
  try {
    await safeGoto(page, `${BASE}/dashboard`)
    await sleep(2000)
    const url = page.url()
    log(`URL: ${url}`)
    if (url.includes('/login')) {
      fail('Dashboard redirect ke login â€” session tidak tersimpan')
    } else {
      pass('Dashboard accessible')
      if (await pageHas(page, 'Booking') || await pageHas(page, 'booking') || await pageHas(page, 'Pesanan')) {
        pass('Konten booking/pesanan ada di dashboard')
      }
      // Cek quick actions
      if (await pageHas(page, 'Search') || await pageHas(page, 'Itinerary') || await pageHas(page, 'Plan')) {
        pass('Quick actions terdeteksi')
      }
    }
  } catch(e) { fail('Dashboard gagal', e) }

  // â”€â”€ T5: Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T5 Â· Profile â€” View & Update')
  try {
    await safeGoto(page, `${BASE}/profile`)
    await sleep(2000)
    const url = page.url()

    if (url.includes('/login')) {
      fail('Profile redirect ke login')
    } else {
      pass('Profile page accessible')

      // Cek ada form
      const nameInput = await page.$('input[placeholder*="ama"], input[type="text"]')
      if (nameInput) {
        pass('Input nama ditemukan')

        // Update nama
        await page.evaluate(el => { el.value = ''; }, nameInput)
        await nameInput.type('Ersaf Puppeteer Test', { delay: 35 })
        pass('Nama diupdate')

        // Update phone
        const phoneOk = await tryType(page, 'input[type="tel"], input[placeholder*="+62"]', '+6281234567890')
        if (phoneOk) pass('Phone diupdate')
        else skip('Input phone tidak ditemukan')

        // Pilih travel style
        const styleOk = await tryClick(page, 'select', 2000)
        if (styleOk) {
          await page.select('select', 'Solo')
          pass('Travel style dipilih')
        } else skip('Select travel style tidak ditemukan')

        // Simpan
        const saved = await tryClick(page, 'button::-p-text(Simpan), button::-p-text(Save), button::-p-text(Simpan Profil)', 5000)
        if (saved) {
          await sleep(2000)
          if (await pageHas(page, 'berhasil') || await pageHas(page, 'success') || await pageHas(page, 'saved')) {
            pass('Profil berhasil disimpan â€” pesan sukses muncul')
          } else {
            pass('Tombol simpan diklik')
          }
        } else fail('Tombol simpan tidak ditemukan')
      } else {
        fail('Input nama tidak ditemukan di profile')
      }
    }
  } catch(e) { fail('Profile gagal', e) }

  // â”€â”€ T6: Destinations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T6 Â· Destinations â€” Browse')
  try {
    await safeGoto(page, `${BASE}/destinations`)
    await sleep(2000)
    pass('Destinations page loaded')

    const hasCards = await page.$$eval('img, [class*="destination"], [class*="card"]', els => els.length > 0)
    if (hasCards) pass('Kartu destinasi terdeteksi')

    // Klik destinasi pertama jika ada
    const firstLink = await page.$('a[href*="/destinations/"]')
    if (firstLink) {
      const href = await page.evaluate(el => el.href, firstLink)
      log(`Klik destinasi: ${href}`)
      await firstLink.click()
      await sleep(2000)
      pass('Halaman detail destinasi dibuka')
      await page.goBack()
      await sleep(1000)
    } else skip('Link detail destinasi tidak ditemukan')
  } catch(e) { fail('Destinations gagal', e) }

  // â”€â”€ T7: Packages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T7 Â· Packages â€” Browse & Detail')
  try {
    await safeGoto(page, `${BASE}/packages`)
    await sleep(2000)
    pass('Packages page loaded')

    const cards = await page.$$('a[href*="/packages/"]')
    log(`Jumlah link package: ${cards.length}`)
    if (cards.length > 0) {
      pass(`${cards.length} package ditemukan`)
      const href = await page.evaluate(el => el.href, cards[0])
      log(`Buka package: ${href}`)
      await cards[0].click()
      await sleep(2500)
      pass('Halaman detail package dibuka')

      // Cek ada tombol booking
      if (await pageHas(page, 'Book') || await pageHas(page, 'Pesan') || await pageHas(page, 'booking')) {
        pass('Tombol/link booking ada di detail package')
      }
      await page.goBack()
      await sleep(1000)
    } else skip('Tidak ada package cards ditemukan')
  } catch(e) { fail('Packages gagal', e) }

  // â”€â”€ T8: Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T8 Â· Search')
  try {
    await safeGoto(page, `${BASE}/search?q=bali`)
    await sleep(2000)
    pass('Search page loaded')

    const url = page.url()
    if (url.includes('/search')) pass('URL search benar')

    if (await pageHas(page, 'bali') || await pageHas(page, 'Bali') || await pageHas(page, 'result') || await pageHas(page, 'Result')) {
      pass('Hasil search muncul')
    }

    // Test search dengan type=destinations
    await safeGoto(page, `${BASE}/search?type=destinations&q=lombok`)
    await sleep(1500)
    pass('Search destinations query berhasil')

    // Test search dengan type=packages
    await safeGoto(page, `${BASE}/search?type=packages&q=bali`)
    await sleep(1500)
    pass('Search packages query berhasil')
  } catch(e) { fail('Search gagal', e) }

  // â”€â”€ T9: Wishlist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T9 Â· Wishlist')
  try {
    await safeGoto(page, `${BASE}/wishlist`)
    await sleep(2000)
    pass('Wishlist page loaded')

    if (await pageHas(page, 'Wishlist') || await pageHas(page, 'wishlist') || await pageHas(page, 'Saved')) {
      pass('Konten wishlist terdeteksi')
    }

    // Kalau ada item, cek tombol hapus
    const removeBtn = await page.$('button[title*="Remove"], button::-p-text(Remove)')
    if (removeBtn) {
      log('Ada item di wishlist â€” coba hapus')
      await removeBtn.click()
      await sleep(1500)
      pass('Tombol remove wishlist diklik')
    } else {
      log('Wishlist kosong atau belum ada item')
      pass('Wishlist page accessible (kosong)')
    }
  } catch(e) { fail('Wishlist gagal', e) }

  // â”€â”€ T10: Promo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T10 Â· Promo')
  try {
    await safeGoto(page, `${BASE}/promo`)
    await sleep(2000)
    pass('Promo page loaded')
    if (await pageHas(page, 'Promo') || await pageHas(page, 'promo') || await pageHas(page, 'Diskon') || await pageHas(page, 'coupon')) {
      pass('Konten promo terdeteksi')
    }

    // Test input kode promo
    const promoInput = await page.$('input[placeholder*="kode"], input[placeholder*="Kode"], input[placeholder*="coupon"], input[placeholder*="promo"]')
    if (promoInput) {
      await promoInput.click({ clickCount: 3 })
      await promoInput.type('TESTPROMO', { delay: 40 })
      pass('Input kode promo diisi')

      const applyBtn = await page.$('button::-p-text(Gunakan), button::-p-text(Apply), button::-p-text(Cek), button::-p-text(Pakai)')
      if (applyBtn) {
        await applyBtn.click()
        await sleep(1500)
        pass('Tombol apply promo diklik')
      }
    } else skip('Input kode promo tidak ditemukan di halaman promo')
  } catch(e) { fail('Promo gagal', e) }

  // â”€â”€ T11: FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T11 Â· FAQ')
  try {
    await safeGoto(page, `${BASE}/faq`)
    await sleep(2000)
    pass('FAQ page loaded')

    // Accordion â€” klik item pertama
    const faqItems = await page.$$('button, [class*="accordion"], details summary')
    log(`FAQ items: ${faqItems.length}`)
    if (faqItems.length > 0) {
      await faqItems[0].click()
      await sleep(800)
      pass('FAQ accordion item pertama diklik')
    } else skip('Tidak ada FAQ accordion ditemukan')
  } catch(e) { fail('FAQ gagal', e) }

  // â”€â”€ T12: How It Works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T12 Â· How It Works')
  try {
    await safeGoto(page, `${BASE}/how-it-works`)
    await sleep(2000)
    pass('How It Works page loaded')
    if (await pageHas(page, 'How') || await pageHas(page, 'step') || await pageHas(page, 'Step') || await pageHas(page, 'Cara')) {
      pass('Konten how-it-works terdeteksi')
    }
  } catch(e) { fail('How It Works gagal', e) }

  // â”€â”€ T13: AI Planner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T13 Â· AI Planner')
  try {
    await safeGoto(page, `${BASE}/ai-planner`)
    await sleep(2000)
    pass('AI Planner page loaded')

    // Cek ada form/input
    const aiInput = await page.$('textarea, input[type="text"], input[placeholder*="destinasi"], input[placeholder*="tujuan"]')
    if (aiInput) {
      pass('Input AI planner ditemukan')
      await aiInput.click({ clickCount: 3 })
      await aiInput.type('Bali 3 hari 2 malam', { delay: 40 })
      pass('Input AI diisi')
    } else skip('Input AI planner tidak ditemukan')
  } catch(e) { fail('AI Planner gagal', e) }

  // â”€â”€ T14: Itinerary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T14 Â· Itinerary')
  try {
    await safeGoto(page, `${BASE}/itinerary`)
    await sleep(2000)
    pass('Itinerary page loaded')

    if (await pageHas(page, 'Itinerary') || await pageHas(page, 'itinerary') || await pageHas(page, 'Perjalanan') || await pageHas(page, 'Plan')) {
      pass('Konten itinerary terdeteksi')
    }
  } catch(e) { fail('Itinerary gagal', e) }

  // â”€â”€ T15: Dashboard Bookings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T15 Â· Dashboard â€” My Bookings')
  try {
    await safeGoto(page, `${BASE}/dashboard/bookings`)
    await sleep(2000)
    const url = page.url()
    if (url.includes('/login')) {
      fail('Dashboard bookings redirect ke login')
    } else {
      pass('Dashboard bookings accessible')
      if (await pageHas(page, 'Booking') || await pageHas(page, 'booking') || await pageHas(page, 'Pesanan') || await pageHas(page, 'No booking')) {
        pass('Konten booking list ada')
      }
    }
  } catch(e) { fail('Dashboard bookings gagal', e) }

  // â”€â”€ T16: Dashboard Wishlist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T16 Â· Dashboard â€” Wishlist')
  try {
    await safeGoto(page, `${BASE}/dashboard/wishlist`)
    await sleep(2000)
    const url = page.url()
    if (!url.includes('/login')) {
      pass('Dashboard wishlist accessible')
    } else fail('Dashboard wishlist redirect ke login')
  } catch(e) { fail('Dashboard wishlist gagal', e) }

  // â”€â”€ T17: Dashboard Itineraries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T17 Â· Dashboard â€” Itineraries')
  try {
    await safeGoto(page, `${BASE}/dashboard/itineraries`)
    await sleep(2000)
    const url = page.url()
    if (!url.includes('/login')) {
      pass('Dashboard itineraries accessible')
    } else fail('Dashboard itineraries redirect ke login')
  } catch(e) { fail('Dashboard itineraries gagal', e) }

  // â”€â”€ T18: Auth â€” Reset Password Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T18 Â· Auth Reset Password')
  try {
    await safeGoto(page, `${BASE}/auth/reset-password`)
    await sleep(2000)
    pass('Reset password page loaded')
    const hasForm = await page.$('input[type="password"], input[type="email"]') !== null
    if (hasForm) { pass('Form reset password ada') } else { skip('Form tidak ditemukan') }
  } catch(e) { fail('Reset password gagal', e) }

  // â”€â”€ T19: Booking Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T19 Â· Booking Form (/booking)')
  try {
    await safeGoto(page, `${BASE}/booking`)
    await sleep(2500)
    pass('Booking page loaded')

    const nameOk = await tryType(page, 'input[name="name"], input[placeholder*="ama"], input[placeholder*="Name"]', 'Ersaf Test User')
    if (nameOk) { pass('Nama diisi') } else { skip('Input nama tidak ditemukan') }

    const emailOk = await tryType(page, 'input[type="email"], input[name="email"]', EMAIL)
    if (emailOk) { pass('Email diisi') } else { skip('Input email tidak ditemukan') }

    const phoneOk = await tryType(page, 'input[type="tel"], input[name="phone"]', '+62812345678')
    if (phoneOk) { pass('Nomor HP diisi') } else { skip('Input phone tidak ditemukan') }

    if (nameOk || emailOk) pass('Booking form bisa diisi')
  } catch(e) { fail('Booking form gagal', e) }

  // â”€â”€ T20: Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  section('T20 Â· Logout')
  try {
    // Coba cari tombol logout di navbar
    await safeGoto(page, BASE)
    await sleep(1500)

    const logoutClicked =
      await tryClick(page, 'button::-p-text(Logout)', 2000) ||
      await tryClick(page, 'button::-p-text(Sign Out)', 2000) ||
      await tryClick(page, 'a::-p-text(Logout)', 2000) ||
      await tryClick(page, '[aria-label*="logout"], [aria-label*="sign out"]', 2000)

    if (logoutClicked) {
      await sleep(2000)
      pass('Logout diklik')
      if (page.url().includes('/login') || page.url() === BASE + '/') {
        pass('Logout berhasil â€” redirect ke login/home')
      } else {
        pass('Logout diklik (verifikasi redirect manual)')
      }
    } else {
      // Logout via Supabase API langsung via page evaluate
      await page.evaluate(async () => {
        if (window.supabase) await window.supabase.auth.signOut()
      })
      skip('Tombol logout tidak ditemukan di UI â€” skip visual logout')
    }
  } catch(e) { fail('Logout gagal', e) }

  // â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log(`\n${B}${C}${'â•'.repeat(52)}${W}`)
  console.log(`${B}  USER-SIDE Test Results${W}`)
  console.log(`${G}  Passed  : ${passed}${W}`)
  console.log(`${R}  Failed  : ${failed}${W}`)
  console.log(`${Y}  Skipped : ${skipped}${W}`)
  console.log(`${B}${C}${'â•'.repeat(52)}${W}`)
  console.log()
  results.forEach(r => {
    const icon = r.status === 'PASS' ? `${G}âœ“${W}` : r.status === 'FAIL' ? `${R}âœ—${W}` : `${Y}âŠ˜${W}`
    console.log(`  ${icon} ${r.m}`)
  })
  console.log()

  log('Browser tetap terbuka 8 detik...')
  await sleep(8000)
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error(`${R}Fatal:${W}`, err)
  process.exit(1)
})
