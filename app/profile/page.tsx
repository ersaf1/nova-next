'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, MapPin, Save, ArrowRight, Loader2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'

type Profile = {
  id: string
  email: string
  created_at: string
  name: string
  phone: string
  travel_style: string
}

const TRAVEL_STYLES = ['Solo', 'Keluarga', 'Petualangan', 'Bisnis', 'Bulan Madu', 'Backpacker']

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [travelStyle, setTravelStyle] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const res = await fetch('/api/profile')
      if (!res.ok) { router.replace('/login'); return }
      const data: Profile = await res.json()
      setProfile(data)
      setName(data.name)
      setPhone(data.phone)
      setTravelStyle(data.travel_style)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, travel_style: travelStyle }),
    })
    if (res.ok) {
      setMessage({ text: 'Profil berhasil disimpan!', type: 'success' })
    } else {
      const err = await res.json()
      setMessage({ text: err.error ?? 'Gagal menyimpan profil.', type: 'error' })
    }
    setSaving(false)
  }

  const initials = (profile?.name || profile?.email || 'U').slice(0, 2).toUpperCase()
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-[#052a2f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#052a2f] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.name || 'Traveler'}</h1>
            <p className="text-white/50 text-sm">{profile?.email}</p>
            <p className="text-white/30 text-xs mt-1">Member sejak {memberSince}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white/80 mb-2">Informasi Profil</h2>

          {message && (
            <div className={`text-sm px-4 py-3 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Email</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <User className="w-4 h-4 text-white/30 shrink-0" />
              <span className="text-white/50 text-sm">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Nomor HP</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812 3456 7890"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Gaya Perjalanan</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
              >
                <option value="" className="bg-[#052a2f]">Pilih gaya perjalanan</option>
                {TRAVEL_STYLES.map((s) => (
                  <option key={s} value={s} className="bg-[#052a2f]">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/dashboard" className="flex items-center justify-between bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl px-5 py-4 transition-colors group">
            <span className="text-sm font-medium">Riwayat Booking</span>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
