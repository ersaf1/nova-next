import React from 'react'
import Link from 'next/link'
import LogoIcon from './LogoIcon'

const Footer: React.FC = () => {
  const links = {
    Produk: [
      { label: 'Destinations', href: '/destinations' },
      { label: 'Packages', href: '/packages' },
      { label: 'AI Planner', href: '/itinerary' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Search', href: '/search' },
    ],
    Perusahaan: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Cancellation Policy', href: '/cancellation' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  }

  return (
    <footer className="bg-[#050505] overflow-hidden">
      {/* Top section */}
      <div className="max-w-[1600px] mx-auto px-[clamp(20px,4vw,64px)] pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-12">
          {/* Brand col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <LogoIcon className="w-6 h-6 text-white" />
              <span className="text-lg font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>
                NOVA
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">
              Platform perjalanan modern untuk pengalaman yang dirancang dengan cermat.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold px-5 py-2.5 rounded-full bg-[#175cff] hover:bg-[#0f47cc] text-white transition-colors duration-200"
            >
              Mulai Perjalanan
            </Link>
          </div>

          {/* Nav cols */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white/40 text-[10px] font-semibold tracking-[0.14em] uppercase mb-5">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-white/50 text-sm hover:text-white transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* NOVA wordmark — big editorial element */}
      <div className="max-w-[1600px] mx-auto px-[clamp(20px,4vw,64px)] pb-4 overflow-hidden">
        <div
          className="font-semibold text-white/[0.04] select-none leading-none"
          style={{
            fontSize: 'clamp(8rem, 22vw, 22rem)',
            letterSpacing: '-0.07em',
            lineHeight: 0.85,
          }}
          aria-hidden="true"
        >
          NOVA
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-[clamp(20px,4vw,64px)] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">© 2026 NOVA. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-white/20 text-xs hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-white/20 text-xs hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/cookies" className="text-white/20 text-xs hover:text-white/50 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
