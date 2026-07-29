import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'

const DESTINATIONS_FILE = path.join(process.cwd(), 'data', 'destinations.json')

async function getLocalDestinations() {
  try {
    const data = await readFile(DESTINATIONS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch (err) {
    console.error('Error reading local destinations.json:', err)
  }
  return []
}

export async function GET() {
  // Read local destinations first (contains all 195 UN countries with unique HD photos)
  const localData = await getLocalDestinations()

  try {
    const { data, error } = await supabase.from('Destination').select('*')
    if (!error && data && data.length > 0) {
      // Merge Supabase DB with local 195 countries dataset
      if (data.length < localData.length) {
        return NextResponse.json(localData)
      }
      return NextResponse.json(data)
    }
  } catch {
    // Fallback to local json
  }

  return NextResponse.json(localData)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from('Destination').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}
