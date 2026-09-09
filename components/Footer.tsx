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
            
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              Biro Perjalanan Wisata Terkurasi Resmi di Indonesia. Melayani paket perjalanan bintang 5 all-inclusive, private charter ekspedisi, serta kurasi rute cerdas.
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C29B38] shrink-0" />
                <span>Menara NOVA Lt. 18, SCBD Kav. 52-53, Jakarta Selatan 12190</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C29B38] shrink-0" />
                <span>Hotline 24/7 Concierge: +62 21 5088 9000 / WA +62 812 3456 7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C29B38] shrink-0" />
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

          {/* Security & Agency Certification Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400">
              Legalitas & Keamanan Biro
            </h4>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Izin Resmi TDUP & Kemenparekraf</p>
                  <p className="text-[10px] text-stone-400">No. NIB: 0220301140921 &middot; Biro Wisata</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-[#C29B38] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Anggota Resmi ASITA & IATA</p>
                  <p className="text-[10px] text-stone-400">Terakreditasi Asosiasi Pariwisata</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Pembayaran Terenkripsi 256-Bit</p>
                  <p className="text-[10px] text-stone-400">Garansi 100% Refund Sesuai Polis</p>
                </div>
              </div>
            </div>

            {/* Payment Partners */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Metode Pembayaran Resmi</p>
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-stone-400">
                {['BCA', 'Mandiri', 'BNI', 'BRI', 'QRIS', 'Visa', 'Mastercard'].map(bank => (
                  <span key={bank} className="bg-white/8 border border-white/10 px-2 py-0.5 rounded text-stone-300 font-medium">{bank}</span>
                ))}
              </div>
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
