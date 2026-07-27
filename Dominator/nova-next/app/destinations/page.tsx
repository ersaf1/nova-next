'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Destination {
  id: number
  city: string
  country: string
  image: string
  description: string
  rating: number
  duration: string
  price: string
  category: string
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setDestinations(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const categories = ['All', 'Beach', 'Mountain', 'City', 'Cultural', 'Adventure']
  const filtered = selectedCategory === 'All' 
    ? destinations 
    : destinations.filter(d => d.category === selectedCategory)

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">
          
          {/* Header */}
          <div className="pt-12 pb-10">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-4">Explore the world</p>
            <h1 className="text-5xl md:text-6xl font-semibold text-black leading-[1.05] mb-4" style={{ letterSpacing: '-0.03em' }}>
              Destinations
            </h1>
            <p className="text-base text-black/40 max-w-lg leading-relaxed">
              From tropical beaches to ancient cities, discover your next adventure across 150+ destinations worldwide.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full shrink-0 transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-white text-black/40 hover:text-black border border-black/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden animate-pulse">
                  <div className="h-56 bg-black/[0.04]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-black/[0.04] rounded w-2/3" />
                    <div className="h-4 bg-black/[0.04] rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-black/[0.04] rounded-full w-20" />
                      <div className="h-8 bg-black/[0.04] rounded-full w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <>
              <p className="text-xs text-black/30 mb-5">{filtered.length} destinations found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/search?destination=${encodeURIComponent(dest.city)}`}
                    className="group bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={dest.image} 
                        alt={dest.city} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-semibold" style={{ letterSpacing: '-0.02em' }}>{dest.city}</h3>
                        <p className="text-white/80 text-xs">{dest.country}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-black/50 text-sm leading-relaxed mb-4">{dest.description}</p>
                      <div className="flex items-center gap-4 text-xs text-black/40">
                        <span className="flex items-center gap-1">
                          <Star size={11} className="fill-black/40" />
                          {dest.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {dest.duration}
                        </span>
                        <span className="font-semibold text-black ml-auto">{dest.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
