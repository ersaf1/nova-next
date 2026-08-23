'use client'

import React, { useEffect, useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Printer,
  CheckCircle2,
  Clock3,
  XCircle,
  BarChart2,
  Users,
} from 'lucide-react'

interface BookingReportItem {
  id: number
  name: string
  email: string
  phone: string
  packageName: string
  country: string
  travelDate: string
  participants: number
  status: string
  totalAmount: number
  createdAt: string
}

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<BookingReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'last30' | 'year'>('all')

  useEffect(() => {
    setLoading(true)
    fetch('/api/bookings')
      .then(r => r.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filter bookings based on date range
  const filteredBookings = bookings.filter(b => {
    if (dateFilter === 'all') return true
    const bookingDate = new Date(b.createdAt)
    const now = new Date()

    if (dateFilter === 'month') {
      return (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      )
    }

    if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
      return bookingDate >= thirtyDaysAgo
    }

    if (dateFilter === 'year') {
      return bookingDate.getFullYear() === now.getFullYear()
    }

    return true
  })

  // Financial & Performance Aggregations
  const confirmedList = filteredBookings.filter(b => b.status === 'confirmed')
  const pendingList = filteredBookings.filter(b => b.status === 'pending')
  const cancelledList = filteredBookings.filter(b => b.status === 'cancelled')

  const totalOmset = filteredBookings.reduce((sum, b) => {
    if (b.status === 'cancelled') return sum
    return sum + (b.totalAmount || (b.participants * 12500000))
  }, 0)

  const totalPax = filteredBookings.reduce((sum, b) => (b.status !== 'cancelled' ? sum + (b.participants || 1) : sum), 0)
  const avgOrderValue = filteredBookings.length > 0 ? totalOmset / (confirmedList.length || 1) : 0

  // 1-Click Export CSV Helper
  const exportToCSV = () => {
    if (filteredBookings.length === 0) return

    const headers = ['ID Booking', 'Nama Pemesan', 'Email', 'No Telp', 'Paket Wisata', 'Negara', 'Tgl Travel', 'Peserta', 'Status', 'Total Biaya (IDR)', 'Tgl Transaksi']
    const rows = filteredBookings.map(b => [
      b.id,
      `"${b.name}"`,
      b.email,
      b.phone,
      `"${b.packageName}"`,
      b.country || '-',
      b.travelDate || '-',
      b.participants,
      b.status,
      b.totalAmount || (b.participants * 12500000),
      new Date(b.createdAt).toLocaleDateString('id-ID')
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `laporan-booking-nova-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pusat Laporan & Ekspor Data</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Laporan Transaksi & Omset</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Analisis performa keuangan, filter rentang tanggal, & ekspor data ke Excel/CSV.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 font-semibold text-xs transition-all hover:bg-zinc-100 flex items-center gap-2 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-zinc-600" />
            <span>Cetak Laporan</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs transition-all hover:bg-zinc-800 flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export to CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Tabs */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-1.5 bg-zinc-200/60 p-1 rounded-xl border border-zinc-200/80">
          {[
            { id: 'all', label: 'Semua Waktu' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'last30', label: '30 Hari Terakhir' },
            { id: 'year', label: 'Tahun Ini' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === tab.id
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Menampilkan <strong>{filteredBookings.length}</strong> entri transaksi
        </span>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Omset Bruto</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-zinc-900 tracking-tight">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalOmset)}
          </p>
          <p className="text-[11px] text-zinc-500">Omset terakumulasi</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Peserta Perjalanan</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalPax} Pax</p>
          <p className="text-[11px] text-zinc-500">Traveler tersalurkan</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Rata-rata Nilai Order</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-zinc-900 tracking-tight">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(avgOrderValue)}
          </p>
          <p className="text-[11px] text-zinc-500">Per booking terkonfirmasi</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Success Rate Booking</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {filteredBookings.length > 0 ? Math.round((confirmedList.length / filteredBookings.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-zinc-500">{confirmedList.length} dari {filteredBookings.length} booking</p>
        </div>
      </div>

      {/* Printable Report Data Sheet */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-zinc-900">Rincian Lembar Laporan Booking</h3>
          <span className="text-[11px] text-zinc-500">Format Resmi Laporan Keuangan</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">
            Memuat data laporan...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            Tidak ada transaksi pada periode yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-100/80 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">Paket Wisata</th>
                  <th className="px-4 py-3">Tgl Travel</th>
                  <th className="px-4 py-3 text-center">Pax</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-zinc-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">#{b.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-zinc-900">{b.name}</p>
                      <p className="text-[10px] text-zinc-400">{b.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800">{b.packageName}</td>
                    <td className="px-4 py-3 text-zinc-600">{b.travelDate || '-'}</td>
                    <td className="px-4 py-3 text-center font-bold">{b.participants}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize border ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                        b.totalAmount || (b.participants * 12500000)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
