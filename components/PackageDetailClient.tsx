'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, ChevronRight, CheckCircle2, ArrowRight, ShieldCheck, Share2, Check, MessageCircle } from 'lucide-react'
import type { PackageDeparture } from '@/lib/types'
import { getDepartureStatusLabel, getDepartureStatusColor } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'

type Props = {
  packageId: number
  departures: PackageDeparture[]
  basePrice: number
}

export default function PackageDetailClient({ packageId, departures, basePrice }: Props) {
  const { formatPrice } = useCurrency()
  const [selectedId, setSelectedId] = useState<number | null>(
    departures.length > 0 ? (departures.find(d => d.status !== 'sold_out')?.id ?? null) : null
  )
  const [copied, setCopied] = useState(false)

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const text = encodeURIComponent(`Halo! Cek paket wisata eksklusif ini di NOVA: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {}
  }

  const selected = departures.find(d => d.id === selectedId) ?? null
  const bookingHref = selected
    ? `/booking?packageId=${packageId}&departureId=${selected.id}`
    : `/booking?packageId=${packageId}`

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-5">
      
      {/* Departure Schedules */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>Pilih Jadwal Keberangkatan</span>
          </label>
          {departures.length > 0 && (
            <span className="text-[10px] text-stone-400 font-bold">
              {departures.length} Jadwal Tersedia
            </span>
          )}
        </div>

        {departures.length === 0 ? (
          <div className="rounded-2xl border border-stone-200/80 bg-[#F5F2EB]/50 p-4 text-center space-y-1">
            <p className="text-xs font-bold text-stone-800">Jadwal Keberangkatan Fleksibel</p>
            <p className="text-[11px] text-stone-400">
              Pilih tanggal bebas saat melanjutkan ke formulir booking.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {departures.map(dep => {
              const isSelectable = dep.status !== 'sold_out' && dep.status !== 'cancelled'
              const isSelected = selectedId === dep.id
              const statusColor = getDepartureStatusColor(dep.status)
              const statusLabel = getDepartureStatusLabel(dep.status)

              return (
                <button
                  key={dep.id}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => isSelectable && setSelectedId(dep.id)}
                  className={[
                    'w-full text-left rounded-2xl border p-3.5 transition-all duration-200',
                    isSelected
                      ? 'border-[#C29B38] bg-[#FAF9F6] ring-1 ring-[#C29B38]/40 shadow-xs'
                      : 'border-stone-200/90 hover:border-stone-300 bg-white',
                    !isSelectable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-stone-900 font-bold">
                      <span>{formatDate(dep.startDate)}</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                      <span>{formatDate(dep.endDate)}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                      <Users className="w-3 h-3 text-stone-400" />
                      <span>
                        {dep.remainingSlots > 0
                          ? `Sisa ${dep.remainingSlots} slot kursi`
                          : 'Kuota Penuh'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-stone-900">
                      {formatPrice(dep.price)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Total Box */}
      <div className="rounded-2xl bg-[#F5F2EB]/70 border border-stone-200/80 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Harga Mulai</p>
          <p className="text-xl font-black text-stone-900 tracking-tight">
            {formatPrice(selected ? selected.price : basePrice)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-bold block">
            Termasuk PPN & Biaya Layanan
          </span>
        </div>
      </div>

      {/* Primary Booking Button */}
      <Link
        href={bookingHref}
        className="w-full bg-stone-900 hover:bg-black active:scale-[0.98] text-[#FAF9F6] font-bold py-4 rounded-2xl transition-all shadow-md shadow-stone-900/10 text-xs flex items-center justify-center gap-2 group text-center block cursor-pointer"
      >
        <span>Lanjut ke Pemesanan</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Trust guarantees */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium text-center pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C29B38] shrink-0" />
        <span>Garansi 100% Refund & Keamanan Enkripsi SSL</span>
      </div>

      {/* Share Actions (WhatsApp & Copy Link) */}
      <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="flex-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/80 rounded-xl py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bagikan ke WA</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/80 rounded-xl py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
          <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
        </button>
      </div>

    </div>
  )
}
