'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Compass,
  LogOut,
  Bell,
  Search,
  User,
  Heart,
  Briefcase,
  ShieldCheck
} from 'lucide-react'
import LogoIcon from './LogoIcon'
import CurrencySwitcher from './CurrencySwitcher'
import gsap from 'gsap'
import { supabaseClient } from '@/lib/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Destinasi', href: '/destinations' },
  { label: 'Paket Wisata', href: '/packages' },
  { label: 'Smart Planner', href: '/ai-planner' },
  { label: 'Promo', href: '/promo' },
  { label: 'Cara Pesan', href: '/how-it-works' },
]

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const checkUserRole = async (sessionUser: SupabaseUser | null, token?: string) => {
      setUser(sessionUser)
      if (sessionUser && token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (data?.role) setUserRole(data.role)
        } catch {
          setUserRole('user')
        }
      } else {
        setUserRole(null)
      }
    }

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      checkUserRole(session?.user ?? null, session?.access_token)
    })
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      checkUserRole(session?.user ?? null, session?.access_token)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserDropdownOpen(false)
  }, [pathname])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut()
    setUser(null)
    setUserDropdownOpen(false)
    router.push('/')
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200/80 transition-all duration-300 ${
        scrolled ? 'shadow-[0_4px_20px_-4px_rgba(28,25,23,0.06)] py-3' : 'py-4'
      }`}
    >
      <div className="max-w-[88rem] mx-auto px-6 sm:px-10 flex items-center justify-between gap-8">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" title="NOVA Travel - Beranda">
          <LogoIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-[#1C1917] leading-none">
              N<span className="relative inline-block">
                <span>O</span>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#C29B38]" />
              </span>VA
            </span>
            <span className="text-[9px] font-semibold tracking-widest uppercase text-stone-500 leading-tight mt-0.5">
              Curated Travel
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`text-[13px] font-medium transition-colors relative py-1 ${
                  active
                    ? 'text-[#1C1917] font-semibold'
                    : 'text-stone-600 hover:text-[#1C1917]'
                }`}
              >
                <span>{label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C29B38] rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">

          <div className="hidden sm:block">
            <CurrencySwitcher />
          </div>

          {/* Quick Search Shortcut */}
          <Link
            href="/search"
            className="p-2 rounded-full text-stone-600 hover:text-[#1C1917] hover:bg-stone-100 transition-colors"
            title="Cari Paket & Destinasi"
          >
            <Search size={18} strokeWidth={1.5} />
          </Link>

          {/* Notification Button */}
          <Link
            href="/dashboard/notifications"
            className="p-2 rounded-full text-stone-600 hover:text-[#1C1917] hover:bg-stone-100 transition-colors relative"
            title="Notifikasi"
          >
            <Bell size={18} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C29B38]" />
          </Link>

          {/* User Account / Login State */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-all text-xs font-semibold text-[#1C1917] cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[90px] truncate">{user.email?.split('@')[0]}</span>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FAF9F6] rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-fade-in-up">
                  {/* Admin Panel Quick Access */}
                  {userRole && ['admin', 'super_admin', 'booking_officer'].includes(userRole) && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#1C1917] bg-stone-100 hover:bg-stone-200/80 transition-colors mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#C29B38]" />
                        <span>Panel Admin</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-stone-900 text-white px-1.5 py-0.5 rounded">
                        {userRole === 'super_admin' ? 'SUPER' : 'ADMIN'}
                      </span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-[#1C1917] transition-colors"
                  >
                    <Briefcase size={14} className="text-stone-500" />
                    Dashboard Traveler
                  </Link>
                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-[#1C1917] transition-colors"
                  >
                    <Compass size={14} className="text-stone-500" />
                    Riwayat Booking
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-[#1C1917] transition-colors"
                  >
                    <Heart size={14} className="text-stone-500" />
                    Wishlist Impian
                  </Link>
                  <div className="border-t border-stone-200 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium px-4 py-2 rounded-full text-stone-700 hover:text-[#1C1917] hover:bg-stone-100 transition-colors border border-stone-200/90"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-4.5 py-2 rounded-full bg-stone-900 hover:bg-black text-white transition-all shadow-xs"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Primary CTA Button — Obsidian Pill */}
          <Link
            href="/packages"
            className="text-xs font-semibold px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>Eksplor Paket</span>
          </Link>
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/search"
            className="p-2 rounded-full text-stone-600 hover:bg-stone-100"
            title="Cari"
          >
            <Search size={18} />
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl text-[#1C1917] hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-[640px] opacity-100 mt-2 px-4' : 'max-h-0 opacity-0 px-4 pointer-events-none'
        }`}
      >
        <div className="bg-[#FAF9F6] rounded-3xl p-6 shadow-xl border border-stone-200 text-[#1C1917] space-y-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium px-4 py-3 rounded-2xl transition-all flex items-center ${
                  isActive(href)
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-[#1C1917]'
                }`}
              >
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2.5">
            {/* Mobile Currency Switcher */}
            <div className="flex items-center justify-between px-3 py-2 bg-stone-100 rounded-2xl border border-stone-200">
              <span className="text-xs font-medium text-stone-600">Mata Uang</span>
              <CurrencySwitcher />
            </div>
            {user ? (
              <>
                {userRole && ['admin', 'super_admin', 'booking_officer'].includes(userRole) && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-xs font-bold px-4 py-3 rounded-2xl bg-stone-100 text-[#1C1917] hover:bg-stone-200 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-[#C29B38]" />
                      <span>Panel Admin</span>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-stone-900 text-white px-1.5 py-0.5 rounded">
                      {userRole === 'super_admin' ? 'SUPER' : 'ADMIN'}
                    </span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl bg-stone-100 text-[#1C1917] hover:bg-stone-200 transition-colors flex items-center gap-2"
                >
                  <Briefcase size={14} className="text-stone-500" />
                  Dashboard Akun
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors text-left flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  Keluar Akun
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-medium px-4 py-3 rounded-2xl border border-stone-200 text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-medium px-4 py-3 rounded-2xl bg-stone-900 text-white hover:bg-black transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
            <Link
              href="/packages"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-xs font-semibold px-4 py-3.5 rounded-2xl bg-stone-900 text-white hover:bg-black transition-colors shadow-xs"
            >
              Cari Paket Wisata Sekarang
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
