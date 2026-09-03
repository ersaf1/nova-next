'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, Building2, Wallet, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useCurrency } from '@/context/CurrencyContext'

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
    label: 'Transfer Bank Otomatis (VA)',
    desc: 'BCA, Mandiri, BNI, BRI (Konfirmasi Langsung)',
    icon: Building2,
    badge: 'Paling Populer',
  },
  {
    id: 'credit_card',
    label: 'Kartu Kredit / Debit',
    desc: 'Visa, Mastercard, JCB (Instant Settled)',
    icon: CreditCard,
    badge: 'Instan',
  },
  {
    id: 'ewallet',
    label: 'E-Wallet / QRIS',
    desc: 'GoPay, OVO, Dana, ShopeePay (Scan Langsung)',
    icon: Wallet,
    badge: '1-Klik',
  },
]

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const { formatPrice } = useCurrency()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')
  const [paying, setPaying] = useState(false)

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
  }, [bookingId, router])

  const totalAmount = booking?.totalAmount ?? (booking?.price ?? 0) * (booking?.participants ?? 1)

  // Direct 1-Click Instant Payment — no waiting, no stuck in pending!
  async function handleInstantPay() {
    if (!booking || paying) return
    setPaying(true)

    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, method: selectedMethod }),
      })

      if (res.ok) {
        // Direct jump to e-ticket confirmation!
        router.push(`/payment/confirmation/${bookingId}`)
      } else {
        alert('Gagal memproses pembayaran. Silakan coba lagi.')
        setPaying(false)
      }
    } catch {
      alert('Terjadi kendala jaringan saat pembayaran.')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Memuat Rincian Pembayaran...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <p className="text-base font-bold text-blue-950">Data Pemesanan Tidak Ditemukan</p>
          <p className="text-xs text-slate-500">Silakan periksa kembali tautan pembayaran Anda.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-extrabold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Pembayaran Instan & Aman</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
              Selesaikan Pembayaran
            </h1>
            <p className="text-xs text-slate-500">
              Pilih metode pembayaran dan konfirmasi tiket e-voucher Anda secara otomatis.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Kode Booking
                </span>
                <p className="font-mono text-base font-black text-blue-950">
                  {booking.bookingCode ?? `#${booking.id}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Paket Wisata
                </span>
                <p className="text-xs font-extrabold text-slate-800 max-w-[200px] truncate">
                  {booking.packageName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Nama Pemesan</span>
                <span className="font-bold text-blue-950">{booking.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jumlah Peserta</span>
                <span className="font-bold text-blue-950">{booking.participants} Orang</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tanggal Keberangkatan</span>
                <span className="font-bold text-blue-950">
                  {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Total Tagihan</span>
              <span className="text-xl font-black text-blue-600">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              Pilih Saluran Pembayaran
            </p>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.id

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/30'
                        : 'border-slate-200/80 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-blue-950">{method.label}</p>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            {method.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{method.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Instant Submit Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleInstantPay}
              disabled={paying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition-all text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {paying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi & Menerbitkan Tiket...</span>
                </>
              ) : (
                <>
                  <span>Bayar Sekarang (Auto-Lunas)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center">
              <Lock size={12} className="text-emerald-600" />
              <span>Tanpa menunggu admin. Status otomatis terkonfirmasi lunas seketika.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
