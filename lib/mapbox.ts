/**
 * Mapbox Geocoding & Places Integration Engine
 * Provides verified POI lookup, precision geocoding, and map utilities for Indonesian destinations.
 */

export interface MapboxPlace {
  id: string
  name: string
  formattedAddress: string
  lat: number
  lon: number
  category?: string
  mapsUrl: string
}

export interface MapboxGeocodeResult {
  placeName: string
  text: string
  lat: number
  lon: number
  context?: { id: string; text: string }[]
}

const DEFAULT_MAPBOX_TOKEN =
  process.env.MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  ''

/**
 * Searches Mapbox Places (Geocoding API v5) for POIs, attractions, cafes, and parks in Indonesia
 */
export async function searchMapboxPlaces(
  query: string,
  token: string = DEFAULT_MAPBOX_TOKEN
): Promise<MapboxPlace[]> {
  const activeToken = token || DEFAULT_MAPBOX_TOKEN
  if (!activeToken || !query) return []

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${activeToken}&country=id&types=poi,address,neighborhood,locality,place&language=id&limit=8`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return []

    const data = await res.json()
    if (!Array.isArray(data.features)) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.features.map((f: any): MapboxPlace => {
      const [lon, lat] = f.center || [0, 0]
      const name = f.text || f.place_name?.split(',')[0] || ''
      const formattedAddress = f.place_name || ''
      const category = f.properties?.category || ''

      return {
        id: f.id,
        name,
        formattedAddress,
        lat,
        lon,
        category,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
      }
    })
  } catch (err) {
    console.error('[Mapbox] Search places error:', err)
    return []
  }
}

/**
 * Geocodes a district, city, or landmark to obtain exact coordinates
 */
export async function geocodeMapbox(
  query: string,
  token: string = DEFAULT_MAPBOX_TOKEN
): Promise<MapboxGeocodeResult | null> {
  const activeToken = token || DEFAULT_MAPBOX_TOKEN
  if (!activeToken || !query) return null

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${activeToken}&country=id&limit=1&language=id`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null

    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null

    const [lon, lat] = feature.center || [0, 0]

    return {
      placeName: feature.place_name || '',
      text: feature.text || '',
      lat,
      lon,
      context: feature.context,
    }
  } catch (err) {
    console.error('[Mapbox] Geocode error:', err)
    return null
  }
}
