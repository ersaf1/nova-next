'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, DollarSign, Users, Calendar,
  ChevronDown, Sparkles, Sun, Utensils,
  BedDouble, Lightbulb, BookOpen, ArrowRight, Clock
} from 'lucide-react'
import Navbar from '@/components/Navbar'

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
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${open ? 'border-black/10 shadow-sm' : 'border-black/[0.04]'} bg-white`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black/60'}`}>
            {day.day}
          </span>
          <div>
            <p className="font-semibold text-sm text-black" style={{ letterSpacing: '-0.02em' }}>{day.title}</p>
            <p className="text-xs text-black/40 mt-0.5">{day.estimatedDailyCost} · {day.activities.length} activities</p>
          </div>
        </div>
        <ChevronDown size={15} className={`text-black/30 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6 space-y-5 border-t border-black/[0.04]">
          {/* Timeline */}
          <div className="pt-5 space-y-2">
            {day.activities.map((act, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-end shrink-0 pt-3">
                  <span className="text-[10px] font-semibold text-black/30 w-12 text-right tabular-nums">{act.time}</span>
                  {i < day.activities.length - 1 && (
                    <div className="w-px flex-1 bg-black/5 mt-1 mx-auto" style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 bg-[#F5F5F5] rounded-xl p-4 hover:bg-black/[0.03] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold text-black leading-snug" style={{ letterSpacing: '-0.01em' }}>{act.activity}</p>
                    <span className="text-xs font-medium text-black/50 shrink-0 bg-white rounded-full px-2 py-0.5">{act.cost}</span>
                  </div>
                  <p className="text-xs text-black/40 flex items-center gap-1.5">
                    <MapPin size={9} className="shrink-0" />
                    {act.location}
                    <span className="text-black/20">·</span>
                    <Clock size={9} className="shrink-0" />
                    {act.duration}
                  </p>
                  {act.tips && (
                    <p className="text-xs text-black/35 mt-2 flex items-start gap-1.5 pl-0.5">
                      <Lightbulb size={9} className="mt-0.5 shrink-0 text-amber-400" />
                      {act.tips}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Meals */}
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Utensils size={9} /> Meals
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-[#F5F5F5] rounded-xl p-3">
                  <p className="text-[10px] text-black/30 capitalize font-semibold tracking-wide mb-1">{meal}</p>
                  <p className="text-xs font-medium text-black leading-snug">{day.meals[meal]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="flex items-center gap-2.5 bg-[#F5F5F5] rounded-xl px-4 py-3">
            <BedDouble size={13} className="text-black/30 shrink-0" />
            <div>
              <p className="text-[10px] text-black/30 font-semibold tracking-wide uppercase">Accommodation</p>
              <p className="text-xs font-medium text-black mt-0.5">{day.accommodation}</p>
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
    <div className="min-h-screen bg-[#F5F5F5]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      <div className="pt-24 pb-32 px-6">
        <div className="max-w-[88rem] mx-auto">

          {/* Header */}
          <div className="pt-12 pb-14">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40 mb-6">
              <Sparkles size={10} className="text-black/30" />
              AI Travel Planner
            </span>
            <h1 className="text-5xl md:text-6xl font-semibold text-black leading-[1.05] mb-4" style={{ letterSpacing: '-0.03em' }}>
              Plan your<br />perfect trip.
            </h1>
            <p className="text-base text-black/40 max-w-md leading-relaxed">
              Describe where you want to go — our AI builds a detailed, day-by-day itinerary in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Form */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-black/[0.04] p-7 space-y-7 sticky top-24">

                {/* Destination */}
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest block mb-3">Where to</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/20" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Bali, Tokyo, Paris…"
                      className="w-full bg-[#F5F5F5] rounded-xl pl-9 pr-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:bg-black/[0.03] transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Duration</label>
                    <span className="text-sm font-bold text-black">{duration} {duration === 1 ? 'day' : 'days'}</span>
                  </div>
                  <input
                    type="range" min={1} max={14} value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-black h-1 rounded-full"
                  />
                  <div className="flex justify-between text-[10px] text-black/25 font-medium mt-2">
                    <span>1 day</span><span>14 days</span>
                  </div>
                </div>

                {/* Travelers */}
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest block mb-3">Travelers</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-black/50 hover:bg-black/[0.06] hover:text-black transition-colors font-medium"
                      aria-label="Decrease">−</button>
                    <span className="text-base font-bold text-black w-6 text-center">{travelers}</span>
                    <button onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-black/50 hover:bg-black/[0.06] hover:text-black transition-colors font-medium"
                      aria-label="Increase">+</button>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest block mb-3">Budget</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button key={opt} onClick={() => setBudget(opt)}
                        className={`py-2.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${budget === opt ? 'bg-black text-white border-black' : 'bg-[#F5F5F5] text-black/40 border-transparent hover:text-black/70'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest block mb-3">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
                      <button key={label} onClick={() => togglePreference(label)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 flex items-center gap-1.5 ${preferences.includes(label) ? 'bg-black text-white border-black' : 'bg-[#F5F5F5] text-black/40 border-transparent hover:text-black/70'}`}>
                        <span>{emoji}</span>{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !destination.trim()}
                  className="w-full bg-black text-white text-sm font-semibold py-3.5 rounded-2xl hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                  ) : (
                    <><Sparkles size={14} />Generate Itinerary</>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-8 space-y-5">

              {/* Loading */}
              {loading && (
                <div className="bg-white rounded-3xl border border-black/[0.04] p-20 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-14 h-14 border-[1.5px] border-black/10 rounded-full" />
                    <div className="w-14 h-14 border-[1.5px] border-t-black rounded-full animate-spin absolute inset-0" />
                    <Sparkles size={16} className="absolute inset-0 m-auto text-black/30" />
                  </div>
                  <p className="text-base font-semibold text-black mb-1" style={{ letterSpacing: '-0.02em' }}>Crafting your itinerary…</p>
                  <p className="text-sm text-black/30">Powered by Gemini AI · takes a few seconds</p>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="bg-white rounded-3xl border border-black/[0.04] p-8 text-center">
                  <p className="text-sm text-black/40">{error}</p>
                  <button onClick={handleGenerate} className="mt-4 text-xs font-semibold text-black underline underline-offset-2">Try again</button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && !itinerary && (
                <div className="bg-white rounded-3xl border border-black/[0.04] p-20 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-4xl mb-6">✈️</div>
                  <h3 className="text-base font-semibold text-black mb-2" style={{ letterSpacing: '-0.02em' }}>Your itinerary appears here</h3>
                  <p className="text-sm text-black/35 max-w-xs">Enter a destination, set your preferences, and let AI do the planning.</p>
                </div>
              )}

              {/* Result */}
              {itinerary && !loading && (
                <>
                  {/* Hero card */}
                  <div className="bg-black rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                    <div className="relative">
                      <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">AI-generated itinerary</p>
                      <div className="flex items-start justify-between gap-4 mb-8">
                        <h2 className="text-3xl font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>{itinerary.destination}</h2>
                        <button onClick={() => router.push('/booking')}
                          className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors shrink-0 flex items-center gap-2">
                          Book Trip <ArrowRight size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { icon: <Calendar size={11} />, label: 'Duration', value: `${itinerary.duration} days` },
                          { icon: <DollarSign size={11} />, label: 'Est. Cost', value: itinerary.totalEstimatedCost },
                          { icon: <Sun size={11} />, label: 'Best Time', value: itinerary.bestTimeToVisit },
                          { icon: <Users size={11} />, label: 'Travelers', value: `${travelers} ${travelers === 1 ? 'person' : 'people'}` },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="bg-white/[0.07] rounded-2xl p-4">
                            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">{icon}{label}</p>
                            <p className="text-white text-sm font-semibold leading-snug">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Day accordion */}
                  <div>
                    <p className="text-[10px] font-bold text-black/25 uppercase tracking-widest px-1 mb-4">Day by Day</p>
                    <div className="space-y-2.5">
                      {itinerary.days.map((day, i) => (
                        <DayAccordion key={day.day} day={day} index={i} />
                      ))}
                    </div>
                  </div>

                  {/* Travel tips + phrases side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {itinerary.travelTips?.length > 0 && (
                      <div className="bg-white rounded-3xl border border-black/[0.04] p-6">
                        <h3 className="text-xs font-bold text-black/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Lightbulb size={11} /> Travel Tips
                        </h3>
                        <ul className="space-y-3">
                          {itinerary.travelTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-black/70 leading-relaxed">
                              <span className="w-5 h-5 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[10px] font-bold text-black/40 shrink-0 mt-0.5">{i + 1}</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {itinerary.localPhrases?.length > 0 && (
                      <div className="bg-white rounded-3xl border border-black/[0.04] p-6">
                        <h3 className="text-xs font-bold text-black/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <BookOpen size={11} /> Local Phrases
                        </h3>
                        <div className="space-y-2">
                          {itinerary.localPhrases.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-black/[0.04] last:border-0">
                              <p className="text-sm font-semibold text-black">{p.phrase}</p>
                              <p className="text-xs text-black/35">{p.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom CTA */}
                  <div className="bg-white rounded-3xl border border-black/[0.04] px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div>
                      <p className="font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>Ready to book this trip?</p>
                      <p className="text-xs text-black/35 mt-1">Browse matching packages or go straight to booking.</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Link href={`/search?destination=${encodeURIComponent(itinerary.destination)}`}
                        className="text-sm font-semibold border border-black/10 px-5 py-2.5 rounded-full hover:border-black/30 transition-colors text-black/70 hover:text-black">
                        Find Packages
                      </Link>
                      <button onClick={() => router.push('/booking')}
                        className="text-sm font-semibold bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/80 transition-colors flex items-center gap-2">
                        Book Now <ArrowRight size={13} />
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
