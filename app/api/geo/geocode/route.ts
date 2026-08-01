import { NextResponse } from 'next/server'
import { geocodeText } from '@/lib/geoapify/geocoding'

export async function POST(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Geocoding not configured' }, { status: 503 })

  try {
    const { text, type } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const result = await geocodeText(text, apiKey, type)
    if (!result) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
