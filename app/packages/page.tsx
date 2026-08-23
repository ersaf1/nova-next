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
  Plane,
  Building2,
  MapPin
} from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Package {
  id: number
  tag: string
  tagColor: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice: number
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
    tagColor: 'bg-[#18181B] text-white',
    title: 'Bali Paradise Escape',
    subtitle: 'Ubud • Seminyak • Uluwatu',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
    price: 12500000,
    originalPrice: 15500000,
    duration: '8 Hari 7 Malam',
    groupSize: '2-12 Orang',
    rating: 4.9,
    reviews: 248,
    includes: ['Tiket Pesawat PP', 'Resort Bintang 5', 'Tur Private Ubud', 'Sarapan & Makan Malam'],
    highlight: 'Tur pura bersejarah & teras terasering Ubud',
    category: 'Beach',
    slug: 'bali-paradise-escape'
  },
  {
    id: 2,
    tag: 'New Offer',
    tagColor: 'bg-emerald-600 text-white',
    title: 'Japan Cherry Blossom Tour',
    subtitle: 'Tokyo • Kyoto • Osaka',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85',
    price: 28500000,
    originalPrice: 32000000,
    duration: '12 Hari 11 Malam',
    groupSize: '2-8 Orang',
    rating: 4.8,
    reviews: 184,
    includes: ['Tiket Pesawat PP', 'Hotel Bintang 4', 'JR Shinkansen Pass', 'Tour Guide Bahasa Indonesia'],
    highlight: 'Pengalaman festival Bunga Sakura & Kuil Kuno',
    category: 'City',
    slug: 'japan-cherry-blossom'
  },
  {
    id: 3,
    tag: 'Luxury Suite',
    tagColor: 'bg-indigo-600 text-white',
    title: 'Santorini Sunsets Villa',
    subtitle: 'Oia • Fira • Akrotiri',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85',
    price: 36000000,
    originalPrice: 42000000,
    duration: '7 Hari 6 Malam',
    groupSize: '2 Orang',
    rating: 4.9,
    reviews: 132,
    includes: ['Tiket Pesawat PP', 'Private Villa Cliffside', 'Private Wine Tasting', 'Sunset Yacht Cruise'],
    highlight: 'Private Villa dengan pemandangan Caldera Santorini',
    category: 'Beach',
    slug: 'santorini-sunsets-villa'
  },
  {
    id: 4,
    tag: 'Adventure',
    tagColor: 'bg-amber-600 text-white',
    title: 'Swiss Alps Ski & Mountain Experience',
    subtitle: 'Zermatt • Interlaken • Zurich',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1200&q=85',
    price: 45000000,
    originalPrice: 52000000,
    duration: '9 Hari 8 Malam',
    groupSize: '2-6 Orang',
    rating: 4.9,
    reviews: 96,
    includes: ['Tiket Pesawat PP', 'Chalet Resort', 'Swiss Travel Pass', 'Ski Pass & Gear Rental'],
    highlight: 'Kereta gantung Matterhorn & pemandangan Alpine spektakuler',
    category: 'Mountain',
    slug: 'swiss-alps-experience'
  },
  {
    id: 5,
    tag: 'Overwater Luxury',
    tagColor: 'bg-sky-600 text-white',
    title: 'Maldives Overwater Resort Luxury',
    subtitle: 'North Malé • Baa Atoll',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=85',
    price: 52000000,
    originalPrice: 60000000,
    duration: '6 Hari 5 Malam',
    groupSize: '2 Orang',
    rating: 5.0,
    reviews: 211,
    includes: ['Tiket Pesawat PP', 'Overwater Villa Private Pool', 'Seaplane Transfer', 'All Inclusive Meals & Diving'],
    highlight: 'Villa terapung & menyelam di UNESCO Biosphere Reserve',
    category: 'Beach',
    slug: 'maldives-overwater-luxury'
  },
  {
    id: 6,
    tag: 'Cultural Heritage',
    tagColor: 'bg-rose-600 text-white',
    title: 'Paris & French Riviera Romantic Getaway',
    subtitle: 'Paris • Nice • Cannes',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
    price: 31000000,
    originalPrice: 35000000,
    duration: '8 Hari 7 Malam',
    groupSize: '2 Orang',
    rating: 4.8,
    reviews: 167,
    includes: ['Tiket Pesawat PP', 'Hotel Boutique Bintang 4', 'Eiffel Dinner Cruise', 'TGV First Class Train'],
    highlight: 'Makan malam romantis di Menara Eiffel & Pantai Nice',
    category: 'City',
    slug: 'paris-french-riviera'
  }
]

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(STATIC_PACKAGES)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data: Package[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data
            .filter(p =>
              p.slug &&
              p.rating &&
              p.price > 100000 &&
              p.highlight &&
              p.groupSize &&
              // duration harus string biasa, bukan JSON array
              typeof p.duration === 'string' && !p.duration.startsWith('[')
            )
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

  const filters = ['All', 'Beach', 'Mountain', 'City', 'Cultural', 'Adventure']

  const filtered = packages.filter((pkg) => {
    const matchesFilter =
      activeFilter === 'All' ||
      pkg.category.toLowerCase() === activeFilter.toLowerCase()

    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.highlight && pkg.highlight.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  const formatPrice = (price: number) => {
    if (price < 100000) {
      // Fallback for USD legacy values
      price = price * 15500
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-[88rem] mx-auto space-y-12">

          {/* Maximal Editorial Header Section */}
          <div className="pt-10 pb-4 border-b border-neutral-200/80 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>All-Inclusive Curated Journeys</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-950 leading-[1.02] tracking-tight">
                Exclusive Travel Packages
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl font-normal">
                Nikmati pengalaman liburan tanpa repot. Setiap paket dirancang khusus dengan tiket pesawat, resort mewah bintang 5, tur privat, dan pendampingan *travel concierge* 24/7.
              </p>
            </div>

            {/* Quick Guarantees Badge */}
            <div className="grid grid-cols-2 gap-3 shrink-0 lg:max-w-xs w-full">
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Garansi Harga Terbaik</p>
                  <p className="text-[10px] text-neutral-400">Tanpa Biaya Tersembunyi</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Pemesanan Instan</p>
                  <p className="text-[10px] text-neutral-400">Konfirmasi E-Ticket</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari paket wisata (Bali, Japan, Swiss)..."
                className="w-full bg-white border border-neutral-200/90 rounded-full pl-10 pr-10 py-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 transition-all shadow-2xs font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-full shrink-0 transition-all duration-200 ${
                    activeFilter === f
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'bg-white text-neutral-500 hover:text-neutral-900 border border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden animate-pulse h-96" />
              ))}
            </div>
          )}

          {/* Packages Cards Grid */}
          {!loading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 font-semibold">
                  Menampilkan <span className="font-bold text-neutral-950">{filtered.length}</span> Paket Wisata Eksklusif
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 space-y-2">
                  <Compass className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-sm font-bold text-neutral-800">Paket wisata tidak ditemukan.</p>
                  <p className="text-xs text-neutral-400">Coba ubah pencarian atau pilih kategori lain.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((pkg, idx) => {
                    const savings = (pkg.originalPrice || 0) - (pkg.price || 0)
                    const includesList = Array.isArray(pkg.includes) ? pkg.includes : []

                    return (
                      <Link
                        key={`${pkg.id}-${pkg.slug || idx}`}
                        href={`/packages/${(pkg as { slug?: string }).slug ?? pkg.id}`}
                        className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1"
                      >
                        {/* Image Header Container */}
                        <div className="relative h-60 overflow-hidden bg-neutral-900">
                          {pkg.image ? (
                            <img
                              src={pkg.image}
                              alt={pkg.title}
                              loading="lazy"
                              className="w-full h-full object-cover img-smooth-zoom"
                            />
                          ) : null}

                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

                          {/* Tag Badges */}
                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${pkg.tagColor || 'bg-neutral-900 text-white'}`}>
                              {pkg.tag}
                            </span>
                          </div>

                          {/* Discount Savings Pill */}
                          {savings > 0 && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs border border-white/40">
                              Hemat {formatPrice(savings)}
                            </div>
                          )}

                          {/* Location & Title Subtitle Banner */}
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                              <MapPin className="w-3 h-3 text-white/70" />
                              {pkg.subtitle}
                            </p>
                            <h3 className="text-xl font-bold leading-tight tracking-tight drop-shadow-sm text-white" style={{ letterSpacing: '-0.02em' }}>
                              {pkg.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Details Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                          {/* Duration, Group Size & Rating */}
                          <div className="flex items-center justify-between text-xs text-neutral-500 pb-3 border-b border-neutral-100">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              {pkg.duration}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Users className="w-3.5 h-3.5 text-neutral-400" />
                              {pkg.groupSize}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {pkg.rating} ({pkg.reviews})
                            </span>
                          </div>

                          {/* Highlight Banner */}
                          {pkg.highlight && (
                            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-700 font-medium leading-relaxed flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{pkg.highlight}</span>
                            </div>
                          )}

                          {/* Includes List Pills */}
                          {includesList.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Termasuk Fasilitas:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {includesList.slice(0, 4).map((inc, i) => (
                                  <span key={i} className="text-[11px] font-semibold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    {inc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Price & CTA Section */}
                          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                            <div>
                              {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                <p className="text-xs text-neutral-400 line-through font-medium">
                                  {formatPrice(pkg.originalPrice)}
                                </p>
                              )}
                              <p className="text-xl font-extrabold text-neutral-950 tracking-tight leading-none">
                                {formatPrice(pkg.price)}
                                <span className="text-xs text-neutral-400 font-normal ml-1">/ orang</span>
                              </p>
                            </div>

                            <span className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold group-hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs">
                              <span>Detail</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Guarantee Banner Footer */}
          <div className="p-8 bg-neutral-950 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">NOVA Travel Assurance</span>
              <h3 className="text-xl font-bold">Butuh Rencana Perjalanan Custom Sesuai Keinginan?</h3>
              <p className="text-xs text-neutral-400 max-w-xl">Gunakan fitur AI Travel Planner kami untuk merancang jadwal hari demi hari secara gratis dalam hitungan detik.</p>
            </div>
            <Link href="/ai-planner" className="px-6 py-3.5 rounded-2xl bg-white text-neutral-950 text-xs font-extrabold hover:bg-neutral-100 transition-colors flex items-center gap-2 shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gunakan AI Travel Planner</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
