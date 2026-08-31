'use client'

import React, { useEffect, useState } from 'react'
import { Globe, Users, Building2, Plane, LucideIcon, Award, ShieldCheck, HeartHandshake } from 'lucide-react'

interface Stat {
  statKey: string
  value: string
  label: string
  iconName: string | null
}

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Building2,
  Plane,
  Users,
}

const DEFAULT_STATS: Stat[] = [
  { statKey: 'countries', value: '195+', label: 'Destinasi Negara', iconName: 'Globe' },
  { statKey: 'hotels', value: '10K+', label: 'Hotel & Resort 5★', iconName: 'Building2' },
  { statKey: 'airlines', value: '500+', label: 'Mitra Maskapai', iconName: 'Plane' },
  { statKey: 'travelers', value: '50K+', label: 'Traveler Bahagia', iconName: 'Users' },
]

const StatsBar: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((data: Stat[]) => {
        if (Array.isArray(data)) {
          const barStats = data.filter(s => s.iconName).slice(0, 4)
          if (barStats.length > 0) setStats(barStats)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="bg-white px-4 sm:px-6 md:px-8 py-12 border-b border-neutral-200/70">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-neutral-200">
          {stats.map(({ statKey, value, label, iconName }, idx) => {
            const Icon = iconName ? (ICON_MAP[iconName] ?? Globe) : Globe
            return (
              <div
                key={statKey || idx}
                className="flex flex-col items-center md:items-start md:px-10 first:md:pl-0 last:md:pr-0 text-center md:text-left"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand-dark flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {value}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
