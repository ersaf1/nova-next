'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Star, Heart, X, Clock } from 'lucide-react'
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
}

const tagColors: Record<string, string> = {
  Popular: 'bg-black/70 text-white',
  Trending: 'bg-rose-500/90 text-white',
  "Editor's Pick": 'bg-amber-400/90 text-black',
  New: 'bg-emerald-500/90 text-white',
}

const DEFAULT_IMAGES: Record<string, string> = {
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&q=75',
  Santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&q=75',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&q=75',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&q=75',
  Paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&q=75',
  Rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&q=75',
  Reykjavik: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&auto=format&q=75',
  'Machu Picchu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&auto=format&q=75',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&q=75'

const staticDestinations: Destination[] = [
  { id: 1, city: 'Tokyo', country: 'Japan', tagline: 'Where tradition meets tomorrow', price: 'From $899', image: DEFAULT_IMAGES.Tokyo, tag: 'Popular', rating: 4.9, duration: '7–10 days' },
  { id: 2, city: 'Santorini', country: 'Greece', tagline: 'Sunsets worth crossing oceans for', price: 'From $1,199', image: DEFAULT_IMAGES.Santorini, tag: 'Trending', rating: 4.8, duration: '5–8 days' },
  { id: 3, city: 'New York', country: 'USA', tagline: 'The city that never stops inspiring', price: 'From $749', image: DEFAULT_IMAGES['New York'], tag: null, rating: 4.7, duration: '4–7 days' },
  { id: 4, city: 'Bali', country: 'Indonesia', tagline: 'Spirit, serenity, and soul', price: 'From $699', image: DEFAULT_IMAGES.Bali, tag: "Editor's Pick", rating: 4.9, duration: '7–14 days' },
  { id: 5, city: 'Paris', country: 'France', tagline: 'Romance written in stone and light', price: 'From $1,049', image: DEFAULT_IMAGES.Paris, tag: null, rating: 4.8, duration: '4–6 days' },
  { id: 6, city: 'Rome', country: 'Italy', tagline: 'History, beauty, and culinary magic', price: 'From $949', image: DEFAULT_IMAGES.Rome, tag: 'Popular', rating: 4.8, duration: '5–7 days' },
  { id: 7, city: 'Reykjavik', country: 'Iceland', tagline: 'Land of fire, ice, and aurora skies', price: 'From $1,249', image: DEFAULT_IMAGES.Reykjavik, tag: 'Trending', rating: 4.9, duration: '6–9 days' },
  { id: 8, city: 'Machu Picchu', country: 'Peru', tagline: 'Ancient mystery high in the clouds', price: 'From $1,399', image: DEFAULT_IMAGES['Machu Picchu'], tag: null, rating: 4.9, duration: '8–12 days' },
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
  const imageUrl = dest.image || DEFAULT_IMAGES[dest.city] || FALLBACK_IMAGE

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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }} onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px) brightness(0.25)', transform: 'scale(1.1)' }} />
      <div className="relative w-full max-w-5xl mx-4 sm:mx-6 rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-2xl" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="relative w-full sm:w-[45%] h-56 sm:h-auto shrink-0 overflow-hidden bg-neutral-900" style={{ maxHeight: '420px' }}>
          <Image src={imageUrl} alt={dest.city} fill className="object-cover" sizes="(max-width: 640px) 100vw, 45vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/20" />
          {dest.tag && <span className={`absolute top-5 left-5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${tagColors[dest.tag]}`}>{dest.tag}</span>}
          <div className="absolute bottom-6 left-6 sm:hidden">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{dest.country}</p>
            <h2 className="text-white text-3xl font-bold" style={{ letterSpacing: '-0.03em' }}>{dest.city}</h2>
          </div>
        </div>

        <div
          className="flex-1 flex flex-col justify-between p-8 sm:p-10 overflow-y-auto"
          style={{
            background: 'rgba(8,8,18,0.85)',
            backdropFilter: 'blur(28px) saturate(150%)',
            WebkitBackdropFilter: 'blur(28px) saturate(150%)',
            borderLeft: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
          <div>
            <div className="hidden sm:flex items-center gap-1 mb-2">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{dest.country}</span>
            </div>
            <h2 className="hidden sm:block text-white text-4xl font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>{dest.city}</h2>
            <p className="text-white/60 text-base leading-relaxed mb-8">{dest.tagline || 'Explore extraordinary scenery, culture, and unforgettable travel experiences.'}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.10)' }} className="p-4">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span className="text-white font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>{dest.rating || 4.8}</span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Rating</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.10)' }} className="p-4">
                <div className="flex items-center gap-1 mb-1"><Clock className="w-3.5 h-3.5 text-white/40" /></div>
                <p className="text-white font-bold text-sm mb-1">{dest.duration || '5-7 days'}</p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Duration</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.10)' }} className="p-4">
                <p className="text-white font-bold text-lg leading-tight mb-1" style={{ letterSpacing: '-0.02em' }}>{dest.price.replace('From ', '')}</p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">From / person</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/search?destination=${encodeURIComponent(dest.city)}`} className="flex-1 bg-white text-black font-bold text-sm py-4 rounded-2xl hover:bg-neutral-100 transition-colors duration-200 flex items-center justify-center gap-2">
              <span>View Packages & Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={(e) => onToggleSave(dest.city, e)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${saved.has(dest.city) ? 'bg-rose-50 border border-rose-200' : ''}`} style={saved.has(dest.city) ? undefined : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} aria-label={`Save ${dest.city}`}>
              <Heart className={`w-5 h-5 ${saved.has(dest.city) ? 'fill-rose-400 text-rose-400' : 'text-white/50'}`} />
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors z-10" aria-label="Close">
          <X className="w-4 h-4 text-white" />
        </button>
        <button onClick={e => { e.stopPropagation(); onPrev() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur hidden sm:flex items-center justify-center hover:bg-black/60 transition-colors z-10 rotate-180" aria-label="Previous">
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
        <button onClick={e => { e.stopPropagation(); onNext() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur hidden sm:flex items-center justify-center hover:bg-black/60 transition-colors z-10" aria-label="Next">
          <ArrowRight className="w-4 h-4 text-white" />
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
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { ref: destGridRef } = useStaggerReveal({ stagger: 0.08, duration: 0.7, distance: 70 })

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in-view'); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/destinations', { signal: controller.signal })
      .then(r => r.json())
      .then((data: Destination[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map(d => ({
            ...d,
            image: d.image || DEFAULT_IMAGES[d.city] || FALLBACK_IMAGE
          }))
          setDestinations(merged)
        } else {
          setDestinations(staticDestinations)
        }
      })
      .catch(() => setDestinations(staticDestinations))
    return () => controller.abort()
  }, [])

  const toggleSave = (city: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(prev => { const next = new Set(prev); next.has(city) ? next.delete(city) : next.add(city); return next })
  }

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevLightbox = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + destinations.length) % destinations.length : null), [destinations.length])
  const nextLightbox = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % destinations.length : null), [destinations.length])

  return (
    <>
      <section id="destinations" className="bg-[#F5F5F5] px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-[88rem] mx-auto">
          <ScrollReveal animation="slide-up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-12 gap-4">
              <div>
                <p className="text-black/40 text-xs font-medium tracking-widest uppercase mb-2">Where to next</p>
                <h2 ref={headingRef} className="heading-animate text-black text-3xl sm:text-4xl md:text-5xl font-medium leading-tight" style={{ letterSpacing: '-0.03em' }}>Top Destinations</h2>
              </div>
              <a href="/destinations" className="inline-flex items-center gap-2 text-black/60 font-medium text-sm hover:text-black transition-colors duration-200 group shrink-0">
                View all<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
            </div>
          </ScrollReveal>

            <div ref={destGridRef} className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 sm:auto-rows-[200px]">
              {destinations.slice(0, 5).map((dest, i) => {
                // Mobile: 1 col each
                // Tablet/Desktop: Row 1 (2+1), Row 2 (1+2), Row 3 (3)
                const isWide = i === 0 || i === 3
                const isFullWidth = i === 4
                const imageUrl = dest.image || DEFAULT_IMAGES[dest.city] || FALLBACK_IMAGE

                return (
                  <div
                    key={dest.id}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 h-48 sm:h-auto ${isFullWidth ? 'sm:col-span-3' : isWide ? 'sm:col-span-2' : 'sm:col-span-1'}`}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${dest.city}, ${dest.country}`}
                      loading="lazy"
                      className="w-full h-full object-cover img-smooth-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    {dest.tag && <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tagColors[dest.tag]}`}>{dest.tag}</span>}
                    <button onClick={(e) => toggleSave(dest.city, e)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50" aria-label={`Save ${dest.city}`}>
                      <Heart className={`w-3.5 h-3.5 ${saved.has(dest.city) ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1 mb-0.5"><MapPin className="w-2.5 h-2.5 text-white/60" /><span className="text-white/60 text-[9px] font-bold uppercase tracking-wider">{dest.country}</span></div>
                      <h3 className="text-white font-bold leading-tight" style={{ fontSize: isWide ? '1.25rem' : '1rem', letterSpacing: '-0.02em' }}>{dest.city}</h3>
                      <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-white/80 text-xs font-semibold">{dest.price}</span>
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-white text-xs font-bold">{dest.rating}</span></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          router.push(`/search?destination=${encodeURIComponent(dest.city)}`)
                        }}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white/40 transition-colors shadow-lg"
                        title={`Explorasi ${dest.city}`}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

          <div className="mt-10 flex justify-center">
            <Link href="/destinations" className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-neutral-800 transition-colors duration-200">
              <span>All destinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      {lightboxIndex !== null && destinations[lightboxIndex] && (
        <Lightbox dest={destinations[lightboxIndex]} onClose={closeLightbox} onPrev={prevLightbox} onNext={nextLightbox} saved={saved} onToggleSave={toggleSave} />
      )}
    </>
  )
}

export default DestinationsSection
