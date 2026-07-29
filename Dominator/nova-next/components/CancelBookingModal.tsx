'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface CancelBookingModalProps {
  bookingId: number
  packageName: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function CancelBookingModal({ bookingId: _bookingId, packageName, onConfirm, onClose }: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan booking. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl w-full max-w-md mx-4 p-6"
        style={{ background: 'rgba(15,15,26,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-white text-base font-bold leading-snug">Batalkan Booking?</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/40 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-white/60 text-sm">Kamu akan membatalkan booking untuk:</p>
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <p className="text-white text-sm font-semibold">{packageName}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-amber-300 text-xs leading-relaxed">
              <span className="font-semibold">Kebijakan pembatalan:</span> Pembatalan akan diproses dalam 3–5 hari kerja. Refund (jika berlaku) akan dikembalikan ke metode pembayaran asal.
            </p>
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-white/20 text-white/60 text-sm font-medium px-4 py-2.5 rounded-full hover:border-white/40 hover:text-white transition-colors disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white text-sm font-bold px-4 py-2.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Membatalkan...
              </>
            ) : (
              'Ya, Batalkan'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
