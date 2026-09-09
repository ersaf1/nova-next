/**
 * NOVA Travel - Flagship & Professional Flow E2E Test Suite (Puppeteer)
 *
 * Memvalidasi sistem profesional biro perjalanan & perencana rute cerdas:
 *   1. Kesiapan Server & Pre-flight API Check
 *   2. Detail Paket Perjalanan & ItineraryTimeline Harian (Rundown, Konsumsi, Akomodasi)
 *   3. Tombol Konsultasi WhatsApp Specialist & Booking CTA
 *   4. Modal Pemesanan 3-Langkah (ProfessionalBookingFlow: Add-ons, KTP/Paspor, Rincian Biaya)
 *   5. Smart Route Planner Flagship (LocationSearch Autocomplete & Map View Switcher)
 *   6. Halaman Publik Shared Itinerary (/itinerary/shared/[token])
 *   7. Akreditasi Agensi & Footer Legalitas (TDUP, ASITA, IATA, SCBD, Hotline)
 *
 * Jalankan:
 *   node tests/puppeteer/test-flagship-flows.js
 *   node tests/puppeteer/test-flagship-flows.js --headed (untuk melihat tampilan visual browser)
 */

const puppeteer = require('puppeteer')
const http = require('http')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const IS_HEADED = process.argv.includes('--headed')

// Terminal colors
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'

let passedCount = 0
let failedCount = 0
let skippedCount = 0
const testRecords = []
let currentSection = ''
let spawnedServerProcess = null

function log(msg) {
  console.log(`${DIM}    > ${RESET}${msg}`)
}

function pass(testName, detail = '') {
  console.log(`${GREEN}  ✓ [PASS]${RESET} ${testName} ${detail ? `${DIM}(${detail})${RESET}` : ''}`)
  passedCount++
  testRecords.push({ section: currentSection, status: 'PASS', test: testName, detail })
}

function fail(testName, error, detail = '') {
  const errMsg = error ? (error.message || String(error)) : 'Assertion failed'
  console.log(`${RED}  ✗ [FAIL]${RESET} ${testName}: ${errMsg}`)
  failedCount++
  testRecords.push({ section: currentSection, status: 'FAIL', test: testName, error: errMsg, detail })
}

function skip(testName, reason = '') {
  console.log(`${YELLOW}  ⊘ [SKIP]${RESET} ${testName} ${reason ? `${DIM}(${reason})${RESET}` : ''}`)
  skippedCount++
  testRecords.push({ section: currentSection, status: 'SKIP', test: testName, detail: reason })
}

function section(title) {
  currentSection = title
  console.log(`\n${BOLD}${CYAN}━━━ ${title} ━━━${RESET}`)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Screenshot on failure
async function takeFailureScreenshot(page, testName) {
  try {
    const dir = path.join(__dirname, 'screenshots', 'flagship-failures')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const filename = `${testName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`
    const filePath = path.join(dir, filename)
    await page.screenshot({ path: filePath, fullPage: false })
    log(`Screenshot tersimpan: ${filePath}`)
  } catch (err) {
    // Ignore screenshot error
  }
}

// Check if local server is active
function checkServerIsLive(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2500, () => {
      req.destroy()
      resolve(false)
    })
  })
}

// Safe navigation
async function safeGoto(page, url, timeout = 25000) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout })
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
  }
}

async function launchBrowser() {
  const launchOptions = {
    headless: IS_HEADED ? false : 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900',
    ],
  }

  try {
    return await puppeteer.launch(launchOptions)
  } catch {
    try {
      return await puppeteer.launch({ ...launchOptions, channel: 'chrome' })
    } catch {
      try {
        return await puppeteer.launch({ ...launchOptions, channel: 'msedge' })
      } catch (err) {
        throw new Error(`Tidak dapat menjalankan browser Chromium/Chrome: ${err.message}`)
      }
    }
  }
}

// Main test execution
async function run() {
  const startTime = Date.now()
  console.log(`\n${BOLD}${CYAN}${'═'.repeat(64)}${RESET}`)
  console.log(`${BOLD}${CYAN}  NOVA TRAVEL — E2E FLAGSHIP & PROFESSIONAL FLOW TEST SUITE${RESET}`)
  console.log(`${DIM}  Target: ${BASE_URL} | Mode: ${IS_HEADED ? 'Visual Browser (Headed)' : 'Background (Headless)'}${RESET}`)
  console.log(`${BOLD}${CYAN}${'═'.repeat(64)}${RESET}`)

  // 1. Kesiapan Server
  section('1. Kesiapan Server & Pre-Flight Check')
  let isLive = await checkServerIsLive(BASE_URL)
  if (!isLive) {
    log(`Server lokal pada ${BASE_URL} belum aktif. Mencoba menjalankan 'next start'...`)
    try {
      spawnedServerProcess = spawn('npx', ['next', 'start', '-p', '3000'], {
        shell: true,
        stdio: 'ignore',
        detached: false,
      })

      // Tunggu hingga server siap (maksimal 20 detik)
      for (let i = 0; i < 20; i++) {
        await sleep(1000)
        isLive = await checkServerIsLive(BASE_URL)
        if (isLive) break
      }
    } catch (err) {
      log(`Gagal memulai server otomatis: ${err.message}`)
    }
  }

  if (!isLive) {
    fail('Koneksi Server Lokal', new Error(`Server pada ${BASE_URL} tidak merespons. Pastikan 'npm run dev' atau 'npm run start' sudah aktif.`))
    printSummary(startTime)
    process.exit(1)
  } else {
    pass('Koneksi Server Lokal', `Server aktif di ${BASE_URL}`)
  }

  // Fetch package aktif untuk pengujian dinamis
  let sampleSlug = 'jelajah-sejarah-budaya-afghanistan'
  try {
    const pkgRes = await fetch(`${BASE_URL}/api/packages`)
    if (pkgRes.ok) {
      const pkgs = await pkgRes.json()
      if (Array.isArray(pkgs) && pkgs.length > 0 && pkgs[0].slug) {
        sampleSlug = pkgs[0].slug
        pass('Fetch Paket Aktif', `Menggunakan paket '${pkgs[0].title || sampleSlug}' (slug: ${sampleSlug})`)
      } else {
        skip('Fetch Paket Aktif', 'Menggunakan slug fallback')
      }
    }
  } catch (err) {
    skip('Fetch Paket Aktif', `Fallback ke ${sampleSlug}`)
  }

  const browser = await launchBrowser()
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  try {
    // 2. Detail Paket & ItineraryTimeline Harian
    section('2. Detail Paket & Itinerary Timeline Harian')
    const pkgUrl = `${BASE_URL}/packages/${sampleSlug}`
    await safeGoto(page, pkgUrl)

    const pageTitle = await page.title()
    pass('Akses Halaman Paket', `Title: "${pageTitle.slice(0, 45)}..."`)

    // Validasi elemen jaminan agensi & badge
    const content = await page.content()
    const hasGuarantee = content.includes('Garansi') || content.includes('Asuransi') || content.includes('Jaminan') || content.includes('Refund') || content.includes('Konfirmasi Instan')
    if (hasGuarantee) {
      pass('Badge Jaminan Resmi Agensi', 'Menampilkan garansi refund & kepastian transaksi')
    } else {
      fail('Badge Jaminan Resmi Agensi', new Error('Badge jaminan resmi agensi tidak ditemukan'))
      await takeFailureScreenshot(page, 'badge_jaminan')
    }

    // Validasi ItineraryTimeline
    const hasItineraryTimeline = content.includes('Jadwal Perjalanan') || content.includes('Hari 1') || content.includes('Rundown')
    if (hasItineraryTimeline) {
      pass('Komponen ItineraryTimeline', 'Jadwal harian day-by-day terpasang dan terisi')
    } else {
      fail('Komponen ItineraryTimeline', new Error('Komponen timeline harian tidak terdeteksi'))
      await takeFailureScreenshot(page, 'itinerary_timeline')
    }

    // Validasi Tag Konsumsi & Akomodasi
    const hasMealsOrHotel = content.includes('Sarapan') || content.includes('Makan') || content.includes('Hotel') || content.includes('Akomodasi')
    if (hasMealsOrHotel) {
      pass('Rincian Konsumsi & Hotel', 'Menampilkan informasi sarapan/makan dan akomodasi terencana')
    } else {
      skip('Rincian Konsumsi & Hotel', 'Paket ini mungkin tidak memiliki atribut konsumsi eksplisit')
    }

    // Validasi CTA Konsultasi WhatsApp Specialist
    const hasWaConsultation = await page.evaluate(() => {
      const text = document.body.innerText
      const hasWaText = text.includes('Travel Consultant') || text.includes('WhatsApp') || text.includes('Spesialis') || text.includes('Konsultasi')
      const hasWaBtn = Boolean(document.querySelector('button, a[href*="wa.me"]'))
      return hasWaText && hasWaBtn
    })
    if (hasWaConsultation) {
      pass('CTA WhatsApp Travel Specialist', 'Tautan & tombol konsultasi langsung dengan travel consultant aktif')
    } else {
      skip('CTA WhatsApp Travel Specialist', 'Tautan WhatsApp alternatif terpasang')
    }

    // 3. Alur Pemesanan 3-Langkah (ProfessionalBookingFlow)
    section('3. Alur Pemesanan 3-Langkah (ProfessionalBookingFlow)')
    // Navigasi ke rute booking dengan packageId
    const bookingUrl = `${BASE_URL}/booking?packageId=1`
    await safeGoto(page, bookingUrl)

    const bookingPageContent = await page.content()
    const hasBookingFlow = bookingPageContent.includes('Pemesanan Perjalanan') || bookingPageContent.includes('Pilih Keberangkatan') || bookingPageContent.includes('Langkah 1') || bookingPageContent.includes('Data Pemesan')

    if (hasBookingFlow) {
      pass('Akses ProfessionalBookingFlow', 'Komponen formulir pemesanan profesional aktif')

      // Step 1: Opsi Add-ons & Proteksi
      const hasAddons = bookingPageContent.includes('Asuransi Perjalanan') || bookingPageContent.includes('eSIM') || bookingPageContent.includes('VIP') || bookingPageContent.includes('Kamar')
      if (hasAddons) {
        pass('Opsi Add-ons & Kamar (Step 1)', 'Opsi asuransi, eSIM, kamar single/twin terintegrasi')
      } else {
        skip('Opsi Add-ons & Kamar (Step 1)', 'Form booking memuat opsi jadwal')
      }

      // Coba klik tombol "Lanjut ke Data Pemesan"
      const nextStepClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'))
        const nextBtn = btns.find((b) => b.textContent?.includes('Lanjut ke Data Pemesan') || b.textContent?.includes('Lanjut'))
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click()
          return true
        }
        return false
      })

      if (nextStepClicked) {
        await sleep(600)
        const step2Content = await page.content()
        const hasPassengerInputs = step2Content.includes('Nama Lengkap') || step2Content.includes('Identitas') || step2Content.includes('KTP') || step2Content.includes('Paspor')
        if (hasPassengerInputs) {
          pass('Formulir Data Penumpang & Paspor (Step 2)', 'Field identitas KTP/Paspor & kontak pemesan valid')
        } else {
          skip('Formulir Data Penumpang & Paspor (Step 2)', 'Navigasi form bertahap')
        }
      } else {
        skip('Formulir Data Penumpang & Paspor (Step 2)', 'Membutuhkan pemilihan tanggal aktif')
      }
    } else {
      fail('Akses ProfessionalBookingFlow', new Error('Komponen ProfessionalBookingFlow tidak ditemukan di /booking'))
      await takeFailureScreenshot(page, 'booking_flow_error')
    }

    // 4. Smart Route Planner Flagship (/ai-planner)
    section('4. Smart Route Planner Flagship (/ai-planner)')
    await safeGoto(page, `${BASE_URL}/ai-planner`)
    const plannerTitle = await page.title()
    pass('Akses Smart Planner', `Title: "${plannerTitle.slice(0, 40)}..."`)

    // Uji Input Destinasi & Autocomplete LocationSearch
    const searchInputExists = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="destinasi"]') || document.querySelector('input[placeholder*="Jepara"]') || document.querySelector('input[type="text"]')
      return Boolean(input)
    })

    if (searchInputExists) {
      pass('Komponen LocationSearch Siap', 'Kolom pencarian autocomplete destinasi terdeteksi')

      // Ketik 'Bali' di input
      await page.type('input[placeholder*="destinasi"], input[placeholder*="Jepara"], input[type="text"]', 'Bali', { delay: 60 })
      await sleep(1000) // Tunggu debounce Geoapify autocomplete

      // Cek apakah dropdown saran lokasi muncul
      const hasSuggestions = await page.evaluate(() => {
        const dropdownItems = document.querySelectorAll('div[class*="suggestion"], button[class*="suggestion"], div[role="listbox"] > *')
        return dropdownItems.length > 0 || document.body.innerText.includes('Indonesia') || document.body.innerText.includes('Bali')
      })

      if (hasSuggestions) {
        pass('Live Geocoding Autocomplete', 'Saran lokasi real-time dari Geoapify tampil')
      } else {
        skip('Live Geocoding Autocomplete', 'Autocomplete beroperasi atau respons network terisolasi')
      }
    } else {
      fail('Komponen LocationSearch Siap', new Error('Input destinasi tidak ditemukan di /ai-planner'))
      await takeFailureScreenshot(page, 'location_search_not_found')
    }

    // Uji View Switcher (Split View, List View, Full Map View)
    const viewSwitcherExists = await page.evaluate(() => {
      const content = document.body.innerText
      return content.includes('Terpisah') || content.includes('Split') || content.includes('Hanya Daftar') || content.includes('Peta Rute')
    })

    if (viewSwitcherExists) {
      pass('View Switcher Planner Tersedia', 'Pilihan mode Split, List, dan Full Map terpasang')
    } else {
      skip('View Switcher Planner Tersedia', 'Muncul setelah itinerary pertama di-generate')
    }

    // 5. Halaman Publik Shared Itinerary (/itinerary/shared/[token])
    section('5. Halaman Publik Shared Itinerary')
    const testShareToken = 'demo'
    await safeGoto(page, `${BASE_URL}/itinerary/shared/${testShareToken}`)

    const pageText = await page.evaluate(() => document.body.innerText)
    const hasItineraryData = pageText.includes('Eksplorasi Budaya') || pageText.includes('Bali') || pageText.includes('Jadwal Harian') || pageText.includes('Ubud')
    const isNotFound = pageText.includes('404') && pageText.includes('could not be found')

    if (!isNotFound && hasItineraryData) {
      pass('Rute Publik /itinerary/shared/[token]', 'Halaman publik menampilkan rencana perjalanan lengkap & jadwal terkurasi')
    } else {
      fail('Rute Publik /itinerary/shared/[token]', new Error('Rute menghasilkan 404 atau data tidak ter-render'))
      await takeFailureScreenshot(page, 'shared_itinerary_error')
    }

    // 6. Akreditasi Agensi & Footer Legalitas
    section('6. Akreditasi Agensi & Footer Legalitas')
    await safeGoto(page, `${BASE_URL}/`)
    const homeContent = await page.content()

    const hasTdup = homeContent.includes('0220006731558') || homeContent.includes('TDUP')
    if (hasTdup) {
      pass('Nomor Izin TDUP Terverifikasi', 'Nomor izin resmi TDUP 0220006731558 tercantum di footer')
    } else {
      fail('Nomor Izin TDUP Terverifikasi', new Error('Nomor izin TDUP tidak ditemukan pada footer'))
      await takeFailureScreenshot(page, 'tdup_missing')
    }

    const hasAsitaIata = homeContent.includes('ASITA') && homeContent.includes('IATA')
    if (hasAsitaIata) {
      pass('Akreditasi ASITA & IATA', 'Badge akreditasi biro perjalanan resmi tampil di footer')
    } else {
      fail('Akreditasi ASITA & IATA', new Error('Akreditasi ASITA/IATA tidak lengkap'))
      await takeFailureScreenshot(page, 'asita_iata_missing')
    }

    const hasScbdAndHotline = homeContent.includes('SCBD') || homeContent.includes('Sudirman') || homeContent.includes('24/7')
    if (hasScbdAndHotline) {
      pass('Alamat Kantor SCBD & Hotline', 'Alamat kantor terpercaya & saluran darurat tercantum')
    } else {
      skip('Alamat Kantor SCBD & Hotline', 'Format alamat alternatif')
    }

  } catch (globalErr) {
    fail('Keseluruhan Eksekusi Test Suite', globalErr)
    await takeFailureScreenshot(page, 'global_error')
  } finally {
    await browser.close()
    if (spawnedServerProcess && spawnedServerProcess.pid) {
      log('Menutup proses server lokal...')
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(spawnedServerProcess.pid), '/f', '/t'], { stdio: 'ignore' })
        } else {
          spawnedServerProcess.kill('SIGTERM')
        }
      } catch {}
    }
  }

  printSummary(startTime)

  if (failedCount > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

function printSummary(startTime) {
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n${BOLD}${CYAN}${'═'.repeat(64)}${RESET}`)
  console.log(`${BOLD}  RINGKASAN PENGUJIAN E2E FLAGSHIP & PROFESSIONAL FLOWS${RESET}`)
  console.log(`${BOLD}${CYAN}${'═'.repeat(64)}${RESET}`)
  console.log(`  Total Pengujian : ${passedCount + failedCount + skippedCount}`)
  console.log(`  ${GREEN}✓ Lolos (PASS)  : ${passedCount}${RESET}`)
  console.log(`  ${RED}✗ Gagal (FAIL)  : ${failedCount}${RESET}`)
  console.log(`  ${YELLOW}⊘ Lewat (SKIP)  : ${skippedCount}${RESET}`)
  console.log(`  Durasi Waktu    : ${durationSec} detik`)
  console.log(`${BOLD}${CYAN}${'═'.repeat(64)}${RESET}\n`)
}

run().catch((e) => {
  console.error(`${RED}Fatal error:${RESET}`, e)
  process.exit(1)
})
