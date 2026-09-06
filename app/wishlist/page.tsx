'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Star, Trash2, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">
          {/* Header */}
          <div className="pt-12 pb-10">
            <div className="flex items-center gap-2 mb-3 text-[#C29B38]">
              <Heart className="w-4 h-4 fill-current" />
              <p className="text-[11px] font-bold uppercase tracking-[0.25em]">07 &middot; My Curated Saved Places</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 leading-[1.05] mb-4 tracking-tight">
              My <span className="font-serif-luxury italic font-normal text-[#C29B38]">Wishlist</span>
            </h1>
            <p className="text-sm md:text-base text-stone-600 max-w-lg leading-relaxed font-normal">
              Keep track of all the breathtaking places you want to visit on your next trip.
            </p>
          </div>

          {!userId ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
              <Heart className="w-12 h-12 text-[#C29B38]/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif-luxury">Login Required</h3>
              <p className="text-xs text-stone-500 mb-6">
                Please sign in to your account to save and view destinations in your wishlist.
              </p>
              <Link
                href="/login?redirect=/wishlist"
                className="inline-block bg-stone-900 text-[#FAF9F6] text-xs font-bold px-7 py-3.5 rounded-full hover:bg-black transition-colors shadow-md shadow-stone-900/10 cursor-pointer"
              >
                Sign In Now
              </Link>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
              <Heart className="w-12 h-12 text-[#C29B38]/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif-luxury">Your Wishlist is Empty</h3>
              <p className="text-xs text-stone-500 mb-6">
                Browse our collection of stunning destinations and add them to your wishlist.
              </p>
              <Link
                href="/destinations"
                className="inline-block bg-stone-900 text-[#FAF9F6] text-xs font-bold px-7 py-3.5 rounded-full hover:bg-black transition-colors shadow-md shadow-stone-900/10 cursor-pointer"
              >
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((dest) => (
                <div
                  key={dest.id}
                  className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
                >
                  <div className="relative h-56 overflow-hidden bg-stone-900">
                    <img
                      src={dest.image}
                      alt={dest.city}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                    <button
                      onClick={() => handleRemove(Number(dest.id))}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur hover:bg-white text-rose-500 hover:text-rose-700 p-2.5 rounded-full shadow-md transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3
                        className="text-white text-xl font-normal font-serif-luxury"
                      >
                        {dest.city}
                      </h3>
                      <p className="text-white/80 text-xs font-medium">{dest.country}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal line-clamp-2">
                      {dest.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-stone-500 pb-4 border-b border-stone-100">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {dest.rating}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-[#C29B38]" />
                        {dest.category}
                      </span>
                      <span className="font-black text-stone-900 ml-auto">{dest.price}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/search?destination=${encodeURIComponent(dest.city)}`}
                        className="text-xs font-bold text-stone-700 hover:text-stone-950 hover:underline"
                      >
                        Find Packages
                      </Link>
                      <Link
                        href={`/booking?destination=${encodeURIComponent(dest.city)}`}
                        className="bg-stone-900 text-[#FAF9F6] text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-colors"
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

      <Footer />
    </div>
  )
}
