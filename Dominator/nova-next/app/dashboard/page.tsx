'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { Luggage, CalendarCheck, Heart, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const stats = [
  { label: 'Total Bookings', value: 0, icon: Luggage },
  { label: 'Upcoming Trips', value: 0, icon: CalendarCheck },
  { label: 'Wishlist', value: 0, icon: Heart },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/dashboard')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    })
  }, [router])

  async function handleSignOut() {
    await supabaseClient.auth.signOut()
    // Clear session cookie
    document.cookie = 'sb-access-token=; path=/; max-age=0'
    router.push('/')
  }

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
      {/* Top bar */}
      <header className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-black">NOVA</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-black">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                <Icon size={18} className="text-black" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-black">{value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-black mb-4">Recent Bookings</h2>
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F5F5]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Destination</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-xs text-neutral-400">
                    No bookings yet. Start planning your next trip.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            onClick={() => router.push('/booking')}
            className="mt-4 bg-black text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Book a trip
          </button>
        </div>
      </main>
    </div>
  )
}
