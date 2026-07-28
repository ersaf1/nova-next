import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateBookingCode(): string {
  const prefix = 'NVA'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    let query = supabase.from('Booking').select('*').order('createdAt', { ascending: false })
    if (email) query = query.eq('contactEmail', email)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      packageId,
      departureId,
      contactName,
      contactEmail,
      contactPhone,
      participants,
      voucherCode,
      notes,
      // legacy fields
      name, email, phone, travelDate, country,
    } = body

    // Support both new and legacy field names
    const resolvedName = contactName || name
    const resolvedEmail = contactEmail || email
    const resolvedPhone = contactPhone || phone

    if (!packageId || !resolvedName || !resolvedEmail || !resolvedPhone || !participants) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch package for snapshot
    const { data: pkg, error: pkgError } = await supabase
      .from('Package')
      .select('id, title, price')
      .eq('id', packageId)
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Fetch departure for price snapshot (if provided)
    let unitPrice: number = pkg.price
    let departureStartDate: string | undefined
    let departureEndDate: string | undefined

    if (departureId) {
      const { data: dep, error: depError } = await supabase
        .from('PackageDeparture')
        .select('id, price, startDate, endDate, remainingSlots, status')
        .eq('id', departureId)
        .single()

      if (depError || !dep) {
        return NextResponse.json({ error: 'Departure not found' }, { status: 404 })
      }

      if (dep.status === 'sold_out' || dep.status === 'cancelled') {
        return NextResponse.json({ error: 'Departure is no longer available' }, { status: 400 })
      }

      if (dep.remainingSlots < participants) {
        return NextResponse.json({
          error: `Only ${dep.remainingSlots} slot(s) remaining for this departure`
        }, { status: 400 })
      }

      unitPrice = dep.price
      departureStartDate = dep.startDate
      departureEndDate = dep.endDate
    }

    // Calculate pricing server-side — never trust browser prices
    const subtotal = unitPrice * participants
    let discountAmount = 0

    // Validate voucher server-side if provided
    if (voucherCode) {
      const today = new Date().toISOString().split('T')[0]
      const { data: coupon } = await supabase
        .from('Coupon')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('active', true)
        .lte('startDate', today)
        .gte('endDate', today)
        .single()

      if (coupon) {
        if (!coupon.minimumPurchase || subtotal >= coupon.minimumPurchase) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.floor((subtotal * coupon.discountValue) / 100)
            if (coupon.maximumDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maximumDiscount)
            }
          } else {
            discountAmount = coupon.discountValue
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount)
    const bookingCode = generateBookingCode()

    const bookingData = {
      bookingCode,
      packageId,
      packageName: pkg.title,
      departureId: departureId || null,
      departureStartDate: departureStartDate || null,
      departureEndDate: departureEndDate || null,
      contactName: resolvedName,
      contactEmail: resolvedEmail,
      contactPhone: resolvedPhone,
      participants: Number(participants),
      unitPrice,
      subtotal,
      discountAmount,
      totalAmount,
      voucherCode: voucherCode || null,
      notes: notes || null,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
      // legacy fallback fields
      country: country || null,
      travelDate: travelDate || departureStartDate || null,
      // keep legacy name/email/phone for backward compat
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
    }

    const { data, error } = await supabase
      .from('Booking')
      .insert(bookingData)
      .select()
      .single()

    if (error) throw error

    // Decrement remaining slots if departure selected (non-fatal, fire-and-forget)
    if (departureId) {
      void supabase.rpc('decrement_departure_slots', {
        p_departure_id: departureId,
        p_count: participants,
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Booking POST error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
