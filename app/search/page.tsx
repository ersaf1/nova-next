'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, Star, Clock, Users, X, ArrowUpDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import CustomSelect from '@/components/ui/CustomSelect'

import type { TravelPackage, Destination } from '@/lib/types'
import { formatIDR } from '@/lib/types'

const CATEGORIES = ['All', 'Beach', 'Adventure', 'Culture', 'City', 'Nature', 'Luxury']
const DURATIONS = ['Any', '1-3 days', '4-7 days', '8-14 days', '15+ days']
const TRAVEL_MODES = ['Solo', 'Family', 'Adventure', 'Business']
const PAGE_SIZE = 9

// Sort options with Indonesian labels
const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'price-asc', label: 'Harga Termurah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'reviews', label: 'Popularitas (reviews)' },
]

// Tabs that are disabled (coming soon)
const DISABLED_TABS = ['Penerbangan', 'Hotel', 'Pengalaman']

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden animate-pulse">
      <div className="h-52 bg-black/10" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-black/10 rounded-full w-1/4" />
        <div className="h-5 bg-black/10 rounded-full w-3/4" />
        <div className="h-4 bg-black/10 rounded-full w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-black/10 rounded-full w-1/3" />
          <div className="h-9 bg-black/10 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  )
}

function PackageCard({ pkg }: { pkg: TravelPackage }) {
  return (
    <Link
      href={`/packages/${pkg.slug ?? pkg.id}`}
      className="block bg-white rounded-2xl border border-black/[0.04] overflow-hidden group hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-52 overflow-hidden bg-black/5">
        {pkg.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.image}
            alt={pkg.title}
            loading="lazy"
            className="w-full h-full object-cover img-smooth-zoom"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center">
            <span className="text-4xl">&#9992;</span>
          </div>
        )}
        <span
          className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: pkg.tagColor || '#000', color: '#fff' }}
        >
          {pkg.tag}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-base text-black leading-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
          {pkg.title}
        </h3>
        <p className="text-sm text-black/50 mb-3 line-clamp-2">{pkg.subtitle}</p>
        <div className="flex items-center gap-4 text-xs text-black/50 mb-4">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {pkg.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {pkg.groupSize}
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-black" />
            {pkg.rating} ({pkg.reviews})
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-col">
              {(pkg.originalPrice ?? 0) > pkg.price && (
                <span className="text-xs text-black/30 line-through leading-none mb-1">
                  {formatIDR(pkg.originalPrice ?? 0)}
                </span>
              )}
              <div className="flex items-baseline leading-none">
                <span className="text-lg font-bold text-black" style={{ letterSpacing: '-0.02em' }}>
                  {formatIDR(pkg.price)}
                </span>
                <span className="text-xs text-black/40 ml-1">/ orang</span>
              </div>
            </div>
          </div>
          <span className="text-sm font-medium bg-brand text-white px-4 py-2 rounded-full hover:bg-brand-dark transition-colors duration-200 shrink-0">
            Lihat Detail
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
      className="block bg-white rounded-2xl border border-black/[0.04] overflow-hidden group hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-52 overflow-hidden bg-black/5">
        {dest.image ? (
          <img
            src={dest.image}
            alt={dest.city}
            loading="lazy"
            className="w-full h-full object-cover img-smooth-zoom"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center">
            <span className="text-4xl">🌍</span>
          </div>
        )}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
          {(dest as { category?: string }).category ?? dest.country}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-base text-black mb-0.5" style={{ letterSpacing: '-0.02em' }}>{dest.city}</h3>
        <p className="text-sm text-black/40 mb-3">{dest.country}</p>
        <div className="flex items-center gap-3 text-xs text-black/40 mb-3">
          <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" />{dest.rating}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{(dest as { duration?: string }).duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-black" style={{ letterSpacing: '-0.02em' }}>{dest.price}</span>
          <span className="text-sm font-medium bg-brand text-white px-4 py-2 rounded-full">Explore</span>
        </div>
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Read all filter state from URL
  const type = searchParams.get('type') || 'packages'
  const destination = searchParams.get('destination') || ''
  const checkin = searchParams.get('checkin') || ''
  const checkout = searchParams.get('checkout') || ''
  const travelers = searchParams.get('travelers') || ''

  // URL-synced filters
  const q = searchParams.get('q') || destination
  const selectedCategory = searchParams.get('category') || 'All'
  const sortOrder = searchParams.get('sort') || 'rating'
  const minPrice = parseInt(searchParams.get('minPrice') || '0', 10)
  const maxPriceParam = searchParams.get('maxPrice')
  const selectedDuration = searchParams.get('duration') || 'Any'
  const selectedMode = searchParams.get('mode') || 'All'

  // Local data state
  const [packages, setPackages] = useState<TravelPackage[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // filterKey resets visibleCount when filters change
  const filterKey = `${q}|${selectedCategory}|${sortOrder}|${minPrice}|${maxPriceParam}|${selectedDuration}|${selectedMode}`
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setVisibleCount(PAGE_SIZE)
  }

  // Helper: update one or multiple URL params without full reload
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
          setError('Could not load destinations. Please try again.')
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
          setError('Could not load packages. Please try again.')
          console.error(err)
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

  const computedMaxPrice = packages.length > 0 ? Math.max(...packages.map((p) => p.price)) : 10_000_000
  const maxPrice = maxPriceParam !== null ? parseInt(maxPriceParam, 10) : computedMaxPrice

  // Packages filter
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
      
      if (!matchesFull && !matchesAnyPart) {
        return false
      }
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
    if (selectedMode !== 'All') {
      const modeKeywords: Record<string, string[]> = {
        solo: ['solo', 'backpacker', 'solo traveler', 'alone', 'individual'],
        family: ['family', 'kids', 'children', 'family-friendly', 'group'],
        adventure: ['adventure', 'hiking', 'extreme', 'trekking', 'outdoor', 'climbing', 'surfing'],
        business: ['business', 'corporate', 'executive', 'conference', 'work'],
      }
      const keywords = modeKeywords[selectedMode.toLowerCase()] ?? [selectedMode.toLowerCase()]
      const searchText = `${pkg.title} ${pkg.subtitle ?? ''} ${pkg.category ?? ''}`.toLowerCase()
      const matches = keywords.some(kw => searchText.includes(kw))
      if (!matches) return false
    }
    return true
  })

  // Destinations filter
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
  const headingText = isDestinations
    ? (q ? `Destinations for "${q}"` : 'All Destinations')
    : (destination ? `Results for "${destination}"` : 'All Packages')

  // Active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = []
  if (selectedCategory !== 'All') {
    activeChips.push({ label: selectedCategory, onRemove: () => setParams({ category: null }) })
  }
  if (maxPriceParam !== null && parseInt(maxPriceParam, 10) < computedMaxPrice) {
    activeChips.push({
      label: `Maks ${formatIDR(parseInt(maxPriceParam, 10))}`,
      onRemove: () => setParams({ maxPrice: null }),
    })
  }
  if (minPrice > 0) {
    activeChips.push({
      label: `Min ${formatIDR(minPrice)}`,
      onRemove: () => setParams({ minPrice: null }),
    })
  }
  if (selectedDuration !== 'Any') {
    activeChips.push({ label: selectedDuration, onRemove: () => setParams({ duration: null }) })
  }
  if (selectedMode !== 'All') {
    activeChips.push({ label: `Mode: ${selectedMode}`, onRemove: () => setParams({ mode: null }) })
  }
  if (q && q !== destination) {
    activeChips.push({ label: `"${q}"`, onRemove: () => setParams({ q: null }) })
  }

  const clearAllFilters = () => {
    setParams({ category: null, maxPrice: null, minPrice: null, duration: null, q: null, sort: null })
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-8 px-6">
        <div className="max-w-[88rem] mx-auto">
          <p className="text-sm text-black/40 mb-1">
            {checkin && checkout ? `${checkin} → ${checkout}` : ''}
            {travelers ? ` · ${travelers} travelers` : ''}
          </p>
          <h1 className="text-3xl font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
            {headingText}
          </h1>
          <p className="text-sm text-black/50 mt-1">
            {loading ? '...' : `${resultCount} hasil ditemukan`}
          </p>

          {/* Disabled tabs — Flights, Hotels, Experiences */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {/* Active tab: Packages */}
            <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-brand text-white">
              Paket Wisata
            </span>
            {DISABLED_TABS.map((tab) => (
              <span
                key={tab}
                title="Segera hadir"
                className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full bg-white border border-black/10 text-black/30 cursor-not-allowed select-none"
                aria-disabled="true"
              >
                {tab}
                <span className="text-[10px] font-medium bg-black/5 text-black/30 px-1.5 py-0.5 rounded-full leading-none">
                  Segera hadir
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="max-w-[88rem] mx-auto flex gap-8">
          {/* Sidebar — packages only */}
          {!isDestinations && (
            <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0`}>
              <div className="bg-white rounded-2xl border border-black/[0.04] p-6 sticky top-24 space-y-6">
                <h2 className="font-semibold text-black text-sm" style={{ letterSpacing: '-0.02em' }}>
                  Filters
                </h2>

                {/* Search */}
                <div>
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                    Destinasi
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setParams({ q: e.target.value || null })}
                      placeholder="Cari..."
                      className="w-full bg-[#F5F5F5] rounded-xl pl-8 pr-3 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                    {q && (
                      <button onClick={() => setParams({ q: null })} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X size={12} className="text-black/30" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                    Kategori
                  </label>
                  <div className="space-y-1.5">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={selectedCategory === cat}
                          onChange={() => setParams({ category: cat === 'All' ? null : cat })}
                          className="w-4 h-4 accent-black"
                        />
                        <span className="text-sm text-black/70 group-hover:text-black transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                    Harga Maks
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={computedMaxPrice}
                    value={maxPrice}
                    onChange={(e) => setParams({ maxPrice: e.target.value })}
                    className="w-full accent-black"
                  />
                  <div className="flex justify-between text-xs text-black/40 mt-1">
                    <span>{formatIDR(0)}</span>
                    <span>{formatIDR(maxPrice)}</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                    Durasi
                  </label>
                  <div className="space-y-1.5">
                    {DURATIONS.map((dur) => (
                      <label key={dur} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="duration"
                          value={dur}
                          checked={selectedDuration === dur}
                          onChange={() => setParams({ duration: dur === 'Any' ? null : dur })}
                          className="w-4 h-4 accent-black"
                        />
                        <span className="text-sm text-black/70 group-hover:text-black transition-colors">{dur}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Travel Mode */}
                <div>
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                    Travel Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...TRAVEL_MODES].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setParams({ mode: mode === 'All' ? null : mode.toLowerCase() })}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          (mode === 'All' && selectedMode === 'All') || selectedMode === mode.toLowerCase()
                            ? 'bg-brand text-white border-black'
                            : 'bg-white text-black/60 border-black/10 hover:border-black/30 hover:text-black'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={clearAllFilters}
                  className="w-full text-xs text-black/50 hover:text-black border border-black/10 rounded-full py-2 transition-colors duration-200"
                >
                  Reset filters
                </button>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar — packages only */}
            {!isDestinations && (
              <div className="flex items-center gap-3 mb-6 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex items-center gap-2 bg-brand text-white text-sm px-4 py-2 rounded-full"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setParams({ category: selectedCategory === cat ? null : cat })}
                      className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors duration-200 ${
                        selectedCategory === cat
                          ? 'bg-brand text-white border-black'
                          : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop category chips — packages only */}
            {!isDestinations && (
              <div className="hidden lg:flex items-center gap-3 mb-4 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setParams({ category: cat === 'All' ? null : cat })}
                    className={`text-sm px-4 py-1.5 rounded-full border transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-brand text-white border-black'
                        : 'bg-white text-black/60 border-black/10 hover:border-black/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Active filter chips */}
            {!isDestinations && activeChips.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {activeChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="flex items-center gap-1.5 text-xs bg-brand text-white px-3 py-1.5 rounded-full"
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      aria-label={`Hapus filter ${chip.label}`}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-black/50 hover:text-black underline transition-colors"
                >
                  Hapus semua
                </button>
              </div>
            )}

            {/* Sort + result count bar — packages only */}
            {!isDestinations && !loading && !error && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-black/50">
                  {filtered.length} hasil ditemukan
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

            {/* Results grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center">
                <p className="text-black/50 text-sm">{error}</p>
              </div>
            ) : isDestinations ? (
              filteredDestinations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-black/[0.04] p-16 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Tidak ada destinasi ditemukan
                  </h3>
                  <p className="text-sm text-black/50">
                    Coba cari kota atau negara yang berbeda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredDestinations.map((dest) => (
                    <DestinationCard key={dest.id} dest={dest} />
                  ))}
                </div>
              )
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Tidak ada paket ditemukan
                </h3>
                <p className="text-sm text-black/50 mb-6">
                  Coba sesuaikan filter atau cari destinasi yang berbeda.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-brand text-white text-sm px-6 py-2.5 rounded-full hover:bg-brand-dark transition-colors duration-200"
                >
                  Hapus semua filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {visiblePackages.map((pkg, idx) => (
                    <PackageCard key={pkg.slug || pkg.id || `search-pkg-${idx}`} pkg={pkg} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="bg-white border border-black/10 text-black text-sm px-8 py-3 rounded-full hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
                    >
                      Muat lebih banyak
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><span className="text-sm text-neutral-400">Loading…</span></div>}>
      <SearchContent />
    </Suspense>
  )
}
