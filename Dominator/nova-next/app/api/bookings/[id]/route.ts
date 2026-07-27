import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabase.from('Booking').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
