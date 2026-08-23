import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth-server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('Destination')
    .select('*')
    .eq('id', Number(id))
    .single()
  if (!error && data) return NextResponse.json(data)

  // fallback to local JSON
  try {
    const raw = await readFile(path.join(process.cwd(), 'data', 'destinations.json'), 'utf-8')
    const list = JSON.parse(raw)
    const found = list.find((d: { id: number }) => d.id === Number(id))
    if (found) return NextResponse.json(found)
  } catch { /* ignore */ }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult
  try {
    const { id } = await params
    const body = await request.json()
    const { data, error } = await supabase.from('Destination').update(body).eq('id', Number(id)).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult
  try {
    const { id } = await params
    const { error } = await supabase.from('Destination').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
