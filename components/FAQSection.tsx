'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useGSAPFadeUp } from '@/hooks/useGSAP'
import ScrollReveal from './ScrollReveal'

interface FAQ {
  id: number
  q: string
  a: string
}

const DEFAULT_FAQS: FAQ[] = [
  {
    id: 1,
    q: 'Apa saja yang sudah termasuk dalam paket perjalanan All-Inclusive?',
    a: 'Seluruh paket All-Inclusive mencakup tiket pesawat pulang-pergi (PP), akomodasi hotel atau resort bintang 4/5 terverifikasi, transportasi lokal privat, jadwal makan terencana, tiket masuk destinasi wisata, serta asuransi perjalanan dasar.'
  },
  {
    id: 2,
    q: 'Bagaimana kebijakan pembatalan dan jaminan pengembalian dana (refund)?',
    a: 'NOVA memberikan jaminan 100% refund untuk pembatalan lebih dari 30 hari sebelum keberangkatan, dan 50% refund untuk 15-30 hari sebelum keberangkatan. Jika terjadi kendala bencana alam atau penutupan bandara resmi, perjalanan dapat dijadwalkan ulang secara fleksibel tanpa penalti.'
  },
  {
    id: 3,
    q: 'Kapan dan bagaimana saya menerima e-ticket setelah pembayaran?',
    a: 'Setelah pembayaran berhasil diverifikasi, e-ticket dan voucher akomodasi resmi langsung terbit di menu Pemesanan Saya dan dikirimkan salinannya ke email terdaftar dalam hitungan menit.'
  },
  {
    id: 4,
    q: 'Bagaimana jika saya memerlukan bantuan darurat selama liburan?',
    a: 'Pemandu lokal berlisensi dan tim Travel Concierge NOVA siap mendampingi Anda 24 jam via WhatsApp untuk menangani kendala akomodasi, penyesuaian jadwal, atau bantuan darurat di lapangan.'
  }
]

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()
  const gsapRef = useGSAPFadeUp()
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS)

  useEffect(() => {
    fetch('/api/faqs')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs((data as FAQ[]).slice(0, 4))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section ref={ref} id="help" className="bg-[#FAF9F6] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Heading & Concierge Box (5 cols) */}
          <div ref={gsapRef as React.RefObject<HTMLDivElement>} className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
                <HelpCircle className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>Pusat Bantuan & FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
                Pertanyaan yang <span className="font-serif-luxury italic font-normal text-stone-800">Sering Diajukan</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Segala hal yang perlu Anda ketahui tentang pemesanan tiket, akomodasi, proteksi refund, dan concierge NOVA.
              </p>
            </div>

            {/* Live Concierge Contact Card */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-[#C29B38] flex items-center justify-center shrink-0 border border-stone-200">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Butuh Bantuan Langsung?
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Tim concierge kami siap melayani 24/7 via WhatsApp.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo%20NOVA%20Travel,%20saya%20ingin%20tanya%20paket%20wisata"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-stone-900 hover:bg-black text-white font-semibold text-xs py-3.5 px-4 rounded-full transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Chat Concierge WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Accordions (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={faq.id || i}
                  className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-stone-400 shadow-md ring-1 ring-stone-900/10' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#1C1917] pr-4">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '300px' : '0px' }}
                  >
                    <p className="px-5 sm:px-6 pb-6 text-xs text-stone-600 leading-relaxed font-normal border-t border-stone-100 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* Link to Full FAQ */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
              <span>Menampilkan 4 pertanyaan penting pilihan.</span>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 font-semibold text-stone-900 hover:text-[#C29B38] transition-colors focus-visible:ring-2 focus-visible:ring-[#C29B38] rounded-md outline-none"
              >
                <span>Lihat semua pertanyaan di Pusat Bantuan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default FAQSection
