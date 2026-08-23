'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useCurrency, RATES, CurrencyCode } from '@/context/CurrencyContext'
import { Globe, ChevronDown } from 'lucide-react'

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentConfig = RATES[currency] || RATES.IDR

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border border-zinc-200 text-xs font-semibold transition-all shadow-2xs"
        title="Switch Currency"
      >
        <Globe className="w-3.5 h-3.5 text-zinc-500" />
        <span>{currentConfig.code} ({currentConfig.symbol})</span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl border border-zinc-200 shadow-xl py-1 z-50 animate-fadeIn text-xs">
          {(Object.keys(RATES) as CurrencyCode[]).map((code) => {
            const config = RATES[code]
            const isSelected = currency === code
            return (
              <button
                key={code}
                onClick={() => {
                  setCurrency(code)
                  setIsOpen(false)
                }}
                className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-700 hover:bg-zinc-100 font-medium'
                }`}
              >
                <span>{config.code}</span>
                <span className="text-[11px] opacity-80">{config.symbol}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
