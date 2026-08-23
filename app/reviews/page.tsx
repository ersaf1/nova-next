'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Star, ShieldCheck, MessageSquare, Plus, CheckCircle2, User, MapPin } from 'lucide-react'

interface ReviewItem {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar: string
  country?: string
  verified?: boolean
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [country, setCountry] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadReviews = () => {
    setLoading(true)
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, content, rating, country })
      })

      if (res.ok) {
        setSuccessMsg('Ulasan Anda telah berhasil terkirim!')
        setName('')
        setEmail('')
        setContent('')
        setRating(5)
        setCountry('')
        loadReviews()
        setTimeout(() => {
          setSuccessMsg('')
          setShowModal(false)
        }, 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9'

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 w-full mt-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Customer Reviews</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Ulasan Pengalaman Traveler
          </h1>
          <p className="text-zinc-500 text-sm">
            Pengalaman nyata dari para penjelajah yang telah terbang dan menjelajah dunia bersama NOVA Travel.
          </p>

          {/* Rating Badge */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <span className="text-lg font-bold text-zinc-900">{avgRating} / 5.0</span>
            <span className="text-xs text-zinc-400">({reviews.length} Ulasan Terverifikasi)</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Ulasan Perjalanan Anda</span>
          </button>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-zinc-200 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xs space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Rating & Verified badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Traveler</span>
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-700 text-xs leading-relaxed italic">
                    "{r.content}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-zinc-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-xs">{r.name}</h4>
                    <p className="text-[10px] text-zinc-400">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">Tulis Ulasan Perjalanan</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900">✕</button>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Email (Untuk Verifikasi Booking)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Jika email pernah booking, ulasan akan otomatis berstatus Verified Traveler ✨</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Rating</label>
                    <select
                      value={rating}
                      onChange={e => setRating(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-semibold focus:outline-none"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5 Sempurna)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5 Sangat Bagus)</option>
                      <option value={3}>⭐⭐⭐ (3/5 Cukup)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Negara / Kota Origin</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Indonesia"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Ulasan & Cerita Perjalanan</label>
                  <textarea
                    rows={3}
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Bagikan pengalaman liburan dan pelayanan NOVA Travel..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Kirim Ulasan...' : 'Kirim Ulasan Resmi'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
