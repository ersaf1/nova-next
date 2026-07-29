'use client'

import React, { useEffect, useState } from 'react'

interface Step {
  id: number
  number: string
  title: string
  caption: string
  iconName: string
  image: string
  sortOrder: number
  active: boolean
}

const ICON_OPTIONS = ['Search', 'BookOpen', 'Compass', 'Map', 'Globe', 'Plane', 'Star', 'Heart']

export default function HowItWorksAdmin() {
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [success, setSuccess] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ number: '', title: '', caption: '', iconName: 'Search', image: '', sortOrder: 0, active: true })

  useEffect(() => {
    fetch('/api/how-it-works')
      .then(r => r.json())
      .then((data: Step[]) => { if (Array.isArray(data)) setSteps(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const flash = (id: number) => { setSuccess(id); setTimeout(() => setSuccess(null), 3000) }

  const saveStep = async (step: Step) => {
    setSaving(step.id)
    await fetch(`/api/how-it-works/${step.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(step),
    })
    setSaving(null)
    flash(step.id)
  }

  const deleteStep = async (id: number) => {
    if (!confirm('Delete this step?')) return
    await fetch(`/api/how-it-works/${id}`, { method: 'DELETE' })
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  const addStep = async () => {
    setAdding(true)
    const res = await fetch('/api/how-it-works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    const created = await res.json()
    setSteps(prev => [...prev, created])
    setNewForm({ number: '', title: '', caption: '', iconName: 'Search', image: '', sortOrder: 0, active: true })
    setAdding(false)
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">How It Works</h1>
      <p className="text-gray-500 text-sm mb-8">Manage the steps shown in the "How It Works" section.</p>

      <div className="flex flex-col gap-4 mb-8">
        {steps.map(step => (
          <div key={step.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Step {step.number} — {step.title}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={step.active}
                    onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, active: e.target.checked } : s))}
                    className="rounded"
                  />
                  Active
                </label>
                <button onClick={() => deleteStep(step.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Step Number</label>
                <input value={step.number} onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, number: e.target.value } : s))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Icon</label>
                <select value={step.iconName} onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, iconName: e.target.value } : s))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Title</label>
                <input value={step.title} onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Sort Order</label>
                <input type="number" value={step.sortOrder} onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, sortOrder: Number(e.target.value) } : s))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-xs font-medium text-gray-600">Caption</label>
                <input value={step.caption} onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, caption: e.target.value } : s))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-xs font-medium text-gray-600">Image URL</label>
                <input value={step.image} onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, image: e.target.value } : s))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => saveStep(step)} disabled={saving === step.id} className="bg-black text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {saving === step.id ? 'Saving...' : 'Save'}
              </button>
              {success === step.id && <span className="text-emerald-600 text-xs font-medium">Saved!</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Add New */}
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Add New Step</p>
        <div className="grid grid-cols-2 gap-3">
          {(['number', 'title', 'caption', 'image'] as const).map(field => (
            <div key={field} className={`flex flex-col gap-1 ${field === 'caption' || field === 'image' ? 'col-span-2' : ''}`}>
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
        </div>
        <button onClick={addStep} disabled={adding || !newForm.title} className="bg-black text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors w-fit">
          {adding ? 'Adding...' : '+ Add Step'}
        </button>
      </div>
    </div>
  )
}
