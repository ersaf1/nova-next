'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'
import { formatIDR } from '@/lib/types'

interface WishlistItem {
  id: number
  packageId: number
  Package: {
    id: number
    title: string
    slug?: string
    image?: string
    coverImage?: string
    price: number
    rating: number
    duration?: string
    category?: string
  }
}

export default function DashboardWishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist?type=package')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login?redirect=/dashboard/wishlist'); return }
      fetchWishlist()
    })
    // fetchWishlist and router are stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemove = async (packageId: number) => {
    setRemoving(packageId)
    try {
      await fetch(`/api/wishlist?type=package&packageId=${packageId}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.packageId !== packageId))
    } finally { setRemoving(null) }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          <aside className="w-48 shrink-0 hidden md:block">
            <DashboardNav />
          </aside>
          <main className="flex-1 min-w-0 space-y-6">
            <h1 className="text-xl font-bold text-black">Wishlist</h1>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden animate-pulse">
                    <div className="h-44 bg-neutral-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-neutral-100 rounded w-3/4" />
                      <div className="h-4 bg-neutral-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.06] p-12 text-center">
                <Heart className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="font-semibold text-black mb-1">Wishlist masih kosong</p>
                <p className="text-sm text-neutral-400 mb-6">Temukan paket wisata yang kamu suka dan simpan ke sini.</p>
                <Link href="/search" className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors">
                  Cari Paket
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => {
                  const pkg = item.Package
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden group">
                      <div className="relative h-44 bg-neutral-100 overflow-hidden">
                        {(pkg.coverImage ?? pkg.image) && (
                          <img src={pkg.coverImage ?? pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <button
                          onClick={() => handleRemove(pkg.id)}
                          disabled={removing === pkg.id}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        >
                          <Heart className={`w-4 h-4 ${removing === pkg.id ? 'opacity-50' : 'fill-red-500 text-red-500'}`} />
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-semibold text-black text-sm leading-snug">{pkg.title}</p>
                          {pkg.category && <p className="text-xs text-neutral-400 mt-0.5">{pkg.category}</p>}
                        </div>
                        <p className="text-sm font-bold text-black">
                          {formatIDR(pkg.price)}
                          <span className="text-xs font-normal text-neutral-400"> / orang</span>
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/packages/${pkg.slug ?? pkg.id}`}
                            className="flex-1 text-center text-xs font-semibold border border-black/10 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
                          >
                            Lihat Detail
                          </Link>
                          <Link
                            href={`/packages/${pkg.slug ?? pkg.id}`}
                            className="flex-1 text-center text-xs font-semibold bg-black text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition-colors"
                          >
                            Booking
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
