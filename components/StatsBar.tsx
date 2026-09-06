'use client'

import React, { useEffect, useState } from 'react'
import { Globe, Users, Building2, Plane, LucideIcon, Award, ShieldCheck, HeartHandshake } from 'lucide-react'

interface Assurance {
  title: string
  subtitle: string
  label: string
  icon: LucideIcon
}

const ASSURANCES: Assurance[] = [
  {
    title: 'Kurasi Resort 5★',
    subtitle: 'Inspeksi berkala untuk kenyamanan mutlak.',
    label: 'STANDAR FASILITAS',
    icon: Building2,
  },
  {
    title: 'Garansi Refund',
    subtitle: 'Proteksi dana transparan dan kebijakan fleksibel.',
    label: 'KEPASTIAN PERJALANAN',
    icon: ShieldCheck,
  },
  {
    title: 'Pemandu Berlisensi',
    subtitle: 'Pemandu lokal resmi untuk wawasan otentik.',
    label: 'PENGALAMAN NYATA',
    icon: Award,
  },
  {
    title: 'Concierge 24/7',
    subtitle: 'Pendampingan langsung via WhatsApp & live chat.',
    label: 'ASISTENSI PENUH',
    icon: HeartHandshake,
  },
]

const StatsBar: React.FC = () => {
  return (
    <section className="bg-[#F5F2EB] px-4 sm:px-6 md:px-8 py-12 border-b border-stone-200/80">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ASSURANCES.map(({ title, subtitle, label, icon: Icon }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white/90 border border-stone-200/90 hover:border-stone-300 hover:shadow-xs transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border border-stone-200/80 flex items-center justify-center shrink-0 text-[#C29B38]">
                <Icon className="w-5 h-5 text-[#C29B38]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {label}
                </span>
                <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-normal">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
