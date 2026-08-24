'use client'

import React, { useEffect, useState } from 'react'
import { formatIDR, getDepartureStatusColor, getDepartureStatusLabel } from '@/lib/types'
import type { PackageDeparture } from '@/lib/types'

interface Package {
  id: number
  title: string
}

type DepartureForm = {
  startDate: string
  endDate: string
  capacity: number
  price: number
  status: PackageDeparture['status']
}

const emptyForm: DepartureForm = {
  startDate: '',
  endDate: '',
  capacity: 20,
  price: 0,
  status: 'available',
}

export default function DeparturesAdmin() {
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [departures, setDepartures] = useState<PackageDeparture[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PackageDeparture | null>(null)
  const [form, setForm] = useState<DepartureForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Load packages list
  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then((data: Package[]) => setPackages(data))
      .catch(() => {})
  }, [])

  // Load departures when package selected
  useEffect(() => {
    if (!selectedPackageId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDepartures([])
      return
    }
    setLoading(true)
    fetch(`/api/packages/${selectedPackageId}/departures?all=1`)
      .then(r => r.json())
      .then((data: PackageDeparture[]) => { setDepartures(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedPackageId])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (dep: PackageDeparture) => {
    setEditing(dep)
    setForm({
      startDate: dep.startDate,
      endDate: dep.endDate,
      capacity: dep.capacity,
      price: dep.price,
      status: dep.status,
    })
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'price' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackageId) return
    setSaving(true)
    try {
      if (editing) {
        const res = await fetch(`/api/packages/${selectedPackageId}/departures/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to update')
        showToast('Jadwal keberangkatan diperbarui')
      } else {
        const res = await fetch(`/api/packages/${selectedPackageId}/departures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to create')
        showToast('Jadwal keberangkatan ditambahkan')
      }
      setShowModal(false)
      // Reload departures
      const data = await fetch(`/api/packages/${selectedPackageId}/departures?all=1`).then(r => r.json())
      setDepartures(data)
    } catch {
      showToast('Gagal menyimpan perubahan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!selectedPackageId) return
    try {
      const res = await fetch(`/api/packages/${selectedPackageId}/departures/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      showToast('Jadwal keberangkatan dihapus')
      setDepartures(prev => prev.filter(d => d.id !== id))
    } catch {
      showToast('Gagal menghapus', 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jadwal Keberangkatan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola jadwal keberangkatan per paket wisata</p>
        </div>
      </div>

      {/* Package selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Paket</label>
        <select
          value={selectedPackageId ?? ''}
          onChange={e => setSelectedPackageId(e.target.value ? Number(e.target.value) : null)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-full max-w-sm"
        >
          <option value="">-- Pilih paket --</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
          ))}
        </select>
      </div>

      {selectedPackageId && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{departures.length} jadwal ditemukan</p>
            <button
              onClick={openCreate}
              className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
            >
              + Tambah Jadwal
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : departures.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              Belum ada jadwal keberangkatan untuk paket ini.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal Mulai</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal Selesai</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Kapasitas</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sisa Slot</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Harga</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {departures.map(dep => (
                    <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-800">{formatDate(dep.startDate)}</td>
                      <td className="px-4 py-3 text-gray-800">{formatDate(dep.endDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{dep.capacity}</td>
                      <td className="px-4 py-3 text-gray-600">{dep.remainingSlots}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{formatIDR(dep.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getDepartureStatusColor(dep.status)}`}>
                          {getDepartureStatusLabel(dep.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(dep)}
                            className="text-xs text-gray-600 hover:text-black border border-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          {deleteConfirm === dep.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(dep.id)}
                                className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(dep.id)}
                              className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              {editing ? 'Edit Jadwal Keberangkatan' : 'Tambah Jadwal Keberangkatan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Tanggal Selesai</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Kapasitas</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    min={1}
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Harga (IDR)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min={0}
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="available">Tersedia</option>
                  <option value="limited">Slot Terbatas</option>
                  <option value="sold_out">Habis Terjual</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
