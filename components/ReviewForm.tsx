'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import StarRating from './StarRating'

interface ReviewFormProps {
  entityType: 'destination' | 'package'
  entityId: number
  onSuccess: () => void
}

export default function ReviewForm({ entityType, entityId, onSuccess }: ReviewFormProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        setUserEmail(data.user.email ?? '')
        setUserName(data.user.user_metadata?.name ?? data.user.email?.split('@')[0] ?? 'Traveler')
      }
      setAuthLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (rating === 0) { setError('Pilih rating bintang terlebih dahulu.'); return }
    if (!body.trim()) { setError('Ulasan tidak boleh kosong.'); return }

    setLoading(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, user_email: userEmail, user_name: userName, entity_type: entityType, entity_id: entityId, rating, title, body }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Gagal mengirim ulasan.')
    } else {
      setRating(0); setTitle(''); setBody('')
      onSuccess()
    }
    setLoading(false)
  }

  if (authLoading) return null

  if (!userId) {
    return (
      <div className="bg-[#FAFBFB] border border-black/[0.04] rounded-xl p-5 text-center">
        <p className="text-neutral-500 text-sm">
          <a href="/login" className="text-indigo-600 hover:underline font-medium">Masuk</a> untuk memberikan ulasan
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/[0.05] rounded-xl p-5 space-y-4 shadow-sm">
      <h3 className="text-base font-semibold text-neutral-900">Tulis Ulasan</h3>

      <div>
        <p className="text-xs text-neutral-400 mb-2">Rating kamu</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul ulasan (opsional)"
        className="w-full bg-[#FAFBFB] border border-black/[0.06] rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400/50 transition-colors"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ceritakan pengalamanmu..."
        rows={4}
        className="w-full bg-[#FAFBFB] border border-black/[0.06] rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400/50 transition-colors resize-none"
        required
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}
