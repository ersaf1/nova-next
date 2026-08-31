'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, ChevronRight, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import type { PackageDeparture } from '@/lib/types'
import { formatIDR, getDepartureStatusLabel, getDepartureStatusColor } from '@/lib/types'

type Props = {
  packageId: number
  departures: PackageDeparture[]
  basePrice: number
}

export default function PackageDetailClient({ packageId, departures, basePrice }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(
    departures.length > 0 ? (departures.find(d => d.status !== 'sold_out')?.id ?? null) : null
  )

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
          <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-dark" />
            <span>Pilih Jadwal Keberangkatan</span>
          </label>
          {departures.length > 0 && (
            <span className="text-[10px] text-neutral-400 font-bold">
              {departures.length} Jadwal Tersedia
            </span>
          )}
        </div>

        {departures.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4 text-center space-y-1">
            <p className="text-xs font-bold text-neutral-800">Jadwal Keberangkatan Fleksibel</p>
            <p className="text-[11px] text-neutral-400">
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
                      ? 'border-brand bg-brand/5 ring-1 ring-brand shadow-xs'
                      : 'border-neutral-200/90 hover:border-neutral-300 bg-white',
                    !isSelectable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-900 font-bold">
                      <span>{formatDate(dep.startDate)}</span>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                      <span>{formatDate(dep.endDate)}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                      <Users className="w-3 h-3 text-neutral-400" />
                      <span>
                        {dep.remainingSlots > 0
                          ? `Sisa ${dep.remainingSlots} slot kursi`
                          : 'Kuota Penuh'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-neutral-950">
                      {formatIDR(dep.price)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Total Box */}
      <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Total Harga Mulai</p>
          <p className="text-xl font-black text-neutral-950 tracking-tight">
            {formatIDR(selected ? selected.price : basePrice)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold block">
            Termasuk PPN & Biaya Layanan
          </span>
        </div>
      </div>

      {/* Primary Booking Button */}
      <Link
        href={bookingHref}
        className="w-full bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-brand/30 text-xs flex items-center justify-center gap-2 group text-center block"
      >
        <span>Lanjut ke Pemesanan</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Trust guarantees */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium text-center pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Garansi 100% Refund & Keamanan Enkripsi SSL</span>
      </div>

    </div>
  )
}
