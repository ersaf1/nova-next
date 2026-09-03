'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useCurrency, RATES, CurrencyCode } from '@/context/CurrencyContext'
import { Globe, ChevronDown, Check, Search } from 'lucide-react'

export default function CurrencySwitcher() {
  const { currency, setCurrency, currentConfig } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    } else {
      setSearch('')
    }
  }, [isOpen])

  const currencyList = (Object.keys(RATES) as CurrencyCode[]).map((code) => RATES[code])

  const filtered = currencyList.filter((item) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.symbol.toLowerCase().includes(q)
    )
  })

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-blue-50 text-slate-800 hover:text-blue-600 border border-slate-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        title="Pilih Mata Uang (Currency)"
      >
        <span className="text-sm">{currentConfig.flag}</span>
        <span className="font-extrabold">{currentConfig.code}</span>
        <span className="text-slate-400 text-[10px]">({currentConfig.symbol})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-blue-100 shadow-2xl p-2 z-50 animate-fade-in-up text-xs">
          {/* Header & Quick Search */}
          <div className="p-1.5 pb-2 border-b border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Pilih Mata Uang Global
              </span>
              <span className="text-[10px] font-bold text-blue-600">
                {currencyList.length} Kurs
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari mata uang (USD, Yen, EUR...)"
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          {/* List of Currencies */}
          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                Mata uang tidak ditemukan
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = currency === item.code
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      setCurrency(item.code)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-extrabold shadow-2xs'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{item.flag}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold leading-tight truncate">{item.code}</span>
                        <span className={`text-[10px] leading-tight truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.symbol}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
