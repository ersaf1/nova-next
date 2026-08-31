'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Sparkles,
  Home,
  LogOut,
  Bell,
  Search,
  Tag,
  Compass,
  MapPin,
  HelpCircle,
  User,
  Heart,
  Briefcase
} from 'lucide-react'
import LogoIcon from './LogoIcon'
import CurrencySwitcher from './CurrencySwitcher'
import gsap from 'gsap'
import { supabaseClient } from '@/lib/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Destinasi', href: '/destinations', icon: MapPin },
  { label: 'Paket Wisata', href: '/packages', icon: Compass },
  { label: 'AI Planner', href: '/ai-planner', icon: Sparkles, highlight: true },
  { label: 'Promo', href: '/promo', icon: Tag, badge: 'HOT' },
  { label: 'Cara Pesan', href: '/how-it-works', icon: HelpCircle },
]

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!navRef.current) return
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-black/[0.04] border-b border-neutral-200/80 py-2.5'
          : 'bg-white/85 backdrop-blur-sm border-b border-neutral-200/50 py-3'
      }`}
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" title="NOVA Travel - Beranda">
          <LogoIcon className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-950 leading-none">
              NOVA
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-brand-dark leading-tight mt-0.5">
              Travel Beyond
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100/80 border border-neutral-200/60 shadow-2xs">
          {NAV_LINKS.map(({ label, href, icon: Icon, highlight, badge }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 relative ${
                  active
                    ? 'bg-white text-neutral-950 shadow-xs font-extrabold'
                    : highlight
                    ? 'text-neutral-900 hover:bg-white/80'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
                }`}
              >
                <Icon
                  size={13}
                  className={
                    active
                      ? 'text-brand-dark'
                      : highlight
                      ? 'text-brand animate-pulse'
                      : 'text-neutral-400'
                  }
                />
                <span>{label}</span>
                {badge && (
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-500 text-white tracking-wider">
                    {badge}
                  </span>
                )}
                {highlight && !active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          
          <div className="hidden xl:block">
            <CurrencySwitcher />
          </div>

          {/* Quick Search Shortcut */}
          <Link
            href="/search"
            className="p-2 rounded-full text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            title="Cari Paket & Destinasi"
          >
            <Search size={17} />
          </Link>

          {/* Notification Button */}
          <Link
            href="/dashboard/notifications"
            className="p-2 rounded-full text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors relative"
            title="Notifikasi"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
          </Link>

          {/* User Account / Login State */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 transition-all text-xs font-bold text-neutral-800"
              >
                <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[90px] truncate">{user.email?.split('@')[0]}</span>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-2 z-50 animate-fade-in-up">
                  <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Masuk sebagai</p>
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    <Briefcase size={14} className="text-neutral-400" />
                    Dashboard Traveler
                  </Link>
                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    <Compass size={14} className="text-neutral-400" />
                    Riwayat Booking
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    <Heart size={14} className="text-neutral-400" />
                    Wishlist Impian
                  </Link>
                  <div className="border-t border-neutral-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut size={14} />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-full text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            >
              Masuk
            </Link>
          )}

          {/* Primary CTA Button */}
          <Link
            href="/packages"
            className="text-xs font-extrabold px-4.5 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-white transition-all shadow-sm shadow-brand/30 flex items-center gap-1.5 shrink-0"
          >
            <span>Eksplor Paket</span>
          </Link>
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/search"
            className="p-2 rounded-full text-neutral-700 hover:bg-neutral-100"
            title="Cari"
          >
            <Search size={18} />
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl text-neutral-800 hover:bg-neutral-100 transition-colors"
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
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-neutral-200/90 text-neutral-900 space-y-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href, icon: Icon, highlight, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-xs font-bold px-4 py-3 rounded-2xl transition-all flex items-center justify-between ${
                  isActive(href)
                    ? 'bg-neutral-900 text-white font-extrabold'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive(href) ? 'text-white' : highlight ? 'text-brand' : 'text-neutral-400'} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-xs font-bold px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Briefcase size={14} className="text-neutral-500" />
                  Dashboard Akun
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-xs font-bold px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Keluar Akun
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 hover:bg-neutral-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
            <Link
              href="/packages"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-xs font-extrabold px-4 py-3 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm shadow-brand/40"
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
