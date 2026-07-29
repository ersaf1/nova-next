import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entity_type = searchParams.get('entity_type')
  const entity_id = searchParams.get('entity_id')

  if (!entity_type || !entity_id) {
    return NextResponse.json({ error: 'entity_type and entity_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('Review')
    .select('*')
    .eq('entity_type', entity_type)
    .eq('entity_id', Number(entity_id))
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  try {
    // Authenticate — identity comes from the session, never from the request body
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const user_id = user.id
    const user_email = user.email ?? ''
    const user_name = (user.user_metadata?.full_name as string | undefined) ?? ''

    const body = await request.json()
    const { entity_type, entity_id, rating, title, body: reviewBody } = body

    if (!entity_type || !entity_id || !rating || !reviewBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['destination', 'package'].includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user already reviewed this entity
    const { data: existing } = await supabase
      .from('Review')
      .select('id')
      .eq('user_id', user_id)
      .eq('entity_type', entity_type)
      .eq('entity_id', Number(entity_id))
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Kamu sudah memberikan ulasan untuk ini.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('Review')
      .insert({
        user_id,
        user_email,
        user_name,
        entity_type,
        entity_id: Number(entity_id),
        rating,
        title: title || null,
        body: reviewBody,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
