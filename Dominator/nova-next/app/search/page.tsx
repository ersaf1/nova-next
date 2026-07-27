'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, Star, Clock, Users, X } from 'lucide-react'
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
  includes: string[]
  highlight: string
  category: string
}

const CATEGORIES = ['All', 'Beach', 'Adventure', 'Culture', 'City', 'Nature', 'Luxury']
const DURATIONS = ['Any', '1-3 days', '4-7 days', '8-14 days', '15+ days']

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

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Link
      href={`/booking?packageId=${pkg.id}`}
      className="block bg-white rounded-2xl border border-black/[0.04] overflow-hidden group hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-52 overflow-hidden bg-black/5">
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-black" style={{ letterSpacing: '-0.02em' }}>
              ${pkg.price.toLocaleString()}
            </span>
            {pkg.originalPrice > pkg.price && (
              <span className="text-xs text-black/30 line-through ml-2">${pkg.originalPrice.toLocaleString()}</span>
            )}
            <span className="text-xs text-black/40 ml-1">/ person</span>
          </div>
          <span
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition-colors duration-200"
          >
            Book Now
          </span>
        </div>
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const destination = searchParams.get('destination') || ''
  const checkin = searchParams.get('checkin') || ''
  const checkout = searchParams.get('checkout') || ''
  const travelers = searchParams.get('travelers') || ''
  const categoryParam = searchParams.get('category') || 'All'

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedDuration, setSelectedDuration] = useState('Any')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [searchText, setSearchText] = useState(destination)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('recommended')

  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true)
        const res = await fetch('/api/packages')
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
  }, [])

  const parseDurationDays = useCallback((dur: string): number => {
    const match = dur.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }, [])

  const filtered = packages.filter((pkg) => {
    // Text search against title + subtitle
    const text = searchText.toLowerCase()
    if (text && !pkg.title.toLowerCase().includes(text) && !pkg.subtitle.toLowerCase().includes(text)) {
      return false
    }
    // Category filter
    if (selectedCategory !== 'All' && pkg.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }
    // Price range
    if (pkg.price < priceRange[0] || pkg.price > priceRange[1]) {
      return false
    }
    // Duration filter
    if (selectedDuration !== 'Any') {
      const days = parseDurationDays(pkg.duration)
      if (selectedDuration === '1-3 days' && (days < 1 || days > 3)) return false
      if (selectedDuration === '4-7 days' && (days < 4 || days > 7)) return false
      if (selectedDuration === '8-14 days' && (days < 8 || days > 14)) return false
      if (selectedDuration === '15+ days' && days < 15) return false
    }
    return true
  })

  const maxPrice = packages.length > 0 ? Math.max(...packages.map((p) => p.price)) : 10000

  const sortedPackages = [...filtered].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price
    if (sortOrder === 'price-desc') return b.price - a.price
    if (sortOrder === 'rating') return b.rating - a.rating
    return 0 // recommended: preserve API order
  })

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
            {destination ? `Results for "${destination}"` : 'All Packages'}
          </h1>
          <p className="text-sm text-black/50 mt-1">{loading ? '...' : `${filtered.length} packages found`}</p>
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="max-w-[88rem] mx-auto flex gap-8">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0`}>
            <div className="bg-white rounded-2xl border border-black/[0.04] p-6 sticky top-24 space-y-6">
              <h2 className="font-semibold text-black text-sm" style={{ letterSpacing: '-0.02em' }}>
                Filters
              </h2>

              {/* Search */}
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                  Destination
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-[#F5F5F5] rounded-xl pl-8 pr-3 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                  {searchText && (
                    <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={12} className="text-black/30" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
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
                  Max Price
                </label>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-black"
                />
                <div className="flex justify-between text-xs text-black/40 mt-1">
                  <span>$0</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider mb-2 block">
                  Duration
                </label>
                <div className="space-y-1.5">
                  {DURATIONS.map((dur) => (
                    <label key={dur} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="duration"
                        value={dur}
                        checked={selectedDuration === dur}
                        onChange={() => setSelectedDuration(dur)}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm text-black/70 group-hover:text-black transition-colors">{dur}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedDuration('Any')
                  setPriceRange([0, maxPrice])
                  setSearchText('')
                }}
                className="w-full text-xs text-black/50 hover:text-black border border-black/10 rounded-full py-2 transition-colors duration-200"
              >
                Reset filters
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-full"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                    className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors duration-200 ${
                      selectedCategory === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop filter chips */}
            <div className="hidden lg:flex items-center gap-3 mb-6 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black/60 border-black/10 hover:border-black/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort + result count bar */}
            {!loading && !error && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-black/50">
                  {filtered.length} package{filtered.length !== 1 ? 's' : ''} found
                </p>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="text-sm bg-white border border-black/10 rounded-full px-4 py-1.5 text-black focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
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
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  No packages found
                </h3>
                <p className="text-sm text-black/50 mb-6">
                  Try adjusting your filters or searching for a different destination.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All')
                    setSelectedDuration('Any')
                    setPriceRange([0, maxPrice])
                    setSearchText('')
                  }}
                  className="bg-black text-white text-sm px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
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
