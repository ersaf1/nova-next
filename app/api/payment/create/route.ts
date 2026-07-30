import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

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

    // 2. Only accept bookingId from browser
    const { bookingId } = await request.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    // 3. Fetch booking from DB using service role client
    const { data: booking } = await supabase
      .from('Booking')
      .select('id, totalAmount, packageName, userId, email, name, bookingCode, paymentStatus')
      .eq('id', bookingId)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // 4. Verify ownership
    const isOwner = booking.userId === user.id || booking.email === user.email
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 5. Check mock mode
    const isMock = process.env.PAYMENT_MODE === 'mock'
    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''

    if (isMock || !serverKey || serverKey === 'SB-Mid-server-placeholder') {
      const orderId = `NOVA-${booking.id}-${Date.now()}`
      await supabase.from('Booking').update({ midtrans_order_id: orderId }).eq('id', booking.id)
      return NextResponse.json({
        token: null,
        mock: true,
        orderId,
        bookingCode: booking.bookingCode,
        totalAmount: booking.totalAmount,
        redirect_url: `/payment/pending/${booking.id}`,
      })
    }

    // 6. Real Midtrans — amount comes from DB, never from browser
    const orderId = `NOVA-${booking.id}-${Date.now()}`
    await supabase.from('Booking').update({ midtrans_order_id: orderId }).eq('id', booking.id)

    const auth = Buffer.from(serverKey + ':').toString('base64')
    const isProduction = process.env.MIDTRANS_ENV === 'production'
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.totalAmount, // FROM DB, not from browser
      },
      customer_details: {
        first_name: booking.name,
        email: booking.email,
      },
      item_details: [{
        id: `BKG-${booking.id}`,
        price: booking.totalAmount,
        quantity: 1,
        name: booking.packageName ?? 'Travel Package',
      }],
    }

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return NextResponse.json({ ...data, orderId, mock: false })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
