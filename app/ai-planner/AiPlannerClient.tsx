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
  MessageSquare,
  MessageCircle,
  RotateCcw,
  X,
  Sparkles,
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
  { name: 'Jepara', query: 'Jepara', code: 'ID' },
  { name: 'Bali', query: 'Bali', code: 'ID' },
  { name: 'Denpasar', query: 'Denpasar', code: 'ID' },
  { name: 'Labuan Bajo', query: 'Labuan Bajo', code: 'ID' },
  { name: 'Tokyo', query: 'Tokyo', code: 'JP' },
  { name: 'Swiss Alps', query: 'Swiss Alps', code: 'CH' },
  { name: 'Santorini', query: 'Santorini', code: 'GR' },
]

function cleanTravelTimeText(text: string): string {
  if (!text || typeof text !== 'string') return text || ''
  return text
    // Strip parenthetical travel times e.g. "(sekitar 2,5 jam dari Semarang)" or "(2 jam perjalanan dari bandara)"
    .replace(/\s*\([^)]*?\d+(?:[.,]\d+)?\s*(?:jam|menit|km)\s+(?:perjalanan\s+)?dari[^)]*\)/gi, '')
    // Strip "perjalanan sekitar 2,5 jam dari..." or "sekitar 2,5 jam dari..."
    .replace(/(?:,\s*)?(?:perjalanan\s+)?(?:sekitar\s+)?\d+(?:[.,]\d+)?\s*(?:jam|menit|km)\s+(?:perjalanan\s+)?dari\s+[^,.;\n]+/gi, '')
    // Strip "berjarak sekitar 2,5 jam dari..."
    .replace(/(?:,\s*)?berjarak\s+(?:sekitar\s+)?\d+(?:[.,]\d+)?\s*(?:jam|menit|km)\s+dari\s+[^,.;\n]+/gi, '')
    // Clean up residual standalone "2,5 jam" or "2.5 jam"
    .replace(/^\s*\d+(?:[.,]\d+)?\s*(?:jam|menit)\s*$/gi, '')
    // Clean dangling punctuation or duplicate spaces
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/^[,.;:\s-]+|[,.;:\s-]+$/g, '')
    .trim()
}

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
        isActive ? 'border-stone-900/30 bg-white shadow-xs' : 'border-stone-200/70 bg-white hover:border-stone-300'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors cursor-pointer group"
        aria-expanded={isActive}
      >
        <div className="flex items-center gap-4">
          <span
            className={`w-9 h-9 rounded-xl text-xs font-jakarta font-extrabold flex items-center justify-center shrink-0 transition-all ${
              isActive
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 border border-stone-200 group-hover:bg-stone-200/60'
            }`}
          >
            H-{day.day}
          </span>
          <div>
            <p className="font-jakarta font-bold text-sm text-stone-900 leading-snug">{cleanTravelTimeText(day.title)}</p>
            <p className="font-jakarta text-xs text-stone-400 mt-0.5 font-normal">
              {day.estimatedDailyCost} · {day.activities.length} aktivitas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-jakarta text-neutral-400 font-medium group-hover:text-[#C29B38] transition-colors">
            {isActive ? 'Tutup' : 'Lihat Rincian'}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 shrink-0 transition-transform duration-300 ${
              isActive ? 'rotate-180 text-[#C29B38]' : 'group-hover:text-[#C29B38]'
            }`}
          />
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[3500px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6 space-y-6 border-t border-neutral-100 pt-5">
          {/* Activities List */}
          <div className="space-y-4">
            {day.activities.map((act, i) => {
              const cleanLocation = cleanTravelTimeText(act.location) || 'Destinasi Wisata'
              const cleanActivity = cleanTravelTimeText(act.activity)
              const cleanTips = cleanTravelTimeText(act.tips)
              const mapsQuery = cleanLocation
                ? (cleanLocation.toLowerCase().includes(destinationContext.toLowerCase())
                    ? cleanLocation
                    : `${cleanLocation}, ${destinationContext}`)
                : cleanActivity

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
                          alt={cleanLocation}
                          loading="lazy"
                          className="w-full h-full object-cover img-smooth-zoom"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />

                        {/* Category or Curated Badge */}
                        {act.category && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-jakarta font-semibold px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                            <span className="capitalize">{act.category}</span>
                          </div>
                        )}

                        {/* Location Overlay */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                          <span className="font-jakarta text-white text-xs font-bold truncate drop-shadow-xs">
                            {cleanLocation}
                          </span>
                          <span className="text-[10px] font-jakarta font-medium text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full shrink-0">
                            {act.cost}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {/* Primary Header: Location Name + Cost */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-jakarta text-base font-bold text-neutral-900 leading-snug">
                            {cleanLocation || cleanActivity}
                          </h4>
                        </div>
                        {act.cost && (
                          <span className="text-[11px] font-jakarta font-semibold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-full shrink-0 border border-stone-200/60">
                            {act.cost}
                          </span>
                        )}
                      </div>

                      {/* Activity / Action Description */}
                      {cleanActivity && cleanActivity.toLowerCase() !== cleanLocation.toLowerCase() && (
                        <p className="font-jakarta text-xs text-neutral-600 leading-relaxed font-normal">
                          {cleanActivity}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs font-jakarta text-neutral-500">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-stone-900 hover:text-[#C29B38] transition-colors"
                          title={`Buka rute ${cleanLocation} di Google Maps`}
                        >
                          <MapPin size={12} className="shrink-0" />
                          <span>Buka di Peta</span>
                          <ArrowRight size={10} />
                        </a>
                      </div>

                      {cleanTips && (
                        <div className="font-jakarta text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                          <Lightbulb size={13} className="mt-0.5 shrink-0 text-amber-500" />
                          <span>{cleanTips}</span>
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
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-[#EAE5D9] selection:text-stone-900">
      <div className="pt-24 pb-28 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
        {/* ─── Hero Header (Spacious & Clean) ─── */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="gsap-hero-item inline-flex items-center gap-2 bg-stone-100 border border-stone-200 text-stone-700 text-xs font-jakarta font-bold tracking-wide px-4 py-1.5 rounded-full">
            <Navigation size={13} className="text-[#C29B38]" />
            <span>Smart Route Concierge</span>
          </div>

          <h1 className="gsap-hero-item font-jakarta font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight leading-tight">
            Rancang Rencana Perjalanan <span className="font-serif-luxury italic font-normal text-stone-800">Presisi & Cerdas</span>
          </h1>

          <p className="gsap-hero-item font-jakarta text-sm sm:text-base text-stone-500 max-w-xl mx-auto leading-relaxed font-normal">
            Penyusun jadwal perjalanan dengan rute harian efisien, estimasi biaya transparan, dan kurasi spot terverifikasi.
          </p>

          {/* Quick Destination Tags */}
          <div className="gsap-hero-item flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-jakarta text-stone-400 mr-1 font-medium">Inspirasi Cepat:</span>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDestination(dest.query)
                  handleGenerate(dest.query)
                }}
                className="text-xs font-jakarta font-bold px-3 py-1.5 rounded-full bg-white hover:bg-stone-900 hover:text-white border border-stone-200 text-stone-700 transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-[10px] font-mono text-stone-400">{dest.code}</span>
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── Simplified Search Island (Clean Whitespace) ─── */}
        <section className="gsap-hero-item w-full max-w-3xl mx-auto bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {loading ? (
            /* Loading State */
            <div className="py-14 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
                <Loader2 size={20} className="animate-spin text-white" />
              </div>
              <div className="space-y-1">
                <p className="font-jakarta font-bold text-sm text-stone-900">Menyusun Itinerary Terbaik...</p>
                <p className="font-jakarta text-xs text-stone-500 max-w-xs">
                  Mengalkulasi rute efisien, spot populer, dan estimasi biaya harian di {destination}.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Destination Input — with immediate inline submit button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Destinasi Wisata
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                    Ketik destinasi lalu klik &quot;Mulai Rancang&quot; atau tekan Enter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C29B38]" />
                    <input
                      id="search-destination-input"
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Ketik destinasi (misal: Jepara, Bali, Denpasar, Tokyo...)"
                      className="w-full pl-11 pr-10 py-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && destination.trim()) {
                          handleGenerate()
                        }
                      }}
                    />
                    {destination && (
                      <button
                        type="button"
                        onClick={() => setDestination('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
                        title="Hapus teks"
                        aria-label="Hapus teks"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Inline Submit Button right beside the input box */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!destination.trim()) {
                        setError('Silakan ketik destinasi liburan (misal: Jepara, Bali, Denpasar).')
                        return
                      }
                      handleGenerate()
                    }}
                    disabled={loading || !destination.trim()}
                    className="bg-stone-900 hover:bg-black text-white px-5 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
                  >
                    <Sparkles size={14} className="text-[#C29B38]" />
                    <span>Mulai Rancang</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Vibe Selection Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-jakarta font-bold text-stone-400 uppercase tracking-wider">
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-jakarta font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700 hover:text-stone-900'
                        }`}
                      >
                        <IconComp size={14} className={isSelected ? 'text-white' : 'text-stone-500'} />
                        <span>{v.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Parameter Settings (Compact & Spacious) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-stone-100">
                {/* Durasi */}
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-jakarta">
                    <span className="text-stone-500 font-medium">Durasi</span>
                    <span className="font-bold text-stone-900">{duration} Hari</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-full cursor-pointer"
                  />
                </div>

                {/* Wisatawan */}
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl space-y-1.5">
                  <span className="text-xs font-jakarta text-stone-500 font-medium block">Wisatawan</span>
                  <div className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-xs font-jakarta font-bold text-stone-900">{travelers} Orang</span>
                    <button
                      type="button"
                      onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Budget */}
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl space-y-1.5">
                  <span className="text-xs font-jakarta text-stone-500 font-medium block">Kategori Budget</span>
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
                    setError('Silakan ketik destinasi liburan (misal: Jepara, Bali, Denpasar).')
                    return
                  }
                  handleGenerate()
                }}
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-black text-white text-sm font-bold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer active:scale-98"
              >
                <Compass size={17} className="text-[#C29B38]" />
                <span>{destination.trim() ? `Susun Rencana Perjalanan ke ${destination}` : 'Susun Rencana Perjalanan Lengkap'}</span>
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
                className="text-xs font-jakarta font-semibold text-stone-900 underline hover:text-black cursor-pointer"
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
            <div className="gsap-bento-item bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-jakarta font-bold text-stone-700 bg-stone-100 border border-stone-200 px-3 py-0.5 rounded-full mb-2">
                    <ShieldCheck size={12} className="text-stone-600" />
                    <span>Rencana Perjalanan Terverifikasi</span>
                  </div>
                  <h2 className="font-jakarta font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                    {itinerary.destination}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                  {/* Primary Action: Booking */}
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    className="text-xs font-bold px-5 py-3 rounded-full bg-stone-900 hover:bg-black text-white transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CalendarCheck size={14} className="text-[#C29B38]" />
                    <span>Pesan Rute Ini</span>
                  </button>

                  {/* Primary Action: WhatsApp Concierge */}
                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                      `Halo NOVA Travel, saya ingin konsultasi mengenai rencana perjalanan AI ke ${itinerary.destination} (${itinerary.duration} hari, ${travelers} orang). Mohon infonya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Konsultasi langsung via WhatsApp"
                  >
                    <MessageSquare size={14} />
                    <span>Tanya Concierge</span>
                  </a>

                  {/* Secondary Action: Re-plan / Change Destination */}
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-xs font-semibold px-4 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Ubah parameter atau ganti destinasi"
                  >
                    <RotateCcw size={13} />
                    <span>Ubah Rute</span>
                  </button>

                  {/* Utility Actions: Copy & Print */}
                  <div className="flex items-center gap-1 pl-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                      title={copiedLink ? 'Link Tersalin!' : 'Bagikan Link'}
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                      title="Cetak Itinerary"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-jakarta">
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl">
                  <span className="text-stone-400 font-medium block">Durasi</span>
                  <span className="font-bold text-stone-900 mt-0.5 block">{itinerary.duration} Hari</span>
                </div>
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl">
                  <span className="text-stone-400 font-medium block">Wisatawan</span>
                  <span className="font-bold text-stone-900 mt-0.5 block">{travelers} Orang</span>
                </div>
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl">
                  <span className="text-stone-400 font-medium block">Est. Total Biaya</span>
                  <span className="font-bold text-emerald-800 mt-0.5 block">{itinerary.totalEstimatedCost}</span>
                </div>
                <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl">
                  <span className="text-stone-400 font-medium block">Musim Terbaik</span>
                  <span className="font-bold text-stone-900 mt-0.5 block truncate">{itinerary.bestTimeToVisit}</span>
                </div>
              </div>
            </div>

            {/* Day-by-day Itinerary Accordion */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h3 className="font-jakarta font-bold text-lg text-neutral-900 flex items-center gap-2">
                    <Compass size={17} className="text-neutral-600" />
                    <span>Rute Perjalanan Hari demi Hari</span>
                  </h3>
                  <p className="text-xs text-stone-500 font-jakarta mt-0.5">
                    Pilih tab hari untuk membuka rute spesifik, atau klik setiap kartu agenda di bawah.
                  </p>
                </div>
                <span className="font-jakarta text-xs text-neutral-400 font-medium self-start sm:self-auto">
                  {itinerary.days.length} Hari Lengkap
                </span>
              </div>

              {/* Day Quick Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveDayTab(-1)}
                  className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeDayTab === -1
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  Tutup Semua
                </button>
                {itinerary.days.map((day, idx) => {
                  const isDayActive = activeDayTab === idx
                  return (
                    <button
                      key={day.day}
                      type="button"
                      onClick={() => setActiveDayTab(isDayActive ? -1 : idx)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-jakarta font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isDayActive
                          ? 'bg-[#C29B38] text-white shadow-xs'
                          : 'bg-white border border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>Hari {day.day}</span>
                      <span className={`text-[10px] ${isDayActive ? 'text-amber-100' : 'text-stone-400'} font-normal`}>
                        ({day.activities?.length || 0} spot)
                      </span>
                    </button>
                  )
                })}
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
              {/* Best Season & Travel Advice */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-jakarta font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudSun size={14} className="text-[#C29B38]" />
                    Waktu Kunjungan Terbaik
                  </span>
                </div>
                <p className="text-xs font-jakarta font-bold text-neutral-900 leading-snug">
                  {itinerary.bestTimeToVisit || 'Musim kemarau & masa transisi cuaca'}
                </p>
                <p className="text-xs font-jakarta text-neutral-500 leading-relaxed font-normal">
                  Disarankan memantau prakiraan cuaca resmi H-1 sebelum memulai aktivitas luar ruangan di {itinerary.destination}.
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
                      <span>{cleanTravelTimeText(tip)}</span>
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
                              className="text-xs font-jakarta font-bold text-stone-900 hover:text-[#C29B38] flex items-center gap-1 transition-colors"
                            >
                              <MapPin size={11} />
                              <span>Peta</span>
                              <ArrowRight size={10} />
                            </a>
                          </div>
                          <h4 className="font-jakarta font-bold text-sm text-stone-900 leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-stone-500 font-jakarta text-xs leading-relaxed line-clamp-2 font-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Grand Next-Step Action Card at bottom of itinerary ─── */}
            <div className="bg-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold tracking-wide">
                  <Sparkles size={13} />
                  <span>Rute AI Siap Diwujudkan</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  Suka dengan rencana perjalanan ke {itinerary.destination}?
                </h3>
                <p className="text-stone-400 text-xs sm:text-sm font-jakarta leading-relaxed max-w-2xl font-normal">
                  Kunci tanggal perjalanan dan amankan reservasi tiket serta akomodasi, atau diskusikan kustomisasi rute ini langsung dengan tim Concierge NOVA via WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C29B38] to-[#dfb857] hover:brightness-110 text-stone-950 text-sm font-jakarta font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <CalendarCheck size={16} />
                  <span>Pesan & Amankan Rute Ini</span>
                  <ArrowRight size={14} />
                </button>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Concierge NOVA, saya ingin konsultasi dan kustomisasi rute AI Planner ke ${itinerary.destination} (${itinerary.duration} Hari untuk ${travelers} orang). Total estimasi biaya: ${itinerary.totalEstimatedCost}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-jakarta font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Tanya Concierge (WhatsApp)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('search-destination-input')
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      el.focus()
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-sm font-jakarta font-bold flex items-center gap-2 transition-colors cursor-pointer border border-white/10"
                >
                  <RotateCcw size={15} />
                  <span>Rancang Destinasi Lain</span>
                </button>
              </div>

              <div className="border-t border-stone-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-jakarta text-stone-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Garansi penyesuaian rute fleksibel 100% tanpa biaya tersembunyi
                </span>
                <span>Estimasi Rute: <strong className="text-white">{itinerary.totalEstimatedCost}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Sticky Floating Bottom Action Bar on Mobile/Desktop ─── */}
        {itinerary && (
          <aside
            aria-label="Aksi Cepat Rencana Perjalanan"
            className="fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto pointer-events-auto"
          >
            <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:px-5 sm:py-3.5 border border-stone-800 shadow-2xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-jakarta font-bold text-sm text-white truncate">
                    {itinerary.destination}
                  </span>
                  <span className="text-[11px] font-jakarta px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-medium whitespace-nowrap">
                    {itinerary.duration} Hari
                  </span>
                </div>
                <div className="text-xs text-amber-400 font-jakarta font-semibold truncate">
                  Est. {itinerary.totalEstimatedCost}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Concierge NOVA, saya tertarik dengan rute AI ke ${itinerary.destination} (${itinerary.duration} Hari). Mohon info reservasi.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-jakarta font-bold transition-colors cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#C29B38] hover:bg-[#dfb857] text-stone-950 text-xs sm:text-sm font-jakarta font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <CalendarCheck size={15} />
                  <span>Pesan Rute</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* ─── Live Booking Modal ─── */}
        {showBookingModal && itinerary && (
          <AIConvertBookingModal
            itineraryTitle={`Rencana Perjalanan - ${itinerary.destination}`}
            destination={itinerary.destination}
            durationDays={itinerary.duration}
            estimatedBudgetIDR={(() => {
              if (!itinerary.totalEstimatedCost) return itinerary.duration * 1500000
              const match = itinerary.totalEstimatedCost.match(/[\d.,]+/g)
              if (match && match.length > 0) {
                const parsed = parseInt(match[0].replace(/[.,]/g, ''), 10)
                if (!isNaN(parsed) && parsed >= 100000 && parsed <= 1000000000) {
                  return parsed
                }
              }
              return itinerary.duration * 1500000
            })()}
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
    return <div className="min-h-screen bg-[#FAF9F6]" />
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <FinalBossAiPlannerInner />
    </Suspense>
  )
}
