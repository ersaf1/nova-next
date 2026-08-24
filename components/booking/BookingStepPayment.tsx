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
      await fetch('/api/payment/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: `NOVA-${bookingId}-mock`,
          status_code: '200',
          gross_amount: String(totalAmount),
          signature_key: 'mock',
          transaction_status: 'settlement',
          fraud_status: 'accept',
          payment_type: 'mock',
          transaction_id: `mock-${Date.now()}`,
          transaction_time: new Date().toISOString(),
        }),
      })
      window.location.href = `/payment/confirmation/${bookingId}`
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <BookingProgress currentStep={3} />

      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto">
          <span className="text-2xl">💳</span>
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
          className="w-full bg-black hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-50"
        >
          {loading ? 'Memproses…' : 'Bayar Sekarang'}
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
