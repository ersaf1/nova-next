import { NextResponse } from 'next/server'
import { geocodeText } from '@/lib/geoapify/geocoding'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const query = searchParams.get('query')
  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    return NextResponse.redirect('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80')
  }

  let finalLat = lat
  let finalLon = lon

  // If no lat/lon, try to search for the query using Geocoding
  if ((!finalLat || !finalLon) && query) {
    try {
      const geo = await geocodeText(query, apiKey)
      if (geo) {
        finalLat = String(geo.lat)
        finalLon = String(geo.lon)
      }
    } catch (e) {
      console.error('Error geocoding fallback for static map:', e)
    }
  }

  if (!finalLat || !finalLon) {
    // Return a default scenic map or travel photo
    return NextResponse.redirect('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80')
  }

  // Construct the Static Map URL
  // style: osm-bright-smooth is clean and professional
  const marker = `lonlat:${finalLon},${finalLat};color:%23ef4444;size:medium`
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=350&center=lonlat:${finalLon},${finalLat}&zoom=14&marker=${marker}&apiKey=${apiKey}`

  try {
    const response = await fetch(mapUrl)
    if (response.ok) {
      const blob = await response.blob()
      return new Response(blob, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      })
    }
  } catch (err) {
    console.error('Error fetching static map from Geoapify:', err)
  }

  return NextResponse.redirect('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80')
}
