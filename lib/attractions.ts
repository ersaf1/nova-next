export interface Attraction {
  name: string
  description: string
  image: string
  lat?: number   // from Geoapify
  lon?: number   // from Geoapify
}

export const DESTINATION_ATTRACTIONS: Record<string, Attraction[]> = {
  bali: [
    { name: 'Pura Luhur Uluwatu & Tari Kecak', description: 'Pura tebing samudera megah dengan pementasan Tari Kecak berlatar sunset spektakuler.', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=85' },
    { name: 'Tegalalang Rice Terraces & Alas Harum', description: 'Hamparan terasering sawah hijau bertingkat asri khas Ubud dengan panorama lembah tropis.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85' },
    { name: 'Pura Ulun Danu Beratan Bedugul', description: 'Pura terapung ikonik di atas danau berkabut sejuk pegunungan Bedugul.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pura_Ulun_Danu_Bratan%2C_2022.jpg/1280px-Pura_Ulun_Danu_Bratan%2C_2022.jpg' },
    { name: 'Pura Tanah Lot Tabanan', description: 'Pura kuno megah di atas batu karang samudera dengan siluet matahari terbenam magis.', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=85' },
    { name: 'Kelingking Beach Nusa Penida', description: 'Tebing kapur unik menyerupai T-Rex dengan pasir putih bersih dan laut biru toska.', image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=85' },
    { name: 'Sacred Monkey Forest Sanctuary Ubud', description: 'Hutan lindung sakral dengan ratusan kera abu-abu dan pura purbakala bernuansa asri.', image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=85' },
  ],
  yogyakarta: [
    { name: 'Candi Prambanan Heritage', description: 'Kompleks candi Hindu terindah di Asia Tenggara warisan budaya dunia UNESCO.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Prambanan_Temple_Complex.jpg/1280px-Prambanan_Temple_Complex.jpg' },
    { name: 'Keraton Ngayogyakarta Hadiningrat', description: 'Istana resmi Kesultanan Yogyakarta yang kaya akan nilai sejarah dan pusaka Jawa.', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1200&q=85' },
    { name: 'Taman Sari Water Castle', description: 'Kompleks pemandian dan lorong bawah tanah bersejarah istana air Kesultanan.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Taman_Sari_Water_Castle.jpg/1280px-Taman_Sari_Water_Castle.jpg' },
    { name: 'Jalan Malioboro & Titik Nol KM', description: 'Jantung kehidupan kota Jogja dengan suasana malam musisi jalanan dan kuliner lesehan.', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1200&q=85' },
  ],
  bandung: [
    { name: 'Kawah Putih Ciwidey', description: 'Danau kawah vulkanik belerang putih toska magis di lereng Gunung Patuha.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Kawah_Putih_Ciwidey_Bandung.jpg/1280px-Kawah_Putih_Ciwidey_Bandung.jpg' },
    { name: 'Jalan Braga Heritage', description: 'Kawasan bersejarah dengan deretan gedung kolonial bergaya Art Deco dan kafe estetik.', image: 'https://images.unsplash.com/photo-1549880305-890f5551f87c?w=1200&q=85' },
    { name: 'Ranca Upas Ciwidey', description: 'Padang rumput hijau asri dengan penangkaran rusa jinak dan suasana berkemah.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85' },
    { name: 'Orchid Forest Cikole', description: 'Hutan pinus sejuk Lembang dengan jembatan gantung kayu dan ribuan koleksi anggrek.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85' },
  ],
  jakarta: [
    { name: 'Monumen Nasional (Monas)', description: 'Ikon kemerdekaan Indonesia dengan museum sejarah dan puncak cawan api emas.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monas_National_Monument_Jakarta.jpg/1280px-Monas_National_Monument_Jakarta.jpg' },
    { name: 'Kota Tua & Museum Fatahillah', description: 'Kawasan cagar budaya peninggalan Batavia lama dengan sepeda onthel warna-warni.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Jakarta_History_Museum_Fatahillah_Square.jpg/1280px-Jakarta_History_Museum_Fatahillah_Square.jpg' },
    { name: 'Pantjoran PIK', description: 'Pusat wisata kuliner dan budaya bernuansa pecinan modern di pesisir utara Jakarta.', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=85' },
  ],
  lombok: [
    { name: 'Gili Trawangan', description: 'Pulau tropis bebas polusi kendaraan bermotor dengan terumbu karang dan sunset point.', image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&q=85' },
    { name: 'Pantai Tanjung Aan & Bukit Merese', description: 'Pantai berpasir butiran merica unik dan bukit hijau dengan pemandangan teluk Mandalika.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85' },
    { name: 'Desa Adat Sade', description: 'Desa tradisional suku Sasak dengan rumah adat Bale Tani dan kerajinan tenun songket.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85' },
  ],
  tokyo: [
    { name: 'Shibuya Crossing & Hachiko', description: 'Persimpangan pejalan kaki tersibuk di dunia simbol energi modern Tokyo.', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=85' },
    { name: 'Kuil Kuno Senso-ji Asakusa', description: 'Kuil Buddha tertua di Tokyo dengan gerbang Kaminarimon dan lampion merah raksasa.', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=85' },
    { name: 'Tokyo Tower & Skytree View', description: 'Menara komunikasi ikonik dengan panorama gemerlap kota Tokyo dari ketinggian.', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=85' },
    { name: 'Kuil Meiji Jingu & Harajuku', description: 'Hutan suci yang tenang di tengah kota berdampingan dengan pusat mode anak muda Harajuku.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85' },
  ],
  paris: [
    { name: 'Menara Eiffel (Tour Eiffel)', description: 'Simbol abadi kota Paris dengan pemandangan panorama kota dari ketinggian.', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=85' },
    { name: 'Museum Seni Louvre', description: 'Museum seni terbesar di dunia rumah bagi lukisan Mona Lisa dan piramida kaca.', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=85' },
    { name: 'Katedral Notre-Dame de Paris', description: 'Mahakarya arsitektur Gothic Prancis yang megah di tepi Sungai Seine.', image: 'https://images.unsplash.com/photo-1478358161113-b0e11994a36b?w=1200&q=85' },
    { name: 'Arc de Triomphe & Champs-Élysées', description: 'Monumen kemenangan megah di ujung barat jalan mewah Champs-Élysées.', image: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=1200&q=85' },
  ],
  singapore: [
    { name: 'Gardens by the Bay & Supertree', description: 'Taman futuristik kelas dunia dengan pohon buatan raksasa dan air terjun indoor.', image: 'https://images.unsplash.com/photo-1506351421178-63b52a2d15c8?w=1200&q=85' },
    { name: 'Marina Bay Sands SkyPark', description: 'Gedung terintegrasi megah dengan kolam renang infinity dan dek observasi teluk.', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=85' },
    { name: 'Jewel Changi Airport Rain Vortex', description: 'Air terjun indoor tertinggi di dunia di tengah taman tropis bandara terbaik.', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=85' },
  ],
  swiss: [
    { name: 'Puncak Matterhorn Zermatt', description: 'Gunung berbentuk piramida ikonik yang menjadi lambang keindahan alam Alpen Swiss.', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85' },
    { name: 'Lembah Lauterbrunnen', description: 'Desa dongeng di lembah hijau yang dikelilingi 72 air terjun spektakuler.', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85' },
    { name: 'Danau Brienz & Interlaken', description: 'Danau berair toska jernih yang diapit pegunungan bersalju Eiger dan Jungfrau.', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85' },
  ],
  santorini: [
    { name: 'Oia Sunset Cliffs', description: 'Desa tebing putih indah dengan pemandangan sunset terbaik di atas Laut Aegean.', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85' },
    { name: 'Blue Dome Churches', description: 'Bangunan bercat putih tradisional dengan kubah biru khas kepulauan Yunani.', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=85' },
    { name: 'Amoudi Bay', description: 'Pelabuhan kecil di bawah Oia dengan air jernih dan restoran seafood segar tepi laut.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85' },
  ],
  rome: [
    { name: 'The Colosseum', description: 'Amfiteater kuno ikonik simbol kemegahan sejarah Kekaisaran Romawi.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=85' },
    { name: 'Trevi Fountain', description: 'Air mancur bergaya Barok yang megah tempat melempar koin permohonan kembali ke Roma.', image: 'https://images.unsplash.com/photo-1525874684015-5837e263121c?w=1200&q=85' },
  ],
}

const GENERAL_TRAVEL_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=85'
]

export function getAttractionsForDestination(destination: string, apiAttractions?: { name: string; description: string }[]): Attraction[] {
  const norm = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, '')

  if (DESTINATION_ATTRACTIONS[norm]) {
    return DESTINATION_ATTRACTIONS[norm]
  }

  if (apiAttractions && apiAttractions.length > 0) {
    return apiAttractions.map((attr) => ({
      name: attr.name,
      description: attr.description,
      image: ''
    }))
  }

  return [
    { name: 'Scenic Landmarks', description: 'Explore the local architecture, historic squares, and iconic neighborhood views.', image: ''},
    { name: 'Nature & Parks', description: 'Relax in local green spaces, scenic view points, and beautiful natural areas.', image: ''},
    { name: 'Local Food & Cafes', description: 'Experience the local culinary scene, street food markets, and cozy cafes.', image: ''},
  ]
}

// ─── Geoapify integration ────────────────────────────────────
import type { GeoapifyPlace } from './geoapify/types'

function formatCategory(category: string): string {
  const last = category.split('.').pop() ?? category
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ')
}

// Converts Geoapify places into the Attraction shape used by the itinerary UI.
export function mergePlacesIntoAttractions(places: GeoapifyPlace[]): Attraction[] {
  return places.map((place) => ({
    name: place.name,
    description: [
      place.categories[0] ? formatCategory(place.categories[0]) : 'Attraction',
      place.address,
      place.openingHours ? `Buka: ${place.openingHours}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    image: '',
    lat: place.lat,
    lon: place.lon,
  }))
}