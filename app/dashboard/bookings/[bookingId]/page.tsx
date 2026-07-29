'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'
import { formatIDR, getBookingStatusLabel, getBookingStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from '@/lib/types'
import type { Booking } from '@/lib/types'

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (!res.ok) { setError('Booking tidak ditemukan'); return }
      const data = await res.json()
      setBooking(data)
    } catch { setError('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace(`/login?redirect=/dashboard/bookings/${bookingId}`); return }
      fetchBooking()
    })
    // fetchBooking and router are stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    </div>
  )

  if (error || !booking) return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="font-semibold text-black mb-2">Booking Tidak Ditemukan</p>
        <p className="text-sm text-neutral-400 mb-6">{error}</p>
        <Link href="/dashboard/bookings" className="bg-black text-white px-6 py-2.5 rounded-xl text-sm">Kembali</Link>
      </div>
    </div>
  )

  const bookingStatus = (booking.bookingStatus ?? booking.status ?? 'pending') as Booking['bookingStatus']
  const paymentStatus = (booking.paymentStatus ?? 'unpaid') as Booking['paymentStatus']
  const needsPayment = ['unpaid', 'pending'].includes(paymentStatus) && bookingStatus !== 'cancelled'

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          <aside className="w-48 shrink-0 hidden md:block"><DashboardNav /></aside>
          <main className="flex-1 min-w-0 space-y-6">

            <Link href="/dashboard/bookings" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Semua Booking
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Kode Booking</p>
                <p className="text-2xl font-bold tracking-wider text-black">{booking.bookingCode ?? `#${booking.id}`}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${getBookingStatusColor(bookingStatus)}`}>
                  {getBookingStatusLabel(bookingStatus)}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${getPaymentStatusColor(paymentStatus)}`}>
                  {getPaymentStatusLabel(paymentStatus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Package info */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Detail Paket</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Paket</span><span className="font-medium text-right">{booking.packageName}</span></div>
                  {booking.departureStartDate && <div className="flex justify-between"><span className="text-neutral-500">Berangkat</span><span className="font-medium">{formatDate(booking.departureStartDate)}</span></div>}
                  {booking.departureEndDate && <div className="flex justify-between"><span className="text-neutral-500">Selesai</span><span className="font-medium">{formatDate(booking.departureEndDate)}</span></div>}
                  <div className="flex justify-between"><span className="text-neutral-500">Peserta</span><span className="font-medium">{booking.participants} orang</span></div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Data Pemesan</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Nama</span><span className="font-medium">{booking.contactName ?? booking.name}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Email</span><span className="font-medium">{booking.contactEmail ?? booking.email}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Telepon</span><span className="font-medium">{booking.contactPhone ?? booking.phone ?? '-'}</span></div>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-neutral-50 rounded-2xl border border-black/[0.04] p-5 space-y-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Rincian Harga</p>
              {booking.unitPrice && <div className="flex justify-between text-neutral-600"><span>{formatIDR(booking.unitPrice)} × {booking.participants}</span><span>{formatIDR(booking.subtotal)}</span></div>}
              {booking.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Diskon</span><span>-{formatIDR(booking.discountAmount)}</span></div>}
              {booking.serviceFee && <div className="flex justify-between text-neutral-400 text-xs"><span>Biaya layanan</span><span>{formatIDR(booking.serviceFee)}</span></div>}
              <div className="flex justify-between font-bold text-black text-base pt-2 border-t border-black/[0.06]">
                <span>Total</span><span>{formatIDR(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {needsPayment && (
                <Link href={`/payment/pending/${booking.id}`} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
                  Lanjutkan Pembayaran
                </Link>
              )}
              <a href={`mailto:support@novawisata.com?subject=Booking ${booking.bookingCode ?? booking.id}`} className="border border-black/10 text-black text-sm font-medium px-6 py-3 rounded-xl hover:bg-neutral-50 transition-colors">
                Hubungi Support
              </a>
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
          </main>
        </div>
      </div>
    </div>
  )
}
