import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const HERO_FILE = path.join(process.cwd(), 'data', 'hero.json')

const DEFAULT_HERO = {
  headline: 'The World,\nUnlocked.',
  subheadline: 'Plan, book, and experience extraordinary journeys across 150+ countries — all in one place.',
  badgeText: 'Live availability · 150+ countries',
  videoUrl: '/uploads/1785249740102-88207-602915574.mp4',
}

async function getLocalHero() {
  try {
    const data = await readFile(HERO_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return DEFAULT_HERO
  }
}

async function saveLocalHero(heroData: Record<string, unknown>) {
  try {
    await mkdir(path.dirname(HERO_FILE), { recursive: true })
    await writeFile(HERO_FILE, JSON.stringify(heroData, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write local hero file:', err)
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('Hero').select('*').limit(1).single()
    if (!error && data) {
      return NextResponse.json(data)
    }
  } catch {
    // Fallback to local file
  }

  const local = await getLocalHero()
  return NextResponse.json(local)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // 1. Always save to local JSON file
    const current = await getLocalHero()
    const updated = { ...current, ...body }
    delete updated.posterUrl // Ensure posterUrl is removed
    await saveLocalHero(updated)

    // 2. Try to update Supabase as well
    try {
      const { data: hero } = await supabase.from('Hero').select('id').limit(1).single()
      if (hero) {
        await supabase.from('Hero').update(updated).eq('id', hero.id)
      } else {
        await supabase.from('Hero').insert(updated)
      }
    } catch {
      // Supabase update failed, local file already saved
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Hero PUT error:', error)
    return NextResponse.json({ error: 'Failed to update hero' }, { status: 500 })
  }
}
