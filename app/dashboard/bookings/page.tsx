'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase-client'
import { formatIDR, getBookingStatusLabel, getBookingStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from '@/lib/types'
import type { Booking } from '@/lib/types'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function DashboardBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  const fetchBookings = async (signal: AbortSignal) => {
    try {
      const res = await fetch('/api/bookings', { signal })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login?redirect=/dashboard/bookings'); return }
      fetchBookings(controller.signal)
    })
    return () => controller.abort()
    // fetchBookings and router are stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = bookings.filter(b => {
    const status = b.bookingStatus ?? b.status ?? ''
    if (filter === 'active') return ['pending', 'pending_payment', 'confirmed'].includes(status)
    if (filter === 'completed') return status === 'completed'
    if (filter === 'cancelled') return status === 'cancelled'
    return true
  })

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-48 shrink-0 hidden md:block">
            <DashboardNav />
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-black">Booking Saya</h1>
              <Link href="/search" className="text-sm text-neutral-500 hover:text-black transition-colors">
                + Cari Paket Baru
              </Link>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['all','active','completed','cancelled'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all ${filter === f ? 'bg-brand text-white' : 'bg-white border border-black/10 text-neutral-500 hover:border-black/20'}`}
                >
                  {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : f === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-black/[0.04]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-500 text-xs uppercase tracking-wide">Kode</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-500 text-xs uppercase tracking-wide">Paket</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-500 text-xs uppercase tracking-wide">Tanggal</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-500 text-xs uppercase tracking-wide">Total</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-500 text-xs uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-500 text-xs uppercase tracking-wide">Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {loading ? (
                      Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} />)
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-400">
                          {filter === 'all' ? (
                            <>Belum ada booking. <Link href="/search" className="underline text-black">Cari paket wisata</Link></>
                          ) : 'Tidak ada booking dengan filter ini.'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map(b => {
                        const bookingStatus = (b.bookingStatus ?? b.status ?? 'pending') as Booking['bookingStatus']
                        const paymentStatus = (b.paymentStatus ?? 'unpaid') as Booking['paymentStatus']
                        return (
                          <tr
                            key={b.id}
                            className="hover:bg-neutral-50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/dashboard/bookings/${b.id}`)}
                          >
                            <td className="px-4 py-3 font-mono text-xs text-neutral-600">{b.bookingCode ?? `#${b.id}`}</td>
                            <td className="px-4 py-3 font-medium text-black max-w-[180px] truncate">{b.packageName}</td>
                            <td className="px-4 py-3 text-neutral-500">{formatDate(b.departureStartDate ?? b.travelDate)}</td>
                            <td className="px-4 py-3 font-semibold text-black">{formatIDR(b.totalAmount)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getBookingStatusColor(bookingStatus)}`}>
                                {getBookingStatusLabel(bookingStatus)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getPaymentStatusColor(paymentStatus)}`}>
                                {getPaymentStatusLabel(paymentStatus)}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
