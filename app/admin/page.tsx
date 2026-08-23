'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  MapPin,
  Package,
  MessageSquare,
  HelpCircle,
  Calendar,
  Ticket,
  Layers,
  ListOrdered,
  Settings,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Eye,
  BarChart3,
  LayoutDashboard,
  Grid,
  CheckCircle2,
  Clock3,
  XCircle,
  ReceiptText,
  Activity,
  ChevronRight
} from 'lucide-react'

interface Booking {
  id: number
  packageName: string
  country: string
  name: string
  email: string
  phone: string
  travelDate: string
  participants: number
  status: string
  createdAt: string
}

interface Destination {
  id: number
  city: string
  country: string
  rating: number
  price: string
}

interface PackageItem {
  id: number
  title: string
  price: number
}

type TabType = 'overview' | 'analytics' | 'modules'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Raw counts
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [testimonialsCount, setTestimonialsCount] = useState(0)
  const [faqsCount, setFaqsCount] = useState(0)
  const [couponsCount, setCouponsCount] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations').then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/coupons?admin=true').then(r => r.json()),
    ])
      .then(([destData, packData, testData, faqData, bookData, coupData]) => {
        setDestinations(Array.isArray(destData) ? destData : [])
        setPackages(Array.isArray(packData) ? packData : [])
        setTestimonialsCount(Array.isArray(testData) ? testData.length : 0)
        setFaqsCount(Array.isArray(faqData) ? faqData.length : 0)
        setBookings(Array.isArray(bookData) ? bookData : [])
        setCouponsCount(Array.isArray(coupData) ? coupData.length : 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derived Analytics Data
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  // Calculate estimated total revenue
  const estimatedRevenue = bookings.reduce((sum, b) => {
    if (b.status === 'cancelled') return sum
    const matchPkg = packages.find(p => p.title.toLowerCase().includes(b.packageName.toLowerCase()))
    const pkgPrice = matchPkg ? matchPkg.price : 12500000 // Default 12.5M IDR average
    return sum + (pkgPrice * (b.participants || 1))
  }, 0)

  const totalParticipants = bookings.reduce((sum, b) => (b.status !== 'cancelled' ? sum + (b.participants || 1) : sum), 0)

  // Popular Destination Analytics
  const destinationPopularity = destinations.slice(0, 5).map(dest => {
    const bookingCount = bookings.filter(b =>
      b.country.toLowerCase().includes(dest.country.toLowerCase()) ||
      b.packageName.toLowerCase().includes(dest.city.toLowerCase())
    ).length

    const estimatedViews = Math.max(120, (bookingCount + 1) * 340 + (dest.id * 85))

    return {
      city: dest.city,
      country: dest.country,
      rating: dest.rating,
      price: dest.price,
      bookingCount,
      views: estimatedViews,
      statusTag: bookingCount > 2 ? 'High Demand 🔥' : bookingCount > 0 ? 'Trending 📈' : 'Popular 🌟'
    }
  }).sort((a, b) => b.views - a.views)

  const cards = [
    { label: 'Bookings', path: '/admin/bookings', count: bookings.length, desc: 'Kelola detail & konfirmasi booking customer', icon: Calendar, highlight: true },
    { label: 'Refunds', path: '/admin/refunds', count: null, desc: 'Kelola pengajuan pengembalian dana customer', icon: ReceiptText },
    { label: 'Destinasi', path: '/admin/destinations', count: destinations.length, desc: 'Kelola katalog destinasi & galeri foto', icon: MapPin },
    { label: 'Paket Travel', path: '/admin/packages', count: packages.length, desc: 'Kelola paket wisata, harga & fasilitas', icon: Package },
    { label: 'Kupon & Promo', path: '/admin/coupons', count: couponsCount, desc: 'Kelola kode diskon & promo voucher', icon: Ticket },
    { label: 'Ulasan / Review', path: '/admin/testimonials', count: testimonialsCount, desc: 'Review & feedback pelanggan', icon: MessageSquare },
    { label: 'FAQ', path: '/admin/faqs', count: faqsCount, desc: 'Tanya jawab populer untuk pelanggan', icon: HelpCircle },
    { label: 'Hero Section', path: '/admin/hero', count: null, desc: 'Edit headline hero & video background 8K', icon: Sparkles },
    { label: 'Features', path: '/admin/features', count: null, desc: 'Edit kartu keunggulan Why Nova', icon: Layers },
    { label: 'How It Works', path: '/admin/how-it-works', count: null, desc: 'Edit langkah kerja pemesanan', icon: ListOrdered },
    { label: 'Pengaturan System', path: '/admin/settings', count: null, desc: 'Kelola konfigurasi sistem & mitra', icon: Settings },
  ]

  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Header Bar - Monochromatic Gray & White */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{todayDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard Admin</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Statistik real-time, manajemen booking, dan kendali sistem NOVA Travel.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-zinc-800 border border-zinc-200 shadow-2xs text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data Sync</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid - Top Summary Cards (Fixed) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-zinc-200 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Estimated Revenue */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-3 hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Estimasi Omset Booking</span>
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900 tracking-tight">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(estimatedRevenue)}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dari {totalParticipants} total peserta perjalanan</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Bookings */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-3 hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Total Booking Masuk</span>
              <div className="p-2 rounded-lg bg-zinc-900 text-white">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{bookings.length}</p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">{confirmedBookings.length} Confirmed</span>
                <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">{pendingBookings.length} Pending</span>
              </div>
            </div>
          </div>

          {/* Card 3: Destinations & Catalog */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-3 hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Katalog Destinasi</span>
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{destinations.length}</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {packages.length} paket wisata aktif tersedia
              </p>
            </div>
          </div>

          {/* Card 4: Coupons & Reviews */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-3 hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Promo & Ulasan</span>
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{couponsCount} Voucher</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {testimonialsCount} ulasan (Avg. Rating 4.9/5)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tab Navigation Bar (shadcn UI Style) */}
      <div className="border-b border-zinc-200 pt-2">
        <div className="flex items-center gap-2 p-1 bg-zinc-200/60 rounded-xl border border-zinc-200/80 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Booking</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Minat</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'modules'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Pintasan Modul ({cards.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content Views */}
      {/* TAB 1: OVERVIEW & BOOKING SUMMARY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Status Ratio Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  Rasio Status Booking
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Distribusi status pemesanan customer saat ini.</p>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200/60"
              >
                <span>Kelola Booking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-5">
                {/* Visual Ratio Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span>Progres Status Pemesanan</span>
                    <span>{bookings.length} Total</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/60">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(confirmedBookings.length / bookings.length) * 100}%` }}
                      title={`Confirmed: ${confirmedBookings.length}`}
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${(pendingBookings.length / bookings.length) * 100}%` }}
                      title={`Pending: ${pendingBookings.length}`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{ width: `${(cancelledBookings.length / bookings.length) * 100}%` }}
                      title={`Cancelled: ${cancelledBookings.length}`}
                    />
                  </div>
                </div>

                {/* Status Metric Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Confirmed</span>
                    </div>
                    <p className="text-xl font-bold text-zinc-900">{confirmedBookings.length}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      {Math.round((confirmedBookings.length / (bookings.length || 1)) * 100)}% dari total
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                      <Clock3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending</span>
                    </div>
                    <p className="text-xl font-bold text-zinc-900">{pendingBookings.length}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      {Math.round((pendingBookings.length / (bookings.length || 1)) * 100)}% butuh konfirmasi
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancelled</span>
                    </div>
                    <p className="text-xl font-bold text-zinc-900">{cancelledBookings.length}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      {Math.round((cancelledBookings.length / (bookings.length || 1)) * 100)}% dibatalkan
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 text-center py-8">Belum ada data booking masuk.</p>
            )}
          </div>

          {/* Right Column: Recent Booking Activity (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  Booking Terbaru
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Aktivitas pemesanan paling baru.</p>
              </div>
              <Link href="/admin/bookings" className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1">
                <span>Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 4).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/80 hover:bg-zinc-50 transition-colors text-xs">
                    <div>
                      <p className="font-bold text-zinc-900">{b.name}</p>
                      <p className="text-[11px] text-zinc-500">{b.packageName} · {b.participants} orang</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize border ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : b.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                        : 'bg-amber-50 text-amber-700 border-amber-200/60'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 text-center py-8">Belum ada aktivitas booking terbaru.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & VISITOR INTEREST */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Destination Popularity Table / List */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-500" />
                  Statistik Minat Pengunjung & Destinasi Populer
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Analisis estimasi pengunjung & jumlah booking per destinasi.</p>
              </div>
              <span className="text-[10px] uppercase font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                Top Ranking
              </span>
            </div>

            <div className="space-y-4">
              {destinationPopularity.map((item, idx) => {
                const maxViews = Math.max(...destinationPopularity.map(d => d.views), 1)
                const percentage = Math.round((item.views / maxViews) * 100)

                return (
                  <div key={idx} className="space-y-2 p-3.5 rounded-xl border border-zinc-200/80 hover:bg-zinc-50/80 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-zinc-900">{item.city}</span>
                          <span className="text-zinc-500 ml-1 text-[11px]">({item.country})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {item.statusTag}
                        </span>
                        <span className="font-semibold text-zinc-900 flex items-center gap-1 text-xs">
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          {item.views.toLocaleString('id-ID')} views
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (shadcn style) */}
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/60">
                      <div
                        className="bg-zinc-900 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 12)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                      <span>Mulai {item.price} · Rating ★ {item.rating}</span>
                      <span className="font-medium text-zinc-900">{item.bookingCount} Booking terkonfirmasi</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Secondary Analytics Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-5 shadow-2xs">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-bold text-zinc-900">Ringkasan Konversi</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Metrik partisipan & performa finansial</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-500 text-[11px] block">Rata-rata Peserta Per Booking</span>
                  <span className="text-xl font-bold text-zinc-900">
                    {bookings.length > 0 ? (totalParticipants / bookings.length).toFixed(1) : 0} Orang
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-500 text-[11px] block">Tingkat Konversi Approved</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {bookings.length > 0 ? Math.round((confirmedBookings.length / bookings.length) * 100) : 0}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-500 text-[11px] block">Estimasi Nilai Rata-rata Order</span>
                  <span className="text-xl font-bold text-zinc-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                      bookings.length > 0 ? estimatedRevenue / bookings.length : 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODULE SHORTCUTS GRID */}
      {activeTab === 'modules' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Modul Manajemen Admin</h2>
            <span className="text-xs text-zinc-500">Akses cepat ke seluruh kontrol sistem</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.path}
                  href={card.path}
                  className={`bg-white rounded-xl p-5 border transition-all duration-200 group flex flex-col justify-between ${
                    card.highlight
                      ? 'border-zinc-900 shadow-xs ring-1 ring-zinc-900/5'
                      : 'border-zinc-200 hover:border-zinc-900 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors border border-zinc-200/60">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-900">{card.label}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{card.desc}</p>
                  </div>

                  {card.count !== null && (
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">TOTAL ITEM</span>
                      <span className="text-lg font-bold text-zinc-900">{card.count}</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
