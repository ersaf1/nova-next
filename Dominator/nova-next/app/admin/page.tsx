'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  MapPin,
  Package,
  MessageSquare,
  HelpCircle,
  Calendar,
  Ticket,
  Layers,
  ListOrdered,
  Settings,
  ArrowUpRight,
  Clock
} from 'lucide-react'

interface Stats {
  destinations: number
  packages: number
  testimonials: number
  faqs: number
  bookings: number
  coupons: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ destinations: 0, packages: 0, testimonials: 0, faqs: 0, bookings: 0, coupons: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations').then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/coupons?admin=true').then(r => r.json()),
    ]).then(([destinations, packages, testimonials, faqs, bookings, coupons]) => {
      setStats({
        destinations: Array.isArray(destinations) ? destinations.length : 0,
        packages: Array.isArray(packages) ? packages.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        faqs: Array.isArray(faqs) ? faqs.length : 0,
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        coupons: Array.isArray(coupons) ? coupons.length : 0
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Bookings', path: '/admin/bookings', count: stats.bookings, desc: 'View customer booking requests', icon: Calendar, highlight: true },
    { label: 'Destinations', path: '/admin/destinations', count: stats.destinations, desc: 'Manage destination catalog & images', icon: MapPin },
    { label: 'Packages', path: '/admin/packages', count: stats.packages, desc: 'Manage travel packages & pricing', icon: Package },
    { label: 'Coupons & Promos', path: '/admin/coupons', count: stats.coupons, desc: 'Manage discount vouchers & codes', icon: Ticket },
    { label: 'Testimonials', path: '/admin/testimonials', count: stats.testimonials, desc: 'Customer reviews & feedback', icon: MessageSquare },
    { label: 'FAQ', path: '/admin/faqs', count: stats.faqs, desc: 'Frequently asked questions', icon: HelpCircle },
    { label: 'Hero Section', path: '/admin/hero', count: null, desc: 'Edit hero headline, video & poster', icon: Sparkles },
    { label: 'Features', path: '/admin/features', count: null, desc: 'Edit Why Nova feature cards', icon: Layers },
    { label: 'How It Works', path: '/admin/how-it-works', count: null, desc: 'Edit how it works steps', icon: ListOrdered },
    { label: 'Settings', path: '/admin/settings', count: null, desc: 'Edit stats, partners & system configuration', icon: Settings },
  ]

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{todayDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard Overview</h1>
          <p className="text-neutral-500 text-xs mt-1">Manage content, view bookings, and update settings across NOVA.</p>
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-neutral-200/80 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.path}
                href={card.path}
                className={`bg-white rounded-xl p-5 border transition-all duration-200 group flex flex-col justify-between ${
                  card.highlight
                    ? 'border-neutral-900 shadow-xs ring-1 ring-neutral-900/5'
                    : 'border-neutral-200/80 hover:border-neutral-900 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">{card.label}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">{card.desc}</p>
                </div>

                {card.count !== null && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">TOTAL ITEMS</span>
                    <span className="text-lg font-bold text-neutral-900">{card.count}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

