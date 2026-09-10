'use client'

import { useState } from 'react'
import { formatIDR } from '@/lib/types'
import BookingProgress from '@/components/booking/BookingProgress'

interface Props {
  bookingId: number
  bookingCode: string
  totalAmount: number
  onBack: () => void
}

export default function BookingStepPayment({ bookingId, bookingCode, totalAmount, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          method: 'bank_transfer',
        }),
      })
      if (res.ok) {
        window.location.href = `/payment/confirmation/${bookingId}`
      } else {
        setError('Gagal memproses pembayaran. Silakan coba lagi.')
        setLoading(false)
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <BookingProgress currentStep={3} />

      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-600">
          <span className="text-2xl">⚡</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
          <span>Mode Simulasi 1-Klik Aktif</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Kode Booking</p>
          <p className="text-xl font-bold tracking-wider text-black">{bookingCode}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">Total Pembayaran</p>
          <p className="text-2xl font-bold text-black">{formatIDR(totalAmount)}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          {loading ? 'Memproses Simulasi…' : '⚡ Bayar Sekarang (Simulasi 1-Klik Selesai)'}
        </button>

        <button
          onClick={onBack}
          className="w-full border border-black/10 text-black font-medium py-3 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
        >
          Kembali ke Review
        </button>
      </div>
    </div>
  )
}
