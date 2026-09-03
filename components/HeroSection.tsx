'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Compass, ShieldCheck, Award, Users, Sun, ArrowRight } from 'lucide-react'
import SearchBar from './SearchBar'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HeroData {
  headline: string
  subheadline: string
  badgeText: string
  videoUrl: string
}

interface Partner {
  id?: number
  name: string
  fontFamily: string
  fontWeight: number
  letterSpacing: string
  fontSize: string
  fontStyle?: string
  textTransform?: string
}

const DEFAULT_BRANDS: Partner[] = [
  { name: 'Garuda Indonesia', fontFamily: 'Arial, sans-serif', fontWeight: 800, letterSpacing: '0.05em', fontSize: '13px', textTransform: 'uppercase' },
  { name: 'Airbnb', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' },
  { name: 'Booking.com', fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' },
  { name: 'Singapore Airlines', fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 700, letterSpacing: '0.04em', fontSize: '13px' },
  { name: 'Klook', fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: 600, letterSpacing: '-0.01em', fontSize: '15px' },
  { name: 'Agoda', fontFamily: 'Impact, Arial Narrow, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' },
  { name: 'TripAdvisor', fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' },
]

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [hero, setHero] = useState<HeroData>({
    headline: 'Jelajahi Dunia,\nLiburan Impian Jadi Nyata.',
    subheadline: 'Temukan paket wisata kurasi bintang 5, tur privat eksklusif, dan rancang rute harian terpadu — mewujudkan momen liburan terbaik Anda.',
    badgeText: 'PASSPORT PRIVILEGE · 195+ DESTINASI DUNIA',
    videoUrl: '/uploads/1785249740102-88207-602915574.mp4',
  })
  const [brands, setBrands] = useState<Partner[]>(DEFAULT_BRANDS)

  // Autoplay video & pause when out of view
  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !hero.videoUrl) return

    video.load()
    video.play().catch(() => {})

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.05 }
    )

    if (section) observer.observe(section)
    return () => observer.disconnect()
  }, [hero.videoUrl])

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.json())
      .then((data: HeroData) => {
        if (data && (data.headline || data.subheadline || data.badgeText || data.videoUrl)) {
          setHero(prev => ({
            ...prev,
            ...data,
            videoUrl: data.videoUrl || '/uploads/1785249740102-88207-602915574.mp4'
          }))
        }
      })
      .catch(() => {})

    fetch('/api/partners')
      .then(r => r.json())
      .then((data: Partner[]) => {
        if (Array.isArray(data) && data.length > 0) setBrands(data)
      })
      .catch(() => {})
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[860px] lg:min-h-[920px] overflow-hidden bg-[#0284C7] flex flex-col justify-between pt-28 pb-12"
    >
      {/* Background Video with Mediterranean Marine Overlay */}
      <div ref={videoWrapperRef} className="absolute inset-0 w-full h-full will-change-transform bg-[#0284C7] pointer-events-none">
        {hero.videoUrl ? (
          <video
            ref={videoRef}
            src={hero.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105 opacity-90"
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=90"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        )}
      </div>

      {/* Layered Aegean Sky-Blue & Radiant Marine Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/30 via-sky-700/35 to-blue-900/60 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.4),transparent_70%)] z-[1]" />

      {/* Hero Central Content */}
      <div ref={contentRef} className="relative z-10 max-w-[88rem] w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-between flex-1 space-y-8">
        
        {/* Top Titles Block */}
        <div className="pt-8 sm:pt-14 text-center max-w-4xl mx-auto space-y-5">
          
          {/* Minimalist Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-xs">
            <Sun className="w-3.5 h-3.5 text-white/70" strokeWidth={1.5} />
            <span>{hero.badgeText}</span>
          </div>

          {/* Editorial Headline with Luxury Serif Italic Accent */}
          <h1
            className="text-white font-black tracking-tight leading-[1.05] drop-shadow-sm text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ letterSpacing: '-0.035em' }}
          >
            <span>Jelajahi Dunia, </span>
            <span className="font-serif-luxury italic font-normal text-white/90">
              Liburan Impian
            </span>
            <span className="block mt-1">Jadi Nyata.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-xs sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {hero.subheadline}
          </p>

          {/* Quick Trust Highlights Pill Row — Minimalist Delicate Icons */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-3 text-[11px] sm:text-xs font-medium text-white/75">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
              <span>Garansi 100% Refund</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
              <span>Resort Terkurasi 5★</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
              <span>Concierge 24/7</span>
            </div>
          </div>
        </div>

        {/* Integrated Omni-Search Bar Widget */}
        <div className="w-full py-4 space-y-3">
          <SearchBar />

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs font-semibold">
            <span className="text-[11px] text-white/60 mr-1 hidden sm:inline">Paling Dicari:</span>
            {[
              { label: '🏖️ Pantai & Bahari', href: '/search?category=Beach' },
              { label: '⛰️ Pegunungan & Alam', href: '/search?category=Mountain' },
              { label: '🏛️ Sejarah & Budaya', href: '/search?category=Cultural' },
              { label: '💎 Luxury Curated', href: '/packages?category=Luxury' },
              { label: '🌸 Jepang & Asia', href: '/search?dest=Japan' },
              { label: '🕌 Wisata Religi', href: '/search?category=Halal' },
            ].map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white/90 hover:text-white border border-white/20 px-3 sm:px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-2xs hover:scale-105"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Partner Logos Marquee */}
        <div className="w-full pt-4 border-t border-white/15 flex flex-col items-center gap-2.5">
          <p className="text-white/45 text-[10px] font-extrabold tracking-widest uppercase">
            Official Travel Partners & Airlines
          </p>
          <div className="w-full max-w-3xl overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-sky-900/80 to-transparent z-[2]" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-sky-900/80 to-transparent z-[2]" />
            <div className="flex items-center justify-around gap-8 py-1 opacity-70 hover:opacity-100 transition-opacity">
              {brands.map((b, i) => (
                <span
                  key={i}
                  className="text-white/80 whitespace-nowrap text-xs font-bold tracking-wider"
                  style={{
                    fontFamily: b.fontFamily,
                    textTransform: b.textTransform as React.CSSProperties['textTransform'],
                  }}
                >
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection
