'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import LogoIcon from '@/components/LogoIcon'
import SwipeNavigation from '@/components/SwipeNavigation'
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
  Menu,
  X,
  ChevronLeft,
  Search,
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
    category: 'Utama',
    items: [
      { path: '/admin', label: 'Ringkasan Dashboard', exact: true, icon: LayoutDashboard },
    ],
  },
  {
    category: 'Operasional',
    items: [
      { path: '/admin/bookings', label: 'Pemesanan (Bookings)', icon: Calendar },
      { path: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
      { path: '/admin/reports', label: 'Laporan & Finansial', icon: FileSpreadsheet },
      { path: '/admin/refunds', label: 'Pengembalian Dana', icon: ReceiptText },
      { path: '/admin/coupons', label: 'Kupon & Promo', icon: Ticket },
    ],
  },
  {
    category: 'Konten Web',
    items: [
      { path: '/admin/packages', label: 'Paket Wisata', icon: Package },
      { path: '/admin/destinations', label: 'Destinasi', icon: MapPin },
      { path: '/admin/hero', label: 'Hero Banner', icon: Sparkles },
      { path: '/admin/features', label: 'Fitur Unggulan', icon: Layers },
      { path: '/admin/how-it-works', label: 'Cara Kerja', icon: ListOrdered },
      { path: '/admin/testimonials', label: 'Ulasan / Testimoni', icon: MessageSquare },
      { path: '/admin/faqs', label: 'Pertanyaan (FAQ)', icon: HelpCircle },
    ],
  },
  {
    category: 'Sistem',
    items: [
      { path: '/admin/audit-logs', label: 'Log Aktivitas & Audit', icon: ShieldCheck },
      { path: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
    ],
  },
]

const ADMIN_SWIPE_ROUTES = [
  { path: '/admin', label: 'Ringkasan Dashboard' },
  { path: '/admin/bookings', label: 'Pemesanan (Bookings)' },
  { path: '/admin/packages', label: 'Paket Wisata' },
  { path: '/admin/destinations', label: 'Destinasi' },
  { path: '/admin/coupons', label: 'Kupon & Promo' },
  { path: '/admin/refunds', label: 'Pengembalian Dana' },
  { path: '/admin/users', label: 'Manajemen Pengguna' },
  { path: '/admin/reports', label: 'Laporan Finansial' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [user, setUser] = useState<MeResponse | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const navScrollRef = useRef<HTMLElement>(null)

  // Forward trackpad / mouse wheel events anywhere on the sidebar directly into nav scroll
  const handleSidebarWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (navScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      navScrollRef.current.scrollTop += e.deltaY
    }
  }

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/admin')
        return
      }

      // Ensure access token cookie is set for server-side endpoints
      if (typeof document !== 'undefined' && session.access_token) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax`
      }

      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
        .then(r => r.json())
        .then((data: MeResponse & { error?: string }) => {
          if (data.error || !['admin', 'super_admin', 'booking_officer'].includes(data.role)) {
            router.push('/login?error=unauthorized&redirect=/admin')
            return
          }
          setUser(data)
          setAuthorized(true)
          setChecking(false)
        })
        .catch(() => {
          router.push('/login?redirect=/admin')
        })
    })

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token && typeof document !== 'undefined') {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax`
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Memverifikasi Hak Akses Admin...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-xs font-bold text-slate-500">Mengalihkan ke halaman login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-blue-950/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        onWheel={handleSidebarWheel}
        className={`fixed lg:sticky top-0 h-screen max-h-screen overflow-hidden z-50 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-3 shrink-0 h-16">
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            <LogoIcon className="w-8 h-8 shrink-0" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black tracking-tight text-neutral-950 text-sm leading-tight truncate">
                  NOVA CORE
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-500 items-center justify-center cursor-pointer transition-colors"
            title={collapsed ? 'Perluas Menu' : 'Sederhanakan Menu'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Menu Search (when expanded) */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari menu admin..."
                className="w-full pl-8 pr-8 py-1.5 bg-neutral-50 border border-neutral-200/90 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-neutral-400 bg-neutral-200/60 px-1 py-0.2 rounded">
                ⌘K
              </span>
            </div>
          </div>
        )}

        {/* Nav Items List */}
        <nav
          ref={navScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 space-y-6 touch-pan-y custom-scrollbar"
        >
          {navCategories.map((category) => {
            const filteredItems = category.items.filter(item => {
              if (!searchFilter.trim()) return true
              return item.label.toLowerCase().includes(searchFilter.toLowerCase())
            })

            if (filteredItems.length === 0) return null

            return (
              <div key={category.category} className="space-y-1.5">
                {!collapsed && (
                  <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                    {category.category}
                  </h3>
                )}
                {filteredItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.exact
                    ? pathname === item.path
                    : pathname === item.path || pathname.startsWith(item.path + '/')

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                            isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* User Badge & Bottom Actions */}
        <div className="p-3 border-t border-neutral-100 space-y-1.5 shrink-0 bg-neutral-50/50">
          {user && !collapsed && (
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Pengguna Aktif
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider bg-neutral-900 text-white">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-900 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          )}

          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors border border-transparent hover:border-neutral-200/70 ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Kembali ke Situs Publik"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-neutral-400" />
            {!collapsed && <span>Buka Web Publik</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Keluar Akun Admin"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-200/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <span className="text-neutral-500 hover:text-neutral-800 transition-colors">Admin</span>
              <span>/</span>
              <span className="text-neutral-950 font-bold bg-neutral-100/90 border border-neutral-200/70 px-2.5 py-1 rounded-lg">
                {currentPageLabel}
              </span>
            </div>

            {/* Live Operational Status Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100/80 hover:bg-neutral-200/70 border border-neutral-200/70 px-3 py-1.5 rounded-xl transition-all"
            >
              <ExternalLink size={13} className="text-neutral-500" />
              <span>Buka Web Publik</span>
            </Link>

            {user && (
              <div className="flex items-center gap-2.5 bg-white border border-neutral-200/90 shadow-2xs pl-2 pr-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-900">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-[10px]">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <span className="truncate max-w-[120px]">{user.name || user.email.split('@')[0]}</span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded-md">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content — Generous Whitespace */}
        <main className="flex-1 p-8 sm:p-12 lg:p-16 overflow-y-auto bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto space-y-12">
            {children}
          </div>
        </main>
      </div>

      {/* Two-Finger Trackpad Horizontal Swipe Navigation */}
      <SwipeNavigation routes={ADMIN_SWIPE_ROUTES} />
    </div>
  )
}
