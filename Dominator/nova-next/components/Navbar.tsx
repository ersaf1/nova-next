'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Sparkles } from 'lucide-react'
import LogoIcon from './LogoIcon'
import gsap from 'gsap'

const NAV_LINKS = [
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

  const isHomePage = pathname === '/'
  const isItineraryPage = pathname === '/itinerary'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Dark navbar styling if on home page or itinerary page hero section
  const isDark = (isHomePage || isItineraryPage) ? !scrolled : false

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 transition-all duration-300 opacity-0 ${
        isDark
          ? 'bg-transparent py-6 text-white'
          : 'bg-white/90 backdrop-blur-xl border-b border-black/[0.06] py-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] text-neutral-900'
      }`}
    >
      <div className="max-w-[88rem] mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <LogoIcon className={`w-7 h-7 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`} />
          <span
            className={`text-2xl font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ letterSpacing: '-0.03em' }}
          >
            Nova
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href, highlight }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  active
                    ? isDark
                      ? 'text-white font-bold bg-white/20 shadow-xs'
                      : 'text-black font-bold bg-black/5 shadow-2xs'
                    : isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-black/60 hover:text-black hover:bg-black/[0.04]'
                }`}
              >
                {highlight && <Sparkles size={12} className={active ? 'text-amber-400' : 'text-amber-400/80'} />}
                {label}
              </Link>
            )
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
              isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/[0.04]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/login')}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
              isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/[0.04]'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => router.push('/search')}
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[#175cff] hover:bg-[#0f47cc] text-white transition-all duration-200 shadow-xs"
          >
            Cari Paket
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-xl transition-colors duration-200 ${
            isDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/[0.06]'
          }`}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-black/[0.06] text-black">
          <div className="flex flex-col gap-1 mb-4">
            {NAV_LINKS.map(({ label, href, highlight }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
                  isActive(href)
                    ? 'text-black font-bold bg-black/[0.06]'
                    : 'text-black/70 hover:text-black hover:bg-black/[0.03]'
                }`}
              >
                {highlight && <Sparkles size={12} className="text-amber-500" />}
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t border-black/[0.06]">
            <button
              onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
              className="w-full text-sm font-medium px-5 py-2.5 rounded-full text-black/70 hover:text-black hover:bg-black/[0.04] transition-colors text-left"
            >
              Dashboard
            </button>
            <button
              onClick={() => { router.push('/profile'); setMenuOpen(false) }}
              className="w-full text-sm font-medium px-5 py-2.5 rounded-full text-black/70 hover:text-black hover:bg-black/[0.04] transition-colors text-left"
            >
              Profil
            </button>
            <button
              onClick={() => { router.push('/login'); setMenuOpen(false) }}
              className="w-full text-sm font-medium px-5 py-2.5 rounded-full bg-black/[0.04] text-black hover:bg-black/[0.08] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { router.push('/booking'); setMenuOpen(false) }}
              className="w-full text-sm font-semibold px-5 py-2.5 rounded-full bg-black text-white hover:bg-black/80 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
