import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { bookingId, amount, customerName, customerEmail, items } = await request.json()

    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const isProduction = false
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    const orderId = `NOVA-${bookingId}-${Date.now()}`

    // If no real key, return mock token
    if (!serverKey || serverKey === 'SB-Mid-server-placeholder' || serverKey === '') {
      return NextResponse.json({
        token: 'mock-token-' + orderId,
        redirect_url: `/payment/confirmation/${bookingId}?mock=true`,
        orderId,
      })
    }

    const auth = Buffer.from(serverKey + ':').toString('base64')

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { first_name: customerName, email: customerEmail },
      item_details: items || [{ id: 'PKG-1', price: amount, quantity: 1, name: 'Travel Package' }],
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return NextResponse.json({ ...data, orderId })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
