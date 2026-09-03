'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Apple, Play, Compass } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AppCtaSection: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [stats, setStats] = useState({ stars: '4.9★', reviews: '150K', downloads: '2M+' })

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((data: { statKey: string; value: string }[]) => {
        if (!Array.isArray(data)) return
        const get = (key: string) => data.find(s => s.statKey === key)?.value
        setStats({
          stars: get('app_store_stars') ?? '4.9★',
          reviews: get('app_reviews') ?? '150K',
          downloads: get('app_downloads') ?? '2M+',
        })
      })
      .catch(() => {})
  }, [])

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
    <section className="bg-[#F8FAFC] px-4 sm:px-6 py-24 border-t border-slate-200/70">
      <div className="max-w-[88rem] mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-sky-700 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-400/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Left Content */}
            <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-sky-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 mb-4">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Aplikasi Mobile NOVA</span>
                </div>
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6" style={{ letterSpacing: '-0.035em' }}>
                  <span>Dunia Ada Dalam </span>
                  <span className="font-serif-luxury italic font-normal text-sky-200 block mt-1">
                    Genggaman Anda.
                  </span>
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
                  Kelola tiket, jadwal rute harian offline, e-invoice resmi, dan akses live chat concierge 24 jam langsung dari ponsel Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-3 bg-white text-blue-950 px-5 py-3 rounded-2xl hover:bg-blue-50 transition-colors duration-200 font-extrabold shadow-sm"
                  >
                    <Apple className="w-5 h-5 shrink-0" />
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 block leading-none mb-0.5">Download di</span>
                      <span className="text-xs font-bold leading-none">App Store</span>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-3 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-2xl hover:bg-white/20 transition-colors duration-200 font-extrabold"
                  >
                    <Play className="w-4 h-4 shrink-0 fill-white" />
                    <div className="text-left">
                      <span className="text-[10px] text-white/50 block leading-none mb-0.5">Tersedia di</span>
                      <span className="text-xs font-bold leading-none">Google Play</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Newsletter early access */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
                  Dapatkan info promo spesial & kupon rahasia
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm shadow-blue-600/30"
                  >
                    {loading ? 'Mengirim...' : 'Langganan'}
                  </button>
                </div>
                {message && (
                  <p className={`mt-2 text-xs ${messageType === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Visual in Mediterranean Sky-Blue Gradient */}
            <div className="relative hidden md:flex flex-col justify-end p-12 bg-gradient-to-br from-blue-700 via-sky-600 to-sky-500 min-h-[440px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.4),transparent_65%)]" />
              <div className="relative z-10 flex flex-col gap-3 items-end">
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-6 py-4 text-right shadow-lg">
                  <span className="text-white text-3xl font-black block tracking-tight">4.95★</span>
                  <span className="text-white/75 text-xs font-medium">150K+ Ulasan Bintang 5</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-6 py-4 text-right shadow-lg">
                  <span className="text-white text-3xl font-black block tracking-tight">50,000+</span>
                  <span className="text-white/75 text-xs font-medium">Traveler Puas</span>
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
