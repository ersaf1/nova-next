import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { TravelPackage } from '@/lib/types'

// GET /api/packages/by-slug/[slug]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('Package')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'archived')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }

  let includes: string[] = []
  let gallery: string[] = []
  let excluded: string[] = []
  try { includes = JSON.parse(data.includes ?? '[]') } catch { includes = [] }
  try { gallery = JSON.parse(data.gallery ?? '[]') } catch { gallery = [] }
  try { excluded = JSON.parse(data.excluded ?? '[]') } catch { excluded = [] }

  return NextResponse.json({ ...data, includes, gallery, excluded } as TravelPackage)
}