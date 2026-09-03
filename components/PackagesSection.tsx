'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Clock,
  Users,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Tag,
  Compass
} from 'lucide-react'
import { use3DTilt, useStaggerReveal } from '@/hooks/useScrollAnimation'
import ScrollReveal from './ScrollReveal'
import { useCurrency } from '@/context/CurrencyContext'

interface Package {
  id?: number | string
  tag: string
  tagColor?: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice?: number
  duration: string
  groupSize: string
  rating: number
  reviews: number
  includes?: string[] | string
  highlight?: string
  category: string
  slug?: string
}

const STATIC_PACKAGES: Package[] = [
  {
    id: 1,
    tag: 'Best Seller',
    tagColor: 'bg-neutral-900 text-white',
    title: 'Bali Paradise & Ubud Retreat',
    subtitle: 'Ubud • Seminyak • Uluwatu Cliff',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=85',
    price: 4250000,
    originalPrice: 5500000,
    duration: '4 Hari 3 Malam',
    groupSize: '2-10 Orang',
    rating: 4.9,
    reviews: 312,
    includes: ['Tiket Pesawat PP', 'Resort Bintang 5', 'Tur Private Ubud', 'Sarapan & Dinner Sunset'],
    highlight: 'Kunjungan pura bersejarah & private sunset dinner di Uluwatu',
    category: 'Beach',
    slug: 'bali-paradise-escape'
  },
  {
    id: 2,
    tag: 'Phinisi Luxury',
    tagColor: 'bg-brand text-white',
    title: 'Labuan Bajo & Komodo Sailing',
    subtitle: 'Pulau Padar • Pink Beach • Komodo',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1000&q=85',
    price: 6800000,
    originalPrice: 8200000,
    duration: '3 Hari 2 Malam',
    groupSize: '2-8 Orang',
    rating: 4.9,
    reviews: 248,
    includes: ['Kapal Phinisi Deluxe', 'Snorkeling Gear & Guide', 'All Meals Onboard', 'Tiket Masuk TN Komodo'],
    highlight: 'Menginap di kapal Phinisi mewah & melihat Komodo di habitat asli',
    category: 'Beach',
    slug: 'labuan-bajo-komodo'
  },
  {
    id: 3,
    tag: 'Popular',
    tagColor: 'bg-rose-500 text-white',
    title: 'Japan Classic Cherry Blossom',
    subtitle: 'Tokyo • Mt. Fuji • Kyoto • Osaka',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=85',
    price: 24500000,
    originalPrice: 28000000,
    duration: '7 Hari 6 Malam',
    groupSize: '2-12 Orang',
    rating: 4.9,
    reviews: 189,
    includes: ['Tiket Pesawat PP', 'Hotel Bintang 4 Pusat Kota', 'Shinkansen Bullet Train', 'Tour Guide Indonesia'],
    highlight: 'Wisata bunga sakura, kimono experience & kuil Fushimi Inari',
    category: 'City',
    slug: 'japan-cherry-blossom'
  },
  {
    id: 4,
    tag: 'Adventure',
    tagColor: 'bg-amber-600 text-white',
    title: 'Swiss Alps Grand Panorama',
    subtitle: 'Zermatt • Interlaken • Jungfrau',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1000&q=85',
    price: 36000000,
    originalPrice: 42000000,
    duration: '8 Hari 7 Malam',
    groupSize: '2-6 Orang',
    rating: 4.9,
    reviews: 124,
    includes: ['Tiket Pesawat PP', 'Alpine Chalet Resort', 'Swiss Travel Pass Unlimited', 'Kereta Gantung Jungfrau'],
    highlight: 'Puncak tertinggi Eropa Top of Europe & danau kristal Interlaken',
    category: 'Mountain',
    slug: 'swiss-alps-experience'
  },
]

const PackageCard: React.FC<{ pkg: Package }> = ({ pkg }) => {
  const { ref, tilt } = use3DTilt()
  const includesList = Array.isArray(pkg.includes)
    ? pkg.includes
    : typeof pkg.includes === 'string'
    ? (() => { try { return JSON.parse(pkg.includes) } catch { return [] } })()
    : []

  const { formatPrice } = useCurrency()

  const destinationSlug = pkg.slug || pkg.id || 'bali-paradise-escape'

  return (
    <div
      ref={ref}
      className="group relative rounded-3xl overflow-hidden bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 w-[320px] sm:w-[360px] shrink-0 snap-start flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
      }}
    >
      <div>
        {/* Card Header & Photo */}
        <div className="relative h-52 overflow-hidden bg-neutral-900">
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            className="object-cover img-smooth-zoom"
            sizes="(max-width: 768px) 100vw, 360px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

          {/* Top Tag Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${pkg.tagColor || 'bg-neutral-900 text-white'}`}>
              {pkg.tag}
            </span>
          </div>

          {/* Location Bar on Image */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-light" />
              <span>{pkg.subtitle}</span>
            </p>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-neutral-950 text-base font-extrabold leading-snug tracking-tight line-clamp-2">
              {pkg.title}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg shrink-0 border border-amber-100">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-neutral-900 font-extrabold text-xs">{pkg.rating}</span>
            </div>
          </div>

          {/* Duration, Travelers & Inclusions */}
          <div className="flex items-center gap-4 text-xs text-neutral-500 py-2 border-y border-neutral-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span>{pkg.groupSize}</span>
            </div>
          </div>

          {/* Includes Summary */}
          {includesList.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Termasuk:</p>
              <div className="flex flex-wrap gap-1.5">
                {includesList.slice(0, 3).map((inc: string, i: number) => (
                  <span key={i} className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{inc}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with Price and CTA */}
      <div className="p-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 mt-auto bg-neutral-50/50">
        <div>
          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
            <span className="text-[11px] text-neutral-400 line-through leading-none block">
              {formatPrice(pkg.originalPrice)}
            </span>
          )}
          <div className="flex items-baseline">
            <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight">
              {formatPrice(pkg.price)}
            </span>
            <span className="text-[10px] text-neutral-400 font-normal ml-1">/org</span>
          </div>
        </div>

        <Link
          href={`/packages/${destinationSlug}`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/25 flex items-center gap-1 group-hover:scale-105 shrink-0"
        >
          <span>Pilih</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

const PackagesSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [packages, setPackages] = useState<Package[]>(STATIC_PACKAGES)
  const { ref: cardsStaggerRef } = useStaggerReveal({ stagger: 0.08, duration: 0.6, distance: 40 })

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then((data: Package[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const valid = data.filter(p => p.price > 100000 && p.title)
          if (valid.length > 0) {
            setPackages(valid)
          }
        }
      })
      .catch(() => {})
  }, [])

  const filters = [
    { id: 'All', label: 'Semua Paket' },
    { id: 'Beach', label: 'Pantai & Pulau 🏝️' },
    { id: 'Mountain', label: 'Gunung & Alam 🏔️' },
    { id: 'City', label: 'Kota & Budaya 🏛️' },
  ]

  const filteredPackages = packages.filter(pkg => {
    if (activeFilter === 'All') return true
    return pkg.category?.toLowerCase() === activeFilter.toLowerCase()
  })

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const step = clientWidth * 0.75
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - step : scrollLeft + step,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section id="packages" className="px-4 sm:px-6 md:px-8 py-20 md:py-28 bg-white border-b border-slate-200/70">
      <div className="max-w-[88rem] mx-auto space-y-10">
        
        {/* Section Header */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/70">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600 bg-neutral-100 px-3.5 py-1.5 rounded-full border border-neutral-200/80">
                <Compass className="w-3.5 h-3.5 text-neutral-400" />
                <span>02 / All-Inclusive Curated Journeys</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                <span>Paket Wisata </span>
                <span className="font-serif-luxury italic font-normal text-neutral-900">Eksklusif & Terkurasi</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xl font-normal leading-relaxed">
                Setiap paket dirancang all-in: tiket pesawat, resort bintang 5, tur privat, dan pendampingan concierge 24/7.
              </p>
            </div>

            {/* Filter Pills & Slider Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200/80">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      activeFilter === f.id
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
                  aria-label="Geser ke kiri"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
                  aria-label="Geser ke kanan"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Packages Horizontal Carousel Grid */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
        >
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg, idx) => (
              <PackageCard key={pkg.slug || pkg.id || idx} pkg={pkg} />
            ))
          ) : (
            <div className="min-h-64 w-full flex flex-col items-center justify-center bg-neutral-50 border border-neutral-200/80 rounded-3xl p-12 text-center">
              <p className="text-neutral-400 text-xs font-medium">Tidak ada paket untuk kategori ini.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA Banner — Minimalist Luxury with Expansive Whitespace */}
        <ScrollReveal animation="slide-up">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl text-white">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/10">
                Konsultasi Privat
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ingin Jadwal & Rute Khusus?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-light leading-relaxed">
                Rancang perjalanan eksklusif keluarga atau rombongan Anda bersama spesialis perjalanan NOVA.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/ai-planner"
                className="px-6 py-3.5 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 font-semibold text-xs transition-all shadow-xs"
              >
                Gunakan Smart Planner
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

export default PackagesSection
