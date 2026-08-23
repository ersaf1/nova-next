'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD'

interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  label: string
  rateToIDR: number // 1 Currency = X IDR
}

export const RATES: Record<CurrencyCode, CurrencyConfig> = {
  IDR: { code: 'IDR', symbol: 'Rp', label: 'IDR (Rp)', rateToIDR: 1 },
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', rateToIDR: 15800 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', rateToIDR: 17200 },
  SGD: { code: 'SGD', symbol: 'S$', label: 'SGD (S$)', rateToIDR: 11800 },
}

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  formatPrice: (amountInIDR: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'IDR',
  setCurrency: () => {},
  formatPrice: (amount) => `Rp ${amount.toLocaleString('id-ID')}`
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR')

  useEffect(() => {
    const saved = localStorage.getItem('nova_currency') as CurrencyCode
    if (saved && RATES[saved]) {
      setCurrencyState(saved)
    }
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    localStorage.setItem('nova_currency', code)
  }

  const formatPrice = (amountInIDR: number | string | null | undefined): string => {
    const num = typeof amountInIDR === 'string' ? parseFloat(amountInIDR) : Number(amountInIDR)
    if (isNaN(num) || num === null || num === undefined) {
      return 'Rp 0'
    }
    const config = RATES[currency] || RATES.IDR
    const converted = num / (config.rateToIDR || 1)

    if (currency === 'IDR') {
      return `${config.symbol} ${Math.round(converted).toLocaleString('id-ID')}`
    } else {
      return `${config.symbol} ${Math.round(converted).toLocaleString('en-US')}`
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
