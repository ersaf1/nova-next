import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('Booking').select('*').order('createdAt', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { packageId, packageName, country, name, email, phone, travelDate, participants } = body
    if (!packageId || !packageName || !country || !name || !email || !phone || !travelDate || !participants) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const { data, error } = await supabase.from('Booking').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
