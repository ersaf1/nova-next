import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULTS = [
  { statKey: 'countries', value: '150+', label: 'Countries', iconName: 'Globe', sortOrder: 1 },
  { statKey: 'hotels', value: '10K+', label: 'Hotels & Resorts', iconName: 'Building2', sortOrder: 2 },
  { statKey: 'airlines', value: '500+', label: 'Airlines', iconName: 'Plane', sortOrder: 3 },
  { statKey: 'travelers', value: '2M+', label: 'Happy Travelers', iconName: 'Users', sortOrder: 4 },
  { statKey: 'app_rating', value: '4.9/5', label: 'App Store rating', iconName: null, sortOrder: 5 },
  { statKey: 'recommend_rate', value: '98%', label: 'Would recommend', iconName: null, sortOrder: 6 },
  { statKey: 'app_store_stars', value: '4.9★', label: 'App Store', iconName: null, sortOrder: 7 },
  { statKey: 'app_reviews', value: '150K', label: 'Reviews', iconName: null, sortOrder: 8 },
  { statKey: 'app_downloads', value: '2M+', label: 'Downloads', iconName: null, sortOrder: 9 },
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('SiteStats')
      .select('*')
      .order('sortOrder', { ascending: true })

    if (error) throw error

    // Seed defaults if table is empty
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from('SiteStats')
        .insert(DEFAULTS)
        .select()
      if (seedError) throw seedError
      return NextResponse.json(seeded)
    }

    return NextResponse.json(data)
  } catch {
    // Fallback to hardcoded defaults if DB not available
    return NextResponse.json(DEFAULTS)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { statKey, value, label } = body
    if (!statKey) return NextResponse.json({ error: 'statKey required' }, { status: 400 })

    const { data, error } = await supabase
      .from('SiteStats')
      .update({ value, label, updatedAt: new Date().toISOString() })
      .eq('statKey', statKey)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 })
  }
}
