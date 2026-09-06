'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Star, Clock, ArrowRight, Heart, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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

const ITEMS_PER_PAGE = 12

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset to page 1 whenever category or search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

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

  // Pagination Math
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDestinations = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 320, behavior: 'smooth' })
  }

  // Generate page numbers to render with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">

          {/* Header */}
          <div className="pt-8 pb-8 border-b border-stone-200/80 mb-8">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200 mb-3">
              <span>Destinasi Terverifikasi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 leading-[1.05] mb-4 tracking-tight">
              Katalog Destinasi <span className="font-serif-luxury italic font-normal text-stone-800">Pilihan Dunia</span>
            </h1>
            <p className="text-sm md:text-base text-stone-500 max-w-xl leading-relaxed font-normal">
              Eksplorasi destinasi liburan kurasi, pesisir pantai tropis, puncak pegunungan, dan warisan budaya otentik.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari negara (misal: Indonesia, Japan, Greece)..."
                className="w-full bg-white border border-stone-200/80 rounded-full pl-10 pr-10 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all shadow-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer">
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
                  className={`px-4 py-2.5 text-xs font-bold rounded-full shrink-0 transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:text-stone-950 border border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden animate-pulse">
                  <div className="h-56 bg-stone-200/60" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-stone-200/60 rounded-full w-2/3" />
                    <div className="h-4 bg-stone-200/60 rounded-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Destination Cards Grid */}
          {!loading && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <p className="text-xs text-stone-500 font-medium">
                  Menampilkan <span className="font-bold text-stone-900">{filtered.length > 0 ? startIndex + 1 : 0} – {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</span> dari <span className="font-bold text-stone-900">{filtered.length}</span> destinasi negara
                </p>
                <p className="text-xs text-stone-400 font-medium">
                  Halaman <span className="font-bold text-stone-900">{currentPage}</span> dari <span className="font-bold text-stone-900">{totalPages}</span>
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-stone-200/80 space-y-3">
                  <p className="text-base font-bold text-stone-900">Destinasi tidak ditemukan.</p>
                  <p className="text-xs text-stone-500">Coba ubah kata kunci pencarian negara atau pilih kategori lain.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedDestinations.map((dest) => {
                    const isSaved = wishlistIds.includes(Number(dest.id))
                    return (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.id}`}
                        className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between shadow-xs hover:-translate-y-1"
                      >
                        <div className="relative h-56 overflow-hidden bg-stone-900">
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
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white text-stone-900 p-2.5 rounded-full shadow-md z-10 transition-colors cursor-pointer"
                            title={isSaved ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
                          >
                            <Heart size={16} className={`${isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-900'}`} />
                          </button>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/25 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white text-xl font-bold tracking-tight">{dest.city}</h3>
                            <p className="text-amber-200/90 text-xs font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#C29B38]" />
                              {dest.country}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <p className="text-stone-600 text-xs leading-relaxed line-clamp-2 font-normal">{dest.description}</p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
                            <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md">
                              <Star size={12} className="fill-[#C29B38] text-[#C29B38]" />
                              {dest.rating}
                            </span>
                            <span className="flex items-center gap-1 text-stone-400 font-medium">
                              <Clock size={12} />
                              {dest.duration}
                            </span>
                            <span className="font-bold text-stone-950 text-xs">{dest.price}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200/80">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 hover:text-stone-900 text-stone-900 text-xs font-bold disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-stone-900 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Halaman Sebelumnya</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                    {getPageNumbers().map((p, idx) => (
                      <React.Fragment key={idx}>
                        {typeof p === 'number' ? (
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              currentPage === p
                                ? 'bg-stone-900 text-white shadow-xs scale-105'
                                : 'bg-white text-stone-700 hover:text-stone-950 border border-stone-200/80 hover:border-stone-300'
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span className="px-2 text-xs text-stone-400 font-bold">...</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 hover:text-stone-900 text-stone-900 text-xs font-bold disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-stone-900 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Halaman Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}
