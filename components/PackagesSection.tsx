'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Clock, Users, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { use3DTilt, useStaggerReveal } from '@/hooks/useScrollAnimation'
import ScrollReveal from './ScrollReveal'

interface Package {
  id: number; tag: string; tagColor: string; title: string; subtitle: string
  image: string; price: number; originalPrice: number; duration: string
  groupSize: string; rating: number; reviews: number; includes: string[]
  highlight: string; category: string
}

interface PackageCardProps { pkg: Package }

const ClaimOfferButton: React.FC = () => {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/booking')}
      className="shrink-0 flex items-center gap-2 bg-white text-black text-sm font-bold px-6 py-3.5 rounded-full hover:bg-neutral-100 transition-colors duration-300"
    >
      Claim offer<ArrowRight className="w-4 h-4" />
    </button>
  )
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  const { ref, tilt } = use3DTilt()

  return (
    <div
      ref={ref}
      className="group relative rounded-3xl overflow-hidden cursor-pointer w-[310px] md:w-[350px] shrink-0 snap-start flex flex-col justify-between transition-all duration-300"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: (tilt.x !== 0 || tilt.y !== 0)
          ? '0 20px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.6)'
          : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.6)',
      }}
    >
      {/* Specular highlight — top-left glass reflection */}
      <div
        className="absolute top-0 left-0 w-full h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)',
          borderRadius: '24px 24px 0 0',
        }}
      />
      <div>
        <div className="relative h-48 overflow-hidden">
          <img src={pkg.image} alt={pkg.title} loading="lazy" className="w-full h-full object-cover img-smooth-zoom" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={`absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor}`}>{pkg.tag}</span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-black text-lg font-bold leading-snug tracking-tight" style={{ letterSpacing: '-0.02em' }}>{pkg.title}</h3>
            <div className="flex items-center gap-1 shrink-0"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-black font-bold text-xs">{pkg.rating}</span></div>
          </div>
          <p className="text-black/40 text-xs font-bold uppercase tracking-wider mb-4">{pkg.subtitle}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-black/40" /><span className="text-black/60 text-xs font-light">{pkg.duration}</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-black/40" /><span className="text-black/60 text-xs font-light">{pkg.groupSize}</span></div>
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-black/40" /><span className="text-black/60 text-xs font-light truncate max-w-[120px]">{pkg.highlight}</span></div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 border-t border-black/[0.06] flex items-center justify-between gap-4 mt-auto">
        <div>
          <span className="text-black/40 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Mulai dari / Orang</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-black text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price)}
            </span>
            {(pkg.originalPrice ?? 0) > pkg.price && (
              <span className="text-black/35 text-xs line-through">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.originalPrice ?? 0)}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/packages/${(pkg as { slug?: string }).slug ?? pkg.id}`}
          className="bg-neutral-50 hover:bg-black hover:text-white text-black text-xs font-bold px-4 py-2.5 rounded-full transition-colors duration-300 flex items-center gap-1.5 border border-black/[0.04] shrink-0"
        >
          Lihat detail<ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

const PackagesSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { ref: cardsStaggerRef } = useStaggerReveal({ stagger: 0.1, duration: 0.7, distance: 70 })

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
    fetch('/api/packages').then(r => r.json()).then((data: unknown) => {
      if (Array.isArray(data)) {
        // Filter hanya package yang valid: punya slug, rating, harga wajar, dan highlight
        const valid = (data as Package[]).filter(p =>
          (p as { slug?: string }).slug &&
          p.rating &&
          p.price > 100 &&
          p.highlight
        )
        setPackages(valid as Package[])
      }
    }).catch(() => {})
  }, [])

  const filters = ['All', 'Beach', 'Mountain', 'City']
  const filteredPackages = packages.filter(pkg => activeFilter === 'All' || pkg.category.toLowerCase() === activeFilter.toLowerCase())

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const step = clientWidth * 0.7
      scrollRef.current.scrollTo({ left: direction === 'left' ? scrollLeft - step : scrollLeft + step, behavior: 'smooth' })
    }
  }

  return (
    <section id="packages" className="px-6 py-28 border-b border-black/[0.04]" style={{ background: 'radial-gradient(ellipse at 60% 0%, #f0f0ff 0%, #ffffff 50%, #fff8f0 100%)' }}>
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <ScrollReveal animation="slide-up">
              <div>
                <p className="text-black/45 text-xs font-bold tracking-widest uppercase mb-3">Curated trips</p>
                <h2 ref={headingRef} className="heading-animate text-black text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4" style={{ letterSpacing: '-0.04em' }}>Packages & Offers</h2>
                <p className="text-black/60 text-sm leading-relaxed max-w-sm font-light">Explore handpicked vacation experiences designed, priced, and scheduled to absolute perfection.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="slide-up" delay={0.1}>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                {filters.map((filter) => (
                  <button key={filter} onClick={() => setActiveFilter(filter)} className={`text-left text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 w-auto lg:w-48 border shrink-0 flex items-center justify-between ${activeFilter === filter ? 'bg-black text-white border-black shadow-md lg:translate-x-2' : 'bg-transparent text-black/55 border-transparent hover:bg-neutral-50 hover:text-black'}`}>
                    <span>{filter}{filter === 'All' ? ' Trips' : ''}</span>
                    {activeFilter === filter && <span className="w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />}
                  </button>
                ))}
              </div>
            </ScrollReveal>
            <div className="hidden lg:flex items-center gap-3 pt-4">
              <button onClick={() => scroll('left')} className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300" aria-label="Previous trip"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => scroll('right')} className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300" aria-label="Next trip"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="lg:col-span-8 w-full overflow-hidden relative">
              <div ref={cardsStaggerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none pb-8 w-full">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))
                ) : (
                  <div className="min-h-80 w-full flex flex-col items-center justify-center bg-neutral-50 border border-black/[0.03] rounded-3xl p-8">
                    <p className="text-black/45 text-sm font-semibold">No packages found for this category</p>
                  </div>
                )}
              </div>
          </div>
        </div>
        
        <ScrollReveal animation="slide-up">
          <div className="mt-16 bg-zinc-950 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000 border border-white/[0.05]">
            <div>
              <span className="bg-white/10 text-white/90 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Flash discount</span>
              <h3 className="text-white text-2xl font-bold tracking-tight mt-4 mb-1" style={{ letterSpacing: '-0.02em' }}>First booking? Get 15% off any package.</h3>
              <p className="text-white/60 text-xs font-light">Use code <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">NOVA15</span> at checkout. Valid for 48 hours.</p>
            </div>
            <ClaimOfferButton />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default PackagesSection
