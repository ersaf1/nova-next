'use client'

import { useState } from 'react'
import type { Traveler, PackageDeparture } from '@/lib/types'
import { formatIDR } from '@/lib/types'
import BookingProgress from '@/components/booking/BookingProgress'

interface ContactForm {
  contactName: string
  contactEmail: string
  contactPhone: string
  participants: number
}

interface PackageInfo {
  id: number
  title: string
  subtitle?: string
}

interface Props {
  pkg: PackageInfo
  departure: PackageDeparture
  contact: ContactForm
  travelers: Traveler[]
  onNext: () => void
  onBack: () => void
  submitting: boolean
}

export default function BookingStepReview({ pkg, departure, contact, travelers, onNext, onBack, submitting }: Props) {
  const [agreed, setAgreed] = useState(false)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const subtotal = departure.price * contact.participants
  const serviceFee = 250000
  const total = subtotal + serviceFee

  return (
    <div className="space-y-6">
      <BookingProgress currentStep={3} />

      {/* Package info */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Paket</p>
        <div>
          <p className="font-semibold text-black">{pkg.title}</p>
          {pkg.subtitle && <p className="text-sm text-neutral-500">{pkg.subtitle}</p>}
          <p className="text-sm text-neutral-600 mt-1">
            {formatDate(departure.startDate)} — {formatDate(departure.endDate)}
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Data Pemesan</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-neutral-500">Nama</span>
          <span className="font-medium">{contact.contactName}</span>
          <span className="text-neutral-500">Email</span>
          <span className="font-medium">{contact.contactEmail}</span>
          <span className="text-neutral-500">Telepon</span>
          <span className="font-medium">{contact.contactPhone}</span>
          <span className="text-neutral-500">Jumlah Peserta</span>
          <span className="font-medium">{contact.participants} orang</span>
        </div>
      </div>

      {/* Travelers */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Daftar Traveler</p>
        <div className="space-y-2">
          {travelers.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Traveler {i + 1}</span>
              <span className="font-medium">{t.fullName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-neutral-50 rounded-2xl border border-black/[0.04] p-5 space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Rincian Harga</p>
        <div className="flex justify-between text-neutral-700">
          <span>{formatIDR(departure.price)} × {contact.participants} orang</span>
          <span>{formatIDR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-400 text-xs">
          <span>Biaya layanan</span>
          <span>{formatIDR(serviceFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-black pt-2 border-t border-black/[0.06] text-base">
          <span>Total Pembayaran</span>
          <span>{formatIDR(total)}</span>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Kebijakan Pembatalan</p>
        <ul className="space-y-1 text-xs text-neutral-500">
          <li>• Pembatalan &gt; 30 hari: pengembalian dana penuh</li>
          <li>• Pembatalan 15–30 hari: pengembalian dana 50%</li>
          <li>• Pembatalan &lt; 15 hari: tidak ada pengembalian dana</li>
        </ul>
      </div>

      {/* T&C checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-black/20 accent-black"
        />
        <span className="text-sm text-neutral-600">
          Saya menyetujui{' '}
          <a href="/terms" className="underline text-black" target="_blank" rel="noopener">syarat dan ketentuan</a>
          {' '}serta{' '}
          <a href="/privacy" className="underline text-black" target="_blank" rel="noopener">kebijakan privasi</a>
          {' '}NOVA.
        </span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 border border-black/10 text-black font-semibold py-3.5 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition-colors text-sm"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!agreed || submitting}
          className="flex-1 bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {submitting ? 'Membuat booking…' : 'Lanjutkan ke Pembayaran'}
        </button>
      </div>
    </div>
  )
}
