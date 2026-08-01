# Plan A: Geoapify Services Layer

**Date:** 2026-08-01
**Branch:** feature/geoapify-real-places
**Depends on:** nothing (foundation layer)
**Required by:** Plan B (AI Planner page)

---

## Goal

Build the complete Geoapify service layer that both the existing itinerary page AND the new AI Planner page will consume. All Geoapify API calls go through server-side API routes — the API key is never exposed to the client.

**Geoapify free tier:** 3.000 req/day. Sign up at https://myprojects.geoapify.com.

---

## Prerequisites

Add to `.env.local`:
```
GEOAPIFY_API_KEY=a28e9f9e65e94942aade44f22fb4a25b
```

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `lib/geoapify/types.ts` | All Geoapify-related TypeScript interfaces |
| `lib/geoapify/geocoding.ts` | Geocoding: city/address name → lat/lon |
| `lib/geoapify/places.ts` | Places search: lat/lon + category → GeoapifyPlace[] |
| `lib/geoapify/autocomplete.ts` | Address autocomplete: text → suggestions[] |
| `lib/geoapify/routing.ts` | Routing stub: origin + destination → RouteResult (Phase 7 scaffold) |
| `lib/geoapify/category-map.ts` | Natural language → Geoapify category string mapper |
| `lib/geoapify/places-cache.ts` | Supabase cache wrapper for Places results (7-day TTL) |
| `app/api/geo/geocode/route.ts` | Server route: POST { text } → { lat, lon, placeId, formatted } |
| `app/api/geo/places/route.ts` | Server route: POST { lat, lon, category, radius, limit } → GeoapifyPlace[] |
| `app/api/geo/autocomplete/route.ts` | Server route: GET ?text=... → AutocompleteSuggestion[] |
| `supabase/migrations/007_places_cache.sql` | Creates places_cache table |

### Modified files
| File | Change |
|------|--------|
| `lib/types.ts` | Add GeoapifyPlace, AutocompleteSuggestion, GeocodingResult interfaces |
| `app/api/ai/itinerary/route.ts` | Replace static attraction injection with getOrFetchPlaces() |
| `lib/attractions.ts` | Add lat/lon to Attraction interface + mergePlacesIntoAttractions() helper |

---

## Global Constraints (binding for all tasks)

- API key `GEOAPIFY_API_KEY` is **server-only** — never referenced in client components or passed to the browser
- All Geoapify HTTP calls happen inside `lib/geoapify/*.ts` — never directly in API routes or components
- Fallback chain for itinerary attractions: **Geoapify → static hardcoded (7 destinations) → AI-provided names → generic 3**
- Cache TTL: **7 days** in `places_cache` Supabase table
- All fetch calls use `cache: 'no-store'` (no Next.js data cache — we manage our own cache)
- Category mapper lives in `lib/geoapify/category-map.ts` — imported by both API routes and AI agent

---

## Task 1 — DB migration: places_cache table

**Files:** `supabase/migrations/007_places_cache.sql`

```sql
-- 007_places_cache.sql
create table if not exists places_cache (
  id          bigserial primary key,
  destination text        not null unique,  -- normalized: lowercase, hyphenated
  places      jsonb       not null,         -- GeoapifyPlace[]
  fetched_at  timestamptz not null default now()
);
```

**How to apply:** Supabase dashboard > SQL Editor. No RLS needed — server-only.

**Test:** Table appears in Supabase dashboard Table Editor.

---

## Task 2 — lib/geoapify/types.ts

**Files:** `lib/geoapify/types.ts` (new)

```typescript
// All Geoapify-related types. Import from here, not from lib/types.ts for Geoapify specifics.

export interface GeocodingResult {
  placeId: string
  lat: number
  lon: number
  formatted: string   // human-readable address
  city?: string
  country?: string
}

export interface GeoapifyPlace {
  placeId: string
  name: string
  categories: string[]   // e.g. ['catering.cafe', 'catering']
  lat: number
  lon: number
  address: string        // formatted address
  city?: string
  distance?: number      // meters from query point
  website?: string
  openingHours?: string
}

export interface AutocompleteSuggestion {
  placeId: string
  text: string           // display text
  formatted: string      // full formatted address
  lat?: number
  lon?: number
  type: string           // 'city' | 'street' | 'amenity' | etc.
}

export interface SearchPlacesParams {
  latitude: number
  longitude: number
  category: string       // Geoapify category string e.g. 'catering.cafe'
  radius?: number        // meters, default 5000
  limit?: number         // default 10, max 20
}

export interface RouteResult {
  distance: number       // meters
  duration: number       // seconds
  geometry: GeoJSON.LineString | null
}
```

**Test:** `npm run build` — no TypeScript errors.

---

## Task 3 — lib/geoapify/category-map.ts

**Files:** `lib/geoapify/category-map.ts` (new)

```typescript
// Maps natural language (Indonesian + English) to Geoapify category strings.
// Add new mappings here as needed — no other files need to change.

const CATEGORY_MAP: Record<string, string> = {
  // Coffee & drinks
  'coffee shop': 'catering.cafe',
  'cafe': 'catering.cafe',
  'kafe': 'catering.cafe',
  'tempat ngopi': 'catering.cafe',
  'ngopi': 'catering.cafe',
  'kedai kopi': 'catering.cafe',
  'coffee': 'catering.cafe',

  // Food
  'restaurant': 'catering.restaurant',
  'restoran': 'catering.restaurant',
  'rumah makan': 'catering.restaurant',
  'makan': 'catering.restaurant',
  'food': 'catering.restaurant',
  'kuliner': 'catering.restaurant',
  'warung': 'catering.fast_food',
  'fast food': 'catering.fast_food',

  // Accommodation
  'hotel': 'accommodation.hotel',
  'penginapan': 'accommodation',
  'inn': 'accommodation',
  'hostel': 'accommodation.hostel',
  'villa': 'accommodation',
  'resort': 'accommodation',
  'bnb': 'accommodation.bed_and_breakfast',

  // Shopping
  'mall': 'commercial.shopping_mall',
  'pusat perbelanjaan': 'commercial.shopping_mall',
  'shopping': 'commercial.shopping_mall',
  'supermarket': 'commercial.supermarket',
  'minimarket': 'commercial.convenience',
  'toko': 'commercial',

  // Tourism & attractions
  'tempat wisata': 'tourism',
  'wisata': 'tourism',
  'attraction': 'tourism',
  'tourist': 'tourism',
  'museum': 'entertainment.museum',
  'taman': 'leisure.park',
  'park': 'leisure.park',
  'pantai': 'natural.beach',
  'beach': 'natural.beach',
  'gunung': 'natural.mountain',
  'mountain': 'natural.mountain',

  // Entertainment
  'hiburan': 'entertainment',
  'bioskop': 'entertainment.cinema',
  'cinema': 'entertainment.cinema',
  'theater': 'entertainment.culture.theatre',
  'galeri': 'entertainment.culture.gallery',
  'gallery': 'entertainment.culture.gallery',
  'zoo': 'entertainment.zoo',
  'kebun binatang': 'entertainment.zoo',
  'aquarium': 'entertainment.aquarium',

  // Health
  'rumah sakit': 'healthcare.hospital',
  'hospital': 'healthcare.hospital',
  'klinik': 'healthcare.clinic',
  'apotek': 'healthcare.pharmacy',
  'pharmacy': 'healthcare.pharmacy',

  // Transport
  'atm': 'service.financial.atm',
  'bank': 'service.financial.bank',
  'spbu': 'service.fuel',
  'gas station': 'service.fuel',
  'parkir': 'parking',
}

// Default category when no match found
const DEFAULT_CATEGORY = 'tourism'

export function mapToGeoapifyCategory(input: string): string {
  const normalized = input.toLowerCase().trim()

  // Exact match first
  if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized]

  // Partial match (input contains a keyword)
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return category
    }
  }

  // If input already looks like a Geoapify category (contains dots), return as-is
  if (normalized.includes('.')) return normalized

  return DEFAULT_CATEGORY
}

export { CATEGORY_MAP }
```

**Test:** `npm run build` — no TypeScript errors.

---

## Task 4 — lib/geoapify/geocoding.ts

**Files:** `lib/geoapify/geocoding.ts` (new)

```typescript
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
```

**Test:** Used indirectly by Task 5. Tested via `POST /api/geo/geocode` in Task 7.

---

## Task 5 — lib/geoapify/places.ts

**Files:** `lib/geoapify/places.ts` (new)

This is the core `searchPlaces()` function per the spec.

```typescript
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

// Convenience: fetch tourist attractions for a city name
// Used by the itinerary route to enrich AI-generated itineraries
export async function fetchPlacesForCity(
  cityName: string,
  apiKey: string
): Promise<GeoapifyPlace[]> {
  const { geocodeText } = await import('./geocoding')
  const geo = await geocodeText(cityName, apiKey, 'city')
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
```

**Test:** `POST /api/geo/places` with `{ lat: -7.7956, lon: 110.3695, category: "catering.cafe", radius: 5000, limit: 5 }` (Yogyakarta) should return real cafe names.

---

## Task 6 — lib/geoapify/autocomplete.ts + routing.ts

**Files:** `lib/geoapify/autocomplete.ts`, `lib/geoapify/routing.ts` (new)

### autocomplete.ts

```typescript
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
```

### routing.ts (Phase 7 scaffold — stub only)

```typescript
import type { RouteResult } from './types'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

// Stub: returns null until Phase 7 is implemented.
// Structure is ready for full Routing API integration.
export async function getRoute(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  apiKey: string,
  mode: 'drive' | 'walk' | 'bicycle' = 'drive'
): Promise<RouteResult | null> {
  // Phase 7: implement Geoapify Routing API here
  // GET https://api.geoapify.com/v1/routing?waypoints=lat,lon|lat,lon&mode=drive&apiKey=...
  console.warn('[routing] Phase 7 not yet implemented')
  return null
}
```

**Test:** `npm run build` — no TypeScript errors.

---

## Task 7 — lib/geoapify/places-cache.ts

**Files:** `lib/geoapify/places-cache.ts` (new)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { GeoapifyPlace } from './types'
import { fetchPlacesForCity } from './places'

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

  // 2. Fetch fresh
  const places = await fetchPlacesForCity(destination, apiKey)
  if (!places.length) return []

  // 3. Upsert
  try {
    await supabase
      .from('places_cache')
      .upsert(
        { destination: key, places, fetched_at: new Date().toISOString() },
        { onConflict: 'destination' }
      )
  } catch {
    // Non-fatal
  }

  return places
}
```

**Test:** Call itinerary API twice for same destination. Second call faster. Check `places_cache` table — one row per destination.

---

## Task 8 — Server API routes: /api/geo/*

**Files:** `app/api/geo/geocode/route.ts`, `app/api/geo/places/route.ts`, `app/api/geo/autocomplete/route.ts` (all new)

### geocode/route.ts
```typescript
import { NextResponse } from 'next/server'
import { geocodeText } from '@/lib/geoapify/geocoding'

export async function POST(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Geocoding not configured' }, { status: 503 })

  try {
    const { text, type } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const result = await geocodeText(text, apiKey, type)
    if (!result) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
```

### places/route.ts
```typescript
import { NextResponse } from 'next/server'
import { searchPlaces } from '@/lib/geoapify/places'
import { mapToGeoapifyCategory } from '@/lib/geoapify/category-map'

export async function POST(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places not configured' }, { status: 503 })

  try {
    const { latitude, longitude, category, radius = 5000, limit = 10 } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 })
    }

    // Accept both Geoapify categories and natural language
    const resolvedCategory = mapToGeoapifyCategory(category ?? 'tourism')

    const places = await searchPlaces({ latitude, longitude, category: resolvedCategory, radius, limit }, apiKey)

    if (!places.length) {
      return NextResponse.json(
        { places: [], message: `Tidak ada ${category ?? 'tempat'} yang ditemukan dalam radius ${radius / 1000} km.` },
        { status: 200 }
      )
    }

    return NextResponse.json({ places })
  } catch {
    return NextResponse.json({ error: 'Places search failed' }, { status: 500 })
  }
}
```

### autocomplete/route.ts
```typescript
import { NextResponse } from 'next/server'
import { getAutocompleteSuggestions } from '@/lib/geoapify/autocomplete'

export async function GET(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ suggestions: [] })

  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') ?? ''

  if (text.length < 2) return NextResponse.json({ suggestions: [] })

  try {
    const suggestions = await getAutocompleteSuggestions(text, apiKey)
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
```

**Test:**
- `POST /api/geo/geocode` with `{ "text": "Artos Mall Magelang" }` → should return lat/lon
- `POST /api/geo/places` with `{ "latitude": -7.47, "longitude": 110.21, "category": "cafe", "radius": 5000 }` → should return real cafes
- `GET /api/geo/autocomplete?text=Artis` → should return suggestions

---

## Task 9 — Update lib/attractions.ts + lib/types.ts

**Files:** `lib/attractions.ts`, `lib/types.ts`

### lib/attractions.ts changes

1. Update `Attraction` interface:
```typescript
export interface Attraction {
  name: string
  description: string
  image: string
  lat?: number
  lon?: number
}
```

2. Add at bottom of file:
```typescript
import type { GeoapifyPlace } from './geoapify/types'

function formatCategory(category: string): string {
  const last = category.split('.').pop() ?? category
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ')
}

export function mergePlacesIntoAttractions(places: GeoapifyPlace[]): Attraction[] {
  return places.map((place, idx) => ({
    name: place.name,
    description: [
      place.categories[0] ? formatCategory(place.categories[0]) : 'Attraction',
      place.address,
      place.openingHours ? `Buka: ${place.openingHours}` : null,
    ].filter(Boolean).join(' · '),
    image: GENERAL_TRAVEL_PHOTOS[idx % GENERAL_TRAVEL_PHOTOS.length],
    lat: place.lat,
    lon: place.lon,
  }))
}
```

### lib/types.ts changes

Re-export Geoapify types for convenience:
```typescript
// Re-export from geoapify/types for backward compat
export type { GeoapifyPlace, GeocodingResult, AutocompleteSuggestion, SearchPlacesParams } from './geoapify/types'
```

**Test:** `npm run build` — no TypeScript errors.

---

## Task 10 — Update app/api/ai/itinerary/route.ts

**Files:** `app/api/ai/itinerary/route.ts`

Replace static attraction injection block. Add imports at top:

```typescript
import { getOrFetchPlaces } from '@/lib/geoapify/places-cache'
import { mergePlacesIntoAttractions } from '@/lib/attractions'
```

Replace the block around line 189:
```typescript
// OLD:
itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)

// NEW:
const realPlaces = await getOrFetchPlaces(destination)
if (realPlaces.length > 0) {
  itinerary.attractions = mergePlacesIntoAttractions(realPlaces)
} else {
  itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)
}
```

**Test:** `POST /api/ai/itinerary` with `{ destination: "Yogyakarta", duration: 3, travelers: 2, budget: "medium", preferences: [] }`. Response `attractions[0]` should have `lat` and `lon`.

---

## Task 11 — Build verification

```bash
npm run build
```

Expected: zero TypeScript errors, zero missing module errors.

---

## Self-review checklist

- [ ] `GEOAPIFY_API_KEY` is only read via `process.env.GEOAPIFY_API_KEY` in server files
- [ ] No Geoapify API key in any client component or client-side code
- [ ] `searchPlaces()` validates lat/lon inputs
- [ ] All fetch calls use `cache: 'no-store'`
- [ ] `places_cache` migration applied before testing
- [ ] Category mapper handles unknown input gracefully (returns `'tourism'`)
- [ ] Routing stub returns `null` — does not throw
- [ ] Fallback chain intact in itinerary route
- [ ] `/api/geo/places` returns user-friendly message when no places found
- [ ] Build passes
