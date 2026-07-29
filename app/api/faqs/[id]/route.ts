import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth-server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult
  try {
    const { id } = await params
    const body = await request.json()
    const { data, error } = await supabase.from('FAQ').update(body).eq('id', Number(id)).select().single()
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
    const { error } = await supabase.from('FAQ').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
