'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Mail } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface FAQ {
  id: number
  q: string
  a: string
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setFaqs(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="pt-12 pb-10 text-center">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-4">Help center</p>
            <h1 className="text-5xl md:text-6xl font-semibold text-black leading-[1.05] mb-4" style={{ letterSpacing: '-0.03em' }}>
              Frequently Asked
              <br />
              Questions
            </h1>
            <p className="text-base text-black/40 leading-relaxed max-w-md mx-auto">
              Everything you need to know about booking with NOVA. Can't find an answer? Our support team is here 24/7.
            </p>
          </div>

          {/* FAQs */}
          <div className="space-y-3 mb-12">
            {faqs.map((faq, i) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-black font-semibold text-sm pr-4" style={{ letterSpacing: '-0.01em' }}>{faq.q}</span>
                  <ChevronDown size={16} className={`text-black/30 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-black/50 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Support CTA */}
          <div className="bg-white rounded-3xl border border-black/[0.04] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-4">
              <Mail size={20} className="text-black/40" />
            </div>
            <h3 className="text-black text-lg font-semibold mb-2" style={{ letterSpacing: '-0.02em' }}>Still have questions?</h3>
            <p className="text-black/40 text-sm mb-6">Can't find the answer you're looking for? Reach out to our concierge team.</p>
            <a
              href="mailto:support@nova.travel"
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-black/80 transition-colors"
            >
              Contact Support
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
