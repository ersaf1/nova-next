import React from 'react'
import Link from 'next/link'
import LogoIcon from './LogoIcon'
import { ShieldCheck, Lock, Award, Heart, Phone, Mail, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  const links = {
    'Produk & Layanan': [
      { label: 'Destinasi Populer', href: '/destinations' },
      { label: 'Paket Wisata Terkurasi', href: '/packages' },
      { label: 'Smart Route Planner', href: '/ai-planner' },
      { label: 'Promo & Kupon Diskon', href: '/promo' },
      { label: 'Cara Pemesanan', href: '/how-it-works' },
    ],
    'Perusahaan': [
      { label: 'Tentang NOVA', href: '/how-it-works' },
      { label: 'Ulasan Traveler', href: '/reviews' },
      { label: 'Pusat Bantuan & FAQ', href: '/faq' },
      { label: 'Panduan Pemesanan', href: '/how-it-works' },
      { label: '📖 User Guide & Showcase', href: '/docs' },
    ],
    'Bantuan & Kebijakan': [
      { label: 'Kebijakan Refund', href: '/faq' },
      { label: 'Syarat & Ketentuan', href: '/faq' },
      { label: 'Kebijakan Privasi', href: '/faq' },
      { label: 'Pusat Dukungan Tamu', href: '/faq' },
    ],
  }

  return (
    <footer className="bg-[#141312] text-white overflow-hidden border-t border-stone-800">
      
      {/* Main Top Section */}
      <div className="max-w-[88rem] mx-auto px-6 sm:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="w-8 h-8 text-white" />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  NOVA TRAVEL
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#C29B38] mt-0.5">
                  Curated Travel Platform
                </span>
              </div>
            </div>
            
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm font-normal">
              Platform perjalanan kurasi modern terpercaya di Indonesia. Paket wisata all-inclusive bintang 5, tur privat, dan perencanaan rute cerdas.
            </p>

            <div className="space-y-2 text-sm text-stone-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>SCBD, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>concierge@nova.travel</span>
              </div>
            </div>
          </div>

          {/* Nav Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {Object.entries(links).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-stone-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Security Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400">
              Jaminan Keamanan
            </h4>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Garansi 100% Refund</p>
                  <p className="text-[11px] text-stone-400">Proteksi pembatalan resmi</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-[#C29B38] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Pembayaran Terenkripsi</p>
                  <p className="text-[11px] text-stone-400">256-Bit SSL Security</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-stone-400 pt-1">
              {['BCA', 'Mandiri', 'BNI', 'QRIS', 'Visa', 'Mastercard'].map(bank => (
                <span key={bank} className="bg-white/8 border border-white/10 px-2.5 py-1 rounded-lg text-stone-300 font-medium">{bank}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800 py-5">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
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
