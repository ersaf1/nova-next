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
  Crown,
  ReceiptText,
  Users,
  FileSpreadsheet,
} from 'lucide-react'

interface MeResponse {
  id: string
  email: string
  name: string
  role: string
}

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
      { path: '/admin/users', label: 'User Management', icon: Users },
      { path: '/admin/reports', label: 'Laporan & Export', icon: FileSpreadsheet },
      { path: '/admin/refunds', label: 'Refunds', icon: ReceiptText },
      { path: '/admin/coupons', label: 'Coupons & Promos', icon: Ticket },
    ],
  },
  {
    category: 'System',
    items: [
      { path: '/admin/audit-logs', label: 'Audit Logs & Safety', icon: ShieldCheck },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [user, setUser] = useState<MeResponse | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then((data: MeResponse & { error?: string }) => {
        if (!data.role || !['booking_officer', 'admin', 'super_admin'].includes(data.role)) {
          router.push('/login?redirect=/admin')
        } else {
          setUser(data)
          setAuthorized(true)
          setChecking(false)
        }
      })
      .catch(() => router.push('/login'))
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
      <div className="min-h-screen bg-[#f4fbfc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-lighter border-t-brand rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#4a6a6e] font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f4fbfc] flex items-center justify-center">
        <p className="text-sm text-[#4a6a6e] font-medium">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4fbfc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-[#12333a] flex flex-col shrink-0 border-r border-brand/15 h-screen sticky top-0">
        {/* Header */}
        <div className="p-5 border-b border-brand/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark border border-brand/40 flex items-center justify-center font-bold text-white shadow-md shadow-brand/30 shrink-0 relative">
            N
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold tracking-tight text-[#0e3438] text-base leading-tight">NOVA Admin</span>
            <span className="text-xs text-brand-dark/80 font-medium">Management Hub</span>
          </div>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navCategories
            .map((category) => {
              if (user?.role === 'booking_officer') {
                if (category.category === 'Overview') return category
                if (category.category === 'Operations') {
                  return {
                    ...category,
                    items: category.items.filter((item) =>
                      ['/admin/bookings', '/admin/refunds', '/admin/reports'].includes(item.path)
                    ),
                  }
                }
                return null
              }
              if (user?.role === 'admin') {
                if (category.category === 'System') return null
                if (category.category === 'Operations') {
                  return {
                    ...category,
                    items: category.items.filter((item) => item.path !== '/admin/users'),
                  }
                }
                return category
              }
              return category
            })
            .filter(Boolean)
            .map((category) => (
              <div key={category!.category}>
                <h3 className="px-3 text-[11px] font-semibold tracking-wider text-brand-dark/60 uppercase mb-2">
                  {category!.category}
                </h3>
                <div className="space-y-1">
                  {category!.items.map((item) => {
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
                            ? 'bg-brand text-white font-semibold shadow-md shadow-brand/30'
                            : 'text-[#3d5a5e]/90 hover:text-brand-darker hover:bg-brand/[0.08] font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand-dark/70'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-white shrink-0 ml-1" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand/15 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#3d5a5e]/90 bg-brand-faint border border-brand/20 min-w-0">
              <User className="w-4 h-4 shrink-0 text-brand-dark" />
              <span className="truncate flex-1" title={user.email}>
                {user.email}
              </span>
              {user.role === 'super_admin' ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 text-[10px] font-semibold shrink-0">
                  <Crown className="w-2.5 h-2.5" />
                  super
                </span>
              ) : user.role === 'booking_officer' ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 text-[10px] font-semibold shrink-0">
                  <Ticket className="w-2.5 h-2.5" />
                  booking ops
                </span>
              ) : (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand/15 text-brand-dark text-[10px] font-semibold shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  admin
                </span>
              )}
            </div>
          )}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#3d5a5e]/90 hover:text-brand-darker hover:bg-brand/[0.08] transition-colors"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 shrink-0 text-brand-dark/70" />
              <span>Back to site</span>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#3d5a5e]/90 hover:text-red-500 hover:bg-red-500/[0.08] transition-colors text-left"
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
        <header className="h-14 bg-white border-b border-brand/15 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-medium text-[#4a6a6e]">
            <span className="text-brand-dark/60">Admin</span>
            <span className="text-brand-light">/</span>
            <span className="text-brand-darker font-semibold">{currentPageLabel}</span>
          </div>

          {user && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
              user.role === 'super_admin'
                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                : 'bg-brand-faint text-brand-darker border-brand/30'
            }`}>
              {user.role === 'super_admin'
                ? <Crown className="w-3.5 h-3.5" />
                : <ShieldCheck className="w-3.5 h-3.5" />
              }
              <span>{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#f4fbfc]">
          {children}
        </main>
      </div>
    </div>
  )
}
