import type { AutocompleteSuggestion } from './types'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

export async function getAutocompleteSuggestions(
  text: string,
  apiKey: string,
  limit = 5
): Promise<AutocompleteSuggestion[]> {
  if (!text || text.length < 2) return []

  const url = new URL(`${GEOAPIFY_BASE}/v1/geocode/autocomplete`)
  url.searchParams.set('text', text)
  url.searchParams.set('format', 'geojson')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('lang', 'en')
  url.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data.features ?? []) as any[]).map((f): AutocompleteSuggestion => ({
      placeId: f.properties.place_id,
      text: f.properties.name ?? f.properties.formatted,
      formatted: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
      type: f.properties.result_type ?? 'unknown',
    }))
  } catch {
    return []
  }
}
