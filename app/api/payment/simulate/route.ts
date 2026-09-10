import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPaymentConfirmed } from '@/lib/email'

// POST /api/payment/simulate
// 1-Click Instant Payment Simulator for Deploy & Demo — bypass Midtrans, instantly set paymentStatus = 'paid'
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { bookingId, method } = body
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    // 1. Fetch booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('Booking')
      .select('id, userId, email, contactEmail, name, contactName, packageName, paymentStatus, totalAmount, bookingCode, midtrans_order_id')
      .eq('id', Number(bookingId))
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 2. Idempotent check: If already paid, return success immediately
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderId: booking.midtrans_order_id || `NOVA-SIM-${booking.id}`,
        bookingCode: booking.bookingCode,
        paymentMethod: method ?? 'bank_transfer',
        totalAmount: booking.totalAmount,
        booking,
      })
    }

    // 3. Generate dummy order ID and transaction details
    const orderId = `NOVA-SIM-${booking.id}-${Date.now()}`
    const paymentMethod = method ?? 'bank_transfer'
    const nowIso = new Date().toISOString()

    // 4. Update booking to paid & confirmed
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('Booking')
      .update({
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        midtrans_order_id: orderId,
        midtrans_transaction_id: `SIM-TX-${Date.now()}`,
        midtrans_payment_method: paymentMethod,
        paid_at: nowIso,
      })
      .eq('id', Number(bookingId))
      .select()
      .single()

    if (updateError) throw updateError

    // 5. Send confirmation email (fire-and-forget, non-blocking)
    const targetEmail = booking.contactEmail || booking.email
    const targetName = booking.contactName || booking.name || 'Traveler'
    if (targetEmail) {
      sendPaymentConfirmed({
        to: targetEmail,
        name: targetName,
        packageName: booking.packageName ?? 'Paket Perjalanan NOVA',
        bookingId: booking.id,
        amount: booking.totalAmount ?? 0,
      }).catch((e) => console.warn('Email notify error (simulation):', e))
    }

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
