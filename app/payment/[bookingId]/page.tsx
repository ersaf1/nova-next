'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, Building2, Wallet, ChevronRight, Lock, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Booking {
  id: number
  packageName: string
  country: string
  name: string
  email: string
  travelDate: string
  participants: number
  paymentStatus: string
  bookingStatus: string
  price?: number
  totalAmount?: number
  bookingCode?: string
}

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    label: 'Transfer Bank',
    desc: 'BCA · Mandiri · BNI · BRI',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'credit_card',
    label: 'Kartu Kredit / Debit',
    desc: 'Visa · Mastercard · JCB',
    icon: CreditCard,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    desc: 'GoPay · OVO · Dana · ShopeePay',
    icon: Wallet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
]

type Step = 'select' | 'processing' | 'done'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')
  const [step, setStep] = useState<Step>('select')

  useEffect(() => {
    if (!bookingId) return
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data: Booking) => {
        setBooking(data ?? null)
        setLoading(false)
        if (data?.paymentStatus === 'paid' || data?.bookingStatus === 'confirmed') {
          router.replace(`/payment/confirmation/${bookingId}`)
        }
      })
      .catch(() => setLoading(false))
  }, [bookingId])

  const totalAmount = booking?.totalAmount ?? (booking?.price ?? 0) * (booking?.participants ?? 1)

  async function handlePay() {
    if (!booking) return
    setStep('processing')

    // Simulasi delay processing 2.5 detik
    await new Promise((r) => setTimeout(r, 2500))

    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, method: selectedMethod }),
      })
      if (res.ok) {
        setStep('done')
        setTimeout(() => router.push(`/payment/confirmation/${bookingId}`), 1500)
      } else {
        setStep('select')
        alert('Pembayaran gagal, coba lagi.')
      }
    } catch {
      setStep('select')
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
          <p className="text-sm text-black/40 mb-4">Booking tidak ditemukan.</p>
          <button onClick={() => router.push('/')} className="bg-brand text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-brand-dark transition-colors">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  // Done state
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-black">Pembayaran Berhasil!</p>
          <p className="text-xs text-black/40">Mengarahkan ke konfirmasi…</p>
        </div>
      </div>
    )
  }

  // Processing state
  if (step === 'processing') {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xs mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-white border border-black/[0.06] flex items-center justify-center mx-auto shadow-sm">
            <span className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>Memproses Pembayaran</p>
            <p className="text-xs text-black/40 mt-1">via {method?.label}</p>
          </div>
          <div className="bg-white rounded-2xl border border-black/[0.04] p-4 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-black/40">Total</span>
              <span className="font-semibold text-black">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-black/40">Kode Booking</span>
              <span className="font-mono text-black">{booking.bookingCode ?? `#${booking.id}`}</span>
            </div>
          </div>
          <p className="text-[10px] text-black/20">Harap tunggu, jangan tutup halaman ini…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.02em' }}>
      <Navbar />
      <main className="px-6 py-16 pt-28 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-black/30 uppercase tracking-widest mb-2">Langkah 4 dari 4</p>
          <h1 className="text-2xl font-semibold text-black">Pembayaran</h1>
          <p className="text-sm text-black/40 mt-1">Pilih metode pembayaran dan selesaikan booking.</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-5 mb-4">
          <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3">Ringkasan Booking</p>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Paket</span>
              <span className="font-medium text-black text-right max-w-[60%]">{booking.packageName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Tujuan</span>
              <span className="font-medium text-black">{booking.country}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Tanggal</span>
              <span className="font-medium text-black">{booking.travelDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Peserta</span>
              <span className="font-medium text-black">{booking.participants} orang</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Kode Booking</span>
              <span className="font-mono text-black text-xs">{booking.bookingCode ?? `#${booking.id}`}</span>
            </div>
            <div className="pt-2 border-t border-black/[0.06] flex justify-between">
              <span className="text-sm font-semibold text-black">Total</span>
              <span className="text-lg font-bold text-black">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-5 mb-4">
          <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3">Metode Pembayaran</p>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? `${method.border} ${method.bg}`
                      : 'border-brand/20 hover:border-brand/40 hover:bg-brand/[0.04]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? method.bg : 'bg-black/[0.04]'}`}>
                    <Icon className={`w-4.5 h-4.5 ${isSelected ? method.color : 'text-black/40'}`} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-black' : 'text-black/70'}`}>{method.label}</p>
                    <p className="text-xs text-black/40">{method.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${isSelected ? `${method.color.replace('text', 'border')} flex items-center justify-center` : 'border-black/20'}`}>
                    {isSelected && <div className={`w-2 h-2 rounded-full ${method.color.replace('text', 'bg')}`} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Simulator Notice */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Mode Simulasi</span> — Ini adalah simulasi pembayaran untuk keperluan demo. Tidak ada transaksi nyata yang terjadi.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={handlePay}
            className="w-full bg-brand text-white rounded-full px-6 py-3.5 font-semibold hover:bg-brand-dark transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            Bayar {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.back()}
            className="w-full text-black/40 rounded-full px-6 py-3 font-medium hover:text-black transition-colors text-sm border border-black/10"
          >
            Kembali
          </button>
        </div>
      </main>
    </div>
  )
}
