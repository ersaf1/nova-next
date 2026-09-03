'use client'

import React, { useState, useEffect, useRef } from 'react'
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
    q: 'Bagaimana cara melakukan pemesanan paket wisata di NOVA?',
    a: 'Sangat mudah! Pilih paket wisata yang Anda inginkan, tentukan jadwal keberangkatan, isi data traveler, dan lakukan pembayaran instan via Virtual Account, QRIS, Kartu Kredit, atau PayLater. E-ticket resmi akan langsung terbit dalam hitungan menit.'
  },
  {
    id: 2,
    q: 'Apakah harga yang tertera sudah termasuk tiket pesawat dan resort?',
    a: 'Ya, seluruh paket berlabel "All-Inclusive" sudah mencakup tiket pesawat pulang-pergi (PP), akomodasi resort/hotel bintang 4 atau 5 terverifikasi, makan sesuai jadwal, transportasi privat selama tur, serta tiket masuk objek wisata.'
  },
  {
    id: 3,
    q: 'Bagaimana kebijakan pembatalan dan garansi pengembalian dana (refund)?',
    a: 'NOVA memberikan garansi 100% refund untuk pembatalan lebih dari 30 hari sebelum keberangkatan, dan 50% refund untuk 15-30 hari sebelum keberangkatan. Jika terjadi kendala bencana alam atau penutupan bandara resmi, dana dapat di-reschedule secara fleksibel.'
  },
  {
    id: 4,
    q: 'Bagaimana cara kerja fitur Smart Route Planner di NOVA?',
    a: 'Fitur Smart Route Planner menganalisis preferensi kota tujuan, durasi liburan, rentang budget, dan minat Anda. Dalam 30 detik, sistem menyusun rute harian lengkap, estimasi biaya, rekomendasi kuliner lokal, dan dapat langsung dipesan sebagai paket perjalanan.'
  },
  {
    id: 5,
    q: 'Apakah ada pendampingan tour guide selama perjalanan wisata?',
    a: 'Ya! Setiap paket wisata didampingi oleh pemandu lokal berlisensi resmi (berbahasa Indonesia/Inggris). Selain itu, tim Travel Concierge NOVA siap mendampingi Anda 24 jam via WhatsApp jika memerlukan bantuan apa pun.'
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
          setFaqs(data as FAQ[])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section ref={ref} id="help" className="bg-[#F8FAFC] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-slate-200/70">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Heading & Concierge Box (5 cols) */}
          <div ref={gsapRef as React.RefObject<HTMLDivElement>} className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>09 / Pusat Bantuan & FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-blue-950 tracking-tight leading-tight">
                <span>Pertanyaan yang </span>
                <span className="font-serif-luxury italic font-normal text-blue-600">Sering Diajukan</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Segala hal yang perlu Anda ketahui tentang pemesanan tiket, akomodasi, proteksi refund, dan concierge NOVA.
              </p>
            </div>

            {/* Live Concierge Contact Card */}
            <div className="p-6 bg-white rounded-3xl border border-blue-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-blue-950">
                    Butuh Bantuan Langsung?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tim concierge kami siap melayani 24/7 via WhatsApp.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo%20NOVA%20Travel,%20saya%20ingin%20tanya%20paket%20wisata"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
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
                    isOpen ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 pr-4">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '300px' : '0px' }}
                  >
                    <p className="px-5 sm:px-6 pb-6 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}

export default FAQSection
