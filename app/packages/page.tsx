'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Clock,
  Users,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
  Compass,
  Zap,
  MapPin,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Package {
  id: number | string
  tag: string
  tagColor?: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice?: number
  duration: string
  groupSize: string
  rating: number
  reviews: number
  includes: string[] | string
  highlight: string
  category: string
  slug?: string
}

const STATIC_PACKAGES: Package[] = [
  {
    id: 1,
    tag: 'Best Seller',
    tagColor: 'bg-neutral-900 text-white',
    title: 'Bali Paradise & Ubud Retreat',
    subtitle: 'Ubud • Seminyak • Uluwatu Cliff',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
    price: 4250000,
    originalPrice: 5500000,
    duration: '4 Hari 3 Malam',
    groupSize: '2-10 Orang',
    rating: 4.9,
    reviews: 312,
    includes: ['Tiket Pesawat PP', 'Resort Bintang 5', 'Tur Private Ubud', 'Sarapan & Sunset Dinner'],
    highlight: 'Kunjungan pura bersejarah & private sunset dinner di tebing Uluwatu',
    category: 'Beach',
    slug: 'bali-paradise-escape'
  },
  {
    id: 2,
    tag: 'Phinisi Luxury',
    tagColor: 'bg-brand text-white',
    title: 'Labuan Bajo & Komodo Sailing Liveaboard',
    subtitle: 'Pulau Padar • Pink Beach • Komodo Island',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=85',
    price: 6800000,
    originalPrice: 8200000,
    duration: '3 Hari 2 Malam',
    groupSize: '2-8 Orang',
    rating: 4.9,
    reviews: 248,
    includes: ['Kapal Phinisi Deluxe AC', 'Snorkeling Gear & Guide', 'All Meals Onboard', 'Tiket Masuk TN Komodo'],
    highlight: 'Tidur di atas kapal Phinisi mewah & melihat Komodo di habitat aslinya',
    category: 'Beach',
    slug: 'labuan-bajo-komodo'
  },
  {
    id: 3,
    tag: 'Popular',
    tagColor: 'bg-rose-500 text-white',
    title: 'Japan Classic Cherry Blossom Experience',
    subtitle: 'Tokyo • Mt. Fuji • Kyoto • Osaka',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85',
    price: 24500000,
    originalPrice: 28000000,
    duration: '7 Hari 6 Malam',
    groupSize: '2-12 Orang',
    rating: 4.9,
    reviews: 189,
    includes: ['Tiket Pesawat PP', 'Hotel Bintang 4 Pusat Kota', 'Shinkansen Bullet Train', 'Tour Guide Indonesia'],
    highlight: 'Wisata bunga sakura, kimono rental & kuil bersejarah Fushimi Inari',
    category: 'City',
    slug: 'japan-cherry-blossom'
  },
  {
    id: 4,
    tag: 'Adventure',
    tagColor: 'bg-amber-600 text-white',
    title: 'Swiss Alps Grand Panorama & Glacier',
    subtitle: 'Zermatt • Interlaken • Jungfraujoch',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1200&q=85',
    price: 36000000,
    originalPrice: 42000000,
    duration: '8 Hari 7 Malam',
    groupSize: '2-6 Orang',
    rating: 4.9,
    reviews: 124,
    includes: ['Tiket Pesawat PP', 'Alpine Chalet Resort', 'Swiss Travel Pass Unlimited', 'Kereta Gantung Jungfrau'],
    highlight: 'Puncak tertinggi Eropa Top of Europe & danau kristal Interlaken',
    category: 'Mountain',
    slug: 'swiss-alps-experience'
  },
  {
    id: 5,
    tag: 'Luxury Island',
    tagColor: 'bg-sky-600 text-white',
    title: 'Santorini Caldera Cliffside Romance',
    subtitle: 'Oia • Fira • Imerovigli • Akrotiri',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85',
    price: 28500000,
    originalPrice: 33000000,
    duration: '6 Hari 5 Malam',
    groupSize: '2 Orang',
    rating: 4.9,
    reviews: 142,
    includes: ['Tiket Pesawat PP', 'Private Cliffside Villa', 'Wine Tasting Tour', 'Sunset Catamaran Yacht'],
    highlight: 'Private infinity pool dengan pemandangan Caldera Santorini spektakuler',
    category: 'Beach',
    slug: 'santorini-sunsets-villa'
  },
  {
    id: 6,
    tag: 'Culture',
    tagColor: 'bg-indigo-600 text-white',
    title: 'Paris Romantic & French Riviera',
    subtitle: 'Paris • Nice • Monaco • Cannes',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
    price: 26000000,
    originalPrice: 30000000,
    duration: '7 Hari 6 Malam',
    groupSize: '2-8 Orang',
    rating: 4.8,
    reviews: 167,
    includes: ['Tiket Pesawat PP', 'Boutique Hotel Bintang 4', 'Seine Dinner Cruise', 'TGV First Class Train'],
    highlight: 'Makan malam romantis di Menara Eiffel & pesona pantai Cote d Azur',
    category: 'City',
    slug: 'paris-french-riviera'
  }
]

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(STATIC_PACKAGES)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended')

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data: Package[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data
            .filter(p => p.price > 100000 && p.title)
            .map(p => ({
              ...p,
              includes: Array.isArray(p.includes)
                ? p.includes
                : typeof p.includes === 'string'
                ? (() => { try { return JSON.parse(p.includes as string) } catch { return [] } })()
                : []
            }))
          setPackages(formatted.length > 0 ? formatted : STATIC_PACKAGES)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filters = [
    { id: 'All', label: 'Semua Kategori' },
    { id: 'Beach', label: 'Pantai & Pulau 🏝️' },
    { id: 'Mountain', label: 'Gunung & Alam 🏔️' },
    { id: 'City', label: 'Kota & Budaya 🏛️' },
  ]

  const filtered = packages.filter((pkg) => {
    const matchesFilter =
      activeFilter === 'All' ||
      pkg.category?.toLowerCase() === activeFilter.toLowerCase()

    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.subtitle && pkg.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pkg.highlight && pkg.highlight.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-[88rem] mx-auto space-y-10">

          {/* Editorial Header */}
          <div className="pt-8 pb-6 border-b border-neutral-200/80 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-brand/10 text-brand-dark text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>All-Inclusive Curated Holidays</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-neutral-950 tracking-tight leading-tight">
                Paket Wisata Eksklusif
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl font-normal">
                Nikmati liburan tanpa repot. Tiket pesawat, resort bintang 5, transportasi privat, dan perlindungan refund 100% sudah siap untuk Anda.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 shrink-0 lg:max-w-xs w-full">
              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-neutral-900">Garansi Refund</p>
                  <p className="text-[10px] text-neutral-400">100% Proteksi Dana</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand/10 text-brand-dark">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-neutral-900">Booking Instan</p>
                  <p className="text-[10px] text-neutral-400">E-Ticket 3 Menit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari destinasi atau paket wisata..."
                className="w-full bg-white border border-neutral-200/90 rounded-2xl pl-10 pr-10 py-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand font-semibold shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Dropdown */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-2xl shrink-0 transition-all duration-200 ${
                      activeFilter === f.id
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'bg-white text-neutral-600 hover:text-neutral-950 border border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-neutral-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer shadow-2xs"
                >
                  <option value="recommended">Rekomendasi</option>
                  <option value="price-asc">Harga Termurah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>
            </div>

          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
            <span>
              Menampilkan <strong className="text-neutral-950">{filtered.length}</strong> Paket Wisata Siap Berangkat
            </span>
          </div>

          {/* Packages Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200/80 space-y-3">
              <Compass className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-base font-extrabold text-neutral-900">Paket wisata tidak ditemukan</h3>
              <p className="text-xs text-neutral-500">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
              <button
                onClick={() => { setActiveFilter('All'); setSearchQuery('') }}
                className="mt-2 text-xs font-bold bg-neutral-950 text-white px-5 py-2.5 rounded-full"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pkg, idx) => {
                const savings = (pkg.originalPrice || 0) - (pkg.price || 0)
                const includesList = Array.isArray(pkg.includes)
                  ? pkg.includes
                  : typeof pkg.includes === 'string'
                  ? (() => { try { return JSON.parse(pkg.includes) } catch { return [] } })()
                  : []

                const slug = pkg.slug || pkg.id || `package-${idx}`

                return (
                  <Link
                    key={`${pkg.id}-${idx}`}
                    href={`/packages/${slug}`}
                    className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                  >
                    {/* Header Image */}
                    <div className="relative h-60 overflow-hidden bg-neutral-900">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        loading="lazy"
                        className="w-full h-full object-cover img-smooth-zoom"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent" />

                      {/* Tag Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${pkg.tagColor || 'bg-neutral-900 text-white'}`}>
                          {pkg.tag}
                        </span>
                      </div>

                      {/* Savings Pill */}
                      {savings > 0 && (
                        <div className="absolute top-4 right-4 bg-white/95 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                          Hemat {formatPrice(savings)}
                        </div>
                      )}

                      {/* Location & Title */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                          <MapPin className="w-3 h-3 text-brand-light" />
                          <span>{pkg.subtitle}</span>
                        </p>
                        <h3 className="text-xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                          {pkg.title}
                        </h3>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Meta Stats */}
                      <div className="flex items-center justify-between text-xs text-neutral-500 pb-3 border-b border-neutral-100">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{pkg.duration}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{pkg.groupSize}</span>
                        </span>
                        <span className="flex items-center gap-1 font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{pkg.rating} ({pkg.reviews})</span>
                        </span>
                      </div>

                      {/* Highlight */}
                      {pkg.highlight && (
                        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-700 font-medium flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{pkg.highlight}</span>
                        </div>
                      )}

                      {/* Includes list */}
                      {includesList.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Termasuk:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {includesList.slice(0, 3).map((inc: string, i: number) => (
                              <span key={i} className="text-[10px] font-semibold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{inc}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price & Action Button */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                        <div>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <p className="text-xs text-neutral-400 line-through font-medium leading-none mb-1">
                              {formatPrice(pkg.originalPrice)}
                            </p>
                          )}
                          <p className="text-xl font-black text-neutral-950 tracking-tight leading-none">
                            {formatPrice(pkg.price)}
                            <span className="text-[11px] text-neutral-400 font-normal ml-1">/ org</span>
                          </p>
                        </div>

                        <span className="px-5 py-2.5 rounded-xl bg-brand group-hover:bg-brand-dark text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs">
                          <span>Detail</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>

                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* AI Banner Footer */}
          <div className="p-8 sm:p-10 bg-gradient-to-r from-neutral-950 via-[#072f35] to-neutral-950 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full">
                AI CUSTOM PLANNER
              </span>
              <h3 className="text-2xl font-black">Mau Jadwal Liburan yang Disesuaikan Sendiri?</h3>
              <p className="text-xs text-white/70 max-w-xl">
                Gunakan AI Travel Planner kami untuk menyusun jadwal hari demi hari, rute destinasi, dan estimasi biaya secara otomatis.
              </p>
            </div>
            <Link
              href="/ai-planner"
              className="px-6 py-3.5 rounded-2xl bg-white text-neutral-950 text-xs font-black hover:bg-neutral-100 transition-colors flex items-center gap-2 shrink-0 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Buka AI Planner</span>
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
