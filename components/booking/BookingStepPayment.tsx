'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { formatIDR } from '@/lib/types'
import BookingProgress from '@/components/booking/BookingProgress'

declare global {
  interface Window {
    snap: { pay: (token: string, options: Record<string, unknown>) => void }
  }
}

interface Props {
  bookingId: number
  bookingCode: string
  totalAmount: number
  onBack: () => void
}

export default function BookingStepPayment({ bookingId, bookingCode, totalAmount, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockMode, setMockMode] = useState(false)
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const initiated = useRef(false)

  const initiatePayment = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat pembayaran')

      if (data.mock) {
        setMockMode(true)
      } else {
        setSnapToken(data.token)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // Initiate payment on mount
  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    initiatePayment()
    // initiatePayment is stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSnapPay = () => {
    if (!snapToken || !window.snap) return
    window.snap.pay(snapToken, {
      onSuccess: () => { window.location.href = `/payment/confirmation/${bookingId}` },
      onPending: () => { window.location.href = `/payment/pending/${bookingId}` },
      onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
      onClose: () => { window.location.href = `/payment/pending/${bookingId}` },
    })
  }

  const handleMockPay = async () => {
    setLoading(true)
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
      setError('Simulasi gagal')
    } finally {
      setLoading(false)
    }
  }

  const isSandbox = process.env.NEXT_PUBLIC_MIDTRANS_ENV !== 'production'

  return (
    <div className="space-y-6">
      {!mockMode && (
        <Script
          src={`https://app.${isSandbox ? 'sandbox.' : ''}midtrans.com/snap/snap.js`}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''}
        />
      )}

      <BookingProgress currentStep={4} />

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

        {mockMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
            MODE DEMO — pembayaran tidak diproses secara nyata
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
          <button onClick={initiatePayment} className="ml-2 underline">Coba lagi</button>
        </div>
      )}

      <div className="space-y-3">
        {mockMode ? (
          <button
            onClick={handleMockPay}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Memproses…' : 'Simulasi Pembayaran Berhasil (Demo)'}
          </button>
        ) : (
          <button
            onClick={handleSnapPay}
            disabled={loading || !snapToken}
            className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Memuat…' : 'Bayar Sekarang'}
          </button>
        )}

        <a
          href={`/payment/pending/${bookingId}`}
          className="block w-full text-center text-sm text-neutral-500 hover:text-black py-2 transition-colors"
        >
          Bayar nanti dari dashboard
        </a>

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
