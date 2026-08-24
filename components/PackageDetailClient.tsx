'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, ChevronRight } from 'lucide-react'
import type { PackageDeparture } from '@/lib/types'
import { formatIDR, getDepartureStatusLabel, getDepartureStatusColor } from '@/lib/types'

type Props = {
  packageId: number
  departures: PackageDeparture[]
  basePrice: number
}

export default function PackageDetailClient({ packageId, departures, basePrice }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = departures.find(d => d.id === selectedId) ?? null
  const bookingHref = selected
    ? `/booking?packageId=${packageId}&departureId=${selected.id}`
    : '#'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Departure selector */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          Pilih Jadwal Keberangkatan
        </h3>

        {departures.length === 0 ? (
          <div className="rounded-xl border border-black/[0.06] bg-neutral-50 px-4 py-6 text-center">
            <p className="text-sm text-neutral-400">Tidak ada jadwal tersedia saat ini.</p>
          </div>
        ) : (
          <div className="space-y-2">
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
                    'w-full text-left rounded-xl border px-4 py-3 transition-all duration-150',
                    isSelected
                      ? 'border-brand bg-brand/[0.04] ring-1 ring-brand'
                      : 'border-black/[0.08] hover:border-black/20',
                    !isSelectable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                      <span className="font-medium">{formatDate(dep.startDate)}</span>
                      <ChevronRight className="w-3 h-3 text-neutral-300" />
                      <span>{formatDate(dep.endDate)}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Users className="w-3 h-3" />
                      <span>
                        {dep.remainingSlots > 0
                          ? `${dep.remainingSlots} slot tersisa`
                          : 'Penuh'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-black">
                      {formatIDR(dep.price)}
                      <span className="text-xs font-normal text-neutral-400"> / orang</span>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Price display */}
      <div className="rounded-xl bg-neutral-50 border border-black/[0.04] px-4 py-3">
        <p className="text-xs text-neutral-400 mb-0.5">Harga mulai dari</p>
        <p className="text-2xl font-bold tracking-tight text-black">
          {formatIDR(selected ? selected.price : basePrice)}
        </p>
        <p className="text-xs text-neutral-400">per orang</p>
      </div>

      {/* Booking button */}
      {selected ? (
        <Link
          href={bookingHref}
          className="block w-full text-center bg-brand hover:bg-brand-dark active:bg-brand-darker text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm"
        >
          Booking Sekarang
        </Link>
      ) : (
        <button
          disabled
          className="block w-full text-center bg-black/20 text-white/60 font-semibold py-3.5 rounded-xl text-sm cursor-not-allowed"
        >
          Pilih jadwal untuk melanjutkan
        </button>
      )}

      <p className="text-[11px] text-neutral-400 text-center">
        Tanpa biaya tambahan sampai konfirmasi
      </p>
    </div>
  )
}
