'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  X,
  Tag,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  Navigation
} from 'lucide-react'

const POPULAR_DESTINATIONS = [
  { city: 'Bali', country: 'Indonesia', tag: 'Top Tropical' },
  { city: 'Tokyo', country: 'Japan', tag: 'Sakura Season' },
  { city: 'Labuan Bajo', country: 'Indonesia', tag: 'Phinisi Luxury' },
  { city: 'Santorini', country: 'Greece', tag: 'Romantic Sunset' },
  { city: 'Swiss Alps', country: 'Switzerland', tag: 'Mountain Alpine' },
  { city: 'Paris', country: 'France', tag: 'Cultural City' },
  { city: 'Raja Ampat', country: 'Indonesia', tag: 'World Heritage Diving' },
  { city: 'Seoul', country: 'South Korea', tag: 'K-Culture & Shopping' },
]

const DURATION_OPTIONS = [
  { id: 'Any', label: 'Semua Durasi (Fleksibel)' },
  { id: '1-3 days', label: '1 - 3 Hari (Weekend Getaway)' },
  { id: '4-7 days', label: '4 - 7 Hari (Paling Populer)' },
  { id: '8-14 days', label: '8 - 14 Hari (Jelajah Lengkap)' },
  { id: '15+ days', label: '15+ Hari (Grand Tour)' },
]

const GUEST_OPTIONS = [
  { id: '1', label: '1 Orang (Solo Traveler)' },
  { id: '2', label: '2 Orang (Pasangan / Duet)' },
  { id: '4', label: '3 - 5 Orang (Keluarga / Teman)' },
  { id: '8', label: '6+ Orang (Rombongan Grup)' },
]

const BUDGET_OPTIONS = [
  { id: 'all', label: 'Semua Rentang Budget' },
  { id: 'under-5m', label: '< Rp 5.000.000 / orang' },
  { id: '5m-15m', label: 'Rp 5.000.000 - Rp 15.000.000' },
  { id: 'above-15m', label: '> Rp 15.000.000 (Luxury)' },
]

export default function SearchBar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'packages' | 'opentrip' | 'ai'>('packages')

  // Search parameters
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('Any')
  const [guests, setGuests] = useState('2')
  const [tripType, setTripType] = useState('open')
  const [budget, setBudget] = useState('all')
  const [aiPrompt, setAiPrompt] = useState('')

  // UI state
  const [showDestDropdown, setShowDestDropdown] = useState(false)
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [destinationList, setDestinationList] = useState(POPULAR_DESTINATIONS)

  const destRef = useRef<HTMLDivElement>(null)
  const durRef = useRef<HTMLDivElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => r.json())
      .then((data: { city: string; country: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.slice(0, 10).map(d => ({
            city: d.city,
            country: d.country,
            tag: 'Destinasi Populer'
          }))
          setDestinationList(formatted)
        }
      })
      .catch(() => {})
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false)
      }
      if (durRef.current && !durRef.current.contains(e.target as Node)) {
        setShowDurationDropdown(false)
      }
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setShowGuestDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredDestinations = destinationList.filter(d =>
    d.city.toLowerCase().includes(destination.toLowerCase()) ||
    d.country.toLowerCase().includes(destination.toLowerCase())
  )

  const handleSearch = () => {
    if (activeTab === 'ai') {
      const params = new URLSearchParams()
      if (aiPrompt.trim()) params.set('q', aiPrompt.trim())
      router.push(`/ai-planner?${params.toString()}`)
      return
    }

    const params = new URLSearchParams()
    params.set('type', 'packages')
    if (destination) params.set('destination', destination)
    if (duration !== 'Any') params.set('duration', duration)
    if (guests) params.set('travelers', guests)
    if (activeTab === 'opentrip') {
      params.set('mode', tripType === 'open' ? 'adventure' : 'family')
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto relative z-20">
      
      {/* Category Tabs Pill Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-lg shadow-blue-950/10 inline-flex mb-3">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'packages'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60'
          }`}
        >
          <Compass size={14} className={activeTab === 'packages' ? 'text-white' : 'text-slate-500'} />
          <span>Paket Wisata</span>
        </button>

        <button
          onClick={() => setActiveTab('opentrip')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'opentrip'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60'
          }`}
        >
          <Users size={14} className={activeTab === 'opentrip' ? 'text-white' : 'text-slate-500'} />
          <span>Open Trip & Sailing</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
            activeTab === 'ai'
              ? 'bg-blue-950 text-white shadow-sm'
              : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
          }`}
        >
          <Navigation size={13} className={activeTab === 'ai' ? 'text-sky-300' : 'text-blue-600'} />
          <span>Smart Route Planner</span>
          <span className="text-[8px] font-black uppercase bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
            SMART
          </span>
        </button>
      </div>

      {/* Main Search Container Widget */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-blue-100/90 shadow-2xl shadow-blue-950/20">
        
        {/* Tab 1: Paket Wisata & Tab 2: Open Trip Fields */}
        {activeTab !== 'ai' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
            
            {/* Field 1: Destination (5 cols) */}
            <div className="md:col-span-5 relative" ref={destRef}>
              <div
                onClick={() => setShowDestDropdown(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Destinasi Tujuan
                  </p>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value)
                      setShowDestDropdown(true)
                    }}
                    onFocus={() => setShowDestDropdown(true)}
                    placeholder="Mau liburan ke mana? (Bali, Santorini, Tokyo...)"
                    className="w-full text-xs font-bold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none truncate"
                  />
                </div>
                {destination && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDestination('')
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Destination Dropdown Menu */}
              {showDestDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-blue-100 p-2 z-50 animate-fade-in-up max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Destinasi Populer
                  </div>
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((d, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDestination(d.city)
                          setShowDestDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>{d.city}, {d.country}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{d.tag}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      Destinasi tidak ditemukan, ketik manual nama kota.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Field 2: Duration / Jadwal (3 cols) */}
            <div className="md:col-span-3 relative" ref={durRef}>
              <div
                onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Calendar size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Durasi / Waktu
                  </p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {DURATION_OPTIONS.find(d => d.id === duration)?.label.split('(')[0] || 'Semua Durasi'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              {/* Duration Dropdown Menu */}
              {showDurationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-blue-100 p-2 z-50 animate-fade-in-up">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setDuration(opt.id)
                        setShowDurationDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        duration === opt.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-800 hover:bg-blue-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field 3: Travelers / Mode (2 cols) */}
            <div className="md:col-span-2 relative" ref={guestRef}>
              <div
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Users size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Traveler
                  </p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {GUEST_OPTIONS.find(g => g.id === guests)?.label.split('(')[0] || `${guests} Orang`}
                  </p>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </div>

              {/* Guest Dropdown Menu */}
              {showGuestDropdown && (
                <div className="absolute top-full right-0 w-56 bg-white rounded-2xl shadow-2xl border border-blue-100 p-2 z-50 animate-fade-in-up">
                  {GUEST_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setGuests(opt.id)
                        setShowGuestDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        guests === opt.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-800 hover:bg-blue-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Submit Button (2 cols) */}
            <div className="md:col-span-2">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-extrabold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 group"
              >
                <Search size={15} className="group-hover:rotate-12 transition-transform" />
                <span>Cari Liburan</span>
              </button>
            </div>

          </div>
        ) : (
          /* Tab 3: Smart Travel Planner Input Bar */
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-blue-200 w-full focus-within:ring-2 focus-within:ring-blue-500">
              <Navigation className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Misal: 5 hari di Santorini & Athena untuk honeymoon, budget 30 juta, suka sunset cruise..."
                className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
            >
              <Navigation size={14} />
              <span>Rancang Rute Cerdas</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* Quick Filter & Trending Keywords Bar */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white shrink-0 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/25">
          <Zap size={12} className="text-amber-300 fill-amber-300" />
          <span>Tren:</span>
        </div>

        {[
          { label: '🔥 Promo s/d 35%', href: '/promo' },
          { label: '🏝️ Bali Beach & Ubud', href: '/search?destination=Bali' },
          { label: '⛵ Labuan Bajo Phinisi', href: '/search?destination=Labuan%20Bajo' },
          { label: '🇬🇷 Santorini Caldera', href: '/search?destination=Santorini' },
          { label: '🌸 Tokyo & Mt. Fuji', href: '/search?destination=Tokyo' },
          { label: '⚡ Tiket Konfirmasi Instan', href: '/packages' },
        ].map((tag, idx) => (
          <button
            key={idx}
            onClick={() => router.push(tag.href)}
            className="text-[11px] font-semibold text-white hover:text-blue-950 bg-white/20 hover:bg-white backdrop-blur-md border border-white/25 hover:border-white px-3 py-1 rounded-full transition-all shrink-0 hover:-translate-y-0.5"
          >
            {tag.label}
          </button>
        ))}
      </div>

    </div>
  )
}
