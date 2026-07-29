'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Subscriber = {
  id: number
  email: string
  subscribed_at: string
  is_active: boolean
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchSubscribers() {
    const { data } = await supabase
      .from('Newsletter')
      .select('*')
      .order('subscribed_at', { ascending: false })
    setSubscribers(data ?? [])
    setLoading(false)
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('Newsletter').update({ is_active: !current }).eq('id', id)
    setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s))
  }

  useEffect(() => { fetchSubscribers() }, [])

  const activeCount = subscribers.filter((s) => s.is_active).length

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Newsletter Subscribers</h1>
            <p className="text-sm text-neutral-400 mt-1">{activeCount} active subscribers</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Subscribed</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-black">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {new Date(s.subscribed_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.is_active ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(s.id, s.is_active)}
                        className="text-xs text-neutral-500 hover:text-black transition-colors underline underline-offset-2"
                      >
                        {s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscribers.length === 0 && (
              <div className="text-center py-12 text-neutral-400 text-sm">Belum ada subscriber.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
