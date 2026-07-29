import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULTS = [
  { name: 'Fundamental Labs', fontFamily: 'Times New Roman, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px', textTransform: 'none', sortOrder: 1, active: true },
  { name: 'Emirates', fontFamily: 'Arial Black, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px', textTransform: 'none', sortOrder: 2, active: true },
  { name: 'Marriott', fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px', textTransform: 'none', sortOrder: 3, active: true },
  { name: 'Visa', fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px', textTransform: 'none', sortOrder: 4, active: true },
  { name: 'Mastercard', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px', textTransform: 'none', sortOrder: 5, active: true },
  { name: 'Hyatt', fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase', sortOrder: 6, active: true },
  { name: 'Hilton', fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px', textTransform: 'none', sortOrder: 7, active: true },
  { name: 'Stripe', fontFamily: 'Palatino, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px', textTransform: 'none', sortOrder: 8, active: true },
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Backer')
      .select('*')
      .eq('active', true)
      .order('sortOrder', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) return NextResponse.json(DEFAULTS)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from('Backer').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create backer' }, { status: 500 })
  }
}
