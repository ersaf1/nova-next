'use client'

import Link from 'next/link'
import {
  GitFork,
  ArrowRight,
  ArrowDown,
  Layers,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Compass,
  CreditCard,
  Building2,
  ExternalLink
} from 'lucide-react'

export default function FlowMapPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          <GitFork size={13} />
          <span>Arsitektur Navigasi Aplikasi</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif-luxury font-bold text-stone-900 tracking-tight">
          Application Flow Map
        </h1>
        <p className="text-sm md:text-base text-stone-500 max-w-3xl leading-relaxed">
          Peta alur visual interaktif yang menggambarkan hubungan antar halaman, perpindahan peran, jalur checkout pemesanan paket, hingga portal operasional admin. Klik pada node mana saja untuk membuka dokumentasi lengkapnya.
        </p>
      </div>

      {/* Flow Diagram 1: Customer Journey (Discovery -> Booking -> Payment) */}
      <section className="bg-white rounded-3xl p-8 md:p-10 border border-stone-200 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-stone-950 font-bold">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif-luxury">
                1. Customer Booking & Checkout Funnel
              </h2>
              <p className="text-xs text-stone-500">Alur transaksi tamu dari pencarian paket hingga pembayaran sukses</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
            PUBLIC → USER
          </span>
        </div>

        {/* Nodes Grid Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Node 1 */}
          <Link
            href="/docs/home"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-amber-400 transition group shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold text-stone-400 block mb-1">LANGKAH 01</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition">Homepage (Beranda)</h3>
            <p className="text-xs text-stone-500 mt-1">Eksplorasi kurasi wisata & video hero</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>

          {/* Node 2 */}
          <Link
            href="/docs/packages"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-amber-400 transition group shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold text-stone-400 block mb-1">LANGKAH 02</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition">Katalog Paket Wisata</h3>
            <p className="text-xs text-stone-500 mt-1">Filter negara, kategori liburan & harga</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>

          {/* Node 3 */}
          <Link
            href="/docs/package-detail"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-amber-400 transition group shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold text-stone-400 block mb-1">LANGKAH 03</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition">Detail Paket & Tanggal</h3>
            <p className="text-xs text-stone-500 mt-1">Cek itinerary harian & pilih kuota jadwal</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>

          {/* Node 4 */}
          <Link
            href="/docs/booking-flow"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-amber-400 transition group shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold text-stone-400 block mb-1">LANGKAH 04</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition">Formulir Pemesanan</h3>
            <p className="text-xs text-stone-500 mt-1">Isi kontak pemesan & data tamu rombongan</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>
        </div>

        {/* Step Down to Payment */}
        <div className="flex justify-center my-2">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <ArrowDown size={16} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/docs/payment"
            className="p-5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200 transition group shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold text-amber-700 block mb-1">TRANSAKSI 05</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition">Gerbang Bayar (Midtrans)</h3>
            <p className="text-xs text-stone-600 mt-1">Pilih VA Bank, Kartu Kredit, QRIS, atau Kupon Diskon</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            href="/docs/payment-confirmation"
            className="p-5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200 transition group shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold text-emerald-700 block mb-1">SUKSES 06</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition">Konfirmasi & Struk</h3>
            <p className="text-xs text-stone-600 mt-1">Pembayaran terverifikasi & nomor tiket terbit</p>
            <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            href="/docs/dashboard-booking-detail"
            className="p-5 rounded-2xl bg-stone-900 text-white hover:bg-black transition group shadow-md"
          >
            <span className="text-[10px] font-mono font-bold text-amber-400 block mb-1">E-TICKET 07</span>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">E-Ticket & Boarding Pass</h3>
            <p className="text-xs text-stone-300 mt-1">Tersimpan di dashboard user untuk dicetak</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              Buka Docs <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </section>

      {/* Flow Diagram 2: User Dashboard Ecosystem */}
      <section className="bg-white rounded-3xl p-8 md:p-10 border border-stone-200 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif-luxury">
                2. User Account & Dashboard Ecosystem
              </h2>
              <p className="text-xs text-stone-500">Pusat kendali anggota setelah berhasil login</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            ROLE: USER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/docs/dashboard"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-blue-400 transition group"
          >
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-700 transition">Ringkasan Dashboard</h3>
            <p className="text-xs text-stone-500 mt-1">Countdown liburan & statistik akun</p>
          </Link>

          <Link
            href="/docs/dashboard-bookings"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-blue-400 transition group"
          >
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-700 transition">Pesanan Saya</h3>
            <p className="text-xs text-stone-500 mt-1">Pelacakan status tiket & invoice</p>
          </Link>

          <Link
            href="/docs/dashboard-itineraries"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-blue-400 transition group"
          >
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-700 transition">Itinerary Tersimpan</h3>
            <p className="text-xs text-stone-500 mt-1">Rencana buatan AI & jadwal mandiri</p>
          </Link>

          <Link
            href="/docs/profile"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-blue-400 transition group"
          >
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-700 transition">Profil Pengguna</h3>
            <p className="text-xs text-stone-500 mt-1">Dokumen paspor & kontak darurat</p>
          </Link>
        </div>
      </section>

      {/* Flow Diagram 3: Admin & Management Operations */}
      <section className="bg-white rounded-3xl p-8 md:p-10 border border-stone-200 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif-luxury">
                3. Admin Portal & Operational Architecture
              </h2>
              <p className="text-xs text-stone-500">Pengelolaan katalog tur, kuota keberangkatan, transaksi, dan audit sistem</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            ROLE: ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/docs/admin-dashboard"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-rose-400 transition group"
          >
            <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">EXECUTIVE OVERVIEW</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition">Admin Dashboard</h3>
            <p className="text-xs text-stone-500 mt-1">Grafik omset, okupansi seat & pesanan masuk</p>
          </Link>

          <Link
            href="/docs/admin-packages"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-rose-400 transition group"
          >
            <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">PRODUCT MANAGEMENT</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition">Paket Wisata & Kuota</h3>
            <p className="text-xs text-stone-500 mt-1">CRUD paket tur, destinasi, dan tanggal terbang</p>
          </Link>

          <Link
            href="/docs/admin-bookings"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-rose-400 transition group"
          >
            <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">TRANSACTIONS & REFUNDS</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition">Booking & Approval Refund</h3>
            <p className="text-xs text-stone-500 mt-1">Verifikasi status Midtrans & pembatalan tiket</p>
          </Link>

          <Link
            href="/docs/admin-users"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-rose-400 transition group"
          >
            <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">ACCESS CONTROL (RBAC)</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition">Users & Peran Staf</h3>
            <p className="text-xs text-stone-500 mt-1">Penugasan hak akses User, Admin, Super Admin</p>
          </Link>

          <Link
            href="/docs/admin-audit-logs"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-rose-400 transition group"
          >
            <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">SECURITY & COMPLIANCE</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition">Log Keamanan & Jejak Audit</h3>
            <p className="text-xs text-stone-500 mt-1">Catatan forensik seluruh perubahan data</p>
          </Link>

          <Link
            href="/docs/admin-reports"
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-rose-400 transition group"
          >
            <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">FINANCIAL ANALYTICS</span>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition">Laporan Finansial & Unduh PDF</h3>
            <p className="text-xs text-stone-500 mt-1">Rekap pendapatan & cetak laporan eksekutif</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
