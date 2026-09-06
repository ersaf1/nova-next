import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Compass, Navigation } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const cards = [
  {
    id: 1,
    colSpan: 'lg:col-span-2',
    backgroundImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85',
    title: 'Liburan Mewah,\nHarga Transparan.',
    body: 'Kurasi hotel bintang 5 & penerbangan terbaik di 195+ destinasi.',
    badge: 'LUXURY VALUE',
    icon: Compass
  },
  {
    id: 2,
    colSpan: '',
    backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=85',
    title: 'Smart Route\nConcierge.',
    body: 'Rute harian presisi terintegrasi dalam hitungan detik.',
    badge: 'SMART ROUTE',
    icon: Navigation
  },
  {
    id: 3,
    colSpan: '',
    backgroundImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&q=85',
    title: 'Garansi 100%\nKeberangkatan.',
    body: 'Proteksi refund transparan dan pendampingan 24 jam.',
    badge: '100% SECURE',
    icon: ShieldCheck
  },
]

const MeetNovaSection: React.FC = () => {
  return (
    <section id="about" className="bg-[#FAF9F6] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto space-y-10">
        
        {/* Section Header */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
                <Compass className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>Keunggulan Kurasi NOVA</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
                Standar Baru <span className="font-serif-luxury italic font-normal text-stone-800">Perjalanan Modern</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
                Dirancang untuk traveler yang menginginkan kenyamanan mutlak, kemewahan terkurasi, dan kepastian perjalanan.
              </p>
            </div>

            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold px-6 py-3.5 rounded-full transition-all shrink-0 shadow-xs hover:shadow-md"
            >
              <span>Mulai Eksplorasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Feature Visual Grid */}
        <ScrollReveal staggerChildren={true} animation="slide-up" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className={`group relative rounded-3xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 ${card.colSpan} min-h-[380px] sm:min-h-[440px] flex flex-col justify-between p-6 sm:p-7 text-white border border-stone-200/80 hover:border-stone-300`}
                >
                  {/* Background Image */}
                  <Image
                    src={card.backgroundImage}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white">
                      {card.badge}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 space-y-2 pt-12">
                    <h3
                      className="text-xl sm:text-2xl font-black leading-tight whitespace-pre-line text-white"
                    >
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

export default MeetNovaSection
