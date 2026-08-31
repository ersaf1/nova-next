'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Star, MapPin, CheckCircle2, Quote, Sparkles } from 'lucide-react'
import { useGSAPStagger } from '@/hooks/useGSAP'
import ScrollReveal from './ScrollReveal'

interface Testimonial {
  id: number
  name: string
  location: string
  avatar: string
  rating: number
  text: string
  trip: string
}

const DEFAULT_REVIEWS: Testimonial[] = [
  {
    id: 1,
    name: 'Reza Pramana & Siska',
    location: 'Jakarta, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    rating: 5,
    text: 'Sumpah pengalamannya luar biasa! Liburan ke Labuan Bajo naik kapal Phinisi semuanya diatur rapi dari tiket pesawat sampai makanan di kapal yang setara restoran bintang 5. Concierge NOVA sangat responsif.',
    trip: 'Labuan Bajo Phinisi Luxury'
  },
  {
    id: 2,
    name: 'Dion Kusuma',
    location: 'Surabaya, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    rating: 5,
    text: 'Fitur AI Travel Planner-nya gokil banget! Bikin rute 7 hari di Jepang langsung lengkap sama estimasi budget dan rekomendasi kuil yang gak terlalu ramai. E-ticket langsung terbit 2 menit setelah bayar.',
    trip: 'Japan Classic Cherry Blossom'
  },
  {
    id: 3,
    name: 'Anindya Putri',
    location: 'Bandung, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    rating: 5,
    text: 'Pertama kali solo trip ke Swiss dan awalnya takut nyasar, tapi berkat itinerary pocket offline dan support tim NOVA via WhatsApp, semuanya aman dan super seru. Worth every penny!',
    trip: 'Swiss Alps Experience'
  }
]

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_REVIEWS)
  const [stats, setStats] = useState({ rating: '4.95 / 5.0', recommend: '99.4%', travelers: '50,000+' })
  const ref = useGSAPStagger()

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data as Testimonial[])
        }
      })
      .catch(() => {})

    fetch('/api/stats')
      .then(r => r.json())
      .then((data: { statKey: string; value: string }[]) => {
        if (!Array.isArray(data)) return
        const get = (key: string) => data.find(s => s.statKey === key)?.value
        setStats({
          rating: get('app_rating') ?? '4.95 / 5.0',
          recommend: get('recommend_rate') ?? '99.4%',
          travelers: get('travelers') ?? '50,000+',
        })
      })
      .catch(() => {})
  }, [])

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="bg-white px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-neutral-200/70">
      <div className="max-w-[88rem] mx-auto space-y-12">
        
        {/* Section Header */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/70">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-dark bg-brand/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ulasan Terverifikasi</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
                Cerita dari Para Traveler
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xl font-normal">
                Kepuasan dan senyuman ribuan wisatawan yang telah menjelajahi dunia bersama NOVA.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              data-gsap="stagger"
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between bg-neutral-50 hover:bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 shadow-2xs hover:shadow-xl hover:-translate-y-1 relative"
            >
              <div className="space-y-4">
                {/* Rating Stars & Trip Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold bg-neutral-200/70 text-neutral-800 px-2.5 py-0.5 rounded-full truncate max-w-[140px]">
                    {t.trip}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed font-normal italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* Traveler Profile Footer */}
              <div className="flex items-center gap-3 pt-5 mt-6 border-t border-neutral-200/60">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200 bg-neutral-200">
                  <Image
                    src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                    alt={t.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-neutral-950 font-extrabold text-xs truncate">{t.name}</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400 text-[10px]">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Trust Score Metrics */}
        <div className="p-6 sm:p-8 bg-neutral-50 rounded-3xl border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
          <div className="pt-2 sm:pt-0">
            <span className="text-2xl sm:text-3xl font-black text-neutral-950 block tracking-tight">{stats.rating}</span>
            <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-0.5 block">Kepuasan Pengguna</span>
          </div>
          <div className="pt-4 sm:pt-0">
            <span className="text-2xl sm:text-3xl font-black text-neutral-950 block tracking-tight">{stats.recommend}</span>
            <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-0.5 block">Merekomendasikan NOVA</span>
          </div>
          <div className="pt-4 sm:pt-0">
            <span className="text-2xl sm:text-3xl font-black text-neutral-950 block tracking-tight">{stats.travelers}</span>
            <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-0.5 block">Perjalanan Sukses</span>
          </div>
        </div>

      </div>
    </section>
  )
}

export default TestimonialsSection
