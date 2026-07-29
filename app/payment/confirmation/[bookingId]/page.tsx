'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

const EticketDownloadButton = dynamic(() => import('@/components/EticketDownloadButton'), {
  ssr: false,
})

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
  phone?: string
  midtrans_order_id?: string
  created_at?: string
}

// Simple deterministic QR-like grid from booking id
function QRPlaceholder({ seed }: { seed: string }) {
  const size = 10
  const cells: boolean[] = []
  for (let i = 0; i < size * size; i++) {
    const code = seed.charCodeAt(i % seed.length) + i
    cells.push(code % 3 !== 0)
  }
  return (
    <div
      className="inline-grid gap-[2px] p-3 bg-white border border-black/10 rounded-xl"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((filled, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-[1px] ${filled ? 'bg-black' : 'bg-white'}`}
        />
      ))}
    </div>
  )
}

function TicketDivider() {
  return (
    <div className="relative my-0 flex items-center">
      <div className="absolute -left-6 w-6 h-6 rounded-full bg-[#F5F5F5]" />
      <div className="flex-1 border-t-2 border-dashed border-black/10 mx-1" />
      <div className="absolute -right-6 w-6 h-6 rounded-full bg-[#F5F5F5]" />
    </div>
  )
}

export default function ConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [animateCheck, setAnimateCheck] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    // Fetch single booking directly to avoid leaking all bookings to the client
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        setBooking((data as Booking) ?? null)
        setLoading(false)
        // Trigger animation after mount
        setTimeout(() => setAnimateCheck(true), 100)
      })
      .catch(() => {
        setLoading(false)
        setTimeout(() => setAnimateCheck(true), 100)
      })
  }, [bookingId])

  // Derive pending status from actual booking data, not URL param
  const isPending = booking?.status !== 'paid'

  const ticketNumber = `NOVA-${String(bookingId).padStart(8, '0')}`
  const totalAmount = booking
    ? booking.totalAmount ?? (booking.price ?? 0) * (booking.participants ?? 1)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.02em' }}>
        <Navbar />
        <main className="px-6 py-16 pt-28 max-w-2xl mx-auto">
          {/* Header skeleton */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-block w-20 h-20 rounded-full bg-black/10 animate-pulse" />
            <div className="h-6 bg-black/10 rounded-full w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-black/10 rounded-full w-72 mx-auto animate-pulse" />
          </div>
          {/* Ticket card skeleton */}
          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm animate-pulse">
            <div className="bg-black/10 h-20 px-6 py-5" />
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 bg-black/10 rounded-full w-16" />
                    <div className="h-4 bg-black/10 rounded-full w-28" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                <div className="h-3 bg-black/10 rounded-full w-16" />
                <div className="h-5 bg-black/10 rounded-full w-24" />
              </div>
            </div>
            <div className="border-t-2 border-dashed border-black/10 mx-6" />
            <div className="px-6 py-6 flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-black/10 rounded-xl" />
              <div className="h-3 bg-black/10 rounded-full w-36" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.02em' }}>
      <Navbar />
      <main className="px-6 py-16 pt-28 max-w-2xl mx-auto">
        {/* Status Header */}
        <div className="text-center mb-10">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 transition-all duration-700 ${
              animateCheck
                ? isPending
                  ? 'bg-amber-50 scale-100 opacity-100'
                  : 'bg-emerald-50 scale-100 opacity-100'
                : 'scale-50 opacity-0'
            }`}
          >
            {isPending ? (
              <Clock className="w-10 h-10 text-amber-500" />
            ) : (
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            )}
          </div>
          <h1
            className={`text-2xl font-semibold mb-2 transition-all duration-500 delay-200 ${
              animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {isPending ? 'Payment Pending' : 'Booking Confirmed!'}
          </h1>
          <p
            className={`text-sm text-black/40 transition-all duration-500 delay-300 ${
              animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {isPending
              ? "Your payment is being processed. We'll notify you by email."
              : `Your e-ticket is ready. Safe travels, ${booking?.name ?? 'traveler'}!`}
          </p>
        </div>

        {/* E-Ticket Card */}
        <div
          className={`bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm transition-all duration-500 delay-400 ${
            animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Ticket Header */}
          <div className="bg-black px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">
                E-Ticket
              </p>
              <p className="text-white font-mono text-lg font-semibold tracking-wider">
                {ticketNumber}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                isPending
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-emerald-400/20 text-emerald-300'
              }`}
            >
              {isPending ? 'PENDING' : 'CONFIRMED'}
            </div>
          </div>

          {/* Ticket Body */}
          <div className="px-6 py-5">
            {booking ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-black/30 mb-1">Package</p>
                    <p className="text-sm font-semibold text-black">{booking.packageName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Destination</p>
                    <p className="text-sm font-semibold text-black">{booking.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Travel Date</p>
                    <p className="text-sm font-semibold text-black">{booking.travelDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Participants</p>
                    <p className="text-sm font-semibold text-black">
                      {booking.participants} person(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Passenger</p>
                    <p className="text-sm font-semibold text-black">{booking.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Email</p>
                    <p className="text-sm font-semibold text-black truncate">{booking.email}</p>
                  </div>
                </div>

                {totalAmount > 0 && (
                  <>
                    <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                      <span className="text-xs text-black/30">Total Paid</span>
                      <span className="text-base font-bold text-black">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-black/40 text-center py-4">
                Booking reference: {ticketNumber}
              </p>
            )}
          </div>

          <TicketDivider />

          {/* QR Section */}
          <div className="px-6 py-6 flex flex-col items-center gap-3">
            <QRPlaceholder seed={ticketNumber} />
            <p className="text-xs text-black/30 font-mono">{ticketNumber}</p>
            <p className="text-xs text-black/20">Scan at check-in</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {booking && !isPending && (
            <div className="flex justify-center">
              <EticketDownloadButton
                booking={{
                  id: booking.id,
                  name: booking.name,
                  email: booking.email,
                  phone: booking.phone,
                  packageName: booking.packageName,
                  country: booking.country,
                  travelDate: booking.travelDate,
                  participants: booking.participants,
                  totalAmount,
                  status: booking.status,
                  midtrans_order_id: booking.midtrans_order_id,
                  created_at: booking.created_at ?? new Date().toISOString(),
                }}
              />
            </div>
          )}
          <button
            onClick={() => window.print()}
            className="w-full bg-black text-white rounded-full px-6 py-3 font-medium hover:bg-black/80 transition-colors text-sm"
          >
            Print E-Ticket
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const destination = encodeURIComponent(booking?.country ?? 'your destination')
                const date = booking?.travelDate ? booking.travelDate.replace(/-/g, '') : ''
                const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Trip+to+${destination}&dates=${date}/${date}`
                window.open(calUrl, '_blank')
              }}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10"
            >
              Add to Calendar
            </button>
            <button
              onClick={() => {
                const destination = booking?.country ?? 'my destination'
                const waUrl = `https://wa.me/?text=${encodeURIComponent(`I just booked a trip to ${destination} with NOVA! 🌍`)}`
                window.open(waUrl, '_blank')
              }}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10"
            >
              Share
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10"
            >
              Back to Home
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10"
            >
              View Dashboard
            </button>
          </div>
        </div>

        <p className="text-xs text-black/20 text-center mt-6">
          A copy of your e-ticket has been sent to {booking?.email ?? 'your email'}.
        </p>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bg-white.rounded-2xl, .bg-white.rounded-2xl * { visibility: visible; }
          .bg-white.rounded-2xl { position: absolute; left: 0; top: 0; width: 100%; }
          nav, button { display: none !important; }
        }
      `}</style>
    </div>
  )
}
