import React from 'react'
import { Shield, Zap, HeadphonesIcon, CreditCard } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const features = [
  { icon: Zap, title: 'Lightning booking', stat: '< 3 min', statLabel: 'avg. booking time', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=85' },
  { icon: Shield, title: 'Price guarantee', stat: '100%', statLabel: 'price matched', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=85' },
  { icon: HeadphonesIcon, title: '24/7 support', stat: '24/7', statLabel: 'concierge', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=85' },
  { icon: CreditCard, title: 'Flexible pay', stat: '50+', statLabel: 'currencies', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=85' },
]

const WhyNovaSection: React.FC = () => {
  return (
    <section className="bg-white px-4 sm:px-6 py-20 border-b border-black/[0.04]">
      <div className="max-w-[88rem] mx-auto">
        <ScrollReveal animation="slide-up">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-black text-4xl md:text-5xl font-bold leading-tight" style={{ letterSpacing: '-0.04em' }}>The NOVA<br />difference.</h2>
            <p className="hidden md:block text-black/50 text-base max-w-xs text-right leading-relaxed">Built for you — not the average traveler.</p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal staggerChildren={true} animation="slide-up" delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="group relative rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5" style={{ height: '340px' }}>
                  <img src={feature.image} alt={feature.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                  <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg mb-3" style={{ letterSpacing: '-0.02em' }}>{feature.title}</h3>
                    <div className="pt-3 border-t border-white/15">
                      <span className="text-white text-2xl font-extrabold block" style={{ letterSpacing: '-0.03em' }}>{feature.stat}</span>
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{feature.statLabel}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default WhyNovaSection
