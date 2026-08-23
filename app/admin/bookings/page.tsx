'use client'

import React, { useEffect, useState } from 'react'
import {
  Calendar,
  User,
  Mail,
  Phone,
  Package,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock3,
  ExternalLink,
  MessageSquare,
  FileText,
  Printer,
  X
} from 'lucide-react'
import EInvoiceModal from '@/components/EInvoiceModal'

interface Booking {
  id: number
  packageId: number
  packageName: string
  country: string
  name: string
  email: string
  phone: string
  travelDate: string
  participants: number
  notes?: string
  status: string
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80', icon: Clock3 },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80', icon: XCircle },
}

export default function BookingsAdmin() {
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/bookings')
      .then(r => r.json())
      .then((data: Booking[]) => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status } : null)
      }
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('Apakah Anda yakin ingin menghapus booking ini?')) return
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(null)
      }
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase()) ||
      item.packageName.toLowerCase().includes(search.toLowerCase()) ||
      item.country.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>Booking Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">User Bookings</h1>
          <p className="text-neutral-500 text-xs mt-1">View customer details, manage travel booking statuses, and contact clients.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 shadow-2xs">
            {items.length} Total Bookings
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari pemesan, email, paket..."
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl w-full sm:w-auto border border-neutral-200/60 overflow-x-auto">
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'pending', label: `Pending (${items.filter(i => i.status === 'pending').length})` },
            { id: 'confirmed', label: `Confirmed (${items.filter(i => i.status === 'confirmed').length})` },
            { id: 'cancelled', label: `Cancelled (${items.filter(i => i.status === 'cancelled').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center text-xs text-neutral-400 animate-pulse">
          Memuat data booking...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center space-y-2">
          <Calendar className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm font-semibold text-neutral-700">Tidak ada data booking yang sesuai.</p>
          <p className="text-xs text-neutral-400">Coba ubah kata kunci pencarian atau filter status.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/80 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">Pemesan / ID</th>
                  <th className="px-5 py-3.5">Kontak User</th>
                  <th className="px-5 py-3.5">Paket Wisata</th>
                  <th className="px-5 py-3.5">Tgl Travel</th>
                  <th className="px-5 py-3.5">Peserta</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.map(item => {
                  const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
                  const StatusIcon = statusConf.icon

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedBooking(item)}
                      className="hover:bg-neutral-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-xs group-hover:text-neutral-950 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              ID #{item.id} · {new Date(item.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="text-neutral-800 font-medium">{item.email}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{item.phone}</p>
                      </td>

                      {/* Package */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-900">{item.packageName}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          {item.country}
                        </p>
                      </td>

                      {/* Travel Date */}
                      <td className="px-5 py-4 text-neutral-700 font-medium">
                        {item.travelDate}
                      </td>

                      {/* Participants */}
                      <td className="px-5 py-4 text-neutral-700 font-medium">
                        {item.participants} Orang
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value)}
                          className={`text-[11px] font-semibold px-3 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setInvoiceBooking(item)
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200/80 font-semibold text-[11px] transition-all flex items-center gap-1"
                            title="Cetak E-Tiket & Invoice PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Tiket</span>
                          </button>
                          <button
                            onClick={() => setSelectedBooking(item)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 font-semibold text-[11px] transition-all flex items-center gap-1"
                          >
                            <span>Detail User</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Hapus Booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xl max-w-xl w-full overflow-hidden space-y-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold text-sm">
                  {selectedBooking.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">{selectedBooking.name}</h3>
                  <p className="text-xs text-neutral-400">Booking ID #{selectedBooking.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Status & Quick Contact */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Status Booking
                  </span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const conf = STATUS_CONFIG[selectedBooking.status] || STATUS_CONFIG.pending
                      const Icon = conf.icon
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${conf.bg} ${conf.text} ${conf.border}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{conf.label}</span>
                        </span>
                      )
                    })()}
                  </div>
                </div>

                {/* Quick actions: Email & Phone */}
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedBooking.email}`}
                    className="px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-900 hover:text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email User</span>
                  </a>
                  <a
                    href={`tel:${selectedBooking.phone}`}
                    className="px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-900 hover:text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call User</span>
                  </a>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  Informasi Lengkap Pengguna
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Nama Pemesan</span>
                    <p className="text-neutral-900 font-semibold text-xs">{selectedBooking.name}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Email Client</span>
                    <p className="text-neutral-900 font-semibold text-xs">{selectedBooking.email}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Nomor Telepon</span>
                    <p className="text-neutral-900 font-semibold text-xs">{selectedBooking.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Waktu Pemesanan</span>
                    <p className="text-neutral-900 font-semibold text-xs">
                      {new Date(selectedBooking.createdAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Package Details */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                  <Package className="w-3.5 h-3.5 text-neutral-500" />
                  Rincian Paket & Perjalanan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Nama Paket Wisata</span>
                    <p className="text-neutral-900 font-semibold text-xs">{selectedBooking.packageName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Destinasi / Negara</span>
                    <p className="text-neutral-900 font-semibold text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedBooking.country}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Tanggal Berangkat</span>
                    <p className="text-neutral-900 font-semibold text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedBooking.travelDate}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">Jumlah Peserta</span>
                    <p className="text-neutral-900 font-semibold text-xs flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedBooking.participants} Orang
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requests / Notes */}
              {selectedBooking.notes && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <span className="text-neutral-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                    Catatan Khusus Pengguna
                  </span>
                  <div className="p-3 bg-neutral-50 border border-neutral-200/60 rounded-xl text-neutral-700 leading-relaxed italic text-xs">
                    "{selectedBooking.notes}"
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-neutral-500">Ubah Status:</span>
                {['pending', 'confirmed', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedBooking.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all capitalize ${
                      selectedBooking.status === st
                        ? 'bg-neutral-950 text-white'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleDelete(selectedBooking.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable E-Invoice & E-Tiket Modal */}
      {invoiceBooking && (
        <EInvoiceModal
          booking={invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      )}
    </div>
  )
}
