import type { GeoapifyPlace, SearchPlacesParams } from './types'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

// Reusable searchPlaces function per spec:
// searchPlaces({ latitude, longitude, category, radius, limit })
export async function searchPlaces(
  params: SearchPlacesParams,
  apiKey: string
): Promise<GeoapifyPlace[]> {
  const { latitude, longitude, category, radius = 5000, limit = 10 } = params

  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return []
  if (limit > 20) throw new Error('limit cannot exceed 20')

  const url = new URL(`${GEOAPIFY_BASE}/v2/places`)
  url.searchParams.set('categories', category)
  url.searchParams.set('filter', `circle:${longitude},${latitude},${radius}`)
  url.searchParams.set('bias', `proximity:${longitude},${latitude}`)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('lang', 'en')
  url.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data.features ?? []) as any[])
      .filter((f) => f.properties?.name)
      .map((f): GeoapifyPlace => ({
        placeId: f.properties.place_id,
        name: f.properties.name,
        categories: f.properties.categories ?? [],
        lat: f.properties.lat,
        lon: f.properties.lon,
        address: f.properties.formatted ?? '',
        city: f.properties.city,
        distance: f.properties.distance,
        website: f.properties.datasource?.raw?.website,
        openingHours: f.properties.datasource?.raw?.opening_hours,
      }))
  } catch {
    return []
  }
}

// Convenience: fetch tourist attractions for a city name.
// Used by the itinerary route to enrich AI-generated itineraries.
export async function fetchPlacesForCity(
  cityName: string,
  apiKey: string
): Promise<GeoapifyPlace[]> {
  const { geocodeText } = await import('./geocoding')
  // Try city type first, then fallback to unconstrained geocode for small towns, parks, and local spots
  let geo = await geocodeText(cityName, apiKey, 'city')
  if (!geo) {
    geo = await geocodeText(cityName, apiKey)
  }
  if (!geo) return []

  return searchPlaces(
    {
      latitude: geo.lat,
      longitude: geo.lon,
      category: [
        'entertainment.museum',
        'entertainment.zoo',
        'entertainment.aquarium',
        'entertainment.theme_park',
        'entertainment.culture.gallery',
        'leisure.park',
        'heritage.unesco',
        'natural',
        'tourism',
      ].join(','),
      radius: 10000,
      limit: 12,
    },
    apiKey
  )
}
