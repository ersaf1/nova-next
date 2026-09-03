import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Compass, Navigation } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const cards = [
  {
    id: 1,
    colSpan: 'lg:col-span-2',
    backgroundImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
    title: 'Liburan Mewah,\nHarga Transparan.',
    body: 'Akses ke 195+ destinasi dunia dengan kurasi hotel bintang 5, penerbangan terbaik, dan pemandu lokal terverifikasi.',
    badge: 'LUXURY VALUE',
    icon: Compass
  },
  {
    id: 2,
    colSpan: '',
    backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=85',
    title: 'Smart Route\nConcierge.',
    body: 'Rancang jadwal harian presisi dalam 30 detik sesuai gaya & preferensi liburan Anda.',
    badge: 'SMART ROUTE',
    icon: Navigation
  },
  {
    id: 3,
    colSpan: '',
    backgroundImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&q=85',
    title: 'Garansi 100%\nKeberangkatan.',
    body: 'Proteksi refund transparan dan pendampingan concierge 24 jam selama di perjalanan.',
    badge: '100% SECURE',
    icon: ShieldCheck
  },
]

const MeetNovaSection: React.FC = () => {
  return (
    <section id="about" className="bg-[#F8FAFC] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-slate-200/70">
      <div className="max-w-[88rem] mx-auto space-y-12">
        
        {/* Section Header */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/70">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Compass className="w-3.5 h-3.5" />
                <span>03 / The NOVA Standard</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-blue-950 tracking-tight leading-tight">
                <span>Standar Baru </span>
                <span className="font-serif-luxury italic font-normal text-blue-600">Perjalanan Modern</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
                Dirancang untuk traveler yang menginginkan kenyamanan mutlak, kemewahan terkurasi, dan kepastian perjalanan.
              </p>
            </div>

            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-6 py-3 rounded-full transition-all shrink-0 shadow-sm shadow-blue-600/25 group"
            >
              <span>Mulai Eksplorasi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Feature Visual Grid */}
        <ScrollReveal staggerChildren={true} animation="slide-up" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className={`group relative rounded-3xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 ${card.colSpan} min-h-[360px] flex flex-col justify-between p-6 sm:p-8 text-white border border-slate-200/60 hover:border-blue-300`}
                >
                  {/* Background Image */}
                  <Image
                    src={card.backgroundImage}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Gradient Overlay in Mediterranean Deep Navy */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/95 via-[#0A192F]/45 to-transparent" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full text-white">
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
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-white/85 text-xs sm:text-sm leading-relaxed font-normal">
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
