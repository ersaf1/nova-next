'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Star, Clock, ArrowRight, Heart, Search, X } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')

  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data: Destination[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setDestinations(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Check if user is logged in to fetch their wishlist
    const { supabaseClient } = require('@/lib/supabase-client')
    supabaseClient.auth.getUser().then(({ data }: any) => {
      if (data.user) {
        setUserId(data.user.id)
        fetch(`/api/wishlist?userId=${data.user.id}`)
          .then(r => r.json())
          .then((items: any[]) => {
            setWishlistIds(items.map(item => Number(item.destination_id)))
          })
          .catch(() => {})
      }
    })
  }, [])

  const toggleWishlist = async (e: React.MouseEvent, destId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }

    const isSaved = wishlistIds.includes(Number(destId))
    try {
      if (isSaved) {
        const res = await fetch(`/api/wishlist?userId=${userId}&destinationId=${destId}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          setWishlistIds(prev => prev.filter(id => id !== destId))
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, destinationId: destId })
        })
        if (res.ok) {
          setWishlistIds(prev => [...prev, destId])
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const categories = ['All', 'Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Nature']

  const filtered = destinations.filter(d => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory
    const matchesSearch =
      d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">

          {/* Header */}
          <div className="pt-12 pb-8">
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-3">195 UN Member States & World Destinations</p>
            <h1 className="text-4xl md:text-6xl font-semibold text-black leading-[1.05] mb-4" style={{ letterSpacing: '-0.03em' }}>
              All 195 Official World Destinations
            </h1>
            <p className="text-base text-black/50 max-w-xl leading-relaxed">
              Explore travel destinations, beaches, mountain peaks, and cultural heritage across all 195 UN member countries worldwide.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari negara (misal: Indonesia, Japan, France)..."
                className="w-full bg-white border border-black/10 rounded-full pl-10 pr-10 py-3 text-xs text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-2xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-full shrink-0 transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-black/50 hover:text-black border border-black/[0.08]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Destination Cards Grid */}
          {!loading && (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-black/40 font-medium">
                  Menampilkan {filtered.length} dari {destinations.length} negara destinasi dunia
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-black/5 space-y-2">
                  <p className="text-sm font-semibold text-black/80">Destinasi tidak ditemukan.</p>
                  <p className="text-xs text-black/40">Coba ubah kata kunci pencarian negara atau kategori.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((dest) => {
                    const isSaved = wishlistIds.includes(Number(dest.id))
                    return (
                      <Link
                        key={dest.id}
                        href={`/search?destination=${encodeURIComponent(dest.city)}`}
                        className="group bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between"
                      >
                        <div className="relative h-56 overflow-hidden bg-neutral-900">
                          {dest.image ? (
                            <img
                              src={dest.image}
                              alt={`${dest.city}, ${dest.country}`}
                              loading="lazy"
                              className="w-full h-full object-cover img-smooth-zoom"
                            />
                          ) : null}
                          <button
                            onClick={(e) => toggleWishlist(e, Number(dest.id))}
                            className="absolute top-4 right-4 bg-white/80 backdrop-blur-md hover:bg-white text-black p-2.5 rounded-full shadow-md z-10 transition-colors"
                            title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <Heart size={16} className={`${isSaved ? 'fill-red-500 text-red-500' : 'text-black'}`} />
                          </button>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>{dest.city}</h3>
                            <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-white/60" />
                              {dest.country}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <p className="text-black/60 text-xs leading-relaxed line-clamp-2">{dest.description}</p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-black/5 text-xs text-black/50">
                            <span className="flex items-center gap-1 font-semibold text-amber-500">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {dest.rating}
                            </span>
                            <span className="flex items-center gap-1 text-black/40">
                              <Clock size={12} />
                              {dest.duration}
                            </span>
                            <span className="font-bold text-black text-xs">{dest.price}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
