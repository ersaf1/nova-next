import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAuth, requireRole, getUserRole } from '@/lib/auth-server'
import { sendRefundNotification } from '@/lib/email'

// POST /api/bookings/[id]/refund — user requests a refund
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  // Fetch the booking
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('Booking')
    .select('id, email, status, refund_status, "packageName"')
    .eq('id', Number(id))
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Ownership check — owner or admin
  const bookingEmail = booking.email as string | null
  if (bookingEmail !== user.email) {
    const role = await getUserRole(user.id)
    if (!['admin', 'super_admin'].includes(role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Can only request refund for paid/confirmed bookings
  const status = booking.status as string | null
  if (!['paid', 'confirmed'].includes(status ?? '')) {
    return NextResponse.json(
      { error: 'Refund can only be requested for paid or confirmed bookings' },
      { status: 400 }
    )
  }

  // Block duplicate requests
  const refundStatus = booking.refund_status as string | null
  if (refundStatus !== 'none' && refundStatus !== null) {
    return NextResponse.json(
      { error: 'Refund already requested or processed' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => ({})) as { reason?: string }
  const reason = body.reason ?? ''

  const { error } = await supabaseAdmin
    .from('Booking')
    .update({ refund_status: 'requested', refund_reason: reason })
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: 'Failed to request refund' }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Refund request submitted' })
}

// PATCH /api/bookings/[id]/refund — admin approves or rejects
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json() as { action?: string }
  const { action } = body // 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action ?? '')) {
    return NextResponse.json(
      { error: 'Invalid action. Use approve or reject' },
      { status: 400 }
    )
  }

  const refund_status = action === 'approve' ? 'approved' : 'rejected'
  const updateData: Record<string, unknown> = { refund_status }
  if (action === 'approve') updateData.refunded_at = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('Booking')
    .update(updateData)
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: 'Failed to update refund status' }, { status: 500 })

  // Send refund notification email (fire-and-forget)
  const { data: bookingForEmail } = await supabaseAdmin
    .from('Booking')
    .select('email, name, packageName')
    .eq('id', Number(id))
    .single()

  if (bookingForEmail?.email) {
    sendRefundNotification({
      to: bookingForEmail.email as string,
      name: (bookingForEmail.name as string) ?? '',
      packageName: (bookingForEmail.packageName as string) ?? '',
      bookingId: id,
      status: action === 'approve' ? 'approved' : 'rejected',
    }).catch(() => {})
  }

  return NextResponse.json({ success: true, refund_status })
}
