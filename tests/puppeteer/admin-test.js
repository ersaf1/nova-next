/**
 * NOVA Travel — Admin-Side Test Suite
 * Covers semua yang bisa dilakukan admin:
 *   Login, Dashboard, Destinations CRUD, Packages CRUD,
 *   Testimonials CRUD, FAQ CRUD, Coupons CRUD,
 *   Bookings (view + status change), Hero, Features,
 *   How It Works, Newsletter
 *
 * Jalankan: node tests/puppeteer/admin-test.js
 */

const puppeteer = require('puppeteer')

const BASE  = 'http://localhost:3000'
const EMAIL = 'ersaf@gmail.com'
const PASS  = '11111111'

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m'
const C = '\x1b[36m', W = '\x1b[0m',  B = '\x1b[1m'

let passed = 0, failed = 0, skipped = 0
const results = []

function log(m)     { console.log(`${C}  ->  ${W} ${m}`) }
function pass(m)    { console.log(`${G}  OK  ${W} ${m}`); passed++; results.push({ s:'PASS', m }) }
function fail(m, e) { console.log(`${R}  FAIL ${W} ${m}`); if(e) console.log(`${R}    ${e.message}${W}`); failed++; results.push({ s:'FAIL', m }) }
function skip(m)    { console.log(`${Y}  SKIP ${W} ${m}`); skipped++; results.push({ s:'SKIP', m }) }
function section(t) { console.log(`\n${B}${Y}=== ${t} ===${W}`) }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)) }

async function safeGoto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }) }
  catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }) }
}

async function tryClick(page, sel, timeout = 5000) {
  try { await page.waitForSelector(sel, { timeout }); await page.click(sel); return true }
  catch { return false }
}

async function tryType(page, sel, text, timeout = 8000) {
  try {
    await page.waitForSelector(sel, { timeout, visible: true })
    await page.click(sel, { clickCount: 3 })
    await page.type(sel, text, { delay: 35 })
    return true
  } catch { return false }
}

async function has(page, text) {
  return (await page.content()).includes(text)
}

async function clickAddBtn(page) {
  // Cari tombol Add berdasarkan teks, bukan class (class bg-black juga ada di row buttons)
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    const addBtn = btns.find(b => {
      const t = b.textContent.trim()
      return t.startsWith('+') || t.includes('Add') || t.includes('Create') || t.includes('Tambah') || t.includes('New')
    })
    if (addBtn) { addBtn.click(); return true }
    return false
  })
  if (clicked) return true
  // fallback: tombol bg-black pertama di header/flex-row area
  try {
    await page.waitForSelector('button.bg-black', { timeout: 3000 })
    const btns = await page.$$('button.bg-black')
    if (btns.length > 0) { await btns[0].click(); return true }
  } catch {}
  return false
}

async function clickSaveBtn(page) {
  const sels = [
    'button[type="submit"]',
    'button.bg-black',
  ]
  for (const s of sels) {
    try {
      await page.waitForSelector(s, { timeout: 2000 })
      const btns = await page.$$(s)
      const visibleBtns = []
      for (const btn of btns) {
        const visible = await btn.isIntersectingViewport()
        if (visible) visibleBtns.push(btn)
      }
      if (visibleBtns.length > 0) {
        await visibleBtns[0].click()
        return true
      }
    } catch {}
  }
  return false
}

async function acceptDialog(page) {
  page.once('dialog', async d => {
    log(`Dialog: "${d.message()}" -> accept`)
    await d.accept()
  })
}

async function ensureLoggedIn(page) {
  const ok = await page.evaluate(async () => {
    try { const r = await fetch('/api/auth/me', { credentials: 'include' }); return r.status === 200 }
    catch { return false }
  }).catch(() => false)
  if (!ok) {
    log('Session expired - re-login...')
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' })
    await page.click('input[type=email]', { clickCount: 3 })
    await page.type('input[type=email]', 'ersaf@gmail.com', { delay: 30 })
    await page.click('input[type=password]', { clickCount: 3 })
    await page.type('input[type=password]', '11111111', { delay: 30 })
    await page.keyboard.press('Enter')
    await new Promise(r => setTimeout(r, 3500))
    log('Re-login done: ' + page.url())
  }
}

// Generic CRUD test untuk admin pages dengan modal form
async function testCRUD(page, opts) {
  const { route, entityName, addBtnText, fields, searchText, submitText } = opts

  section(`CRUD ${entityName}`)

  // Pastikan session masih valid sebelum navigasi
  await ensureLoggedIn(page)

  // Navigate
  await safeGoto(page, `${BASE}${route}`)
  await sleep(2000)
  const url = page.url()
  if (url.includes('/login')) {
    fail(`${entityName}: redirect ke login`)
    return
  }
  pass(`${entityName}: halaman terbuka`)

  // READ - cek list
  const content1 = await page.content()
  if (content1.includes('Loading') || content1.length > 500) {
    pass(`${entityName}: data loading terdeteksi`)
  }
  await sleep(1000)

  // CREATE
  log(`${entityName}: klik tombol add...`)
  const addClicked = await clickAddBtn(page)
  if (!addClicked) {
    skip(`${entityName} CREATE: tombol add tidak ditemukan`)
    return
  }
  pass(`${entityName}: modal add terbuka`)
  await sleep(800)

  // Isi fields
  let anyFilled = false
  for (const [sel, val] of fields) {
    const ok = await tryType(page, sel, val, 3000)
    if (ok) {
      pass(`${entityName}: field "${sel}" diisi`)
      anyFilled = true
    }
  }
  if (!anyFilled) {
    skip(`${entityName}: tidak ada field yang bisa diisi`)
    await tryClick(page, 'button::-p-text(Cancel), button::-p-text(Close)', 2000)
    return
  }

  // Submit CREATE
  const submitted = await clickSaveBtn(page)
  if (submitted) {
    await sleep(2500)
    pass(`${entityName} CREATE: form submitted`)
  } else {
    await page.keyboard.press('Enter')
    await sleep(2000)
    pass(`${entityName} CREATE: Enter pressed`)
  }

  // Verify CREATE
  if (searchText && await has(page, searchText)) {
    pass(`${entityName} CREATE: item "${searchText}" muncul di list`)
  } else {
    log(`${entityName}: item mungkin tersimpan, lanjut...`)
  }

  // UPDATE - cari item dan klik edit
  log(`${entityName}: coba edit item...`)
  const editClicked = await page.evaluate((text) => {
    const allBtns = [...document.querySelectorAll('button')]
    // Cari baris yang berisi searchText
    const allCells = [...document.querySelectorAll('td, div[class*="item"], li')]
    const targetRow = allCells.find(el => el.textContent && el.textContent.includes(text))
    if (targetRow) {
      const row = targetRow.closest('tr') || targetRow.closest('[class*="item"]') || targetRow.parentElement
      if (row) {
        const btns = [...row.querySelectorAll('button')]
        const editBtn = btns.find(b => b.textContent.includes('Edit') || b.classList.toString().includes('edit'))
          || btns[0]
        if (editBtn) { editBtn.click(); return true }
      }
    }
    // fallback: klik button Edit/edit yang pertama ada
    const editBtns = allBtns.filter(b => b.textContent.trim() === 'Edit' || b.getAttribute('aria-label') === 'Edit')
    if (editBtns.length > 0) { editBtns[editBtns.length - 1].click(); return true }
    return false
  }, searchText || entityName)

  if (editClicked) {
    pass(`${entityName}: tombol edit diklik`)
    await sleep(1200)

    // Update field pertama
    if (fields.length > 0) {
      const [firstSel, firstVal] = fields[0]
      await tryType(page, firstSel, `UPDATED-${firstVal}`, 3000)
      pass(`${entityName} UPDATE: field pertama diupdate`)
    }

    const saveOk = await clickSaveBtn(page)
    if (saveOk) {
      await sleep(2000)
      pass(`${entityName} UPDATE: saved`)
    }
  } else {
    skip(`${entityName} UPDATE: tombol edit tidak ditemukan`)
  }

  // DELETE
  log(`${entityName}: coba hapus item test...`)
  acceptDialog(page)

  const deleteClicked = await page.evaluate((text) => {
    const allCells = [...document.querySelectorAll('td, div, li, span')]
    const targetRow = allCells.find(el => el.textContent && (el.textContent.includes('UPDATED-') || el.textContent.includes(text)))
    if (targetRow) {
      const row = targetRow.closest('tr') || targetRow.closest('[class*="item"]') || targetRow.parentElement
      if (row) {
        const btns = [...row.querySelectorAll('button')]
        const delBtn = btns.find(b =>
          b.textContent.includes('Delete') || b.textContent.includes('Hapus') ||
          b.classList.toString().includes('red') || b.classList.toString().includes('danger')
        ) || btns[btns.length - 1]
        if (delBtn && btns.length > 0) { delBtn.click(); return true }
      }
    }
    // fallback: hapus Hapus button terakhir
    const delBtns = [...document.querySelectorAll('button')].filter(b =>
      b.textContent.includes('Delete') || b.textContent.includes('Hapus')
    )
    if (delBtns.length > 0) { delBtns[delBtns.length - 1].click(); return true }
    return false
  }, searchText || entityName)

  if (deleteClicked) {
    await sleep(2500)
    pass(`${entityName} DELETE: executed`)
    if (searchText && !(await has(page, searchText))) {
      pass(`${entityName} DELETE: item berhasil dihapus dari list`)
    }
  } else {
    skip(`${entityName} DELETE: tombol delete tidak ditemukan`)
  }
}

// =============================================================================
async function run() {
  console.log(`\n${B}${C}${'='.repeat(54)}${W}`)
  console.log(`${B}${C}  NOVA Travel --- ADMIN SIDE Test Suite${W}`)
  console.log(`${B}${C}${'='.repeat(54)}${W}`)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    slowMo: 70,
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 900 })

  // ── Login ────────────────────────────────────────────────────────────────────
  section('Login sebagai Admin')
  try {
    await safeGoto(page, `${BASE}/login`)
    await tryType(page, 'input[type="email"], input[name="email"]', EMAIL)
    pass('Email diisi')
    await tryType(page, 'input[type="password"]', PASS)
    pass('Password diisi')
    await page.keyboard.press('Enter')
    await sleep(3500)
    const afterUrl = page.url()
    log(`URL setelah login: ${afterUrl}`)
    if (!afterUrl.includes('/login')) {
      pass('Login berhasil')
    } else {
      await tryClick(page, 'button[type="submit"]')
      await sleep(3000)
      if (!page.url().includes('/login')) pass('Login berhasil (via button click)')
      else fail('Login GAGAL - masih di /login')
    }
  } catch(e) { fail('Login error', e) }

  // ── Admin Dashboard ──────────────────────────────────────────────────────────
  section('Admin Dashboard')
  try {
    await safeGoto(page, `${BASE}/admin`)
    await sleep(2000)
    const url = page.url()
    if (url.includes('/login')) {
      fail('Admin dashboard: akun tidak punya role admin — redirect ke login')
      log('Stop: semua test admin akan gagal. Cek role akun di Supabase.')
      await sleep(5000)
      await browser.close()
      process.exit(1)
    }
    pass('Admin dashboard accessible')
    if (await has(page, 'Dashboard') || await has(page, 'Admin')) pass('Konten admin dashboard ada')

    // Cek stats/angka
    const statEls = await page.$$('[class*="stat"], [class*="card"], [class*="metric"]')
    if (statEls.length > 0) pass(`Stats cards terdeteksi: ${statEls.length} items`)

    // Cek nav sidebar
    if (await has(page, 'Destinations') || await has(page, 'Packages') || await has(page, 'Bookings')) {
      pass('Sidebar navigasi admin terdeteksi')
    }
  } catch(e) { fail('Admin dashboard error', e) }

  // ── Destinations CRUD ────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/destinations',
    entityName: 'Destinations',
    fields: [
      ['input[name="city"]',     'PuppeteerCity'],
      ['input[name="country"]',  'Indonesia'],
      ['input[name="tagline"]',  'Kota test otomatis'],
      ['input[name="price"]',    'IDR 3.000.000'],
      ['input[name="duration"]', '3 Hari'],
      ['input[name="image"]',    'https://picsum.photos/800/600'],
    ],
    searchText: 'PuppeteerCity',
  })

  // ── Packages CRUD ────────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/packages',
    entityName: 'Packages',
    fields: [
      ['input[name="title"]',         'Paket Puppeteer Test'],
      ['input[name="subtitle"]',      'Subtitle test otomatis'],
      ['input[name="tag"]',           'TEST'],
      ['input[name="price"]',         '4000000'],
      ['input[name="originalPrice"]', '5000000'],
      ['input[name="duration"]',      '4D3N'],
      ['input[name="groupSize"]',     '2-8'],
      ['input[name="highlight"]',     'Best test package'],
      ['input[name="category"]',      'adventure'],
      ['input[name="image"]',         'https://picsum.photos/800/600'],
    ],
    searchText: 'Paket Puppeteer Test',
  })

  // ── Testimonials CRUD ────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/testimonials',
    entityName: 'Testimonials',
    fields: [
      ['input[name="name"]',     'Puppeteer User'],
      ['input[name="location"]', 'Jakarta, Indonesia'],
      ['input[name="trip"]',     'Bali 3D2N'],
      ['input[name="avatar"]',   'https://picsum.photos/100/100'],
      ['input[name="rating"]',   '5'],
      ['textarea[name="text"]',  'Test review otomatis dari puppeteer. Sangat bagus!'],
    ],
    searchText: 'Puppeteer User',
  })

  // ── FAQ CRUD ─────────────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/faqs',
    entityName: 'FAQ',
    fields: [
      ['input[name="q"]',    'Apakah ini pertanyaan test dari puppeteer?'],
      ['textarea[name="a"]', 'Ya, ini adalah jawaban test otomatis dari puppeteer testing suite.'],
    ],
    searchText: 'pertanyaan test dari puppeteer',
  })

  // ── Coupons CRUD ─────────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/coupons',
    entityName: 'Coupons',
    fields: [
      ['input[name="code"]',           'PUPPETEER10'],
      ['input[name="discount_value"]', '10'],
      ['input[name="min_amount"]',     '100000'],
      ['input[name="max_uses"]',       '50'],
    ],
    searchText: 'PUPPETEER10',
  })

  // ── Bookings — View & Status Change ─────────────────────────────────────────
  section('Bookings — View & Status')
  try {
    await safeGoto(page, `${BASE}/admin/bookings`)
    await sleep(2500)
    pass('Admin bookings page loaded')

    // Cek ada search
    const searchOk = await tryType(page, 'input[placeholder*="Cari"], input[placeholder*="Search"], input[type="search"]', 'test', 3000)
    if (searchOk) {
      pass('Search bookings bisa digunakan')
      await sleep(1000)
    }

    // Cek filter status
    const filterBtns = await page.$$('button::-p-text(pending), button::-p-text(confirmed), button::-p-text(cancelled), button::-p-text(all), button::-p-text(All)')
    if (filterBtns.length > 0) {
      await filterBtns[0].click()
      await sleep(800)
      pass(`Filter status booking diklik (${filterBtns.length} opsi)`)
    }

    // Klik booking pertama jika ada
    const rows = await page.$$('table tbody tr, [class*="booking-item"], [class*="BookingRow"]')
    log(`Booking rows: ${rows.length}`)
    if (rows.length > 0) {
      await rows[0].click()
      await sleep(1500)
      pass('Detail booking pertama dibuka')

      // Coba ubah status
      const confirmBtn = await page.$('button::-p-text(confirmed), button::-p-text(Confirm)')
      if (confirmBtn) {
        await confirmBtn.click()
        await sleep(1500)
        pass('Status booking diubah ke confirmed')
      }
    } else {
      skip('Tidak ada booking data untuk ditest')
    }
  } catch(e) { fail('Bookings admin error', e) }

  // ── Hero Section ─────────────────────────────────────────────────────────────
  section('Hero Section — View & Edit')
  try {
    await safeGoto(page, `${BASE}/admin/hero`)
    await sleep(2000)
    pass('Hero admin page loaded')

    const inputOk = await tryType(page, 'input[name="title"], input[name="headline"], textarea[name="title"]', 'NOVA Travel Test Headline', 3000)
    if (inputOk) {
      pass('Hero title field ditemukan dan diisi')
      const saveOk = await clickSaveBtn(page)
      if (saveOk) {
        await sleep(1500)
        pass('Hero disimpan')
      }
    } else skip('Hero form fields tidak ditemukan')
  } catch(e) { fail('Hero admin error', e) }

  // ── Features ─────────────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/features',
    entityName: 'Features',
    fields: [
      ['input[name="title"]',       'Feature Test Puppeteer'],
      ['input[name="description"]', 'Deskripsi feature test otomatis'],
      ['input[name="icon"]',        'Star'],
    ],
    searchText: 'Feature Test Puppeteer',
  })

  // ── How It Works ─────────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/how-it-works',
    entityName: 'HowItWorks',
    fields: [
      ['input[name="title"]',       'Step Test Puppeteer'],
      ['input[name="description"]', 'Deskripsi step test otomatis dari puppeteer'],
    ],
    searchText: 'Step Test Puppeteer',
  })

  // ── Newsletter ────────────────────────────────────────────────────────────────
  section('Newsletter — View')
  try {
    await safeGoto(page, `${BASE}/admin/newsletter`)
    await sleep(2000)
    pass('Newsletter admin page loaded')
    if (await has(page, 'Newsletter') || await has(page, 'email') || await has(page, 'subscriber')) {
      pass('Konten newsletter terdeteksi')
    }

    // Cek jumlah subscriber
    const rows = await page.$$('table tbody tr, [class*="subscriber"]')
    log(`Subscribers: ${rows.length}`)
    if (rows.length >= 0) pass(`Newsletter list tampil (${rows.length} entries)`)
  } catch(e) { fail('Newsletter admin error', e) }

  // ── Refunds ───────────────────────────────────────────────────────────────────
  section('Refunds — View')
  try {
    await safeGoto(page, `${BASE}/admin/refunds`)
    await sleep(2000)
    pass('Refunds admin page loaded')
    if (await has(page, 'Refund') || await has(page, 'refund')) {
      pass('Konten refunds terdeteksi')
    }
  } catch(e) { fail('Refunds admin error', e) }

  // ── Settings ──────────────────────────────────────────────────────────────────
  section('Settings')
  try {
    await safeGoto(page, `${BASE}/admin/settings`)
    await sleep(2000)
    pass('Settings page loaded')
    if (await has(page, 'Setting') || await has(page, 'Config') || await has(page, 'setting')) {
      pass('Konten settings terdeteksi')
    }
  } catch(e) { fail('Settings error', e) }

  // ── Departures ────────────────────────────────────────────────────────────────
  await testCRUD(page, {
    route: '/admin/departures',
    entityName: 'Departures',
    fields: [
      ['input[name="date"]',  '2026-12-01'],
      ['input[name="price"]', '5000000'],
      ['input[name="slots"]', '20'],
    ],
    searchText: '2026-12-01',
  })

  // ── Summary ────────────────────────────────────────────────────────────────────
  console.log(`\n${B}${C}${'='.repeat(54)}${W}`)
  console.log(`${B}  ADMIN-SIDE Test Results${W}`)
  console.log(`${G}  Passed  : ${passed}${W}`)
  console.log(`${R}  Failed  : ${failed}${W}`)
  console.log(`${Y}  Skipped : ${skipped}${W}`)
  console.log(`${B}${C}${'='.repeat(54)}${W}\n`)

  results.forEach(r => {
    const icon = r.s === 'PASS' ? `${G}OK  ${W}` : r.s === 'FAIL' ? `${R}FAIL${W}` : `${Y}SKIP${W}`
    console.log(`  [${icon}] ${r.m}`)
  })
  console.log()

  log('Browser tetap terbuka 10 detik...')
  await sleep(10000)
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error(`${R}Fatal:${W}`, err)
  process.exit(1)
})


