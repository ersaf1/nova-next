'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, UserPlus, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AppCtaSection: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  const handleSubscribe = async () => {
    if (!email || !EMAIL_REGEX.test(email)) {
      setMessage('Format email tidak valid.')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setMessageType(null)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setMessage(data.message)
      setMessageType(data.success ? 'success' : 'error')
      if (data.success) setEmail('')
    } catch {
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#FAF9F6] px-4 sm:px-6 py-20 md:py-24 border-t border-stone-200/80">
      <div className="max-w-[88rem] mx-auto">
        <div className="bg-[#1C1917] rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#C29B38] bg-white/10 px-3.5 py-1 rounded-full border border-white/10 mb-4">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Keanggotaan Eksklusif NOVA</span>
                </div>
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6" style={{ letterSpacing: '-0.03em' }}>
                  <span>Kemudahan Perjalanan </span>
                  <span className="font-serif-luxury italic font-normal text-amber-200/95 block mt-1">
                    Dalam Satu Akun.
                  </span>
                </h2>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-lg font-normal">
                  Daftarkan diri Anda untuk kemudahan mengelola tiket, jadwal rute harian terpadu, invoice resmi, dan akses langsung pendampingan concierge perjalanan.
                </p>

                {/* Real Functional Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/register')}
                    className="flex items-center justify-center gap-2.5 bg-[#FAF9F6] text-stone-950 px-6 py-3.5 rounded-2xl hover:bg-white transition-all duration-200 text-xs font-bold shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    <UserPlus className="w-4 h-4 text-stone-900" />
                    <span>Daftar Akun Member</span>
                  </button>
                  <button
                    onClick={() => router.push('/ai-planner')}
                    className="flex items-center justify-center gap-2.5 bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-2xl hover:bg-white/15 transition-colors duration-200 text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    <Compass className="w-4 h-4 text-[#C29B38]" />
                    <span>Rancang Rute Liburan</span>
                  </button>
                </div>
              </div>

              {/* Newsletter subscription */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  Berlangganan kurasi destinasi &amp; info promo musiman
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    className="flex-1 bg-white/5 border border-white/15 text-white placeholder-stone-400 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-[#C29B38] transition-colors"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="bg-[#C29B38] hover:bg-[#A8822B] text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C29B38]"
                  >
                    {loading ? 'Mengirim...' : 'Langganan'}
                  </button>
                </div>
                {message && (
                  <p className={`mt-2 text-xs font-medium ${messageType === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Visual Panel — 80% Photo with Sleek Overlays */}
            <div className="lg:col-span-5 relative flex flex-col justify-center p-8 sm:p-12 border-t lg:border-t-0 lg:border-l border-stone-800 overflow-hidden min-h-[380px]">
              {/* Background Photography */}
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85"
                alt="Luxury Resort Sanctuary"
                className="absolute inset-0 w-full h-full object-cover img-smooth-zoom opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/95 via-[#141312]/60 to-[#141312]/40" />

              <div className="relative z-10 space-y-3.5">
                <span className="inline-flex text-[10px] font-bold text-amber-200 uppercase tracking-widest bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  Privilese Anggota
                </span>

                <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">Jaminan Slot &amp; Refund Jelas</h4>
                    <p className="text-stone-300 text-[11px]">Prioritas keberangkatan &amp; proteksi dana 100%.</p>
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#C29B38]/20 border border-[#C29B38]/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#C29B38]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">Dashboard E-Ticket Terpadu</h4>
                    <p className="text-stone-300 text-[11px]">Rute harian offline &amp; QR code resmi.</p>
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">Concierge WhatsApp 24 Jam</h4>
                    <p className="text-stone-300 text-[11px]">Dukungan darurat langsung di destinasi.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default AppCtaSection
