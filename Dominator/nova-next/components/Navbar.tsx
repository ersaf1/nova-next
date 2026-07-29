'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Sparkles, Home } from 'lucide-react'
import LogoIcon from './LogoIcon'
import gsap from 'gsap'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Packages', href: '/packages' },
  { label: 'AI Planner', href: '/itinerary', highlight: true },
  { label: 'How It Works', href: '/how-it-works' },
]

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isDark = false

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 transition-all duration-300 opacity-0 bg-white border-b border-black/[0.06] py-1 text-neutral-900`}
    >
      <div className="max-w-[88rem] mx-auto flex items-center justify-between gap-8">
        {/* Logo -> Navigasi ke Halaman Utama (/) */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" title="Kembali ke Halaman Utama">
          <LogoIcon className="w-20 h-20 transition-transform duration-300 group-hover:scale-110" />
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
                    ? 'text-black font-extrabold bg-black/5'
                    : 'text-black/60 hover:text-black hover:bg-black/[0.04]'
                }`}
              >
                {label === 'Home' && <Home size={13} className={active ? 'text-black' : 'text-black/50'} />}
                {highlight && <Sparkles size={12} className={active ? 'text-amber-500' : 'text-amber-400'} />}
                {label}
              </Link>
            )
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs sm:text-sm font-jakarta font-semibold px-4 py-2 rounded-full text-black/70 hover:text-black hover:bg-black/[0.04] transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/login')}
            className="text-xs sm:text-sm font-jakarta font-semibold px-4 py-2 rounded-full text-black/70 hover:text-black hover:bg-black/[0.04] transition-all"
          >
            Masuk
          </button>
          <button
            onClick={() => router.push('/search')}
            className="text-xs sm:text-sm font-jakarta font-bold px-5 py-2.5 rounded-full bg-neutral-950 hover:bg-black text-white transition-all shadow-xs"
          >
            Cari Paket
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl text-black hover:bg-black/[0.06] transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-black/[0.06] text-black space-y-3">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href, highlight }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
                  isActive(href)
                    ? 'text-black font-extrabold bg-black/[0.06]'
                    : 'text-black/70 hover:text-black hover:bg-black/[0.03]'
                }`}
              >
                {label === 'Home' && <Home size={14} className="text-black/60" />}
                {highlight && <Sparkles size={13} className="text-amber-500" />}
                {label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-black/[0.06]">
            <button
              onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
              className="w-full text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl text-black/70 hover:text-black hover:bg-black/[0.04] transition-colors text-left"
            >
              Dashboard
            </button>
            <button
              onClick={() => { router.push('/login'); setMenuOpen(false) }}
              className="w-full text-sm font-jakarta font-semibold px-4 py-2.5 rounded-xl bg-black/[0.04] text-black hover:bg-black/[0.08] transition-colors text-center"
            >
              Masuk
            </button>
            <button
              onClick={() => { router.push('/search'); setMenuOpen(false) }}
              className="w-full text-sm font-jakarta font-bold px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-black transition-colors text-center"
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
