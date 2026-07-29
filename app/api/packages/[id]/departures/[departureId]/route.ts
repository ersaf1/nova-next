import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { PackageDeparture } from '@/lib/types'

// PUT /api/packages/[id]/departures/[departureId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; departureId: string }> }
) {
  const { id, departureId } = await params
  const packageId = parseInt(id)
  const depId = parseInt(departureId)
  if (isNaN(packageId) || isNaN(depId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { startDate, endDate, capacity, price, status } = body

    if (!startDate || !endDate || !capacity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, capacity, price' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('PackageDeparture')
      .update({
        startDate,
        endDate,
        capacity: Number(capacity),
        price: Number(price),
        status: status ?? 'available',
      })
      .eq('id', depId)
      .eq('packageId', packageId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data as PackageDeparture)
  } catch (err) {
    console.error('departure PUT error:', err)
    return NextResponse.json({ error: 'Failed to update departure' }, { status: 500 })
  }
}

// DELETE /api/packages/[id]/departures/[departureId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; departureId: string }> }
) {
  const { id, departureId } = await params
  const packageId = parseInt(id)
  const depId = parseInt(departureId)
  if (isNaN(packageId) || isNaN(depId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('PackageDeparture')
      .delete()
      .eq('id', depId)
      .eq('packageId', packageId)

    if (error) throw error
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error('departure DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete departure' }, { status: 500 })
  }
}
