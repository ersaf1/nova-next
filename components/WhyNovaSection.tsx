'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Shield, Zap, HeadphonesIcon, CreditCard, LucideIcon, Award, CheckCircle2 } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

interface Feature {
  id?: number
  title: string
  subtitle?: string
  stat: string
  statLabel: string
  iconName: string
  image: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Headphones: HeadphonesIcon,
  CreditCard,
}

const DEFAULT_FEATURES: Feature[] = [
  {
    title: 'Pemesanan Instan',
    subtitle: 'Konfirmasi tiket & voucher cepat',
    stat: '< 3 Menit',
    statLabel: 'Rata-rata waktu booking',
    iconName: 'Zap',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80'
  },
  {
    title: 'Garansi Harga & Refund',
    subtitle: 'Tanpa biaya tersembunyi',
    stat: '100%',
    statLabel: 'Jaminan perlindungan dana',
    iconName: 'Shield',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
  },
  {
    title: '24/7 Travel Concierge',
    subtitle: 'Bantuan live chat & WhatsApp',
    stat: '24 Jam',
    statLabel: 'Pendampingan perjalanan',
    iconName: 'Headphones',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80'
  },
  {
    title: 'Pembayaran Lengkap',
    subtitle: 'QRIS, VA, CC, & PayLater',
    stat: '100% Aman',
    statLabel: 'Enkripsi SSL 256-bit',
    iconName: 'CreditCard',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
  },
]

const WhyNovaSection: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES)

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then((data: Feature[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((d, i) => ({
            ...d,
            image: d.image || DEFAULT_FEATURES[i % DEFAULT_FEATURES.length].image,
            subtitle: DEFAULT_FEATURES[i % DEFAULT_FEATURES.length].subtitle
          }))
          setFeatures(merged)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="bg-[#F5F2EB] px-4 sm:px-6 md:px-8 py-20 md:py-28 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto space-y-10">
        
        {/* Section Header */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
                <Award className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>05 / The NOVA Advantage</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
                Mengapa Memilih <span className="font-serif-luxury italic font-normal text-stone-800">NOVA Travel?</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
                Komitmen kami menghadirkan pengalaman liburan premium tanpa kendala dari awal hingga pulang.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <ScrollReveal staggerChildren={true} animation="slide-up" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => {
              const Icon = ICON_MAP[feature.iconName] ?? Zap
              const fallbackImg = DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].image
              const imageSrc = feature.image || fallbackImg

              return (
                <div
                  key={feature.title || idx}
                  className="group relative rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 h-72 sm:h-80 flex flex-col justify-between p-5 text-white border border-gray-100 hover:border-slate-300"
                >
                  {/* Background Image */}
                  <Image
                    src={imageSrc}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                  {/* Top Icon Badge */}
                  <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 space-y-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {feature.title}
                      </h3>
                      {feature.subtitle && (
                        <p className="text-xs text-white/70 mt-0.5">
                          {feature.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/20">
                      <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">
                        {feature.stat}
                      </span>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                        {feature.statLabel}
                      </span>
                    </div>
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

export default WhyNovaSection
