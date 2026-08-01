'use client'

import type { PlacesResult } from '@/lib/ai-agent/types'
import { MapPin, Clock, Globe } from 'lucide-react'

interface Props {
  result: PlacesResult
}

export default function PlacesCard({ result }: Props) {
  if (!result.places.length) {
    return (
      <div className="mt-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/50">
        Tidak ada tempat ditemukan dalam radius yang ditentukan.
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/10 text-xs text-white/50">
        {result.places.length} tempat ditemukan dekat {result.location}
      </div>
      <div className="divide-y divide-white/5">
        {result.places.map((place) => (
          <div key={place.placeId} className="px-4 py-3">
            <div className="font-medium text-sm text-white">{place.name}</div>
            <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {place.address}
              </span>
              {place.distance != null && (
                <span className="text-white/30">
                  · {(place.distance / 1000).toFixed(1)} km
                </span>
              )}
            </div>
            {place.openingHours && (
              <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                {place.openingHours}
              </div>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400/70 mt-0.5 flex items-center gap-1 hover:text-blue-400 transition-colors"
              >
                <Globe size={10} />
                {place.website}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
