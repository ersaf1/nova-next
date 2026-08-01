import type { RouteResult } from './types'

// Phase 7 scaffold — stub only, does NOT call the Routing API yet.
// Structure is ready for full implementation.
export async function getRoute(
  _origin: { lat: number; lon: number },
  _destination: { lat: number; lon: number },
  _apiKey: string,
  _mode: 'drive' | 'walk' | 'bicycle' = 'drive'
): Promise<RouteResult | null> {
  // Phase 7: implement Geoapify Routing API here
  // GET https://api.geoapify.com/v1/routing?waypoints=lat,lon|lat,lon&mode=drive&apiKey=...
  console.warn('[routing] Phase 7 not yet implemented')
  return null
}
