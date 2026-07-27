import React from 'react'
import { Globe, Users, Building2, Plane } from 'lucide-react'

const stats = [
  { icon: Globe, value: '150+', label: 'Countries' },
  { icon: Building2, value: '10K+', label: 'Hotels & Resorts' },
  { icon: Plane, value: '500+', label: 'Airlines' },
  { icon: Users, value: '2M+', label: 'Happy Travelers' },
]

const StatsBar: React.FC = () => {
  return (
    <section className="bg-white px-6 py-16 border-y border-black/[0.04]">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-black/[0.06]">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center md:items-start md:px-16 first:md:pl-0 last:md:pr-0">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-black/30" />
                <span className="text-4xl md:text-5xl font-bold text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
                  {value}
                </span>
              </div>
              <span className="text-xs text-black/40 font-bold uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
