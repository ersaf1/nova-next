'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Star, Heart, X, Clock } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

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

const staticDestinations: Destination[] = [
  { id: 1, city: 'Tokyo', country: 'Japan', tagline: 'Where tradition meets tomorrow', price: 'From $899', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85', tag: 'Popular', rating: 4.9, duration: '7–10 days' },
  { id: 2, city: 'Santorini', country: 'Greece', tagline: 'Sunsets worth crossing oceans for', price: 'From $1,199', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85', tag: 'Trending', rating: 4.8, duration: '5–8 days' },
  { id: 3, city: 'New York', country: 'USA', tagline: 'The city that never stops inspiring', price: 'From $749', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=85', tag: null, rating: 4.7, duration: '4–7 days' },
  { id: 4, city: 'Bali', country: 'Indonesia', tagline: 'Spirit, serenity, and soul', price: 'From $699', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85', tag: "Editor's Pick", rating: 4.9, duration: '7–14 days' },
  { id: 5, city: 'Paris', country: 'France', tagline: 'Romance written in stone and light', price: 'From $1,049', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85', tag: null, rating: 4.8, duration: '4–6 days' },
  { id: 6, city: 'Rome', country: 'Italy', tagline: 'History, beauty, and culinary magic', price: 'From $949', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=85', tag: 'Popular', rating: 4.8, duration: '5–7 days' },
  { id: 7, city: 'Reykjavik', country: 'Iceland', tagline: 'Land of fire, ice, and aurora skies', price: 'From $1,249', image: 'https://images.unsplash.com/photo-1504829857797-ddff28127792?w=1200&q=85', tag: 'Trending', rating: 4.9, duration: '6–9 days' },
  { id: 8, city: 'Machu Picchu', country: 'Peru', tagline: 'Ancient mystery high in the clouds', price: 'From $1,399', image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add8?w=1200&q=85', tag: null, rating: 4.9, duration: '8–12 days' },
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
      <div className="absolute inset-0" style={{ backgroundImage: `url(${dest.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px) brightness(0.25)', transform: 'scale(1.1)' }} />
      <div className="relative w-full max-w-5xl mx-4 sm:mx-6 rounded-3xl overflow-hidden flex flex-col sm:flex-row" style={{ maxHeight: '90vh', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
        <div className="relative w-full sm:w-[60%] h-72 sm:h-auto shrink-0 overflow-hidden">
          <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" style={{ minHeight: '420px' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/20" />
          {dest.tag && <span className={`absolute top-5 left-5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${tagColors[dest.tag]}`}>{dest.tag}</span>}
          <div className="absolute bottom-6 left-6 sm:hidden">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{dest.country}</p>
            <h2 className="text-white text-3xl font-bold" style={{ letterSpacing: '-0.03em' }}>{dest.city}</h2>
          </div>
        </div>
        <div className="flex-1 bg-white flex flex-col justify-between p-8 sm:p-10 overflow-y-auto">
          <div>
            <div className="hidden sm:flex items-center gap-1 mb-2"><MapPin className="w-3.5 h-3.5 text-black/40" /><span className="text-black/40 text-xs font-bold uppercase tracking-widest">{dest.country}</span></div>
            <h2 className="hidden sm:block text-black text-4xl font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>{dest.city}</h2>
            <p className="text-black/60 text-base leading-relaxed mb-8">{dest.tagline}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-neutral-50 rounded-2xl p-4"><div className="flex items-center gap-1 mb-1"><Star className="w-3.5 h-3.5 fill-black text-black" /><span className="text-black font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>{dest.rating}</span></div><p className="text-black/40 text-[10px] font-bold uppercase tracking-wider">Rating</p></div>
              <div className="bg-neutral-50 rounded-2xl p-4"><div className="flex items-center gap-1 mb-1"><Clock className="w-3.5 h-3.5 text-black/60" /></div><p className="text-black font-bold text-sm mb-1">{dest.duration}</p><p className="text-black/40 text-[10px] font-bold uppercase tracking-wider">Duration</p></div>
              <div className="bg-neutral-50 rounded-2xl p-4"><p className="text-black font-bold text-lg leading-tight mb-1" style={{ letterSpacing: '-0.02em' }}>{dest.price.replace('From ', '')}</p><p className="text-black/40 text-[10px] font-bold uppercase tracking-wider">From / person</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/booking" className="flex-1 bg-black text-white font-bold text-sm py-4 rounded-2xl hover:bg-neutral-800 transition-colors duration-200 flex items-center justify-center gap-2">Book now<ArrowRight className="w-4 h-4" /></Link>
            <button onClick={(e) => onToggleSave(dest.city, e)} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-200 ${saved.has(dest.city) ? 'bg-rose-50 border-rose-200' : 'bg-neutral-50 border-black/[0.06] hover:bg-neutral-100'}`} aria-label={`Save ${dest.city}`}>
              <Heart className={`w-5 h-5 ${saved.has(dest.city) ? 'fill-rose-400 text-rose-400' : 'text-black/50'}`} />
            </button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors z-10" aria-label="Close"><X className="w-4 h-4 text-white" /></button>
        <button onClick={e => { e.stopPropagation(); onPrev() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur hidden sm:flex items-center justify-center hover:bg-black/60 transition-colors z-10 rotate-180" aria-label="Previous"><ArrowRight className="w-4 h-4 text-white" /></button>
        <button onClick={e => { e.stopPropagation(); onNext() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur hidden sm:flex items-center justify-center hover:bg-black/60 transition-colors z-10" aria-label="Next"><ArrowRight className="w-4 h-4 text-white" /></button>
      </div>
    </div>
  )
}

const DestinationsSection: React.FC = () => {
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => r.json())
      .then((data: Destination[]) => {
        if (data && data.length >= staticDestinations.length) setDestinations(data)
        else setDestinations(staticDestinations)
      })
      .catch(() => setDestinations(staticDestinations))
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
                <h2 className="text-black text-3xl sm:text-4xl md:text-5xl font-medium leading-tight" style={{ letterSpacing: '-0.03em' }}>Top Destinations</h2>
              </div>
              <a href="/destinations" className="inline-flex items-center gap-2 text-black/60 font-medium text-sm hover:text-black transition-colors duration-200 group shrink-0">View all<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" /></a>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerChildren={true} animation="slide-up" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px]">
              {destinations.slice(0, 8).map((dest, i) => {
                const isTall = i === 0 || i === 5 || i === 10
                const isWide = i === 3 || i === 8
                return (
                  <div key={dest.id} className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 ${isTall ? 'row-span-2' : ''} ${isWide ? 'col-span-2' : ''}`} onClick={() => setLightboxIndex(i)}>
                    <img src={dest.image} alt={`${dest.city}, ${dest.country}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {dest.tag && <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tagColors[dest.tag]}`}>{dest.tag}</span>}
                    <button onClick={(e) => toggleSave(dest.city, e)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50" aria-label={`Save ${dest.city}`}>
                      <Heart className={`w-3.5 h-3.5 ${saved.has(dest.city) ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1 mb-0.5"><MapPin className="w-2.5 h-2.5 text-white/60" /><span className="text-white/60 text-[9px] font-bold uppercase tracking-wider">{dest.country}</span></div>
                      <h3 className="text-white font-bold leading-tight" style={{ fontSize: isTall ? '1.25rem' : '1rem', letterSpacing: '-0.02em' }}>{dest.city}</h3>
                      <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-white/80 text-xs font-semibold">{dest.price}</span>
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-white text-xs font-bold">{dest.rating}</span></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center"><ArrowRight className="w-5 h-5 text-white" /></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollReveal>

          <div className="mt-10 flex justify-center">
            <a href="/destinations" className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-neutral-800 transition-colors duration-200">All destinations<ArrowRight className="w-4 h-4" /></a>
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
