'use client'

import React, { useState } from 'react'
import { Sparkles, MapPin, X, CheckCircle2, ArrowRight } from 'lucide-react'

interface AIConvertBookingModalProps {
  itineraryTitle: string
  destination: string
  durationDays: number
  estimatedBudgetIDR: number
  onClose: () => void
}

export default function AIConvertBookingModal({
  itineraryTitle,
  destination,
  durationDays,
  estimatedBudgetIDR,
  onClose
}: AIConvertBookingModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [participants, setParticipants] = useState(2)
  const [travelDate, setTravelDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const subtotal = estimatedBudgetIDR * participants
  const serviceFee = 250000
  const totalAmount = subtotal + serviceFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // Find matching package ID or use default package 1
      const pkgRes = await fetch('/api/packages')
      const pkgs = await pkgRes.json()
      const packageId = Array.isArray(pkgs) && pkgs.length > 0 ? pkgs[0].id : 1

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          packageName: `[AI Custom] ${itineraryTitle}`,
          country: destination,
          contactName: name,
          contactEmail: email,
          contactPhone: phone,
          participants,
          travelDate: travelDate || new Date().toISOString().split('T')[0],
          notes: `Hasil AI Itinerary Custom (${durationDays} Hari di ${destination})`,
        })
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2500)
      } else {
        const errData = await res.json()
        setErrorMsg(errData.error || 'Gagal memproses booking AI')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Konversi AI Itinerary ke Booking Live</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-zinc-900">
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 text-sm">{itineraryTitle}</span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-bold">
                {durationDays} Hari
              </span>
            </div>
            <p className="text-zinc-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              Destinasi: {destination}
            </p>
            <p className="text-zinc-500 font-mono">
              Estimasi Biaya: <strong className="text-zinc-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(estimatedBudgetIDR)} / pax</strong>
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
              <p className="font-bold text-emerald-900 text-sm">Booking AI Berhasil Dibuat!</p>
              <p className="text-emerald-700 text-xs">Pemesanan Anda telah tercatat dan tim admin akan menghubungi Anda via WhatsApp/Email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">No WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Peserta</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={participants}
                    onChange={e => setParticipants(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Tgl Travel</label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={e => setTravelDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 flex items-center justify-between">
                <span>Total Biaya Perjalanan ({participants} Pax):</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <span>{loading ? 'Memproses Booking AI...' : 'Konfirmasi & Booking AI Rencana Ini'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
