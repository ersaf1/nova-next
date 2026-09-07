import { NextResponse } from 'next/server'
import { requireAuth, getUserRole } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (status !== 'cancelled') {
      return NextResponse.json({ error: 'Only cancellation is allowed via this endpoint' }, { status: 400 })
    }

    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('Booking')
      .select('id, email, userId, status')
      .eq('id', Number(id))
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const isOwner = booking.email === user.email || (booking.userId && booking.userId === user.id)
    if (!isOwner) {
      const role = await getUserRole(user.id)
      if (!['booking_officer', 'admin', 'super_admin'].includes(role ?? '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
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
