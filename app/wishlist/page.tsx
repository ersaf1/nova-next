'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Star, Trash2, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabaseClient } from '@/lib/supabase-client'

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

interface WishlistItem {
  id: number
  user_id: string
  destination_id: number
  created_at: string
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        loadWishlist(data.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const loadWishlist = async (uid: string) => {
    try {
      // 1. Fetch wishlist item relation mapping
      const res = await fetch(`/api/wishlist?userId=${uid}`)
      if (!res.ok) throw new Error('Failed to load wishlist mapping')
      const relations: WishlistItem[] = await res.ok ? await res.json() : []

      if (relations.length === 0) {
        setWishlistItems([])
        setLoading(false)
        return
      }

      // 2. Fetch all destinations to resolve details
      const destRes = await fetch('/api/destinations')
      if (!destRes.ok) throw new Error('Failed to load destinations')
      const allDests: Destination[] = await destRes.json()

      // 3. Filter destinations in wishlist
      const savedDestIds = relations.map((r) => Number(r.destination_id))
      const savedDests = allDests.filter((d) => savedDestIds.includes(Number(d.id)))

      setWishlistItems(savedDests)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (destId: number) => {
    if (!userId) return

    try {
      const res = await fetch(`/api/wishlist?userId=${userId}&destinationId=${destId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => Number(item.id) !== destId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">
          {/* Header */}
          <div className="pt-12 pb-10">
            <div className="flex items-center gap-2.5 mb-4 text-black/30">
              <Heart className="w-4 h-4 fill-current" />
              <p className="text-[10px] font-bold uppercase tracking-widest">My Saved Places</p>
            </div>
            <h1
              className="text-5xl md:text-6xl font-semibold text-black leading-[1.05] mb-4"
              style={{ letterSpacing: '-0.03em' }}
            >
              My Wishlist
            </h1>
            <p className="text-base text-black/40 max-w-lg leading-relaxed">
              Keep track of all the breathtaking places you want to visit on your next trip.
            </p>
          </div>

          {!userId ? (
            <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center max-w-md mx-auto my-12">
              <Heart className="w-12 h-12 text-black/10 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-sm text-gray-500 mb-6">
                Please sign in to your account to save and view destinations in your wishlist.
              </p>
              <Link
                href="/login?redirect=/wishlist"
                className="inline-block bg-brand text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
              >
                Sign In Now
              </Link>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center max-w-md mx-auto my-12">
              <Heart className="w-12 h-12 text-black/10 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Wishlist is Empty</h3>
              <p className="text-sm text-gray-500 mb-6">
                Browse our collection of stunning destinations and add them to your wishlist.
              </p>
              <Link
                href="/destinations"
                className="inline-block bg-brand text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
              >
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishlistItems.map((dest) => (
                <div
                  key={dest.id}
                  className="group bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-lg transition-all duration-300 relative"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.city}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      onClick={() => handleRemove(Number(dest.id))}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur hover:bg-white text-red-500 hover:text-red-700 p-2.5 rounded-full shadow-md transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3
                        className="text-white text-xl font-semibold"
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        {dest.city}
                      </h3>
                      <p className="text-white/80 text-xs">{dest.country}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-black/50 text-sm leading-relaxed mb-4">
                      {dest.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-black/40">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="fill-black/40" />
                        {dest.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {dest.category}
                      </span>
                      <span className="font-semibold text-black ml-auto">{dest.price}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-black/[0.04] flex items-center justify-between">
                      <Link
                        href={`/search?destination=${encodeURIComponent(dest.city)}`}
                        className="text-xs font-semibold text-black hover:underline"
                      >
                        Find Packages
                      </Link>
                      <Link
                        href={`/booking?destination=${encodeURIComponent(dest.city)}`}
                        className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-dark transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
