'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, DollarSign, Users, Calendar,
  ChevronDown, Sparkles, Sun, Utensils,
  BedDouble, Lightbulb, BookOpen, ArrowRight, Clock
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import gsap from 'gsap'

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

interface Itinerary {
  destination: string
  duration: number
  totalEstimatedCost: string
  days: Day[]
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

function DayAccordion({ day, index }: { day: Day; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${open ? 'border-slate-200/60 shadow-sm' : 'border-slate-100/40'} bg-white/90 backdrop-blur-md`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50/50"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 transition-all duration-300 ${open ? 'bg-slate-900 text-white shadow-sm' : 'bg-[#E8EFF5] text-slate-700'}`}>
            {day.day}
          </span>
          <div>
            <p className="font-semibold text-sm text-slate-800" style={{ letterSpacing: '-0.02em' }}>{day.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{day.estimatedDailyCost} · {day.activities.length} activities</p>
          </div>
        </div>
        <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6 space-y-5 border-t border-slate-100/55">
          {/* Timeline */}
          <div className="pt-5 space-y-2">
            {day.activities.map((act, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-end shrink-0 pt-3">
                  <span className="text-[10px] font-semibold text-slate-400 w-12 text-right tabular-nums">{act.time}</span>
                  {i < day.activities.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-1 mx-auto" style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 bg-[#F0F4F8] rounded-xl p-4 hover:bg-[#E8EFF5] transition-colors duration-300">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold text-slate-800 leading-snug" style={{ letterSpacing: '-0.01em' }}>{act.activity}</p>
                    <span className="text-xs font-semibold text-slate-500 shrink-0 bg-white/70 rounded-full px-2 py-0.5">{act.cost}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={9} className="shrink-0 text-slate-400" />
                    {act.location}
                    <span className="text-slate-300">·</span>
                    <Clock size={9} className="shrink-0 text-slate-400" />
                    {act.duration}
                  </p>
                  {act.tips && (
                    <p className="text-xs text-slate-550 mt-2 flex items-start gap-1.5 pl-0.5">
                      <Lightbulb size={9} className="mt-0.5 shrink-0 text-amber-500" />
                      {act.tips}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Meals */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Utensils size={9} /> Meals
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-[#F0F4F8] rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 capitalize font-semibold tracking-wide mb-1">{meal}</p>
                  <p className="text-xs font-medium text-slate-700 leading-snug">{day.meals[meal]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="flex items-center gap-2.5 bg-[#F0F4F8] rounded-xl px-4 py-3">
            <BedDouble size={13} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Accommodation</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">{day.accommodation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  const router = useRouter()

  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(5)
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('Mid-range')
  const [preferences, setPreferences] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [loadingStep, setLoadingStep] = useState(0)
  const loadingMessages = [
    'Searching global travel databases...',
    'Optimizing daily sightseeing routes...',
    'Curating local dining & accommodation...',
    'Calculating costs & converting currency...',
    'Generating travel tips & local phrases...'
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

  // Initial load animation
  useEffect(() => {
    if (!headerRef.current || !formRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      gsap.fromTo(formRef.current, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.15 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  // GSAP animation on itinerary results load
  useEffect(() => {
    if (!itinerary || !resultsRef.current) return
    const ctx = gsap.context(() => {
      // Fade in results
      gsap.fromTo(resultsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      // Stagger columns
      const panels = resultsRef.current.children
      gsap.fromTo(panels, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' })
    }, resultsRef)
    return () => ctx.revert()
  }, [itinerary])

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
      if (!res.ok) throw new Error('Failed')
      setItinerary(await res.json())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-[#F0F4F8] relative overflow-hidden flex flex-col justify-between" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      {/* Panoramic Blurred Background for Initial State */}
      {!itinerary && (
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80" 
            alt="Scenic Background" 
            className="w-full h-full object-cover blur-[10px] scale-105 opacity-40 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4F8]/60 via-transparent to-[#F0F4F8]/90" />
        </div>
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col justify-center">
        {!itinerary ? (
          /* Centered State */
          <div className="max-w-xl w-full mx-auto flex flex-col items-center">
            {/* Centered Header */}
            <div ref={headerRef} className="text-center mb-8 opacity-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/5 px-3.5 py-1.5 rounded-full mb-5">
                <Sparkles size={10} className="text-slate-400 animate-pulse" />
                AI Travel Planner
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-4" style={{ letterSpacing: '-0.04em' }}>
                Plan your perfect trip.
              </h1>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Describe where you want to go — our AI builds a detailed, day-by-day itinerary in seconds.
              </p>
            </div>

            {/* Glassmorphism Control Panel Form */}
            <div ref={formRef} className="w-full bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl p-7 space-y-6 opacity-0">
              {loading ? (
                /* Shifting loader component */
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
                    <p className="text-xs text-slate-400">Powered by Gemini AI · please wait</p>
                  </div>
                </div>
              ) : (
                /* Form Inputs */
                <>
                  {/* Destination */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Where to</label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Bali, Tokyo, Paris…"
                        className="w-full bg-[#E8EFF5] rounded-xl pl-9 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-[#DFE7EE] transition-all duration-300"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      />
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</label>
                        <span className="text-xs font-bold text-slate-800">{duration} {duration === 1 ? 'day' : 'days'}</span>
                      </div>
                      <input
                        type="range" min={1} max={14} value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full accent-slate-800 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Travelers */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Travelers</label>
                      <div className="flex items-center gap-3.5">
                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
                          className="w-9 h-9 rounded-xl bg-[#E8EFF5] flex items-center justify-center text-slate-500 hover:bg-[#DFE7EE] hover:text-slate-800 active:scale-[0.91] hover:scale-[1.05] transition-all duration-300 ease-out font-semibold">−</button>
                        <span className="text-sm font-bold text-slate-800 w-4 text-center">{travelers}</span>
                        <button onClick={() => setTravelers(Math.min(20, travelers + 1))}
                          className="w-9 h-9 rounded-xl bg-[#E8EFF5] flex items-center justify-center text-slate-500 hover:bg-[#DFE7EE] hover:text-slate-800 active:scale-[0.91] hover:scale-[1.05] transition-all duration-300 ease-out font-semibold">+</button>
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Budget</label>
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

                  {/* Interests */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Interests</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
                        <button key={label} onClick={() => togglePreference(label)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-300 ease-out active:scale-[0.94] hover:scale-[1.03] flex items-center gap-1.5 hover:shadow-sm ${preferences.includes(label) ? 'bg-slate-900 text-slate-100 border-slate-900 shadow-md' : 'bg-[#E8EFF5] text-slate-500 border-transparent hover:text-slate-800'}`}>
                          <span>{emoji}</span>{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !destination.trim()}
                    className="w-full bg-slate-900 text-white text-sm font-semibold py-3.5 rounded-2xl hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-[0.97] hover:scale-[1.01] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles size={14} />Generate Itinerary
                  </button>
                </>
              )}
              
              {/* Error */}
              {error && !loading && (
                <div className="pt-4 border-t border-slate-150 text-center">
                  <p className="text-xs text-red-500 font-semibold">{error}</p>
                  <button onClick={handleGenerate} className="mt-2 text-xs font-bold text-slate-800 hover:text-slate-900 active:scale-95 transition-all duration-200 underline underline-offset-2">Try again</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results Layout (Active State) */
          <div ref={resultsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start opacity-0">
            {/* Details panel on the left (4 cols) */}
            <div className="lg:col-span-4 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl p-6 space-y-6 lg:sticky lg:top-24">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Destination</span>
                <h2 className="text-3xl font-bold text-slate-800 leading-tight tracking-tight mb-4" style={{ letterSpacing: '-0.03em' }}>{itinerary.destination}</h2>
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { icon: <Calendar size={11} />, label: 'Duration', value: `${itinerary.duration} days` },
                    { icon: <DollarSign size={11} />, label: 'Est. Cost', value: itinerary.totalEstimatedCost },
                    { icon: <Sun size={11} />, label: 'Best Time', value: itinerary.bestTimeToVisit },
                    { icon: <Users size={11} />, label: 'Travelers', value: `${travelers} pax` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-[#E8EFF5] rounded-2xl p-3">
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">{icon}{label}</p>
                      <p className="text-slate-800 text-xs font-bold leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/80 flex flex-col gap-2">
                <button onClick={() => { setItinerary(null); setDestination('') }} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-2.5 rounded-full border border-slate-200/50 hover:border-slate-300 active:scale-[0.96] hover:scale-[1.01] hover:shadow-sm transition-all duration-300 text-center">Plan another trip</button>
                <button onClick={() => router.push('/booking')} className="w-full bg-slate-900 text-white text-xs font-semibold py-3 rounded-full hover:bg-slate-850 active:scale-[0.96] hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2">Book trip <ArrowRight size={12} /></button>
              </div>
            </div>

            {/* Itinerary result details on the right (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Day accordion */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-4">Day by Day</p>
                <div className="space-y-2.5">
                  {itinerary.days.map((day, i) => (
                    <DayAccordion key={day.day} day={day} index={i} />
                  ))}
                </div>
              </div>

              {/* Travel tips + phrases side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {itinerary.travelTips?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Lightbulb size={11} className="text-amber-500" /> Travel Tips
                    </h3>
                    <ul className="space-y-3">
                      {itinerary.travelTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-650 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-[#F0F4F8] flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">{i + 1}</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {itinerary.localPhrases?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BookOpen size={11} className="text-slate-500" /> Local Phrases
                    </h3>
                    <div className="space-y-2">
                      {itinerary.localPhrases.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                          <p className="text-sm font-semibold text-slate-800">{p.phrase}</p>
                          <p className="text-xs text-slate-400">{p.meaning}</p>
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
  )
}
