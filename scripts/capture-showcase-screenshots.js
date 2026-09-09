/**
 * Script Otomatis: Capture Showcase Screenshots
 * Mengambil screenshot aktual untuk seluruh halaman (Public, User Dashboard, Admin Portal)
 * Aturan: Scroll ke bawah -> tunggu 1 detik -> scroll ke atas -> tunggu 500ms -> screenshot
 */
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE = 'http://localhost:3000'
const USER_EMAIL = 'user@novatravel.com'
const USER_PASS = 'UserPassword123!'
const ADMIN_EMAIL = 'admin@novatravel.com'
const ADMIN_PASS = 'AdminPassword123!'

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'docs', 'screenshots')
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const ROUTES = [
  // A. Public & Discovery
  { slug: 'home', path: '/', role: 'public', name: 'Homepage & Hero Showcase' },
  { slug: 'packages', path: '/packages', role: 'public', name: 'Katalog Paket Wisata' },
  { slug: 'package-detail', path: '/packages/paris-french-riviera', role: 'public', name: 'Detail Paket Wisata' },
  { slug: 'destinations', path: '/destinations', role: 'public', name: 'Eksplorasi Destinasi Dunia' },
  { slug: 'destination-detail', path: '/destinations/2', role: 'public', name: 'Detail Destinasi Kota / Negara' },
  { slug: 'search', path: '/search', role: 'public', name: 'Pencarian Global' },
  { slug: 'promo', path: '/promo', role: 'public', name: 'Penawaran & Promo Spesial' },
  { slug: 'how-it-works', path: '/how-it-works', role: 'public', name: 'Cara Pemesanan & Alur' },
  { slug: 'faq', path: '/faq', role: 'public', name: 'Pusat Bantuan & FAQ' },
  { slug: 'reviews', path: '/reviews', role: 'public', name: 'Ulasan & Testimonial Tamu' },
  { slug: 'ai-planner', path: '/ai-planner', role: 'public', name: 'AI Travel Itinerary Planner' },
  { slug: 'itinerary', path: '/itinerary', role: 'public', name: 'Perencana Rencana Perjalanan' },

  // B. Authentication & Account
  { slug: 'login', path: '/login', role: 'public', name: 'Masuk Akun (Sign In)' },
  { slug: 'register', path: '/register', role: 'public', name: 'Daftar Akun Baru (Sign Up)' },
  { slug: 'reset-password', path: '/auth/reset-password', role: 'public', name: 'Atur Ulang Kata Sandi' },
  { slug: 'profile', path: '/profile', role: 'user', name: 'Profil & Preferensi Pengguna' },
  { slug: 'wishlist', path: '/wishlist', role: 'user', name: 'Wishlist & Paket Impian' },

  // C. Booking & Transaction
  { slug: 'booking-flow', path: '/booking/131/2171', role: 'user', name: 'Formulir Pemesanan & Data Tamu' },
  { slug: 'payment', path: '/payment/1', role: 'user', name: 'Gerbang Pembayaran & Invoice' },
  { slug: 'payment-confirmation', path: '/payment/confirmation/1', role: 'user', name: 'Konfirmasi Pembayaran Sukses' },

  // D. User Dashboard
  { slug: 'dashboard', path: '/dashboard', role: 'user', name: 'Ringkasan Dashboard Pengguna' },
  { slug: 'dashboard-bookings', path: '/dashboard/bookings', role: 'user', name: 'Riwayat Pesanan Saya' },
  { slug: 'dashboard-booking-detail', path: '/dashboard/bookings/1', role: 'user', name: 'Detail Tiket & Invoice Pesanan' },
  { slug: 'dashboard-itineraries', path: '/dashboard/itineraries', role: 'user', name: 'Itinerary Tersimpan' },
  { slug: 'dashboard-wishlist', path: '/dashboard/wishlist', role: 'user', name: 'Favorit Dashboard' },
  { slug: 'dashboard-notifications', path: '/dashboard/notifications', role: 'user', name: 'Pusat Pemberitahuan' },

  // E. Admin Portal
  { slug: 'admin-dashboard', path: '/admin', role: 'admin', name: 'Ringkasan Metrik Admin Portal' },
  { slug: 'admin-packages', path: '/admin/packages', role: 'admin', name: 'Manajemen Paket Wisata' },
  { slug: 'admin-destinations', path: '/admin/destinations', role: 'admin', name: 'Manajemen Destinasi' },
  { slug: 'admin-departures', path: '/admin/departures', role: 'admin', name: 'Jadwal Keberangkatan Tour' },
  { slug: 'admin-bookings', path: '/admin/bookings', role: 'admin', name: 'Manajemen Seluruh Transaksi' },
  { slug: 'admin-coupons', path: '/admin/coupons', role: 'admin', name: 'Kupon Diskon & Voucher' },
  { slug: 'admin-refunds', path: '/admin/refunds', role: 'admin', name: 'Manajemen Pengembalian Dana' },
  { slug: 'admin-users', path: '/admin/users', role: 'admin', name: 'Manajemen Hak Akses & User' },
  { slug: 'admin-audit-logs', path: '/admin/audit-logs', role: 'admin', name: 'Log Keamanan & Audit Jejak' },
  { slug: 'admin-reports', path: '/admin/reports', role: 'admin', name: 'Laporan Finansial & Unduh PDF' },
  { slug: 'admin-hero', path: '/admin/hero', role: 'admin', name: 'Pengaturan Hero & Banner CMS' },
  { slug: 'admin-settings', path: '/admin/settings', role: 'admin', name: 'Konfigurasi Sistem Global' },
  { slug: 'admin-faqs', path: '/admin/faqs', role: 'admin', name: 'Manajemen Konten FAQ' },
  { slug: 'admin-testimonials', path: '/admin/testimonials', role: 'admin', name: 'Manajemen Testimoni' },
  { slug: 'admin-newsletter', path: '/admin/newsletter', role: 'admin', name: 'Daftar Berlangganan Newsletter' },
]

async function captureRoute(page, item) {
  const url = `${BASE}${item.path}`
  const destPath = path.join(OUTPUT_DIR, `${item.slug}.png`)
  console.log(`\n📸 [${item.role.toUpperCase()}] Mengambil: ${item.name}`)
  console.log(`   URL: ${url}`)

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
  } catch {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
    } catch (e) {
      console.warn(`   ⚠️ Warning saat navigasi: ${e.message}`)
    }
  }

  // Scroll ke bawah secara halus agar semua lazy-load dan animasi GSAP selesai
  try {
    await page.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
      await new Promise((r) => setTimeout(r, 600))
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      await new Promise((r) => setTimeout(r, 600))
    })
  } catch {}

  // Jeda 1 detik sesuai permintaan user
  await sleep(1000)

  // Scroll kembali ke atas agar tampilan clean
  try {
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  } catch {}

  // Berhenti sejenak sebelum mengambil screenshot
  await sleep(600)

  await page.screenshot({
    path: destPath,
    fullPage: false,
  })

  console.log(`   ✅ Tersimpan: public/docs/screenshots/${item.slug}.png`)
}

async function run() {
  console.log('🚀 Memulai Perekaman Screenshot Otomatis untuk Dokumentasi...')
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  })

  const page = await browser.newPage()

  // 1. PUBLIC ROUTES
  const publicRoutes = ROUTES.filter((r) => r.role === 'public')
  console.log(`\n--- FASE 1: PUBLIC PAGES (${publicRoutes.length} halaman) ---`)
  for (const r of publicRoutes) {
    await captureRoute(page, r)
  }

  // 2. USER ROUTES (Login as user)
  const userRoutes = ROUTES.filter((r) => r.role === 'user')
  console.log(`\n--- FASE 2: USER PAGES (${userRoutes.length} halaman) ---`)
  console.log(`🔐 Login sebagai Pengguna: ${USER_EMAIL}`)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  await page.type('input[type="email"]', USER_EMAIL, { delay: 20 })
  await page.type('input[type="password"]', USER_PASS, { delay: 20 })
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
  ])
  await sleep(1500)

  for (const r of userRoutes) {
    await captureRoute(page, r)
  }

  // 3. ADMIN ROUTES (Login as admin)
  const adminRoutes = ROUTES.filter((r) => r.role === 'admin')
  console.log(`\n--- FASE 3: ADMIN PORTAL (${adminRoutes.length} halaman) ---`)
  console.log(`🔐 Login sebagai Admin: ${ADMIN_EMAIL}`)
  await page.goto(`${BASE}/login?redirect=/admin`, { waitUntil: 'networkidle2' })
  await page.type('input[type="email"]', ADMIN_EMAIL, { delay: 20 })
  await page.type('input[type="password"]', ADMIN_PASS, { delay: 20 })
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
  ])
  await sleep(1500)

  for (const r of adminRoutes) {
    await captureRoute(page, r)
  }

  await browser.close()
  console.log('\n🎉 Selesai! Seluruh screenshot halaman telah berhasil ditangkap!')
}

run().catch((err) => {
  console.error('Fatal Error:', err)
  process.exit(1)
})