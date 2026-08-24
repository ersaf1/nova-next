'use client'

import React, { useEffect, useState } from 'react'

interface Package {
  id: number; tag: string; tagColor: string; title: string; subtitle: string
  image: string; price: number; originalPrice: number; duration: string
  groupSize: string; rating: number; reviews: number; includes: string[]
  highlight: string; category: string
}
const empty: Omit<Package, 'id'> = {
  tag: '', tagColor: 'bg-brand text-white', title: '', subtitle: '', image: '',
  price: 0, originalPrice: 0, duration: '', groupSize: '', rating: 4.5,
  reviews: 0, includes: [], highlight: '', category: '',
}

export default function PackagesAdmin() {
  const [items, setItems] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Package | null>(null)
  const [form, setForm] = useState(empty)
  const [includesStr, setIncludesStr] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/packages').then(r => r.json()).then((data: Package[]) => { setItems(data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setIncludesStr(''); setShowModal(true) }
  const openEdit = (item: Package) => {
    setEditing(item)
    setForm({ tag: item.tag, tagColor: item.tagColor, title: item.title, subtitle: item.subtitle, image: item.image, price: item.price, originalPrice: item.originalPrice, duration: item.duration, groupSize: item.groupSize, rating: item.rating, reviews: item.reviews, includes: item.includes, highlight: item.highlight, category: item.category })
    setIncludesStr(item.includes.join(', '))
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = ['price', 'originalPrice', 'reviews'].includes(e.target.name)
      ? parseInt(e.target.value) : e.target.name === 'rating' ? parseFloat(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const body = { ...form, includes: includesStr.split(',').map(s => s.trim()).filter(Boolean) }
    if (editing) {
      await fetch(`/api/packages/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false); setShowModal(false); load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return
    await fetch(`/api/packages/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 mb-1">Packages</h1><p className="text-gray-500 text-sm">{items.length} packages</p></div>
        <button onClick={openCreate} className="bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors">+ Add Package</button>
      </div>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Title', 'Category', 'Price', 'Rating', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-gray-500">${item.price.toLocaleString()}</td>
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
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Edit Package' : 'Add Package'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[['tag','Tag'],['tagColor','Tag Color (Tailwind)'],['title','Title'],['subtitle','Subtitle'],['image','Image URL'],['duration','Duration'],['groupSize','Group Size'],['highlight','Highlight'],['category','Category']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input name={name} value={(form as Record<string, unknown>)[name] as string ?? ''} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              ))}
              {[['price','Price'],['originalPrice','Original Price'],['reviews','Reviews']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input name={name} type="number" value={(form as Record<string, unknown>)[name] as number ?? 0} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Includes (pisah koma)</label>
                <input value={includesStr} onChange={e => setIncludesStr(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Package'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
