import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth-server'

export async function GET() {
  try {
    const { data, error } = await supabase.from('Testimonial').select('*')
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json()
    const { data, error } = await supabase.from('Testimonial').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
