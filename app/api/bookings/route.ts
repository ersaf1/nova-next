import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest, getUserRole } from '@/lib/auth-server'
import { sendBookingConfirmation } from '@/lib/email'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

function generateBookingCode(): string {
  const prefix = 'NVA'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const refundFilter = searchParams.get('refund') // e.g. 'requested'
    const emailParam = searchParams.get('email')

    // 1. Try Bearer token or cookies via getUserFromRequest
    let user = await getUserFromRequest(request)

    // 2. Fall back to createServerClient
    if (!user) {
      try {
        const cookieStore = await cookies()
        const supabaseAuth = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const { data } = await supabaseAuth.auth.getUser()
        user = data.user
      } catch {}
    }

    // Admin refund queue: ?refund=requested returns all bookings with that refund_status
    if (refundFilter) {
      const { data, error } = await supabase
        .from('Booking')
        .select('*')
        .eq('refund_status', refundFilter)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data ?? [])
    }

    // If still no authenticated user, fall back to emailParam if passed by client
    if (!user) {
      if (emailParam) {
        const { data, error } = await supabase
          .from('Booking')
          .select('*')
          .eq('email', emailParam)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json(data ?? [])
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = await getUserRole(user.id)
    const isAdmin = role === 'admin' || role === 'super_admin'

    let query = supabase.from('Booking').select('*')
    // Non-admin users only see their own bookings (matching userId, user email, or emailParam)
    if (!isAdmin) {
      const emails = Array.from(new Set([user.email, emailParam].filter(Boolean))) as string[]
      const orConditions = [`userId.eq.${user.id}`, ...emails.map((e) => `email.eq.${e}`)]
      query = query.or(orConditions.join(','))
    } else if (emailParam) {
      query = query.eq('email', emailParam)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

const SERVICE_FEE = 250000 // IDR, fixed per booking

export async function POST(request: Request) {
  try {
    // Auth: get session user from Bearer token or cookies
    let user = await getUserFromRequest(request)
    if (!user) {
      try {
        const cookieStore = await cookies()
        const supabaseAuth = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const { data } = await supabaseAuth.auth.getUser()
        user = data.user
      } catch {}
    }
    const userId = user?.id ?? null

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
      passengers,
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
    let pkgTitle = body.packageName || ''
    let unitPrice: number = Number(body.unitPrice) || 0

    const { data: pkg } = await supabase
      .from('Package')
      .select('id, title, price')
      .eq('id', packageId)
      .maybeSingle()

    if (pkg) {
      if (!pkgTitle) pkgTitle = pkg.title
      if (!unitPrice) unitPrice = pkg.price
    } else if (!pkgTitle) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (!unitPrice || unitPrice <= 0) {
      unitPrice = 1500000
    }

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
      const { data: coupon } = await supabase
        .from('Coupon')
        .select('*')
        .eq('code', voucherCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (coupon) {
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date()
        const withinUsage = coupon.max_uses === null || coupon.used_count < coupon.max_uses
        const meetsMin = subtotal >= (coupon.min_amount || 0)

        if (notExpired && withinUsage && meetsMin) {
          if (coupon.discount_type === 'percent') {
            discountAmount = Math.round((subtotal * coupon.discount_value) / 100)
          } else {
            discountAmount = Math.min(coupon.discount_value, subtotal)
          }

          // Increment coupon usage
          await supabase
            .from('Coupon')
            .update({ used_count: (coupon.used_count ?? 0) + 1 })
            .eq('id', coupon.id)
        }
      }
    }

    // Total calculation
    const totalAmount = Math.max(0, subtotal - discountAmount + SERVICE_FEE)
    const bookingCode = generateBookingCode()

    const finalNotes = passengers && Array.isArray(passengers) && passengers.length > 0
      ? JSON.stringify({ userNotes: notes || '', passengers })
      : (notes || null)

    const bookingData = {
      bookingCode,
      packageName: pkgTitle,
      departureId: departureId || null,
      departureStartDate: departureStartDate || null,
      departureEndDate: departureEndDate || null,
      participants: Number(participants),
      unitPrice,
      subtotal,
      discountAmount,
      serviceFee: SERVICE_FEE,
      totalAmount,
      notes: finalNotes,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      status: 'paid',
      userId: userId || null,
      // legacy fallback fields
      country: country || null,
      travelDate: travelDate || departureStartDate || null,
      // keep legacy name/email/phone for backward compat
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      promoCode: voucherCode || null,
    }

    const { data, error } = await supabase
      .from('Booking')
      .insert(bookingData)
      .select()
      .single()

    if (error) throw error

    // Send booking confirmation email (fire-and-forget — email errors must not fail the booking)
    sendBookingConfirmation({
      to: resolvedEmail,
      name: resolvedName,
      packageName: pkgTitle,
      bookingId: data.id,
      travelDate: travelDate || departureStartDate || '',
      participants: Number(participants),
      totalAmount,
    }).catch(() => {})

    // Trigger WhatsApp notification (fire-and-forget)
    sendWhatsAppNotification({
      phone: resolvedPhone,
      name: resolvedName,
      type: 'booking_created',
      data: {
        bookingId: data.id,
        bookingCode,
        packageName: pkgTitle,
        travelDate: travelDate || departureStartDate || '',
        participants: Number(participants),
        totalAmount
      }
    }).catch(() => {})

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
