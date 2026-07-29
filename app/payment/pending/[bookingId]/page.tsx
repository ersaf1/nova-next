'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import { formatIDR } from '@/lib/types'
import { supabaseClient } from '@/lib/supabase-client'

declare global {
  interface Window {
    snap: { pay: (token: string, options: Record<string, unknown>) => void }
  }
}

interface BookingData {
  id: number
  bookingCode?: string
  packageName: string
  departureStartDate?: string
  departureEndDate?: string
  totalAmount: number
  paymentStatus: string
  bookingStatus: string
  contactEmail?: string
  email?: string
  created_at?: string
  createdAt?: string
}

export default function PaymentPendingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSandbox = process.env.NEXT_PUBLIC_MIDTRANS_ENV !== 'production'

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (!res.ok) throw new Error('Booking tidak ditemukan')
      const data = await res.json()
      setBooking(data)
    } catch {
      setError('Booking tidak ditemukan atau Anda tidak memiliki akses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?redirect=/payment/pending/${bookingId}`)
        return
      }
      fetchBooking()
    })
    // fetchBooking and router are stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const handlePay = async () => {
    setPaying(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: parseInt(bookingId) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat pembayaran')

      if (data.mock) {
        // Mock mode: simulate payment
        await fetch('/api/payment/notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: data.orderId,
            status_code: '200',
            gross_amount: String(booking?.totalAmount ?? 0),
            signature_key: 'mock',
            transaction_status: 'settlement',
            fraud_status: 'accept',
            payment_type: 'mock',
            transaction_id: `mock-${Date.now()}`,
            transaction_time: new Date().toISOString(),
          }),
        })
        router.push(`/payment/confirmation/${bookingId}`)
      } else if (data.token && window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => router.push(`/payment/confirmation/${bookingId}`),
          onPending: () => fetchBooking(),
          onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
          onClose: () => setPaying(false),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setPaying(false)
    }
  }

  const formatDate = (d?: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getExpiryInfo = () => {
    const createdAt = booking?.created_at ?? booking?.createdAt
    if (!createdAt) return null
    const expiry = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000)
    const now = new Date()
    const diffMs = expiry.getTime() - now.getTime()
    if (diffMs <= 0) return 'Pembayaran telah kadaluarsa'
    const diffH = Math.floor(diffMs / 3600000)
    const diffM = Math.floor((diffMs % 3600000) / 60000)
    return `Pembayaran akan kadaluarsa dalam ${diffH} jam ${diffM} menit`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <p className="text-lg font-semibold text-black mb-2">Booking Tidak Ditemukan</p>
          <p className="text-sm text-neutral-500 mb-6">{error}</p>
          <Link href="/dashboard" className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium">
            Ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const expiryInfo = getExpiryInfo()

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ letterSpacing: '-0.01em' }}>
      <Script
        src={`https://app.${isSandbox ? 'sandbox.' : ''}midtrans.com/snap/snap.js`}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''}
      />
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-10 space-y-6">

        {/* Status header */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <span className="text-2xl">⏳</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Menunggu Pembayaran</p>
            {booking.bookingCode && (
              <p className="text-xl font-bold tracking-wider text-black">{booking.bookingCode}</p>
            )}
          </div>
          {expiryInfo && (
            <p className="text-xs text-neutral-400">{expiryInfo}</p>
          )}
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Detail Booking</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Paket</span>
              <span className="font-medium text-right max-w-[60%]">{booking.packageName}</span>
            </div>
            {booking.departureStartDate && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Keberangkatan</span>
                <span className="font-medium">{formatDate(booking.departureStartDate)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-black/[0.04]">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="font-bold text-black">{formatIDR(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors text-sm"
          >
            {paying ? 'Memuat pembayaran…' : 'Lanjutkan Pembayaran'}
          </button>
          <Link
            href="/dashboard"
            className="block w-full text-center border border-black/10 text-black font-medium py-3 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
