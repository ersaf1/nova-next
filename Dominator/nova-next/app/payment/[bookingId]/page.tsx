'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Booking {
  id: number
  packageName: string
  country: string
  name: string
  email: string
  travelDate: string
  participants: number
  status: string
  price?: number
  totalAmount?: number
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const found = data.find((b: Booking) => String(b.id) === String(bookingId))
          setBooking(found ?? null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookingId])

  const totalAmount = booking
    ? booking.totalAmount ?? (booking.price ?? 0) * (booking.participants ?? 1)
    : 0

  async function handleConfirmPayment() {
    if (!booking) return
    setPaying(true)
    try {
      // Update booking status to paid
      await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      router.push(`/payment/confirmation/${bookingId}`)
    } catch {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <span className="text-sm text-black/40" style={{ letterSpacing: '-0.02em' }}>Loading…</span>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-black/40 mb-4">Booking not found.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-black/80 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.02em' }}>
      <Navbar />
      <main className="px-6 py-16 pt-28 max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-medium text-black/30 uppercase tracking-widest mb-2">Step 4 of 4</p>
          <h1 className="text-2xl font-semibold text-black">Complete Payment</h1>
          <p className="text-sm text-black/40 mt-1">Review your booking and confirm payment.</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6 mb-4">
          <h2 className="text-sm font-semibold text-black mb-4">Booking Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Package</span>
              <span className="font-medium text-black">{booking.packageName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Destination</span>
              <span className="font-medium text-black">{booking.country}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Travel Date</span>
              <span className="font-medium text-black">{booking.travelDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Participants</span>
              <span className="font-medium text-black">{booking.participants} person(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Name</span>
              <span className="font-medium text-black">{booking.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Email</span>
              <span className="font-medium text-black">{booking.email}</span>
            </div>
            <div className="pt-3 border-t border-black/5 flex justify-between">
              <span className="text-sm font-semibold text-black">Total Amount</span>
              <span className="text-sm font-bold text-black">
                {totalAmount > 0 ? `$${totalAmount.toLocaleString()}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment method card */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6 mb-6">
          <h2 className="text-sm font-semibold text-black mb-4">Payment Method</h2>
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-black bg-black/[0.02]">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-black">Demo Payment</p>
              <p className="text-xs text-black/40">Click confirm to complete your booking instantly</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleConfirmPayment}
            disabled={paying}
            className="w-full bg-black text-white rounded-full px-6 py-3.5 font-medium hover:bg-black/80 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              'Confirm Payment'
            )}
          </button>
          <button
            onClick={() => router.push('/booking')}
            className="w-full text-black/40 rounded-full px-6 py-3 font-medium hover:text-black transition-colors text-sm border border-black/10"
          >
            Back to Booking
          </button>
        </div>

        <p className="text-xs text-black/20 text-center mt-6">
          This is a demo payment for academic purposes only.
        </p>
      </main>
    </div>
  )
}
