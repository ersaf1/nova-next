'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
  passengers?: Array<{ title: string; name: string; idType?: string; idNumber?: string }>
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
      className="inline-grid gap-[2px] p-3 bg-white border border-stone-200 rounded-xl"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((filled, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-[1px] ${filled ? 'bg-stone-900' : 'bg-white'}`}
        />
      ))}
    </div>
  )
}

function TicketDivider() {
  return (
    <div className="relative my-0 flex items-center">
      <div className="absolute -left-6 w-6 h-6 rounded-full bg-[#FAF9F6] border-r border-stone-200" />
      <div className="flex-1 border-t-2 border-dashed border-stone-200 mx-1" />
      <div className="absolute -right-6 w-6 h-6 rounded-full bg-[#FAF9F6] border-l border-stone-200" />
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
      <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
        <Navbar />
        <main className="px-6 py-16 pt-28 max-w-2xl mx-auto">
          {/* Header skeleton */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-block w-20 h-20 rounded-full bg-stone-200/60 animate-pulse" />
            <div className="h-6 bg-stone-200/60 rounded-full w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-stone-200/60 rounded-full w-72 mx-auto animate-pulse" />
          </div>
          {/* Ticket card skeleton */}
          <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs animate-pulse">
            <div className="bg-stone-900 h-20 px-6 py-5" />
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 bg-stone-200/60 rounded-full w-16" />
                    <div className="h-4 bg-stone-200/60 rounded-full w-28" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                <div className="h-3 bg-stone-200/60 rounded-full w-16" />
                <div className="h-5 bg-stone-200/60 rounded-full w-24" />
              </div>
            </div>
            <div className="border-t-2 border-dashed border-stone-200 mx-6" />
            <div className="px-6 py-6 flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-stone-200/60 rounded-xl" />
              <div className="h-3 bg-stone-200/60 rounded-full w-36" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />
      <main className="px-6 py-16 pt-28 max-w-2xl mx-auto">
        {/* Status Header */}
        <div className="text-center mb-10">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 transition-all duration-700 ${
              animateCheck
                ? 'bg-emerald-50 scale-100 opacity-100 border border-emerald-100'
                : 'scale-50 opacity-0'
            }`}
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-2 transition-all duration-500 delay-200 ${
              animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Pemesanan <span className="font-serif-luxury italic font-normal text-stone-800">Dikonfirmasi!</span>
          </h1>
          <p
            className={`text-sm text-stone-500 transition-all duration-500 delay-300 ${
              animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            E-ticket Anda telah siap. Selamat menikmati perjalanan, {passengerName}!
          </p>
        </div>

        {/* E-Ticket Card */}
        <div
          className={`bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs transition-all duration-500 delay-400 ${
            animateCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Ticket Header */}
          <div className="bg-stone-900 px-6 py-5 flex items-center justify-between text-white">
            <div>
              <p className="text-stone-400 text-xs font-medium uppercase tracking-widest mb-1">
                E-Ticket Resmi NOVA
              </p>
              <p className="text-white font-mono text-lg font-bold tracking-wider">
                {ticketNumber}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              CONFIRMED
            </div>
          </div>

          {/* Ticket Body */}
          <div className="px-6 py-5">
            {booking ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Paket Wisata</p>
                    <p className="text-sm font-bold text-stone-900">{booking.packageName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Destinasi</p>
                    <p className="text-sm font-bold text-stone-900">{booking.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Tanggal Keberangkatan</p>
                    <p className="text-sm font-bold text-stone-900">{booking.travelDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Jumlah Peserta</p>
                    <p className="text-sm font-bold text-stone-900">
                      {booking.participants} orang
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Nama Pemesan</p>
                    <p className="text-sm font-bold text-stone-900">{passengerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Email</p>
                    <p className="text-sm font-bold text-stone-900 truncate">{passengerEmail}</p>
                  </div>
                </div>

                {/* Passenger Roster */}
                {booking.passengers && booking.passengers.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Daftar Penumpang / Tamu ({booking.passengers.length} Orang)
                    </p>
                    <div className="space-y-1.5">
                      {booking.passengers.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-[#F5F2EB]/50 px-3.5 py-2 rounded-xl border border-stone-200/60">
                          <span className="font-semibold text-stone-900">
                            {p.title} {p.name}
                          </span>
                          {p.idNumber && (
                            <span className="text-[11px] text-stone-500 font-mono">
                              {p.idType || 'ID'}: {p.idNumber}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalAmount > 0 && (
                  <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                    <span className="text-xs text-stone-400">Total Pembayaran</span>
                    <span className="text-lg font-bold text-stone-950 font-serif-luxury">
                      {formatIDR(totalAmount)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-400 text-center py-4">
                Nomor referensi tiket: {ticketNumber}
              </p>
            )}
          </div>

          <TicketDivider />

          {/* QR Section */}
          <div className="px-6 py-6 flex flex-col items-center gap-3 bg-stone-50/40">
            <QRPlaceholder seed={ticketNumber} />
            <p className="text-xs text-stone-500 font-mono font-bold">{ticketNumber}</p>
            <p className="text-[11px] text-stone-400">Scan saat check-in keberangkatan</p>
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
                  passengers: booking.passengers,
                }}
              />
            </div>
          )}
          <button
            onClick={() => window.print()}
            className="w-full bg-stone-900 hover:bg-black text-white rounded-full px-6 py-3.5 font-bold transition-all text-xs cursor-pointer shadow-xs"
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
              className="bg-white hover:bg-stone-50 text-stone-800 rounded-full px-6 py-3 font-semibold transition-all text-xs border border-stone-200/80 cursor-pointer shadow-xs"
            >
              Simpan ke Kalender
            </button>
            <button
              onClick={() => {
                const dest = booking?.country ?? 'destinasi impian'
                const waUrl = `https://wa.me/?text=${encodeURIComponent(`Saya baru saja memesan liburan ke ${dest} di NOVA Travel! 🌍`)}`
                window.open(waUrl, '_blank')
              }}
              className="bg-white hover:bg-stone-50 text-stone-800 rounded-full px-6 py-3 font-semibold transition-all text-xs border border-stone-200/80 cursor-pointer shadow-xs"
            >
              Bagikan
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-white hover:bg-stone-50 text-stone-800 rounded-full px-6 py-3 font-semibold transition-all text-xs border border-stone-200/80 cursor-pointer shadow-xs"
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white hover:bg-stone-50 text-stone-800 rounded-full px-6 py-3 font-semibold transition-all text-xs border border-stone-200/80 cursor-pointer shadow-xs"
            >
              Lihat Dashboard
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center mt-6">
          Salinan E-Ticket telah dikirimkan ke {passengerEmail}.
        </p>
      </main>

      <Footer />

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bg-white.rounded-3xl, .bg-white.rounded-3xl * { visibility: visible; }
          .bg-white.rounded-3xl { position: absolute; left: 0; top: 0; width: 100%; }
          nav, button, footer { display: none !important; }
        }
      `}</style>
    </div>
  )
}
