'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MapPin, DollarSign, Users, Calendar,
  ChevronDown, Sparkles, Sun, Utensils,
  BedDouble, Lightbulb, BookOpen, ArrowRight, Clock,
  Camera, Compass, Image as ImageIcon, Video, Star, Play
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
  aiIntro?: string
  days: Day[]
  attractions?: Attraction[]
  travelTips: string[]
  bestTimeToVisit: string
  localPhrases: { phrase: string; meaning: string }[]
}

const PREFERENCE_OPTIONS = [
  { label: 'Beach', emoji: 'ðŸ–ï¸' },
  { label: 'Culture', emoji: 'ðŸ›ï¸' },
  { label: 'Food', emoji: 'ðŸœ' },
  { label: 'Adventure', emoji: 'ðŸ§—' },
  { label: 'Shopping', emoji: 'ðŸ›ï¸' },
]
const BUDGET_OPTIONS = ['Budget', 'Mid-range', 'Luxury']

const FEATURED_DESTINATIONS = [
  {
    name: 'Argentina',
    location: 'Buenos Aires & Patagonia',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80'
    ]
  },
  {
    name: 'Japan',
    location: 'Tokyo & Kyoto',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80'
    ]
  },
  {
    name: 'Bali',
    location: 'Ubud & Uluwatu',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80'
    ]
  },
  {
    name: 'Santorini',
    location: 'Oia & Caldera',
    rating: 5.0,
    photo: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80'
    ]
  }
]

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
            <p className="text-xs text-neutral-400 mt-0.5">{day.estimatedDailyCost} Â· {day.activities.length} aktivitas</p>
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
                    <span className="text-neutral-300">Â·</span>
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

function ItineraryPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(5)
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('Mid-range')
  const [preferences, setPreferences] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeMediaIdx, setActiveMediaIdx] = useState(0)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?redirect=/itinerary`)
      }
    })

    const initialPrompt = searchParams.get('prompt')
    if (initialPrompt) {
      const match = initialPrompt.match(/to\s+([A-Za-z\s]+)\s+in/i) || initialPrompt.match(/to\s+([A-Za-z\s]+)/i)
      if (match && match[1]) {
        setDestination(match[1].trim())
      }
    }
  }, [router, searchParams])

  const currentMedia = FEATURED_DESTINATIONS[activeMediaIdx]

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

  const selectFeaturedDestination = (destName: string, idx: number) => {
    setDestination(destName)
    setActiveMediaIdx(idx)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 selection:bg-neutral-950 selection:text-white" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-[88rem] mx-auto space-y-10">

          {!itinerary ? (
            /* Clean Minimalist Light Theme Form State with Full Width Card Canvas */
            <div className="pt-4 w-full space-y-8 relative">
              
              {/* 14 Scattered Floating Aesthetic Cards (Active Moving Videos & Frosted Glass Blur Canvas) */}
              <div className="absolute -inset-x-24 -inset-y-12 pointer-events-none z-0 hidden lg:block">
                
                {/* 1. Tokyo, Japan ðŸ‡¯ðŸ‡µ (Photo) */}
                <div className="absolute top-2 left-2 w-48 bg-white/75 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xl -rotate-8 animate-float opacity-80">
                  <div className="h-28 rounded-xl overflow-hidden mb-2 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80" alt="Tokyo Japan" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-neutral-950">
                    <span>Tokyo, Japan ðŸ‡¯ðŸ‡µ</span>
                    <span className="text-amber-500">4.9 â˜…</span>
                  </div>
                </div>

                {/* 2. Santorini, Greece ðŸ‡¬ðŸ‡· (Active Moving Video) */}
                <div className="absolute top-4 right-2 w-52 bg-white/75 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xl rotate-12 animate-float-delayed opacity-85">
                  <div className="h-28 rounded-xl overflow-hidden mb-2 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-neutral-950">
                    <span>Santorini, Greece ðŸ‡¬ðŸ‡·</span>
                    <span className="text-amber-500">5.0 â˜…</span>
                  </div>
                </div>

                {/* 3. Patagonia, Argentina ðŸ‡¦ðŸ‡· (Photo) */}
                <div className="absolute bottom-4 left-4 w-52 bg-white/75 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xl rotate-6 animate-float opacity-80">
                  <div className="h-28 rounded-xl overflow-hidden mb-2 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80" alt="Patagonia Argentina" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-neutral-950">
                    <span>Patagonia, Argentina ðŸ‡¦ðŸ‡·</span>
                    <span className="text-amber-500">4.9 â˜…</span>
                  </div>
                </div>

                {/* 4. Bali, Indonesia ðŸ‡®ðŸ‡© (Active Moving Video) */}
                <div className="absolute bottom-2 right-4 w-48 bg-white/75 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xl -rotate-12 animate-float-delayed opacity-85">
                  <div className="h-28 rounded-xl overflow-hidden mb-2 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-neutral-950">
                    <span>Bali, Indonesia ðŸ‡®ðŸ‡©</span>
                    <span className="text-amber-500">4.9 â˜…</span>
                  </div>
                </div>

                {/* 5. Paris, France ðŸ‡«ðŸ‡· (Photo) */}
                <div className="absolute top-1/4 -left-10 w-44 bg-white/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/80 shadow-lg rotate-9 animate-float-delayed opacity-75">
                  <div className="h-24 rounded-xl overflow-hidden mb-1.5 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80" alt="Paris France" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-jakarta font-bold text-neutral-950">
                    <span>Paris, France ðŸ‡«ðŸ‡·</span>
                    <span className="text-amber-500">4.8 â˜…</span>
                  </div>
                </div>

                {/* 6. Amalfi Coast, Italy ðŸ‡®ðŸ‡¹ (Active Moving Video) */}
                <div className="absolute top-1/3 -right-8 w-48 bg-white/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/80 shadow-lg -rotate-15 animate-float opacity-80">
                  <div className="h-24 rounded-xl overflow-hidden mb-1.5 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-jakarta font-bold text-neutral-950">
                    <span>Amalfi Coast ðŸ‡®ðŸ‡¹</span>
                    <span className="text-amber-500">5.0 â˜…</span>
                  </div>
                </div>

                {/* 7. Kyoto, Japan ðŸ‡¯ðŸ‡µ (Photo) */}
                <div className="absolute bottom-1/4 -left-8 w-48 bg-white/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/80 shadow-lg -rotate-6 animate-float opacity-75">
                  <div className="h-24 rounded-xl overflow-hidden mb-1.5 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80" alt="Kyoto Japan" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-jakarta font-bold text-neutral-950">
                    <span>Kyoto Temples ðŸ‡¯ðŸ‡µ</span>
                    <span className="text-amber-500">4.9 â˜…</span>
                  </div>
                </div>

                {/* 8. Swiss Alps ðŸ‡¨ðŸ‡­ (Active Moving Video) */}
                <div className="absolute bottom-1/3 -right-10 w-44 bg-white/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/80 shadow-lg rotate-8 animate-float-delayed opacity-80">
                  <div className="h-24 rounded-xl overflow-hidden mb-1.5 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-jakarta font-bold text-neutral-950">
                    <span>Swiss Alps ðŸ‡¨ðŸ‡­</span>
                    <span className="text-amber-500">4.9 â˜…</span>
                  </div>
                </div>

                {/* 9. New York, USA ðŸ‡ºðŸ‡¸ (Photo) */}
                <div className="absolute -top-10 left-1/3 w-40 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/70 shadow-md rotate-14 animate-float opacity-65">
                  <div className="h-20 rounded-lg overflow-hidden mb-1 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80" alt="New York" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                  <div className="text-[9px] font-jakarta font-bold text-neutral-900 text-center">New York ðŸ‡ºðŸ‡¸</div>
                </div>

                {/* 10. Reykjavik, Iceland ðŸ‡®ðŸ‡¸ (Active Moving Video) */}
                <div className="absolute -top-8 right-1/3 w-44 bg-white/65 backdrop-blur-md p-2 rounded-2xl border border-white/70 shadow-md -rotate-10 animate-float-delayed opacity-70">
                  <div className="h-20 rounded-lg overflow-hidden mb-1 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[9px] font-jakarta font-bold text-neutral-900 text-center">Iceland Glaciers ðŸ‡®ðŸ‡¸</div>
                </div>

                {/* 11. Cairo, Egypt ðŸ‡ªðŸ‡¬ (Photo) */}
                <div className="absolute -bottom-10 left-1/3 w-44 bg-white/65 backdrop-blur-md p-2 rounded-2xl border border-white/70 shadow-md -rotate-14 animate-float opacity-65">
                  <div className="h-20 rounded-lg overflow-hidden mb-1 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80" alt="Cairo Egypt" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                  <div className="text-[9px] font-jakarta font-bold text-neutral-900 text-center">Cairo Pyramids ðŸ‡ªðŸ‡¬</div>
                </div>

                {/* 12. Maldives ðŸ‡²ðŸ‡» (Active Moving Video) */}
                <div className="absolute -bottom-10 right-1/3 w-40 bg-white/65 backdrop-blur-md p-2 rounded-2xl border border-white/70 shadow-md rotate-11 animate-float-delayed opacity-70">
                  <div className="h-20 rounded-lg overflow-hidden mb-1 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[9px] font-jakarta font-bold text-neutral-900 text-center">Maldives Resort ðŸ‡²ðŸ‡»</div>
                </div>

                {/* 13. Barcelona, Spain ðŸ‡ªðŸ‡¸ (Photo) */}
                <div className="absolute top-12 left-1/4 w-36 bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-white/60 shadow-xs -rotate-3 animate-float opacity-50">
                  <div className="h-16 rounded-md overflow-hidden mb-1 bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80" alt="Barcelona" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[8px] font-jakarta font-bold text-neutral-800 text-center">Barcelona ðŸ‡ªðŸ‡¸</div>
                </div>

                {/* 14. Rio de Janeiro, Brazil ðŸ‡§ðŸ‡· (Active Moving Video) */}
                <div className="absolute bottom-12 right-1/4 w-36 bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-white/60 shadow-xs rotate-4 animate-float-delayed opacity-50">
                  <div className="h-16 rounded-md overflow-hidden mb-1 bg-neutral-900 relative">
                    <video src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[8px] font-jakarta font-bold text-neutral-800 text-center">Rio de Janeiro ðŸ‡§ðŸ‡·</div>
                </div>

              </div>

              {/* Minimalist Luxury Editorial Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-900 text-[10px] font-jakarta font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xs">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>AI Travel Concierge</span>
                </div>

                <h1 className="font-serif-luxury italic text-5xl sm:text-6xl lg:text-7xl font-normal text-neutral-950 tracking-normal leading-[1.0] max-w-3xl mx-auto">
                  Rancang Perjalanan Impian
                </h1>

                <p className="font-jakarta text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed font-medium">
                  Ketik negara atau kota tujuan (misal: <strong className="text-neutral-950 font-bold">Argentina</strong>, <strong className="text-neutral-950 font-bold">Japan</strong>, <strong className="text-neutral-950 font-bold">Bali</strong>). AI akan merancang rute harian, hotel, dan galeri foto secara instan.
                </p>
              </div>

              {/* Full Width Corner-to-Corner Search Form Card */}
              <div className="w-full max-w-[88rem] mx-auto bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-lg space-y-8 text-neutral-900 z-10 relative">
                {loading ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-6">
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-200 border-t-neutral-950 animate-spin flex items-center justify-center">
                      <Sparkles size={16} className="text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-neutral-950">
                        {loadingMessages[loadingStep]}
                      </p>
                      <p className="text-xs text-neutral-500">Powered by Gemini AI Â· mohon tunggu sebentar</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Hero Destination Input Bar (Super Crystal Clear & Prominent) */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-jakarta font-bold text-neutral-900 uppercase tracking-[0.08em] flex items-center gap-2">
                        <MapPin size={14} className="text-amber-500" />
                        <span>Destinasi Perjalanan</span>
                      </label>
                      <div className="relative group">
                        <div className="flex items-center bg-white border-2 border-neutral-900 rounded-2xl px-4 py-2 shadow-sm transition-all focus-within:ring-4 focus-within:ring-neutral-900/10 focus-within:border-black">
                          <MapPin size={20} className="text-neutral-950 mr-3 shrink-0" />
                          <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Ketik destinasi impianmu (misal: Argentina, Tokyo, Paris, Bali)..."
                            className="w-full bg-transparent py-2.5 text-sm sm:text-base font-jakarta font-bold text-neutral-950 placeholder:text-neutral-400 placeholder:font-medium focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                          />
                          {destination && (
                            <button
                              onClick={() => setDestination('')}
                              className="text-xs font-bold text-neutral-400 hover:text-neutral-950 px-2 py-1 bg-neutral-100 rounded-lg shrink-0"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Parameter Tiles (Structured & Separated) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Tile 1: Duration Slider */}
                      <div className="bg-neutral-50/90 border border-neutral-200 rounded-2xl p-4 space-y-3 hover:border-neutral-400 transition-all">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-jakarta font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={12} className="text-neutral-700" />
                            <span>Durasi Hari</span>
                          </label>
                          <span className="text-xs font-jakarta font-extrabold text-neutral-950 bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                            {duration} Hari
                          </span>
                        </div>
                        <input
                          type="range" min={1} max={14} value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full accent-neutral-950 h-2 bg-neutral-200 rounded-full cursor-pointer"
                        />
                      </div>

                      {/* Tile 2: Travelers Counter */}
                      <div className="bg-neutral-50/90 border border-neutral-200 rounded-2xl p-4 space-y-2 hover:border-neutral-400 transition-all">
                        <label className="text-[10px] font-jakarta font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Users size={12} className="text-neutral-700" />
                          <span>Jumlah Peserta</span>
                        </label>
                        <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-1.5 shadow-2xs">
                          <button
                            onClick={() => setTravelers(Math.max(1, travelers - 1))}
                            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold text-xs transition-colors"
                          >
                            âˆ’
                          </button>
                          <span className="text-xs font-jakarta font-extrabold text-neutral-950">{travelers} Orang</span>
                          <button
                            onClick={() => setTravelers(Math.min(20, travelers + 1))}
                            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Tile 3: Budget Selector */}
                      <div className="bg-neutral-50/90 border border-neutral-200 rounded-2xl p-4 space-y-2 hover:border-neutral-400 transition-all">
                        <label className="text-[10px] font-jakarta font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <DollarSign size={12} className="text-neutral-700" />
                          <span>Tipe Budget</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={budget} 
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-jakarta font-extrabold text-neutral-950 appearance-none focus:outline-none focus:border-neutral-950 cursor-pointer transition-all shadow-2xs"
                          >
                            {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                        </div>
                      </div>

                    </div>

                    {/* Preference Pills (Distinct Switchers) */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-jakarta font-bold text-neutral-400 uppercase tracking-widest block">Minat & Preferensi</label>
                      <div className="flex flex-wrap gap-2">
                        {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
                          <button
                            key={label}
                            onClick={() => togglePreference(label)}
                            className={`text-xs font-jakarta px-4 py-2 rounded-full border font-bold transition-all flex items-center gap-2 ${
                              preferences.includes(label)
                                ? 'bg-neutral-950 text-white border-neutral-950 shadow-md scale-105'
                                : 'bg-white text-neutral-800 border-neutral-200/90 hover:bg-neutral-100 hover:border-neutral-400'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit CTA (Grand Prominent Button) */}
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !destination.trim()}
                      className="w-full bg-neutral-950 text-white text-sm font-jakarta font-extrabold py-4 rounded-2xl hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-neutral-950/15 active:scale-[0.99] border border-neutral-800"
                    >
                      <Sparkles size={16} className="text-amber-400" />
                      <span>Buat AI Itinerary Sekarang</span>
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
            <div className="space-y-8 text-neutral-950">

              {/* AI Intro Message */}
              {itinerary.aiIntro && (
                <div
                  className="flex items-start gap-3 opacity-0 animate-slide-in-left"
                  style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center shadow-sm">
                    <Sparkles size={14} className="text-amber-400" />
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs max-w-2xl">
                    <p className="text-xs font-jakarta font-semibold text-neutral-500 uppercase tracking-widest mb-1">Nova AI</p>
                    <p className="text-sm font-jakarta text-neutral-800 leading-relaxed">{itinerary.aiIntro}</p>
                  </div>
                </div>
              )}

              {/* Destination Hero Banner */}
              <div
                className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-end p-8 sm:p-10 shadow-md bg-neutral-900 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
              >
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
                    <h1 className="font-serif-luxury italic text-5xl sm:text-6xl font-normal text-white tracking-normal mb-3">
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
                <div
                  className="space-y-4 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                      <Camera size={18} className="text-neutral-700" />
                      Foto Objek Wisata di {itinerary.destination}
                    </h2>
                    <span className="text-xs text-neutral-500 font-medium">
                      {itinerary.attractions.length} Tempat Ikonik
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {itinerary.attractions.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
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
                          <p className="text-neutral-600 text-xs leading-relaxed line-clamp-3">
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
              <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0.75s', animationFillMode: 'forwards' }}
              >
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                      <Compass size={18} className="text-neutral-700" />
                      Rincian Perjalanan Hari demi Hari
                    </h2>
                    <span className="text-xs text-neutral-500 font-medium">{itinerary.days.length} Hari</span>
                  </div>

                  <div className="space-y-3">
                    {itinerary.days.map((day, i) => (
                      <DayAccordion key={day.day} day={day} index={i} />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-5">
                  {itinerary.travelTips?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-2xs space-y-3">
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
                    <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-2xs space-y-3">
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

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <ItineraryPageInner />
    </Suspense>
  )
}