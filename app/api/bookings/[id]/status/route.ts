import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, user_email } = body

    if (!status || !user_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (status !== 'cancelled') {
      return NextResponse.json({ error: 'Only cancellation is allowed via this endpoint' }, { status: 400 })
    }

    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('id, email, status')
      .eq('id', Number(id))
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.email !== user_email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: `Cannot cancel a booking with status '${booking.status}'` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Booking')
      .update({ status: 'cancelled' })
      .eq('id', Number(id))
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
