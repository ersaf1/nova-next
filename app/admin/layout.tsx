'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import {
  LayoutDashboard,
  Sparkles,
  MapPin,
  Package,
  MessageSquare,
  HelpCircle,
  Layers,
  ListOrdered,
  Calendar,
  Ticket,
  Settings,
  ChevronRight,
  User,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  exact?: boolean
  icon: React.ComponentType<{ className?: string }>
}

interface NavCategory {
  category: string
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    category: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', exact: true, icon: LayoutDashboard },
    ],
  },
  {
    category: 'Content Management',
    items: [
      { path: '/admin/hero', label: 'Hero Section', icon: Sparkles },
      { path: '/admin/destinations', label: 'Destinations', icon: MapPin },
      { path: '/admin/packages', label: 'Packages', icon: Package },
      { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
      { path: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
      { path: '/admin/features', label: 'Features', icon: Layers },
      { path: '/admin/how-it-works', label: 'How It Works', icon: ListOrdered },
    ],
  },
  {
    category: 'Operations',
    items: [
      { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
      { path: '/admin/coupons', label: 'Coupons & Promos', icon: Ticket },
    ],
  },
  {
    category: 'System',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''
      if (!data.user) {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      if (adminEmail && data.user.email !== adminEmail) {
        router.replace('/')
        return
      }
      setUserEmail(data.user.email ?? null)
      setAuthorized(true)
      setChecking(false)
    })
  }, [router])

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut()
    router.replace('/login')
  }

  const getCurrentPageLabel = () => {
    for (const cat of navCategories) {
      for (const item of cat.items) {
        if (item.exact) {
          if (pathname === item.path) return item.label
        } else {
          if (pathname === item.path || pathname.startsWith(item.path + '/')) {
            return item.label
          }
        }
      }
    }
    return 'Dashboard'
  }

  const currentPageLabel = getCurrentPageLabel()

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-500 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-500 font-medium">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 text-white flex flex-col shrink-0 border-r border-neutral-800 h-screen sticky top-0">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/60 flex items-center justify-center font-bold text-white shadow-inner shrink-0 relative">
            N
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-950" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold tracking-tight text-white text-base leading-tight">NOVA Admin</span>
            <span className="text-xs text-neutral-400 font-medium">Management Hub</span>
          </div>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navCategories.map((category) => (
            <div key={category.category}>
              <h3 className="px-3 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase mb-2">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.exact
                    ? pathname === item.path
                    : pathname === item.path || pathname.startsWith(item.path + '/')

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-white text-neutral-950 font-semibold shadow-xs'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-neutral-950 shrink-0 ml-1" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 space-y-2">
          {userEmail && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 bg-neutral-900/60 border border-neutral-800/60 min-w-0">
              <User className="w-4 h-4 shrink-0 text-neutral-400" />
              <span className="truncate" title={userEmail}>
                {userEmail}
              </span>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 shrink-0 text-neutral-400" />
              <span>Back to site</span>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Topbar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-14 bg-white border-b border-neutral-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
            <span className="text-neutral-400">Admin</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-semibold">{currentPageLabel}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authenticated Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  )
}
