'use client'

import React, { useState } from 'react'
import { ArrowRight, MapPin, Users, Mountain, Briefcase } from 'lucide-react'

const modes = [
  { label: 'Solo', short: 'Your pace, your rules.', image: '', icon: MapPin, accent: 'from-amber-500/80' },
  { label: 'Family', short: 'Memories for everyone.', image: '', icon: Users, accent: 'from-sky-500/80' },
  { label: 'Adventure', short: 'Push every limit.', image: '', icon: Mountain, accent: 'from-emerald-500/80' },
  { label: 'Business', short: 'Effortless corporate travel.', image: '', icon: Briefcase, accent: 'from-violet-500/80' },
]

const ExperiencesSection: React.FC = () => {
  const [active, setActive] = useState(0)
  return (
    <section id="experiences" className="bg-[#F5F5F5] px-4 sm:px-6 py-20">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-black text-4xl md:text-5xl font-medium leading-none" style={{ letterSpacing: '-0.04em' }}>Travel modes</h2>
          <a href="/search" className="hidden sm:inline-flex items-center gap-2 text-black/50 text-sm font-medium hover:text-black transition-colors group">
            Explore all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3">
            {modes.map((mode, i) => {
              const Icon = mode.icon
              const isActive = active === i
              return (
                <button key={mode.label} onClick={() => setActive(i)} className={`group relative flex-1 lg:flex-none overflow-hidden rounded-2xl cursor-pointer text-left ${isActive ? 'ring-2 ring-black/20' : ''}`} style={{ minHeight: isActive ? '160px' : '110px', transition: 'min-height 0.4s ease' }}>
                  {mode.image ? (
                    <img src={mode.image} alt={mode.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover img-smooth-zoom" />
                  ) : null}
                  <div className={`absolute inset-0 bg-gradient-to-t ${mode.accent} to-black/60 transition-opacity duration-300 ${isActive ? 'opacity-90' : 'opacity-70'}`} />
                  <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Icon className="w-4 h-4 text-white" /></div>
                    <div>
                      <h3 className="text-white font-bold text-xl" style={{ letterSpacing: '-0.02em' }}>{mode.label}</h3>
                      <p className={`text-white/70 text-sm mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'}`}>{mode.short}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden" style={{ minHeight: '480px' }}>
            {modes.map((mode, i) => (
              <div key={mode.label} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: active === i ? 1 : 0, pointerEvents: active === i ? 'auto' : 'none' }}>
                {mode.image ? (
                  <img src={mode.image} alt={mode.label} loading="lazy" className="w-full h-full object-cover" />
                ) : null}
                <div className={`absolute inset-0 bg-gradient-to-t ${mode.accent} to-transparent opacity-50`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Travel mode</p>
                  <h3 className="text-white text-4xl font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>{mode.label}</h3>
                  <p className="text-white/70 text-base mb-6">{mode.short}</p>
                  <a href="/search" className="inline-flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"><ArrowRight className="w-4 h-4 text-white" /></span>
                    <span className="text-white font-medium">Explore {mode.label}</span>
                  </a>
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
