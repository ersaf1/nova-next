'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'
import { formatIDR } from '@/lib/types'

const EticketDownloadButton = dynamic(() => import('@/components/EticketDownloadButton'), {
  ssr: false,
})

interface Booking {
  id: number
  packageName: string
  country: string
  name?: string
  contactName?: string
  email?: string
  contactEmail?: string
  phone?: string
  contactPhone?: string
  travelDate: string
  participants: number
  paymentStatus?: string
  bookingStatus?: string
  price?: number
  totalAmount?: number
  midtrans_order_id?: string
  created_at?: string
  bookingCode?: string
}

// Simple deterministic QR grid from booking id
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
          className={`w-3 h-3 rounded-[1px] ${filled ? 'bg-brand' : 'bg-white'}`}
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

    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data: Booking) => {
        setBooking(data ?? null)
        setLoading(false)
        setTimeout(() => setAnimateCheck(true), 100)
      })
      .catch(() => {
        setLoading(false)
        setTimeout(() => setAnimateCheck(true), 100)
      })
  }, [bookingId])

  const ticketNumber = booking?.bookingCode || `NOVA-${String(bookingId).padStart(8, '0')}`
  const passengerName = booking?.name || booking?.contactName || 'Wisatawan'
  const passengerEmail = booking?.email || booking?.contactEmail || '-'
  const passengerPhone = booking?.phone || booking?.contactPhone || '-'
  const totalAmount = booking?.totalAmount ?? (booking?.price ?? 0) * (booking?.participants ?? 1)

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
                ? 'bg-emerald-50 scale-100 opacity-100'
                : 'scale-50 opacity-0'
            }`}
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1
            className={`text-2xl font-semibold mb-2 transition-all duration-500 delay-200 ${
              animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Pemesanan Dikonfirmasi!
          </h1>
          <p
            className={`text-sm text-black/40 transition-all duration-500 delay-300 ${
              animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            E-ticket Anda telah siap. Selamat menikmati perjalanan, {passengerName}!
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
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300">
              CONFIRMED
            </div>
          </div>

          {/* Ticket Body */}
          <div className="px-6 py-5">
            {booking ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-black/30 mb-1">Paket Wisata</p>
                    <p className="text-sm font-semibold text-black">{booking.packageName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Destinasi</p>
                    <p className="text-sm font-semibold text-black">{booking.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Tanggal Keberangkatan</p>
                    <p className="text-sm font-semibold text-black">{booking.travelDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Jumlah Peserta</p>
                    <p className="text-sm font-semibold text-black">
                      {booking.participants} orang
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Nama Pemesan</p>
                    <p className="text-sm font-semibold text-black">{passengerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/30 mb-1">Email</p>
                    <p className="text-sm font-semibold text-black truncate">{passengerEmail}</p>
                  </div>
                </div>

                {totalAmount > 0 && (
                  <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                    <span className="text-xs text-black/30">Total Pembayaran</span>
                    <span className="text-base font-bold text-black">
                      {formatIDR(totalAmount)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-black/40 text-center py-4">
                Nomor referensi tiket: {ticketNumber}
              </p>
            )}
          </div>

          <TicketDivider />

          {/* QR Section */}
          <div className="px-6 py-6 flex flex-col items-center gap-3">
            <QRPlaceholder seed={ticketNumber} />
            <p className="text-xs text-black/30 font-mono">{ticketNumber}</p>
            <p className="text-xs text-black/20">Scan saat check-in keberangkatan</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {booking && (
            <div className="flex justify-center">
              <EticketDownloadButton
                booking={{
                  id: booking.id,
                  name: passengerName,
                  email: passengerEmail,
                  phone: passengerPhone,
                  packageName: booking.packageName,
                  country: booking.country,
                  travelDate: booking.travelDate,
                  participants: booking.participants,
                  totalAmount,
                  status: 'paid',
                  midtrans_order_id: booking.midtrans_order_id,
                  created_at: booking.created_at ?? new Date().toISOString(),
                }}
              />
            </div>
          )}
          <button
            onClick={() => window.print()}
            className="w-full bg-brand text-white rounded-full px-6 py-3 font-medium hover:bg-brand-dark transition-colors text-sm cursor-pointer"
          >
            Cetak E-Ticket
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const dest = encodeURIComponent(booking?.country ?? 'destinasi')
                const date = booking?.travelDate ? booking.travelDate.replace(/-/g, '') : ''
                const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Trip+ke+${dest}&dates=${date}/${date}`
                window.open(calUrl, '_blank')
              }}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10 cursor-pointer"
            >
              Simpan ke Kalender
            </button>
            <button
              onClick={() => {
                const dest = booking?.country ?? 'destinasi impian'
                const waUrl = `https://wa.me/?text=${encodeURIComponent(`Saya baru saja memesan liburan ke ${dest} di NOVA Travel! 🌍`)}`
                window.open(waUrl, '_blank')
              }}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10 cursor-pointer"
            >
              Bagikan
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10 cursor-pointer"
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-black/5 transition-colors text-sm border border-black/10 cursor-pointer"
            >
              Lihat Dashboard
            </button>
          </div>
        </div>

        <p className="text-xs text-black/20 text-center mt-6">
          Salinan E-Ticket telah dikirimkan ke {passengerEmail}.
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
