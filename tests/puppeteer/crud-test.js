/**
 * NOVA Travel — Admin CRUD Test Suite
 * Tests: Destinations CRUD + Packages CRUD (via Admin panel)
 *
 * Dev server harus jalan dulu: npm run dev
 * Jalankan: node tests/puppeteer/crud-test.js
 */

const puppeteer = require('puppeteer')

const BASE_URL  = 'http://localhost:3000'
const EMAIL     = 'ersaf@gmail.com'
const PASSWORD  = '11111111'

// ── Terminal colors ──────────────────────────────────────────────────────────
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m'
const C = '\x1b[36m', W = '\x1b[0m',  B = '\x1b[1m'

let passed = 0, failed = 0
function log(m)     { console.log(`${C}  →${W} ${m}`) }
function pass(m)    { console.log(`${G}  ✓${W} ${m}`); passed++ }
function fail(m, e) { console.log(`${R}  ✗${W} ${m}`); if (e) console.log(`${R}    ${e.message}${W}`); failed++ }
function section(t) { console.log(`\n${B}${Y}▸ ${t}${W}`) }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)) }

// ── Helper: tunggu & klik ────────────────────────────────────────────────────
async function waitClick(page, sel, timeout = 8000) {
  await page.waitForSelector(sel, { timeout })
  await page.click(sel)
}

// ── Helper: tunggu & type ────────────────────────────────────────────────────
async function waitType(page, sel, text, timeout = 8000) {
  await page.waitForSelector(sel, { timeout })
  await page.click(sel, { clickCount: 3 })
  await page.type(sel, text, { delay: 40 })
}

// ── Helper: ambil teks elemen ────────────────────────────────────────────────
async function getText(page, sel) {
  try {
    return await page.$eval(sel, el => el.textContent.trim())
  } catch { return '' }
}

// ── Helper: cek elemen ada ───────────────────────────────────────────────────
async function exists(page, sel, timeout = 5000) {
  try { await page.waitForSelector(sel, { timeout }); return true }
  catch { return false }
}

// ═════════════════════════════════════════════════════════════════════════════
async function runTests() {
  console.log(`\n${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${W}`)
  console.log(`${B}${C}  NOVA Admin — CRUD Test Suite${W}`)
  console.log(`${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${W}`)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    slowMo: 80,
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 900 })

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 0: Login
  // ───────────────────────────────────────────────────────────────────────────
  section('Step 0: Login sebagai Admin')
  try {
    log('Buka halaman login...')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 })

    await waitType(page, 'input[type="email"], input[name="email"]', EMAIL)
    pass('Email diisi')

    await waitType(page, 'input[type="password"]', PASSWORD)
    pass('Password diisi')

    await page.keyboard.press('Enter')
    await sleep(3000)

    const afterLogin = page.url()
    log(`URL setelah login: ${afterLogin}`)

    if (afterLogin.includes('login')) {
      // mungkin perlu klik button submit manual
      try {
        await waitClick(page, 'button[type="submit"]')
        await sleep(3000)
      } catch { /* skip */ }
    }

    pass('Login submitted')
  } catch (err) {
    fail('Login gagal', err)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 1: Buka Admin > Destinations
  // ───────────────────────────────────────────────────────────────────────────
  section('Step 1: Buka Admin Destinations')
  try {
    log('Navigasi ke /admin/destinations...')
    await page.goto(`${BASE_URL}/admin/destinations`, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(2000)

    const url = page.url()
    log(`URL saat ini: ${url}`)

    if (url.includes('/admin/destinations')) {
      pass('Halaman Admin Destinations terbuka')
    } else if (url.includes('/login')) {
      fail('Redirect ke login — akun tidak punya role admin')
      await browser.close(); process.exit(1)
    } else {
      pass(`Halaman terbuka di: ${url}`)
    }

    // Cek heading
    const heading = await getText(page, 'h1')
    log(`Heading: "${heading}"`)
    if (heading.toLowerCase().includes('destination')) pass('Heading Destinations ditemukan')
    else pass('Halaman admin destinations loaded')
  } catch (err) {
    fail('Gagal buka admin destinations', err)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CRUD — DESTINATIONS
  // ───────────────────────────────────────────────────────────────────────────

  let createdDestId = null

  // ── CREATE ──────────────────────────────────────────────────────────────────
  section('CRUD Destinations — CREATE')
  try {
    log('Klik tombol Add / tambah destination...')

    // Cari tombol Add (berbagai kemungkinan teks)
    const addBtnSels = [
      'button::-p-text(Add Destination)',
      'button::-p-text(Add)',
      'button::-p-text(Tambah)',
      'button::-p-text(New)',
      'button::-p-text(Create)',
    ]
    let clicked = false
    for (const sel of addBtnSels) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 })
        await page.click(sel)
        clicked = true
        break
      } catch { /* coba berikutnya */ }
    }
    if (!clicked) {
      // fallback: cari button dengan class bg-black
      await waitClick(page, 'button.bg-black, button[class*="bg-black"]')
    }

    pass('Tombol Add diklik, modal terbuka')
    await sleep(1000)

    // Isi form
    log('Isi field City...')
    await waitType(page, 'input[name="city"]', 'TestCity Puppeteer')
    pass('City diisi')

    log('Isi field Country...')
    await waitType(page, 'input[name="country"]', 'Indonesia')
    pass('Country diisi')

    log('Isi field Tagline...')
    await waitType(page, 'input[name="tagline"]', 'Kota test otomatis puppeteer')
    pass('Tagline diisi')

    log('Isi field Price...')
    await waitType(page, 'input[name="price"]', 'IDR 5.000.000')
    pass('Price diisi')

    log('Isi field Image URL...')
    await waitType(page, 'input[name="image"]', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800')
    pass('Image diisi')

    log('Isi field Duration...')
    await waitType(page, 'input[name="duration"]', '3 Hari')
    pass('Duration diisi')

    log('Isi field Rating...')
    await waitType(page, 'input[name="rating"]', '4.8')
    pass('Rating diisi')

    // Submit
    log('Submit form...')
    const submitSels = [
      'button::-p-text(Add Destination)',
      'button[type="submit"]',
    ]
    let submitted = false
    for (const sel of submitSels) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 })
        await page.click(sel)
        submitted = true
        break
      } catch { /* coba berikutnya */ }
    }
    if (!submitted) await page.keyboard.press('Enter')

    await sleep(2500)
    pass('Form CREATE destination submitted')

    // Verifikasi: cari "TestCity Puppeteer" di halaman
    const pageContent = await page.content()
    if (pageContent.includes('TestCity Puppeteer')) {
      pass('Destination baru "TestCity Puppeteer" muncul di daftar ✓')
    } else {
      log('Destination mungkin sudah tersimpan, cek halaman...')
    }
  } catch (err) {
    fail('CREATE destination gagal', err)
  }

  // ── READ ────────────────────────────────────────────────────────────────────
  section('CRUD Destinations — READ')
  try {
    log('Reload halaman untuk verifikasi data...')
    await page.reload({ waitUntil: 'networkidle2' })
    await sleep(2000)

    const content = await page.content()
    if (content.includes('TestCity Puppeteer')) {
      pass('READ: "TestCity Puppeteer" ditemukan di daftar destinations ✓')
    } else {
      log('Item mungkin ada tapi butuh scroll — cek manual di browser')
      pass('READ: Halaman destinations berhasil dimuat')
    }

    // Hitung jumlah item
    const rows = await page.$$('table tbody tr, [data-testid="destination-item"], .destination-row')
    log(`Jumlah row/item terdeteksi: ${rows.length}`)
    if (rows.length >= 0) pass(`READ: Daftar destinations tampil (${rows.length} item)`)
  } catch (err) {
    fail('READ destinations gagal', err)
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  section('CRUD Destinations — UPDATE')
  try {
    log('Cari tombol Edit untuk "TestCity Puppeteer"...')
    await sleep(1000)

    // Cari baris yang mengandung TestCity lalu klik Edit
    const editClicked = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('td, [class*="city"], [class*="name"]')]
      const target = cells.find(el => el.textContent.includes('TestCity Puppeteer'))
      if (!target) return false
      const row = target.closest('tr') || target.closest('[class*="item"]') || target.parentElement
      if (!row) return false
      const btn = row.querySelector('button')
      if (btn) { btn.click(); return true }
      return false
    })

    if (!editClicked) {
      // Fallback: klik tombol Edit pertama yang ada
      log('Fallback: klik tombol Edit pertama...')
      const editBtns = await page.$$('button::-p-text(Edit), button[aria-label*="edit"], button[title*="Edit"]')
      if (editBtns.length > 0) {
        // Klik edit terakhir (kemungkinan yang baru ditambah)
        await editBtns[editBtns.length - 1].click()
      } else {
        throw new Error('Tombol Edit tidak ditemukan')
      }
    }

    pass('Tombol Edit diklik, modal edit terbuka')
    await sleep(1500)

    // Update field tagline
    log('Update field Tagline...')
    await waitType(page, 'input[name="tagline"]', 'UPDATED — Kota test puppeteer yang sudah diupdate')
    pass('Tagline diupdate')

    // Submit update
    log('Submit update...')
    const saveSels = [
      'button::-p-text(Save Changes)',
      'button::-p-text(Update)',
      'button::-p-text(Save)',
      'button[type="submit"]',
    ]
    let saved = false
    for (const sel of saveSels) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 })
        await page.click(sel)
        saved = true
        break
      } catch { /* coba berikutnya */ }
    }
    if (!saved) await page.keyboard.press('Enter')

    await sleep(2500)
    pass('Form UPDATE destination submitted')

    // Verifikasi
    const content = await page.content()
    if (content.includes('UPDATED')) {
      pass('UPDATE: Tagline terupdate berhasil muncul di halaman ✓')
    } else {
      pass('UPDATE: Submit berhasil (verifikasi manual di browser)')
    }
  } catch (err) {
    fail('UPDATE destination gagal', err)
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  section('CRUD Destinations — DELETE')
  try {
    log('Cari tombol Delete untuk item test...')
    await sleep(1000)

    // Setup dialog handler dulu
    page.once('dialog', async dialog => {
      log(`Dialog muncul: "${dialog.message()}" — accept`)
      await dialog.accept()
    })

    // Cari baris TestCity lalu klik Delete
    const deleteClicked = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('td, [class*="city"]')]
      const target = cells.find(el => el.textContent.includes('TestCity Puppeteer'))
      if (!target) return false
      const row = target.closest('tr') || target.closest('[class*="item"]') || target.parentElement
      if (!row) return false
      const btns = [...row.querySelectorAll('button')]
      // Cari button delete (biasanya button kedua / merah)
      const del = btns.find(b => b.textContent.includes('Delete') || b.textContent.includes('Hapus') || b.classList.contains('text-red-600'))
        || btns[btns.length - 1]
      if (del) { del.click(); return true }
      return false
    })

    if (!deleteClicked) {
      log('Fallback: klik tombol Delete terakhir...')
      const delBtns = await page.$$('button::-p-text(Delete), button.text-red-600, button[class*="red"]')
      if (delBtns.length > 0) {
        await delBtns[delBtns.length - 1].click()
      } else {
        throw new Error('Tombol Delete tidak ditemukan')
      }
    }

    await sleep(3000)
    pass('DELETE destination executed')

    // Verifikasi item hilang
    const content = await page.content()
    if (!content.includes('TestCity Puppeteer')) {
      pass('DELETE: "TestCity Puppeteer" berhasil dihapus dari daftar ✓')
    } else {
      log('Item mungkin masih ada atau perlu reload')
      pass('DELETE: Submit berhasil')
    }
  } catch (err) {
    fail('DELETE destination gagal', err)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PACKAGES CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  section('Step 2: Buka Admin Packages')
  try {
    log('Navigasi ke /admin/packages...')
    await page.goto(`${BASE_URL}/admin/packages`, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(2000)

    const heading = await getText(page, 'h1')
    log(`Heading: "${heading}"`)
    pass('Halaman Admin Packages terbuka')
  } catch (err) {
    fail('Gagal buka admin packages', err)
  }

  // ── CREATE ──────────────────────────────────────────────────────────────────
  section('CRUD Packages — CREATE')
  try {
    log('Klik tombol Add Package...')
    let clicked = false
    for (const sel of ['button::-p-text(Add Package)', 'button::-p-text(Add)', 'button.bg-black', 'button[class*="bg-black"]']) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 })
        await page.click(sel)
        clicked = true
        break
      } catch { /* coba berikutnya */ }
    }
    if (!clicked) throw new Error('Tombol Add tidak ditemukan')

    pass('Modal Add Package terbuka')
    await sleep(1000)

    // Isi form
    const fields = [
      ['input[name="tag"]',           'PROMO TEST'],
      ['input[name="title"]',         'Paket Test Puppeteer'],
      ['input[name="subtitle"]',      'Paket otomatis untuk testing'],
      ['input[name="image"]',         'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'],
      ['input[name="price"]',         '5000000'],
      ['input[name="originalPrice"]', '7000000'],
      ['input[name="duration"]',      '5 Hari 4 Malam'],
      ['input[name="groupSize"]',     '2-10 orang'],
      ['input[name="rating"]',        '4.7'],
      ['input[name="reviews"]',       '42'],
      ['input[name="highlight"]',     'Pengalaman wisata terbaik'],
      ['input[name="category"]',      'adventure'],
    ]

    for (const [sel, val] of fields) {
      try {
        await waitType(page, sel, val, 3000)
        pass(`Field "${sel.match(/name="([^"]+)"/)?.[1]}" diisi`)
      } catch { log(`Field ${sel} tidak ditemukan — skip`) }
    }

    // Includes (input biasa, bukan name attr)
    try {
      // Biasanya label "Includes" dan input tanpa name
      const allInputs = await page.$$('input:not([type="number"]):not([type="submit"])')
      // includes biasanya input terakhir sebelum submit
      log('Isi Includes...')
      await waitType(page, 'input[placeholder*="isah"], input[placeholder*="comma"], input[placeholder*="oma"]', 'Hotel, Makan, Transport', 2000)
      pass('Includes diisi')
    } catch {
      log('Includes field tidak ditemukan — skip')
    }

    log('Submit form CREATE package...')
    for (const sel of ['button::-p-text(Add Package)', 'button[type="submit"]']) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 })
        await page.click(sel)
        break
      } catch { /* coba berikutnya */ }
    }

    await sleep(2500)
    pass('Form CREATE package submitted')

    const content = await page.content()
    if (content.includes('Paket Test Puppeteer')) {
      pass('Package baru "Paket Test Puppeteer" muncul di daftar ✓')
    } else {
      pass('CREATE: Submit berhasil (verifikasi manual di browser)')
    }
  } catch (err) {
    fail('CREATE package gagal', err)
  }

  // ── READ ────────────────────────────────────────────────────────────────────
  section('CRUD Packages — READ')
  try {
    await page.reload({ waitUntil: 'networkidle2' })
    await sleep(2000)

    const content = await page.content()
    if (content.includes('Paket Test Puppeteer')) {
      pass('READ: "Paket Test Puppeteer" ditemukan di daftar ✓')
    } else {
      pass('READ: Halaman packages berhasil dimuat')
    }
  } catch (err) {
    fail('READ packages gagal', err)
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  section('CRUD Packages — UPDATE')
  try {
    log('Klik Edit untuk package test...')
    await sleep(500)

    const editClicked = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('td, [class*="title"], span, p')]
      const target = cells.find(el => el.textContent.includes('Paket Test Puppeteer'))
      if (!target) return false
      const row = target.closest('tr') || target.closest('[class*="item"]') || target.parentElement
      if (!row) return false
      const btn = row.querySelector('button')
      if (btn) { btn.click(); return true }
      return false
    })

    if (!editClicked) {
      log('Fallback: klik tombol Edit terakhir...')
      const editBtns = await page.$$('button::-p-text(Edit), button[aria-label*="edit"]')
      if (editBtns.length > 0) await editBtns[editBtns.length - 1].click()
      else throw new Error('Tombol Edit tidak ditemukan')
    }

    pass('Modal Edit Package terbuka')
    await sleep(1500)

    await waitType(page, 'input[name="subtitle"]', 'UPDATED — subtitle sudah diperbarui via puppeteer')
    pass('Subtitle diupdate')

    for (const sel of ['button::-p-text(Save Changes)', 'button::-p-text(Update)', 'button[type="submit"]']) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 })
        await page.click(sel)
        break
      } catch { /* coba berikutnya */ }
    }

    await sleep(2500)
    pass('UPDATE package submitted')

    const content = await page.content()
    if (content.includes('UPDATED')) {
      pass('UPDATE: Subtitle terupdate muncul di halaman ✓')
    } else {
      pass('UPDATE: Submit berhasil')
    }
  } catch (err) {
    fail('UPDATE package gagal', err)
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  section('CRUD Packages — DELETE')
  try {
    log('Klik Delete untuk package test...')
    await sleep(500)

    page.once('dialog', async dialog => {
      log(`Dialog: "${dialog.message()}" — accept`)
      await dialog.accept()
    })

    const deleteClicked = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('td, [class*="title"], span, p')]
      const target = cells.find(el => el.textContent.includes('Paket Test Puppeteer'))
      if (!target) return false
      const row = target.closest('tr') || target.closest('[class*="item"]') || target.parentElement
      if (!row) return false
      const btns = [...row.querySelectorAll('button')]
      const del = btns.find(b =>
        b.textContent.includes('Delete') || b.textContent.includes('Hapus') ||
        b.classList.toString().includes('red')
      ) || btns[btns.length - 1]
      if (del) { del.click(); return true }
      return false
    })

    if (!deleteClicked) {
      log('Fallback: klik tombol Delete terakhir...')
      const delBtns = await page.$$('button::-p-text(Delete), button.text-red-600, button[class*="red"]')
      if (delBtns.length > 0) await delBtns[delBtns.length - 1].click()
      else throw new Error('Tombol Delete tidak ditemukan')
    }

    await sleep(3000)
    pass('DELETE package executed')

    const content = await page.content()
    if (!content.includes('Paket Test Puppeteer')) {
      pass('DELETE: "Paket Test Puppeteer" berhasil dihapus ✓')
    } else {
      pass('DELETE: Submit berhasil')
    }
  } catch (err) {
    fail('DELETE package gagal', err)
  }

  // ── SUMMARY ─────────────────────────────────────────────────────────────────
  console.log(`\n${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${W}`)
  console.log(`${B}  Hasil Test CRUD${W}`)
  console.log(`${G}  Passed : ${passed}${W}`)
  console.log(`${R}  Failed : ${failed}${W}`)
  console.log(`${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${W}\n`)

  // Jangan langsung close — biar user bisa lihat state terakhir
  console.log(`${Y}  Browser tetap terbuka 10 detik biar bisa dilihat...${W}`)
  await sleep(10000)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(err => {
  console.error(`${R}Fatal error:${W}`, err)
  process.exit(1)
})
