'use client'

import React, { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-client'
import {
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  ReceiptText,
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'

interface RefundBooking {
  id: number
  bookingCode?: string
  packageName: string
  email: string
  name?: string
  contactName?: string
  refund_status: 'requested' | 'approved' | 'rejected'
  refund_reason?: string
  totalAmount?: number
  createdAt?: string
  updatedAt?: string
}

type ToastState = { message: string; type: 'success' | 'error' } | null

export default function AdminRefundsPage() {
  const [items, setItems] = useState<RefundBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/bookings?refund=requested')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const confirmMsg =
      action === 'approve'
        ? 'Setujui pengembalian dana ini? Status booking akan diubah menjadi Refunded.'
        : 'Tolak pengajuan refund ini?'
    if (!confirm(confirmMsg)) return

    setActionLoading(id)
    try {
      const res = await adminFetch(`/api/bookings/${id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        showToast(err.error ?? 'Gagal memproses pengajuan', 'error')
        return
      }
      setItems((prev) => prev.filter((b) => b.id !== id))
      showToast(
        action === 'approve'
          ? 'Pengembalian dana berhasil disetujui!'
          : 'Pengajuan refund berhasil ditolak.',
        'success'
      )
    } catch {
      showToast('Terjadi kendala jaringan — silakan coba lagi', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—'

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-extrabold flex items-center gap-2.5 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-rose-600 text-white shadow-rose-600/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <XCircle size={16} className="shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <ReceiptText size={13} />
            <span>Manajemen Pengembalian Dana</span>
          </div>
          <h1 className="text-2xl font-black text-blue-950 tracking-tight">
            Antrean Pengajuan Refund
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tinjau dan proses permohonan pembatalan & pengembalian dana yang diajukan oleh traveler.
          </p>
        </div>

        <button
          onClick={load}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400">Memuat data refund...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-sm font-extrabold text-blue-950">Tidak Ada Antrean Refund</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Semua permohonan pengembalian dana telah selesai diproses. Permintaan baru dari traveler akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-left bg-slate-50/50">
                  <th className="py-3.5 px-5">Booking</th>
                  <th className="py-3.5 px-5">Traveler</th>
                  <th className="py-3.5 px-5">Paket Wisata</th>
                  <th className="py-3.5 px-5">Tgl Pengajuan</th>
                  <th className="py-3.5 px-5">Alasan Refund</th>
                  <th className="py-3.5 px-5 text-right">Keputusan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((booking) => {
                  const isActing = actionLoading === booking.id
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Booking ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock3 size={14} className="text-amber-500 shrink-0" />
                          <span className="font-mono text-xs font-bold text-blue-950">
                            {booking.bookingCode ?? `#${booking.id}`}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-blue-950 text-xs">
                          {booking.contactName ?? booking.name ?? 'Traveler'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{booking.email}</p>
                      </td>

                      {/* Package */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-800 font-semibold max-w-[180px] truncate">
                          {booking.packageName ?? '—'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 font-medium">
                        {formatDate(booking.updatedAt ?? booking.createdAt)}
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-4">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 max-w-[240px]">
                          <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                            &ldquo;{booking.refund_reason || 'Tidak menyertakan alasan spesifik'}&rdquo;
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(booking.id, 'approve')}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            title="Setujui dan kembalikan dana"
                          >
                            <CheckCircle2 size={13} />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, 'reject')}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                            title="Tolak permohonan"
                          >
                            <XCircle size={13} />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
