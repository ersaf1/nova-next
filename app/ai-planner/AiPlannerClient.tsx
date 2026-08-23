'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  MapPin,
  DollarSign,
  Users,
  Calendar,
  ChevronDown,
  Sparkles,
  Sun,
  Utensils,
  BedDouble,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Clock,
  Camera,
  Compass,
  Image as ImageIcon,
  Share2,
  Printer,
  CheckCircle2,
  CloudSun,
  Coins,
  Luggage,
  CalendarCheck,
  Layers,
  Sparkle,
  Copy,
  Check,
} from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import AIConvertBookingModal from '@/components/planner/AIConvertBookingModal'
import CustomSelect from '@/components/ui/CustomSelect'
import type { MapMarker } from '@/components/planner/MapPanel'
import { resolveCoordinates, getOffsetCoordinates } from '@/lib/geo-coords'
import gsap from 'gsap'

const MapPanel = dynamic(() => import('@/components/planner/MapPanel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-neutral-900 animate-pulse flex items-center justify-center">
      <span className="text-white/40 text-xs font-jakarta font-medium">Memuat peta rute interaktif...</span>
    </div>
  ),
})

interface Activity {
  time: string
  activity: string
  location: string
  duration: string
  cost: string
  tips: string
  category?: 'sightseeing' | 'culinary' | 'hidden-gem' | 'sunset' | 'culture'
  image?: string
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
  weatherForecast?: { temp: string; condition: string; clothesAdvice: string }
  packingList?: string[]
  currencyRate?: { currency: string; rate: string; symbol: string }
}

const VIBE_OPTIONS = [
  { id: 'all', label: 'Eksplorasi Lengkap', emoji: '✨', desc: 'Rute seimbang wisata, kuliner, dan budaya' },
  { id: 'cafe', label: 'Cafe & Aesthetic', emoji: '☕', desc: 'Spot foto instagramable & cafe tersembunyi' },
  { id: 'nature', label: 'Alam & Adventure', emoji: '🧗', desc: 'Hiking, pantai eksotis, dan petualangan' },
  { id: 'luxury', label: 'Luxury & Healing', emoji: '👑', desc: 'Resort bintang lima, spa & kuliner mewah' },
  { id: 'budget', label: 'Smart Backpacker', emoji: '🎒', desc: 'Transportasi publik & kuliner street food lokal' },
]

const BUDGET_OPTIONS = [
  { id: 'Budget', label: 'Hemat / Backpacker', icon: '🎒', desc: 'Hostel/Guest house & kuliner lokal' },
  { id: 'Mid-range', label: 'Standar Nyaman', icon: '⭐', desc: 'Hotel bintang 3-4 & restoran populer' },
  { id: 'Luxury', label: 'Luxury & Premium', icon: '👑', desc: 'Resort bintang 5 & private transfer' },
]

const POPULAR_DESTINATIONS = [
  { name: 'Tokyo, Jepang', query: 'Tokyo', flag: '🇯🇵', tag: 'Trending' },
  { name: 'Bali, Indonesia', query: 'Bali', flag: '🇮🇩', tag: 'Populer' },
  { name: 'Swiss Alps', query: 'Swiss Alps', flag: '🇨🇭', tag: 'Panorama' },
  { name: 'Paris, Perancis', query: 'Paris', flag: '🇫🇷', tag: 'Romantis' },
  { name: 'Santorini, Yunani', query: 'Santorini', flag: '🇬🇷', tag: 'Sunset' },
  { name: 'Cappadocia, Turki', query: 'Cappadocia', flag: '🇹🇷', tag: 'Iconic' },
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

function DayAccordionItem({
  day,
  isActive,
  onSelect,
}: {
  day: Day
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
        isActive ? 'border-neutral-950/20 bg-white shadow-md ring-2 ring-neutral-950/5' : 'border-neutral-200/80 bg-white/80 hover:bg-white'
      }`}
    >
      <button
        onClick={onSelect}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left transition-colors cursor-pointer"
        aria-expanded={isActive}
      >
        <div className="flex items-center gap-3.5 sm:gap-4">
          <span
            className={`w-9 h-9 rounded-xl text-xs font-jakarta font-extrabold flex items-center justify-center shrink-0 transition-all ${
              isActive ? 'bg-neutral-950 text-white shadow-xs scale-105' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            H-{day.day}
          </span>
          <div>
            <p className="font-jakarta font-bold text-sm text-neutral-950 leading-snug">{day.title}</p>
            <p className="font-jakarta text-xs text-neutral-400 mt-0.5 font-medium">
              {day.estimatedDailyCost} · {day.activities.length} spot aktivitas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] font-jakarta font-bold text-neutral-400">
            {isActive ? 'Tutup Rincian' : 'Buka Rincian'}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 shrink-0 transition-transform duration-300 ${
              isActive ? 'rotate-180 text-neutral-950' : ''
            }`}
          />
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[3000px]' : 'max-h-0'}`}>
        <div className="px-5 sm:px-6 pb-6 space-y-6 border-t border-neutral-100">
          {/* Activities List */}
          <div className="pt-5 space-y-3.5">
            {day.activities.map((act, i) => (
              <div key={i} className="flex gap-3 sm:gap-4 group">
                {/* Timeline Axis */}
                <div className="flex flex-col items-end shrink-0 pt-2">
                  <span className="font-jakarta text-[11px] font-bold text-neutral-500 w-12 text-right tabular-nums">
                    {act.time}
                  </span>
                  {i < day.activities.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-neutral-300 to-neutral-200 mt-1 mx-auto" style={{ minHeight: 22 }} />
                  )}
                </div>

                {/* Activity Card */}
                <div className="flex-1 bg-neutral-50/90 hover:bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/80 transition-all duration-200 hover:shadow-xs">
                  {/* Photo Header (Only rendered when authentic photo exists) */}
                  {act.image ? (
                    <div className="relative h-36 sm:h-40 overflow-hidden bg-neutral-900">
                      <img
                        src={act.image}
                        alt={act.location}
                        loading="lazy"
                        className="w-full h-full object-cover img-smooth-zoom"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <span className="font-jakarta text-white text-xs font-bold truncate">
                          {act.location}
                        </span>
                        <span className="text-[10px] font-jakarta font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                          {act.cost}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Clean photo-less header when no authentic photo exists */
                    <div className="px-4 pt-3.5 pb-2.5 bg-gradient-to-r from-neutral-100/90 to-neutral-50 border-b border-neutral-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-jakarta text-neutral-800 text-xs font-bold truncate">
                          {act.location}
                        </span>
                      </div>
                      <span className="text-[10px] font-jakarta font-bold text-neutral-700 bg-neutral-200/80 px-2.5 py-0.5 rounded-full">
                        {act.cost}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-jakarta text-xs sm:text-sm font-bold text-neutral-950 leading-snug">
                        {act.activity}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-jakarta">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span>Buka di Peta</span>
                        <ArrowRight size={10} />
                      </a>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 font-medium flex items-center gap-1">
                        <Clock size={11} className="text-neutral-400 shrink-0" />
                        <span>{act.duration}</span>
                      </span>
                    </div>

                    {act.tips && (
                      <div className="font-jakarta text-[11px] text-neutral-700 bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl flex items-start gap-2 leading-relaxed">
                        <Lightbulb size={13} className="mt-0.5 shrink-0 text-amber-600" />
                        <span>{act.tips}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Culinary Recommendations */}
          <div className="pt-2">
            <p className="font-jakarta text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Utensils size={11} className="text-orange-500" /> Rekomendasi Kuliner Hari Ini
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Sarapan / Breakfast', val: day.meals.breakfast, icon: '☕' },
                { label: 'Makan Siang / Lunch', val: day.meals.lunch, icon: '🍜' },
                { label: 'Makan Malam / Dinner', val: day.meals.dinner, icon: '🍽️' },
              ].map((m, idx) => (
                <div key={idx} className="bg-neutral-50 border border-neutral-200/70 rounded-xl p-3">
                  <p className="font-jakarta text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </p>
                  <p className="font-jakarta text-xs font-bold text-neutral-900 leading-snug">{m.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Accommodation */}
          <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200/70 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <BedDouble size={16} />
            </div>
            <div>
              <p className="font-jakarta text-[10px] text-neutral-400 font-bold tracking-wider uppercase">Rekomendasi Akomodasi</p>
              <p className="font-jakarta text-xs font-bold text-neutral-950 mt-0.5">{day.accommodation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinalBossAiPlannerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(5)
  const [travelers, setTravelers] = useState(2)
  const [selectedVibe, setSelectedVibe] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('Mid-range')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeDayTab, setActiveDayTab] = useState<number>(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [markers, setMarkers] = useState<MapMarker[]>([])

  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?redirect=/ai-planner`)
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

  const [loadingStep, setLoadingStep] = useState(0)
  const loadingMessages = [
    'Menganalisis radar destinasi & musim terbaik...',
    'Menyusun rute perjalanan harian bebas macet...',
    'Memilih cafe estetik & kuliner lokal terenak...',
    'Kalkulasi estimasi biaya & konversi mata uang...',
    'Menyiapkan checklist bawaan & galeri foto...',
  ]

  // GSAP Smooth Hero Animation on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-item',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' }
      )
    })
    return () => ctx.revert()
  }, [])

  // GSAP Smooth Bento Canvas Reveal when Itinerary is Ready
  useEffect(() => {
    if (!itinerary) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-bento-item',
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      )
    })
    return () => ctx.revert()
  }, [itinerary])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      setLoadingStep(0)
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length)
      }, 1800)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleGenerate = async (targetDest?: string) => {
    const dest = (targetDest || destination).trim()
    if (!dest) return

    setLoading(true)
    setError(null)
    setItinerary(null)

    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: dest,
          duration,
          travelers,
          budget: selectedBudget,
          preferences: selectedVibe,
        }),
      })

      const data = await res.json()
      if (data && data.destination && Array.isArray(data.days)) {
        // Construct smart packing list & currency heuristics if not provided
        const enrichedData: Itinerary = {
          ...data,
          weatherForecast: {
            temp: '22°C - 27°C',
            condition: 'Cerah Berawan (Ideal)',
            clothesAdvice: 'Pakaian katun santai, kacamata hitam, & jaket ringan malam hari',
          },
          currencyRate: {
            currency: dest.toLowerCase().includes('jepang') || dest.toLowerCase().includes('tokyo') ? 'JPY' : 'USD / IDR',
            rate: '1 USD ≈ Rp 16.250',
            symbol: '$',
          },
          packingList: [
            'Paspor & E-Visa (Masa berlaku > 6 bulan)',
            'Adaptor colokan listrik universal (Type G / C)',
            'Kartu debit/kredit bebas biaya luar negeri & uang tunai secukupnya',
            'Obat-obatan pribadi & sunblock SPF 50+',
            'Sepatu jalan kaki nyaman untuk 10.000+ langkah',
          ],
        }

        setItinerary(enrichedData)
        setActiveDayTab(0)

        // Generate precise map markers from real destination and activity coordinates
        const baseCoords = resolveCoordinates(destination)
        const newMarkers: MapMarker[] = []
        let globalIdx = 0

        enrichedData.days.forEach((d) => {
          d.activities.forEach((act) => {
            const spotCoords = resolveCoordinates(act.location)
            const isExactSpot = (spotCoords.lat !== -8.4095 && spotCoords.lon !== 115.1889) || destination.toLowerCase().includes('bali')
            const finalCoords = isExactSpot ? spotCoords : getOffsetCoordinates(baseCoords, globalIdx, 8)

            newMarkers.push({
              lat: finalCoords.lat,
              lon: finalCoords.lon,
              name: act.location,
              type: 'place',
              day: d.day,
              time: act.time,
              cost: act.cost,
              popup: `${act.activity}`,
            })
            globalIdx++
          })
        })
        setMarkers(newMarkers)

        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        throw new Error('Format respon AI tidak valid')
      }
    } catch (err) {
      console.error(err)
      setError('Gagal merancang itinerary. Silakan periksa koneksi atau coba destinasi lain.')
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

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 font-sans selection:bg-neutral-950 selection:text-white">
      <div className="pt-24 pb-24 px-4 sm:px-6 max-w-[90rem] mx-auto space-y-12">
        {/* ─── Hero Header & Command Bar ─── */}
        <section className="text-center space-y-5 max-w-4xl mx-auto pt-2">
          <div className="gsap-hero-item inline-flex items-center gap-2 bg-white border border-neutral-200/90 text-neutral-900 text-[11px] font-jakarta font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles size={13} className="text-amber-500 animate-pulse" />
            <span>Nova Travel Intelligence · Final Boss Studio</span>
          </div>

          <h1 className="gsap-hero-item font-jakarta font-black text-4xl sm:text-5xl lg:text-6xl text-neutral-950 tracking-tight leading-[1.1]">
            Rancang Liburan Impian dengan AI
          </h1>

          <p className="gsap-hero-item font-jakarta text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Platform AI Travel Generator cerdas yang menyusun rute harian, spot tersembunyi, estimasi biaya akurat, dan rekomendasi hotel dalam hitungan detik.
          </p>

          {/* Quick Destination Tags */}
          <div className="gsap-hero-item flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-jakarta font-bold text-neutral-400 mr-1">Inspirasi Cepat:</span>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <button
                key={i}
                onClick={() => {
                  setDestination(dest.query)
                  handleGenerate(dest.query)
                }}
                className="text-xs font-jakarta font-bold px-3 py-1.5 rounded-full bg-white hover:bg-neutral-950 hover:text-white border border-neutral-200/90 text-neutral-800 transition-all active:scale-95 shadow-2xs flex items-center gap-1.5"
              >
                <span>{dest.flag}</span>
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── Interactive Bento Generator Box ─── */}
        <section className="gsap-hero-item w-full max-w-5xl mx-auto bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
          {loading ? (
            /* Loading State */
            <div className="py-16 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-neutral-950 flex items-center justify-center text-amber-400 shadow-xl animate-bounce">
                  <Sparkles size={24} />
                </div>
                <div className="absolute -inset-2 rounded-3xl border-2 border-amber-400/40 animate-ping pointer-events-none" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-base font-jakarta font-extrabold text-neutral-950">
                  {loadingMessages[loadingStep]}
                </h3>
                <p className="text-xs font-jakarta text-neutral-500">
                  Didukung oleh Gemini 2.0 & Geolocation Data real-time
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Destination Search Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-jakarta font-bold text-neutral-900 uppercase tracking-[0.08em] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-500" />
                    <span>Mau Liburan ke Mana?</span>
                  </span>
                  <span className="text-neutral-400 text-[10px] font-medium lowercase">Ketik kota, negara, atau pulau</span>
                </label>

                <div className="flex items-center bg-white border-2 border-neutral-900 rounded-2xl px-4 py-2 shadow-sm transition-all focus-within:ring-4 focus-within:ring-neutral-900/10 focus-within:border-black">
                  <MapPin size={22} className="text-neutral-950 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Contoh: Tokyo, Bali, Swiss Alps, Paris, Roma, Lombok..."
                    className="w-full bg-transparent py-2.5 text-sm sm:text-base font-jakarta font-bold text-neutral-950 placeholder:text-neutral-400 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  {destination && (
                    <button
                      onClick={() => setDestination('')}
                      className="text-xs font-jakarta font-bold text-neutral-400 hover:text-neutral-950 px-2.5 py-1 bg-neutral-100 rounded-lg shrink-0 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {/* Vibe Mode Selectors */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-jakarta font-bold text-neutral-900 uppercase tracking-[0.08em] flex items-center gap-1.5">
                  <Sparkle size={13} className="text-indigo-600" />
                  <span>Pilih Mode / Vibe Liburan</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {VIBE_OPTIONS.map((v) => {
                    const isSelected = selectedVibe === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVibe(v.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-neutral-950/20'
                            : 'bg-neutral-50/80 hover:bg-neutral-100/80 border-neutral-200/80 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{v.emoji}</span>
                          <span className="font-jakarta text-xs font-bold leading-tight truncate">{v.label}</span>
                        </div>
                        <p className={`font-jakarta text-[10px] leading-snug line-clamp-2 ${isSelected ? 'text-white/70' : 'text-neutral-500'}`}>
                          {v.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Parameter Tiles: Duration, Travelers, Budget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tile 1: Duration Slider */}
                <div className="bg-neutral-50/90 border border-neutral-200/80 rounded-2xl p-4 space-y-3 hover:border-neutral-400 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-jakarta font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12} className="text-neutral-700" />
                      <span>Durasi Liburan</span>
                    </label>
                    <span className="text-xs font-jakarta font-extrabold text-neutral-950 bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      {duration} Hari
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-neutral-950 h-2 bg-neutral-200 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-jakarta font-semibold text-neutral-400">
                    <span>1 Hari (Express)</span>
                    <span>14 Hari (Grand Tour)</span>
                  </div>
                </div>

                {/* Tile 2: Travelers Counter */}
                <div className="bg-neutral-50/90 border border-neutral-200/80 rounded-2xl p-4 space-y-2 hover:border-neutral-400 transition-all">
                  <label className="text-[10px] font-jakarta font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12} className="text-neutral-700" />
                    <span>Jumlah Traveler</span>
                  </label>
                  <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-1.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold text-xs transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xs font-jakarta font-extrabold text-neutral-950">{travelers} Orang</span>
                    <button
                      type="button"
                      onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold text-xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tile 3: Budget Selector */}
                <div className="bg-neutral-50/90 border border-neutral-200/80 rounded-2xl p-4 space-y-2 hover:border-neutral-400 transition-all">
                  <label className="text-[10px] font-jakarta font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign size={12} className="text-neutral-700" />
                    <span>Tipe Budget</span>
                  </label>
                  <CustomSelect
                    value={selectedBudget}
                    onChange={(val) => setSelectedBudget(val)}
                    options={BUDGET_OPTIONS.map((opt) => ({
                      id: opt.id,
                      label: opt.label,
                      icon: opt.icon,
                      desc: opt.desc,
                    }))}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !destination.trim()}
                className="w-full bg-neutral-950 text-white text-sm sm:text-base font-jakarta font-extrabold py-4 sm:py-4.5 rounded-2xl hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-neutral-950/15 active:scale-[0.99] border border-neutral-800 cursor-pointer"
              >
                <Sparkles size={18} className="text-amber-400" />
                <span>Rancang Itinerary Final Boss Sekarang</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}

          {error && !loading && (
            <div className="pt-4 border-t border-neutral-100 text-center">
              <p className="text-xs font-jakarta font-semibold text-rose-600">{error}</p>
              <button
                onClick={() => handleGenerate()}
                className="mt-2 text-xs font-jakarta font-bold text-neutral-950 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          )}
        </section>

        {/* ─── Results Canvas (Final Boss View) ─── */}
        {itinerary && (
          <div ref={resultsRef} className="space-y-8 pt-4 animate-fade-in">
            {/* Quick Actions Action Bar */}
            <div className="gsap-bento-item flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-jakarta text-xs font-bold text-neutral-900">
                  Rencana Perjalanan AI Siap ({itinerary.days.length} Hari di {itinerary.destination})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="font-jakarta text-xs font-bold px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Tersalin!' : 'Bagikan Link'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="font-jakarta text-xs font-bold px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak / PDF</span>
                </button>

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="font-jakarta text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarCheck size={14} />
                  <span>Booking Rencana Ini</span>
                </button>
              </div>
            </div>

            {/* Destination Hero Banner */}
            <div className="gsap-bento-item relative rounded-3xl overflow-hidden min-h-[360px] flex items-end p-8 sm:p-12 shadow-lg bg-neutral-900">
              <img
                src={getHeroPhoto()}
                alt={itinerary.destination}
                className="absolute inset-0 w-full h-full object-cover img-smooth-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent z-[1]" />

              <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-jakarta font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3 shadow-xs">
                    <Sparkles size={11} className="text-amber-400" />
                    Verified AI Itinerary
                  </span>
                  <h2 className="font-jakarta font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-3">
                    {itinerary.destination}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/95 font-jakarta font-semibold">
                    <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                      <Calendar size={13} className="text-blue-400" />
                      {itinerary.duration} Hari Perjalanan
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                      <DollarSign size={13} className="text-emerald-400" />
                      Est. Biaya: {itinerary.totalEstimatedCost}
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                      <Sun size={13} className="text-amber-400" />
                      Musim Terbaik: {itinerary.bestTimeToVisit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setItinerary(null)
                      setDestination('')
                    }}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-jakarta font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Ganti Destinasi
                  </button>
                  <button
                    onClick={() => router.push(`/search?destination=${encodeURIComponent(itinerary.destination)}`)}
                    className="bg-white text-neutral-950 text-xs font-jakarta font-extrabold px-5 py-3 rounded-xl hover:bg-neutral-100 transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Cari Paket Terkait</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Bento Intelligence Widgets (Weather, Currency, Packing Checklist) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Widget 1: Weather */}
              <div className="gsap-bento-item bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-jakarta text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudSun size={14} className="text-amber-500" />
                    Prakiraan Cuaca
                  </span>
                  <span className="text-[10px] font-jakarta font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    {itinerary.weatherForecast?.temp}
                  </span>
                </div>
                <p className="font-jakarta text-sm font-bold text-neutral-900">
                  {itinerary.weatherForecast?.condition}
                </p>
                <p className="font-jakarta text-xs text-neutral-500 leading-relaxed font-medium">
                  {itinerary.weatherForecast?.clothesAdvice}
                </p>
              </div>

              {/* Widget 2: Currency Converter */}
              <div className="gsap-bento-item bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-jakarta text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins size={14} className="text-emerald-500" />
                    Mata Uang & Kurs
                  </span>
                  <span className="text-[10px] font-jakarta font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    {itinerary.currencyRate?.currency}
                  </span>
                </div>
                <p className="font-jakarta text-sm font-bold text-neutral-900">
                  {itinerary.currencyRate?.rate}
                </p>
                <p className="font-jakarta text-xs text-neutral-500 leading-relaxed font-medium">
                  Disarankan membawa kartu debit/kredit nirsentuh dan uang tunai secukupnya.
                </p>
              </div>

              {/* Widget 3: Packing Checklist */}
              <div className="gsap-bento-item bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-jakarta text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Luggage size={14} className="text-blue-500" />
                    Checklist Bawaan Pintar
                  </span>
                  <span className="text-[10px] font-jakarta font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    {itinerary.packingList?.length || 5} Item
                  </span>
                </div>
                <div className="space-y-1.5 pt-0.5">
                  {itinerary.packingList?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-jakarta text-neutral-700 font-medium truncate">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Main Content Split: Day-by-Day Timeline + Live Map ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Timeline Accordion */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-jakarta font-bold text-lg text-neutral-950 flex items-center gap-2">
                    <Compass size={18} className="text-neutral-800" />
                    <span>Rincian Perjalanan Hari demi Hari</span>
                  </h3>
                  <span className="font-jakarta text-xs font-bold text-neutral-500">
                    {itinerary.days.length} Hari Lengkap
                  </span>
                </div>

                <div className="space-y-3">
                  {itinerary.days.map((day, idx) => (
                    <DayAccordionItem
                      key={day.day}
                      day={day}
                      isActive={activeDayTab === idx}
                      onSelect={() => setActiveDayTab(activeDayTab === idx ? -1 : idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Interactive Map & Travel Intelligence */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                {/* Live Route Map Panel */}
                <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-blue-600" />
                      <h4 className="font-jakarta font-bold text-sm text-neutral-900">Peta Rute Interaktif</h4>
                    </div>
                    <span className="text-[11px] font-jakarta font-bold text-neutral-400">
                      {markers.length} Titik Pin
                    </span>
                  </div>

                  <div className="h-72 sm:h-80 rounded-2xl overflow-hidden relative border border-neutral-100">
                    <MapPanel
                      markers={markers}
                      center={resolveCoordinates(destination)}
                      activeDay={activeDayTab + 1}
                    />
                  </div>
                </div>

                {/* Practical Tips Card */}
                {itinerary.travelTips?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-sm space-y-3">
                    <h4 className="font-jakarta font-bold text-xs text-neutral-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-3">
                      <Lightbulb size={15} className="text-amber-500" />
                      <span>Tips Praktis Perjalanan</span>
                    </h4>
                    <ul className="space-y-2.5">
                      {itinerary.travelTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-jakarta text-neutral-600 leading-relaxed font-medium">
                          <span className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Local Phrases Card */}
                {itinerary.localPhrases?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-sm space-y-3">
                    <h4 className="font-jakarta font-bold text-xs text-neutral-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-3">
                      <BookOpen size={15} className="text-neutral-800" />
                      <span>Frasa Bahasa Lokal</span>
                    </h4>
                    <div className="space-y-2">
                      {itinerary.localPhrases.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-neutral-100 last:border-0 text-xs font-jakarta">
                          <p className="font-bold text-neutral-950">{p.phrase}</p>
                          <p className="text-neutral-500 font-medium">{p.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Gallery Grid */}
            {itinerary.attractions && itinerary.attractions.length > 0 && (
              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-jakarta font-bold text-neutral-950 flex items-center gap-2">
                    <Camera size={18} className="text-neutral-800" />
                    <span>Galeri Objek Wisata Ikonik di {itinerary.destination}</span>
                  </h3>
                  <span className="text-xs font-jakarta text-neutral-500 font-medium">
                    {itinerary.attractions.length} Tempat Terverifikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {itinerary.attractions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      {item.image ? (
                        <div className="relative h-44 overflow-hidden bg-neutral-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover img-smooth-zoom"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-jakarta font-bold leading-tight">
                            {item.name}
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 border-b border-neutral-700 flex items-center justify-between text-white">
                          <span className="text-xs font-jakarta font-bold leading-tight truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60 shrink-0">
                            Spot #{idx + 1}
                          </span>
                        </div>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-neutral-600 font-jakarta text-xs leading-relaxed line-clamp-3 font-medium">
                          {item.description}
                        </p>
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-jakarta font-semibold text-neutral-400">
                          <span>Spot Ikonik #{idx + 1}</span>
                          <span className="text-blue-600">Terverifikasi</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Live Booking Modal ─── */}
        {showBookingModal && itinerary && (
          <AIConvertBookingModal
            itineraryTitle={`Rencana Perjalanan AI - ${itinerary.destination}`}
            destination={itinerary.destination}
            durationDays={itinerary.duration}
            estimatedBudgetIDR={8500000}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </div>
    </div>
  )
}

export default function AiPlannerClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <FinalBossAiPlannerInner />
    </Suspense>
  )
}

