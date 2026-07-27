import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status } = body

    // Extract bookingId from order_id (format: NOVA-{bookingId}-{timestamp})
    const parts = order_id.split('-')
    const bookingId = parts[1]

    let status = 'pending'
    if (transaction_status === 'capture' && fraud_status === 'accept') status = 'paid'
    else if (transaction_status === 'settlement') status = 'paid'
    else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    )
      status = 'cancelled'

    if (bookingId) {
      await supabase
        .from('Booking')
        .update({
          status,
          midtrans_order_id: order_id,
        })
        .eq('id', Number(bookingId))
    }

    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
