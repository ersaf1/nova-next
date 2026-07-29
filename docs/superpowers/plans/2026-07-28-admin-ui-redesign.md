# Admin UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the NOVA Admin UI (`/admin`) into a Minimalist Premium & Luxury interface with a grouped sidebar, Lucide icons, topbar header with breadcrumbs and user controls, and styled dashboard stat cards.

**Architecture:** Refactor `app/admin/layout.tsx` to act as a modern dashboard shell with a fixed dark sidebar and sticky topbar, and update `app/admin/page.tsx` to display polished metric cards and quick action shortcuts.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons (`lucide-react`), Supabase Auth Client.

## Global Constraints
- Minimalist Premium & Luxury design theme.
- Responsive flex layout with fixed sidebar (`w-64 bg-neutral-950 text-white`).
- Hairline borders (`border-neutral-200/80` or `border-neutral-800`).
- Lucide React icons for all navigation items.

---

### Task 1: Redesign Admin Shell Layout (`app/admin/layout.tsx`)

**Files:**
- Modify: `app/admin/layout.tsx`

**Interfaces:**
- Consumes: `lucide-react` icons, `supabaseClient` auth status, `next/navigation` (`useRouter`, `usePathname`).
- Produces: Polished admin layout wrapping all `/admin/*` routes.

- [ ] **Step 1: Inspect `app/admin/layout.tsx` current dependencies and structure**
- [ ] **Step 2: Update `app/admin/layout.tsx` with Lucide icons, categorized sidebar, and topbar header**

```tsx
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
  Calendar,
  Ticket,
  Layers,
  ListOrdered,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User
} from 'lucide-react'

interface NavGroup {
  title: string
  items: {
    path: string
    label: string
    icon: React.ElementType
    exact?: boolean
  }[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { path: '/admin/hero', label: 'Hero Section', icon: Sparkles },
      { path: '/admin/destinations', label: 'Destinations', icon: MapPin },
      { path: '/admin/packages', label: 'Packages', icon: Package },
      { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
      { path: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
      { path: '/admin/features', label: 'Features', icon: Layers },
      { path: '/admin/how-it-works', label: 'How It Works', icon: ListOrdered },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
      { path: '/admin/coupons', label: 'Coupons & Promos', icon: Ticket },
    ]
  },
  {
    title: 'System',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  }
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

  // Helper for current page title in topbar breadcrumb
  const getCurrentPageLabel = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.exact ? pathname === item.path : pathname.startsWith(item.path)) {
          return item.label
        }
      }
    }
    return 'Admin'
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-400 font-medium">Authenticating session...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-xs text-neutral-400">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 text-white flex flex-col shrink-0 border-r border-neutral-800">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
              N
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-none">NOVA Admin</span>
              <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-semibold">Management Hub</span>
            </div>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-white text-neutral-950 font-semibold shadow-xs'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-white'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-neutral-950" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer controls */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/50 space-y-1">
          {userEmail && (
            <div className="px-3 py-2 flex items-center gap-2 text-xs text-neutral-400 rounded-md">
              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate text-[11px]" title={userEmail}>
                {userEmail}
              </span>
            </div>
          )}
          <Link
            href="/"
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
              <span>Back to site</span>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2 text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-14 bg-white border-b border-neutral-200/80 px-8 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span className="text-neutral-400">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-neutral-900 font-semibold">{getCurrentPageLabel()}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authenticated Admin</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Save file and verify no syntax or layout errors**

---

### Task 2: Redesign Admin Dashboard Page (`app/admin/page.tsx`)

**Files:**
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `/api/*` endpoints for stats count.
- Produces: Redesigned dashboard cards with clean typography and icons.

- [ ] **Step 1: Update `app/admin/page.tsx` with Lucide icons and modern metric card layout**

```tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  MapPin,
  Package,
  MessageSquare,
  HelpCircle,
  Calendar,
  Ticket,
  Layers,
  ListOrdered,
  Settings,
  ArrowUpRight,
  Clock
} from 'lucide-react'

interface Stats {
  destinations: number
  packages: number
  testimonials: number
  faqs: number
  bookings: number
  coupons: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ destinations: 0, packages: 0, testimonials: 0, faqs: 0, bookings: 0, coupons: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations').then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/coupons?admin=true').then(r => r.json()),
    ]).then(([destinations, packages, testimonials, faqs, bookings, coupons]) => {
      setStats({
        destinations: Array.isArray(destinations) ? destinations.length : 0,
        packages: Array.isArray(packages) ? packages.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        faqs: Array.isArray(faqs) ? faqs.length : 0,
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        coupons: Array.isArray(coupons) ? coupons.length : 0
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Bookings', path: '/admin/bookings', count: stats.bookings, desc: 'View customer booking requests', icon: Calendar, highlight: true },
    { label: 'Destinations', path: '/admin/destinations', count: stats.destinations, desc: 'Manage destination catalog & images', icon: MapPin },
    { label: 'Packages', path: '/admin/packages', count: stats.packages, desc: 'Manage travel packages & pricing', icon: Package },
    { label: 'Coupons & Promos', path: '/admin/coupons', count: stats.coupons, desc: 'Manage discount vouchers & codes', icon: Ticket },
    { label: 'Testimonials', path: '/admin/testimonials', count: stats.testimonials, desc: 'Customer reviews & feedback', icon: MessageSquare },
    { label: 'FAQ', path: '/admin/faqs', count: stats.faqs, desc: 'Frequently asked questions', icon: HelpCircle },
    { label: 'Hero Section', path: '/admin/hero', count: null, desc: 'Edit hero headline, video & poster', icon: Sparkles },
    { label: 'Features', path: '/admin/features', count: null, desc: 'Edit Why Nova feature cards', icon: Layers },
    { label: 'How It Works', path: '/admin/how-it-works', count: null, desc: 'Edit how it works steps', icon: ListOrdered },
    { label: 'Settings', path: '/admin/settings', count: null, desc: 'Edit stats, partners & system configuration', icon: Settings },
  ]

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{todayDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard Overview</h1>
          <p className="text-neutral-500 text-xs mt-1">Manage content, view bookings, and update settings across NOVA.</p>
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-neutral-200/80 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.path}
                href={card.path}
                className={`bg-white rounded-xl p-5 border transition-all duration-200 group flex flex-col justify-between ${
                  card.highlight
                    ? 'border-neutral-900 shadow-xs ring-1 ring-neutral-900/5'
                    : 'border-neutral-200/80 hover:border-neutral-900 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">{card.label}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">{card.desc}</p>
                </div>

                {card.count !== null && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Total Items</span>
                    <span className="text-lg font-bold text-neutral-900">{card.count}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Save file and verify formatting**

---

### Task 3: Build Verification

- [ ] **Step 1: Run `npm run build` or Next.js build check to confirm zero TypeScript / layout errors**
- [ ] **Step 2: Commit all implemented changes**

```bash
git add app/admin/layout.tsx app/admin/page.tsx
git commit -m "feat(admin): redesign admin layout and dashboard UI with minimalist luxury theme"
```
