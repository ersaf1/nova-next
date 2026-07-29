'use client'

import React, { useEffect, useState } from 'react'
import { Globe, Users, Building2, Plane, LucideIcon } from 'lucide-react'

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
  { statKey: 'countries', value: '150+', label: 'Countries', iconName: 'Globe' },
  { statKey: 'hotels', value: '10K+', label: 'Hotels & Resorts', iconName: 'Building2' },
  { statKey: 'airlines', value: '500+', label: 'Airlines', iconName: 'Plane' },
  { statKey: 'travelers', value: '2M+', label: 'Happy Travelers', iconName: 'Users' },
]

const StatsBar: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((data: Stat[]) => {
        if (Array.isArray(data)) {
          // Only use bar stats (those with an iconName)
          const barStats = data.filter(s => s.iconName).slice(0, 4)
          if (barStats.length > 0) setStats(barStats)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="bg-white px-6 py-16 border-y border-black/[0.04]">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-black/[0.06]">
          {stats.map(({ statKey, value, label, iconName }) => {
            const Icon = iconName ? ICON_MAP[iconName] : null
            return (
              <div key={statKey} className="flex flex-col items-center md:items-start md:px-16 first:md:pl-0 last:md:pr-0">
                <div className="flex items-center gap-3 mb-2">
                  {Icon && <Icon className="w-5 h-5 text-black/30" />}
                  <span className="text-4xl md:text-5xl font-bold text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
                    {value}
                  </span>
                </div>
                <span className="text-xs text-black/40 font-bold uppercase tracking-wider">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
