'use client'

import React, { useEffect, useState } from 'react'

interface Backer {
  id?: number
  name: string
  fontFamily: string
  fontWeight: number
  letterSpacing: string
  fontSize: string
  textTransform: string
}

const DEFAULT_BACKERS: Backer[] = [
  { name: 'Fundamental Labs', fontFamily: 'Times New Roman, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px', textTransform: 'none' },
  { name: 'Emirates', fontFamily: 'Arial Black, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px', textTransform: 'none' },
  { name: 'Marriott', fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px', textTransform: 'none' },
  { name: 'Visa', fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px', textTransform: 'none' },
  { name: 'Mastercard', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px', textTransform: 'none' },
  { name: 'Hyatt', fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' },
  { name: 'Hilton', fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px', textTransform: 'none' },
  { name: 'Stripe', fontFamily: 'Palatino, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px', textTransform: 'none' },
]

const BackedBySection: React.FC = () => {
  const [backers, setBackers] = useState<Backer[]>(DEFAULT_BACKERS)

  useEffect(() => {
    fetch('/api/backers')
      .then(r => r.json())
      .then((data: Backer[]) => { if (Array.isArray(data) && data.length > 0) setBackers(data) })
      .catch(() => {})
  }, [])

  return (
    <section className="bg-[#F5F5F5] px-6 py-16 border-t border-black/5">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        <div className="md:col-span-1">
          <p className="text-black/60 text-base leading-relaxed">Backed by world-class<br />partners and industry leaders.</p>
        </div>
        <div className="md:col-span-3 overflow-hidden">
          <div className="backers-track">
            {[...backers, ...backers].map((backer, i) => (
              <span
                key={i}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap"
                style={{
                  fontFamily: backer.fontFamily,
                  fontWeight: backer.fontWeight,
                  letterSpacing: backer.letterSpacing,
                  fontSize: backer.fontSize,
                  textTransform: backer.textTransform as React.CSSProperties['textTransform'],
                }}
              >
                {backer.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BackedBySection
