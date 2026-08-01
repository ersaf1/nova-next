import type { GeocodingResult } from './types'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

export async function geocodeText(
  text: string,
  apiKey: string,
  type?: 'city' | 'street' | 'amenity' | 'locality'
): Promise<GeocodingResult | null> {
  const url = new URL(`${GEOAPIFY_BASE}/v1/geocode/search`)
  url.searchParams.set('text', text)
  url.searchParams.set('format', 'geojson')
  url.searchParams.set('limit', '1')
  url.searchParams.set('lang', 'en')
  if (type) url.searchParams.set('type', type)
  url.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null

    return {
      placeId: feature.properties.place_id,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      formatted: feature.properties.formatted,
      city: feature.properties.city,
      country: feature.properties.country,
    }
  } catch {
    return null
  }
}
