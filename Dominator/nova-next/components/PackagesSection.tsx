'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Users, Star, ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useScrollAnimation, use3DTilt } from '@/hooks/useScrollAnimation'

interface Package {
  id: number; tag: string; tagColor: string; title: string; subtitle: string
  image: string; price: number; originalPrice: number; duration: string
  groupSize: string; rating: number; reviews: number; includes: string[]
  highlight: string; category: string
}

interface PackageCardProps { pkg: Package; delay: number; isVisible: boolean }

const PackageCard: React.FC<PackageCardProps> = ({ pkg, delay, isVisible }) => {
  const { ref, tilt } = use3DTilt()
  const savings = pkg.originalPrice - pkg.price

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer w-[310px] md:w-[350px] shrink-0 snap-start border border-black/[0.03] flex flex-col justify-between"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(0px)` : `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(40px)`,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease`,
        transformStyle: 'preserve-3d', willChange: 'transform',
        boxShadow: (tilt.x !== 0 || tilt.y !== 0) ? '0 20px 50px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      <div>
        <div className="relative h-48 overflow-hidden">
          <img src={pkg.image} alt={pkg.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={`absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor}`}>{pkg.tag}</span>
          {savings > 0 && (
            <span className="absolute top-4 right-4 bg-white text-black text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 fill-black text-black" />Save ${savings}
            </span>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-black text-lg font-bold leading-snug tracking-tight" style={{ letterSpacing: '-0.02em' }}>{pkg.title}</h3>
            <div className="flex items-center gap-1 shrink-0 bg-neutral-50 px-2 py-0.5 rounded-full border border-black/[0.02]">
              <Star className="w-3 h-3 fill-black text-black" />
              <span className="text-black text-[10px] font-bold">{pkg.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-4">
            <MapPin className="w-3.5 h-3.5 text-black/30 shrink-0" />
            <p className="text-black/50 text-xs font-medium truncate">{pkg.subtitle}</p>
          </div>
          <p className="text-black/60 text-xs bg-black/[0.02] border border-black/[0.02] rounded-xl px-3 py-2.5 mb-4 font-medium italic">✦ {pkg.highlight}</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-black/35" /><span className="text-black/60 text-xs font-semibold">{pkg.duration}</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-black/35" /><span className="text-black/60 text-xs font-semibold">{pkg.groupSize} group</span></div>
          </div>
          <div className="flex flex-wrap gap-1">
            {pkg.includes.map(item => (
              <span key={item} className="text-[10px] font-bold text-black/55 bg-neutral-100 px-2.5 py-1 rounded-full uppercase tracking-wider">{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 pt-4 border-t border-black/[0.04] flex items-center justify-between gap-3">
        <div>
          <span className="text-black/30 text-[10px] font-semibold line-through">${pkg.originalPrice.toLocaleString()}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-black text-2xl font-bold tracking-tight">${pkg.price.toLocaleString()}</span>
            <span className="text-black/45 text-[10px] font-semibold uppercase">/ person</span>
          </div>
        </div>
        <Link href="/booking" className="flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-neutral-800 transition-colors duration-300">
          Book now<ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

const PackagesSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()
  const [activeFilter, setActiveFilter] = useState('All')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    fetch('/api/packages').then(r => r.json()).then((data: unknown) => { if (Array.isArray(data)) setPackages(data as Package[]) }).catch(() => {})
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
    <section ref={ref} id="packages" className="bg-white px-6 py-28 border-b border-black/[0.04]">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div>
              <p className="text-black/45 text-xs font-bold tracking-widest uppercase mb-3">Curated trips</p>
              <h2 className="text-black text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4" style={{ letterSpacing: '-0.04em' }}>Packages & Offers</h2>
              <p className="text-black/60 text-sm leading-relaxed max-w-sm font-light">Explore handpicked vacation experiences designed, priced, and scheduled to absolute perfection.</p>
            </div>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {filters.map((filter) => (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`text-left text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 w-auto lg:w-48 border shrink-0 flex items-center justify-between ${activeFilter === filter ? 'bg-black text-white border-black shadow-md lg:translate-x-2' : 'bg-transparent text-black/55 border-transparent hover:bg-neutral-50 hover:text-black'}`}>
                  <span>{filter}{filter === 'All' ? ' Trips' : ''}</span>
                  {activeFilter === filter && <span className="w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3 pt-4">
              <button onClick={() => scroll('left')} className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300" aria-label="Previous trip"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => scroll('right')} className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300" aria-label="Next trip"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="lg:col-span-8 w-full overflow-hidden relative">
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none pb-8 w-full">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg, i) => <PackageCard key={pkg.id} pkg={pkg} delay={i * 100} isVisible={isVisible} />)
              ) : (
                <div className="min-h-80 w-full flex flex-col items-center justify-center bg-neutral-50 border border-black/[0.03] rounded-3xl p-8">
                  <p className="text-black/45 text-sm font-semibold">No packages found for this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-16 bg-zinc-950 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000 border border-white/[0.05]" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)' }}>
          <div>
            <span className="bg-white/10 text-white/90 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Flash discount</span>
            <h3 className="text-white text-2xl font-bold tracking-tight mt-4 mb-1" style={{ letterSpacing: '-0.02em' }}>First booking? Get 15% off any package.</h3>
            <p className="text-white/60 text-xs font-light">Use code <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">NOVA15</span> at checkout. Valid for 48 hours.</p>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-white text-black text-sm font-bold px-6 py-3.5 rounded-full hover:bg-neutral-100 transition-colors duration-300">Claim offer<ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  )
}

export default PackagesSection
