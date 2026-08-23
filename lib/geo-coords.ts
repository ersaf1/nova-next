/**
 * Precise Geographical Coordinate Resolver
 */

export interface Coordinates {
  lat: number
  lon: number
}

const CANONICAL_COORDINATES: Record<string, Coordinates> = {
  // Jawa Tengah & DIY
  'kebon polo': { lat: -7.4725, lon: 110.2215 },
  'kebonpolo': { lat: -7.4725, lon: 110.2215 },
  'magelang': { lat: -7.4797, lon: 110.2178 },
  'borobudur': { lat: -7.6079, lon: 110.2038 },
  'tidar': { lat: -7.4952, lon: 110.2201 },
  'salatiga': { lat: -7.3305, lon: 110.5084 },
  'kopeng': { lat: -7.3947, lon: 110.4284 },
  'dieng': { lat: -7.2045, lon: 109.9056 },
  'wonosobo': { lat: -7.3639, lon: 109.9004 },
  'tawangmangu': { lat: -7.6625, lon: 111.1345 },
  'karimunjawa': { lat: -5.8778, lon: 110.4356 },
  'gunungkidul': { lat: -7.9622, lon: 110.6033 },
  'yogyakarta': { lat: -7.7956, lon: 110.3695 },
  'jogja': { lat: -7.7956, lon: 110.3695 },
  'solo': { lat: -7.5755, lon: 110.8243 },
  'surakarta': { lat: -7.5755, lon: 110.8243 },
  'semarang': { lat: -6.9667, lon: 110.4167 },

  // Jawa Barat & Banten
  'pangandaran': { lat: -7.7011, lon: 108.4952 },
  'green canyon': { lat: -7.7322, lon: 108.4552 },
  'garut': { lat: -7.2278, lon: 107.9086 },
  'kuningan': { lat: -6.9765, lon: 108.4839 },
  'sukabumi': { lat: -6.9277, lon: 106.9300 },
  'ciletuh': { lat: -7.1812, lon: 106.5052 },
  'bandung': { lat: -6.9175, lon: 107.6191 },
  'lembang': { lat: -6.8168, lon: 107.6174 },
  'bogor': { lat: -6.5971, lon: 106.8060 },
  'jakarta': { lat: -6.2088, lon: 106.8456 },

  // Jawa Timur
  'batu': { lat: -7.8712, lon: 112.5271 },
  'malang': { lat: -7.9797, lon: 112.6304 },
  'banyuwangi': { lat: -8.2192, lon: 114.3691 },
  'ijen': { lat: -8.0583, lon: 114.2425 },
  'lumajang': { lat: -8.1333, lon: 113.2167 },
  'tumpak sewu': { lat: -8.2319, lon: 112.9181 },
  'pacitan': { lat: -8.2067, lon: 111.0922 },
  'surabaya': { lat: -7.2575, lon: 112.7521 },
  'bromo': { lat: -7.9425, lon: 112.9530 },

  // Bali & Nusa Tenggara
  'bali': { lat: -8.4095, lon: 115.1889 },
  'ubud': { lat: -8.5069, lon: 115.2625 },
  'kintamani': { lat: -8.2435, lon: 115.3371 },
  'nusa penida': { lat: -8.7278, lon: 115.5444 },
  'seminyak': { lat: -8.6897, lon: 115.1686 },
  'canggu': { lat: -8.6478, lon: 115.1385 },
  'uluwatu': { lat: -8.8291, lon: 115.0849 },
  'sanur': { lat: -8.6883, lon: 115.2636 },
  'labuan bajo': { lat: -8.4964, lon: 119.8877 },
  'komodo': { lat: -8.5833, lon: 119.4833 },
  'lombok': { lat: -8.5833, lon: 116.3167 },
  'gili': { lat: -8.3500, lon: 116.0333 },

  // Sumatera & Lainnya
  'bukittinggi': { lat: -0.3056, lon: 100.3692 },
  'padang': { lat: -0.9471, lon: 100.4172 },
  'medan': { lat: 3.5952, lon: 98.6722 },
  'berastagi': { lat: 3.1833, lon: 98.5000 },
  'toba': { lat: 2.6845, lon: 98.8756 },
  'toraja': { lat: -2.9833, lon: 119.8833 },
  'makassar': { lat: -5.1477, lon: 119.4327 },
  'manado': { lat: 1.4748, lon: 124.8421 },
  'raja ampat': { lat: -0.2333, lon: 130.5167 },

  // International
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'kyoto': { lat: 35.0116, lon: 135.7681 },
  'osaka': { lat: 34.6937, lon: 135.5023 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'rome': { lat: 41.9028, lon: 12.4964 },
  'santorini': { lat: 36.3932, lon: 25.4615 },
  'singapore': { lat: 1.3521, lon: 103.8198 },
  'bangkok': { lat: 13.7563, lon: 100.5018 },
  'seoul': { lat: 37.5665, lon: 126.9780 },
  'swiss': { lat: 46.8182, lon: 8.2275 },
  'interlaken': { lat: 46.6863, lon: 7.8632 },
  'zermatt': { lat: 45.9765, lon: 7.7491 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  'sydney': { lat: -33.8688, lon: 151.2093 },
}

export function resolveCoordinates(name: string): Coordinates {
  const norm = name.toLowerCase().trim()
  
  for (const [key, coords] of Object.entries(CANONICAL_COORDINATES)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return coords
    }
  }

  const words = norm.split(/[\s,/-]+/).filter(Boolean)
  for (const word of words) {
    if (word.length >= 4) {
      for (const [key, coords] of Object.entries(CANONICAL_COORDINATES)) {
        if (key.includes(word) || word.includes(key)) {
          return coords
        }
      }
    }
  }

  // Default to Indonesia center / Bali if unknown
  return { lat: -8.4095, lon: 115.1889 }
}

/**
 * Generate a realistic nearby offset coordinate for activity pins around center
 */
export function getOffsetCoordinates(center: Coordinates, index: number, total: number = 4): Coordinates {
  const angle = (index / total) * Math.PI * 2 + (index * 0.5)
  const radiusKm = 0.8 + (index % 3) * 1.2
  // 1 deg latitude is approx 111km
  const latOffset = (radiusKm / 111) * Math.cos(angle)
  const lonOffset = (radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle)

  return {
    lat: Number((center.lat + latOffset).toFixed(6)),
    lon: Number((center.lon + lonOffset).toFixed(6)),
  }
}