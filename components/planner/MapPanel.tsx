'use client'

import { useEffect, useRef } from 'react'

export interface MapMarker {
  lat: number
  lon: number
  name: string
  type: 'reference' | 'place'
  popup?: string
}

interface Props {
  markers: MapMarker[]
  center?: { lat: number; lon: number }
}

export default function MapPanel({ markers, center }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([])

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
      const map = new maplibre.Map({
        container: mapRef.current!,
        // OpenFreeMap — free, no key needed
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: center ? [center.lon, center.lat] : [106.8456, -6.2088],
        zoom: 13,
      })

      mapInstanceRef.current = map

      map.on('load', () => {
        addMarkers(maplibre, map, markers)
      })
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when they change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const update = () => {
      import('maplibre-gl').then((maplibre) => {
        markersRef.current.forEach((m) => m.remove())
        markersRef.current = []
        addMarkers(maplibre, map, markers)

        if (markers.length > 1) {
          const lons = markers.map((m) => m.lon)
          const lats = markers.map((m) => m.lat)
          map.fitBounds(
            [
              [Math.min(...lons), Math.min(...lats)],
              [Math.max(...lons), Math.max(...lats)],
            ],
            { padding: 50, maxZoom: 15 }
          )
        } else if (markers.length === 1) {
          map.flyTo({ center: [markers[0].lon, markers[0].lat], zoom: 15 })
        }
      })
    }

    if (map.loaded()) {
      update()
    } else {
      map.on('load', update)
    }
  }, [markers])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addMarkers(maplibre: any, map: any, marks: MapMarker[]) {
    marks.forEach((marker) => {
      const el = document.createElement('div')
      el.className =
        marker.type === 'reference'
          ? 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer'
          : 'w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-md cursor-pointer'

      const popup = new maplibre.Popup({ offset: 25 }).setHTML(
        `<div class="text-sm font-medium">${marker.name}</div>${
          marker.popup
            ? `<div class="text-xs text-gray-500 mt-1">${marker.popup}</div>`
            : ''
        }`
      )

      const m = new maplibre.Marker({ element: el })
        .setLngLat([marker.lon, marker.lat])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(m)
    })
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 text-xs text-black/40 bg-white/80 px-2 py-0.5 rounded pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  )
}
