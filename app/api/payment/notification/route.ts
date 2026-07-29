import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      transaction_time,
    } = body

    // 1. Verify signature (skip in mock mode)
    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''
    const isMock = process.env.PAYMENT_MODE === 'mock'

    if (!isMock && serverKey && serverKey !== 'SB-Mid-server-placeholder') {
      const expected = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex')

      if (expected !== signature_key) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    // 2. Extract bookingId from order_id (format: NOVA-{bookingId}-{timestamp})
    const parts = (order_id as string).split('-')
    const bookingId = parseInt(parts[1])
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 })
    }

    // 3. Fetch booking from DB
    const { data: booking } = await supabase
      .from('Booking')
      .select('id, totalAmount, paymentStatus')
      .eq('id', bookingId)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // 4. Idempotency: already paid → skip
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ status: 'ok' })
    }

    // 5. Validate amount (only for real Midtrans, not mock)
    if (!isMock && Number(gross_amount) !== booking.totalAmount) {
      console.error(`Amount mismatch: expected ${booking.totalAmount}, got ${gross_amount}`)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // 6. Map Midtrans status to our status
    let paymentStatus = 'pending'
    let bookingStatus = 'pending'

    if (transaction_status === 'capture' && fraud_status === 'accept') {
      paymentStatus = 'paid'; bookingStatus = 'confirmed'
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'paid'; bookingStatus = 'confirmed'
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending'; bookingStatus = 'pending_payment'
    } else if (['cancel', 'deny'].includes(transaction_status)) {
      paymentStatus = 'failed'; bookingStatus = 'cancelled'
    } else if (transaction_status === 'expire') {
      paymentStatus = 'expired'; bookingStatus = 'cancelled'
    } else if (transaction_status === 'refund') {
      paymentStatus = 'refunded'
    }

    // 7. Update booking
    await supabase
      .from('Booking')
      .update({
        paymentStatus,
        bookingStatus,
        midtrans_order_id: order_id,
        midtrans_transaction_id: transaction_id ?? null,
        midtrans_payment_method: payment_type ?? null,
        paid_at: paymentStatus === 'paid' ? (transaction_time ?? new Date().toISOString()) : null,
      })
      .eq('id', bookingId)

    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
