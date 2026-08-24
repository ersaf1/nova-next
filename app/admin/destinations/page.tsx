'use client'

import React, { useEffect, useState } from 'react'

interface Destination {
  id: number; city: string; country: string; tagline: string
  price: string; image: string; tag: string | null; rating: number; duration: string
}
const empty: Omit<Destination, 'id'> = { city: '', country: '', tagline: '', price: '', image: '', tag: '', rating: 4.5, duration: '' }

export default function DestinationsAdmin() {
  const [items, setItems] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Destination | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/destinations').then(r => r.json()).then((data: Destination[]) => { setItems(data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (item: Destination) => { setEditing(item); setForm({ city: item.city, country: item.country, tagline: item.tagline, price: item.price, image: item.image, tag: item.tag, rating: item.rating, duration: item.duration }); setShowModal(true) }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.name === 'rating' ? parseFloat(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const body = { ...form, tag: form.tag || null }
    if (editing) {
      await fetch(`/api/destinations/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/destinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false); setShowModal(false); load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this destination?')) return
    await fetch(`/api/destinations/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 mb-1">Destinations</h1><p className="text-gray-500 text-sm">{items.length} destinations</p></div>
        <button onClick={openCreate} className="bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors">+ Add Destination</button>
      </div>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['City', 'Country', 'Price', 'Rating', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.city}</td>
                  <td className="px-4 py-3 text-gray-500">{item.country}</td>
                  <td className="px-4 py-3 text-gray-500">{item.price}</td>
                  <td className="px-4 py-3 text-gray-500">{item.rating}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="text-xs text-gray-500 hover:text-black font-medium">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    </div>
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
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Edit Destination' : 'Add Destination'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[['city','City'],['country','Country'],['tagline','Tagline'],['price','Price'],['image','Image URL'],['tag','Tag (optional)'],['duration','Duration']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input name={name} value={(form as Record<string, unknown>)[name] as string ?? ''} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Destination'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
