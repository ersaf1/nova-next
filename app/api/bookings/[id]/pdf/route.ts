import React from 'react'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase'
import EticketPDF from '@/components/EticketPDF'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookingId = parseInt(id, 10)
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    const { data: booking, error } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    let passengers: Array<{ title: 'Tn.' | 'Ny.' | 'Nn.'; name: string; idType?: string; idNumber?: string }> = []
    if (booking.notes && booking.notes.startsWith('{')) {
      try {
        const parsed = JSON.parse(booking.notes)
        if (Array.isArray(parsed.passengers)) {
          passengers = parsed.passengers
        }
      } catch {}
    }

    const eticketData = {
      id: booking.id,
      name: booking.name || 'Wisatawan',
      email: booking.email || '-',
      phone: booking.phone || '-',
      packageName: booking.packageName || 'Paket Wisata NOVA',
      country: booking.country || '-',
      travelDate: booking.departureStartDate || booking.travelDate || booking.created_at,
      participants: booking.participants || 1,
      totalAmount: booking.totalAmount || 0,
      status: booking.paymentStatus === 'paid' || booking.status === 'paid' ? 'paid' : (booking.status || 'pending'),
      midtrans_order_id: booking.midtrans_order_id || booking.bookingCode || undefined,
      created_at: booking.created_at || new Date().toISOString(),
      passengers,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(EticketPDF, { booking: eticketData }) as any)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nova-ticket-${booking.id}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
