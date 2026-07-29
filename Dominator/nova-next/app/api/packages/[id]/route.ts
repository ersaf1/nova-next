import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('Package')
    .select('*')
    .eq('id', Number(id))
    .single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Parse includes JSON string to array
  let includes: string[] = []
  try { includes = JSON.parse(data.includes ?? '[]') } catch { includes = [] }
  return NextResponse.json({ ...data, includes })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = { ...body, includes: JSON.stringify(body.includes ?? []) }
    const { data: item, error } = await supabase.from('Package').update(data).eq('id', Number(id)).select().single()
    if (error) throw error
    return NextResponse.json({ ...item, includes: JSON.parse(item.includes) })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabase.from('Package').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
