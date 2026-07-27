import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json([])
  const { data } = await supabase.from('Wishlist').select('*').eq('user_id', userId)
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  try {
    const { userId, destinationId } = await request.json()
    const { data, error } = await supabase
      .from('Wishlist')
      .upsert({ user_id: userId, destination_id: destinationId })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const destinationId = searchParams.get('destinationId')
  await supabase
    .from('Wishlist')
    .delete()
    .eq('user_id', userId!)
    .eq('destination_id', destinationId!)
  return NextResponse.json({ ok: true })
}
