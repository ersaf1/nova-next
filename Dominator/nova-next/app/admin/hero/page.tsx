'use client'

import React, { useEffect, useState } from 'react'

interface Hero {
  id: number
  headline: string
  subheadline: string
  badgeText: string
  videoUrl: string
  posterUrl: string
}

export default function HeroAdmin() {
  const [form, setForm] = useState<Omit<Hero, 'id'>>({ headline: '', subheadline: '', badgeText: '', videoUrl: '', posterUrl: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/hero').then(r => r.json()).then((data: Hero) => {
      setForm({ headline: data.headline, subheadline: data.subheadline, badgeText: data.badgeText, videoUrl: data.videoUrl, posterUrl: data.posterUrl })
      setLoading(false)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Hero Section</h1>
      <p className="text-gray-500 text-sm mb-8">Edit the hero banner content and video.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
        {[
          { name: 'badgeText', label: 'Badge Text', type: 'input' },
          { name: 'headline', label: 'Headline', type: 'textarea' },
          { name: 'subheadline', label: 'Subheadline', type: 'textarea' },
          { name: 'videoUrl', label: 'Video URL', type: 'input' },
          { name: 'posterUrl', label: 'Poster URL', type: 'input' },
        ].map(field => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea name={field.name} value={form[field.name as keyof typeof form]} onChange={handleChange} rows={3} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
            ) : (
              <input name={field.name} value={form[field.name as keyof typeof form]} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            )}
          </div>
        ))}
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {success && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
