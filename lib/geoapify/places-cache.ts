import { createClient } from '@supabase/supabase-js'
import type { GeoapifyPlace } from './types'
import { fetchPlacesForCity } from './places'

// Server-side only — uses service role key when available, falls back to anon key.
// RLS is disabled on places_cache so anon key works fine.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TTL_DAYS = 7

function normalizeKey(destination: string): string {
  return destination.toLowerCase().trim().replace(/\s+/g, '-')
}

export async function getOrFetchPlaces(destination: string): Promise<GeoapifyPlace[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    console.warn('[places-cache] GEOAPIFY_API_KEY not set')
    return []
  }

  const key = normalizeKey(destination)

  // 1. Check cache
  try {
    const { data } = await supabase
      .from('places_cache')
      .select('places, fetched_at')
      .eq('destination', key)
      .single()

    if (data) {
      const age = Date.now() - new Date(data.fetched_at).getTime()
      if (age < TTL_DAYS * 24 * 60 * 60 * 1000) {
        return data.places as GeoapifyPlace[]
      }
    }
  } catch {
    // Cache miss — proceed to fetch
  }

  // 2. Fetch fresh from Geoapify
  const places = await fetchPlacesForCity(destination, apiKey)
  if (!places.length) return []

  // 3. Upsert into cache (non-fatal if it fails)
  try {
    await supabase
      .from('places_cache')
      .upsert(
        { destination: key, places, fetched_at: new Date().toISOString() },
        { onConflict: 'destination' }
      )
  } catch {
    // Cache write failure is non-fatal — return fetched data anyway
  }

  return places
}
