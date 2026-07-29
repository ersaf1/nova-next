'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, DollarSign, Users, Calendar,
  ChevronDown, Sparkles, Sun, Utensils,
  BedDouble, Lightbulb, BookOpen, ArrowRight, Clock,
  Camera, Compass, Image as ImageIcon
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabaseClient } from '@/lib/supabase-client'

interface Activity {
  time: string
  activity: string
  location: string
  duration: string
  cost: string
  tips: string
}

interface Day {
  day: number
  title: string
  activities: Activity[]
  meals: { breakfast: string; lunch: string; dinner: string }
  accommodation: string
  estimatedDailyCost: string
}

interface Attraction {
  name: string
  description: string
  image: string
}

interface Itinerary {
  destination: string
  duration: number
  totalEstimatedCost: string
  heroImage?: string
  days: Day[]
  attractions?: Attraction[]
  travelTips: string[]
  bestTimeToVisit: string
  localPhrases: { phrase: string; meaning: string }[]
}

const PREFERENCE_OPTIONS = [
  { label: 'Beach', emoji: '🏖️' },
  { label: 'Culture', emoji: '🏛️' },
  { label: 'Food', emoji: '🍜' },
  { label: 'Adventure', emoji: '🧗' },
  { label: 'Shopping', emoji: '🛍️' },
]
const BUDGET_OPTIONS = ['Budget', 'Mid-range', 'Luxury']

const DESTINATION_HERO_IMAGES: Record<string, string> = {
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=2000&q=95',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=2000&q=95',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=95',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=2000&q=95',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=2000&q=95',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=2000&q=95',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=2000&q=95',
  argentina: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2000&q=95',
}

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&q=95'

function DayAccordion({ day, index }: { day: Day; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-200 ${open ? 'border-neutral-300 shadow-2xs' : 'border-neutral-200/80'} bg-white`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-neutral-50/60"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 ${open ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
            {day.day}
          </span>
          <div>
            <p className="font-bold text-sm text-neutral-900 leading-snug">{day.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{day.estimatedDailyCost} · {day.activities.length} aktivitas</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-neutral-950' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6 space-y-5 border-t border-neutral-100">
          <div className="pt-5 space-y-3">
            {day.activities.map((act, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-end shrink-0 pt-2">
                  <span className="text-[11px] font-semibold text-neutral-400 w-12 text-right tabular-nums">{act.time}</span>
                  {i < day.activities.length - 1 && (
                    <div className="w-px flex-1 bg-neutral-200/80 mt-1 mx-auto" style={{ minHeight: 18 }} />
                  )}
                </div>
                <div className="flex-1 bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/60">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-xs font-bold text-neutral-900 leading-snug">{act.activity}</p>
                    <span className="text-[11px] font-semibold text-neutral-700 shrink-0 bg-white border border-neutral-200 rounded-full px-2.5 py-0.5">{act.cost}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <MapPin size={10} className="shrink-0 text-neutral-400" />
                    {act.location}
                    <span className="text-neutral-300">·</span>
                    <Clock size={10} className="shrink-0 text-neutral-400" />
                    {act.duration}
                  </p>
                  {act.tips && (
                    <p className="text-[11px] text-neutral-600 mt-2 flex items-start gap-1.5 bg-amber-50/50 border border-amber-200/40 p-2 rounded-lg">
                      <Lightbulb size={11} className="mt-0.5 shrink-0 text-amber-600" />
                      <span>{act.tips}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Utensils size={10} /> Rekomendasi Kuliner
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-3">
                  <p className="text-[10px] text-neutral-400 capitalize font-bold tracking-wider mb-0.5">{meal}</p>
                  <p className="text-xs font-medium text-neutral-800 leading-snug">{day.meals[meal]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200/60 rounded-xl px-4 py-3">
            <BedDouble size={14} className="text-neutral-400 shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-400 font-bold tracking-wider uppercase">Akomodasi</p>
              <p className="text-xs font-semibold text-neutral-900 mt-0.5">{day.accommodation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  const router = useRouter()

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?redirect=/itinerary`)
      }
    })
  }, [router])

  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(5)
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('Mid-range')
  const [preferences, setPreferences] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [loadingStep, setLoadingStep] = useState(0)
  const loadingMessages = [
    'Mencari database destinasi...',
    'Menyusun rute perjalanan harian...',
    'Memilih rekomendasi kuliner & hotel...',
    'Kalkulasi estimasi biaya...',
    'Menyiapkan galeri foto objek wisata...'
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      setLoadingStep(0)
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  const handleGenerate = async () => {
    if (!destination.trim()) return
    setLoading(true)
    setError(null)
    setItinerary(null)
    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, duration, travelers, budget, preferences: preferences.join(', ') || 'general sightseeing' }),
      })
      const data = await res.json()
      if (data && data.destination && Array.isArray(data.days)) {
        setItinerary(data)
      } else {
        throw new Error('Invalid response')
      }
    } catch (err) {
      console.error(err)
      setError('Gagal membuat itinerary. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const getHeroPhoto = () => {
    if (!itinerary) return DEFAULT_HERO_IMAGE
    if (itinerary.heroImage) return itinerary.heroImage
    const norm = itinerary.destination.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
    return DESTINATION_HERO_IMAGES[norm] || DEFAULT_HERO_IMAGE
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-[88rem] mx-auto space-y-10">

          {!itinerary ? (
            /* Clean Minimalist White Form State */
            <div className="pt-8 max-w-3xl mx-auto space-y-8">
              
              {/* Minimalist Editorial Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>AI Travel Concierge</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight leading-[1.05]">
                  Rancang Perjalanan Impian
                </h1>

                <p className="text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed font-normal">
                  Ketik negara atau kota tujuan (misal: <strong className="text-neutral-900">Argentina</strong>, <strong className="text-neutral-900">Japan</strong>, <strong className="text-neutral-900">Bali</strong>). AI akan merancang rute harian, hotel, dan galeri foto secara instan.
                </p>
              </div>

              {/* Clean White Card Form */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-neutral-900">
                {loading ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-6">
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-200 border-t-neutral-950 animate-spin flex items-center justify-center">
                      <Sparkles size={16} className="text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-neutral-900">
                        {loadingMessages[loadingStep]}
                      </p>
                      <p className="text-xs text-neutral-400">Powered by Gemini AI · mohon tunggu sebentar</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Destination Input */}
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Destinasi Perjalanan</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Ketik destinasi (misal: Argentina, Tokyo, Paris, Bali)..."
                          className="w-full bg-neutral-50 border border-neutral-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950 transition-all font-medium"
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                      </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Duration Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Durasi Hari</label>
                          <span className="text-xs font-bold text-neutral-950">{duration} Hari</span>
                        </div>
                        <input
                          type="range" min={1} max={14} value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full accent-neutral-950 h-1.5 bg-neutral-200 rounded-full cursor-pointer"
                        />
                      </div>

                      {/* Travelers Counter */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Jumlah Peserta</label>
                        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/80 rounded-2xl px-3 py-1.5">
                          <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
                            className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 font-bold text-xs shadow-2xs">−</button>
                          <span className="text-xs font-bold text-neutral-900">{travelers} Orang</span>
                          <button onClick={() => setTravelers(Math.min(20, travelers + 1))}
                            className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 font-bold text-xs shadow-2xs">+</button>
                        </div>
                      </div>

                      {/* Budget Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Tipe Budget</label>
                        <div className="relative">
                          <select 
                            value={budget} 
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200/80 rounded-2xl px-3 py-2.5 text-xs font-semibold text-neutral-900 appearance-none focus:outline-none focus:bg-white focus:border-neutral-950 cursor-pointer transition-all"
                          >
                            {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Preference Pills */}
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Minat & Preferensi</label>
                      <div className="flex flex-wrap gap-2">
                        {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
                          <button
                            key={label}
                            onClick={() => togglePreference(label)}
                            className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold transition-all flex items-center gap-1.5 ${
                              preferences.includes(label)
                                ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-950'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !destination.trim()}
                      className="w-full bg-neutral-950 text-white text-xs font-bold py-3.5 rounded-2xl hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Sparkles size={14} />
                      <span>Buat Itinerary Sekarang</span>
                    </button>
                  </>
                )}

                {error && !loading && (
                  <div className="pt-4 border-t border-neutral-100 text-center">
                    <p className="text-xs text-rose-600 font-semibold">{error}</p>
                    <button onClick={handleGenerate} className="mt-2 text-xs font-bold text-neutral-950 hover:underline">Coba lagi</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Results View State */
            <div className="space-y-8 animate-fade-in">
              {/* Destination Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-end p-8 sm:p-10 shadow-md bg-neutral-900">
                <img
                  src={getHeroPhoto()}
                  alt={itinerary.destination}
                  className="absolute inset-0 w-full h-full object-cover img-smooth-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-[1]" />

                <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                      <Sparkles size={10} className="text-amber-400" />
                      Rencana Perjalanan AI
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                      {itinerary.destination}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-medium">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <Calendar size={12} />
                        {itinerary.duration} Hari
                      </span>
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <DollarSign size={12} className="text-emerald-400" />
                        Est. Biaya: {itinerary.totalEstimatedCost}
                      </span>
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <Sun size={12} className="text-amber-400" />
                        Waktu Terbaik: {itinerary.bestTimeToVisit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => { setItinerary(null); setDestination('') }}
                      className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Destinasi Lain
                    </button>
                    <button
                      onClick={() => router.push(`/search?destination=${encodeURIComponent(itinerary.destination)}`)}
                      className="bg-white text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-100 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Cari Paket</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Gallery Grid */}
              {itinerary.attractions && itinerary.attractions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                      <Camera size={18} className="text-neutral-700" />
                      Foto Objek Wisata di {itinerary.destination}
                    </h2>
                    <span className="text-xs text-neutral-400 font-medium">
                      {itinerary.attractions.length} Tempat Ikonik
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {itinerary.attractions.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative h-48 overflow-hidden bg-neutral-900">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover img-smooth-zoom"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                              <ImageIcon size={24} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold leading-tight">
                            {item.name}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-medium text-neutral-400">
                            <span>Spot Ikonik #{idx + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary Timeline & Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                      <Compass size={18} className="text-neutral-700" />
                      Rincian Perjalanan Hari demi Hari
                    </h2>
                    <span className="text-xs text-neutral-400 font-medium">{itinerary.days.length} Hari</span>
                  </div>

                  <div className="space-y-3">
                    {itinerary.days.map((day, i) => (
                      <DayAccordion key={day.day} day={day} index={i} />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-5">
                  {itinerary.travelTips?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-3">
                      <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-3">
                        <Lightbulb size={14} className="text-amber-500" /> Tips Perjalanan Praktis
                      </h3>
                      <ul className="space-y-2.5">
                        {itinerary.travelTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-neutral-600 leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-700 shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {itinerary.localPhrases?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-3">
                      <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-3">
                        <BookOpen size={14} className="text-neutral-700" /> Bahasa & Frasa Lokal
                      </h3>
                      <div className="space-y-2">
                        {itinerary.localPhrases.map((p, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-neutral-100 last:border-0 text-xs">
                            <p className="font-bold text-neutral-950">{p.phrase}</p>
                            <p className="text-neutral-400 font-medium">{p.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
