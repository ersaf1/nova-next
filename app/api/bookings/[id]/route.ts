import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth, getUserRole } from '@/lib/auth-server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('Booking').select('*').eq('id', Number(id)).single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Require authentication
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  try {
    const { id } = await params

    // Fetch the booking to check ownership
    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('email')
      .eq('id', Number(id))
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check ownership: must be the booking owner or an admin
    const isOwner = booking.email === user.email
    if (!isOwner) {
      const role = await getUserRole(user.id)
      const isAdmin = role === 'admin' || role === 'super_admin'
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { error } = await supabase.from('Booking').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
