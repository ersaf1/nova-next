import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULTS = [
  { number: '01', title: 'Search', caption: 'Find by mood, season, or style.', iconName: 'Search', image: '', sortOrder: 1, active: true },
  { number: '02', title: 'Book', caption: 'Flights, hotels, experiences — one checkout.', iconName: 'BookOpen', image: '', sortOrder: 2, active: true },
  { number: '03', title: 'Explore', caption: 'Itinerary in your pocket. 24/7 concierge.', iconName: 'Compass', image: '', sortOrder: 3, active: true },
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('HowItWorksStep')
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
    const { data, error } = await supabase.from('HowItWorksStep').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create step' }, { status: 500 })
  }
}
