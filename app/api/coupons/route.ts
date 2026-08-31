import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth-server'

const DEFAULT_COUPONS = [
  {
    id: 1,
    code: 'NOVAHOLIDAY',
    discount_type: 'percent',
    discount_value: 15,
    min_amount: 5000000,
    max_uses: 100,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: 'PHINISIPROMO',
    discount_type: 'fixed',
    discount_value: 1000000,
    min_amount: 8000000,
    max_uses: 50,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    code: 'FIRSTTRIP',
    discount_type: 'fixed',
    discount_value: 500000,
    min_amount: 3000000,
    max_uses: 200,
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const authResult = await requireRole(request, ['admin', 'super_admin'])
    const isAdmin = !(authResult instanceof NextResponse)

    const now = new Date().toISOString()
    let query = supabase.from('Coupon').select('*')

    if (!isAdmin) {
      query = query
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_COUPONS)
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(DEFAULT_COUPONS)
  }
}

export async function POST(request: Request) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json()
    const { code, discount_type, discount_value, min_amount, max_uses, expires_at } = body

    if (!code || !discount_type || discount_value == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Coupon')
      .insert({ code: code.toUpperCase().trim(), discount_type, discount_value, min_amount, max_uses, expires_at: expires_at || null })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
