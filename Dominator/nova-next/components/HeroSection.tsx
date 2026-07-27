'use client'

import React, { useEffect, useState } from 'react'
import { useParallax } from '@/hooks/useScrollAnimation'
import SearchBar from './SearchBar'

interface HeroData {
  headline: string
  subheadline: string
  badgeText: string
  videoUrl: string
  posterUrl: string
}

const brands = [
  { name: 'Airbnb', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'Booking.com', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Expedia', style: { fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' as const } },
  { name: 'Skyscanner', style: { fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Klook', style: { fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'Agoda', style: { fontFamily: 'Impact, Arial Narrow, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'TripAdvisor', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
]

const HeroSection: React.FC = () => {
  const { ref: parallaxRef, offset } = useParallax(0.15)
  const [hero, setHero] = useState<HeroData>({
    headline: 'The World,\nUnlocked.',
    subheadline: 'Plan, book, and experience extraordinary journeys across 150+ countries — all in one place.',
    badgeText: 'Live availability · 150+ countries',
    videoUrl: 'https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85',
  })

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.json())
      .then((data: HeroData) => setHero(data))
      .catch(() => {})
  }, [])

  return (
    <section className="relative w-full h-screen min-h-[820px] overflow-hidden bg-black flex flex-col justify-between">
      <div ref={parallaxRef} className="absolute inset-0 scale-110 w-full h-full" style={{ transform: `scale(1.1) translateY(${offset * 0.3}px)` }}>
        <video autoPlay muted loop playsInline poster={hero.posterUrl} className="w-full h-full object-cover">
          <source src={hero.videoUrl} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/80 z-[1]" />
      <div className="relative z-10 max-w-[88rem] w-full mx-auto px-6 md:px-12 flex flex-col justify-between h-full pt-32 pb-12">
        <div className="max-w-3xl mt-8 md:mt-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {hero.badgeText}
          </div>
          <h1 className="text-white text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-5 whitespace-pre-line" style={{ letterSpacing: '-0.04em' }}>
            {hero.headline}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mb-6 leading-relaxed font-light">{hero.subheadline}</p>
        </div>
        <div className="w-full space-y-10">
          <div className="w-full"><SearchBar /></div>
          <div className="w-full flex flex-col items-start gap-3">
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">Trusted partners</p>
            <div className="w-full max-w-xl overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/30 to-transparent z-[2]" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/30 to-transparent z-[2]" />
              <div className="marquee-track opacity-50 hover:opacity-80 transition-opacity duration-300">
                {[...brands, ...brands].map((brand, i) => (
                  <span key={i} className="mx-6 shrink-0 text-white/60 whitespace-nowrap" style={brand.style}>{brand.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
