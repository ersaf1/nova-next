'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Users,
  X,
  ArrowUpDown,
  Compass,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CustomSelect from '@/components/ui/CustomSelect'
import type { TravelPackage, Destination } from '@/lib/types'
import { formatIDR } from '@/lib/types'

const CATEGORIES = ['All', 'Beach', 'Adventure', 'Culture', 'City', 'Mountain', 'Luxury']
const DURATIONS = ['Any', '1-3 days', '4-7 days', '8-14 days', '15+ days']
const TRAVEL_MODES = ['Solo', 'Family', 'Adventure', 'Business']
const PAGE_SIZE = 9

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'price-asc', label: 'Harga Termurah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'reviews', label: 'Popularitas (Ulasan)' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden animate-pulse">
      <div className="h-56 bg-neutral-200" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-neutral-200 rounded-full w-1/4" />
        <div className="h-5 bg-neutral-200 rounded-full w-3/4" />
        <div className="h-4 bg-neutral-200 rounded-full w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-neutral-200 rounded-full w-1/3" />
          <div className="h-9 bg-neutral-200 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  )
}

function PackageCard({ pkg }: { pkg: TravelPackage }) {
  const savings = (pkg.originalPrice || 0) - (pkg.price || 0)

  return (
    <Link
      href={`/packages/${pkg.slug ?? pkg.id}`}
      className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden bg-neutral-900">
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.title}
            loading="lazy"
            className="w-full h-full object-cover img-smooth-zoom"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
            <Compass className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

        <span
          className="absolute top-3.5 left-3.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs"
          style={{ backgroundColor: pkg.tagColor || '#18181b', color: '#fff' }}
        >
          {pkg.tag || 'Best Seller'}
        </span>

        {savings > 0 && (
          <span className="absolute top-3.5 right-3.5 bg-white/95 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
            Hemat {formatIDR(savings)}
          </span>
        )}

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-light" />
            <span>{pkg.subtitle}</span>
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-neutral-950 leading-snug tracking-tight mb-2 line-clamp-2">
            {pkg.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-neutral-500 py-2 border-y border-neutral-100">
            <span className="flex items-center gap-1 font-medium">
              <Clock size={13} className="text-neutral-400" />
              <span>{pkg.duration}</span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users size={13} className="text-neutral-400" />
              <span>{pkg.groupSize}</span>
            </span>
            <span className="flex items-center gap-1 font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md ml-auto">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{pkg.rating} ({pkg.reviews})</span>
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            {(pkg.originalPrice ?? 0) > pkg.price && (
              <span className="text-[11px] text-neutral-400 line-through leading-none block">
                {formatIDR(pkg.originalPrice ?? 0)}
              </span>
            )}
            <div className="flex items-baseline">
              <span className="text-lg font-black text-neutral-950 tracking-tight">
                {formatIDR(pkg.price)}
              </span>
              <span className="text-[10px] text-neutral-400 font-normal ml-1">/org</span>
            </div>
          </div>

          <span className="text-xs font-bold bg-brand group-hover:bg-brand-dark text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs">
            <span>Detail</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function DestinationCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={`/destinations/${dest.id}`}
      className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden bg-neutral-900">
        {dest.image ? (
          <img
            src={dest.image}
            alt={dest.city}
            loading="lazy"
            className="w-full h-full object-cover img-smooth-zoom"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

        <span className="absolute top-3.5 left-3.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
          {(dest as { category?: string }).category ?? dest.country}
        </span>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-black text-xl text-neutral-950 mb-0.5 tracking-tight">{dest.city}</h3>
          <p className="text-xs text-neutral-500 font-semibold mb-3">{dest.country}</p>
          <div className="flex items-center gap-3 text-xs text-neutral-500 py-2 border-y border-neutral-100">
            <span className="flex items-center gap-1 font-bold text-amber-500">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{dest.rating}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span>{(dest as { duration?: string }).duration || '5-7 Hari'}</span>
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Mulai Dari</span>
            <span className="text-base font-black text-neutral-950 tracking-tight">{dest.price}</span>
          </div>
          <span className="text-xs font-bold bg-brand group-hover:bg-brand-dark text-white px-4 py-2.5 rounded-xl transition-all">
            Eksplor
          </span>
        </div>
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get('type') || 'packages'
  const destination = searchParams.get('destination') || ''
  const q = searchParams.get('q') || destination
  const selectedCategory = searchParams.get('category') || 'All'
  const sortOrder = searchParams.get('sort') || 'rating'
  const minPrice = parseInt(searchParams.get('minPrice') || '0', 10)
  const maxPriceParam = searchParams.get('maxPrice')
  const selectedDuration = searchParams.get('duration') || 'Any'
  const selectedMode = searchParams.get('mode') || 'All'

  const [packages, setPackages] = useState<TravelPackage[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === '') {
          next.delete(key)
        } else {
          next.set(key, val)
        }
      }
      router.replace('/search?' + next.toString(), { scroll: false })
    },
    [searchParams, router]
  )

  useEffect(() => {
    const controller = new AbortController()
    if (type === 'destinations') {
      async function fetchDestinations() {
        try {
          setLoading(true)
          const res = await fetch('/api/destinations', { signal: controller.signal })
          const data = await res.json()
          setDestinations(Array.isArray(data) ? data : [])
        } catch {
          setError('Gagal memuat destinasi.')
        } finally {
          setLoading(false)
        }
      }
      fetchDestinations()
    } else {
      async function fetchPackages() {
        try {
          setLoading(true)
          const res = await fetch('/api/packages', { signal: controller.signal })
          if (!res.ok) throw new Error('Failed to fetch packages')
          const data = await res.json()
          setPackages(Array.isArray(data) ? data : [])
        } catch (err) {
          setError('Gagal memuat paket wisata.')
        } finally {
          setLoading(false)
        }
      }
      fetchPackages()
    }
    return () => controller.abort()
  }, [type])

  const parseDurationDays = useCallback((dur: string): number => {
    const match = dur.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }, [])

  const computedMaxPrice = packages.length > 0 ? Math.max(...packages.map((p) => p.price)) : 50_000_000
  const maxPrice = maxPriceParam !== null ? parseInt(maxPriceParam, 10) : computedMaxPrice

  const filtered = packages.filter((pkg) => {
    const text = q.toLowerCase()
    if (text) {
      const queryParts = text.split(/[,•]/).map(part => part.trim()).filter(Boolean)
      const titleLower = pkg.title.toLowerCase()
      const subtitleLower = (pkg.subtitle ?? '').toLowerCase()
      
      const matchesFull = titleLower.includes(text) || subtitleLower.includes(text)
      const matchesAnyPart = queryParts.some(part => {
        if (part.length <= 2) return false
        return titleLower.includes(part) || subtitleLower.includes(part)
      })
      
      if (!matchesFull && !matchesAnyPart) return false
    }
    if (selectedCategory !== 'All' && pkg.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }
    if (pkg.price < minPrice || pkg.price > maxPrice) {
      return false
    }
    if (selectedDuration !== 'Any') {
      const days = parseDurationDays(pkg.duration ?? '')
      if (selectedDuration === '1-3 days' && (days < 1 || days > 3)) return false
      if (selectedDuration === '4-7 days' && (days < 4 || days > 7)) return false
      if (selectedDuration === '8-14 days' && (days < 8 || days > 14)) return false
      if (selectedDuration === '15+ days' && days < 15) return false
    }
    return true
  })

  const filteredDestinations = destinations.filter(d => {
    if (!q) return true
    return (
      d.city.toLowerCase().includes(q.toLowerCase()) ||
      d.country.toLowerCase().includes(q.toLowerCase())
    )
  })

  const sortedPackages = [...filtered].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price
    if (sortOrder === 'price-desc') return b.price - a.price
    if (sortOrder === 'rating') return b.rating - a.rating
    if (sortOrder === 'reviews') return (b.reviews ?? b.reviewCount ?? 0) - (a.reviews ?? a.reviewCount ?? 0)
    return 0
  })

  const visiblePackages = sortedPackages.slice(0, visibleCount)
  const hasMore = visibleCount < sortedPackages.length
  const isDestinations = type === 'destinations'
  const resultCount = isDestinations ? filteredDestinations.length : filtered.length

  const clearAllFilters = () => {
    setParams({ category: null, maxPrice: null, minPrice: null, duration: null, q: null, sort: null, destination: null })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-6 px-4 sm:px-6 md:px-8">
        <div className="max-w-[88rem] mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-dark bg-brand/10 px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" />
            <span>Hasil Pencarian</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight">
            {q ? `Pencarian untuk "${q}"` : isDestinations ? 'Semua Destinasi' : 'Semua Paket Wisata'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-semibold">
            {loading ? 'Mencari paket...' : `${resultCount} hasil ditemukan`}
          </p>

          {/* Quick type switcher */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setParams({ type: 'packages' })}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                !isDestinations ? 'bg-neutral-950 text-white shadow-xs' : 'bg-white border border-neutral-200 text-neutral-700'
              }`}
            >
              Paket Wisata
            </button>
            <button
              onClick={() => setParams({ type: 'destinations' })}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                isDestinations ? 'bg-neutral-950 text-white shadow-xs' : 'bg-white border border-neutral-200 text-neutral-700'
              }`}
            >
              Destinasi
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="px-4 sm:px-6 md:px-8 pb-24">
        <div className="max-w-[88rem] mx-auto flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Filter Sidebar */}
          {!isDestinations && (
            <aside className="w-full lg:w-72 shrink-0 bg-white rounded-3xl border border-neutral-200/80 p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="font-extrabold text-sm text-neutral-950">Filter Pencarian</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-brand-dark font-bold hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Search keyword */}
              <div>
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2 block">
                  Kata Kunci
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setParams({ q: e.target.value || null })}
                    placeholder="Cari destinasi..."
                    className="w-full bg-neutral-50 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-neutral-900 border border-neutral-200/80 focus:outline-none focus:ring-2 focus:ring-brand font-semibold"
                  />
                  {q && (
                    <button onClick={() => setParams({ q: null })} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2 block">
                  Kategori
                </label>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700 hover:text-neutral-950">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={() => setParams({ category: cat === 'All' ? null : cat })}
                        className="accent-brand"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2 block">
                  Durasi
                </label>
                <div className="space-y-1.5">
                  {DURATIONS.map((dur) => (
                    <label key={dur} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700 hover:text-neutral-950">
                      <input
                        type="radio"
                        name="duration"
                        value={dur}
                        checked={selectedDuration === dur}
                        onChange={() => setParams({ duration: dur === 'Any' ? null : dur })}
                        className="accent-brand"
                      />
                      <span>{dur}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Results Grid Content */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            
            {/* Sort bar */}
            {!isDestinations && !loading && !error && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 font-semibold">
                  Menampilkan {filtered.length} paket
                </p>
                <div className="w-56">
                  <CustomSelect
                    value={sortOrder}
                    onChange={(val) => setParams({ sort: val })}
                    options={SORT_OPTIONS.map((opt) => ({
                      id: opt.value,
                      label: opt.label,
                    }))}
                    icon={<ArrowUpDown size={14} />}
                    align="right"
                  />
                </div>
              </div>
            )}

            {/* Content Cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isDestinations ? (
              filteredDestinations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-16 text-center space-y-2">
                  <MapPin className="w-10 h-10 text-neutral-400 mx-auto" />
                  <h3 className="text-base font-extrabold text-neutral-900">Destinasi tidak ditemukan</h3>
                  <p className="text-xs text-neutral-500">Coba cari nama kota atau negara lain.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDestinations.map((dest) => (
                    <DestinationCard key={dest.id} dest={dest} />
                  ))}
                </div>
              )
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-16 text-center space-y-3">
                <Compass className="w-10 h-10 text-neutral-400 mx-auto" />
                <h3 className="text-base font-extrabold text-neutral-900">Paket wisata tidak ditemukan</h3>
                <p className="text-xs text-neutral-500">Coba sesuaikan filter atau reset kata kunci.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold bg-neutral-950 text-white px-5 py-2.5 rounded-full"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visiblePackages.map((pkg, idx) => (
                    <PackageCard key={pkg.slug || pkg.id || idx} pkg={pkg} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="bg-white border border-neutral-200 text-neutral-950 text-xs font-bold px-8 py-3 rounded-full hover:bg-neutral-950 hover:text-white transition-all shadow-xs"
                    >
                      Muat Lebih Banyak
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><span className="text-xs text-neutral-400">Memuat pencarian...</span></div>}>
      <SearchContent />
    </Suspense>
  )
}
