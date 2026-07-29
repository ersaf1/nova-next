import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULTS = [
  { name: 'Airbnb', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px', fontStyle: 'normal', textTransform: 'none', sortOrder: 1, active: true },
  { name: 'Booking.com', fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', fontStyle: 'normal', textTransform: 'uppercase', sortOrder: 2, active: true },
  { name: 'Expedia', fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic', textTransform: 'none', sortOrder: 3, active: true },
  { name: 'Skyscanner', fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', fontStyle: 'normal', textTransform: 'uppercase', sortOrder: 4, active: true },
  { name: 'Klook', fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px', fontStyle: 'normal', textTransform: 'none', sortOrder: 5, active: true },
  { name: 'Agoda', fontFamily: 'Impact, Arial Narrow, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px', fontStyle: 'normal', textTransform: 'none', sortOrder: 6, active: true },
  { name: 'TripAdvisor', fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px', fontStyle: 'normal', textTransform: 'none', sortOrder: 7, active: true },
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Partner')
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
    const { data, error } = await supabase.from('Partner').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
  }
}
