import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('Hero').select('*').limit(1).single()
    if (error && error.code !== 'PGRST116') throw error
    if (!data) {
      const defaultHero = {
        headline: 'The World,\nUnlocked.',
        subheadline: 'Plan, book, and experience extraordinary journeys across 150+ countries — all in one place.',
        badgeText: 'Live availability · 150+ countries',
        videoUrl: 'https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85',
      }
      const { data: created, error: createError } = await supabase.from('Hero').insert(defaultHero).select().single()
      if (createError) throw createError
      return NextResponse.json(created)
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch hero' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { data: hero } = await supabase.from('Hero').select('id').limit(1).single()
    if (!hero) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { data, error } = await supabase.from('Hero').update(body).eq('id', hero.id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update hero' }, { status: 500 })
  }
}
