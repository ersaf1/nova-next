'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase-client'
import { Luggage, CalendarCheck, CheckCircle2, Search, MapIcon, Ticket } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import CancelBookingModal from '@/components/CancelBookingModal'

type Booking = {
  id: number
  packageName: string
  country: string
  travelDate: string
  participants: number
  status: 'paid' | 'pending' | 'cancelled'
  email: string
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-black/[0.04] animate-pulse">
      <div className="h-4 bg-neutral-100 rounded w-1/2 mb-3" />
      <div className="h-8 bg-neutral-100 rounded w-1/4" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  )
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
}

const QUICK_ACTIONS = [
  { label: 'Search Packages', description: 'Browse all destinations', href: '/search', icon: Search },
  { label: 'Plan Itinerary', description: 'AI-powered trip planning', href: '/itinerary', icon: MapIcon },
  { label: 'Book a Trip', description: 'Start a new booking', href: '/packages', icon: Ticket },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [modalBooking, setModalBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/dashboard')
        return
      }
      setUser(data.user)
      setLoading(false)
      // Fetch bookings filtered by this user's email
      if (data.user.email) {
        setBookingsLoading(true)
        fetch(`/api/bookings?email=${encodeURIComponent(data.user.email)}`, { signal: controller.signal })
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) setBookings(data)
          })
          .catch(() => {})
          .finally(() => setBookingsLoading(false))
      } else {
        setLoading(false)
      }
    })
    return () => controller.abort()
  }, [router])

  const now = new Date()
  const totalBookings = bookings.length
  const upcomingTrips = bookings.filter((b) => new Date(b.travelDate) > now).length
  const completed = bookings.filter((b) => b.status === 'paid').length

  const stats = [
    { label: 'Total Bookings', value: totalBookings, icon: Luggage },
    { label: 'Upcoming Trips', value: upcomingTrips, icon: CalendarCheck },
    { label: 'Completed', value: completed, icon: CheckCircle2 },
  ]

  const handleCancelBooking = async () => {
    if (!modalBooking || !user?.email) return
    const res = await fetch(`/api/bookings/${modalBooking.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', user_email: user.email }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Gagal membatalkan booking')
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === modalBooking.id ? { ...b, status: 'cancelled' as const } : b))
    )
    setModalBooking(null)
  }

  const displayName = user?.email ? user.email.split('@')[0] : 'there'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <span className="text-sm text-neutral-400" style={{ letterSpacing: '-0.02em' }}>
          Loading…
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.02em' }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8 pt-24">
        {/* Welcome */}
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold text-black"
            style={{ letterSpacing: '-0.02em' }}
          >
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {bookingsLoading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl px-6 py-5 flex items-center gap-4 border border-black/[0.04]"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">{label}</p>
                    <p className="text-2xl font-semibold text-black mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Bookings table */}
        <div className="bg-white rounded-2xl border border-black/[0.04] mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
              My Bookings
            </h2>
            <Link
              href="/packages"
              className="text-xs font-medium text-neutral-500 hover:text-black transition-colors"
            >
              + New booking
            </Link>
          </div>

          {bookingsLoading ? (
            <table className="w-full">
              <tbody>
                {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          ) : bookings.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <span className="text-5xl mb-4" role="img" aria-label="plane">✈️</span>
              <h3
                className="text-base font-semibold text-black mb-1"
                style={{ letterSpacing: '-0.02em' }}
              >
                No trips yet
              </h3>
              <p className="text-sm text-neutral-400 mb-6 max-w-xs">
                You haven't booked any trips. Explore packages and start planning your next adventure.
              </p>
              <Link
                href="/search"
                className="bg-black text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-neutral-800 transition-colors"
              >
                Start Planning
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400">Package</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400">Destination</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400">Travel Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400">Participants</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{b.packageName}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{b.country}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(b.travelDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{b.participants}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                            STATUS_STYLES[b.status] ?? 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === 'paid' ? (
                          <Link
                            href={`/payment/confirmation/${b.id}`}
                            className="text-xs font-medium text-black underline underline-offset-2 hover:text-neutral-600 transition-colors"
                          >
                            View E-ticket
                          </Link>
                        ) : b.status === 'pending' ? (
                          <button
                            onClick={() => setModalBooking(b)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                          >
                            Batalkan
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mb-2">
          <h2
            className="text-sm font-semibold text-black mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map(({ label, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-2xl px-6 py-5 border border-black/[0.04] flex items-start gap-4 hover:border-black/10 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 group-hover:bg-neutral-100 transition-colors">
                  <Icon size={18} className="text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {modalBooking && (
        <CancelBookingModal
          bookingId={modalBooking.id}
          packageName={modalBooking.packageName}
          onConfirm={handleCancelBooking}
          onClose={() => setModalBooking(null)}
        />
      )}
    </div>
  )
}
