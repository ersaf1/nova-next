'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import StarRating from './StarRating'

type Review = {
  id: number
  user_name: string
  user_email: string
  rating: number
  title: string | null
  body: string
  created_at: string
}

interface ReviewListProps {
  entityType: 'destination' | 'package'
  entityId: number
  refreshKey?: number
}

export default function ReviewList({ entityType, entityId, refreshKey = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/reviews?entity_type=${entityType}&entity_id=${entityId}`)
    const data = await res.json()
    setReviews(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [entityType, entityId])

  useEffect(() => { fetchReviews() }, [fetchReviews, refreshKey])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map(i => <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-neutral-900">{avgRating}</div>
          <div>
            <StarRating value={Number(avgRating)} readonly size="md" />
            <p className="text-neutral-400 text-xs mt-1">{reviews.length} ulasan</p>
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-neutral-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50 text-neutral-300" />
          <p className="text-sm">Belum ada ulasan. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const initials = review.user_name.slice(0, 2).toUpperCase()
            const date = new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
            return (
              <div key={review.id} className="bg-[#FAFBFB] border border-black/[0.04] rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-900/5 flex items-center justify-center text-xs font-bold text-neutral-700 shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{review.user_name}</p>
                      <p className="text-xs text-neutral-400">{date}</p>
                    </div>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
                {review.title && <p className="text-sm font-semibold text-neutral-900 mb-1">{review.title}</p>}
                <p className="text-sm text-neutral-600 leading-relaxed font-light">{review.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
