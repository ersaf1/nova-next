import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Globe2, Map, Clock, Award, ArrowRight } from 'lucide-react'

const highlights = [
  { icon: Globe2, title: 'Destinasi Negara', stat: '195+' },
  { icon: Map, title: 'Rute Terkurasi', stat: '10K+' },
  { icon: Clock, title: 'Ketersediaan Jadwal', stat: 'Real-time' },
  { icon: Award, title: 'Traveler Puas', stat: '99.4%' },
]

const FeaturesHighlightSection: React.FC = () => {
  return (
    <section className="bg-[#F8FAFC] px-4 sm:px-6 py-20 border-t border-slate-200/70">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Visual Showcase Card with Sunlit Layering */}
          <div className="relative h-[520px] md:h-[560px] w-full rounded-[2.5rem] bg-gradient-to-tr from-blue-50/70 via-white to-blue-50/40 border border-blue-100 shadow-xl shadow-blue-950/5 overflow-hidden flex items-center justify-center p-8 select-none">
            {/* Soft Ambient Radial Backgrounds */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,98,227,0.06),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />

            {/* Main Destination Card */}
            <div className="absolute top-[10%] left-[8%] w-[68%] h-[68%] rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/20 border-2 border-white -rotate-3 hover:rotate-0 hover:scale-[1.03] transition-all duration-500 z-10 group/img">
              <div className="relative w-full h-full">
                <Image
                  src="/uploads/packages/bali_escape.jpg"
                  alt="Bali Escape"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-[#0A192F]/20 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 text-white">
                  JELAJAH BALI & UBUD
                </span>
              </div>
            </div>

            {/* Floating Card 1: Itinerary / Timeline */}
            <div className="absolute bottom-[8%] left-[4%] w-[220px] bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-blue-950/10 border border-blue-100 z-20 rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <p className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest mb-3">
                Smart Route Concierge
              </p>
              <div className="space-y-3.5">
                <div className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 font-bold text-xs leading-none mb-0.5">Day 1: Ubud Sanctuary</p>
                    <p className="text-slate-400 text-[10px]">Tegallalang & Monkey Forest</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 font-bold text-xs leading-none mb-0.5">Day 2: Uluwatu Sunset</p>
                    <p className="text-slate-400 text-[10px]">Kecak Dance & Cliff Dinner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Trip Saved */}
            <div className="absolute top-[16%] right-[4%] bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl shadow-blue-950/10 border border-blue-100 z-20 -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <span className="font-extrabold text-sm">✓</span>
              </div>
              <div>
                <p className="text-slate-900 font-bold text-xs leading-none mb-0.5">Booking Terkonfirmasi</p>
                <p className="text-slate-400 text-[10px]">Resort 5★ · 7 Malam · 2 Tamu</p>
              </div>
            </div>

            {/* Floating Card 3: Rating / Reviews */}
            <div className="absolute bottom-[20%] right-[6%] bg-blue-600 text-white rounded-2xl p-4 shadow-lg shadow-blue-600/30 z-20 -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 text-sm">★</span>
                <span className="font-extrabold text-xs">4.98 Rating</span>
              </div>
              <p className="text-[10px] text-blue-100 font-medium">1,400+ Ulasan Puas</p>
            </div>
          </div>

          {/* Right Text Block */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-3">
              <span>05 / Keunggulan Ekosistem</span>
            </div>
            <h2 className="text-blue-950 text-4xl md:text-5xl font-black leading-tight mb-8" style={{ letterSpacing: '-0.035em' }}>
              <span>Jelajah Lebih Jauh, </span>
              <span className="font-serif-luxury italic font-normal text-blue-600 block mt-1">
                Tanpa Rasa Khawatir.
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3.5 mb-8">
              {highlights.map((h) => {
                const Icon = h.icon
                return (
                  <div key={h.title} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-blue-950 font-black text-xl leading-tight" style={{ letterSpacing: '-0.03em' }}>{h.stat}</p>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">{h.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-extrabold px-6 py-3.5 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-sm shadow-blue-600/25 group"
            >
              <span>Pelajari Fitur Lengkap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default FeaturesHighlightSection
