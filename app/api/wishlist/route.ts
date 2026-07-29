import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

// GET /api/wishlist?type=package — list user's wishlist
// POST /api/wishlist — add item { type, packageId }
// DELETE /api/wishlist?type=package&packageId=123 — remove item

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

export async function GET(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'package'

  const { data, error } = await supabase
    .from('Wishlist')
    .select('*, Package(*)')
    .eq('user_id', user.id)
    .eq('type', type)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type = 'package', packageId, destinationId } = await request.json()

  const { data, error } = await supabase
    .from('Wishlist')
    .insert({
      user_id: user.id,
      type,
      packageId: packageId ?? null,
      destination_id: destinationId ?? null,
    })
    .select()
    .single()

  if (error) {
    // Ignore duplicate key (already wishlisted)
    if (error.code === '23505') return NextResponse.json({ message: 'Already wishlisted' })
    return NextResponse.json({ error: 'Failed to add wishlist' }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'package'
  const packageId = searchParams.get('packageId')
  const destinationId = searchParams.get('destinationId')

  let query = supabase.from('Wishlist').delete().eq('user_id', user.id).eq('type', type)
  if (packageId) query = query.eq('packageId', parseInt(packageId))
  if (destinationId) query = query.eq('destination_id', parseInt(destinationId))

  const { error } = await query
  if (error) return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  return NextResponse.json({ message: 'Removed from wishlist' })
}
