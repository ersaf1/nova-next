'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Star, MapPin } from 'lucide-react'
import { useGSAPStagger } from '@/hooks/useGSAP'

interface Testimonial {
  id: number
  name: string
  location: string
  avatar: string
  rating: number
  text: string
  trip: string
}

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [stats, setStats] = useState({ rating: '4.9/5', recommend: '98%', travelers: '2M+' })
  const ref = useGSAPStagger()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in-view'); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setTestimonials(data as Testimonial[]) })
      .catch(() => {})
    fetch('/api/stats')
      .then(r => r.json())
      .then((data: { statKey: string; value: string }[]) => {
        if (!Array.isArray(data)) return
        const get = (key: string) => data.find(s => s.statKey === key)?.value
        setStats({
          rating: get('app_rating') ?? '4.9/5',
          recommend: get('recommend_rate') ?? '98%',
          travelers: get('travelers') ?? '2M+',
        })
      })
      .catch(() => {})
  }, [])

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-12">
          <p className="text-black/50 text-sm font-medium tracking-widest uppercase mb-3">Real travelers, real stories</p>
          <h2 ref={headingRef} className="heading-animate text-black text-4xl md:text-5xl font-medium leading-tight" style={{ letterSpacing: '-0.03em' }}>Loved by explorers<br />everywhere.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.id} data-gsap="stagger" className="rounded-2xl p-7 flex flex-col justify-between min-h-64 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="w-4 h-4 fill-black text-black" />))}
                </div>
                <p className="text-black/80 text-base leading-relaxed mb-6">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-black/5">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-black font-medium text-sm">{t.name}</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-black/40" />
                    <p className="text-black/40 text-xs">{t.location}</p>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-black/30 text-xs">{t.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          <div><span className="text-black text-2xl font-medium block" style={{ letterSpacing: '-0.03em' }}>{stats.rating}</span><span className="text-black/40 text-sm">App Store rating</span></div>
          <div className="w-px h-8 bg-black/10 hidden sm:block" />
          <div><span className="text-black text-2xl font-medium block" style={{ letterSpacing: '-0.03em' }}>{stats.recommend}</span><span className="text-black/40 text-sm">would recommend</span></div>
          <div className="w-px h-8 bg-black/10 hidden sm:block" />
          <div><span className="text-black text-2xl font-medium block" style={{ letterSpacing: '-0.03em' }}>{stats.travelers}</span><span className="text-black/40 text-sm">happy travelers</span></div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
