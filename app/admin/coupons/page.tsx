'use client'

import React, { useEffect, useState } from 'react'

interface Coupon {
  id: number
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_amount: number
  max_uses: number
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

interface CouponFormState {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_amount: number
  max_uses: number
  expires_at: string
  is_active: boolean
}

const empty: CouponFormState = {
  code: '',
  discount_type: 'percent',
  discount_value: 10,
  min_amount: 0,
  max_uses: 100,
  expires_at: '',
  is_active: true,
}

export default function CouponAdmin() {
  const [items, setItems] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/coupons?admin=true')
      .then((r) => r.json())
      .then((data: Coupon[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      code: '',
      discount_type: 'percent',
      discount_value: 10,
      min_amount: 0,
      max_uses: 100,
      expires_at: '',
      is_active: true,
    })
    setErrorMsg('')
    setShowModal(true)
  }

  const openEdit = (item: Coupon) => {
    setEditing(item)
    setForm({
      code: item.code,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      min_amount: item.min_amount,
      max_uses: item.max_uses,
      expires_at: item.expires_at ? new Date(item.expires_at).toISOString().split('T')[0] : '',
      is_active: item.is_active,
    })
    setErrorMsg('')
    setShowModal(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    let val: string | number | boolean = value

    if (type === 'number') {
      val = value === '' ? 0 : Number(value)
    } else if (name === 'is_active') {
      val = value === 'true'
    }

    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')

    const payload = {
      ...form,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    }

    try {
      let res
      if (editing) {
        res = await fetch(`/api/coupons/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save coupon')
      }

      setShowModal(false)
      load()
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete coupon')
      }
      load()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Coupon & Promo Management</h1>
          <p className="text-gray-500 text-sm">{items.length} coupons configured</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors"
        >
          + Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Code', 'Discount Type', 'Value', 'Min Purchase', 'Usage (Used/Max)', 'Status', 'Expires At', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No coupons found. Click "+ Add Coupon" to create one.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isExpired = item.expires_at && new Date(item.expires_at) < new Date()
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        <span className="bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded text-xs tracking-wider border border-neutral-200">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{item.discount_type}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.discount_type === 'percent'
                          ? `${item.discount_value}%`
                          : `Rp ${item.discount_value.toLocaleString('id-ID')}`}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        Rp {item.min_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.used_count} / {item.max_uses}
                      </td>
                      <td className="px-4 py-3">
                        {isExpired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : item.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.expires_at
                          ? new Date(item.expires_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3 flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs text-gray-500 hover:text-black font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editing ? 'Edit Coupon Code' : 'Create New Coupon'}
            </h2>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Promo Code</label>
                <input
                  name="code"
                  required
                  placeholder="E.g., PROMO10"
                  value={form.code}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Discount Type</label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (IDR)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Discount Value</label>
                  <input
                    name="discount_value"
                    type="number"
                    min="0"
                    required
                    value={form.discount_value}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Min Purchase (IDR)</label>
                  <input
                    name="min_amount"
                    type="number"
                    min="0"
                    value={form.min_amount}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Max Usage Count</label>
                  <input
                    name="max_uses"
                    type="number"
                    min="1"
                    value={form.max_uses}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Expires At (Optional)</label>
                  <input
                    name="expires_at"
                    type="date"
                    value={form.expires_at}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Active Status</label>
                  <select
                    name="is_active"
                    value={form.is_active ? 'true' : 'false'}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
