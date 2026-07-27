'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface FAQ {
  id: number
  q: string
  a: string
}

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()
  const [faqs, setFaqs] = useState<FAQ[]>([])

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
          <div className="transition-all duration-700 lg:sticky lg:top-32" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)' }}>
            <p className="text-black/40 text-xs font-medium tracking-widest uppercase mb-8">Got questions?</p>
            <h2 className="text-black text-4xl md:text-5xl font-medium leading-tight mb-10" style={{ letterSpacing: '-0.03em' }}>Frequently<br />asked questions.</h2>
            <p className="text-black/50 text-base leading-relaxed mb-12 max-w-sm">Everything you need to know about booking with NOVA. Can&apos;t find an answer? Our concierge team is available 24/7.</p>
            <button className="inline-flex items-center gap-3 bg-black text-white text-sm font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Talk to support
              <span className="bg-white rounded-full p-2"><ChevronDown className="w-4 h-4 text-black rotate-[-90deg]" /></span>
            </button>
          </div>
          <div className="transition-all duration-700 delay-150" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)' }}>
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <div key={faq.id} className="bg-white rounded-2xl overflow-hidden border border-black/[0.04]">
                  <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-7 py-6 text-left">
                    <span className="text-black font-medium text-sm pr-8" style={{ letterSpacing: '-0.01em' }}>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-black/40 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: openIndex === i ? '300px' : '0px' }}>
                    <p className="px-7 pb-7 text-black/50 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
