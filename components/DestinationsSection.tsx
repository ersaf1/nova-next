'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Star, Heart, X, Clock, Compass, Sun, ShieldCheck } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { useStaggerReveal } from '@/hooks/useScrollAnimation'

interface Destination {
  id: number
  city: string
  country: string
  tagline: string
  price: string
  image: string
  tag: string | null
  rating: number
  duration: string
  weather?: string
  tourCount?: number
}

const tagColors: Record<string, string> = {
  Popular: 'bg-neutral-900 text-white',
  Trending: 'bg-rose-500 text-white',
  "Editor's Pick": 'bg-amber-500 text-white',
  New: 'bg-emerald-600 text-white',
}

const DEFAULT_IMAGES: Record<string, string> = {
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1000&auto=format&q=80',
  Santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&auto=format&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1000&auto=format&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&q=80',
  'Labuan Bajo': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1000&auto=format&q=80',
  Paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&auto=format&q=80',
  Rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&auto=format&q=80',
  'Swiss Alps': 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1000&auto=format&q=80',
}

const staticDestinations: Destination[] = [
  { id: 1, city: 'Bali', country: 'Indonesia', tagline: 'Pantai eksotis, pura megah, dan ketenangan Ubud', price: 'Mulai Rp 3.500.000', image: DEFAULT_IMAGES.Bali, tag: 'Popular', rating: 4.9, duration: '4–7 Hari', weather: '29°C Cerah', tourCount: 24 },
  { id: 2, city: 'Tokyo', country: 'Jepang', tagline: 'Perpaduan tradisi kuil kuno & metropolis futuristik', price: 'Mulai Rp 18.500.000', image: DEFAULT_IMAGES.Tokyo, tag: 'Trending', rating: 4.9, duration: '7–10 Hari', weather: '18°C Sejuk', tourCount: 18 },
  { id: 3, city: 'Labuan Bajo', country: 'Indonesia', tagline: 'Pelayaran Phinisi mewah & Pulau Komodo purba', price: 'Mulai Rp 4.900.000', image: DEFAULT_IMAGES['Labuan Bajo'], tag: "Editor's Pick", rating: 4.9, duration: '3–5 Hari', weather: '30°C Cerah', tourCount: 15 },
  { id: 4, city: 'Santorini', country: 'Yunani', tagline: 'Sunset magis di tebing Caldera rumah putih berkilau', price: 'Mulai Rp 26.000.000', image: DEFAULT_IMAGES.Santorini, tag: 'Trending', rating: 4.8, duration: '5–8 Hari', weather: '24°C Cerah', tourCount: 12 },
  { id: 5, city: 'Swiss Alps', country: 'Swiss', tagline: 'Puncak salju abadi Matterhorn & desa dongeng Alpine', price: 'Mulai Rp 38.000.000', image: DEFAULT_IMAGES['Swiss Alps'], tag: 'New', rating: 4.9, duration: '8–12 Hari', weather: '12°C Pegunungan', tourCount: 10 },
  { id: 6, city: 'Paris', country: 'Prancis', tagline: 'Kota cinta dengan seni Louvre & pesona Menara Eiffel', price: 'Mulai Rp 22.000.000', image: DEFAULT_IMAGES.Paris, tag: 'Popular', rating: 4.8, duration: '6–9 Hari', weather: '19°C Hangat', tourCount: 14 },
]

interface LightboxProps {
  dest: Destination
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  saved: Set<string>
  onToggleSave: (city: string, e: React.MouseEvent) => void
}

const Lightbox: React.FC<LightboxProps> = ({ dest, onClose, onPrev, onNext, saved, onToggleSave }) => {
  const imageUrl = dest.image || DEFAULT_IMAGES[dest.city] || DEFAULT_IMAGES.Bali

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        
        {/* Left: Image Container */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[340px] bg-neutral-900">
          <Image src={imageUrl} alt={dest.city} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {dest.tag && (
            <span className={`absolute top-4 left-4 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${tagColors[dest.tag] || 'bg-neutral-900 text-white'}`}>
              {dest.tag}
            </span>
          )}
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">{dest.country}</p>
            <h3 className="text-2xl font-extrabold">{dest.city}</h3>
          </div>
        </div>

        {/* Right: Content Details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{dest.rating} Rating Terverifikasi</span>
              </div>
              {dest.weather && (
                <div className="flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full font-medium">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{dest.weather}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-neutral-950 mb-1">
                Eksplorasi {dest.city}
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                {dest.tagline}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Durasi Ideal</p>
                <p className="text-xs font-bold text-neutral-900 mt-0.5">{dest.duration}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Estimasi Harga</p>
                <p className="text-xs font-bold text-brand-dark mt-0.5">{dest.price}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <Link
              href={`/search?destination=${encodeURIComponent(dest.city)}`}
              className="flex-1 bg-brand hover:bg-brand-dark text-white font-extrabold text-xs py-3.5 rounded-2xl transition-all shadow-md shadow-brand/30 flex items-center justify-center gap-2"
            >
              <span>Lihat Paket Wisata {dest.city}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={(e) => onToggleSave(dest.city, e)}
              className={`p-3.5 rounded-2xl border transition-all ${
                saved.has(dest.city)
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved.has(dest.city) ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const DestinationsSection: React.FC = () => {
  const router = useRouter()
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [destinations, setDestinations] = useState<Destination[]>(staticDestinations)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { ref: destGridRef } = useStaggerReveal({ stagger: 0.08, duration: 0.6, distance: 40 })

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => r.json())
      .then((data: Destination[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((d, i) => ({
            ...d,
            image: d.image || DEFAULT_IMAGES[d.city] || staticDestinations[i % staticDestinations.length].image,
            weather: staticDestinations[i % staticDestinations.length]?.weather || '28°C Cerah',
            tourCount: staticDestinations[i % staticDestinations.length]?.tourCount || 12,
          }))
          setDestinations(merged)
        }
      })
      .catch(() => setDestinations(staticDestinations))
  }, [])

  const toggleSave = (city: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(prev => {
      const next = new Set(prev)
      if (next.has(city)) next.delete(city)
      else next.add(city)
      return next
    })
  }

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevLightbox = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + destinations.length) % destinations.length : null), [destinations.length])
  const nextLightbox = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % destinations.length : null), [destinations.length])

  return (
    <>
      <section id="destinations" className="bg-[#F8FAFC] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-neutral-200/70">
        <div className="max-w-[88rem] mx-auto space-y-12">
          
          {/* Header */}
          <ScrollReveal animation="slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/70">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-dark bg-brand/10 px-3 py-1 rounded-full">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Destinasi Terpopuler Dunia</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
                  Pilihan Favorit Wisatawan
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-xl font-normal">
                  Koleksi destinasi impian dengan jaminan pengalaman terbaik, rute terlengkap, dan harga terjangkau.
                </p>
              </div>

              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold px-5 py-3 rounded-full transition-all shrink-0 shadow-xs group"
              >
                <span>Lihat Semua Destinasi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Destinations Bento Grid */}
          <div ref={destGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.slice(0, 6).map((dest, i) => {
              const imageUrl = dest.image || DEFAULT_IMAGES[dest.city] || staticDestinations[0].image
              const isSaved = saved.has(dest.city)

              return (
                <div
                  key={dest.id || i}
                  onClick={() => setLightboxIndex(i)}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 h-80 sm:h-96 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 border border-neutral-200/40"
                >
                  {/* Background Image */}
                  <img
                    src={imageUrl}
                    alt={`${dest.city}, ${dest.country}`}
                    loading="lazy"
                    className="w-full h-full object-cover img-smooth-zoom"
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    {dest.tag ? (
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${tagColors[dest.tag] || 'bg-neutral-900 text-white'}`}>
                        {dest.tag}
                      </span>
                    ) : <span />}

                    <button
                      onClick={(e) => toggleSave(dest.city, e)}
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors shadow-xs"
                      aria-label={`Simpan ${dest.city}`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Card Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/75 mb-0.5">
                        <MapPin className="w-3 h-3 text-brand" />
                        <span>{dest.country}</span>
                        {dest.weather && <span>• {dest.weather}</span>}
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                        {dest.city}
                      </h3>
                      <p className="text-xs text-white/70 line-clamp-1 font-normal mt-0.5">
                        {dest.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Mulai Dari</p>
                        <p className="text-sm font-extrabold text-white">{dest.price}</p>
                      </div>

                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 group-hover:bg-brand group-hover:border-brand transition-colors flex items-center gap-1">
                        <span>Lihat Paket</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {lightboxIndex !== null && destinations[lightboxIndex] && (
        <Lightbox
          dest={destinations[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
          saved={saved}
          onToggleSave={toggleSave}
        />
      )}
    </>
  )
}

export default DestinationsSection
