import React from 'react'
import Link from 'next/link'
import LogoIcon from './LogoIcon'
import { ShieldCheck, Lock, Award, Heart, Phone, Mail, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  const links = {
    'Produk & Layanan': [
      { label: 'Destinasi Populer', href: '/destinations' },
      { label: 'Paket Wisata Terkurasi', href: '/packages' },
      { label: 'AI Travel Planner', href: '/ai-planner' },
      { label: 'Promo & Kupon Diskon', href: '/promo' },
      { label: 'Cara Pemesanan', href: '/how-it-works' },
    ],
    'Perusahaan': [
      { label: 'Tentang NOVA', href: '/how-it-works' },
      { label: 'Ulasan Traveler', href: '/#testimonials' },
      { label: 'Pusat Bantuan & FAQ', href: '/faq' },
      { label: 'Hubungi Kami', href: '/how-it-works' },
    ],
    'Bantuan & Kebijakan': [
      { label: 'Kebijakan Refund', href: '/faq' },
      { label: 'Syarat & Ketentuan', href: '/faq' },
      { label: 'Kebijakan Privasi', href: '/faq' },
      { label: 'Panduan Paspor & Visa', href: '/faq' },
    ],
  }

  return (
    <footer className="bg-neutral-950 text-white overflow-hidden border-t border-neutral-800">
      
      {/* Main Top Section */}
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 md:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="w-8 h-8 text-white" />
              <span className="text-xl font-black tracking-tight text-white">
                NOVA TRAVEL
              </span>
            </div>
            
            <p className="text-white/60 text-xs leading-relaxed max-w-sm font-light">
              Platform liburan dan perencanaan perjalanan modern terpercaya di Indonesia. Menghadirkan kemudahan pemesanan paket wisata all-inclusive dengan teknologi AI.
            </p>

            <div className="space-y-2 text-xs text-white/70 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span>Sudirman Central Business District (SCBD), Jakarta</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand" />
                <span>concierge@nova.travel</span>
              </div>
            </div>
          </div>

          {/* Nav Links Columns (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {Object.entries(links).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-[10px] font-extrabold tracking-widest uppercase text-white/90">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-white/60 hover:text-brand-light text-xs transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Security & Guarantees Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-extrabold tracking-widest uppercase text-white/90">
              Jaminan Keamanan
            </h4>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Garansi 100% Refund</p>
                  <p className="text-[10px] text-white/50">Proteksi pembatalan resmi</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-brand-light shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Pembayaran Terenkripsi</p>
                  <p className="text-[10px] text-white/50">256-Bit SSL Security</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-[10px] text-white/40 pt-1">
              <span className="bg-white/10 px-2 py-1 rounded">BCA</span>
              <span className="bg-white/10 px-2 py-1 rounded">Mandiri</span>
              <span className="bg-white/10 px-2 py-1 rounded">BNI</span>
              <span className="bg-white/10 px-2 py-1 rounded">QRIS</span>
              <span className="bg-white/10 px-2 py-1 rounded">Visa</span>
              <span className="bg-white/10 px-2 py-1 rounded">Mastercard</span>
            </div>
          </div>

        </div>
      </div>

      {/* NOVA Big Brand Wordmark */}
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 md:px-8 pb-2 overflow-hidden select-none pointer-events-none">
        <div
          className="font-black text-white/[0.04] leading-none text-center"
          style={{
            fontSize: 'clamp(5rem, 16vw, 15rem)',
            letterSpacing: '-0.06em',
          }}
          aria-hidden="true"
        >
          NOVA
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 NOVA Travel Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/faq" className="hover:text-white transition-colors">Privasi</Link>
            <Link href="/faq" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <Link href="/faq" className="hover:text-white transition-colors">Pusat Bantuan</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer
