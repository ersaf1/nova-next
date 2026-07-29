import React from 'react'
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
          <div className="relative h-[560px]">
            <div className="absolute bottom-[24%] left-[42%] bg-white rounded-2xl px-4 py-3 shadow-xl shadow-black/10">
              <p className="text-black font-medium text-sm" style={{ letterSpacing: '-0.01em' }}>Trip saved ✓</p>
              <p className="text-black/40 text-xs">Bali · 7 nights · 2 travelers</p>
            </div>
          </div>
          <div>
            <h2 className="text-black text-4xl md:text-5xl font-bold leading-tight mb-8" style={{ letterSpacing: '-0.04em' }}>Travel further,<br />worry less.</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {highlights.map((h) => {
                const Icon = h.icon
                return (
                  <div key={h.title} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-black/[0.04]">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
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
            <a href="/how-it-works" className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors duration-200">Explore features</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesHighlightSection
