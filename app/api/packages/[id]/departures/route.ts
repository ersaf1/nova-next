import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { PackageDeparture } from '@/lib/types'

// GET /api/packages/[id]/departures
// Returns upcoming available departures for a package
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const packageId = parseInt(id)
  if (isNaN(packageId)) {
    return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 })
  }

  // ?all=1 returns all departures (for admin); default returns only upcoming non-cancelled
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === '1'

  try {
    let query = supabase
      .from('PackageDeparture')
      .select('*')
      .eq('packageId', packageId)
      .order('startDate', { ascending: true })

    if (!all) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('startDate', today).neq('status', 'cancelled')
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json((data ?? []) as PackageDeparture[])
  } catch (err) {
    console.error('departures GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch departures' }, { status: 500 })
  }
}

// POST /api/packages/[id]/departures — admin only
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const packageId = parseInt(id)
  if (isNaN(packageId)) {
    return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { startDate, endDate, capacity, price, status } = body

    if (!startDate || !endDate || !capacity || !price) {
      return NextResponse.json({ error: 'Missing required fields: startDate, endDate, capacity, price' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('PackageDeparture')
      .insert({
        packageId,
        startDate,
        endDate,
        capacity: Number(capacity),
        remainingSlots: Number(capacity),
        price: Number(price),
        status: status ?? 'available',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data as PackageDeparture, { status: 201 })
  } catch (err) {
    console.error('departures POST error:', err)
    return NextResponse.json({ error: 'Failed to create departure' }, { status: 500 })
  }
}
