'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Award, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react'
import { useGSAPStagger } from '@/hooks/useGSAP'
import ScrollReveal from './ScrollReveal'

interface ReviewItem {
  id: number | string
  name: string
  content?: string
  text?: string
  rating?: number
  role?: string
  location?: string
  trip?: string
  verified?: boolean
  country?: string
}

const TRIP_IMAGES: Record<string, string> = {
  'Bali Paradise Escape': '/uploads/packages/bali_escape.jpg',
  'Japan Cherry Blossom': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  'Santorini Sunsets': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  'Labuan Bajo & Komodo Sailing': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80',
  'Swiss Alpine Odyssey': 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&q=80',
}

const DEFAULT_TRIP_PHOTO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'

const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useGSAPStagger()

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data as ReviewItem[])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="bg-[#FAF9F6] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto space-y-10">
        
        {/* Section Header */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
                <Award className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>Ulasan Terverifikasi</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
                Pengalaman dari <span className="font-serif-luxury italic font-normal text-stone-800">Para Traveler</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
                Ulasan asli dari wisatawan yang telah merasakan perjalanan kurasi bersama NOVA.
              </p>
            </div>

            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-[#C29B38] bg-white border border-stone-200 px-5 py-3 rounded-full hover:border-stone-300 transition-all shadow-xs shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-900"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Lihat Semua Ulasan</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Real Reviews with Visual Travel Destination Photos */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((t, idx) => {
              const reviewText = (t.content || t.text || '').replace('—', '-')
              const reviewerName = t.name || 'Traveler NOVA'
              const tripName = t.trip || 'Destinasi Impian'
              const tripPhoto = TRIP_IMAGES[tripName] || DEFAULT_TRIP_PHOTO
              const initials = reviewerName
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <div
                  key={t.id || idx}
                  data-gsap="stagger"
                  className="rounded-3xl overflow-hidden flex flex-col justify-between bg-white border border-stone-200 hover:border-stone-300 transition-all duration-300 shadow-xs hover:shadow-md group"
                >
                  {/* Photo Header — 80% Visual Hero of Review */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-950">
                    <img
                      src={tripPhoto}
                      alt={tripName}
                      className="w-full h-full object-cover img-smooth-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white border border-white/20">
                        {tripName}
                      </span>
                      <div className="flex gap-0.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#C29B38] text-[#C29B38]" />
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold text-white/90 truncate">
                        {t.location || t.country || 'Verified Trip'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Terverifikasi</span>
                      </span>
                    </div>
                  </div>

                  {/* Concise Review Text — 20% Words */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-normal line-clamp-3">
                      &ldquo;{reviewText}&rdquo;
                    </p>

                    <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-xs text-stone-700 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {reviewerName}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">
                          {t.role || 'Traveler'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center max-w-3xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-[#C29B38]">
              <Award className="w-6 h-6 text-[#C29B38]" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">
              Komitmen Transparansi Pengalaman Tamu
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              NOVA hanya menampilkan ulasan asli dari traveler yang telah menyelesaikan pemesanan resmi. Setiap tamu berhak menuliskan ulasan terverifikasi setelah kepulangan.
            </p>
            <div className="pt-2">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-black transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-stone-900"
              >
                <span>Bagikan Ulasan Perjalanan Anda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}

export default TestimonialsSection
