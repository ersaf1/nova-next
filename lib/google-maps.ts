/**
 * Google Maps & Google Places API Integration Engine
 * Provides verified POI lookup, place details, and official universal navigation URLs.
 */

export interface GooglePlaceResult {
  placeId: string
  name: string
  formattedAddress: string
  lat: number
  lng: number
  rating?: number
  userRatingsTotal?: number
  types?: string[]
  mapsUrl: string
}

/**
 * Searches Google Places API (Text Search) for real-world attractions and culinary spots
 */
export async function searchGooglePlaces(
  query: string,
  apiKey: string = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
): Promise<GooglePlaceResult[]> {
  if (!apiKey || !query) return []

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&language=id&key=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return []

    const data = await res.json()
    if (data.status !== 'OK' || !Array.isArray(data.results)) {
      return []
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.results.map((item: any): GooglePlaceResult => {
      const lat = item.geometry?.location?.lat || 0
      const lng = item.geometry?.location?.lng || 0
      const placeId = item.place_id || ''

      return {
        placeId,
        name: item.name || '',
        formattedAddress: item.formatted_address || '',
        lat,
        lng,
        rating: item.rating,
        userRatingsTotal: item.user_ratings_total,
        types: item.types || [],
        mapsUrl: createGoogleMapsUrl(item.name, item.formatted_address, placeId),
      }
    })
  } catch (err) {
    console.error('[GooglePlaces] Search error:', err)
    return []
  }
}

/**
 * Generates official Google Maps Universal URL.
 * When place_id is provided, Google Maps opens the EXACT official listing.
 */
export function createGoogleMapsUrl(
  placeName: string,
  contextAddress: string = '',
  placeId?: string
): string {
  const query = contextAddress
    ? placeName.toLowerCase().includes(contextAddress.toLowerCase())
      ? placeName
      : `${placeName}, ${contextAddress}`
    : placeName

  if (placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${encodeURIComponent(
      placeId
    )}`
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
