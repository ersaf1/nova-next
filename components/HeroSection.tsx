'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Compass, ShieldCheck, Award, Sun } from 'lucide-react'
import SearchBar from './SearchBar'

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

const CATEGORY_PILLS = [
  { label: '🏖️ Pantai & Bahari',    href: '/search?category=Beach',    colorClass: 'bg-white/15 hover:bg-white/25 border-white/20' },
  { label: '⛰️ Pegunungan & Alam',  href: '/search?category=Mountain',  colorClass: 'bg-white/15 hover:bg-white/25 border-white/20' },
  { label: '🏛️ Sejarah & Budaya',   href: '/search?category=Cultural',  colorClass: 'bg-white/15 hover:bg-white/25 border-white/20' },
  { label: '💎 Luxury Curated',      href: '/packages?category=Luxury',  colorClass: 'bg-white/15 hover:bg-white/25 border-white/20' },
  { label: '🌸 Jepang & Asia',       href: '/search?dest=Japan',         colorClass: 'bg-white/15 hover:bg-white/25 border-white/20' },
  { label: '🕌 Wisata Religi',       href: '/search?category=Halal',     colorClass: 'bg-white/15 hover:bg-white/25 border-white/20' },
]

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [hero, setHero] = useState<HeroData>({
    headline: 'Jelajahi Dunia,\nLiburan Impian Jadi Nyata.',
    subheadline: 'Temukan paket wisata kurasi bintang 5, tur privat eksklusif, dan rancang rute harian terpadu untuk mewujudkan momen liburan terbaik Anda.',
    badgeText: 'PLATFORM PERJALANAN KURASI BINTANG 5',
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
      className="relative w-full min-h-[860px] lg:min-h-[920px] overflow-hidden bg-slate-950 flex flex-col justify-between pt-28 pb-12"
    >
      {/* Background Video */}
      <div ref={videoWrapperRef} className="absolute inset-0 w-full h-full bg-slate-950 pointer-events-none">
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

      {/* Neutral Cinematic Atmospheric Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/80 z-[1]" />

      {/* Hero Central Content */}
      <div ref={contentRef} className="relative z-10 max-w-[88rem] w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-between flex-1 space-y-8">

        {/* Top Titles Block */}
        <div className="pt-8 sm:pt-14 text-center max-w-4xl mx-auto space-y-5">

          {/* Badge Pill — clean neutral glass */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full shadow-md">
            <Sun className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
            <span>{hero.badgeText}</span>
          </div>

          {/* Headline — editorial elegance */}
          <h1
            className="text-white font-black tracking-tight leading-[1.08] drop-shadow-lg text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ letterSpacing: '-0.035em' }}
          >
            <span>Jelajahi Dunia,</span>{' '}
            <span className="font-serif-luxury italic font-normal text-amber-200/95">
              Liburan Impian
            </span>{' '}
            <span className="block mt-1 sm:mt-2 text-white">
              Jadi Nyata.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            {hero.subheadline}
          </p>

          {/* Trust Highlights — editorial rounded pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] sm:text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              <span>Garansi 100% Refund</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] sm:text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
              <span>Resort Terkurasi 5★</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] sm:text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
              <Compass className="w-3.5 h-3.5 text-amber-200" strokeWidth={1.5} />
              <span>Concierge 24/7</span>
            </div>
          </div>
        </div>

        {/* Search Bar + Quick Category Pills */}
        <div className="w-full py-4 space-y-4">
          <SearchBar />

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs font-medium">
            <span className="text-[11px] text-white/60 mr-1 hidden sm:inline">Paling Dicari:</span>
            {CATEGORY_PILLS.map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-md border border-white/20 text-white/95 px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-xs hover:scale-105 active:scale-95"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Travel Assurance & Verified Standards */}
        <div className="w-full pt-4 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/70 text-xs font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Garansi Refund Transparan</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Hotel &amp; Resort Bintang 5 Terinspeksi</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C29B38]" />
            <span>Pendampingan Concierge 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Multi-Payment Aman (QRIS, VA, CC)</span>
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection
