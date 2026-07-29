import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'

const DESTINATIONS_FILE = path.join(process.cwd(), 'data', 'destinations.json')

async function getLocalDestinations() {
  try {
    const data = await readFile(DESTINATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('Destination').select('*')
    if (!error && data && data.length > 0) {
      return NextResponse.json(data)
    }
  } catch {
    // Fallback to local json
  }

  const local = await getLocalDestinations()
  return NextResponse.json(local)
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
