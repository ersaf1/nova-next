'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ChatPanel from '@/components/planner/ChatPanel'
import LocationSearch from '@/components/planner/LocationSearch'
import type { PlacesResult } from '@/lib/ai-agent/types'
import type { AutocompleteSuggestion } from '@/lib/geoapify/types'
import type { MapMarker } from '@/components/planner/MapPanel'

const MapPanel = dynamic(() => import('@/components/planner/MapPanel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center">
      <span className="text-white/30 text-sm">Memuat peta...</span>
    </div>
  ),
})

export default function AiPlannerClient() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | undefined>()

  function handlePlacesFound(result: PlacesResult) {
    const newMarkers: MapMarker[] = [
      {
        lat: result.center.lat,
        lon: result.center.lon,
        name: result.location,
        type: 'reference',
      },
      ...result.places.map(
        (p): MapMarker => ({
          lat: p.lat,
          lon: p.lon,
          name: p.name,
          type: 'place',
          popup: [
            p.address,
            p.distance != null ? `${(p.distance / 1000).toFixed(1)} km` : null,
          ]
            .filter(Boolean)
            .join(' · '),
        })
      ),
    ]
    setMarkers(newMarkers)
    setMapCenter(result.center)
  }

  function handleLocationSelect(suggestion: AutocompleteSuggestion) {
    if (suggestion.lat && suggestion.lon) {
      setMapCenter({ lat: suggestion.lat, lon: suggestion.lon })
      setMarkers([
        {
          lat: suggestion.lat,
          lon: suggestion.lon,
          name: suggestion.formatted,
          type: 'reference',
        },
      ])
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left: Chat panel */}
      <div className="w-[420px] shrink-0 bg-white/5 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-semibold text-white/80 mb-2">Nova AI Travel Planner</h2>
          <LocationSearch
            onSelect={handleLocationSelect}
            placeholder="Cari lokasi referensi..."
          />
        </div>
        <ChatPanel onPlacesFound={handlePlacesFound} />
      </div>

      {/* Right: Map */}
      <div className="flex-1 min-w-0">
        <MapPanel markers={markers} center={mapCenter} />
      </div>
    </div>
  )
}
