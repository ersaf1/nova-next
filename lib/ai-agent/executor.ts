import type { PlacesResult } from './types'
import type { GeoapifyPlace } from '@/lib/geoapify/types'
import { mapToGeoapifyCategory } from '@/lib/geoapify/category-map'

interface GeocodeTool {
  text: string
}

interface SearchPlacesTool {
  latitude: number
  longitude: number
  category: string
  radius?: number
  limit?: number
  location_name?: string
}

export type ToolCallResult =
  | { type: 'geocode'; lat: number; lon: number; formatted: string }
  | { type: 'places'; result: PlacesResult }
  | { type: 'error'; message: string }

// Executes tool calls server-side by calling our own /api/geo/* routes.
// baseUrl is the Next.js app origin, required for server-to-server fetch.
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  baseUrl: string
): Promise<ToolCallResult> {
  if (toolName === 'geocode_location') {
    const { text } = args as unknown as GeocodeTool
    const res = await fetch(`${baseUrl}/api/geo/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return { type: 'error', message: `Lokasi "${text}" tidak ditemukan.` }
    const data = await res.json()
    return { type: 'geocode', lat: data.lat, lon: data.lon, formatted: data.formatted }
  }

  if (toolName === 'search_places') {
    const {
      latitude,
      longitude,
      category,
      radius = 5000,
      limit = 10,
      location_name,
    } = args as unknown as SearchPlacesTool
    const resolvedCategory = mapToGeoapifyCategory(category)
    const res = await fetch(`${baseUrl}/api/geo/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, category: resolvedCategory, radius, limit }),
    })
    if (!res.ok) return { type: 'error', message: 'Gagal mencari tempat.' }
    const data = await res.json()
    const places: GeoapifyPlace[] = data.places ?? []
    return {
      type: 'places',
      result: {
        query: category,
        location: location_name ?? `${latitude},${longitude}`,
        category: resolvedCategory,
        places,
        center: { lat: latitude, lon: longitude },
      },
    }
  }

  return { type: 'error', message: `Unknown tool: ${toolName}` }
}
