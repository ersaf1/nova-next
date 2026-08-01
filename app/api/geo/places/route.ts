import { NextResponse } from 'next/server'
import { searchPlaces } from '@/lib/geoapify/places'
import { mapToGeoapifyCategory } from '@/lib/geoapify/category-map'

export async function POST(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places not configured' }, { status: 503 })

  try {
    const { latitude, longitude, category, radius = 5000, limit = 10 } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 })
    }

    // Accept both Geoapify categories and natural language
    const resolvedCategory = mapToGeoapifyCategory(category ?? 'tourism')

    const places = await searchPlaces(
      { latitude, longitude, category: resolvedCategory, radius, limit },
      apiKey
    )

    if (!places.length) {
      return NextResponse.json(
        {
          places: [],
          message: `Tidak ada ${category ?? 'tempat'} yang ditemukan dalam radius ${radius / 1000} km.`,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ places })
  } catch {
    return NextResponse.json({ error: 'Places search failed' }, { status: 500 })
  }
}
