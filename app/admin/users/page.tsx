'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  Search,
  ShieldCheck,
  Crown,
  UserCheck,
  Calendar,
  DollarSign,
  Package,
  Mail,
  Phone,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react'

interface UserBooking {
  id: number
  packageName: string
  travelDate: string
  participants: number
  status: string
  totalAmount: number
  createdAt: string
}

interface UserAccount {
  id: string
  email: string
  name: string
  role: 'user' | 'booking_officer' | 'admin' | 'super_admin'
  createdAt: string
  phone: string
  totalBookings: number
  totalSpent: number
  bookings: UserBooking[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [updatingRole, setUpdatingRole] = useState(false)

  const loadUsers = () => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(true)
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole as any } : null)
      }
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setUpdatingRole(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const totalBookers = users.filter(u => u.totalBookings > 0).length
  const totalSuperAdmins = users.filter(u => u.role === 'super_admin' || u.role === 'admin').length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>User Management Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kelola Pengguna</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Daftar akun terdaftar, riwayat transaksi booking per user, dan pengelolaan role.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 font-semibold bg-white px-3.5 py-1.5 rounded-full border border-zinc-200 shadow-2xs">
            {users.length} Total Akun
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Akun Terdaftar</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{users.length}</p>
          <p className="text-[11px] text-zinc-500">Pengguna terdaftar di platform</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">User Pernah Booking</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalBookers}</p>
          <p className="text-[11px] text-zinc-500">
            {Math.round((totalBookers / (users.length || 1)) * 100)}% dari total pengguna
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Tim Admin & Staff</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalSuperAdmins}</p>
          <p className="text-[11px] text-zinc-500">Memiliki akses manajemen admin</p>
        </div>
      </div>

      {/* Toolbar: Search & Role Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, no HP..."
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-200/60 p-1 rounded-xl border border-zinc-200/80">
          {[
            { id: 'all', label: `Semua (${users.length})` },
            { id: 'user', label: `Customer (${users.filter(u => u.role === 'user').length})` },
            { id: 'booking_officer', label: `Staff Booking (${users.filter(u => u.role === 'booking_officer').length})` },
            { id: 'admin', label: `Admin (${users.filter(u => u.role === 'admin' || u.role === 'super_admin').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === tab.id
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-xs text-zinc-400 animate-pulse">
          Memuat daftar pengguna...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-2">
          <Users className="w-8 h-8 text-zinc-300 mx-auto" />
          <p className="text-sm font-semibold text-zinc-700">Tidak ada pengguna ditemukan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">Pengguna</th>
                  <th className="px-5 py-3.5">Kontak</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Total Booking</th>
                  <th className="px-5 py-3.5">Total Pengeluaran</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map(u => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-zinc-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{u.name}</p>
                          <p className="text-[10px] text-zinc-400">ID: {u.id.substring(0, 12)}...</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-800">{u.email}</p>
                      <p className="text-[11px] text-zinc-400">{u.phone}</p>
                    </td>

                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          u.role === 'super_admin'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : u.role === 'booking_officer'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : u.role === 'admin'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        <option value="user">User / Customer</option>
                        <option value="booking_officer">Booking Officer (Cek Booking & Refund)</option>
                        <option value="admin">Admin (Konten & Operasional)</option>
                        <option value="super_admin">Super Admin (Akses Penuh)</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 font-semibold text-zinc-900">
                      {u.totalBookings} Transaksi
                    </td>

                    <td className="px-5 py-4 font-bold text-zinc-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(u.totalSpent)}
                    </td>

                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 font-semibold text-[11px] transition-all flex items-center gap-1 ml-auto border border-zinc-200/60"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected User Detail Drawer Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-base border border-white/20">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">{selectedUser.name}</h3>
                  <p className="text-xs text-zinc-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Stat Row */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Booking</span>
                  <span className="text-base font-bold text-zinc-900">{selectedUser.totalBookings}</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Pengeluaran</span>
                  <span className="text-sm font-bold text-zinc-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedUser.totalSpent)}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Role Akun</span>
                  <span className="text-xs font-bold text-zinc-900 capitalize">{selectedUser.role}</span>
                </div>
              </div>

              {/* Booking History Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs">Riwayat Booking Perjalanan User</h4>
                {selectedUser.bookings && selectedUser.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.bookings.map(b => (
                      <div key={b.id} className="p-3 rounded-xl border border-zinc-200 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                        <div>
                          <p className="font-bold text-zinc-900">{b.packageName}</p>
                          <p className="text-[11px] text-zinc-500">
                            {b.travelDate} · {b.participants} peserta
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status}
                          </span>
                          <p className="font-bold text-zinc-900 mt-1">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.totalAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-4 bg-zinc-50 rounded-xl border border-zinc-200/60">
                    User ini belum pernah melakukan pemesanan paket wisata.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
