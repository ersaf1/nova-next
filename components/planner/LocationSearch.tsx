'use client'

import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Loader2 } from 'lucide-react'
import type { AutocompleteSuggestion } from '@/lib/geoapify/types'

interface Props {
  value?: string
  onChange?: (value: string) => void
  onSelect: (suggestion: AutocompleteSuggestion) => void
  onEnterPress?: () => void
  placeholder?: string
  className?: string
  theme?: 'dark' | 'light'
}

export default function LocationSearch({
  value: controlledValue,
  onChange,
  onSelect,
  onEnterPress,
  placeholder = 'Ketik destinasi (misal: Jepara, Bali, Denpasar, Tokyo...)',
  className = '',
  theme = 'light',
}: Props) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = controlledValue !== undefined ? controlledValue : internalQuery
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleQueryChange = (val: string) => {
    if (controlledValue === undefined) {
      setInternalQuery(val)
    }
    onChange?.(val)
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query || query.length < 2) {
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
        const items = data.suggestions ?? []
        setSuggestions(items)
        if (items.length > 0) {
          setOpen(true)
        }
      } catch {
        // AbortError is expected on rapid typing — ignore
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  function handleSelect(s: AutocompleteSuggestion) {
    const text = s.text || s.formatted
    handleQueryChange(text)
    setSuggestions([])
    setOpen(false)
    onSelect(s)
  }

  function handleClear() {
    handleQueryChange('')
    setSuggestions([])
    setOpen(false)
  }

  const isDark = theme === 'dark'

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div
        className={`relative flex items-center transition-all ${
          isDark
            ? 'bg-white/10 border border-white/20 rounded-xl focus-within:border-white/40'
            : 'bg-stone-50/80 border border-stone-200 rounded-2xl focus-within:border-stone-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-900/10'
        }`}
      >
        <MapPin
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 shrink-0 ${
            isDark ? 'text-[#C29B38]' : 'text-[#C29B38]'
          }`}
        />

        <input
          id="search-destination-input"
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setOpen(false)
              onEnterPress?.()
            }
          }}
          className={`w-full pl-11 pr-10 py-3.5 text-sm font-medium outline-none bg-transparent ${
            isDark
              ? 'text-white placeholder:text-white/40'
              : 'text-stone-900 placeholder:text-stone-400'
          }`}
        />

        {loading ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Loader2
              size={15}
              className={`animate-spin ${isDark ? 'text-stone-400' : 'text-stone-400'}`}
            />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-stone-400 hover:text-white' : 'text-stone-400 hover:text-stone-700'
            }`}
            title="Hapus teks"
            aria-label="Hapus teks"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className={`absolute top-full mt-2 w-full rounded-2xl shadow-xl z-50 overflow-hidden border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-white'
              : 'bg-white border-stone-200/90 text-stone-900'
          }`}
        >
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 flex items-center justify-between">
            <span>Saran Lokasi Terverifikasi</span>
            <span>Geoapify Precision</span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-4 py-3 text-xs transition-colors flex items-start gap-3 cursor-pointer ${
                  isDark
                    ? 'hover:bg-white/10 text-stone-200'
                    : 'hover:bg-[#FAF9F6] text-stone-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#C29B38] shrink-0 mt-0.5">
                  <MapPin size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate text-stone-900">
                    {s.text || s.formatted}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5 font-normal">
                    {s.formatted}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

