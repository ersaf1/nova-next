'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Ticket, Heart, Map, User, LogOut } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings', label: 'Booking Saya', icon: Ticket },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/itineraries', label: 'Itinerary AI', icon: Map },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut()
    router.replace('/login')
  }

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              active ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black',
            ].join(' ')}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        )
      })}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 mt-2"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        Keluar
      </button>
    </nav>
  )
}
