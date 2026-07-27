'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void
          onPending?: (result: unknown) => void
          onError?: (result: unknown) => void
          onClose?: () => void
        }
      ) => void
    }
  }
}

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
  const searchParams = useSearchParams()
  const bookingId = params.bookingId as string
  const isMock = searchParams.get('mock') === 'true'

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [snapLoaded, setSnapLoaded] = useState(false)

  // Load Snap.js script
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    const existing = document.getElementById('midtrans-snap')
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'midtrans-snap'
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', clientKey)
      script.onload = () => setSnapLoaded(true)
      script.onerror = () => setSnapLoaded(false)
      document.body.appendChild(script)
    } else {
      setSnapLoaded(true)
    }
    return () => {
      // leave script in DOM to avoid reloading
    }
  }, [])

  // Fetch booking details
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

  async function handlePayNow() {
    if (!booking) return
    setPaying(true)
    setError('')
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: totalAmount,
          customerName: booking.name,
          customerEmail: booking.email,
          items: [
            {
              id: `PKG-${booking.id}`,
              price: totalAmount,
              quantity: 1,
              name: booking.packageName,
            },
          ],
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? 'Failed to create payment')
        setPaying(false)
        return
      }

      // Mock token: go straight to confirmation
      if (data.token?.startsWith('mock-token-') || !snapLoaded || !window.snap) {
        router.push(`/payment/confirmation/${bookingId}?mock=true`)
        return
      }

      // Real Snap popup
      window.snap.pay(data.token, {
        onSuccess: () => router.push(`/payment/confirmation/${bookingId}`),
        onPending: () => router.push(`/payment/confirmation/${bookingId}?pending=true`),
        onError: () => {
          setError('Payment failed. Please try again.')
          setPaying(false)
        },
        onClose: () => setPaying(false),
      })
    } catch {
      setError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  function handleMockConfirm() {
    router.push(`/payment/confirmation/${bookingId}?mock=true`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <span className="text-sm text-black/40" style={{ letterSpacing: '-0.02em' }}>
          Loading…
        </span>
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
          <p className="text-xs font-medium text-black/30 uppercase tracking-widest mb-2">
            Step 4 of 4
          </p>
          <h1 className="text-2xl font-semibold text-black">Complete Payment</h1>
          <p className="text-sm text-black/40 mt-1">Review your booking and proceed to pay.</p>
        </div>

        {/* Booking Summary Card */}
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

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Payment Actions */}
        <div className="space-y-3">
          {isMock ? (
            <button
              onClick={handleMockConfirm}
              className="w-full bg-black text-white rounded-full px-6 py-3 font-medium hover:bg-black/80 transition-colors text-sm"
            >
              Confirm Payment (Demo)
            </button>
          ) : (
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="w-full bg-black text-white rounded-full px-6 py-3 font-medium hover:bg-black/80 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? 'Opening payment…' : 'Pay Now'}
            </button>
          )}
          <button
            onClick={() => router.push('/booking')}
            className="w-full bg-transparent text-black/40 rounded-full px-6 py-3 font-medium hover:text-black transition-colors text-sm border border-black/10"
          >
            Back to Booking
          </button>
        </div>

        <p className="text-xs text-black/30 text-center mt-6">
          Payments are secured by Midtrans. Your data is protected.
        </p>
      </main>
    </div>
  )
}
