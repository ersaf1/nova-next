'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Shield, Zap, HeadphonesIcon, CreditCard, LucideIcon } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

interface Feature {
  id?: number
  title: string
  stat: string
  statLabel: string
  iconName: string
  image: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Headphones: HeadphonesIcon,
  CreditCard,
}

const DEFAULT_FEATURES: Feature[] = [
  { title: 'Lightning booking', stat: '< 3 min', statLabel: 'avg. booking time', iconName: 'Zap', image: '' },
  { title: 'Price guarantee', stat: '100%', statLabel: 'price matched', iconName: 'Shield', image: '' },
  { title: '24/7 support', stat: '24/7', statLabel: 'concierge', iconName: 'Headphones', image: '' },
  { title: 'Flexible pay', stat: '50+', statLabel: 'currencies', iconName: 'CreditCard', image: '' },
]

const WhyNovaSection: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES)

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then((data: Feature[]) => { if (Array.isArray(data) && data.length > 0) setFeatures(data) })
      .catch(() => {})
  }, [])

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
              const Icon = ICON_MAP[feature.iconName] ?? Zap
              return (
                <div key={feature.title} className="group relative rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5" style={{ height: '340px' }}>
                  {feature.image ? (
                    <Image src={feature.image} alt={feature.title} fill className="object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out" />
                  ) : null}
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
