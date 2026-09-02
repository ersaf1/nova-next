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
      .filter((f) => {
        const rawName = f.properties?.name?.trim()
        if (!rawName || rawName.length < 3 || rawName.length > 70) return false
        const lower = rawName.toLowerCase()

        // Filter out spam, OSM rants, ticket notes, generic markers, government/administrative offices
        if (
          lower.includes('scam') ||
          lower.includes('free entrance') ||
          lower.includes('entrance!') ||
          lower.includes('above sky') ||
          lower.includes('view only') ||
          lower.includes('water slide') ||
          lower.includes('200k') ||
          lower.includes('!') ||
          lower.includes('?') ||
          lower.includes('badan pertanahan') ||
          lower.includes('bpn ') ||
          lower.includes('kementerian') ||
          lower.includes('kantor dinas') ||
          lower.includes('dinas ') ||
          lower.includes('samsat') ||
          lower.includes('polres') ||
          lower.includes('polsek') ||
          lower.includes('koramil') ||
          lower.includes('kodim') ||
          lower.includes('pengadilan') ||
          lower.includes('kejaksaan') ||
          lower.includes('kantor pajak') ||
          lower.includes('kpp pratama') ||
          lower.includes('bpjs') ||
          lower.includes('pdam') ||
          lower.includes('pln ') ||
          lower.includes('notaris') ||
          lower.includes('ppat') ||
          lower.includes('kantor lurah') ||
          lower.includes('kantor camat') ||
          lower.startsWith('kantor ') ||
          lower.startsWith('balai ') ||
          lower.startsWith('sdn ') ||
          lower.startsWith('smpn ') ||
          lower.startsWith('sman ') ||
          lower.startsWith('smkn ') ||
          lower.startsWith('tk ') ||
          lower.startsWith('pos ronda') ||
          lower.startsWith('puskesmas') ||
          lower.startsWith('klinik') ||
          lower.startsWith('apotek') ||
          lower.startsWith('toilet') ||
          lower.startsWith('parkir') ||
          lower.startsWith('spbu') ||
          lower.startsWith('pom bensin') ||
          lower.startsWith('indomaret') ||
          lower.startsWith('alfamart') ||
          lower.startsWith('alfamidi') ||
          lower.startsWith('bengkel') ||
          lower.startsWith('laundry')
        ) {
          return false
        }

        const genericList = ['natural water slide', 'view only area', 'above sky view', 'photo spot', 'view point']
        if (genericList.includes(lower)) return false

        return true
      })
      .map((f): GeoapifyPlace => {
        let cleanName = f.properties.name.trim()
        cleanName = cleanName.replace(/^Eks\s+taman\s+/i, 'Taman ').replace(/^Bekas\s+/i, '')
        cleanName = cleanName.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
        cleanName = cleanName.replace(/[!?,;]+$/g, '').trim()

        return {
          placeId: f.properties.place_id,
          name: cleanName,
          categories: f.properties.categories ?? [],
          lat: f.properties.lat,
          lon: f.properties.lon,
          address: f.properties.formatted ?? '',
          city: f.properties.city,
          distance: f.properties.distance,
          website: f.properties.datasource?.raw?.website,
          openingHours: f.properties.datasource?.raw?.opening_hours,
        }
      })
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
