'use client'

import { useState } from 'react'
import { Copy, Check, Clock, Tag, Compass } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

type Coupon = {
  id: number
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_amount: number
  max_uses: number
  used_count: number
  expires_at: string | null
  is_active: boolean
}

export default function PromoCard({ coupon }: { coupon: Coupon }) {
  const { formatPrice } = useCurrency()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const discountLabel = coupon.discount_type === 'percent'
    ? `DISKON ${coupon.discount_value}%`
    : `DISKON ${formatPrice(coupon.discount_value)}`

  const remaining = Math.max(0, (coupon.max_uses || 100) - (coupon.used_count || 0))
  const expiresLabel = coupon.expires_at
    ? new Date(coupon.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Berlaku Selamanya'

  return (
    <div className="bg-white border border-stone-200/90 hover:border-stone-300 rounded-3xl p-6 transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Decorative Side Ticket Cutouts */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF9F6] border-r border-stone-200" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF9F6] border-l border-stone-200" />

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#C29B38] border border-amber-200/60 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white bg-stone-900 px-3.5 py-1 rounded-full shadow-xs">
            {discountLabel}
          </span>
        </div>

        {/* Voucher Code Box */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 bg-[#FAF9F6] border border-stone-200 rounded-2xl px-4 py-3">
            <span className="font-mono font-bold text-stone-900 tracking-wider text-sm">
              {coupon.code}
            </span>
            <button
              onClick={handleCopy}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-900 hover:bg-black text-white'
              }`}
              title="Salin kode kupon"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Details & Rules */}
        <div className="space-y-1.5 text-xs text-stone-500 pb-4">
          {coupon.min_amount > 0 && (
            <p className="flex items-center gap-1.5 font-medium">
              <span className="text-stone-400">•</span>
              <span>Min. transaksi: {formatPrice(coupon.min_amount)}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Berlaku hingga: {expiresLabel}</span>
          </p>
        </div>
      </div>

      {/* Quota Progress Badge */}
      <div className="pt-3 border-t border-dashed border-stone-200 flex items-center justify-between text-[11px] text-stone-400 font-bold">
        <span>Kupon Resmi NOVA</span>
        <span className="text-[#C29B38] font-bold">{remaining} Kuota Tersisa</span>
      </div>
    </div>
  )
}
