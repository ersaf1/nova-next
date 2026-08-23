'use client'

import React, { useEffect, useState } from 'react'
import { ShieldCheck, Search, Clock, UserCheck, Activity, Key, FileText } from 'lucide-react'

interface AuditLog {
  id: number
  adminEmail: string
  action: string
  target: string
  details: string
  createdAt: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/audit-logs')
      .then(r => r.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredLogs = logs.filter(log =>
    log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.target.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Keamanan & Audit Sistem</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Audit Log</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Catatan riwayat perubahan data sensitif, persetujuan refund, dan aksi tim admin.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 font-semibold bg-white px-3.5 py-1.5 rounded-full border border-zinc-200 shadow-2xs">
            {logs.length} Total Activity Log
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari email admin, aksi, target..."
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-xs text-zinc-400 animate-pulse">
          Memuat log audit admin...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-xs text-zinc-400">
          Belum ada catatan aktivitas admin.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">Waktu</th>
                  <th className="px-5 py-3.5">Admin Email</th>
                  <th className="px-5 py-3.5">Tipe Aksi</th>
                  <th className="px-5 py-3.5">Target Data</th>
                  <th className="px-5 py-3.5">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-zinc-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-4 font-bold text-zinc-900">
                      {log.adminEmail}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white border border-zinc-800 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-800">
                      {log.target}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {log.details || '-'}
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
