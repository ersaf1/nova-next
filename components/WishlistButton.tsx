'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'

interface Props {
  packageId: number
  className?: string
}

export default function WishlistButton({ packageId, className = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  const checkWishlist = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return
    try {
      const res = await fetch(`/api/wishlist?type=package`)
      const items = await res.json()
      if (Array.isArray(items)) {
        setWishlisted(items.some((i: { packageId: number }) => i.packageId === packageId))
      }
    } catch { /* ignore */ }
    finally { setChecked(true) }
  }

  useEffect(() => {
    void (async () => { await checkWishlist() })()
    // checkWishlist is stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (loading) return
    setLoading(true)

    // Optimistic update
    const prev = wishlisted
    setWishlisted(!prev)

    try {
      if (prev) {
        await fetch(`/api/wishlist?type=package&packageId=${packageId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'package', packageId }),
        })
      }
    } catch {
      setWishlisted(prev) // revert on error
    } finally {
      setLoading(false)
    }
  }

  if (!checked) return null

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
      className={[
        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
        wishlisted
          ? 'bg-red-50 hover:bg-red-100'
          : 'bg-white/90 backdrop-blur-sm hover:bg-white',
        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        'shadow-sm border border-black/[0.06]',
        className,
      ].join(' ')}
    >
      <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-500'}`} />
    </button>
  )
}
