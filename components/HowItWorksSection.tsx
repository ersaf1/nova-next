'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Calendar,
  Layers,
  Navigation
} from 'lucide-react'

interface Step {
  number: string
  title: string
  subtitle: string
  description: string
  category: string
  icon: React.ElementType
  image: string
  features: string[]
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Eksplorasi 195+ Destinasi Dunia',
    subtitle: 'Kurasi Destinasi Terbaik Tanpa Batas',
    description: 'Cari destinasi impian Anda berdasarkan suasana pantai, pegunungan, pulau tropis, hingga kota bersejarah terverifikasi.',
    category: 'Pencarian Destinasi',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90',
    features: ['195+ Destinasi', 'Filter Suasana', 'Real-Time']
  },
  {
    number: '02',
    title: 'Kurasi Rute Cerdas & Fleksibel',
    subtitle: 'Rancangan Jadwal Presisi dalam 30 Detik',
    description: 'Jadwal harian presisi, rekomendasi kuliner lokal, dan rute optimal disesuaikan dengan preferensi serta ritme Anda.',
    category: 'Smart Route Concierge',
    icon: Navigation,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=90',
    features: ['Rute Harian', 'Transparansi Biaya', 'Kuliner Lokal']
  },
  {
    number: '03',
    title: 'Pemesanan All-Inclusive Instan',
    subtitle: 'Semua Kebutuhan dalam 1 Pembayaran',
    description: 'Tiket pesawat PP, resort bintang 5, tur privat lokal, dan proteksi asuransi perjalanan terpercaya dalam sekali proses aman.',
    category: 'Booking & Reservasi',
    icon: CheckCircle2,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
    features: ['E-Ticket Resmi', 'Garansi Harga Jujur', 'Multi-Payment']
  },
  {
    number: '04',
    title: '24/7 Live Concierge di Tangan Anda',
    subtitle: 'Pendampingan Perjalanan Real-Time',
    description: 'Akses jadwal perjalanan offline dari ponsel dan tim concierge bersiaga 24 jam via WhatsApp ke mana pun Anda melangkah.',
    category: 'Pendampingan 24 Jam',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1600&q=90',
    features: ['Itinerary Offline', 'Tips Lokal', 'Asistensi 24/7']
  }
]

const HowItWorksSection: React.FC = () => {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)

  // Auto slide active step every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const current = STEPS[activeStep]
  const IconComponent = current.icon

  return (
    <section id="how-it-works" className="bg-[#FAF9F6] px-4 sm:px-6 py-20 md:py-28 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto space-y-12">
        
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-stone-200/80">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-stone-200">
              <Compass className="w-3.5 h-3.5 text-[#C29B38]" />
              <span>Alur Pemesanan &amp; Pendampingan</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1C1917] leading-[1.05] tracking-tight">
              Perjalanan Sempurna Bersama <span className="font-serif-luxury italic font-normal text-stone-800">NOVA Travel</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-500 leading-relaxed font-normal max-w-xl">
              Dari eksplorasi awal hingga kembali dengan selamat, NOVA mengelola setiap detail perjalanan Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/ai-planner')}
              className="bg-stone-900 text-white text-xs font-semibold px-6 py-3.5 rounded-full hover:bg-black transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#C29B38]" />
              <span>Rancang Rute Cerdas</span>
            </button>
          </div>
        </div>

        {/* Interactive Step Switcher & Live Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Interactive Step List */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-center">
            {STEPS.map((step, index) => {
              const isActive = activeStep === index
              const StepIcon = step.icon

              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                    isActive
                      ? 'bg-white border-stone-300 shadow-md'
                      : 'bg-[#FAF9F6] hover:bg-white border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black transition-colors ${
                        isActive ? 'text-[#C29B38]' : 'text-stone-300 group-hover:text-stone-400'
                      }`}>
                        {step.number}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                          {step.category}
                        </span>
                        <h3 className={`text-sm font-bold transition-colors ${
                          isActive ? 'text-[#1C1917]' : 'text-stone-700'
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200 group-hover:text-stone-800'
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-stone-200 animate-fade-in">
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Sleek Luxury Showcase Card (7 cols) — 80% Photo Dominance */}
          <div className="lg:col-span-7 bg-[#1C1917] rounded-3xl overflow-hidden relative min-h-[520px] lg:min-h-[620px] flex flex-col justify-between p-8 sm:p-10 shadow-2xl shadow-stone-950/20 text-white group border border-stone-800">
            {/* Background Image with Smooth Transitions */}
            <img
              key={current.number}
              src={current.image}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover img-smooth-zoom opacity-85 animate-fade-in"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/95 via-[#1C1917]/35 to-transparent z-[1]" />

            {/* Top Bar inside Card */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 block">
                    Tahap {current.number} dari 04
                  </span>
                  <span className="text-xs font-semibold text-white">{current.category}</span>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStep === i ? 'w-8 bg-[#C29B38]' : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Middle Content inside Showcase */}
            <div className="relative z-10 space-y-4 my-auto py-8">
              <span className="text-6xl sm:text-8xl font-black text-white/10 select-none block leading-none tracking-tight">
                {current.number}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed font-normal">
                {current.description}
              </p>

              {/* Feature Checklist Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {current.features.map((feat, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C29B38]" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside Showcase */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
              <span className="text-xs font-medium text-white/70">
                {current.subtitle}
              </span>

              <button
                onClick={() => router.push('/how-it-works')}
                className="px-5 py-2.5 rounded-full bg-[#FAF9F6] text-stone-900 font-semibold text-xs hover:bg-white transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Pelajari Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default HowItWorksSection
