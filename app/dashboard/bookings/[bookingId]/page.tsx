'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ReceiptText, X } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'
import { formatIDR, getBookingStatusLabel, getBookingStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from '@/lib/types'
import type { Booking } from '@/lib/types'
import { useBookingRealtime } from '@/hooks/useBookingRealtime'

const REFUND_STATUS_STYLES: Record<string, string> = {
  requested: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected:  'bg-rose-50 text-rose-700 border border-rose-200',
}

const REFUND_STATUS_LABELS: Record<string, string> = {
  requested: 'Refund Diminta',
  approved:  'Refund Disetujui',
  rejected:  'Refund Ditolak',
}

function RefundModal({
  bookingId,
  onClose,
  onSuccess,
}: {
  bookingId: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      const res = await fetch(`/api/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setError(data.error ?? 'Gagal mengajukan refund')
        return
      }
      onSuccess()
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-black text-base">Ajukan Refund</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Permintaan akan ditinjau oleh tim kami
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Alasan Refund <span className="text-neutral-300 font-normal normal-case">(opsional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Jelaskan alasan pengajuan refund..."
            className="w-full text-sm border border-black/10 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-neutral-300"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-black/10 text-black text-sm font-medium py-3 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ReceiptText className="w-4 h-4" />
            )}
            {submitting ? 'Mengajukan...' : 'Ajukan Refund'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundSuccess, setRefundSuccess] = useState(false)

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

  const { status: realtimeStatus, refundStatus: realtimeRefundStatus, lastUpdate } = useBookingRealtime(booking?.id ?? null)

  const bookingStatus = ((realtimeStatus ?? booking.bookingStatus ?? booking.status ?? 'pending')) as Booking['bookingStatus']
  const paymentStatus = ((realtimeRefundStatus ?? booking.paymentStatus ?? 'unpaid')) as Booking['paymentStatus']
  const needsPayment = ['unpaid', 'pending'].includes(paymentStatus) && bookingStatus !== 'cancelled'

  // Refund state — use local override after successful request, otherwise use booking data
  const currentRefundStatus = (
    refundSuccess ? 'requested' : (booking.refund_status ?? 'none')
  ) as 'none' | 'requested' | 'approved' | 'rejected'

  const canRequestRefund =
    ['paid', 'confirmed'].includes(bookingStatus ?? '') &&
    (currentRefundStatus === 'none' || currentRefundStatus === null)

  const handleRefundSuccess = () => {
    setShowRefundModal(false)
    setRefundSuccess(true)
    // Refresh booking data to sync server state
    fetchBooking()
  }

  return (
    <>
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
                {lastUpdate && (
                  <p className="text-[10px] text-neutral-400 mt-1">Diperbarui baru saja</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2 flex-wrap justify-end">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${getBookingStatusColor(bookingStatus)}`}>
                    {getBookingStatusLabel(bookingStatus)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${getPaymentStatusColor(paymentStatus)}`}>
                    {getPaymentStatusLabel(paymentStatus)}
                  </span>
                </div>
                {/* Live badge — always shown to indicate realtime is active */}
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
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

            {/* Refund status badge */}
            {currentRefundStatus !== 'none' && currentRefundStatus !== null && (
              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border ${REFUND_STATUS_STYLES[currentRefundStatus]}`}>
                <ReceiptText className="w-3.5 h-3.5" />
                {REFUND_STATUS_LABELS[currentRefundStatus]}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {needsPayment && (
                <Link href={`/payment/pending/${booking.id}`} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
                  Lanjutkan Pembayaran
                </Link>
              )}
              {canRequestRefund && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="flex items-center gap-2 border border-black/10 text-black text-sm font-medium px-6 py-3 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <ReceiptText className="w-4 h-4" />
                  Ajukan Refund
                </button>
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

    {showRefundModal && (
      <RefundModal
        bookingId={booking.id}
        onClose={() => setShowRefundModal(false)}
        onSuccess={handleRefundSuccess}
      />
    )}
    </>
  )
}
