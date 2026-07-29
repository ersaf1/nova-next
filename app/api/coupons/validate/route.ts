import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

// POST /api/coupons/validate
// Body: { code: string, subtotal: number }
// Returns: { valid: boolean, discountAmount: number, finalAmount: number, message?: string }

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ valid: false, message: 'Kode dan subtotal diperlukan' }, { status: 400 })
    }

    // Get user (optional — for per-user usage limit)
    let userId: string | null = null
    try {
      const cookieStore = await cookies()
      const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
      )
      const { data: { user } } = await supabaseAuth.auth.getUser()
      userId = user?.id ?? null
    } catch { /* optional */ }

    // Fetch promo
    const { data: promo } = await supabase
      .from('PromoCode')
      .select('*')
      .ilike('code', code.trim())
      .single()

    if (!promo) return NextResponse.json({ valid: false, message: 'Kode promo tidak valid' })
    if (!promo.active) return NextResponse.json({ valid: false, message: 'Kode promo tidak aktif' })

    const now = new Date()
    if (now < new Date(promo.startDate)) return NextResponse.json({ valid: false, message: 'Kode promo belum aktif' })
    if (now > new Date(promo.endDate)) return NextResponse.json({ valid: false, message: 'Kode promo telah kadaluarsa' })

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ valid: false, message: 'Kuota promo sudah habis' })
    }

    if (promo.minimumPurchase && subtotal < promo.minimumPurchase) {
      const { formatIDR } = await import('@/lib/types')
      return NextResponse.json({ valid: false, message: `Minimum pembelian ${formatIDR(promo.minimumPurchase)}` })
    }

    // Per-user limit check
    if (userId && promo.usagePerUser) {
      const { count } = await supabase
        .from('Booking')
        .select('id', { count: 'exact', head: true })
        .eq('promoCode', promo.code.toUpperCase())
        .eq('userId', userId)
      if ((count ?? 0) >= promo.usagePerUser) {
        return NextResponse.json({ valid: false, message: 'Anda sudah menggunakan kode promo ini' })
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.discountType === 'percentage') {
      discountAmount = Math.floor((subtotal * Number(promo.discountValue)) / 100)
      if (promo.maximumDiscount) discountAmount = Math.min(discountAmount, promo.maximumDiscount)
    } else {
      discountAmount = Math.min(Number(promo.discountValue), subtotal)
    }

    const finalAmount = subtotal - discountAmount

    // Return ONLY computed values — never return raw promo row
    return NextResponse.json({
      valid: true,
      code: promo.code.toUpperCase(),
      discountAmount,
      finalAmount,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
    })
  } catch {
    return NextResponse.json({ valid: false, message: 'Terjadi kesalahan' }, { status: 500 })
  }
}
