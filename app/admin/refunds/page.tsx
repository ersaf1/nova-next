'use client'

import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  ReceiptText,
} from 'lucide-react'

interface RefundBooking {
  id: number
  packageName: string
  email: string
  name?: string
  contactName?: string
  refund_status: 'requested' | 'approved' | 'rejected'
  refund_reason?: string
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
      const res = await fetch('/api/bookings?refund=requested')
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
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        showToast(err.error ?? 'Action failed', 'error')
        return
      }
      setItems((prev) => prev.filter((b) => b.id !== id))
      showToast(
        action === 'approve'
          ? 'Refund approved successfully'
          : 'Refund rejected',
        'success'
      )
    } catch {
      showToast('Network error — please try again', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Refund Requests</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Pending refund requests awaiting review
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-black/15 border-t-black rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-3">
              <ReceiptText className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-500">No pending refund requests</p>
            <p className="text-xs text-neutral-400 mt-1">
              All refund requests have been processed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-3.5">
                    Booking
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-3.5">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-3.5">
                    Package
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-3.5">
                    Requested
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-3.5">
                    Reason
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {items.map((booking) => {
                  const isActing = actionLoading === booking.id
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Booking ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-mono text-xs font-semibold text-neutral-700">
                            #{booking.id}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-neutral-900 text-xs">
                          {booking.contactName ?? booking.name ?? '—'}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">{booking.email}</p>
                      </td>

                      {/* Package */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-neutral-700 font-medium max-w-[160px] truncate">
                          {booking.packageName ?? '—'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-neutral-500">
                          {formatDate(booking.updatedAt ?? booking.createdAt)}
                        </p>
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-neutral-500 max-w-[200px] truncate">
                          {booking.refund_reason || (
                            <span className="italic text-neutral-300">No reason given</span>
                          )}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(booking.id, 'approve')}
                            disabled={isActing}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isActing ? (
                              <div className="w-3 h-3 border border-emerald-400 border-t-emerald-700 rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, 'reject')}
                            disabled={isActing}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isActing ? (
                              <div className="w-3 h-3 border border-rose-400 border-t-rose-700 rounded-full animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Reject
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
