'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Star, Clock, ArrowRight, Heart } from 'lucide-react'
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

const STATIC_DESTINATIONS: Destination[] = [
  { id: 1, city: 'Bali', country: 'Indonesia', image: '', description: 'Tropical paradise with stunning temples, rice terraces, and world-class surf beaches.', rating: 4.9, duration: '5-14 days', price: 'From $899', category: 'Beach' },
  { id: 2, city: 'Tokyo', country: 'Japan', image: '', description: 'A dazzling blend of ultramodern and traditional, neon lights and ancient temples.', rating: 4.8, duration: '7-14 days', price: 'From $1,299', category: 'City' },
  { id: 3, city: 'Santorini', country: 'Greece', image: '', description: 'Iconic white-washed villages perched on volcanic cliffs above the Aegean Sea.', rating: 4.9, duration: '5-10 days', price: 'From $1,199', category: 'Beach' },
  { id: 4, city: 'Paris', country: 'France', image: '', description: 'The city of light — art, cuisine, fashion, and the iconic Eiffel Tower.', rating: 4.7, duration: '4-10 days', price: 'From $1,099', category: 'City' },
  { id: 5, city: 'Queenstown', country: 'New Zealand', image: '', description: 'The adventure capital of the world, surrounded by dramatic alpine scenery.', rating: 4.8, duration: '7-14 days', price: 'From $1,499', category: 'Adventure' },
  { id: 6, city: 'Kyoto', country: 'Japan', image: '', description: 'Ancient capital with thousands of classical Buddhist temples and stunning gardens.', rating: 4.9, duration: '4-8 days', price: 'From $999', category: 'Cultural' },
  { id: 7, city: 'Maldives', country: 'Maldives', image: '', description: 'Overwater bungalows, crystal-clear lagoons, and the world\'s finest coral reefs.', rating: 5.0, duration: '5-10 days', price: 'From $2,499', category: 'Beach' },
  { id: 8, city: 'Machu Picchu', country: 'Peru', image: '', description: 'The lost city of the Incas, hidden high in the Andes mountains of Peru.', rating: 4.9, duration: '7-12 days', price: 'From $1,399', category: 'Mountain' },
  { id: 9, city: 'Dubai', country: 'UAE', image: '', description: 'Futuristic skyline, luxury shopping, and desert adventures in one glittering city.', rating: 4.7, duration: '4-8 days', price: 'From $1,099', category: 'City' },
  { id: 10, city: 'Cape Town', country: 'South Africa', image: '', description: 'Where mountains meet the ocean — vineyards, safaris, and stunning coastal drives.', rating: 4.8, duration: '7-14 days', price: 'From $1,199', category: 'Adventure' },
  { id: 11, city: 'Barcelona', country: 'Spain', image: '', description: 'Gaudí\'s architecture, vibrant nightlife, and Mediterranean beaches all in one city.', rating: 4.8, duration: '4-8 days', price: 'From $999', category: 'Cultural' },
  { id: 12, city: 'Swiss Alps', country: 'Switzerland', image: '', description: 'Pristine ski slopes, charming villages, and breathtaking alpine panoramas.', rating: 4.9, duration: '5-10 days', price: 'From $1,799', category: 'Mountain' },
]

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(STATIC_DESTINATIONS)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) setDestinations(data)
      })
      .catch(() => {})
    
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

    const isSaved = wishlistIds.includes(destId)
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
                {filtered.map((dest) => {
                  const isSaved = wishlistIds.includes(Number(dest.id))
                  return (
                    <Link
                      key={dest.id}
                      href={`/search?destination=${encodeURIComponent(dest.city)}`}
                      className="group bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-lg transition-all duration-300 relative"
                    >
                      <div className="relative h-56 overflow-hidden">
                        {dest.image ? (
                          <img 
                            src={dest.image} 
                            alt={dest.city} 
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
