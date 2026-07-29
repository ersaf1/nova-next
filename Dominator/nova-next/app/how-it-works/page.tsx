'use client'

import React, { useState } from 'react'
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
  Layers,
  HelpCircle,
  ChevronDown,
  Play,
  Check
} from 'lucide-react'
import Navbar from '@/components/Navbar'

const STEPS = [
  {
    number: '01',
    title: 'Discover & Search 195 UN Countries',
    subtitle: 'Pencarian Destinasi Tanpa Batas',
    description: 'Cari tempat impian Anda berdasarkan nama negara dari seluruh 195 negara anggota PBB resmi, atau filter berdasarkan kategori (Pantai, Gunung, Budaya, Kota, Petualangan, & Alam).',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90',
    highlights: ['Database 195 Negara PBB', 'Foto HD Unik Tiap Negara', 'Filter Kategori & Harga']
  },
  {
    number: '02',
    title: 'Gemini AI Custom Itinerary',
    subtitle: 'Rancangan Rute Otomatis dalam Hitungan Detik',
    description: 'Cukup masukkan nama destinasi dan durasi hari. AI kami akan membuatkan jadwal harian per jam, rekomendasi kuliner lokal, estimasi biaya, dan galeri foto objek wisata ikonik.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=90',
    highlights: ['Jadwal Harian Per Jam', 'Galeri Foto Objek Wisata', 'Tips & Frasa Bahasa Lokal']
  },
  {
    number: '03',
    title: 'One-Click All-Inclusive Booking',
    subtitle: 'Pemesanan Serba Ada Tanpa Repot',
    description: 'Dapatkan paket liburan lengkap yang sudah mencakup tiket pesawat PP, resort bintang 5, tur privat, dan perlindungan asuransi dalam satu kali checkout aman.',
    icon: CheckCircle2,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
    highlights: ['Konfirmasi E-Ticket Instan', 'Tanpa Biaya Tersembunyi', 'Garansi Harga Terbaik']
  },
  {
    number: '04',
    title: '24/7 Live Pocket Concierge',
    subtitle: 'Pendampingan Perjalanan Real-Time',
    description: 'Akses jadwal perjalanan offline dari smartphone Anda, pembaruan status penerbangan, kamus frasa lokal, serta dukungan tim tim concierge 24 jam nonstop.',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1600&q=90',
    highlights: ['Akses Jadwal Offline', 'Dukungan Concierge 24/7', 'Integrasi Dashboard User']
  }
]

const FAQS = [
  {
    question: 'Bagaimana cara kerja AI Travel Planner di NOVA?',
    answer: 'AI Travel Planner kami ditenagai oleh kecerdasan buatan Gemini AI. Cukup ketik negara atau kota tujuan Anda (misal: Argentina, Japan, Bali) beserta durasi hari, AI akan menyusun rute harian, rekomendasi hotel, estimasi biaya, dan foto-foto tempat populer secara instan.'
  },
  {
    question: 'Apakah paket travel di NOVA sudah termasuk tiket pesawat?',
    answer: 'Ya, mayoritas paket wisata eksklusif NOVA (All-Inclusive) sudah mencakup tiket pesawat pulang-pergi (PP), akomodasi hotel bintang 5, penjemputan bandara, dan tur privat sesuai rincian pada halaman paket.'
  },
  {
    question: 'Bagaimana cara menerima E-Ticket setelah melakukan booking?',
    answer: 'Setelah pembayaran terverifikasi, E-Ticket ber-QR code resmi akan diterbitkan secara otomatis dan dapat Anda unduh dari halaman Dashboard User maupun bukti pembayaran.'
  },
  {
    question: 'Apakah saya bisa mengubah tanggal atau membatalkan perjalanan?',
    answer: 'Tentu. Anda dapat mengajukan perubahan tanggal atau pembatalan perjalanan sesuai dengan kebijakan pembatalan paket melalui menu Dashboard atau menghubungi Customer Support 24/7 kami.'
  }
]

export default function HowItWorksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-[88rem] mx-auto space-y-16">

          {/* Maximal Editorial Hero Header */}
          <div className="pt-12 pb-6 border-b border-neutral-200/80 text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Step-by-Step Travel Guide</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-950 leading-[1.02] tracking-tight">
              Empowering Your Journey with AI
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Pelajari bagaimana platform NOVA mengintegrasikan kecerdasan buatan, akses 195 negara PBB, dan reservasi *all-inclusive* untuk mewujudkan liburan sempurna Anda.
            </p>
          </div>

          {/* 4-Step Cards Grid Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STEPS.map((step) => {
              const StepIcon = step.icon

              return (
                <div
                  key={step.number}
                  className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5"
                >
                  {/* Photo Header Container */}
                  <div className="relative h-64 overflow-hidden bg-neutral-900">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      className="w-full h-full object-cover img-smooth-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                    {/* Step Number Badge */}
                    <span className="absolute top-4 left-4 text-5xl font-black text-white/20 select-none">
                      {step.number}
                    </span>

                    <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <StepIcon className="w-5 h-5" />
                    </div>

                    <div className="absolute bottom-4 left-6 right-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                        {step.subtitle}
                      </span>
                      <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-7 space-y-5 flex-1 flex flex-col justify-between">
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      {step.description}
                    </p>

                    {/* Highlights List */}
                    <div className="pt-4 border-t border-neutral-100 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Fitur Utama:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {step.highlights.map((h, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold bg-neutral-100 text-neutral-800 px-3 py-1 rounded-xl flex items-center gap-1.5"
                          >
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Interactive Feature Sandbox Showcase */}
          <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/15 pb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  Interactive Technology Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Pengalaman Interaktif Platform NOVA
                </h2>
              </div>

              {/* Interactive Tabs Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['AI Planner Demo', '195 UN Countries Database', 'Instant E-Ticket Booking'].map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === idx
                        ? 'bg-white text-neutral-950 shadow-md'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Preview Screen */}
            <div className="bg-neutral-900 border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6">
              {activeTab === 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Gemini 2.0 AI Itinerary Generation
                    </span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2.5 py-1 rounded-full">Real-Time Sync</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Destinasi: "Argentina — 5 Hari Perjalanan"</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-neutral-800/80 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">Hari 1</span>
                      <p className="text-xs font-bold text-white">Buenos Aires Plaza & Tango Show</p>
                    </div>
                    <div className="bg-neutral-800/80 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">Hari 2</span>
                      <p className="text-xs font-bold text-white">Glacier Perito Moreno Trekking</p>
                    </div>
                    <div className="bg-neutral-800/80 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">Hari 3</span>
                      <p className="text-xs font-bold text-white">Mendoza Wine Tasting Tour</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4" />
                      195 Official UN Member States Database
                    </span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2.5 py-1 rounded-full">Global Coverage</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Cakupan lengkap dari Asia, Eropa, Amerika, Afrika, & Oseania dengan foto HD unik.</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Indonesia 🇮🇩', 'Japan 🇯🇵', 'Argentina 🇦🇷', 'France 🇫🇷', 'Egypt 🇪🇬', 'Switzerland 🇨🇭', 'Iceland 🇮🇸'].map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Instant E-Ticket & Order Confirmation
                    </span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2.5 py-1 rounded-full">Verifikasi QR Code</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Pemesanan tiket pesawat, hotel bintang 5, & pemandu wisata dalam 1 klik.</p>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between">
                    <span>Order #NV-2026-9482 · E-Ticket Terkonfirmasi</span>
                    <span className="px-2 py-0.5 bg-emerald-500 text-neutral-950 font-bold rounded">SUCCESS</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frequently Asked Questions Section */}
          <div className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Paling Sering Ditanyakan</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950">Pertanyaan Umum (FAQ)</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-bold text-neutral-900 text-sm flex items-center justify-between gap-4 hover:bg-neutral-50"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-neutral-950' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conversion CTA Footer Banner */}
          <div className="p-8 sm:p-12 bg-neutral-950 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Siap Memulai Liburan?</span>
              <h3 className="text-2xl font-extrabold tracking-tight">Mulai Perjalanan Anda Bersama NOVA Today</h3>
              <p className="text-xs text-neutral-400 max-w-xl">Rancang rencana perjalanan impian Anda dengan AI atau jelajahi paket wisata eksklusif.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => router.push('/itinerary')}
                className="px-6 py-3.5 rounded-2xl bg-white text-neutral-950 text-xs font-extrabold hover:bg-neutral-100 transition-colors flex items-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Coba AI Planner</span>
              </button>
              <button
                onClick={() => router.push('/destinations')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors"
              >
                Jelajahi 195 Destinasi
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
