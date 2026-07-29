'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Map, Pencil, Trash2, Share2, Check } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'

interface Itinerary {
  id: string
  title: string
  destination: string
  duration: number
  travelers: number
  budget?: number
  visibility: 'private' | 'shared'
  shareToken?: string
  createdAt: string
}

export default function DashboardItinerariesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchItineraries = async () => {
    try {
      const res = await fetch('/api/itineraries')
      if (!res.ok) return
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login?redirect=/dashboard/itineraries'); return }
      fetchItineraries()
    })
    // fetchItineraries and router are stable — omitted intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return
    try {
      await fetch(`/api/itineraries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      })
      setItems(prev => prev.map(i => i.id === id ? { ...i, title: editTitle.trim() } : i))
    } finally {
      setEditingId(null)
      setEditTitle('')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleShare = async (item: Itinerary) => {
    // Make shared if private
    if (item.visibility === 'private') {
      const res = await fetch(`/api/itineraries/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'shared' }),
      })
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...updated } : i))
      item = updated
    }

    const url = `${window.location.origin}/itinerary/shared/${item.shareToken}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(item.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          <aside className="w-48 shrink-0 hidden md:block">
            <DashboardNav />
          </aside>
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-black">Itinerary AI Tersimpan</h1>
              <Link href="/itinerary" className="text-sm text-neutral-500 hover:text-black transition-colors">
                + Buat Itinerary Baru
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-black/[0.06] p-5 animate-pulse">
                    <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.06] p-12 text-center">
                <Map className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="font-semibold text-black mb-1">Belum ada itinerary tersimpan</p>
                <p className="text-sm text-neutral-400 mb-6">Buat itinerary dengan AI dan simpan untuk digunakan nanti.</p>
                <Link href="/itinerary" className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors">
                  Buat Itinerary
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-black/[0.06] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleRename(item.id); if (e.key === 'Escape') { setEditingId(null); setEditTitle('') } }}
                              autoFocus
                              className="flex-1 border border-black/10 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:border-black"
                            />
                            <button onClick={() => handleRename(item.id)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg">Simpan</button>
                            <button onClick={() => { setEditingId(null); setEditTitle('') }} className="text-xs border border-black/10 px-3 py-1.5 rounded-lg">Batal</button>
                          </div>
                        ) : (
                          <p className="font-semibold text-black text-sm">{item.title}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                          <span>{item.destination}</span>
                          <span>·</span>
                          <span>{item.duration} hari</span>
                          <span>·</span>
                          <span>{item.travelers} traveler</span>
                          <span>·</span>
                          <span>{formatDate(item.createdAt)}</span>
                          {item.visibility === 'shared' && (
                            <span className="text-[#175cff] font-medium">Dibagikan</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingId(item.id); setEditTitle(item.title) }}
                          title="Rename"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleShare(item)}
                          title={copied === item.id ? 'Link disalin!' : 'Bagikan'}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#175cff] hover:bg-blue-50 transition-colors"
                        >
                          {copied === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(item.id)} className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-lg">Hapus</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-[10px] border border-black/10 px-2.5 py-1 rounded-lg">Batal</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            title="Hapus"
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cari paket button */}
                    <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between">
                      <Link
                        href={`/search?q=${encodeURIComponent(item.destination)}`}
                        className="text-xs font-semibold text-[#175cff] hover:text-[#0f47cc] transition-colors"
                      >
                        Cari Paket yang Sesuai →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
