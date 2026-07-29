import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isAdmin = searchParams.get('admin') === 'true'

  let query = supabase.from('Coupon').select('*')

  if (!isAdmin) {
    const now = new Date().toISOString()
    query = query
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
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
