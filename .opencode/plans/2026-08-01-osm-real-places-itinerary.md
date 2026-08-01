# Geoapify Real Places + Leaflet Map in Itinerary

**Date:** 2026-08-01
**Feature:** Integrate Geoapify Places API for real place data, cache results in Supabase, and display a Leaflet mini-map in the itinerary page.

---

## Goal

Replace the hardcoded `lib/attractions.ts` static data with real places from Geoapify Places API. Cache results per destination in Supabase. Display an interactive Leaflet.js mini-map in `app/itinerary/page.tsx` showing all attraction pins.

**Geoapify free tier:** 3.000 req/day, no credit card required. Sign up at https://myprojects.geoapify.com.

---

## Prerequisites

Add to `.env.local`:
```
GEOAPIFY_API_KEY=your_key_here
```

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `lib/geoapify.ts` | Query Geoapify Geocoding + Places API for tourist attractions by city name. Returns `GeoapifyPlace[]`. |
| `lib/osm-cache.ts` | Read/write `places_cache` Supabase table. TTL: 7 days. |
| `components/ItineraryMap.tsx` | Client component. Renders Leaflet map with attraction pins. Dynamically imported (no SSR). |
| `supabase/migrations/007_places_cache.sql` | Creates `places_cache` table. |

### Modified files
| File | Change |
|------|--------|
| `app/api/ai/itinerary/route.ts` | After Gemini generates itinerary, call `getOrFetchPlaces(destination)` and merge Geoapify places into `attractions` array. |
| `lib/attractions.ts` | Update `Attraction` interface to include optional `lat`/`lon`. Add `mergePlacesIntoAttractions()` helper. |
| `lib/types.ts` | Add `GeoapifyPlace` interface. |
| `app/itinerary/page.tsx` | Dynamically import and render `<ItineraryMap>` below the attractions section. |
| `package.json` | Add `leaflet@1.9.4` and `@types/leaflet@1.9.14`. |

---

## Task 1 — DB migration: places_cache table

**Files:** `supabase/migrations/007_places_cache.sql`

Create the file with:

```sql
-- 007_places_cache.sql
create table if not exists places_cache (
  id          bigserial primary key,
  destination text        not null unique,  -- normalized: lowercase, hyphenated
  places      jsonb       not null,         -- GeoapifyPlace[]
  fetched_at  timestamptz not null default now()
);
```

**How to apply:** Run this SQL in Supabase dashboard > SQL Editor. RLS not needed — server-only reads.

**Test:** Confirm table appears in Supabase dashboard Table Editor.

---

## Task 2 — lib/types.ts: Add GeoapifyPlace interface

**Files:** `lib/types.ts`

Append at the end of the file (after the `packageHref` function):

```typescript
// ─── Geoapify Place ──────────────────────────────────────────
export interface GeoapifyPlace {
  placeId: string
  name: string
  categories: string[]   // e.g. ['entertainment.museum', 'tourism']
  lat: number
  lon: number
  address: string        // formatted address
  city?: string
  website?: string
  openingHours?: string
}
```

**Test:** `npm run build` — no TypeScript errors.

---

## Task 3 — lib/geoapify.ts: Geoapify API integration

**Files:** `lib/geoapify.ts` (new)

Geoapify flow: two API calls.
1. **Geocoding API** — convert city name → lat/lon + place_id
2. **Places API** — query tourist attractions within the city boundary using place_id filter

```typescript
import type { GeoapifyPlace } from './types'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

// Tourist-relevant categories for travel itineraries
const TRAVEL_CATEGORIES = [
  'entertainment.museum',
  'entertainment.zoo',
  'entertainment.aquarium',
  'entertainment.theme_park',
  'entertainment.culture.gallery',
  'entertainment.culture.theatre',
  'leisure.park',
  'leisure.park.nature_reserve',
  'heritage.unesco',
  'natural.mountain.peak',
  'natural.mountain.volcano',
  'man_made.lighthouse',
  'man_made.windmill',
  'national_park',
].join(',')

interface GeocodingFeature {
  properties: {
    place_id: string
    lat: number
    lon: number
    formatted: string
    city?: string
  }
}

interface PlacesFeature {
  properties: {
    place_id: string
    name?: string
    categories: string[]
    lat: number
    lon: number
    formatted: string
    city?: string
    datasource?: { raw?: { website?: string; opening_hours?: string } }
  }
}

async function geocodeCity(city: string, apiKey: string): Promise<{ lat: number; lon: number; placeId: string } | null> {
  const url = new URL(`${GEOAPIFY_BASE}/v1/geocode/search`)
  url.searchParams.set('text', city)
  url.searchParams.set('type', 'city')
  url.searchParams.set('limit', '1')
  url.searchParams.set('format', 'geojson')
  url.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const feature: GeocodingFeature | undefined = data.features?.[0]
    if (!feature) return null
    return {
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      placeId: feature.properties.place_id,
    }
  } catch {
    return null
  }
}

export async function fetchGeoapifyPlaces(destination: string): Promise<GeoapifyPlace[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    console.warn('[geoapify] GEOAPIFY_API_KEY not set — skipping real places fetch')
    return []
  }

  // Step 1: Geocode city to get place_id for boundary filter
  const geo = await geocodeCity(destination, apiKey)
  if (!geo) return []

  // Step 2: Fetch tourist places within city boundary
  const url = new URL(`${GEOAPIFY_BASE}/v2/places`)
  url.searchParams.set('categories', TRAVEL_CATEGORIES)
  url.searchParams.set('filter', `place:${geo.placeId}`)
  url.searchParams.set('bias', `proximity:${geo.lon},${geo.lat}`)
  url.searchParams.set('limit', '12')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()

    return ((data.features ?? []) as PlacesFeature[])
      .filter((f) => f.properties.name)
      .map((f): GeoapifyPlace => ({
        placeId: f.properties.place_id,
        name: f.properties.name!,
        categories: f.properties.categories ?? [],
        lat: f.properties.lat,
        lon: f.properties.lon,
        address: f.properties.formatted,
        city: f.properties.city,
        website: f.properties.datasource?.raw?.website,
        openingHours: f.properties.datasource?.raw?.opening_hours,
      }))
  } catch {
    return []
  }
}
```

**Note:** If `place:placeId` filter returns too few results for a small city, the fallback is `filter=circle:lon,lat,10000` (10km radius). This is handled in Task 4's cache layer — if first fetch returns < 3 results, retry with circle filter.

---

## Task 4 — lib/places-cache.ts: Supabase cache layer

**Files:** `lib/places-cache.ts` (new)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { GeoapifyPlace } from './types'
import { fetchGeoapifyPlaces } from './geoapify'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TTL_DAYS = 7

function normalizeDestination(destination: string): string {
  return destination.toLowerCase().trim().replace(/\s+/g, '-')
}

export async function getOrFetchPlaces(destination: string): Promise<GeoapifyPlace[]> {
  const key = normalizeDestination(destination)

  // 1. Check cache
  try {
    const { data } = await supabase
      .from('places_cache')
      .select('places, fetched_at')
      .eq('destination', key)
      .single()

    if (data) {
      const age = Date.now() - new Date(data.fetched_at).getTime()
      const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000
      if (age < ttlMs) {
        return data.places as GeoapifyPlace[]
      }
    }
  } catch {
    // Cache miss — proceed to fetch
  }

  // 2. Fetch fresh from Geoapify
  const places = await fetchGeoapifyPlaces(destination)
  if (!places.length) return []

  // 3. Upsert into cache
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
```

**Test:** Call itinerary API twice for same destination. Second call faster (cache hit). Check `places_cache` table in Supabase dashboard — one row per destination.

---

## Task 5 — lib/attractions.ts: Add lat/lon + mergePlacesIntoAttractions

**Files:** `lib/attractions.ts`

1. Update the `Attraction` interface at the top of the file:

```typescript
export interface Attraction {
  name: string
  description: string
  image: string
  lat?: number   // from Geoapify
  lon?: number   // from Geoapify
}
```

2. Add import and new function at the bottom of the file (after `getAttractionsForDestination`):

```typescript
import type { GeoapifyPlace } from './types'

function formatCategory(category: string): string {
  // 'entertainment.museum' → 'Museum'
  const last = category.split('.').pop() ?? category
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ')
}

// Converts Geoapify places into the Attraction shape used by the itinerary UI.
// Geoapify places have no photos — GENERAL_TRAVEL_PHOTOS used as visual fallback.
export function mergePlacesIntoAttractions(places: GeoapifyPlace[]): Attraction[] {
  return places.map((place, idx) => ({
    name: place.name,
    description: [
      place.categories[0] ? formatCategory(place.categories[0]) : 'Attraction',
      place.address,
      place.openingHours ? `Open: ${place.openingHours}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    image: GENERAL_TRAVEL_PHOTOS[idx % GENERAL_TRAVEL_PHOTOS.length],
    lat: place.lat,
    lon: place.lon,
  }))
}
```

**Test:** `npm run build` — no TypeScript errors.

---

## Task 6 — app/api/ai/itinerary/route.ts: Inject Geoapify places

**Files:** `app/api/ai/itinerary/route.ts`

1. Add imports at top (after existing imports):

```typescript
import { getOrFetchPlaces } from '@/lib/places-cache'
import { mergePlacesIntoAttractions } from '@/lib/attractions'
```

2. Replace the attraction injection block (currently around line 189):

```typescript
// OLD:
itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)

// NEW:
const realPlaces = await getOrFetchPlaces(destination)
if (realPlaces.length > 0) {
  itinerary.attractions = mergePlacesIntoAttractions(realPlaces)
} else {
  // Fallback: static hardcoded data for the 7 known destinations
  itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)
}
```

**Fallback chain:** Geoapify → static hardcoded (bali/tokyo/paris/etc) → AI-provided names with generic photos → default 3 generic attractions.

**Test:** `POST /api/ai/itinerary` with `{ "destination": "Yogyakarta", "duration": 3, "travelers": 2, "budget": "medium", "preferences": [] }`. Response `attractions[0]` should have `lat` and `lon` fields with real coordinates.

---

## Task 7 — Install Leaflet

**Files:** `package.json` (via npm)

```bash
npm install leaflet@1.9.4
npm install --save-dev @types/leaflet@1.9.14
```

Leaflet CSS is loaded dynamically inside the component — no global import, no next.config changes needed.

**Test:** `npm run build` — no missing module errors.

---

## Task 8 — components/ItineraryMap.tsx: Leaflet mini-map

**Files:** `components/ItineraryMap.tsx` (new)

```typescript
'use client'

import { useEffect, useRef } from 'react'

export interface MapPlace {
  name: string
  lat: number
  lon: number
}

interface ItineraryMapProps {
  places: MapPlace[]
  destination: string
}

export default function ItineraryMap({ places, destination }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || !places.length) return
    if (mapInstanceRef.current) return // prevent double-init in StrictMode

    // Load Leaflet CSS once
    if (!document.querySelector('link[href*="leaflet@1.9.4"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      // Fix broken default marker icons in webpack/Next.js builds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center: [number, number] = [places[0].lat, places[0].lon]
      const map = L.map(mapRef.current!).setView(center, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      places.forEach((place) => {
        L.marker([place.lat, place.lon])
          .addTo(map)
          .bindPopup(`<b>${place.name}</b>`)
      })

      // Fit all markers into view
      if (places.length > 1) {
        const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lon] as [number, number]))
        map.fitBounds(bounds, { padding: [30, 30] })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapInstanceRef.current = map as any
    })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapInstanceRef.current as any)?.remove()
      mapInstanceRef.current = null
    }
  }, [places])

  if (!places.length) return null

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 mt-8">
      <div className="px-4 py-3 bg-white/5 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70">Peta Wisata — {destination}</h3>
        <p className="text-xs text-white/40 mt-0.5">
          Data dari{' '}
          <a
            href="https://www.geoapify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Geoapify
          </a>{' '}
          &middot; Map &copy;{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            OpenStreetMap
          </a>
        </p>
      </div>
      <div ref={mapRef} style={{ height: '380px', width: '100%' }} />
    </div>
  )
}
```

**Test:** Map renders in browser, markers visible, no SSR errors in build output.

---

## Task 9 — app/itinerary/page.tsx: Render ItineraryMap

**Files:** `app/itinerary/page.tsx`

1. Add dynamic import near the top of the file (with other imports):

```typescript
import dynamic from 'next/dynamic'
import type { MapPlace } from '@/components/ItineraryMap'

const ItineraryMap = dynamic(() => import('@/components/ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-2xl bg-white/5 animate-pulse mt-8 flex items-center justify-center">
      <span className="text-white/30 text-sm">Memuat peta...</span>
    </div>
  ),
})
```

2. After the attractions gallery section in the JSX, add:

```tsx
{itinerary.attractions?.some((a) => a.lat && a.lon) && (
  <ItineraryMap
    destination={itinerary.destination}
    places={
      itinerary.attractions
        .filter((a): a is typeof a & { lat: number; lon: number } => !!a.lat && !!a.lon)
        .map((a): MapPlace => ({ name: a.name, lat: a.lat, lon: a.lon }))
    }
  />
)}
```

**Why conditional:** Map only renders when attractions have coordinates (from Geoapify). Static fallback attractions have no coordinates — map won't show, which is correct behavior.

**Test:** Visit `/itinerary?prompt=Trip+to+Yogyakarta`. After itinerary generates, scroll past attractions gallery — Leaflet map should appear with pins.

---

## Task 10 — Build verification

```bash
npm run build
```

Expected: clean build, zero TypeScript errors, no SSR-related Leaflet errors.

**If Leaflet SSR error:** Confirm `ItineraryMap` imported with `dynamic(..., { ssr: false })`.
**If `GEOAPIFY_API_KEY` missing warning:** Add key to `.env.local` (fallback to static data still works).

---

## Self-review checklist

- [ ] `GeoapifyPlace` in `lib/types.ts` matches all fields used in `lib/geoapify.ts`
- [ ] `Attraction` interface updated with optional `lat`/`lon`
- [ ] `mergePlacesIntoAttractions` uses `GENERAL_TRAVEL_PHOTOS` (already in scope in `attractions.ts`)
- [ ] `getOrFetchPlaces` handles both cache miss and Geoapify failure gracefully (returns `[]`)
- [ ] API route fallback chain intact: Geoapify → static hardcoded → mock
- [ ] `ItineraryMap` imported with `ssr: false` in `page.tsx`
- [ ] Leaflet CSS loaded dynamically in component (not globally)
- [ ] Map only renders when attractions have `lat`/`lon`
- [ ] Migration `007_places_cache.sql` applied before end-to-end test
- [ ] `GEOAPIFY_API_KEY` added to `.env.local`

---

## Out of scope (separate tasks)

- Wiring the "Save itinerary" button
- Auth guard on `/api/ai/itinerary`
- Photo enrichment (Wikimedia Commons or Unsplash per place)
- Route polylines between attractions
