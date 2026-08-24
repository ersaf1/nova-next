'use client'

import React, { useEffect, useState } from 'react'

interface Testimonial {
  id: number; name: string; location: string; avatar: string; rating: number; text: string; trip: string
}
const empty: Omit<Testimonial, 'id'> = { name: '', location: '', avatar: '', rating: 5, text: '', trip: '' }

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/testimonials').then(r => r.json()).then((data: Testimonial[]) => { setItems(data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (item: Testimonial) => { setEditing(item); setForm({ name: item.name, location: item.location, avatar: item.avatar, rating: item.rating, text: item.text, trip: item.trip }); setShowModal(true) }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.name === 'rating' ? parseInt(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    if (editing) {
      await fetch(`/api/testimonials/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setShowModal(false); load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 mb-1">Testimonials</h1><p className="text-gray-500 text-sm">{items.length} testimonials</p></div>
        <button onClick={openCreate} className="bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors">+ Add Testimonial</button>
      </div>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Name', 'Location', 'Trip', 'Rating', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.location}</td>
                  <td className="px-4 py-3 text-gray-500">{item.trip}</td>
                  <td className="px-4 py-3 text-gray-500">{item.rating}/5</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => openEdit(item)} className="text-xs text-gray-500 hover:text-black font-medium">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[['name','Name'],['location','Location'],['avatar','Avatar URL'],['trip','Trip']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input name={name} value={(form as Record<string, unknown>)[name] as string ?? ''} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Text</label>
                <textarea name="text" value={form.text} onChange={handleChange} required rows={4} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Rating (1–5)</label>
                <input name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Testimonial'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
