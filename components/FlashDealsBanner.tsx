'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tag, Clock, Copy, Check, ArrowRight, Flame } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

interface Coupon {
  id?: number
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_amount?: number
  expires_at?: string | null
  title?: string
  description?: string
}

const DEFAULT_DEALS: Coupon[] = [
  {
    code: 'NOVAHOLIDAY',
    discount_type: 'percent',
    discount_value: 15,
    min_amount: 5000000,
    title: 'Diskon Spesial Musim Liburan',
    description: 'Hemat 15% s/d Rp 2 Juta untuk semua paket wisata internasional & domestik.',
  },
  {
    code: 'PHINISIPROMO',
    discount_type: 'fixed',
    discount_value: 1000000,
    min_amount: 8000000,
    title: 'Potongan Labuan Bajo & Bali',
    description: 'Cashback langsung Rp 1.000.000 untuk paket Phinisi & Beachfront Villa.',
  },
  {
    code: 'FIRSTTRIP',
    discount_type: 'fixed',
    discount_value: 500000,
    min_amount: 3000000,
    title: 'Bonus Pengguna Baru',
    description: 'Diskon instan Rp 500.000 tanpa syarat rumit untuk booking pertama Anda.',
  },
]

export default function FlashDealsBanner() {
  const { formatPrice } = useCurrency()
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_DEALS)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 })

  useEffect(() => {
    fetch('/api/coupons')
      .then(r => r.json())
      .then((data: Coupon[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCoupons(data.slice(0, 3))
        }
      })
      .catch(() => {})
  }, [])

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <section className="bg-[#FAF9F6] py-12 px-4 sm:px-6 md:px-8 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto space-y-6">
        
        {/* Section Top Header & Countdown Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Flame className="w-5 h-5 fill-[#C29B38] text-[#C29B38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white px-2.5 py-0.5 rounded-full">
                  PROMO SPESIAL
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1C1917] tracking-tight">
                  Kupon Promo Terbatas
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Klaim kode kupon berikut untuk diskon instan saat checkout!
              </p>
            </div>
          </div>

          {/* Live Countdown Badge */}
          <div className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-2xl shrink-0 border border-stone-800 shadow-xs">
            <Clock className="w-4 h-4 text-[#C29B38]" />
            <span className="text-xs text-stone-300 font-medium">Berakhir dalam:</span>
            <span className="font-mono font-bold text-xs text-[#C29B38]">
              {String(timeLeft.hours).padStart(2, '0')}j : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}d
            </span>
          </div>
        </div>

        {/* Promo Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon, idx) => {
            const isCopied = copiedCode === coupon.code
            const discountText =
              coupon.discount_type === 'percent'
                ? `DISKON ${coupon.discount_value}%`
                : `DISKON ${formatPrice(coupon.discount_value)}`
            
            const cardAccents = [
              { badge: 'bg-stone-900', border: 'border-stone-200', hover: 'hover:border-stone-300' },
              { badge: 'bg-[#B45309]', border: 'border-stone-200', hover: 'hover:border-stone-300' },
              { badge: 'bg-stone-900', border: 'border-stone-200', hover: 'hover:border-stone-300' },
            ]
            const accent = cardAccents[idx % cardAccents.length]

            return (
              <div
                key={coupon.code || idx}
                className={`bg-white border ${accent.border} ${accent.hover} rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden`}
              >
                {/* Decorative notches */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FAF9F6] border-r border-stone-200/80" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FAF9F6] border-l border-stone-200/80" />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${accent.badge} text-white px-3 py-1 rounded-full`}>
                      {discountText}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                      Semua Paket
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#1C1917] leading-tight">
                      {coupon.title || 'Penawaran Spesial Liburan'}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                      {coupon.description || 'Gunakan kode promo saat pemesanan paket wisata impian Anda.'}
                    </p>
                  </div>
                </div>

                {/* Coupon Code & Copy Button */}
                <div className="mt-4 pt-3 border-t border-dashed border-stone-200 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs font-bold text-[#1C1917] bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
                    {coupon.code}
                  </div>

                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : `${accent.badge} hover:opacity-90 text-white`
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Promo Link */}
        <div className="text-center pt-1">
          <Link
            href="/promo"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-[#C29B38] transition-colors group"
          >
            <span>Lihat Semua Voucher & Syarat Ketentuan Promo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  )
}
