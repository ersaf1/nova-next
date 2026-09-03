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
    <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Decorative Side Ticket Cutouts */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8FAFC] border-r border-slate-200" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8FAFC] border-l border-slate-200" />

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white bg-blue-600 px-3 py-1 rounded-full shadow-2xs">
            {discountLabel}
          </span>
        </div>

        {/* Voucher Code Box */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3">
            <span className="font-mono font-black text-blue-950 tracking-wider text-sm">
              {coupon.code}
            </span>
            <button
              onClick={handleCopy}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
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
        <div className="space-y-1.5 text-xs text-slate-500 pb-4">
          {coupon.min_amount > 0 && (
            <p className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-400">•</span>
              <span>Min. transaksi: {formatPrice(coupon.min_amount)}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Berlaku hingga: {expiresLabel}</span>
          </p>
        </div>
      </div>

      {/* Quota Progress Badge */}
      <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-bold">
        <span>Kupon Resmi NOVA</span>
        <span className="text-blue-600">{remaining} Kuota Tersisa</span>
      </div>
    </div>
  )
}
