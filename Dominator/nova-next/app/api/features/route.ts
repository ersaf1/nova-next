import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULTS = [
  { title: 'Lightning booking', stat: '< 3 min', statLabel: 'avg. booking time', iconName: 'Zap', image: '', sortOrder: 1, active: true },
  { title: 'Price guarantee', stat: '100%', statLabel: 'price matched', iconName: 'Shield', image: '', sortOrder: 2, active: true },
  { title: '24/7 support', stat: '24/7', statLabel: 'concierge', iconName: 'Headphones', image: '', sortOrder: 3, active: true },
  { title: 'Flexible pay', stat: '50+', statLabel: 'currencies', iconName: 'CreditCard', image: '', sortOrder: 4, active: true },
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Feature')
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
    const { data, error } = await supabase.from('Feature').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 })
  }
}
