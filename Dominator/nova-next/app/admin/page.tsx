'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  destinations: number
  packages: number
  testimonials: number
  faqs: number
  bookings: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ destinations: 0, packages: 0, testimonials: 0, faqs: 0, bookings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations').then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
    ]).then(([destinations, packages, testimonials, faqs, bookings]) => {
      setStats({ destinations: destinations.length, packages: packages.length, testimonials: testimonials.length, faqs: faqs.length, bookings: bookings.length })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Hero', path: '/admin/hero', count: null, desc: 'Edit headline, video, poster' },
    { label: 'Destinations', path: '/admin/destinations', count: stats.destinations, desc: 'Manage destination cards' },
    { label: 'Packages', path: '/admin/packages', count: stats.packages, desc: 'Manage travel packages' },
    { label: 'Testimonials', path: '/admin/testimonials', count: stats.testimonials, desc: 'Manage customer reviews' },
    { label: 'FAQ', path: '/admin/faqs', count: stats.faqs, desc: 'Manage FAQ items' },
    { label: 'Bookings', path: '/admin/bookings', count: stats.bookings, desc: 'View booking requests' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Manage all content on the NOVA landing page.</p>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link key={card.path} href={card.path} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-black hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-base font-semibold text-gray-900 group-hover:text-black">{card.label}</span>
                {card.count !== null && <span className="text-2xl font-bold text-black">{card.count}</span>}
              </div>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
