import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/payment/simulate
// Dummy payment simulator — bypass Midtrans, langsung set paymentStatus = 'paid'
export async function POST(request: Request) {
  try {
    // 1. Auth check
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bookingId, method } = await request.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    // 2. Fetch booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('Booking')
      .select('id, userId, email, paymentStatus, totalAmount, bookingCode')
      .eq('id', Number(bookingId))
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 3. Ownership check
    const isOwner = booking.userId === user.id || booking.email === user.email
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 4. Prevent double payment
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }

    // 5. Generate dummy order ID
    const orderId = `NOVA-SIM-${booking.id}-${Date.now()}`
    const paymentMethod = method ?? 'bank_transfer'

    // 6. Update booking: paymentStatus = paid, bookingStatus = confirmed
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('Booking')
      .update({
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        midtrans_order_id: orderId,
        midtrans_payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
      })
      .eq('id', Number(bookingId))
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      orderId,
      bookingCode: booking.bookingCode,
      paymentMethod,
      totalAmount: booking.totalAmount,
      booking: updated,
    })
  } catch (err) {
    console.error('payment simulate error:', err)
    return NextResponse.json({ error: 'Payment simulation failed' }, { status: 500 })
  }
}
