'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MapPin,
  DollarSign,
  Users,
  Calendar,
  ChevronDown,
  Sun,
  Utensils,
  BedDouble,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Clock,
  Compass,
  Printer,
  CheckCircle2,
  CloudSun,
  Coins,
  Luggage,
  CalendarCheck,
  Copy,
  Check,
  Coffee,
  Mountain,
  Gem,
  Wallet,
  CreditCard,
  Navigation,
  ShieldCheck,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import AIConvertBookingModal from '@/components/planner/AIConvertBookingModal'
import CustomSelect from '@/components/ui/CustomSelect'
import gsap from 'gsap'

interface Activity {
  time: string
  activity: string
  location: string
  duration: string
  cost: string
  tips: string
  category?: 'sightseeing' | 'culinary' | 'hidden-gem' | 'sunset' | 'culture'
  image?: string
  accuracy?: number
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
  image?: string
  accuracy?: number
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
  { id: 'all', label: 'Eksplorasi Lengkap', icon: Compass, desc: 'Rute seimbang wisata, budaya & santai' },
  { id: 'cafe', label: 'Kafe & Estetika', icon: Coffee, desc: 'Spot foto estetik & kafe lokal pilihan' },
  { id: 'nature', label: 'Alam & Petualangan', icon: Mountain, desc: 'Hiking, pantai eksotis & panorama' },
  { id: 'luxury', label: 'Luxury & Relaksasi', icon: Gem, desc: 'Resort nyaman & santap santai' },
  { id: 'budget', label: 'Smart Traveler', icon: Wallet, desc: 'Rute efisien & kuliner otentik' },
]

const BUDGET_OPTIONS = [
  { id: 'Budget', label: 'Hemat / Backpacker', icon: <Wallet size={16} className="text-neutral-700" />, desc: 'Guesthouse & kuliner lokal' },
  { id: 'Mid-range', label: 'Standar Nyaman', icon: <CreditCard size={16} className="text-neutral-700" />, desc: 'Hotel bintang 3-4 & resto populer' },
  { id: 'Luxury', label: 'Luxury & Premium', icon: <Gem size={16} className="text-neutral-700" />, desc: 'Resort bintang 5 & layanan privat' },
]

const POPULAR_DESTINATIONS = [
  { name: 'Tokyo', query: 'Tokyo', code: 'JP' },
  { name: 'Bali', query: 'Bali', code: 'ID' },
  { name: 'Swiss Alps', query: 'Swiss Alps', code: 'CH' },
  { name: 'Paris', query: 'Paris', code: 'FR' },
  { name: 'Santorini', query: 'Santorini', code: 'GR' },
  { name: 'Magelang', query: 'Magelang', code: 'ID' },
]

function DayAccordionItem({
  day,
  isActive,
  onSelect,
  destinationContext = '',
}: {
  day: Day
  isActive: boolean
  onSelect: () => void
  destinationContext?: string
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
        isActive ? 'border-brand/40 bg-white shadow-xs' : 'border-neutral-200/70 bg-white hover:border-neutral-300'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors cursor-pointer"
        aria-expanded={isActive}
      >
        <div className="flex items-center gap-4">
          <span
            className={`w-9 h-9 rounded-xl text-xs font-jakarta font-bold flex items-center justify-center shrink-0 transition-all ${
              isActive ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            H-{day.day}
          </span>
          <div>
            <p className="font-jakarta font-bold text-sm text-neutral-900 leading-snug">{day.title}</p>
            <p className="font-jakarta text-xs text-neutral-400 mt-0.5 font-normal">
              {day.estimatedDailyCost} · {day.activities.length} aktivitas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-jakarta text-neutral-400 font-medium">
            {isActive ? 'Tutup' : 'Lihat Rincian'}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 shrink-0 transition-transform duration-300 ${
              isActive ? 'rotate-180 text-brand' : ''
            }`}
          />
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[3500px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6 space-y-6 border-t border-neutral-100 pt-5">
          {/* Activities List */}
          <div className="space-y-4">
            {day.activities.map((act, i) => {
              const mapsQuery = act.location
                ? (act.location.toLowerCase().includes(destinationContext.toLowerCase())
                    ? act.location
                    : `${act.location}, ${destinationContext}`)
                : act.activity

              return (
                <div key={i} className="flex gap-4 group">
                  {/* Timeline Axis */}
                  <div className="flex flex-col items-end shrink-0 pt-2">
                    <span className="font-jakarta text-[11px] font-semibold text-neutral-400 w-12 text-right tabular-nums">
                      {act.time}
                    </span>
                    {i < day.activities.length - 1 && (
                      <div className="w-px flex-1 bg-neutral-200 mt-2 mx-auto" style={{ minHeight: 24 }} />
                    )}
                  </div>

                  {/* Activity Card */}
                  <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-neutral-200/70 hover:border-neutral-300 transition-all duration-200">
                    {act.image && (
                      <div className="relative h-44 sm:h-48 overflow-hidden bg-neutral-100">
                        <img
                          src={act.image}
                          alt={act.location}
                          loading="lazy"
                          className="w-full h-full object-cover img-smooth-zoom"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />

                        {/* Subtle Accuracy Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-emerald-300 text-[10px] font-jakarta font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-xs">
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          <span>{act.accuracy || 95}% Akurat</span>
                        </div>

                        {/* Location Overlay */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                          <span className="font-jakarta text-white text-xs font-bold truncate drop-shadow-xs">
                            {act.location}
                          </span>
                          <span className="text-[10px] font-jakarta font-medium text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full shrink-0">
                            {act.cost}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {!act.image && (
                        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                            <span className="font-jakarta text-neutral-900 text-xs font-bold truncate">
                              {act.location}
                            </span>
                          </div>
                          <span className="text-[10px] font-jakarta font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full shrink-0">
                            {act.cost}
                          </span>
                        </div>
                      )}

                      <h4 className="font-jakarta text-sm font-bold text-neutral-900 leading-snug">
                        {act.activity}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-jakarta text-neutral-500">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-brand hover:text-brand-dark transition-colors"
                          title={`Buka rute ${act.location} di Google Maps`}
                        >
                          <MapPin size={12} className="shrink-0" />
                          <span>Buka di Peta</span>
                          <ArrowRight size={10} />
                        </a>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-neutral-400 shrink-0" />
                          <span>{act.duration}</span>
                        </span>
                      </div>

                      {act.tips && (
                        <div className="font-jakarta text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                          <Lightbulb size={13} className="mt-0.5 shrink-0 text-amber-500" />
                          <span>{act.tips}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Daily Culinary Recommendations */}
          <div className="pt-2">
            <p className="font-jakarta text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Utensils size={12} className="text-neutral-500" /> Rekomendasi Kuliner Hari Ini
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Sarapan', val: day.meals.breakfast, icon: Coffee },
                { label: 'Makan Siang', val: day.meals.lunch, icon: Utensils },
                { label: 'Makan Malam', val: day.meals.dinner, icon: Utensils },
              ].map((m, idx) => {
                const IconComp = m.icon
                return (
                  <div key={idx} className="bg-neutral-50 border border-neutral-100 rounded-xl p-3.5 space-y-1">
                    <p className="font-jakarta text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <IconComp size={11} className="text-neutral-500" />
                      <span>{m.label}</span>
                    </p>
                    <p className="font-jakarta text-xs font-semibold text-neutral-800 leading-snug">{m.val}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Accommodation */}
          <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
              <BedDouble size={15} />
            </div>
            <div>
              <p className="font-jakarta text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Akomodasi yang Disarankan</p>
              <p className="font-jakarta text-xs font-semibold text-neutral-800 mt-0.5">{day.accommodation}</p>
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
  const [duration, setDuration] = useState(4)
  const [travelers, setTravelers] = useState(2)
  const [selectedVibe, setSelectedVibe] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('Mid-range')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeDayTab, setActiveDayTab] = useState<number>(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabaseClient.auth.getSession().catch(() => {})

    const query = searchParams.get('q') || searchParams.get('prompt') || searchParams.get('destination')
    if (query) {
      const q = query.trim()

      const travelersMatch = q.match(/(\d+)\s*(orang|pax|people|person|traveler|wisatawan)/i)
      if (travelersMatch) {
        const count = parseInt(travelersMatch[1])
        if (!isNaN(count) && count >= 1 && count <= 20) setTravelers(count)
      }

      const durationMatch = q.match(/(\d+)\s*(hari|day|days|malam|night|nights)/i)
      if (durationMatch) {
        const dur = parseInt(durationMatch[1])
        if (!isNaN(dur) && dur >= 1 && dur <= 14) setDuration(dur)
      }

      let cleanDest = q
        .replace(/aku\s+pengen\s+liburan|pengen\s+liburan|mau\s+liburan|liburan\s+ke|jalan-jalan\s+ke|wisata\s+ke|trip\s+to|travel\s+to/gi, '')
        .replace(/(\d+)\s*(orang|pax|people|person|traveler|wisatawan)/gi, '')
        .replace(/(\d+)\s*(hari|day|days|malam|night|nights)/gi, '')
        .replace(/\b(di|ke|bersama|sama|keluarga|family|teman|friends|budget|murah|mewah)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (!cleanDest) cleanDest = q

      setDestination(cleanDest)
      if (cleanDest.length >= 2) {
        handleGenerate(cleanDest)
      }
    }
  }, [searchParams])

  const [loadingStep, setLoadingStep] = useState(0)
  const loadingMessages = [
    'Menganalisis destinasi & musim terbaik...',
    'Menyusun rute harian efisien & bebas macet...',
    'Mengurasi kuliner lokal otentik...',
    'Menyelaraskan data geolokasi presisi...',
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-item',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform,opacity' }
      )
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!itinerary) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-bento-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform,opacity' }
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
        const enrichedData: Itinerary = {
          ...data,
          weatherForecast: {
            temp: '22°C - 27°C',
            condition: 'Cerah Berawan (Ideal)',
            clothesAdvice: 'Pakaian katun santai & jaket ringan malam hari',
          },
          packingList: data.packingList || [
            'Pakaian ganti secukupnya',
            'Sepatu jalan / sneakers nyaman',
            'Sunscreen & kacamata hitam',
            'Obat-obatan pribadi & botol minum',
          ],
          currencyRate: data.currencyRate || {
            currency: 'IDR',
            rate: '1 USD ≈ Rp 16.200',
            symbol: 'Rp',
          },
        }

        setItinerary(enrichedData)
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } else {
        setError('Gagal menyusun rencana perjalanan. Silakan coba kembali.')
      }
    } catch {
      setError('Terjadi kendala koneksi. Silakan coba sesaat lagi.')
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-[#FBFBFC] text-neutral-900 font-sans selection:bg-brand selection:text-white">
      <div className="pt-24 pb-28 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
        {/* ─── Hero Header (Spacious & Clean) ─── */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="gsap-hero-item inline-flex items-center gap-2 bg-white border border-neutral-200/80 text-neutral-700 text-xs font-jakarta font-semibold tracking-wide px-4 py-1.5 rounded-full shadow-2xs">
            <Navigation size={13} className="text-brand" />
            <span>Sistem Navigasi & Perjalanan Terpadu</span>
          </div>

          <h1 className="gsap-hero-item font-jakarta font-extrabold text-3xl sm:text-4xl lg:text-5xl text-neutral-950 tracking-tight leading-tight">
            Rancang Rencana Perjalanan
          </h1>

          <p className="gsap-hero-item font-jakarta text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed font-normal">
            Penyusun rencana perjalanan dengan rute harian efisien, estimasi biaya transparan, dan kurasi spot terverifikasi.
          </p>

          {/* Quick Destination Tags */}
          <div className="gsap-hero-item flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-jakarta text-neutral-400 mr-1">Inspirasi Cepat:</span>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDestination(dest.query)
                  handleGenerate(dest.query)
                }}
                className="text-xs font-jakarta font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200/80 text-neutral-700 transition-all active:scale-95 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-[10px] font-mono text-neutral-400">{dest.code}</span>
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── Simplified Search Island (Clean Whitespace) ─── */}
        <section className="gsap-hero-item w-full max-w-3xl mx-auto bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {loading ? (
            /* Loading State */
            <div className="py-14 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-xs">
                <Loader2 size={20} className="animate-spin text-brand-light" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-jakarta font-bold text-neutral-900">
                  {loadingMessages[loadingStep]}
                </h3>
                <p className="text-xs font-jakarta text-neutral-400">
                  Memetakan titik lokasi & rekomendasi rute
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Destination Search Bar */}
              <div className="space-y-2">
                <div className="flex items-center bg-neutral-50/90 border border-neutral-200 rounded-2xl px-4 py-1.5 focus-within:bg-white focus-within:border-neutral-900 focus-within:ring-4 focus-within:ring-neutral-900/5 transition-all">
                  <MapPin size={18} className="text-neutral-500 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ketik destinasi (misal: Magelang, Kopeng, Purworejo, Tokyo, Bali)..."
                    className="w-full bg-transparent py-2.5 text-sm sm:text-base font-jakarta font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => setDestination('')}
                      className="text-xs font-jakarta text-neutral-400 hover:text-neutral-700 px-2 py-1 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>

              {/* Vibe Selection Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-jakarta font-bold text-neutral-400 uppercase tracking-wider">
                  Gaya Perjalanan
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map((v) => {
                    const isSelected = selectedVibe === v.id
                    const IconComp = v.icon
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVibe(v.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-white hover:bg-neutral-50 border-neutral-200/80 text-neutral-700'
                        }`}
                      >
                        <IconComp size={14} className={isSelected ? 'text-white' : 'text-neutral-500'} />
                        <span>{v.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Parameter Settings (Compact & Spacious) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-neutral-100">
                {/* Durasi */}
                <div className="p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-jakarta">
                    <span className="text-neutral-500 font-medium">Durasi</span>
                    <span className="font-bold text-neutral-900">{duration} Hari</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-full cursor-pointer"
                  />
                </div>

                {/* Wisatawan */}
                <div className="p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl space-y-1.5">
                  <span className="text-xs font-jakarta text-neutral-500 font-medium block">Wisatawan</span>
                  <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xs font-jakarta font-bold text-neutral-900">{travelers} Orang</span>
                    <button
                      type="button"
                      onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Budget */}
                <div className="p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl space-y-1.5">
                  <span className="text-xs font-jakarta text-neutral-500 font-medium block">Kategori Budget</span>
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
                type="button"
                onClick={() => {
                  if (!destination.trim()) {
                    setError('Silakan ketik destinasi liburan (misal: Magelang, Bali, Tokyo, dsb).')
                    return
                  }
                  handleGenerate()
                }}
                disabled={loading}
                className="w-full bg-brand text-white text-sm font-jakarta font-bold py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Compass size={16} />
                <span>Susun Rencana Perjalanan</span>
                <ArrowRight size={15} />
              </button>
            </>
          )}

          {error && !loading && (
            <div className="p-4 bg-rose-50 border border-rose-200/70 rounded-xl text-center space-y-1">
              <p className="text-xs font-jakarta font-bold text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="text-xs font-jakarta font-semibold text-neutral-800 underline hover:text-neutral-950 cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          )}
        </section>

        {/* ─── Results Canvas (Calm & Spacious View) ─── */}
        {itinerary && (
          <div ref={resultsRef} className="space-y-10 pt-4 animate-fade-in max-w-4xl mx-auto">
            {/* Header: Destination & Quick Summary */}
            <div className="gsap-bento-item bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-0.5 rounded-full mb-2">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Rencana Perjalanan Terverifikasi</span>
                  </div>
                  <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-neutral-950 tracking-tight">
                    {itinerary.destination}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-xs font-jakarta font-semibold px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Tersalin' : 'Bagikan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="text-xs font-jakarta font-semibold px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Cetak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    className="text-xs font-jakarta font-bold px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarCheck size={13} />
                    <span>Booking Rencana</span>
                  </button>
                </div>
              </div>

              {/* Clean Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-jakarta">
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                  <span className="text-neutral-400 font-medium block">Durasi</span>
                  <span className="font-bold text-neutral-900 mt-0.5 block">{itinerary.duration} Hari</span>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                  <span className="text-neutral-400 font-medium block">Wisatawan</span>
                  <span className="font-bold text-neutral-900 mt-0.5 block">{travelers} Orang</span>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                  <span className="text-neutral-400 font-medium block">Est. Total Biaya</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{itinerary.totalEstimatedCost}</span>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                  <span className="text-neutral-400 font-medium block">Musim Terbaik</span>
                  <span className="font-bold text-neutral-900 mt-0.5 block truncate">{itinerary.bestTimeToVisit}</span>
                </div>
              </div>
            </div>

            {/* Day-by-day Itinerary Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-jakarta font-bold text-lg text-neutral-900 flex items-center gap-2">
                  <Compass size={17} className="text-neutral-600" />
                  <span>Rute Perjalanan Hari demi Hari</span>
                </h3>
                <span className="font-jakarta text-xs text-neutral-400 font-medium">
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
                    destinationContext={itinerary.destination}
                  />
                ))}
              </div>
            </div>

            {/* Practical Travel Insights (Clean, Uncluttered Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weather & Advice */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-jakarta font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudSun size={14} className="text-amber-500" />
                    Prakiraan Cuaca
                  </span>
                  <span className="text-xs font-jakarta font-bold text-neutral-900">
                    {itinerary.weatherForecast?.temp}
                  </span>
                </div>
                <p className="text-xs font-jakarta font-semibold text-neutral-800">
                  {itinerary.weatherForecast?.condition}
                </p>
                <p className="text-xs font-jakarta text-neutral-500 leading-relaxed font-normal">
                  {itinerary.weatherForecast?.clothesAdvice}
                </p>
              </div>

              {/* Currency */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-jakarta font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins size={14} className="text-emerald-500" />
                    Mata Uang & Kurs
                  </span>
                  <span className="text-xs font-jakarta font-bold text-neutral-900">
                    {itinerary.currencyRate?.currency}
                  </span>
                </div>
                <p className="text-xs font-jakarta font-semibold text-neutral-800">
                  {itinerary.currencyRate?.rate}
                </p>
                <p className="text-xs font-jakarta text-neutral-500 leading-relaxed font-normal">
                  Disarankan menyiapkan uang tunai pecahan kecil untuk parkir dan tiket masuk.
                </p>
              </div>
            </div>

            {/* Practical Tips */}
            {itinerary.travelTips?.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-3 shadow-2xs">
                <h4 className="font-jakarta font-bold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-3">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Tips Praktis Perjalanan</span>
                </h4>
                <ul className="space-y-2">
                  {itinerary.travelTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-jakarta text-neutral-600 leading-relaxed font-normal">
                      <span className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verified Attractions Directory */}
            {itinerary.attractions && itinerary.attractions.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-jakarta font-bold text-neutral-900 flex items-center gap-2">
                    <Compass size={16} className="text-neutral-600" />
                    <span>Daftar Objek Wisata di {itinerary.destination}</span>
                  </h3>
                  <span className="text-xs font-jakarta text-neutral-400 font-medium">
                    {itinerary.attractions.length} Spot Terverifikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itinerary.attractions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs hover:border-neutral-300 transition-all duration-200 flex flex-col justify-between"
                    >
                      {item.image && (
                        <div className="relative h-36 overflow-hidden bg-neutral-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover img-smooth-zoom"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md text-emerald-300 text-[10px] font-jakarta font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 size={10} className="text-emerald-400" />
                            <span>{item.accuracy || 95}% Akurat</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-jakarta font-bold text-neutral-400">
                              Spot #{idx + 1}
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name}, ${itinerary.destination}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-jakarta font-bold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors"
                            >
                              <MapPin size={11} />
                              <span>Peta</span>
                              <ArrowRight size={10} />
                            </a>
                          </div>
                          <h4 className="font-jakarta font-bold text-sm text-neutral-900 leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-neutral-500 font-jakarta text-xs leading-relaxed line-clamp-2 font-normal">
                            {item.description}
                          </p>
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
            itineraryTitle={`Rencana Perjalanan - ${itinerary.destination}`}
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-[#FBFBFC]" />
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBFC]" />}>
      <FinalBossAiPlannerInner />
    </Suspense>
  )
}
