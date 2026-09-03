'use client'

import React, { useEffect, useState } from 'react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { adminFetch } from '@/lib/admin-client'

interface Feature {
  id: number
  title: string
  stat: string
  statLabel: string
  iconName: string
  image: string
  sortOrder: number
  active: boolean
}

const ICON_OPTIONS = ['Zap', 'Shield', 'Headphones', 'CreditCard', 'Globe', 'Star', 'Heart', 'Award']

export default function FeaturesAdmin() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [success, setSuccess] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ title: '', stat: '', statLabel: '', iconName: 'Zap', image: '', sortOrder: 0, active: true })

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then((data: Feature[]) => { if (Array.isArray(data)) setFeatures(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const flash = (id: number) => { setSuccess(id); setTimeout(() => setSuccess(null), 3000) }

  const saveFeature = async (feature: Feature) => {
    setSaving(feature.id)
    try {
      const res = await adminFetch(`/api/features/${feature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert('Gagal menyimpan fitur: ' + (err.error || err.message || res.statusText))
        return
      }
      flash(feature.id)
    } catch (err: unknown) {
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(null)
    }
  }

  const deleteFeature = async (id: number) => {
    if (!confirm('Yakin ingin menghapus fitur ini?')) return
    try {
      const res = await adminFetch(`/api/features/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert('Gagal menghapus fitur: ' + (err.error || err.message || res.statusText))
        return
      }
      setFeatures(prev => prev.filter(f => f.id !== id))
    } catch (err: unknown) {
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const addFeature = async () => {
    setAdding(true)
    try {
      const res = await adminFetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert('Gagal menambah fitur: ' + (err.error || err.message || res.statusText))
        return
      }
      const created = await res.json()
      setFeatures(prev => [...prev, created])
      setNewForm({ title: '', stat: '', statLabel: '', iconName: 'Zap', image: '', sortOrder: 0, active: true })
    } catch (err: unknown) {
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Why Nova — Features</h1>
      <p className="text-gray-500 text-sm mb-8">Manage the feature cards shown in the "Why Nova" section.</p>

      <div className="flex flex-col gap-4 mb-8">
        {features.map(feature => (
          <div key={feature.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">{feature.title}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={feature.active}
                    onChange={e => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, active: e.target.checked } : f))}
                    className="rounded"
                  />
                  Active
                </label>
                <button onClick={() => deleteFeature(feature.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Title</label>
                <input value={feature.title} onChange={e => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, title: e.target.value } : f))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Icon</label>
                <select value={feature.iconName} onChange={e => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, iconName: e.target.value } : f))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Stat</label>
                <input value={feature.stat} onChange={e => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, stat: e.target.value } : f))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Stat Label</label>
                <input value={feature.statLabel} onChange={e => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, statLabel: e.target.value } : f))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="col-span-2">
                <ImageUploadField
                  label="Foto Fitur"
                  value={feature.image}
                  onChange={url => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, image: url } : f))}
                  aspectRatio="wide"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Sort Order</label>
                <input type="number" value={feature.sortOrder} onChange={e => setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, sortOrder: Number(e.target.value) } : f))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => saveFeature(feature)} disabled={saving === feature.id} className="bg-brand text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">
                {saving === feature.id ? 'Saving...' : 'Save'}
              </button>
              {success === feature.id && <span className="text-emerald-600 text-xs font-medium">Saved!</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Add New */}
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Add New Feature</p>
        <div className="grid grid-cols-2 gap-3">
          {(['title', 'stat', 'statLabel'] as const).map(field => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 capitalize">{field}</label>
              <input value={newForm[field]} onChange={e => setNewForm(prev => ({ ...prev, [field]: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Icon</label>
            <select value={newForm.iconName} onChange={e => setNewForm(prev => ({ ...prev, iconName: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
              {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <ImageUploadField
              label="Foto Fitur Baru"
              value={newForm.image}
              onChange={url => setNewForm(prev => ({ ...prev, image: url }))}
              aspectRatio="wide"
            />
          </div>
        </div>
        <button onClick={addFeature} disabled={adding || !newForm.title} className="bg-brand text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors w-fit">
          {adding ? 'Adding...' : '+ Add Feature'}
        </button>
      </div>
    </div>
  )
}
