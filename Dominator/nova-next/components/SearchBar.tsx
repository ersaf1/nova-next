'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Sparkles, SlidersHorizontal } from 'lucide-react'

const TAB_ICONS: Record<string, React.ReactNode> = {
  packages: <Sparkles className="w-3 h-3" />,
  destinations: <MapPin className="w-3 h-3" />,
  'ai planner': <Sparkles className="w-3 h-3" />,
}

const SearchBar: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'packages' | 'destinations' | 'ai planner'>('packages')
  const [destination, setDestination] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => r.json())
      .then((data: { city: string; country: string }[]) => {
        if (Array.isArray(data)) {
          setSuggestions(data.map(d => `${d.city}, ${d.country}`))
        }
      })
      .catch(() => {})
  }, [])

  const filtered = suggestions.filter(d =>
    d.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  )

  const tabs = ['packages', 'destinations', 'ai planner'] as const

  const handleSearch = () => {
    if (activeTab === 'ai planner') {
      const params = new URLSearchParams()
      if (aiPrompt.trim()) params.set('q', aiPrompt.trim())
      router.push(`/itinerary?${params.toString()}`)
    } else if (activeTab === 'packages') {
      const params = new URLSearchParams()
      params.set('type', 'packages')
      if (destination) params.set('destination', destination)
      router.push(`/search?${params.toString()}`)
    } else if (activeTab === 'destinations') {
      const params = new URLSearchParams()
      params.set('type', 'destinations')
      if (destination) params.set('q', destination)
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <div className="w-full max-w-5xl relative">
      {/* Tab row — unified glass track */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05), 0 8px 32px -8px rgba(0, 0, 0, 0.3)',
        }}
        className="inline-flex gap-1 p-1 rounded-full mb-4 flex-wrap max-w-full"
      >
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold capitalize tracking-wide select-none transition-all ${
              activeTab === tab
                ? 'bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.25)] scale-105 font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span className="opacity-70">{TAB_ICONS[tab]}</span>
            {tab}
          </button>
        ))}
      </div>

      {/* Main search container — glass */}
      <div
        ref={containerRef}
        style={{
          background: focused
            ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: focused
            ? '1px solid rgba(255,255,255,0.25)'
            : '1px solid rgba(255,255,255,0.13)',
          boxShadow: focused
            ? 'inset 0 1.5px 0 0 rgba(255, 255, 255, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px -12px rgba(0,0,0,0.55), 0 0 30px 2px rgba(99,102,241,0.25)'
            : 'inset 0 1.5px 0 0 rgba(255, 255, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 16px 40px -12px rgba(0,0,0,0.45)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="rounded-2xl p-1.5 flex flex-col md:flex-row gap-1 w-full relative"
      >
        {/* Prism Reflection highlight */}
        <div className="absolute top-[1px] left-[12px] right-[12px] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 via-white/40 via-indigo-400/20 to-transparent pointer-events-none blur-[0.2px] z-10" />

        {/* Destination field */}
        <div className="relative flex-1 min-w-0 w-full">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group"
            style={{
              background: 'rgba(255,255,255,0.0)',
              border: '1px solid transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 0 rgba(255,255,255,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.0)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <MapPin className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-white/50 font-bold tracking-widest uppercase mb-0.5 group-hover:text-white/70 transition-colors">Where to</p>
              <input
                type="text"
                value={destination}
                onChange={e => { setDestination(e.target.value); setShowSuggestions(true) }}
                onFocus={() => { setShowSuggestions(true); setFocused(true) }}
                onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); setFocused(false) }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Destinations, experiences..."
                className="w-full text-sm text-white placeholder:text-white/35 bg-transparent focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Glass suggestion dropdown */}
          {showSuggestions && filtered.length > 0 && (
            <div
              style={{
                background: 'rgba(15,15,26,0.78)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 24px 50px rgba(0,0,0,0.6)',
              }}
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl z-50 overflow-hidden"
            >
              {filtered.slice(0, 6).map((d, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setDestination(d); setShowSuggestions(false) }}
                  style={{
                    animationDelay: `${i * 40}ms`,
                    animation: 'slideIn 0.18s ease-out both',
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white flex items-center gap-3 transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-400/70 shrink-0" />
                  <span className="font-medium">{d}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Planner prompt field — only shown on ai planner tab */}
        {activeTab === 'ai planner' && (
          <>
            <div className="w-[1px] bg-gradient-to-b from-transparent via-white/12 to-transparent self-stretch hidden md:block mx-0.5" />
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-0 group"
              style={{
                background: 'rgba(255,255,255,0.0)',
                border: '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 0 rgba(255,255,255,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.0)'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Sparkles className="w-4 h-4 text-indigo-400/70 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/50 font-bold tracking-widest uppercase mb-0.5 group-hover:text-white/70 transition-colors">Ask AI</p>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="7 hari di Jepang, budget $2000..."
                  className="w-full text-sm text-white placeholder:text-white/35 bg-transparent focus:outline-none font-medium"
                />
              </div>
            </div>
          </>
        )}

        {/* Search button — solid white glossy, sesuai tema black/white */}
        <button
          onClick={handleSearch}
          className="group flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm shrink-0 justify-center w-full md:w-auto relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,1)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.35)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(235,235,235,1)'
            el.style.boxShadow = 'inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.18), 0 12px 32px rgba(0,0,0,0.45)'
            el.style.transform = 'scale(1.03)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,1)'
            el.style.boxShadow = 'inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.35)'
            el.style.transform = 'scale(1)'
          }}
        >
          {/* Shimmer */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 0.6s ease forwards',
              transition: 'opacity 0.1s ease',
            }}
          />
          {activeTab === 'ai planner'
            ? <Sparkles className="w-4 h-4 text-white relative z-10" />
            : <Search className="w-4 h-4 text-white relative z-10" />
          }
          <span className="text-white relative z-10">
            {activeTab === 'ai planner' ? 'Ask AI' : 'Search'}
          </span>
        </button>
      </div>

      {/* Quick filter tags */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <SlidersHorizontal className="w-3 h-3 text-white/30" />
        {['Beach', 'Mountain', 'City break', 'Cultural', 'Adventure', 'Honeymoon', 'Family'].map((tag, i) => (
          <button
            key={tag}
            onClick={() => router.push(`/search?category=${tag.toLowerCase().replace(' ', '-')}`)}
            style={{
              animationDelay: `${i * 30}ms`,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.08)'
              el.style.borderColor = 'rgba(255,255,255,0.2)'
              el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 16px rgba(0,0,0,0.25)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.03)'
              el.style.borderColor = 'rgba(255,255,255,0.07)'
              el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)'
              el.style.transform = 'translateY(0)'
            }}
            className="text-white/60 hover:text-white text-xs font-semibold px-4 py-1.5 rounded-full"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }
      `}</style>
    </div>
  )
}

export default SearchBar
