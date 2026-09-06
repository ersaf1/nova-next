'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Mail } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface FAQ {
  id: number
  q: string
  a: string
}

const STATIC_FAQS: FAQ[] = [
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

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(STATIC_FAQS)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) setFaqs(data as FAQ[])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="pt-12 pb-10 text-center">
            <p className="text-[11px] font-bold text-[#C29B38] uppercase tracking-[0.25em] mb-4">
              Help Center & Inquiries
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 leading-[1.08] mb-4 tracking-tight">
              Frequently Asked{' '}
              <span className="font-serif-luxury italic font-normal text-[#C29B38]">
                Questions
              </span>
            </h1>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-md mx-auto font-normal">
              Everything you need to know about booking with NOVA. Can't find an answer? Our concierge team is here 24/7.
            </p>
          </div>

          {/* FAQs */}
          <div className="space-y-3 mb-12">
            {faqs.map((faq, i) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                >
                  <span className="text-stone-900 font-semibold text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-stone-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-[#C29B38]' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-3">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Support CTA */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center mx-auto mb-4 text-[#C29B38]">
              <Mail size={20} />
            </div>
            <h3 className="text-stone-900 text-xl font-normal font-serif-luxury mb-2">Still have questions?</h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-6 max-w-md mx-auto">Can't find the answer you're looking for? Reach out to our dedicated concierge specialists.</p>
            <a
              href="mailto:support@nova.travel"
              className="inline-flex items-center gap-2 bg-stone-900 text-[#FAF9F6] text-xs font-bold px-7 py-3.5 rounded-full hover:bg-black transition-colors shadow-sm"
            >
              Contact Support
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
