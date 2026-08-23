import type { GeocodingResult } from './types'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

function extractCountryCode(text: string): string | null {
  const t = text.toLowerCase()
  if (
    t.includes('indonesia') ||
    t.includes('bali') ||
    t.includes('jakarta') ||
    t.includes('ubud') ||
    t.includes('yogyakarta') ||
    t.includes('jogja') ||
    t.includes('lombok') ||
    t.includes('bandung')
  ) {
    return 'id'
  }
  if (t.includes('japan') || t.includes('jepang')) return 'jp'
  if (t.includes('france') || t.includes('prancis')) return 'fr'
  if (t.includes('italy') || t.includes('italia')) return 'it'
  if (t.includes('greece') || t.includes('yunani')) return 'gr'
  if (t.includes('thailand')) return 'th'
  if (t.includes('singapor')) return 'sg'
  if (t.includes('malaysia')) return 'my'
  if (t.includes('vietnam')) return 'vn'
  if (t.includes('korea')) return 'kr'
  if (t.includes('china') || t.includes('tiongkok')) return 'cn'
  if (t.includes('taiwan')) return 'tw'
  if (t.includes('spain') || t.includes('spanyol')) return 'es'
  if (t.includes('united kingdom') || t.includes('inggris') || t.includes(' uk')) return 'gb'
  if (t.includes('united states') || t.includes('amerika') || t.includes(' us')) return 'us'
  if (t.includes('australia')) return 'au'
  return null
}

function isCountryNameOnly(segment: string): boolean {
  const s = segment.toLowerCase().trim()
  const countries = [
    'indonesia', 'japan', 'jepang', 'france', 'prancis', 'italy', 'italia',
    'greece', 'yunani', 'thailand', 'singapore', 'singapura', 'malaysia',
    'vietnam', 'korea', 'china', 'tiongkok', 'taiwan', 'spain', 'spanyol',
    'united kingdom', 'inggris', 'uk', 'united states', 'amerika', 'us', 'australia'
  ]
  return countries.includes(s)
}

function cleanGeocodeQuery(text: string): { query: string; countryCode: string | null } {
  const countryCode = extractCountryCode(text)
  
  let query = text
  
  // If there are commas, take the first segment
  if (query.includes(',')) {
    const segments = query.split(',')
    for (const segment of segments) {
      const cleanSegment = segment.trim()
      if (cleanSegment && !isCountryNameOnly(cleanSegment)) {
        query = cleanSegment
        break
      }
    }
  }
  
  // If it contains " & " or " and " or " dan ", take the first part
  const splitters = [/\s+&\s+/, /\s+and\s+/i, /\s+dan\s+/i]
  for (const splitter of splitters) {
    if (splitter.test(query)) {
      query = query.split(splitter)[0].trim()
    }
  }

  return { query: query.trim(), countryCode }
}

export async function geocodeText(
  text: string,
  apiKey: string,
  type?: 'city' | 'street' | 'amenity' | 'locality'
): Promise<GeocodingResult | null> {
  const { query, countryCode } = cleanGeocodeQuery(text)

  const url = new URL(`${GEOAPIFY_BASE}/v1/geocode/search`)
  url.searchParams.set('text', query)
  url.searchParams.set('format', 'geojson')
  url.searchParams.set('limit', '1')
  url.searchParams.set('lang', 'en')
  if (type) url.searchParams.set('type', type)
  if (countryCode) url.searchParams.set('filter', `countrycode:${countryCode}`)
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
