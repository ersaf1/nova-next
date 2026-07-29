'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Sparkles } from 'lucide-react'

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
  { name: 'Airbnb', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' },
  { name: 'Booking.com', fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' },
  { name: 'Expedia', fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' },
  { name: 'Skyscanner', fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' },
  { name: 'Klook', fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' },
  { name: 'Agoda', fontFamily: 'Impact, Arial Narrow, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' },
  { name: 'TripAdvisor', fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' },
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
    subheadline: 'Plan, book, and experience extraordinary journeys across 195+ countries — all in one place.',
    badgeText: 'Live availability · 195 UN Countries',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
  })
  const [brands, setBrands] = useState<Partner[]>(DEFAULT_BRANDS)
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.json())
      .then((data: HeroData) => {
        if (data && (data.headline || data.subheadline || data.badgeText || data.videoUrl)) {
          setHero(prev => ({
            ...prev,
            ...data,
            videoUrl: data.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4'
          }))
        }
        setHeroReady(true)
      })
      .catch(() => { setHeroReady(true) })
    fetch('/api/partners')
      .then(r => r.json())
      .then((data: Partner[]) => { if (Array.isArray(data) && data.length > 0) setBrands(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !videoWrapperRef.current) return

    const ctx = gsap.context(() => {
      // 1. Scroll-triggered parallax for background video wrapper
      gsap.fromTo(
        videoWrapperRef.current,
        { yPercent: 0 },
        {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      )

      // 2. Set initial states
      gsap.set(badgeRef.current, { opacity: 0, y: 25 })
      gsap.set(titleRef.current, { opacity: 1 }) // title wrapper stays visible; words animate
      gsap.set(titleRef.current?.querySelectorAll('.word-reveal') ?? [], { y: '110%' })
      gsap.set(descriptionRef.current, { opacity: 0, y: 20 })
      gsap.set(searchRef.current, { opacity: 0, y: 20 })
      gsap.set(partnersRef.current, { opacity: 0, y: 10 })

      // 3. Entrance timeline — word-by-word focal reveal
      const tl = gsap.timeline({ delay: 0.2 })

      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.2)
        .to(
          titleRef.current?.querySelectorAll('.word-reveal') ?? [],
          {
            y: '0%',
            duration: 0.75,
            stagger: 0.06,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
          0.5
        )
        .to(descriptionRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.1)
        .to(searchRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 1.35)
        .to(partnersRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.55)
    }, sectionRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroReady])

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[820px] overflow-hidden bg-black flex flex-col justify-between">
      <div ref={videoWrapperRef} className="absolute inset-0 w-full h-full will-change-transform bg-neutral-950">
        {/* Background Fallback Photo */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=95"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover img-smooth-zoom"
        />

        {/* Video Background Layer */}
        {hero.videoUrl && (
          <video
            key={hero.videoUrl}
            src={hero.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-10"
          >
            <source src={hero.videoUrl} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/88 z-[1]" />
      <div className="relative z-10 max-w-[88rem] w-full mx-auto px-6 md:px-12 flex flex-col justify-between h-full pt-32 pb-12">
        <div className="mt-8 md:mt-16">
          {/* Badge — floats gently after reveal */}
          <div
            ref={badgeRef}
            className="badge-float inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold px-4 py-2 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {hero.badgeText}
          </div>

          {/* Headline — word-by-word curtain reveal */}
          <h1
            ref={titleRef}
            className="text-white font-medium leading-[0.92] mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 7rem)',
              letterSpacing: '-0.04em',
            }}
          >
            {hero.headline.split(/[\n\r]+/).map((line, li) => (
              <span key={li} className="block">
                {line.split(' ').map((word, wi) => {
                  const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
                  const isUnlocked = cleanWord === 'unlocked';
                  return (
                    <span
                      key={wi}
                      className="inline-block overflow-hidden mr-[0.25em] last:mr-0"
                      style={{ verticalAlign: 'bottom' }}
                    >
                      <span className="word-reveal inline-block">
                        {isUnlocked ? (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                            {word}
                          </span>
                        ) : (
                          word
                        )}
                      </span>
                    </span>
                  )
                })}
              </span>
            ))}
          </h1>

          <p ref={descriptionRef} className="text-white/80 text-base md:text-lg max-w-xl mb-6 leading-relaxed font-light">
            {hero.subheadline}
          </p>
        </div>

        <div className="w-full space-y-10">
          <div ref={searchRef} className="flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#175cff] hover:bg-[#0f47cc] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-200"
            >
              Explore Packages
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/20 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-white/70" />
              Plan with AI
            </Link>
          </div>
          <div ref={partnersRef} className="w-full flex flex-col items-start gap-3">
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">Trusted partners</p>
            <div className="w-full max-w-xl overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/30 to-transparent z-[2]" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/30 to-transparent z-[2]" />
              <div className="marquee-track opacity-50 hover:opacity-80 transition-opacity duration-300">
                {[...brands, ...brands].map((brand, i) => (
                  <span
                    key={i}
                    className="mx-6 shrink-0 text-white/60 whitespace-nowrap"
                    style={{
                      fontFamily: brand.fontFamily,
                      fontWeight: brand.fontWeight,
                      letterSpacing: brand.letterSpacing,
                      fontSize: brand.fontSize,
                      fontStyle: brand.fontStyle as React.CSSProperties['fontStyle'],
                      textTransform: brand.textTransform as React.CSSProperties['textTransform'],
                    }}
                  >
                    {brand.name}
                  </span>
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
