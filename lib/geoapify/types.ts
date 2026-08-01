// All Geoapify-related types. Import from here for Geoapify specifics.

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
  geometry: unknown | null  // GeoJSON LineString
}
