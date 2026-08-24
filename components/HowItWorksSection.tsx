'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Sparkles,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Calendar,
  Layers
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
    title: 'Discover & Search 195 Countries',
    subtitle: 'Eksplorasi Destinasi Tanpa Batas',
    description: 'Cari destinasi impian Anda berdasarkan benua, suasana (Pantai, Gunung, Budaya, Kota), atau nama negara dari seluruh 195 negara anggota PBB resmi.',
    category: 'Global Discovery',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90',
    features: ['195 Negara PBB Resmi', 'Filter Suasana & Kategori', 'Pencarian Instan Real-time']
  },
  {
    number: '02',
    title: 'AI Travel Concierge Curation',
    subtitle: 'Rancangan Rute Otomatis dalam Hitungan Detik',
    description: 'Teknologi Gemini AI menyusun jadwal harian, rekomendasi tempat makan lokal, waktu terbaik berkunjung, serta galeri foto objek wisata secara otomatis.',
    category: 'AI Intelligence',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=90',
    features: ['Rute Harian Presisi', 'Estimasi Biaya & Currency', 'Rekomendasi Hotel & Kuliner']
  },
  {
    number: '03',
    title: 'All-Inclusive One-Click Booking',
    subtitle: 'Pemesanan Serba Ada Tanpa Repot',
    description: 'Pesan seluruh tiket pesawat PP, resort mewah bintang 5, tur privat, dan proteksi asuransi perjalanan sekaligus dalam satu pembayaran aman.',
    category: 'Instant Booking',
    icon: CheckCircle2,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
    features: ['E-Ticket dengan QR Code', 'Garansi Harga Transparan', 'Metode Pembayaran Lengkap']
  },
  {
    number: '04',
    title: '24/7 Live Pocket Concierge',
    subtitle: 'Pendampingan Perjalanan Real-Time',
    description: 'Akses jadwal perjalanan offline dari smartphone Anda, kamus frasa bahasa lokal, serta tim bantuan concierge 24 jam di mana pun Anda berada.',
    category: 'Trip Assistance',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1600&q=90',
    features: ['Itinerary Pocket Offline', 'Kamus Frasa Bahasa Lokal', 'Asistensi Bantuan 24 Jam']
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
    <section id="how-it-works" className="bg-[#F8FAFC] px-4 sm:px-6 py-24 md:py-32 border-b border-neutral-200/80" style={{ letterSpacing: '-0.01em' }}>
      <div className="max-w-[88rem] mx-auto space-y-16">
        
        {/* Maximal Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-neutral-200/80">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Seamless AI Travel Experience</span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-950 leading-[1.02] tracking-tight">
              How NOVA Works
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-xl">
              Dari pencarian awal hingga perjalanan kembali dengan aman — NOVA mengelola setiap detail petualangan Anda dengan kecerdasan AI mutakhir.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/ai-planner')}
              className="bg-brand text-white text-xs font-bold px-6 py-3.5 rounded-2xl hover:bg-brand-dark transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Coba AI Planner</span>
            </button>
          </div>
        </div>

        {/* Interactive Step Switcher & Live Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Step List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-center">
            {STEPS.map((step, index) => {
              const isActive = activeStep === index
              const StepIcon = step.icon

              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`p-6 rounded-3xl cursor-pointer transition-all duration-500 border relative overflow-hidden group ${
                    isActive
                      ? 'bg-white border-brand-dark shadow-xl scale-[1.02] ring-1 ring-neutral-950/10'
                      : 'bg-white/60 hover:bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black transition-colors ${
                        isActive ? 'text-neutral-950' : 'text-neutral-300 group-hover:text-neutral-500'
                      }`}>
                        {step.number}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                          {step.category}
                        </span>
                        <h3 className={`text-base font-bold transition-colors ${
                          isActive ? 'text-neutral-950' : 'text-neutral-700'
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'bg-brand text-white shadow-xs' : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                    }`}>
                      <StepIcon className="w-4.5 h-4.5" />
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-neutral-100 animate-fade-in">
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Animated Live Visual Showcase Card (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#052a2f] to-[#08454d] rounded-3xl overflow-hidden relative min-h-[480px] lg:min-h-[560px] flex flex-col justify-between p-8 sm:p-10 shadow-2xl text-white group">
            {/* Background Image with Smooth Transitions */}
            <img
              key={current.number}
              src={current.image}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover img-smooth-zoom opacity-40 animate-fade-in"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-[1]" />

            {/* Top Bar inside Card */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                    Step {current.number} of 04
                  </span>
                  <span className="text-xs font-bold text-white">{current.category}</span>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStep === i ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'
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
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
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
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside Showcase */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
              <span className="text-xs font-bold text-white/70">
                {current.subtitle}
              </span>

              <button
                onClick={() => router.push('/how-it-works')}
                className="px-5 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-colors flex items-center gap-2 shadow-md"
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
