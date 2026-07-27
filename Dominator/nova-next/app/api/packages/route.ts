import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('Package').select('*')
    if (error) throw error
    const parsed = (data ?? []).map((p: { includes: string } & Record<string, unknown>) => ({
      ...p,
      includes: typeof p.includes === 'string' ? JSON.parse(p.includes) : p.includes,
    }))
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = { ...body, includes: JSON.stringify(body.includes ?? []) }
    const { data: item, error } = await supabase.from('Package').insert(data).select().single()
    if (error) throw error
    return NextResponse.json({ ...item, includes: JSON.parse(item.includes) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
