'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Users, Mountain, Briefcase, Compass } from 'lucide-react'
import { useStaggerReveal } from '@/hooks/useScrollAnimation'

const modes = [
  {
    label: 'Solo Traveler',
    short: 'Kebebasan penuh, rute fleksibel, eksplorasi tanpa batas.',
    image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&auto=format&q=75',
    icon: MapPin,
    accent: 'from-[#0A192F]/90',
  },
  {
    label: 'Family Vacation',
    short: 'Momen berharga seluruh keluarga dengan kenyamanan resort 5★.',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&q=75',
    icon: Users,
    accent: 'from-[#0A192F]/90',
  },
  {
    label: 'Adventure & Sailing',
    short: 'Pelayaran phinisi eksklusif, diving, dan trekking puncak terindah.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&q=75',
    icon: Mountain,
    accent: 'from-[#0A192F]/90',
  },
  {
    label: 'Luxury & Honeymoon',
    short: 'Retreat privat tepi laut, villa mewah, dan layanan butler eksklusif.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&q=75',
    icon: Briefcase,
    accent: 'from-[#0A192F]/90',
  },
]

const ExperiencesSection: React.FC = () => {
  const [active, setActive] = useState(0)
  const { ref: modesRef } = useStaggerReveal({ stagger: 0.1, duration: 0.65, distance: 50 })

  return (
    <section id="experiences" className="bg-white px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-slate-200/70">
      <div className="max-w-[88rem] mx-auto">
        
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/70">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <Compass className="w-3.5 h-3.5" />
              <span>06 / Kategori Pengalaman</span>
            </div>
            <h2 className="text-blue-950 text-3xl sm:text-5xl font-black leading-tight" style={{ letterSpacing: '-0.035em' }}>
              <span>Gaya Liburan </span>
              <span className="font-serif-luxury italic font-normal text-blue-600">Sesuai Pilihan Anda</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
              Setiap wisatawan memiliki ritme tersendiri. Pilih mode liburan yang paling menggambarkan impian Anda.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-full transition-all shrink-0 shadow-sm shadow-blue-600/25 group"
          >
            <span>Eksplor Semua Mode</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Mode buttons */}
          <div ref={modesRef} className="lg:col-span-2 flex flex-row lg:flex-col gap-3">
            {modes.map((mode, i) => {
              const Icon = mode.icon
              const isActive = active === i
              return (
                <button
                  key={mode.label}
                  onClick={() => setActive(i)}
                  className={`group relative flex-1 lg:flex-none overflow-hidden rounded-2xl cursor-pointer text-left border transition-all ${
                    isActive ? 'ring-2 ring-blue-600 border-blue-600 shadow-md' : 'border-slate-200/80 hover:border-blue-300'
                  }`}
                  style={{ minHeight: isActive ? '150px' : '105px', transition: 'min-height 0.4s ease' }}
                >
                  <img
                    src={mode.image}
                    alt={mode.label}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover img-smooth-zoom"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${mode.accent} via-[#0A192F]/60 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-90' : 'opacity-75'}`} />
                  <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>{mode.label}</h3>
                      <p className={`text-white/80 text-xs mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0 overflow-hidden'}`}>{mode.short}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200" style={{ minHeight: '480px' }}>
            {modes.map((mode, i) => (
              <div
                key={mode.label}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: active === i ? 1 : 0, pointerEvents: active === i ? 'auto' : 'none' }}
              >
                <img
                  src={mode.image}
                  alt={mode.label}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/95 via-[#0A192F]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20">
                    Kategori Terpilih
                  </div>
                  <h3 className="text-white text-3xl sm:text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>{mode.label}</h3>
                  <p className="text-white/80 text-sm max-w-lg leading-relaxed">{mode.short}</p>
                  <div className="pt-2">
                    <Link
                      href={`/search?mode=${mode.label.toLowerCase()}`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-sm shadow-blue-600/30 transition-all group"
                    >
                      <span>Temukan Paket {mode.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperiencesSection
