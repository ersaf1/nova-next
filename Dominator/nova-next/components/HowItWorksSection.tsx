'use client'

import React from 'react'
import { Search, BookOpen, Compass } from 'lucide-react'
import { useGSAPFadeUp } from '@/hooks/useGSAP'

const steps = [
  { number: '01', icon: Search, title: 'Search', caption: 'Find by mood, season, or style.', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=85' },
  { number: '02', icon: BookOpen, title: 'Book', caption: 'Flights, hotels, experiences — one checkout.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85' },
  { number: '03', icon: Compass, title: 'Explore', caption: 'Itinerary in your pocket. 24/7 concierge.', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=85' },
]

const HowItWorksSection: React.FC = () => {
  const ref = useGSAPFadeUp()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="how-it-works" className="bg-[#FAFAFA] px-4 sm:px-6 py-20 border-b border-black/[0.04]">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-10">
          <h2 data-gsap="fade-up" className="text-black text-4xl md:text-5xl font-bold leading-tight" style={{ letterSpacing: '-0.04em' }}>How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} data-gsap="fade-up" className="group relative rounded-3xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5" style={{ height: '420px' }}>
                <img src={step.image} alt={step.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
                <span className="absolute top-5 right-5 text-white/10 font-extrabold select-none" style={{ fontSize: '7rem', lineHeight: 1, letterSpacing: '-0.06em' }}>{step.number}</span>
                <div className="absolute top-6 left-6 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <h3 className="text-white text-3xl font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>{step.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{step.caption}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[3.25rem] -right-3 w-6 h-6 rounded-full bg-white shadow-md z-10 border-2 border-[#FAFAFA]" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
