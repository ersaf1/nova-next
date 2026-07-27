'use client'

import { Search, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const STEPS = [
  {
    number: '01',
    title: 'Search & Explore',
    description: 'Browse 150+ destinations or use our AI planner to craft your perfect itinerary in seconds.',
    icon: Search,
  },
  {
    number: '02',
    title: 'AI Recommendations',
    description: 'Get personalized package suggestions based on your preferences, budget, and travel style.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Book Instantly',
    description: 'Secure your trip with one click — flights, hotels, and experiences bundled together.',
    icon: CheckCircle2,
  },
]

export default function HowItWorksPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-[88rem] mx-auto">
          
          {/* Header */}
          <div className="pt-12 pb-16 text-center max-w-3xl mx-auto">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-4">Simple & seamless</p>
            <h1 className="text-5xl md:text-6xl font-semibold text-black leading-[1.05] mb-6" style={{ letterSpacing: '-0.03em' }}>
              How NOVA Works
            </h1>
            <p className="text-base text-black/40 leading-relaxed">
              From first search to safe return — NOVA handles every detail of your journey with AI-powered intelligence.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-3xl border border-black/[0.04] p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto mb-6">
                  <step.icon size={24} className="text-white" />
                </div>
                <p className="text-xs font-bold text-black/20 uppercase tracking-widest mb-3">{step.number}</p>
                <h3 className="text-black text-xl font-semibold mb-3" style={{ letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p className="text-black/40 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Video placeholder */}
          <div className="bg-white rounded-3xl border border-black/[0.04] p-12 mb-16">
            <div className="aspect-video bg-black/[0.03] rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                  <ArrowRight size={28} className="text-white rotate-180" style={{ transform: 'rotate(-90deg)' }} />
                </div>
                <p className="text-black/30 text-sm font-medium">Product demo coming soon</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-black rounded-3xl p-12 text-center">
            <h2 className="text-white text-3xl font-semibold mb-4" style={{ letterSpacing: '-0.02em' }}>Ready to start planning?</h2>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">Let our AI craft your perfect itinerary or browse curated packages — your adventure starts here.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => router.push('/itinerary')}
                className="bg-white text-black text-sm font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Sparkles size={14} />
                Try AI Planner
              </button>
              <button
                onClick={() => router.push('/search')}
                className="bg-white/10 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-white/20 transition-colors border border-white/10"
              >
                Browse Packages
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
