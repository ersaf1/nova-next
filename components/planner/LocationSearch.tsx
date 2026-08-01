'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { AutocompleteSuggestion } from '@/lib/geoapify/types'

interface Props {
  onSelect: (suggestion: AutocompleteSuggestion) => void
  placeholder?: string
}

export default function LocationSearch({
  onSelect,
  placeholder = 'Cari lokasi...',
}: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      setLoading(true)

      try {
        const res = await fetch(
          `/api/geo/autocomplete?text=${encodeURIComponent(query)}`,
          { signal: abortRef.current.signal }
        )
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setOpen(true)
      } catch {
        // AbortError is expected on rapid typing — ignore
      } finally {
        setLoading(false)
      }
    }, 350) // 350ms debounce per spec
  }, [query])

  function handleSelect(s: AutocompleteSuggestion) {
    setQuery(s.formatted)
    setSuggestions([])
    setOpen(false)
    onSelect(s)
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/20 focus-within:border-white/40 transition-colors">
        <Search size={14} className="text-white/40 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
        />
        {query && (
          <button onClick={handleClear} aria-label="Clear search">
            <X size={14} className="text-white/40 hover:text-white/70 transition-colors" />
          </button>
        )}
        {loading && (
          <div className="w-3 h-3 border border-white/30 border-t-white/70 rounded-full animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-start gap-2"
            >
              <Search size={12} className="text-white/30 mt-0.5 shrink-0" />
              <span>{s.formatted}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
