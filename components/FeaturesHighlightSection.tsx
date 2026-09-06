import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Globe2, Map, Clock, Award, ArrowRight } from 'lucide-react'

const highlights = [
  { icon: Globe2, title: 'Destinasi Terverifikasi', stat: 'Global' },
  { icon: Map, title: 'Rute Harian Presisi', stat: 'Smart' },
  { icon: Clock, title: 'Konfirmasi Booking', stat: 'Instan' },
  { icon: Award, title: 'Standar Akomodasi', stat: '5★ Bintang' },
]

const FeaturesHighlightSection: React.FC = () => {
  return (
    <section className="bg-[#FAF9F6] px-4 sm:px-6 py-20 md:py-28 border-t border-stone-200/80">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Visual Showcase Card — 80% Photo Dual Composition */}
          <div className="relative h-[520px] md:h-[580px] w-full rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-900 group select-none">
            {/* Main Primary Photo */}
            <Image
              src="/uploads/packages/bali_escape.jpg"
              alt="Bali Escape Curated Journey"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bottom Caption on Main Photo */}
            <div className="absolute bottom-6 left-6 z-10 text-white">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20">
                BALI &amp; UBUD RETREAT
              </span>
              <p className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
                Private Luxury Villa &amp; Sanctuary
              </p>
            </div>

            {/* Secondary Overlapping Photo Card */}
            <div className="absolute top-6 right-6 w-48 sm:w-56 h-60 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/90 z-20 group/sec hidden xs:block">
              <Image
                src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=85"
                alt="Labuan Bajo Phinisi"
                fill
                sizes="240px"
                className="object-cover transition-transform duration-700 group-hover/sec:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  KOMODO SAILING
                </span>
                <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">Phinisi Deluxe</p>
              </div>
            </div>

            {/* Floating Verified Badge */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl border border-stone-200 z-20">
              <div className="flex items-center gap-1.5">
                <span className="text-[#C29B38] text-sm">★</span>
                <span className="font-bold text-xs text-stone-900">Kurasi Bintang 5</span>
              </div>
            </div>
          </div>

          {/* Right Text Block */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200 mb-4">
              <span>Ekosistem Perjalanan Terpadu</span>
            </div>
            <h2 className="text-[#1C1917] text-4xl md:text-5xl font-black leading-tight mb-6" style={{ letterSpacing: '-0.03em' }}>
              Jelajah Lebih Jauh, <span className="font-serif-luxury italic font-normal text-stone-800">Tanpa Rasa Khawatir.</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {highlights.map((h) => {
                const Icon = h.icon
                return (
                  <div key={h.title} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-stone-200 shadow-xs hover:border-stone-300 transition-colors">
                    <div className="w-10 h-10 rounded-xl border border-stone-200 bg-stone-100 text-[#C29B38] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[#1C1917] font-black text-xl leading-tight" style={{ letterSpacing: '-0.03em' }}>{h.stat}</p>
                      <p className="text-stone-600 text-xs font-medium mt-0.5">{h.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold px-6 py-3.5 rounded-full hover:bg-black transition-all shadow-xs hover:shadow-md group"
            >
              <span>Pelajari Fitur Lengkap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default FeaturesHighlightSection
