'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCircle2, Clock, XCircle, Package } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'

interface Booking {
  id: number
  packageName: string
  country: string
  travelDate: string
  status: 'paid' | 'pending' | 'cancelled'
  email: string
}

const STATUS_ICON = {
  paid: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  cancelled: <XCircle className="w-4 h-4 text-red-500" />,
}

const STATUS_LABEL: Record<string, string> = {
  paid: 'Booking dikonfirmasi',
  pending: 'Menunggu pembayaran',
  cancelled: 'Booking dibatalkan',
}

const STATUS_DESC: Record<string, string> = {
  paid: 'Pembayaran berhasil. E-tiket Anda sudah siap.',
  pending: 'Selesaikan pembayaran sebelum batas waktu.',
  cancelled: 'Booking ini telah dibatalkan.',
}

function NotificationItem({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-black/[0.04] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
        {STATUS_ICON[booking.status]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black">{STATUS_LABEL[booking.status]}</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {booking.packageName} · {booking.country}
        </p>
        <p className="text-xs text-neutral-400 mt-1">{STATUS_DESC[booking.status]}</p>
      </div>
      <span className="text-xs text-neutral-300 shrink-0">
        {new Date(booking.travelDate).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric',
        })}
      </span>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseClient.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/dashboard/notifications')
        return
      }
      try {
        const res = await fetch(`/api/bookings?email=${encodeURIComponent(data.user.email ?? '')}`)
        if (!res.ok) return
        const d = await res.json()
        setBookings(Array.isArray(d) ? d : [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl p-4 border border-black/[0.04] sticky top-28">
              <DashboardNav />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-black" />
              <h1 className="text-xl font-semibold text-black">Notifikasi</h1>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse py-4 border-b border-black/[0.04] last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-100 rounded w-1/3" />
                        <div className="h-3 bg-neutral-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-5 h-5 text-neutral-300" />
                  </div>
                  <p className="text-sm text-neutral-400">Belum ada notifikasi</p>
                </div>
              ) : (
                <div>
                  {bookings.map(b => (
                    <NotificationItem key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
