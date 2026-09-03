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
    description: 'Cari destinasi impian Anda berdasarkan suasana (Pantai, Pulau, Pegunungan, Kota Bersejarah), atau nama negara dari seluruh destinasi resmi terverifikasi.',
    category: 'Pencarian Destinasi',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90',
    features: ['195+ Destinasi Dunia', 'Filter Kategori & Suasana', 'Pencarian Real-Time']
  },
  {
    number: '02',
    title: 'Kurasi Rute Cerdas & Fleksibel',
    subtitle: 'Rancangan Jadwal Presisi dalam Hitungan Detik',
    description: 'Sistem cerdas menyusun jadwal harian, rekomendasi kuliner lokal, waktu terbaik berkunjung, serta panduan rute wisata optimal sesuai budget Anda.',
    category: 'Smart Route Concierge',
    icon: Navigation,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=90',
    features: ['Rute Harian Presisi', 'Estimasi Biaya & Transparansi', 'Rekomendasi Kuliner & Budaya']
  },
  {
    number: '03',
    title: 'Pemesanan All-Inclusive Instan',
    subtitle: 'Semua Kebutuhan Perjalanan dalam 1 Pembayaran',
    description: 'Pesan paket all-in: tiket pesawat PP, resort bintang 5, tur privat lokal, dan proteksi asuransi perjalanan terpercaya dalam sekali proses aman.',
    category: 'Booking & Reservasi',
    icon: CheckCircle2,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
    features: ['E-Ticket QR Code Resmi', 'Garansi Harga Jujur', 'QRIS & Multi-Payment']
  },
  {
    number: '04',
    title: '24/7 Live Concierge di Tangan Anda',
    subtitle: 'Pendampingan Perjalanan Real-Time',
    description: 'Akses jadwal perjalanan offline dari smartphone Anda, tips lokal, serta tim concierge standby 24 jam via live chat & WhatsApp ke mana pun Anda melangkah.',
    category: 'Pendampingan 24 Jam',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1600&q=90',
    features: ['Itinerary Pocket Offline', 'Panduan Frasa Bahasa Lokal', 'Asistensi Bantuan 24/7']
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
    <section id="how-it-works" className="bg-[#F8FAFC] px-4 sm:px-6 py-24 md:py-32 border-b border-slate-200/80">
      <div className="max-w-[88rem] mx-auto space-y-16">
        
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-200/80">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-100">
              <Compass className="w-3.5 h-3.5" />
              <span>08 / Alur Pemesanan & Perjalanan</span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-blue-950 leading-[1.02] tracking-tight">
              <span>Cara Kerja </span>
              <span className="font-serif-luxury italic font-normal text-blue-600">NOVA Travel</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              Dari eksplorasi awal hingga kembali dengan selamat — NOVA mengelola setiap detail perjalanan Anda dengan sentuhan kurasi manusiawi dan teknologi cerdas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/ai-planner')}
              className="bg-blue-600 text-white text-xs font-extrabold px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-sky-200" />
              <span>Rancang Rute Cerdas</span>
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
                      ? 'bg-white border-blue-600 shadow-xl shadow-blue-950/10 scale-[1.02] ring-1 ring-blue-600/20'
                      : 'bg-white/60 hover:bg-white border-slate-200/80 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-500'
                      }`}>
                        {step.number}
                      </span>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {step.category}
                        </span>
                        <h3 className={`text-base font-bold transition-colors ${
                          isActive ? 'text-blue-950' : 'text-slate-700'
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <StepIcon className="w-4.5 h-4.5" />
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-slate-100 animate-fade-in">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Mediterranean Blue Showcase Card (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-blue-700 via-sky-700 to-indigo-700 rounded-3xl overflow-hidden relative min-h-[480px] lg:min-h-[560px] flex flex-col justify-between p-8 sm:p-10 shadow-2xl shadow-blue-500/15 text-white group border border-blue-400/30">
            {/* Background Image with Smooth Transitions */}
            <img
              key={current.number}
              src={current.image}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover img-smooth-zoom opacity-45 animate-fade-in"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-900/40 to-transparent z-[1]" />

            {/* Top Bar inside Card */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300 block">
                    Tahap {current.number} dari 04
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
                      activeStep === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'
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
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />
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
                className="px-5 py-2.5 rounded-xl bg-white text-blue-950 font-extrabold text-xs hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-md"
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
