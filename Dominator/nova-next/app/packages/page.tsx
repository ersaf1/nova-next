'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react'
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

const STATIC_PACKAGES: Package[] = [
  { id: 1, tag: 'Best Seller', tagColor: 'bg-amber-400 text-black', title: 'Bali Paradise Escape', subtitle: 'Ubud • Seminyak • Uluwatu', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85', price: 1299, originalPrice: 1599, duration: '8 days', groupSize: '2-12', rating: 4.9, reviews: 248, includes: ['Flights', 'Hotel', 'Tours', 'Breakfast'], highlight: 'Temple & rice terrace tour included', category: 'Beach' },
  { id: 2, tag: 'New', tagColor: 'bg-emerald-400 text-black', title: 'Japan Cherry Blossom', subtitle: 'Tokyo • Kyoto • Osaka', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=85', price: 2199, originalPrice: 2599, duration: '12 days', groupSize: '2-8', rating: 4.8, reviews: 184, includes: ['Flights', 'Hotel', 'JR Pass', 'Guide'], highlight: 'Sakura season experience', category: 'City' },
  { id: 3, tag: 'Luxury', tagColor: 'bg-violet-400 text-white', title: 'Santorini Sunsets', subtitle: 'Oia • Fira • Akrotiri', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85', price: 2899, originalPrice: 3299, duration: '7 days', groupSize: '2-6', rating: 4.9, reviews: 132, includes: ['Flights', 'Villa', 'Wine tour', 'Yacht'], highlight: 'Private villa with caldera view', category: 'Beach' },
  { id: 4, tag: 'Adventure', tagColor: 'bg-orange-400 text-black', title: 'Patagonia Trekking', subtitle: 'Torres del Paine • El Calafate', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=85', price: 3199, originalPrice: 3699, duration: '14 days', groupSize: '4-12', rating: 4.8, reviews: 96, includes: ['Flights', 'Camping', 'Guide', 'Gear'], highlight: 'W Circuit full trek', category: 'Mountain' },
  { id: 5, tag: 'Popular', tagColor: 'bg-sky-400 text-black', title: 'Maldives Overwater', subtitle: 'North Malé • Baa Atoll', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=85', price: 3999, originalPrice: 4599, duration: '6 days', groupSize: '2', rating: 5.0, reviews: 211, includes: ['Flights', 'Overwater villa', 'All meals', 'Diving'], highlight: 'UNESCO Biosphere Reserve diving', category: 'Beach' },
  { id: 6, tag: 'Cultural', tagColor: 'bg-rose-400 text-white', title: 'Morocco Desert Dream', subtitle: 'Marrakech • Fez • Sahara', image: 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800&q=85', price: 1499, originalPrice: 1799, duration: '9 days', groupSize: '2-10', rating: 4.7, reviews: 167, includes: ['Flights', 'Riad', 'Camel trek', 'Guide'], highlight: 'Sahara desert overnight camp', category: 'City' },
]

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(STATIC_PACKAGES)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) setPackages(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setPackages(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filters = ['All', 'Beach', 'Mountain', 'City']
  const filtered = activeFilter === 'All' 
    ? packages 
    : packages.filter(pkg => pkg.category.toLowerCase() === activeFilter.toLowerCase())

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">
          
          {/* Header */}
          <div className="pt-12 pb-10">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-4">All-inclusive experiences</p>
            <h1 className="text-5xl md:text-6xl font-semibold text-black leading-[1.05] mb-4" style={{ letterSpacing: '-0.03em' }}>
              Travel Packages
            </h1>
            <p className="text-base text-black/40 max-w-lg leading-relaxed">
              Curated itineraries with flights, hotels, guides, and unforgettable experiences — all bundled for you.
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-full shrink-0 transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-black text-white'
                    : 'bg-white text-black/40 hover:text-black border border-black/[0.06]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-black/[0.04] animate-pulse">
                  <div className="h-48 bg-black/[0.04]" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-black/[0.04] rounded w-3/4" />
                    <div className="h-4 bg-black/[0.04] rounded w-full" />
                    <div className="h-8 bg-black/[0.04] rounded-full w-28 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <>
              <p className="text-xs text-black/30 mb-5">{filtered.length} packages found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((pkg) => {
                  const savings = pkg.originalPrice - pkg.price
                  return (
                    <Link
                      key={pkg.id}
                      href={`/booking?packageId=${pkg.id}`}
                      className="group bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-48">
                        <img src={pkg.image} alt={pkg.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className={`absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor}`}>{pkg.tag}</span>
                        {savings > 0 && (
                          <span className="absolute top-4 right-4 bg-white text-black text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                            Save ${savings}
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-black text-lg font-bold leading-snug mb-1" style={{ letterSpacing: '-0.02em' }}>{pkg.title}</h3>
                        <p className="text-black/40 text-xs mb-4">{pkg.subtitle}</p>
                        <div className="flex items-center gap-4 text-xs text-black/40 mb-4">
                          <span className="flex items-center gap-1"><Clock size={10} /> {pkg.duration}</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {pkg.groupSize}</span>
                          <span className="flex items-center gap-1"><Star size={10} className="fill-black/40" /> {pkg.rating}</span>
                        </div>
                        <div className="mt-auto flex items-baseline gap-2">
                          <span className="text-black text-2xl font-bold">${pkg.price.toLocaleString()}</span>
                          <span className="text-black/30 text-xs">/ person</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
