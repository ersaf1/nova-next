'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, Building2, Wallet, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCurrency } from '@/context/CurrencyContext'

interface Booking {
  id: number
  packageName: string
  country: string
  name?: string
  contactName?: string
  email?: string
  contactEmail?: string
  travelDate: string
  participants: number
  paymentStatus: string
  bookingStatus: string
  price?: number
  totalAmount?: number
  bookingCode?: string
  passengers?: Array<{ title: string; name: string; idType?: string; idNumber?: string }>
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
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-3 text-stone-900">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Memuat Rincian Pembayaran...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center text-stone-900">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <p className="text-base font-bold text-stone-900">Data Pemesanan Tidak Ditemukan</p>
          <p className="text-xs text-stone-500">Silakan periksa kembali tautan pembayaran Anda.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-stone-900 text-white rounded-full py-3 text-xs font-bold hover:bg-black transition-colors cursor-pointer shadow-xs"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-[#C29B38]" />
              <span>Simulasi Pembayaran 1-Klik</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Selesaikan <span className="font-serif-luxury italic font-normal text-stone-800">Pembayaran</span>
            </h1>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Mode simulasi aktif. Cukup 1 klik untuk menyelesaikan pembayaran dan langsung mendapatkan E-Tiket resmi.
            </p>
          </div>

          {/* Quick Simulation Banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 text-sm font-bold">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Simulasi Instan 1-Klik Aktif</p>
                <p className="text-[11px] text-stone-600">Bypass pembayaran nyata — langsung lunas & E-Tiket terbit seketika.</p>
              </div>
            </div>
            <button
              onClick={handleInstantPay}
              disabled={paying}
              className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {paying ? 'Memproses...' : 'Bayar Sekarang ⚡'}
            </button>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Kode Booking
                </span>
                <p className="font-mono text-base font-bold text-stone-900">
                  {booking.bookingCode ?? `#${booking.id}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Paket Wisata
                </span>
                <p className="text-xs font-bold text-stone-800 max-w-[200px] truncate">
                  {booking.packageName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Nama Pemesan</span>
                <span className="font-bold text-stone-900">{booking.name || booking.contactName || '-'}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Jumlah Peserta</span>
                <span className="font-bold text-stone-900">{booking.participants} Orang</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tanggal Keberangkatan</span>
                <span className="font-bold text-stone-900">
                  {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">Total Tagihan</span>
              <span className="text-xl font-bold text-stone-950 font-serif-luxury">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
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
                        ? 'border-stone-900 bg-[#F5F2EB]/50 shadow-xs ring-1 ring-stone-900/10'
                        : 'border-stone-200/80 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-stone-900">{method.label}</p>
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                            {method.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">{method.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Payment Channel Guide & Virtual Account Box */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <Building2 size={15} className="text-[#C29B38]" />
                <span>
                  {selectedMethod === 'bank_transfer'
                    ? 'Nomor Virtual Account BCA / Mandiri'
                    : selectedMethod === 'credit_card'
                    ? 'Otorisasi Kartu Kredit / Debit'
                    : 'Kode QRIS Pembayaran Nasional'}
                </span>
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-bold">
                Online 24 Jam
              </span>
            </div>

            {selectedMethod === 'bank_transfer' && (
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nomor Rekening Virtual Account</p>
                  <p className="font-mono text-base font-bold text-stone-950 tracking-wider">
                    88012 {String(booking.id).padStart(6, '0')} 992
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`88012${String(booking.id).padStart(6, '0')}992`)
                    alert('Nomor Virtual Account berhasil disalin!')
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-50 cursor-pointer shadow-2xs shrink-0"
                >
                  Salin No. VA
                </button>
              </div>
            )}

            {selectedMethod === 'ewallet' && (
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 text-center space-y-2">
                <div className="inline-block p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="w-24 h-24 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[10px] font-mono font-bold">
                    [QRIS NOVA]
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  Dapat dipindai menggunakan GoPay, OVO, Dana, BCA Mobile, atau Livin Mandiri.
                </p>
              </div>
            )}

            {selectedMethod === 'credit_card' && (
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 text-xs text-stone-600 space-y-1">
                <p className="font-bold text-stone-900">Enkripsi 3D-Secure 2.0</p>
                <p className="text-[11px] text-stone-400">
                  Mendukung cicilan 0% hingga 12 bulan untuk kartu kredit bank mitra.
                </p>
              </div>
            )}
          </div>

          {/* Instant Submit Button */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleInstantPay}
              disabled={paying}
              className="w-full bg-stone-900 hover:bg-black text-white font-bold py-4 rounded-full transition-all text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {paying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses Simulasi & Menerbitkan Tiket...</span>
                </>
              ) : (
                <>
                  <span>⚡ Konfirmasi Pembayaran (Simulasi 1-Klik Selesai)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium text-center">
              <Lock size={12} className="text-emerald-600" />
              <span>Simulasi instan 1-klik aktif. E-ticket resmi langsung terbit seketika.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
