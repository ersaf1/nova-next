import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()
    if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    const { data, error } = await supabase.from('Booking').update({ status }).eq('id', Number(id)).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
