'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CurrencyCode =
  | 'IDR'
  | 'USD'
  | 'EUR'
  | 'SGD'
  | 'JPY'
  | 'AUD'
  | 'GBP'
  | 'MYR'
  | 'THB'
  | 'KRW'
  | 'CNY'
  | 'SAR'
  | 'AED'
  | 'CAD'
  | 'CHF'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  flag: string
  rateToIDR: number // 1 unit of Currency = X IDR
}

export const RATES: Record<CurrencyCode, CurrencyConfig> = {
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', rateToIDR: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToIDR: 15800 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToIDR: 17200 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rateToIDR: 11800 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rateToIDR: 105 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateToIDR: 10300 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToIDR: 20100 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', rateToIDR: 3550 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', rateToIDR: 450 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', rateToIDR: 11.5 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', rateToIDR: 2200 },
  SAR: { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', flag: '🇸🇦', rateToIDR: 4200 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateToIDR: 4300 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', rateToIDR: 11400 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rateToIDR: 18100 },
}

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  formatPrice: (amountInIDR: number | string | null | undefined) => string
  convertAmount: (amountInIDR: number) => number
  currentConfig: CurrencyConfig
}

const defaultContext: CurrencyContextType = {
  currency: 'IDR',
  setCurrency: () => {},
  formatPrice: (amount) => {
    const num = Number(amount) || 0
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`
  },
  convertAmount: (amount) => amount,
  currentConfig: RATES.IDR,
}

const CurrencyContext = createContext<CurrencyContextType>(defaultContext)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('nova_currency') as CurrencyCode
      if (saved && RATES[saved]) {
        setCurrencyState(saved)
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nova_currency' && e.newValue && RATES[e.newValue as CurrencyCode]) {
        setCurrencyState(e.newValue as CurrencyCode)
      }
    }

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<CurrencyCode>
      if (customEvent.detail && RATES[customEvent.detail]) {
        setCurrencyState(customEvent.detail)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('nova_currency_changed', handleCustomChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('nova_currency_changed', handleCustomChange)
    }
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    if (!RATES[code]) return
    setCurrencyState(code)
    try {
      localStorage.setItem('nova_currency', code)
      window.dispatchEvent(new CustomEvent('nova_currency_changed', { detail: code }))
    } catch {}
  }

  const currentConfig = RATES[currency] || RATES.IDR

  const convertAmount = (amountInIDR: number): number => {
    const rate = currentConfig.rateToIDR || 1
    return amountInIDR / rate
  }

  const formatPrice = (amountInIDR: number | string | null | undefined): string => {
    const num = typeof amountInIDR === 'string' ? parseFloat(amountInIDR) : Number(amountInIDR)
    if (isNaN(num) || num === null || num === undefined) {
      return `${currentConfig.symbol} 0`
    }

    const converted = convertAmount(num)

    // IDR, JPY, KRW don't use decimal places
    if (currency === 'IDR' || currency === 'JPY' || currency === 'KRW') {
      return `${currentConfig.symbol} ${Math.round(converted).toLocaleString(currency === 'IDR' ? 'id-ID' : 'en-US')}`
    }

    // For other currencies, format with decimals if small or rounded if clean
    if (converted < 100) {
      return `${currentConfig.symbol} ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return `${currentConfig.symbol} ${Math.round(converted).toLocaleString('en-US')}`
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency: mounted ? currency : 'IDR',
        setCurrency,
        formatPrice,
        convertAmount,
        currentConfig,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}

/**
 * Direct currency formatter for non-React contexts or legacy utilities.
 * Automatically checks localStorage for selected currency on the client.
 */
export function formatCurrencyDirect(amountInIDR: number | string | null | undefined, targetCurrency?: string): string {
  const num = typeof amountInIDR === 'string' ? parseFloat(amountInIDR) : Number(amountInIDR)
  if (isNaN(num) || num === null || num === undefined) {
    return 'Rp 0'
  }

  let curr = targetCurrency
  if (!curr && typeof window !== 'undefined') {
    try {
      curr = localStorage.getItem('nova_currency') || 'IDR'
    } catch {
      curr = 'IDR'
    }
  }

  const code = (curr && RATES[curr as CurrencyCode]) ? (curr as CurrencyCode) : 'IDR'
  const config = RATES[code] || RATES.IDR
  const converted = num / (config.rateToIDR || 1)

  if (code === 'IDR' || code === 'JPY' || code === 'KRW') {
    return `${config.symbol} ${Math.round(converted).toLocaleString(code === 'IDR' ? 'id-ID' : 'en-US')}`
  }

  if (converted < 100) {
    return `${config.symbol} ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return `${config.symbol} ${Math.round(converted).toLocaleString('en-US')}`
}
