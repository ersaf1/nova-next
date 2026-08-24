'use client'

import React, { useEffect, useState } from 'react'

interface FAQ { id: number; q: string; a: string }
const empty: Omit<FAQ, 'id'> = { q: '', a: '' }

export default function FAQAdmin() {
  const [items, setItems] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/faqs').then(r => r.json()).then((data: FAQ[]) => { setItems(data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (item: FAQ) => { setEditing(item); setForm({ q: item.q, a: item.a }); setShowModal(true) }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    if (editing) {
      await fetch(`/api/faqs/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setShowModal(false); load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return
    await fetch(`/api/faqs/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 mb-1">FAQ</h1><p className="text-gray-500 text-sm">{items.length} items</p></div>
        <button onClick={openCreate} className="bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors">+ Add FAQ</button>
      </div>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Question</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Answer</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium max-w-xs truncate">{item.q}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-sm truncate">{item.a}</td>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Question</label>
                <input name="q" value={form.q} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Answer</label>
                <textarea name="a" value={form.a} onChange={handleChange} required rows={5} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add FAQ'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
