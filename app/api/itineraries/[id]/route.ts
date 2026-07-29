import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

async function getUser() {
  const cookieStore = await cookies()
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await auth.auth.getUser()
  return user
}

// GET /api/itineraries/[id] — public if shared, auth required if private
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabase
    .from('SavedItinerary')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (data.visibility === 'private') {
    const user = await getUser()
    if (!user || user.id !== data.userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/itineraries/[id] — rename or change visibility
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, visibility } = body

  // Verify ownership
  const { data: existing } = await supabase
    .from('SavedItinerary')
    .select('userId')
    .eq('id', id)
    .single()

  if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (title !== undefined) updates.title = title
  if (visibility !== undefined) {
    updates.visibility = visibility
    if (visibility === 'shared' && !existing) updates.shareToken = randomUUID()
  }

  const { data, error } = await supabase
    .from('SavedItinerary')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/itineraries/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: existing } = await supabase
    .from('SavedItinerary')
    .select('userId')
    .eq('id', id)
    .single()

  if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('SavedItinerary').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  return NextResponse.json({ message: 'Deleted' })
}
