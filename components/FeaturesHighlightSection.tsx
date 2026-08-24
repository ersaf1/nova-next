import React from 'react'
import Image from 'next/image'
import { Globe2, Map, Clock, Award } from 'lucide-react'

const highlights = [
  { icon: Globe2, title: '150+ Countries', stat: '150+' },
  { icon: Map, title: 'Curated routes', stat: '10k+' },
  { icon: Clock, title: 'Live availability', stat: 'Real-time' },
  { icon: Award, title: 'Award-winning', stat: '#1' },
]

const FeaturesHighlightSection: React.FC = () => {
  return (
    <section className="bg-[#F5F5F5] px-4 sm:px-6 py-20 border-t border-black/5">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative h-[520px] md:h-[560px] w-full rounded-[2.5rem] bg-gradient-to-tr from-neutral-200/40 via-neutral-100/60 to-white/80 border border-black/[0.04] shadow-inner overflow-hidden flex items-center justify-center p-8 select-none">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.05),transparent_60%)] pointer-events-none" />

            {/* Main Destination Card */}
            <div className="absolute top-[10%] left-[8%] w-[68%] h-[68%] rounded-3xl overflow-hidden shadow-2xl shadow-black/15 border border-white -rotate-3 hover:rotate-0 hover:scale-[1.03] transition-all duration-500 z-10 group/img">
              <div className="relative w-full h-full">
                <Image
                  src="/uploads/packages/bali_escape.jpg"
                  alt="Bali Escape"
                  fill
                  className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <span className="text-[9px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  Explore Bali
                </span>
              </div>
            </div>

            {/* Floating Card 1: Itinerary / Timeline */}
            <div className="absolute bottom-[8%] left-[4%] w-[220px] bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-black/[0.03] z-20 rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-3">AI Travel Planner</p>
              <div className="space-y-3.5">
                <div className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-black font-semibold text-xs leading-none mb-0.5">Day 1: Ubud Sanctuary</p>
                    <p className="text-black/40 text-[10px]">Tegallalang & Monkey Forest</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-black font-semibold text-xs leading-none mb-0.5">Day 2: Uluwatu Temple</p>
                    <p className="text-black/40 text-[10px]">Sunset & Kecak Dance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Trip Saved */}
            <div className="absolute top-[16%] right-[4%] bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-black/[0.03] z-20 -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="text-emerald-600 font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="text-black font-bold text-xs leading-none mb-0.5">Trip saved</p>
                <p className="text-black/40 text-[10px]">Bali · 7 nights · 2 pax</p>
              </div>
            </div>

            {/* Floating Card 3: Rating / Reviews */}
            <div className="absolute bottom-[20%] right-[6%] bg-brand text-white rounded-2xl p-4 shadow-xl shadow-brand/30 z-20 -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-sm">★</span>
                <span className="font-bold text-xs">4.95 Rating</span>
              </div>
              <p className="text-[10px] text-white/50 font-medium">1,200+ reviews</p>
            </div>
          </div>
          <div>
            <h2 className="text-black text-4xl md:text-5xl font-bold leading-tight mb-8" style={{ letterSpacing: '-0.04em' }}>Travel further,<br />worry less.</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {highlights.map((h) => {
                const Icon = h.icon
                return (
                  <div key={h.title} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-black/[0.04]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-black font-bold text-xl leading-tight" style={{ letterSpacing: '-0.03em' }}>{h.stat}</p>
                      <p className="text-black/45 text-xs font-medium">{h.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <a href="/how-it-works" className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-brand-dark transition-colors duration-200">Explore features</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesHighlightSection
