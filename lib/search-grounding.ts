import { fetchPlacesForCity } from './geoapify/places'
import { fetchRealPlacePhoto } from './real-photos'
import type { GeoapifyPlace } from './geoapify/types'

export interface GroundedSpot {
  name: string
  category: 'sightseeing' | 'culinary' | 'nature' | 'culture'
  address: string
  lat?: number
  lon?: number
  image?: string | null
}

export interface GroundingResult {
  destinationName: string
  parentRegion: string
  spots: GroundedSpot[]
  culinary: { breakfast: string; lunch: string; dinner: string }
  accommodation: string
  bestSeason: string
  tips: string[]
}

const INDONESIAN_REGIONAL_DATABASE: Record<
  string,
  {
    canonicalName: string
    parentRegion: string
    spots: string[]
    culinary: { breakfast: string; lunch: string; dinner: string }
    accommodation: string
    bestSeason: string
    tips: string[]
  }
> = {
  // ─── JAWA TENGAH: PURWOREJO & JENAR ───
  jenar: {
    canonicalName: 'Jenar, Purwodadi & Purworejo, Jawa Tengah',
    parentRegion: 'Kabupaten Purworejo',
    spots: [
      'Alun-Alun Purworejo & Bedug Pendowo (Bedug Terbesar di Dunia)',
      'Pantai Jatimalang (Pantai Dewaruci)',
      'Taman Wisata Goa Seplawan',
      'Curug Muncar Bruno',
      'Museum Tosan Aji Purworejo',
      'Sentra Batik Tulis Purworejo',
    ],
    culinary: {
      breakfast: 'Soto Pak Rus Purworejo & Tempe Kemul',
      lunch: 'Kuliner Legendaris Dawet Hitam Jembatan Butuh Khas Purworejo',
      dinner: 'Sate Kambing Muda Winong Khas Purworejo',
    },
    accommodation: 'Hotel Sanjaya Inn / Grand Ganesha Hotel Purworejo',
    bestSeason: 'Sepanjang Tahun (Pagi & Sore Hari)',
    tips: [
      'Cicipi Dawet Hitam asli di daerah Butuh yang menggunakan pewarna alami oman/merang ketan hitam.',
      'Kunjungi Alun-Alun Purworejo untuk melihat Bedug Pendowo raksasa peninggalan tahun 1834.',
      'Pantai Jatimalang sangat cocok untuk menikmati sunset dan kolam renang air tawar pinggir pantai.',
    ],
  },
  purworejo: {
    canonicalName: 'Kabupaten Purworejo, Jawa Tengah',
    parentRegion: 'Kabupaten Purworejo',
    spots: [
      'Alun-Alun Purworejo & Bedug Pendowo',
      'Pantai Dewaruci Jatimalang',
      'Goa Seplawan Kaligesing',
      'Curug Silangit Somongari',
      'Museum Tosan Aji',
      'Hutan Pinus Kusumo Asri',
    ],
    culinary: {
      breakfast: 'Nasi Bogana Purworejo & Teh Hangat',
      lunch: 'Dawet Hitam Asli Butuh & Geblek Gurih',
      dinner: 'Sate Winong Pak Mustofa Purworejo',
    },
    accommodation: 'Hotel Sanjaya Inn Purworejo',
    bestSeason: 'Mei - Oktober',
    tips: ['Bawa oleh-oleh khas Geblek dan Clorot gula merah khas Purworejo.'],
  },

  // ─── JAWA TENGAH: MAGELANG & KEBON POLO ───
  'kebon polo': {
    canonicalName: 'Kebon Polo & Magelang, Jawa Tengah',
    parentRegion: 'Magelang, Jawa Tengah',
    spots: [
      'Taman Wisata Kyai Langgeng Magelang',
      'Gunung Tidar (Paku Tanah Jawa)',
      'Alun-Alun Magelang & Menara Air Heritage',
      'Candi Mendut & Candi Pawon',
      'Rafting Sungai Elo Magelang',
      'Svargabumi Borobudur',
    ],
    culinary: {
      breakfast: 'Kupat Tahu Pojok Magelang Asli',
      lunch: 'Sop Senerek Iga Sapi Bu Atmo Magelang',
      dinner: 'Wedang Kacang Kebonpolo & Ronde Hangat',
    },
    accommodation: 'Hotel Grand Artos / Puri Asri Hotel Magelang',
    bestSeason: 'Sepanjang Tahun',
    tips: [
      'Mampir ke Warung Wedang Kacang Kebonpolo di malam hari untuk minuman hangat kacang empuk legendaris.',
      'Naik ke puncak Gunung Tidar di pagi hari untuk panorama asri Merbabu.',
    ],
  },
  kebonpolo: {
    canonicalName: 'Kebon Polo & Magelang, Jawa Tengah',
    parentRegion: 'Magelang, Jawa Tengah',
    spots: [
      'Taman Wisata Kyai Langgeng Magelang',
      'Gunung Tidar (Paku Tanah Jawa)',
      'Alun-Alun Magelang & Menara Air Heritage',
      'Candi Mendut & Candi Pawon',
      'Rafting Sungai Elo Magelang',
      'Svargabumi Borobudur',
    ],
    culinary: {
      breakfast: 'Kupat Tahu Pojok Magelang Asli',
      lunch: 'Sop Senerek Iga Sapi Bu Atmo Magelang',
      dinner: 'Wedang Kacang Kebonpolo & Ronde Hangat',
    },
    accommodation: 'Hotel Grand Artos / Puri Asri Hotel Magelang',
    bestSeason: 'Sepanjang Tahun',
    tips: [
      'Mampir ke Warung Wedang Kacang Kebonpolo di malam hari untuk minuman hangat kacang empuk legendaris.',
      'Naik ke puncak Gunung Tidar di pagi hari untuk panorama asri Merbabu.',
    ],
  },
  magelang: {
    canonicalName: 'Magelang & Kawasan Candi Borobudur, Jawa Tengah',
    parentRegion: 'Kabupaten & Kota Magelang',
    spots: [
      'Candi Borobudur Sunrise',
      'Gereja Ayam Bukit Rhema',
      'Svargabumi Borobudur',
      'Taman Kyai Langgeng',
      'Gunung Tidar Paku Jawa',
      'Rafting Sungai Progo',
    ],
    culinary: {
      breakfast: 'Kupat Tahu Pak Pangat Magelang',
      lunch: 'Mangut Beong Sehati Asli Borobudur',
      dinner: 'Sop Senerek Bu Atmo & Nasi Goreng Magelangan',
    },
    accommodation: 'Plataran Borobudur Resort / Hotel Puri Asri',
    bestSeason: 'Mei - Oktober',
    tips: ['Pesan tiket naik struktur Candi Borobudur jauh-jauh hari secara online.'],
  },

  // ─── JAWA TENGAH: SALATIGA & KOPENG ───
  salatiga: {
    canonicalName: 'Kota Salatiga & Lereng Merbabu, Jawa Tengah',
    parentRegion: 'Salatiga, Jawa Tengah',
    spots: [
      'Taman Wisata Kopeng Merbabu',
      'Agrowisata Salib Putih',
      'Danau Rawa Pening Ambarawa',
      'Benteng Pendem Fort Willem I Ambarawa',
      'Taman Tingkir Salatiga',
    ],
    culinary: {
      breakfast: 'Soto Kesambi Salatiga & Tempe Mendoan',
      lunch: 'Gudeg Koyor Reksa Salatiga',
      dinner: 'Ronde Sekoteng Jago Asli Salatiga sejak 1890',
    },
    accommodation: 'Laras Asri Resort & Spa Salatiga / Kayu Arum Resort',
    bestSeason: 'Sepanjang Tahun',
    tips: ['Nikmati semangkuk Ronde Jago legendaris dengan 9 macam isian rempah penghangat tubuh.'],
  },
  kopeng: {
    canonicalName: 'Wisata Kopeng Lereng Gunung Merbabu, Jawa Tengah',
    parentRegion: 'Kopeng & Salatiga',
    spots: [
      'Taman Wisata Kopeng Treetop Adventure',
      'Kebun Stroberi & Sayur Organik Kopeng',
      'Gardu Pandang Cuntel Merbabu',
      'Hutan Pinus Kopeng',
      'Umbul Sidomukti Ungaran',
    ],
    culinary: {
      breakfast: 'Kopi Merbabu & Pisang Goreng Keju',
      lunch: 'Ikan Bakar Gurame Rawa Pening',
      dinner: 'Sate Kelinci Kopeng & Wedang Ronde',
    },
    accommodation: 'Kopeng Treetop Glamping / Laras Asri Resort',
    bestSeason: 'April - Oktober',
    tips: ['Suhu udara bisa mencapai 15°C di malam hari, bawa pakaian hangat.'],
  },

  // ─── DIENG & WONOSOBO ───
  dieng: {
    canonicalName: 'Dataran Tinggi Dieng, Jawa Tengah',
    parentRegion: 'Wonosobo & Banjarnegara',
    spots: [
      'Golden Sunrise Bukit Sikunir',
      'Kompleks Candi Arjuna Dieng',
      'Kawah Sikidang Vulkanik',
      'Telaga Warna & Telaga Pengilon',
      'Batu Pandang Ratapan Angin',
    ],
    culinary: {
      breakfast: 'Mie Ongklok Pak Muhadi Wonosobo',
      lunch: 'Tempe Kemul Hangat & Nasi Jagung',
      dinner: 'Wedang Purwaceng Hangat & Manisan Carica',
    },
    accommodation: 'Homestay Syariah Dieng Plateau / Kresna Hotel Wonosobo',
    bestSeason: 'Mei - September',
    tips: ['Bawa jaket tebal, kupluk, dan sarung tangan karena suhu bisa turun hingga 0°C (Embun Upas).'],
  },
}

import { findDestinationKnowledge } from './travel-knowledge'

/**
 * Searches and grounds a destination query to verified, active spots using Travel Knowledge Base + Map APIs
 */
export async function resolveGroundingForDestination(destination: string): Promise<GroundingResult> {
  const norm = destination.toLowerCase().trim()

  // 1. Check central Travel Knowledge Base (Bali, Jogja, Bandung, Tokyo, Paris, etc.)
  const knowledge = findDestinationKnowledge(destination)
  if (knowledge) {
    const groundedSpots: GroundedSpot[] = knowledge.spots.map((name) => ({
      name,
      category: 'sightseeing',
      address: `${name}, ${knowledge.parentRegion}`,
    }))

    return {
      destinationName: knowledge.canonicalName,
      parentRegion: knowledge.parentRegion,
      spots: groundedSpots,
      culinary: knowledge.culinary,
      accommodation: knowledge.accommodation,
      bestSeason: knowledge.bestSeason,
      tips: knowledge.tips,
    }
  }

  // 2. Check exact match in Regional Database
  for (const [key, data] of Object.entries(INDONESIAN_REGIONAL_DATABASE)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      const groundedSpots: GroundedSpot[] = data.spots.map((name) => ({
        name,
        category: 'sightseeing',
        address: `${name}, ${data.parentRegion}, Indonesia`,
      }))

      return {
        destinationName: data.canonicalName,
        parentRegion: data.parentRegion,
        spots: groundedSpots,
        culinary: data.culinary,
        accommodation: data.accommodation,
        bestSeason: data.bestSeason,
        tips: data.tips,
      }
    }
  }

  // 2. Query Google Places API if GOOGLE_MAPS_API_KEY is provided
  // 2. Query Mapbox Places API if MAPBOX_ACCESS_TOKEN is provided
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (mapboxToken) {
    try {
      const { searchMapboxPlaces, geocodeMapbox } = await import('./mapbox')
      const [places, geocode] = await Promise.all([
        searchMapboxPlaces(`wisata ${destination}`, mapboxToken),
        geocodeMapbox(destination, mapboxToken),
      ])

      if (places.length > 0) {
        const spots: GroundedSpot[] = places.map((p) => ({
          name: p.name,
          category: 'sightseeing',
          address: p.formattedAddress,
          lat: p.lat,
          lon: p.lon,
        }))

        const resolvedName = geocode?.placeName || `${destination}, Indonesia`

        return {
          destinationName: resolvedName,
          parentRegion: destination,
          spots,
          culinary: {
            breakfast: `Sarapan Pagi Menu Tradisional Khas di Sekitar ${destination}`,
            lunch: `Makan Siang Restoran Pilihan & Santap Kuliner ${destination}`,
            dinner: `Kuliner Malam & Street Food Favorit di ${destination}`,
          },
          accommodation: `Hotel / Boutique Homestay Nyaman di ${destination}`,
          bestSeason: 'Sepanjang Tahun',
          tips: [
            `Gunakan peta navigasi untuk memandu rute harian Anda di ${destination}.`,
            'Siapkan uang tunai pecahan kecil untuk tiket masuk dan parkir.',
          ],
        }
      }
    } catch (err) {
      console.error('[SearchGrounding] Mapbox fetch error:', err)
    }
  }

  // 3. Query Google Places API if GOOGLE_MAPS_API_KEY is provided
  const googleKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (googleKey) {
    try {
      const { searchGooglePlaces } = await import('./google-maps')
      const googleResults = await searchGooglePlaces(`tempat wisata populer di ${destination}`, googleKey)
      if (googleResults.length > 0) {
        const spots: GroundedSpot[] = googleResults.slice(0, 8).map((g) => ({
          name: g.name,
          category: 'sightseeing',
          address: g.formattedAddress || `${g.name}, ${destination}`,
          lat: g.lat,
          lon: g.lng,
        }))

        return {
          destinationName: `${destination}, Indonesia`,
          parentRegion: destination,
          spots,
          culinary: {
            breakfast: `Sarapan Pagi Menu Lokal di ${destination}`,
            lunch: `Makan Siang Restoran Terfavorit di ${destination}`,
            dinner: `Santap Malam Kuliner Malam di ${destination}`,
          },
          accommodation: `Hotel / Resort Nyaman di ${destination}`,
          bestSeason: 'Sepanjang Tahun',
          tips: [
            `Gunakan Google Maps untuk memandu navigasi rute selama berada di ${destination}.`,
            'Siapkan uang tunai dan metode pembayaran non-tunai.',
          ],
        }
      }
    } catch (err) {
      console.error('[SearchGrounding] Google Places fetch error:', err)
    }
  }

  // 3. Query Geoapify Places API dynamically for any uncatalogued district / city worldwide
  const apiKey = process.env.GEOAPIFY_API_KEY || 'a28e9f9e65e94942aade44f22fb4a25b'
  let dynamicPlaces: GeoapifyPlace[] = []

  try {
    dynamicPlaces = await fetchPlacesForCity(destination, apiKey)
  } catch (err) {
    console.error('[SearchGrounding] Geoapify fetch error:', err)
  }

  if (dynamicPlaces.length > 0) {
    const validPlaces = dynamicPlaces.filter((p) => p.name && p.name.length >= 3)
    const spots: GroundedSpot[] = validPlaces.slice(0, 8).map((p) => ({
      name: p.name,
      category: 'sightseeing',
      address: p.address || `${p.name}, ${destination}`,
      lat: p.lat,
      lon: p.lon,
    }))

    return {
      destinationName: `${destination}, Indonesia`,
      parentRegion: destination,
      spots,
      culinary: {
        breakfast: `Sarapan Pagi Menu Tradisional di ${destination}`,
        lunch: `Makan Siang Restoran Pilihan & Kuliner Khas ${destination}`,
        dinner: `Santap Malam Santai & Kuliner Populer di ${destination}`,
      },
      accommodation: `Hotel / Boutique Guesthouse Nyaman di ${destination}`,
      bestSeason: 'Sepanjang Tahun (Pagi & Sore Hari)',
      tips: [
        `Gunakan pakaian yang nyaman untuk berjalan kaki menjelajahi area ${destination}.`,
        'Siapkan uang tunai pecahan kecil untuk parkir dan transaksi di warung lokal.',
        'Gunakan peta navigasi untuk rute perjalanan antar spot wisata.',
      ],
    }
  }

  // 3. Fallback generic grounding
  return {
    destinationName: destination,
    parentRegion: destination,
    spots: [
      {
        name: `Pusat Wisata & Landmark Utama ${destination}`,
        category: 'sightseeing',
        address: `${destination}, Indonesia`,
      },
      {
        name: `Kawasan Wisata Alam & Budaya ${destination}`,
        category: 'nature',
        address: `${destination}, Indonesia`,
      },
      {
        name: `Sentra Kuliner Khas & Rekreasi ${destination}`,
        category: 'culinary',
        address: `${destination}, Indonesia`,
      },
    ],
    culinary: {
      breakfast: `Sarapan Pagi Khas di ${destination}`,
      lunch: `Makan Siang Kuliner Andalan ${destination}`,
      dinner: `Santap Malam Istimewa di ${destination}`,
    },
    accommodation: `Hotel / Resort Rekomendasi di ${destination}`,
    bestSeason: 'Sepanjang Tahun',
    tips: [
      `Cari tahu informasi jam operasional tempat wisata di ${destination}.`,
      'Bawa kamera untuk mengabadikan momen perjalanan terbaik.',
    ],
  }
}
