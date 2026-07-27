'use client'

import React, { useEffect, useState, useRef } from 'react'
import SearchBar from './SearchBar'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const partnersRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!sectionRef.current || !videoWrapperRef.current) return

    const ctx = gsap.context(() => {
      // 1. Scroll-triggered Parallax animation for background video wrapper
      gsap.fromTo(
        videoWrapperRef.current,
        { yPercent: 0, scale: 1.1 },
        {
          yPercent: 15,
          scale: 1.25,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      )

      // 2. Entrance animations on initial mount
      const tl = gsap.timeline({ delay: 0.2 })

      tl.fromTo(badgeRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
        .fromTo(titleRef.current, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }, '-=0.45')
        .fromTo(descriptionRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .fromTo(searchRef.current, { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.25)' }, '-=0.5')
        .fromTo(partnersRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[820px] overflow-hidden bg-black flex flex-col justify-between">
      <div ref={videoWrapperRef} className="absolute inset-0 w-full h-full will-change-transform">
        <video autoPlay muted loop playsInline poster={hero.posterUrl} className="w-full h-full object-cover">
          <source src={hero.videoUrl} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/80 z-[1]" />
      <div className="relative z-10 max-w-[88rem] w-full mx-auto px-6 md:px-12 flex flex-col justify-between h-full pt-32 pb-12">
        <div className="max-w-3xl mt-8 md:mt-16">
          <div ref={badgeRef} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold px-4 py-2 rounded-full mb-6 opacity-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {hero.badgeText}
          </div>
          <h1 ref={titleRef} className="text-white text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-5 whitespace-pre-line opacity-0" style={{ letterSpacing: '-0.04em' }}>
            {hero.headline}
          </h1>
          <p ref={descriptionRef} className="text-white/80 text-base md:text-lg max-w-xl mb-6 leading-relaxed font-light opacity-0">{hero.subheadline}</p>
        </div>
        <div className="w-full space-y-10">
          <div ref={searchRef} className="w-full opacity-0"><SearchBar /></div>
          <div ref={partnersRef} className="w-full flex flex-col items-start gap-3 opacity-0">
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
