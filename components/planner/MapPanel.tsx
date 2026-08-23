'use client'

import { useEffect, useRef, useState } from 'react'

export interface MapMarker {
  lat: number
  lon: number
  name: string
  type: 'reference' | 'place'
  popup?: string
  day?: number
  time?: string
  cost?: string
}

interface Props {
  markers: MapMarker[]
  center?: { lat: number; lon: number }
  activeDay?: number
  selectedMarkerName?: string
  onMarkerClick?: (marker: MapMarker) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderMarkers(
  maplibre: any,
  map: any,
  marks: MapMarker[],
  markersRefArray: any[],
  onMarkerClick?: (marker: MapMarker) => void
) {
  marks.forEach((marker, index) => {
    const el = document.createElement('div')
    const isRef = marker.type === 'reference'
    
    el.className = isRef
      ? 'w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 z-20'
      : 'w-7 h-7 bg-rose-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 z-20'
    
    el.innerHTML = isRef 
      ? '<span style="color:white;font-size:11px;font-weight:800;">📍</span>'
      : `<span style="color:white;font-size:11px;font-weight:800;font-family:sans-serif;">${index + 1}</span>`

    const popupHtml = `
      <div style="font-family:sans-serif;padding:6px 4px;min-width:180px;">
        <div style="display:flex;align-items:center;justify-content:between;gap:8px;margin-bottom:4px;">
          <span style="font-size:10px;font-weight:700;background:#f3f4f6;color:#374151;padding:2px 6px;border-radius:4px;">
            ${marker.time || `Spot #${index + 1}`}
          </span>
          ${marker.cost ? `<span style="font-size:10px;font-weight:700;color:#059669;">${marker.cost}</span>` : ''}
        </div>
        <div style="font-weight:800;font-size:13px;color:#111827;line-height:1.35;margin-bottom:4px;">${marker.name}</div>
        ${marker.popup ? `<div style="font-size:11px;color:#4b5563;line-height:1.4;">${marker.popup}</div>` : ''}
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.name)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#2563eb;margin-top:6px;text-decoration:none;">
          Buka di Google Maps ↗
        </a>
      </div>
    `

    const popup = new maplibre.Popup({ offset: 22, closeButton: true }).setHTML(popupHtml)

    const m = new maplibre.Marker({ element: el })
      .setLngLat([marker.lon, marker.lat])
      .setPopup(popup)
      .addTo(map)

    el.addEventListener('click', () => {
      onMarkerClick?.(marker)
      map.flyTo({ center: [marker.lon, marker.lat], zoom: 14.5, duration: 800 })
    })

    markersRefArray.push(m)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateRouteLine(map: any, marks: MapMarker[]) {
  if (!map || !map.isStyleLoaded()) return

  const coordinates = marks.map((m) => [m.lon, m.lat])
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  }

  if (map.getSource('route-path')) {
    map.getSource('route-path').setData(geojson)
  } else if (coordinates.length >= 2) {
    map.addSource('route-path', {
      type: 'geojson',
      data: geojson,
    })

    // Glow background line
    map.addLayer({
      id: 'route-glow',
      type: 'line',
      source: 'route-path',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 6,
        'line-opacity': 0.3,
      },
    })

    // Main dashed route line
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-path',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#2563eb',
        'line-width': 3.5,
        'line-dasharray': [2, 1.5],
      },
    })
  }
}

export default function MapPanel({ markers, center, onMarkerClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([])
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all')

  // Collect available days
  const availableDays = Array.from(new Set(markers.map((m) => m.day).filter(Boolean))) as number[]
  const displayedMarkers = selectedDayFilter === 'all'
    ? markers
    : markers.filter((m) => m.day === selectedDayFilter)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) return

    // Load MapLibre CSS dynamically
    if (!document.querySelector('link[href*="maplibre-gl"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
      document.head.appendChild(link)
    }

    import('maplibre-gl').then((maplibre) => {
      const firstValidMarker = markers.find((m) => m.lat && m.lon)
      const initialCenter: [number, number] = firstValidMarker
        ? [firstValidMarker.lon, firstValidMarker.lat]
        : (center ? [center.lon, center.lat] : [110.2215, -7.4725])

      const map = new maplibre.Map({
        container: mapRef.current!,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: initialCenter,
        zoom: 12,
      })

      mapInstanceRef.current = map

      map.on('load', () => {
        renderMarkers(maplibre, map, displayedMarkers, markersRef.current, onMarkerClick)
        updateRouteLine(map, displayedMarkers)

        if (displayedMarkers.length > 1) {
          const lons = displayedMarkers.map((m) => m.lon)
          const lats = displayedMarkers.map((m) => m.lat)
          map.fitBounds(
            [
              [Math.min(...lons), Math.min(...lats)],
              [Math.max(...lons), Math.max(...lats)],
            ],
            { padding: 50, maxZoom: 14, duration: 1000 }
          )
        }
      })
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers & route line when markers or day filter changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const update = () => {
      import('maplibre-gl').then((maplibre) => {
        markersRef.current.forEach((m) => m.remove())
        markersRef.current = []
        renderMarkers(maplibre, map, displayedMarkers, markersRef.current, onMarkerClick)
        updateRouteLine(map, displayedMarkers)

        if (displayedMarkers.length > 1) {
          const lons = displayedMarkers.map((m) => m.lon)
          const lats = displayedMarkers.map((m) => m.lat)
          map.fitBounds(
            [
              [Math.min(...lons), Math.min(...lats)],
              [Math.max(...lons), Math.max(...lats)],
            ],
            { padding: 50, maxZoom: 14, duration: 800 }
          )
        } else if (displayedMarkers.length === 1) {
          map.flyTo({ center: [displayedMarkers[0].lon, displayedMarkers[0].lat], zoom: 14, duration: 800 })
        }
      })
    }

    if (map.loaded()) {
      update()
    } else {
      map.on('load', update)
    }
  }, [markers, selectedDayFilter])

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn({ duration: 300 })
  }

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut({ duration: 300 })
  }

  const handleResetView = () => {
    if (!mapInstanceRef.current) return
    if (displayedMarkers.length > 1) {
      const lons = displayedMarkers.map((m) => m.lon)
      const lats = displayedMarkers.map((m) => m.lat)
      mapInstanceRef.current.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: 50, maxZoom: 14, duration: 800 }
      )
    } else if (displayedMarkers.length === 1) {
      mapInstanceRef.current.flyTo({ center: [displayedMarkers[0].lon, displayedMarkers[0].lat], zoom: 14, duration: 800 })
    }
  }

  return (
    <div className="relative w-full h-full min-h-[360px] lg:min-h-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Day Selector Pill on Top-Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
        <button
          onClick={() => setSelectedDayFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-jakarta font-bold transition-all cursor-pointer ${
            selectedDayFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
        >
          Semua ({markers.length})
        </button>
        {availableDays.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDayFilter(d)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-jakarta font-bold transition-all cursor-pointer ${
              selectedDayFilter === d
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
          >
            H-{d}
          </button>
        ))}
      </div>

      {/* Map Floating Zoom & Center Controls on Top-Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 shadow-lg bg-neutral-900/90 backdrop-blur-md rounded-xl p-1 border border-white/10">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg text-base font-bold transition-all cursor-pointer"
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg text-base font-bold transition-all cursor-pointer"
          title="Zoom out"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleResetView}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg text-xs font-bold transition-all border-t border-white/10 cursor-pointer"
          title="Reset View"
          aria-label="Reset View"
        >
          ⌖
        </button>
      </div>

      {/* Footer Attribution */}
      <div className="absolute bottom-2 right-2 text-[10px] text-neutral-600 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded pointer-events-none font-medium">
        © OpenFreeMap · Route Visualizer
      </div>
    </div>
  )
}

