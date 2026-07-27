import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LogoIcon from './LogoIcon'

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = ['Destinations', 'Experiences', 'About', 'Blog', 'Help']

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-black/5 py-4 shadow-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[88rem] mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <LogoIcon className={`w-7 h-7 transition-colors duration-300 ${scrolled ? 'text-black' : 'text-white'}`} />
          <span
            className={`text-2xl font-medium tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-black' : 'text-white'
            }`}
            style={{ letterSpacing: '-0.03em' }}
          >
            Nova
          </span>
        </a>

        {/* Center: Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={`text-sm font-medium transition-colors duration-300 ${
                scrolled
                  ? 'text-black/60 hover:text-black'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: CTA button */}
        <div className="flex items-center gap-4">
          <button
            className={`hidden md:block text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-black text-white hover:bg-black/80'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/booking')}
            className={`hidden md:block text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-black text-white hover:bg-black/80'
                : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
            }`}
          >
            Book Now
          </button>
          {/* Mobile menu toggle */}
          <button
            className={`md:hidden p-2 transition-colors duration-300 ${
              scrolled ? 'text-black' : 'text-white'
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-black/5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-base text-black/70 hover:text-black font-medium transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <button className="mt-2 bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-black/80 transition-colors duration-200 w-full">
              Get Started
            </button>
            <button
              onClick={() => { navigate('/booking'); setMenuOpen(false) }}
              className="bg-black text-white text-base font-bold px-7 py-2.5 rounded-full hover:bg-black/80 transition-colors duration-200 w-full"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
