'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Clock, DollarSign, Users, Calendar, ChevronDown,
  ChevronUp, Sparkles, Sun, Utensils, BedDouble, Lightbulb, BookOpen
} from 'lucide-react'
import Navbar from '@/components/Navbar'

// ─── Types ───────────────────────────────────────────────────────────────────

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

const PREFERENCE_OPTIONS = ['Beach', 'Culture', 'Food', 'Adventure', 'Shopping']
const BUDGET_OPTIONS = ['Budget', 'Mid-range', 'Luxury']

// ─── Sub-components ──────────────────────────────────────────────────────────

function DayAccordion({ day, index }: { day: Day; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-black/[0.02] transition-colors duration-150"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
            {day.day}
          </span>
          <div>
            <p className="font-semibold text-sm text-black" style={{ letterSpacing: '-0.02em' }}>{day.title}</p>
            <p className="text-xs text-black/40">{day.estimatedDailyCost} est. · {day.activities.length} activities</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-black/40 shrink-0" /> : <ChevronDown size={16} className="text-black/40 shrink-0" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-black/[0.04]">
          {/* Timeline */}
          <div className="pt-4 space-y-3">
            {day.activities.map((act, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-xs font-medium text-black/40 w-12 text-right">{act.time}</span>
                </div>
                <div className="flex-1 bg-[#F5F5F5] rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-black">{act.activity}</p>
                    <span className="text-xs text-black/40 shrink-0">{act.cost}</span>
                  </div>
                  <p className="text-xs text-black/50 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} />
                    {act.location} · {act.duration}
                  </p>
                  {act.tips && (
                    <p className="text-xs text-black/40 mt-1.5 flex items-start gap-1">
                      <Lightbulb size={10} className="mt-0.5 shrink-0" />
                      {act.tips}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Meals */}
          <div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Utensils size={11} /> Meals
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-[#F5F5F5] rounded-xl p-3">
                  <p className="text-xs text-black/40 capitalize mb-0.5">{meal}</p>
                  <p className="text-xs font-medium text-black">{day.meals[meal]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="flex items-center gap-2 text-sm">
            <BedDouble size={14} className="text-black/40 shrink-0" />
            <span className="text-black/50 text-xs">Stay:</span>
            <span className="text-xs font-medium text-black">{day.accommodation}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ItineraryPage() {
  const router = useRouter()

  // Form state
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(5)
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('Mid-range')
  const [preferences, setPreferences] = useState<string[]>([])

  // Result state
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        body: JSON.stringify({
          destination,
          duration,
          travelers,
          budget,
          preferences: preferences.join(', ') || 'general sightseeing',
        }),
      })
      if (!res.ok) throw new Error('Failed to generate itinerary')
      const data = await res.json()
      setItinerary(data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-[88rem] mx-auto">

          {/* Page header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={12} />
              AI-Powered Planner
            </div>
            <h1 className="text-4xl font-semibold text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
              Build your perfect itinerary
            </h1>
            <p className="text-base text-black/50 max-w-xl">
              Tell us where you want to go and our AI will craft a day-by-day plan tailored to your preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* ── Form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-6 sticky top-24">

                {/* Destination */}
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Bali, Tokyo, Paris"
                      className="w-full bg-[#F5F5F5] rounded-xl pl-8 pr-3 py-2.5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                  </div>
                </div>

                {/* Duration slider */}
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">
                    Duration — <span className="text-black font-bold">{duration} {duration === 1 ? 'day' : 'days'}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-black"
                  />
                  <div className="flex justify-between text-xs text-black/30 mt-1">
                    <span>1 day</span>
                    <span>14 days</span>
                  </div>
                </div>

                {/* Travelers */}
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">
                    Travelers
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/60 hover:border-black/40 hover:text-black transition-colors"
                      aria-label="Decrease travelers"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold text-black w-6 text-center">{travelers}</span>
                    <button
                      onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/60 hover:border-black/40 hover:text-black transition-colors"
                      aria-label="Increase travelers"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">
                    Budget
                  </label>
                  <div className="flex gap-2">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setBudget(opt)}
                        className={`flex-1 text-xs py-2 rounded-full border transition-all duration-200 ${
                          budget === opt
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black/60 border-black/10 hover:border-black/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">
                    Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCE_OPTIONS.map((pref) => (
                      <button
                        key={pref}
                        onClick={() => togglePreference(pref)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          preferences.includes(pref)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black/60 border-black/10 hover:border-black/40'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !destination.trim()}
                  className="w-full bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-black/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generate Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Results ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Loading state */}
              {loading && (
                <div className="bg-white rounded-2xl border border-black/[0.04] p-16 flex flex-col items-center text-center">
                  <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-5" />
                  <p className="text-base font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
                    AI is crafting your perfect itinerary…
                  </p>
                  <p className="text-sm text-black/40 mt-1">This may take a few seconds</p>
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="bg-white rounded-2xl border border-black/[0.04] p-8 text-center">
                  <p className="text-sm text-black/50">{error}</p>
                </div>
              )}

              {/* Empty / idle state */}
              {!loading && !error && !itinerary && (
                <div className="bg-white rounded-2xl border border-black/[0.04] p-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 text-3xl">✈️</div>
                  <h3 className="text-base font-semibold text-black mb-1" style={{ letterSpacing: '-0.02em' }}>
                    Your itinerary will appear here
                  </h3>
                  <p className="text-sm text-black/40">Fill in the form and hit Generate Itinerary.</p>
                </div>
              )}

              {/* Itinerary result */}
              {itinerary && !loading && (
                <>
                  {/* Hero summary */}
                  <div className="bg-black text-white rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-white/50 text-xs mb-1">Your AI-generated itinerary</p>
                        <h2 className="text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>{itinerary.destination}</h2>
                      </div>
                      <button
                        onClick={() => router.push('/booking')}
                        className="bg-white text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-white/90 transition-colors shrink-0"
                      >
                        Book This Trip
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-white/50 text-xs mb-0.5 flex items-center gap-1"><Calendar size={10} /> Duration</p>
                        <p className="text-sm font-semibold">{itinerary.duration} days</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-white/50 text-xs mb-0.5 flex items-center gap-1"><DollarSign size={10} /> Est. Cost</p>
                        <p className="text-sm font-semibold">{itinerary.totalEstimatedCost}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-white/50 text-xs mb-0.5 flex items-center gap-1"><Sun size={10} /> Best Time</p>
                        <p className="text-sm font-semibold">{itinerary.bestTimeToVisit}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-white/50 text-xs mb-0.5 flex items-center gap-1"><Users size={10} /> Travelers</p>
                        <p className="text-sm font-semibold">{travelers} {travelers === 1 ? 'person' : 'people'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Day-by-day accordion */}
                  <div>
                    <h3 className="text-sm font-semibold text-black/50 uppercase tracking-wider mb-3">Day by Day</h3>
                    <div className="space-y-3">
                      {itinerary.days.map((day, i) => (
                        <DayAccordion key={day.day} day={day} index={i} />
                      ))}
                    </div>
                  </div>

                  {/* Travel tips */}
                  {itinerary.travelTips?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
                      <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                        <Lightbulb size={14} />
                        Travel Tips
                      </h3>
                      <ul className="space-y-2">
                        {itinerary.travelTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-black/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Local phrases */}
                  {itinerary.localPhrases?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
                      <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                        <BookOpen size={14} />
                        Useful Local Phrases
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {itinerary.localPhrases.map((p, i) => (
                          <div key={i} className="bg-[#F5F5F5] rounded-xl p-3">
                            <p className="text-sm font-semibold text-black">{p.phrase}</p>
                            <p className="text-xs text-black/40 mt-0.5">{p.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="bg-white rounded-2xl border border-black/[0.04] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-black text-sm" style={{ letterSpacing: '-0.02em' }}>
                        Ready to make this trip real?
                      </p>
                      <p className="text-xs text-black/40 mt-0.5">Browse packages and book your adventure.</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Link
                        href={`/search?destination=${encodeURIComponent(itinerary.destination)}`}
                        className="text-sm font-medium border border-black/10 px-5 py-2.5 rounded-full hover:border-black/40 transition-colors"
                      >
                        Find Packages
                      </Link>
                      <button
                        onClick={() => router.push('/booking')}
                        className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/80 transition-colors"
                      >
                        Book This Trip
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
