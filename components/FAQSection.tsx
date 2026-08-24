'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useGSAPFadeUp } from '@/hooks/useGSAP'

interface FAQ {
  id: number
  q: string
  a: string
}

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()
  const gsapRef = useGSAPFadeUp()
  const [faqs, setFaqs] = useState<FAQ[]>([])
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
    fetch('/api/faqs')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setFaqs(data as FAQ[])
      })
      .catch(() => {})
  }, [])

  return (
    <section ref={ref} id="help" className="bg-[#F5F5F5] px-6 py-36">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div ref={gsapRef as React.RefObject<HTMLDivElement>} className="transition-all duration-700 lg:sticky lg:top-32" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)' }}>
            <p data-gsap="fade-up" className="text-black/40 text-xs font-medium tracking-widest uppercase mb-8">Got questions?</p>
            <h2 ref={headingRef} data-gsap="fade-up" className="heading-animate text-black text-4xl md:text-5xl font-medium leading-tight mb-10" style={{ letterSpacing: '-0.03em' }}>Frequently<br />asked questions.</h2>
            <p data-gsap="fade-up" className="text-black/50 text-base leading-relaxed mb-12 max-w-sm">Everything you need to know about booking with NOVA. Can&apos;t find an answer? Our concierge team is available 24/7.</p>
            <a href="mailto:support@nova.travel" className="inline-flex items-center gap-3 bg-brand text-white text-sm font-medium pl-6 pr-2 py-2 rounded-full hover:bg-brand-dark transition-colors duration-200">
              Talk to support
              <span className="bg-white rounded-full p-2"><ChevronDown className="w-4 h-4 text-black rotate-[-90deg]" /></span>
            </a>
          </div>
          <div className="transition-all duration-700 delay-150" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)' }}>
            <div className="flex flex-col gap-3">
              {faqs.slice(0, 5).map((faq, i) => (
                <div key={faq.id} className="border-b border-black/[0.06] last:border-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full flex items-center justify-between px-7 py-6 text-left hover:bg-black/[0.02] transition-colors duration-150"
                  >
                    <span className="text-black font-medium text-sm pr-8" style={{ letterSpacing: '-0.01em' }}>{faq.q}</span>
                    <span className={`w-5 h-5 text-black/40 shrink-0 transition-transform duration-300 flex items-center justify-center ${openIndex === i ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: openIndex === i ? '400px' : '0px' }}
                  >
                    <p className="px-7 pb-7 text-black/50 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
              {faqs.length > 5 && (
                <div className="pt-4 pl-7 text-left">
                  <a 
                    href="/faq" 
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/60 hover:text-black transition-colors duration-200"
                  >
                    View all {faqs.length} FAQs
                    <span className="text-sm font-light">→</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
