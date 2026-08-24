'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Sparkles, Home, LogOut, Bell } from 'lucide-react'
import LogoIcon from './LogoIcon'
import CurrencySwitcher from './CurrencySwitcher'
import gsap from 'gsap'
import { supabaseClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Packages', href: '/packages' },
  { label: 'AI Planner', href: '/ai-planner', highlight: true },
  { label: 'How It Works', href: '/how-it-works' },
]

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!navRef.current) return
    gsap.fromTo(
      navRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 }
    )
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Ambil session awal
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    // Dengarkan perubahan auth (login/logout)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
    setMenuOpen(false)
  }

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 transition-all duration-300 opacity-0 bg-white/95 backdrop-blur-md border-b border-brand/15 py-0 text-[#12333a]`}
    >
      <div className="max-w-[88rem] mx-auto flex items-center justify-between gap-8">
        {/* Logo -> Navigasi ke Halaman Utama (/) */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" title="Kembali ke Halaman Utama">
          <LogoIcon className="w-12 h-12 transition-transform duration-300 group-hover:scale-110" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href, highlight }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`text-xs sm:text-sm px-4 py-2 rounded-full font-jakarta font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  active
                    ? 'text-brand-darker font-extrabold bg-brand/10'
                    : 'text-[#3d5a5e]/80 hover:text-brand-dark hover:bg-brand/[0.07]'
                }`}
              >
                {label === 'Home' && <Home size={13} className={active ? 'text-brand-dark' : 'text-[#3d5a5e]/60'} />}
                {highlight && <Sparkles size={12} className={active ? 'text-brand' : 'text-brand/70'} />}
                {label}
              </Link>
            )
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                href="/dashboard/notifications"
                className="p-2 rounded-full text-[#3d5a5e]/70 hover:text-brand-dark hover:bg-brand/[0.08] transition-all"
                title="Notifikasi"
              >
                <Bell size={16} />
              </Link>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xs sm:text-sm font-jakarta font-semibold px-4 py-2 rounded-full text-[#3d5a5e]/90 hover:text-brand-dark hover:bg-brand/[0.07] transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="text-xs sm:text-sm font-jakarta font-semibold px-4 py-2 rounded-full text-[#3d5a5e]/90 hover:text-red-600 hover:bg-red-500/[0.07] transition-all flex items-center gap-1.5"
              >
                <LogOut size={13} />
                Keluar
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-xs sm:text-sm font-jakarta font-semibold px-4 py-2 rounded-full text-[#3d5a5e]/90 hover:text-brand-dark hover:bg-brand/[0.07] transition-all"
            >
              Masuk
            </button>
          )}
          <button
            onClick={() => router.push('/search')}
            className="text-xs sm:text-sm font-jakarta font-bold px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-white transition-all shadow-sm shadow-brand/40"
          >
            Cari Paket
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl text-brand-darker hover:bg-brand/10 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-brand/10 border border-brand/20 text-[#12333a] space-y-3">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href, highlight }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
                  isActive(href)
                    ? 'text-brand-darker font-extrabold bg-brand/10'
                    : 'text-[#3d5a5e]/80 hover:text-brand-dark hover:bg-brand/[0.05]'
                }`}
              >
                {label === 'Home' && <Home size={14} className="text-[#3d5a5e]/60" />}
                {highlight && <Sparkles size={13} className="text-brand" />}
                {label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-brand/15">
            {user ? (
              <>
                <button
                  onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
                  className="w-full text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl text-[#3d5a5e]/90 hover:text-brand-dark hover:bg-brand/[0.06] transition-colors text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { router.push('/dashboard/notifications'); setMenuOpen(false) }}
                  className="w-full text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl text-[#3d5a5e]/90 hover:text-brand-dark hover:bg-brand/[0.06] transition-colors text-left flex items-center gap-2"
                >
                  <Bell size={13} />
                  Notifikasi
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl bg-brand-faint text-brand-darker hover:bg-brand-lighter transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} />
                  Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => { router.push('/login'); setMenuOpen(false) }}
                className="w-full text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl bg-brand-faint text-brand-darker hover:bg-brand-lighter transition-colors text-center"
              >
                Masuk
              </button>
            )}
            <button
              onClick={() => { router.push('/search'); setMenuOpen(false) }}
              className="w-full text-sm font-jakarta font-bold px-4 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors text-center shadow-sm shadow-brand/40"
            >
              Cari Paket
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
