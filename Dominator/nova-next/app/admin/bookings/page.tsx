'use client'

import React, { useEffect, useState } from 'react'

interface Booking {
  id: number; packageId: number; packageName: string; country: string
  name: string; email: string; phone: string; travelDate: string
  participants: number; notes?: string; status: string; createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function BookingsAdmin() {
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => fetch('/api/bookings').then(r => r.json()).then((data: Booking[]) => { setItems(data); setLoading(false) }).catch(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus booking ini?')) return
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Bookings</h1><p className="text-sm text-gray-500 mt-1">{items.length} total booking</p></div>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">Memuat data...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">Belum ada booking masuk.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Nama', 'Kontak', 'Paket', 'Tanggal', 'Peserta', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">#{item.id} · {new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-4 py-3.5"><p className="text-gray-700">{item.email}</p><p className="text-xs text-gray-400 mt-0.5">{item.phone}</p></td>
                    <td className="px-4 py-3.5"><p className="font-medium text-gray-900">{item.packageName}</p><p className="text-xs text-gray-400 mt-0.5">{item.country}</p></td>
                    <td className="px-4 py-3.5 text-gray-700">{item.travelDate}</td>
                    <td className="px-4 py-3.5 text-gray-700">{item.participants} orang</td>
                    <td className="px-4 py-3.5">
                      <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)} className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10 ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
