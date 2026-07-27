'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, ChevronDown, SlidersHorizontal } from 'lucide-react'

const popularDestinations = [
  'Tokyo, Japan', 'Bali, Indonesia', 'Paris, France',
  'Santorini, Greece', 'New York, USA', 'Cape Town, South Africa',
  'Dubai, UAE', 'Barcelona, Spain', 'Kyoto, Japan', 'Maldives',
]

const SearchBar: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'packages' | 'experiences'>('packages')
  const [destination, setDestination] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [showTravelers, setShowTravelers] = useState(false)
  const [budget, setBudget] = useState('any')

  const filtered = popularDestinations.filter(d =>
    d.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  )

  const tabs = ['packages', 'flights', 'hotels', 'experiences'] as const

  return (
    <div className="w-full max-w-5xl">
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold capitalize tracking-wider transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white text-black shadow-lg scale-[1.02]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.18)] p-2.5 flex flex-col md:flex-row gap-1.5 border border-black/[0.03] w-full">
        <div className="relative flex-1 min-w-0 w-full">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer">
            <MapPin className="w-5 h-5 text-black/30 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-black/45 font-bold tracking-wider uppercase mb-0.5">Where to</p>
              <input
                type="text"
                value={destination}
                onChange={e => { setDestination(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Destination, country..."
                className="w-full bg-transparent text-black text-sm font-semibold placeholder-black/25 focus:outline-none"
              />
            </div>
          </div>
          {showSuggestions && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden z-50">
              {filtered.map(d => (
                <button
                  key={d}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-black/70 hover:bg-neutral-50 text-left transition-colors font-medium"
                  onMouseDown={() => {
                    setDestination(d)
                    setShowSuggestions(false)
                    const params = new URLSearchParams()
                    params.set('destination', d)
                    if (checkIn) params.set('checkin', checkIn)
                    if (checkOut) params.set('checkout', checkOut)
                    params.set('travelers', String(travelers))
                    router.push(`/search?${params.toString()}`)
                  }}
                >
                  <MapPin className="w-3.5 h-3.5 text-black/30 shrink-0" />
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-10 bg-black/10 hidden md:block self-center shrink-0" />
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer flex-1 min-w-0 w-full">
          <Calendar className="w-5 h-5 text-black/30 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] text-black/45 font-bold tracking-wider uppercase mb-0.5">Check in</p>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-transparent text-black text-sm font-semibold focus:outline-none cursor-pointer" />
          </div>
        </div>
        <div className="w-px h-10 bg-black/10 hidden md:block self-center shrink-0" />
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer flex-1 min-w-0 w-full">
          <Calendar className="w-5 h-5 text-black/30 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] text-black/45 font-bold tracking-wider uppercase mb-0.5">Check out</p>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-transparent text-black text-sm font-semibold focus:outline-none cursor-pointer" />
          </div>
        </div>
        <div className="w-px h-10 bg-black/10 hidden md:block self-center shrink-0" />
        <div className="relative w-full md:w-auto shrink-0">
          <button onClick={() => setShowTravelers(!showTravelers)} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-50 transition-colors w-full md:w-auto">
            <Users className="w-5 h-5 text-black/30 shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-black/45 font-bold tracking-wider uppercase mb-0.5">Travelers</p>
              <p className="text-sm font-semibold text-black">{travelers} {travelers === 1 ? 'person' : 'people'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-black/30 transition-transform duration-300 ${showTravelers ? 'rotate-180' : ''}`} />
          </button>
          {showTravelers && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.15)] border border-black/5 p-5 z-50 w-56">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/75 font-semibold">Travelers</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors text-black font-semibold">−</button>
                  <span className="text-sm font-bold text-black w-4 text-center">{travelers}</span>
                  <button onClick={() => setTravelers(Math.min(20, travelers + 1))} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors text-black font-semibold">+</button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-[10px] text-black/45 font-bold tracking-wider uppercase mb-2">Budget</p>
                <div className="flex flex-col gap-1">
                  {['any', 'budget', 'mid-range', 'luxury'].map(b => (
                    <button key={b} onClick={() => setBudget(b)} className={`text-left px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${budget === b ? 'bg-black text-white' : 'hover:bg-neutral-50 text-black/60'}`}>
                      {b === 'any' ? 'Any budget' : b.charAt(0).toUpperCase() + b.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams()
            if (destination) params.set('destination', destination)
            if (checkIn) params.set('checkin', checkIn)
            if (checkOut) params.set('checkout', checkOut)
            params.set('travelers', String(travelers))
            params.set('type', activeTab)
            router.push(`/search?${params.toString()}`)
          }}
          className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-neutral-800 transition-all duration-300 shrink-0 justify-center w-full md:w-auto"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
        {['Beach', 'Mountain', 'City break', 'Cultural', 'Adventure', 'Honeymoon', 'Family'].map(tag => (
          <button
            key={tag}
            onClick={() => router.push(`/search?category=${tag.toLowerCase().replace(' ', '-')}`)}
            className="text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchBar
