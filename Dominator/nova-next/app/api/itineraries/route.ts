import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function getUser() {
  const cookieStore = await cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseAuth.auth.getUser()
  return user
}

// GET /api/itineraries — list user's saved itineraries
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('SavedItinerary')
    .select('id,title,destination,duration,travelers,budget,preferences,visibility,shareToken,createdAt,updatedAt')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch itineraries' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/itineraries — save new itinerary
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, destination, duration, travelers, budget, preferences, generatedContent } = body

  if (!destination || !duration) {
    return NextResponse.json({ error: 'destination and duration are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('SavedItinerary')
    .insert({
      userId: user.id,
      title: title ?? 'Itinerary Baru',
      destination,
      duration: Number(duration),
      travelers: Number(travelers ?? 1),
      budget: budget ?? null,
      preferences: JSON.stringify(preferences ?? []),
      generatedContent: generatedContent ?? null,
      visibility: 'private',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save itinerary' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
