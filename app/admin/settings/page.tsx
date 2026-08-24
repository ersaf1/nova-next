'use client'

import React, { useEffect, useState } from 'react'

interface Stat {
  statKey: string
  value: string
  label: string
  iconName: string | null
}

interface Partner {
  id: number
  name: string
  fontFamily: string
  fontWeight: number
  letterSpacing: string
  fontSize: string
  fontStyle?: string
  textTransform?: string
  sortOrder: number
  active: boolean
}

interface Backer {
  id: number
  name: string
  fontFamily: string
  fontWeight: number
  letterSpacing: string
  fontSize: string
  textTransform?: string
  sortOrder: number
  active: boolean
}

type Tab = 'stats' | 'partners' | 'backers'

export default function SettingsAdmin() {
  const [tab, setTab] = useState<Tab>('stats')
  const [stats, setStats] = useState<Stat[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [backers, setBackers] = useState<Backer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/partners').then(r => r.json()),
      fetch('/api/backers').then(r => r.json()),
    ]).then(([s, p, b]) => {
      setStats(Array.isArray(s) ? s : [])
      setPartners(Array.isArray(p) ? p : [])
      setBackers(Array.isArray(b) ? b : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const flash = (key: string) => {
    setSuccess(key)
    setTimeout(() => setSuccess(null), 3000)
  }

  const saveStat = async (stat: Stat) => {
    setSaving(stat.statKey)
    await fetch('/api/stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statKey: stat.statKey, value: stat.value, label: stat.label }),
    })
    setSaving(null)
    flash(stat.statKey)
  }

  const savePartner = async (partner: Partner) => {
    setSaving(`partner-${partner.id}`)
    await fetch(`/api/partners/${partner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    })
    setSaving(null)
    flash(`partner-${partner.id}`)
  }

  const saveBacker = async (backer: Backer) => {
    setSaving(`backer-${backer.id}`)
    await fetch(`/api/backers/${backer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backer),
    })
    setSaving(null)
    flash(`backer-${backer.id}`)
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Site Stats' },
    { key: 'partners', label: 'Hero Partners' },
    { key: 'backers', label: 'Backers' },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Edit site-wide stats, partner marquee, and backer marquee.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div className="flex flex-col gap-4">
          {stats.map(stat => (
            <div key={stat.statKey} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.statKey}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Value</label>
                  <input
                    value={stat.value}
                    onChange={e => setStats(prev => prev.map(s => s.statKey === stat.statKey ? { ...s, value: e.target.value } : s))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Label</label>
                  <input
                    value={stat.label}
                    onChange={e => setStats(prev => prev.map(s => s.statKey === stat.statKey ? { ...s, label: e.target.value } : s))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => saveStat(stat)}
                  disabled={saving === stat.statKey}
                  className="bg-brand text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {saving === stat.statKey ? 'Saving...' : 'Save'}
                </button>
                {success === stat.statKey && <span className="text-emerald-600 text-xs font-medium">Saved!</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partners Tab */}
      {tab === 'partners' && (
        <div className="flex flex-col gap-4">
          {partners.map(partner => (
            <div key={partner.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{partner.name}</p>
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={partner.active}
                    onChange={e => setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, active: e.target.checked } : p))}
                    className="rounded"
                  />
                  Active
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['name', 'fontFamily', 'fontSize', 'letterSpacing'] as const).map(field => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 capitalize">{field}</label>
                    <input
                      value={partner[field] as string}
                      onChange={e => setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, [field]: e.target.value } : p))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => savePartner(partner)}
                  disabled={saving === `partner-${partner.id}`}
                  className="bg-brand text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {saving === `partner-${partner.id}` ? 'Saving...' : 'Save'}
                </button>
                {success === `partner-${partner.id}` && <span className="text-emerald-600 text-xs font-medium">Saved!</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backers Tab */}
      {tab === 'backers' && (
        <div className="flex flex-col gap-4">
          {backers.map(backer => (
            <div key={backer.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{backer.name}</p>
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={backer.active}
                    onChange={e => setBackers(prev => prev.map(b => b.id === backer.id ? { ...b, active: e.target.checked } : b))}
                    className="rounded"
                  />
                  Active
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['name', 'fontFamily', 'fontSize', 'letterSpacing'] as const).map(field => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 capitalize">{field}</label>
                    <input
                      value={backer[field] as string}
                      onChange={e => setBackers(prev => prev.map(b => b.id === backer.id ? { ...b, [field]: e.target.value } : b))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => saveBacker(backer)}
                  disabled={saving === `backer-${backer.id}`}
                  className="bg-brand text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {saving === `backer-${backer.id}` ? 'Saving...' : 'Save'}
                </button>
                {success === `backer-${backer.id}` && <span className="text-emerald-600 text-xs font-medium">Saved!</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
