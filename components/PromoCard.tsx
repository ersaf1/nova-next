'use client'

import { useState } from 'react'
import { Copy, Check, Clock, Tag } from 'lucide-react'

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
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const discountLabel = coupon.discount_type === 'percent'
    ? `${coupon.discount_value}% OFF`
    : `Rp ${coupon.discount_value.toLocaleString('id-ID')} OFF`

  const remaining = coupon.max_uses - coupon.used_count
  const expiresLabel = coupon.expires_at
    ? new Date(coupon.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-6 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
          <Tag className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full">
          {discountLabel}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-3 mb-3">
          <span className="flex-1 font-mono font-bold text-white tracking-widest text-sm">{coupon.code}</span>
          <button
            onClick={handleCopy}
            className="text-white/40 hover:text-white transition-colors shrink-0"
            title="Salin kode"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-400 text-center">Kode disalin!</p>}
      </div>

      <div className="space-y-2 text-xs text-white/40">
        {coupon.min_amount > 0 && (
          <p>Min. pembelian Rp {coupon.min_amount.toLocaleString('id-ID')}</p>
        )}
        {expiresLabel && (
          <p className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Berlaku hingga {expiresLabel}
          </p>
        )}
        <p>{remaining} penggunaan tersisa</p>
      </div>
    </div>
  )
}
