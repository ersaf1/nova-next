'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=90',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=90',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=90',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=90',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=90',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=90',
  argentina: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=90',
}

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=90'

function DayAccordion({ day, index }: { day: Day; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${open ? 'border-neutral-200/80 shadow-xs' : 'border-neutral-200/40'} bg-white`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-neutral-50/80"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-all duration-300 ${open ? 'bg-neutral-950 text-white shadow-xs' : 'bg-neutral-100 text-neutral-800'}`}>
            Hari {day.day}
          </span>
          <div>
            <p className="font-bold text-sm text-neutral-900 leading-snug">{day.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{day.estimatedDailyCost} · {day.activities.length} aktivitas</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-neutral-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-neutral-900' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6 space-y-5 border-t border-neutral-100">
          {/* Timeline */}
          <div className="pt-5 space-y-3">
            {day.activities.map((act, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-end shrink-0 pt-3">
                  <span className="text-[10px] font-bold text-neutral-400 w-12 text-right tabular-nums">{act.time}</span>
                  {i < day.activities.length - 1 && (
                    <div className="w-px flex-1 bg-neutral-200/80 mt-1 mx-auto" style={{ minHeight: 18 }} />
                  )}
                </div>
                <div className="flex-1 bg-neutral-50 rounded-xl p-4 border border-neutral-200/60 hover:bg-white hover:shadow-xs transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-xs font-bold text-neutral-900 leading-snug">{act.activity}</p>
                    <span className="text-[11px] font-semibold text-neutral-700 shrink-0 bg-white border border-neutral-200 rounded-full px-2.5 py-0.5 shadow-2xs">{act.cost}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <MapPin size={10} className="shrink-0 text-neutral-400" />
                    {act.location}
                    <span className="text-neutral-300">·</span>
                    <Clock size={10} className="shrink-0 text-neutral-400" />
                    {act.duration}
                  </p>
                  {act.tips && (
                    <p className="text-[11px] text-neutral-600 mt-2 flex items-start gap-1.5 pl-0.5 bg-amber-50/60 border border-amber-200/50 p-2 rounded-lg">
                      <Lightbulb size={11} className="mt-0.5 shrink-0 text-amber-600" />
                      <span>{act.tips}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Meals */}
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Utensils size={10} /> Meals & Rekomendasi Kuliner
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-3">
                  <p className="text-[10px] text-neutral-400 capitalize font-bold tracking-wider mb-1">{meal}</p>
                  <p className="text-xs font-medium text-neutral-800 leading-snug">{day.meals[meal]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200/60 rounded-xl px-4 py-3">
            <BedDouble size={14} className="text-neutral-500 shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-400 font-bold tracking-wider uppercase">Accommodation</p>
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
    'Searching global travel databases...',
    'Optimizing daily sightseeing routes...',
    'Curating local dining & accommodation...',
    'Calculating costs & converting currency...',
    'Generating destination photo gallery & travel tips...'
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
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden flex flex-col justify-between" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      {!itinerary && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4F8]/60 via-transparent to-[#F0F4F8]/90" />
        </div>
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-28 pb-24 relative z-10 flex flex-col justify-center">
        {!itinerary ? (
          /* Form State */
          <div className="max-w-xl w-full mx-auto flex flex-col items-center">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/5 px-3.5 py-1.5 rounded-full mb-5">
                <Sparkles size={10} className="text-slate-400 animate-pulse" />
                AI Travel Planner
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-4" style={{ letterSpacing: '-0.04em' }}>
                Plan your perfect trip.
              </h1>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Ketik negara atau kota tujuan Anda (misal: Argentina, Japan, Bali) — AI akan membuatkan jadwal harian & galeri foto objek wisata.
              </p>
            </div>

            <div className="w-full bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl p-7 space-y-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center text-center space-y-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-slate-800 animate-spin" />
                    <Sparkles size={20} className="absolute inset-0 m-auto text-slate-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base font-bold text-slate-800 tracking-tight transition-all duration-300" style={{ letterSpacing: '-0.02em' }}>
                      {loadingMessages[loadingStep]}
                    </p>
                    <p className="text-xs text-slate-400">Powered by Gemini AI · mohon tunggu sebentar</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Destinasi Perjalanan</label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Argentina, Tokyo, Paris, Santorini, Bali…"
                        className="w-full bg-[#E8EFF5] rounded-xl pl-9 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-[#DFE7EE] transition-all duration-300"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durasi Hari</label>
                        <span className="text-xs font-bold text-slate-800">{duration} {duration === 1 ? 'day' : 'days'}</span>
                      </div>
                      <input
                        type="range" min={1} max={14} value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full accent-slate-800 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Jumlah Peserta</label>
                      <div className="flex items-center gap-3.5">
                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
                          className="w-9 h-9 rounded-xl bg-[#E8EFF5] flex items-center justify-center text-slate-500 hover:bg-[#DFE7EE] hover:text-slate-800 active:scale-[0.91] hover:scale-[1.05] transition-all duration-300 ease-out font-semibold">−</button>
                        <span className="text-sm font-bold text-slate-800 w-4 text-center">{travelers}</span>
                        <button onClick={() => setTravelers(Math.min(20, travelers + 1))}
                          className="w-9 h-9 rounded-xl bg-[#E8EFF5] flex items-center justify-center text-slate-500 hover:bg-[#DFE7EE] hover:text-slate-800 active:scale-[0.91] hover:scale-[1.05] transition-all duration-300 ease-out font-semibold">+</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Tipe Budget</label>
                      <div className="relative">
                        <select 
                          value={budget} 
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full bg-[#E8EFF5] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:bg-[#DFE7EE] cursor-pointer hover:bg-[#DFE7EE] transition-colors duration-300"
                        >
                          {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Minat & Hiburan</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
                        <button key={label} onClick={() => togglePreference(label)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-300 ease-out active:scale-[0.94] hover:scale-[1.03] flex items-center gap-1.5 hover:shadow-sm ${preferences.includes(label) ? 'bg-slate-900 text-slate-100 border-slate-900 shadow-md' : 'bg-[#E8EFF5] text-slate-500 border-transparent hover:text-slate-800'}`}>
                          <span>{emoji}</span>{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !destination.trim()}
                    className="w-full bg-slate-900 text-white text-sm font-semibold py-3.5 rounded-2xl hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-[0.97] hover:scale-[1.01] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles size={14} />Generate Itinerary
                  </button>
                </>
              )}
              
              {error && !loading && (
                <div className="pt-4 border-t border-slate-150 text-center">
                  <p className="text-xs text-red-500 font-semibold">{error}</p>
                  <button onClick={handleGenerate} className="mt-2 text-xs font-bold text-slate-800 hover:text-slate-900 active:scale-95 transition-all duration-200 underline underline-offset-2">Try again</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Results State */
          <div className="space-y-8 animate-fade-in">
            {/* Destination Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden min-h-[340px] flex items-end p-8 sm:p-10 shadow-2xl bg-neutral-900">
              <img
                src={getHeroPhoto()}
                alt={itinerary.destination}
                className="absolute inset-0 w-full h-full object-cover img-smooth-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent z-[1]" />

              <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                    AI Curated Itinerary
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-3" style={{ letterSpacing: '-0.04em' }}>
                    {itinerary.destination}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/90">
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
                      <Calendar className="w-3.5 h-3.5 text-white/80" />
                      {itinerary.duration} Hari Perjalanan
                    </span>
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Est. Biaya: {itinerary.totalEstimatedCost}
                    </span>
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Waktu Terbaik: {itinerary.bestTimeToVisit}
                    </span>
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      {travelers} Peserta
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => { setItinerary(null); setDestination('') }}
                    className="bg-white/15 backdrop-blur-md hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all"
                  >
                    Rancang Destinasi Lain
                  </button>
                  <button
                    onClick={() => router.push(`/search?destination=${encodeURIComponent(itinerary.destination)}`)}
                    className="bg-white text-neutral-950 text-xs font-bold px-6 py-3 rounded-xl hover:bg-neutral-100 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <span>Cari Paket & Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Photo Gallery & Top Attractions Section */}
            {itinerary.attractions && itinerary.attractions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">Visual Highlights</span>
                    <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-indigo-600" />
                      Foto & Objek Wisata Populer di {itinerary.destination}
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">
                    {itinerary.attractions.length} Tempat Ikonik
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {itinerary.attractions.map((item, idx) => (
                    <div
                      key={idx}
                      className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
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
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold leading-tight drop-shadow-sm">
                          {item.name}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3 font-normal">
                          {item.description}
                        </p>
                        <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            Highlight #{idx + 1}
                          </span>
                          <span className="text-neutral-400">Terverifikasi</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Details & Tips (Day by Day Accordion + Phrases) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Day Accordion (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-neutral-600" />
                    Rencana Perjalanan Hari demi Hari
                  </h2>
                  <span className="text-xs text-neutral-400 font-medium">{itinerary.days.length} Hari Lengkap</span>
                </div>

                <div className="space-y-3">
                  {itinerary.days.map((day, i) => (
                    <DayAccordion key={day.day} day={day} index={i} />
                  ))}
                </div>
              </div>

              {/* Sidebar: Travel Tips + Local Phrases (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Travel Tips */}
                {itinerary.travelTips?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <Lightbulb size={14} className="text-amber-500" /> Tips Perjalanan Praktis
                    </h3>
                    <ul className="space-y-3">
                      {itinerary.travelTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-600 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-700 shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Local Phrases */}
                {itinerary.localPhrases?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <BookOpen size={14} className="text-indigo-500" /> Bahasa & Frasa Lokal
                    </h3>
                    <div className="space-y-2">
                      {itinerary.localPhrases.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-neutral-100 last:border-0 text-xs">
                          <p className="font-bold text-neutral-900">{p.phrase}</p>
                          <p className="text-neutral-400 font-medium">{p.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Callout */}
                <div className="bg-neutral-950 text-white rounded-2xl p-6 space-y-4 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Siap Berangkat?</span>
                    <h4 className="text-base font-bold">Pesan Paket Wisata ke {itinerary.destination}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">Dapatkan akomodasi, pemandu lokal, dan Tiket pesawat terbaik.</p>
                  </div>
                  <button
                    onClick={() => router.push(`/search?destination=${encodeURIComponent(itinerary.destination)}`)}
                    className="w-full bg-white text-neutral-950 font-bold text-xs py-3 rounded-xl hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Cari Paket Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
