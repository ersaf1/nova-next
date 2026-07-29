'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, DollarSign, Users, Calendar,
  ChevronDown, Sparkles, Sun, Utensils,
  BedDouble, Lightbulb, BookOpen, ArrowRight, Clock,
  Camera, Compass, Image as ImageIcon, Globe, ShieldCheck
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
    'Searching 195 global travel databases...',
    'Optimizing daily sightseeing routes...',
    'Curating local dining & accommodation...',
    'Calculating estimated budgets & currency...',
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

      {!itinerary ? (
        /* Grand Cinematic Hero Section State */
        <div className="relative min-h-screen w-full flex items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
          {/* Hero Cinematic Background Image */}
          <img
            src={DEFAULT_HERO_IMAGE}
            alt="Travel Background"
            className="absolute inset-0 w-full h-full object-cover img-smooth-zoom scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/50 z-[1]" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 z-[1]" />

          {/* Floating Hero Content */}
          <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Next-Gen AI Travel Concierge</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]" style={{ letterSpacing: '-0.04em' }}>
                Plan Your Dream Voyage with AI.
              </h1>

              <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed font-normal">
                Ketik negara atau kota tujuan Anda (misal: <strong className="text-white">Argentina</strong>, <strong className="text-white">Japan</strong>, <strong className="text-white">Bali</strong>, <strong className="text-white">France</strong>). AI kami akan merancang jadwal harian, hotel, dan galeri foto secara instan.
              </p>
            </div>

            {/* Glassmorphism Floating Control Form */}
            <div className="w-full bg-neutral-950/75 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-left text-white">
              {loading ? (
                <div className="py-12 flex flex-col items-center text-center space-y-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 animate-spin" />
                    <Sparkles size={20} className="absolute inset-0 m-auto text-amber-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base font-bold text-white tracking-tight transition-all duration-300" style={{ letterSpacing: '-0.02em' }}>
                      {loadingMessages[loadingStep]}
                    </p>
                    <p className="text-xs text-white/50">Powered by Gemini AI · mohon tunggu sebentar</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Destination Input */}
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Destinasi Perjalanan</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Ketik destinasi (misal: Argentina, Tokyo, Paris, Bali)..."
                        className="w-full bg-white/10 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      />
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Duration Slider */}
                    <div className="space-y-2 sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Durasi Hari</label>
                        <span className="text-xs font-bold text-amber-400">{duration} Hari</span>
                      </div>
                      <input
                        type="range" min={1} max={14} value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-1.5 bg-white/20 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Travelers Counter */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Jumlah Peserta</label>
                      <div className="flex items-center justify-between bg-white/10 border border-white/15 rounded-2xl px-3 py-1.5">
                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
                          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold">−</button>
                        <span className="text-xs font-bold text-white">{travelers} Orang</span>
                        <button onClick={() => setTravelers(Math.min(20, travelers + 1))}
                          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold">+</button>
                      </div>
                    </div>

                    {/* Budget Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Tipe Budget</label>
                      <div className="relative">
                        <select 
                          value={budget} 
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full bg-white/10 border border-white/15 rounded-2xl px-3 py-2.5 text-xs font-semibold text-white appearance-none focus:outline-none focus:bg-white/20 cursor-pointer transition-all"
                        >
                          {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-neutral-900 text-white">{opt}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Interests Pills */}
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Minat & Preferensi</label>
                    <div className="flex flex-wrap gap-2">
                      {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
                        <button
                          key={label}
                          onClick={() => togglePreference(label)}
                          className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold transition-all flex items-center gap-1.5 ${
                            preferences.includes(label)
                              ? 'bg-white text-neutral-950 border-white shadow-md'
                              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate CTA Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !destination.trim()}
                    className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 text-xs font-extrabold py-4 rounded-2xl hover:brightness-110 shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <Sparkles size={16} />
                    <span>Generate AI Itinerary</span>
                  </button>
                </>
              )}

              {error && !loading && (
                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-xs text-rose-400 font-semibold">{error}</p>
                  <button onClick={handleGenerate} className="mt-2 text-xs font-bold text-white hover:underline">Coba lagi</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results State */
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-28 pb-24 relative z-10 space-y-8 animate-fade-in">
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

          {/* Itinerary Details & Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

            <div className="lg:col-span-4 space-y-6">
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
  )
}
