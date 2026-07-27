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

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

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
