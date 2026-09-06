import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAttractionsForDestination, mergePlacesIntoAttractions } from '@/lib/attractions'
import { getOrFetchPlaces } from '@/lib/geoapify/places-cache'
import { resolveGroundingForDestination } from '@/lib/search-grounding'
import { fetchRealPlacePhotoWithScore } from '@/lib/real-photos'
import { findDestinationKnowledge } from '@/lib/travel-knowledge'
import { readFile } from 'fs/promises'
import path from 'path'

const DESTINATIONS_FILE = path.join(process.cwd(), 'data', 'destinations.json')

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function fetchUnsplashPhoto(query: string, width = 2000, quality = 95): Promise<string | null> {
  // Unsplash /napi/ is a private endpoint blocked in production environments.
  // Use picsum.photos as a reliable, CORS-friendly fallback instead.
  // Generate a deterministic seed from the query so the same query always
  // returns the same image (avoids jarring swaps on re-render).
  const seed = query.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'travel'
  return `https://picsum.photos/seed/${seed}/${width}/1200`
}

// Sudut kreatif acak supaya tiap generate terasa berbeda
const CREATIVE_ANGLES = [
  'kuliner lokal dan hidden gems',
  'alam, spot foto ikonik, dan suasana santai',
  'budaya, sejarah, dan kehidupan warga lokal',
  'pengalaman unik yang jarang dikunjungi turis',
  'keseimbangan antara landmark terkenal dan tempat anti-mainstream',
  'petualangan aktif di siang hari dan suasana malam yang hidup',
]

const INDONESIAN_LOCAL_KNOWLEDGE: Record<string, {
  canonicalName: string
  parentRegion: string
  spots: string[]
  culinary: { breakfast: string; lunch: string; dinner: string }
  accommodation: string
  bestSeason: string
  tips: string[]
}> = {
  // ─── JAWA TENGAH & DIY ───
  'kebon polo': {
    canonicalName: 'Kebon Polo & Magelang, Jawa Tengah',
    parentRegion: 'Magelang, Jawa Tengah',
    spots: ['Taman Kebonpolo Magelang', 'Gunung Tidar (Paku Tanah Jawa)', 'Alun-Alun Magelang & Menara Air Heritage', 'Taman Wisata Kyai Langgeng', 'Candi Pawon & Candi Mendut', 'Rafting Sungai Elo Magelang'],
    culinary: {
      breakfast: 'Kupat Tahu Pojok Magelang & Teh Manis Hangat',
      lunch: 'Sop Senerek Daging Iga Bu Atmo Magelang',
      dinner: 'Kuliner Legendaris Wedang Kacang Kebonpolo & Ronde',
    },
    accommodation: 'Hotel Grand Artos / Puri Asri Hotel Magelang',
    bestSeason: 'Sepanjang Tahun (Pagi 06:00 - 10:00 & Sore Hari)',
    tips: [
      'Kunjungi Taman Kebonpolo dan Gunung Tidar di pagi hari untuk udara sejuk dan pemandangan Gunung Merbabu.',
      'Cicipi Kupat Tahu Magelang dan bawa oleh-oleh Getuk Trio asli Magelang.',
      'Gunakan transportasi online atau sewa motor untuk mobilitas praktis di sekitar Magelang.'
    ],
  },
  'kebonpolo': {
    canonicalName: 'Kebon Polo & Magelang, Jawa Tengah',
    parentRegion: 'Magelang, Jawa Tengah',
    spots: ['Taman Kebonpolo Magelang', 'Gunung Tidar (Paku Tanah Jawa)', 'Alun-Alun Magelang & Menara Air Heritage', 'Taman Wisata Kyai Langgeng', 'Candi Pawon & Candi Mendut', 'Rafting Sungai Elo Magelang'],
    culinary: {
      breakfast: 'Kupat Tahu Pojok Magelang & Teh Manis Hangat',
      lunch: 'Sop Senerek Daging Iga Bu Atmo Magelang',
      dinner: 'Kuliner Legendaris Wedang Kacang Kebonpolo & Ronde',
    },
    accommodation: 'Hotel Grand Artos / Puri Asri Hotel Magelang',
    bestSeason: 'Sepanjang Tahun (Pagi 06:00 - 10:00 & Sore Hari)',
    tips: [
      'Kunjungi Taman Kebonpolo dan Gunung Tidar di pagi hari untuk udara sejuk dan pemandangan Gunung Merbabu.',
      'Cicipi Kupat Tahu Magelang dan bawa oleh-oleh Getuk Trio asli Magelang.',
    ],
  },
  'magelang': {
    canonicalName: 'Magelang & Candi Borobudur, Jawa Tengah',
    parentRegion: 'Kabupaten & Kota Magelang',
    spots: ['Candi Borobudur Sunrise', 'Gereja Ayam Bukit Rhema', 'Svargabumi Borobudur', 'Gunung Tidar', 'Taman Kyai Langgeng', 'Rafting Sungai Progo'],
    culinary: {
      breakfast: 'Kupat Tahu Pak Pangat Magelang',
      lunch: 'Mangut Beong Sehati Asli Borobudur',
      dinner: 'Sop Senerek Bu Atmo & Nasi Goreng Magelangan',
    },
    accommodation: 'Plataran Borobudur Resort / Hotel Puri Asri',
    bestSeason: 'Mei - Oktober (Pagi hari untuk sunrise Borobudur)',
    tips: ['Pesan tiket naik struktur Candi Borobudur jauh-jauh hari secara online.'],
  },
  'salatiga': {
    canonicalName: 'Kota Salatiga & Lereng Gunung Merbabu, Jawa Tengah',
    parentRegion: 'Salatiga & Kopeng',
    spots: ['Taman Wisata Kopeng Merbabu', 'Danau Rawa Pening', 'Agrowisata Salib Putih', 'Benteng Pendem Ambarawa', 'Pohon Pengantin Salatiga'],
    culinary: {
      breakfast: 'Soto Kesambi Salatiga & Tempe Mendoan',
      lunch: 'Gudeg Koyor Reksa Salatiga',
      dinner: 'Ronde Sekoteng Jago Asli Salatiga & Enting-Enting Gepuk',
    },
    accommodation: 'Laras Asri Resort & Spa Salatiga / Kayu Arum Resort',
    bestSeason: 'Sepanjang Tahun (Kota dengan udara sejuk pegunungan)',
    tips: ['Nikmati suasana malam santai sambil mencicipi Ronde Jago legendaris sejak 1890.'],
  },
  'dieng': {
    canonicalName: 'Dataran Tinggi Dieng, Jawa Tengah',
    parentRegion: 'Wonosobo & Banjarnegara',
    spots: ['Kawah Sikidang', 'Telaga Warna & Telaga Pengilon', 'Kompleks Candi Arjuna Dieng', 'Golden Sunrise Bukit Sikunir', 'Batu Pandang Ratapan Angin'],
    culinary: {
      breakfast: 'Mie Ongklok Wonosobo & Sate Sapi',
      lunch: 'Tempe Kemul Hangat & Nasi Jagung',
      dinner: 'Wedang Purwaceng & Manisan Carica Khas Dieng',
    },
    accommodation: 'Homestay Syariah Dieng Plateau / Kresna Hotel Wonosobo',
    bestSeason: 'Mei - September (Musim Kemarau & Fenomena Embun Upas)',
    tips: ['Suhu malam bisa mencapai 0°C-5°C, siapkan jaket tebal, kupluk, dan sarung tangan.'],
  },
  'wonosobo': {
    canonicalName: 'Wonosobo & Lereng Sindoro Sumbing, Jawa Tengah',
    parentRegion: 'Kabupaten Wonosobo',
    spots: ['Kebun Teh Tambi', 'Gunung Prau Sunrise', 'Telaga Menjer Garung', 'Batu Angkruk Dieng', 'Kahuripan Glamping'],
    culinary: {
      breakfast: 'Mie Ongklok Pak Muhadi Wonosobo',
      lunch: 'Ikan Bakar Telaga Menjer & Sambal Terasi',
      dinner: 'Sego Megono Wonosobo & Tempe Kemul',
    },
    accommodation: 'The Kresna Hotel Wonosobo / Surya Asia Hotel',
    bestSeason: 'Juni - September',
    tips: ['Sempatkan mampir ke Pabrik Teh Tambi untuk tea walk menyegarkan.'],
  },
  'tawangmangu': {
    canonicalName: 'Tawangmangu & Lereng Gunung Lawu, Jawa Tengah',
    parentRegion: 'Karanganyar, Jawa Tengah',
    spots: ['Air Terjun Grojogan Sewu', 'Candi Cetho Mistis', 'Candi Sukuh Piramida Jawa', 'Kebun Teh Kemuning', 'The Lawu Park'],
    culinary: {
      breakfast: 'Soto Karang Tawangmangu',
      lunch: 'Sate Kelinci Pak Temon Tawangmangu & Lontong',
      dinner: 'Wedang Ronde Jahe Lawu & Pisang Molen Tawangmangu',
    },
    accommodation: 'Nava Hotel Tawangmangu / Allura Azana Resort',
    bestSeason: 'Sepanjang Tahun (Udara sejuk 16°C-22°C)',
    tips: ['Hati-hati dengan monyet liar di area Grojogan Sewu, simpan kantong plastik di tas.'],
  },
  'karimunjawa': {
    canonicalName: 'Kepulauan Karimunjawa, Jawa Tengah',
    parentRegion: 'Jepara, Jawa Tengah',
    spots: ['Snorkeling Pulau Menjangan Kecil', 'Pantai Ujung Gelam Sunset', 'Bukit Love Karimunjawa', 'Penangkaran Hiu Pulau Menjangan Besar', 'Pulau Geleang'],
    culinary: {
      breakfast: 'Nasi Gandul Ikan Asin Karimun',
      lunch: 'Ikan Bakar Bakau Pindang Serani Jepara',
      dinner: 'BBQ Seafood Segar Alun-Alun Karimunjawa',
    },
    accommodation: 'The Happinezz Hills Resort / Breve Azurine Lagoon Retreat',
    bestSeason: 'Maret - Oktober (Gelombang laut tenang & air jernih)',
    tips: ['Cek jadwal kapal ferry atau fast boat dari Pelabuhan Kartini Jepara.'],
  },
  'jepara': {
    canonicalName: 'Jepara & Pesisir Kartini, Jawa Tengah',
    parentRegion: 'Kabupaten Jepara, Jawa Tengah',
    spots: [
      'Pantai Kartini & Kura-Kura Ocean Park',
      'Museum R.A. Kartini Jepara',
      'Pantai Bandengan (Tirta Samudra)',
      'Benteng Portugis & Pantai Banyumanis',
      'Pulau Panjang Jepara',
      'Sentra Seni Ukir Kayu Mulyoharjo',
      'Pantai Bondo (Pantai Ombak Mati)',
      'Hutan Wisata Sreni Indah & Pinus',
      'Sentra Tenun Ikat Tradisional Troso',
      'Alun-Alun 1 Jepara & Masjid Agung',
      'Makam & Masjid Cagar Budaya Mantingan',
      'Puncak Jehan & Kebun Kopi Tempur',
      'Pantai Teluk Awur Jepara',
      'Air Terjun Songgo Langit Kembang',
      'Sentra Keramik & Gerabah Mayong',
      'Pantai Pailus Mlonggo',
      'Desa Wisata Plajan & Taman Celosia',
      'Gua Manik Karanganyar',
      'Pantai Blebak Sekuro',
      'Benteng VOC Fort Japara Heritage',
      'Pusat Kerajinan Rotan Teluk Wetan',
      'Pantai Semat & Dermaga Tradisional',
      'Hutan Mangrove Desa Bulak Baru',
      'Sentra Monel & Perhiasan Kriyan',
    ],
    culinary: {
      breakfast: 'Pindang Serani Jepara & Nasi Hangat Gurih',
      lunch: 'Horok-Horok Bakso & Rujak Jepara Asli',
      dinner: 'Sop Udang Jepara & Es Dawet Ayu',
    },
    accommodation: 'Jepara Marina Beach Resort / D’Season Premiere Hotel Jepara',
    bestSeason: 'April - Oktober (Musim Kemarau & Cuaca Pesisir Cerah)',
    tips: [
      'Kunjungi Museum RA Kartini di pagi hari untuk mempelajari sejarah emansipasi wanita Indonesia.',
      'Sewa perahu dari Pantai Kartini menuju Pulau Panjang untuk snorkeling di perairan karang jernih.',
      'Sempatkan berbelanja cinderamata ukir kayu jati di Sentra Mulyoharjo dan kain tenun di Desa Troso.',
    ],
  },
  'gunungkidul': {
    canonicalName: 'Gunungkidul & Pantai Eksotis Selatan, DI Yogyakarta',
    parentRegion: 'Wonosari, Gunungkidul',
    spots: ['Gondola Tradisional Pantai Timang', 'Cave Tubing Goa Pindul', 'Pantai Indrayanti & Pok Tunggal', 'HeHa Ocean View Patuk', 'Puncak Segoro'],
    culinary: {
      breakfast: 'Nasi Tiwul Manis & Sambal Bawang Buntil',
      lunch: 'Lombok Ijo Sego Abang Mbah Jirak',
      dinner: 'Seafood Pantai Baron & Kelapa Muda Asli',
    },
    accommodation: 'Santika Gunungkidul / Radika Paradise Villa & Cottage',
    bestSeason: 'Mei - Oktober',
    tips: ['Gunakan alas kaki anti selip untuk aktivitas susur gua di Goa Pindul.'],
  },

  // ─── JAWA BARAT & BANTEN ───
  'pangandaran': {
    canonicalName: 'Pangandaran & Green Canyon, Jawa Barat',
    parentRegion: 'Kabupaten Pangandaran',
    spots: ['Pantai Barat Sunset & Pantai Timur Sunrise', 'Body Rafting Green Canyon (Cukang Taneuh)', 'Cagar Alam Pananjung & Goa Jepang', 'Pantai Batu Karas Surfing', 'Pantai Batu Hiu'],
    culinary: {
      breakfast: 'Soto Ayam Pangandaran & Nasi Hangat',
      lunch: 'Seafood Segar Pasir Putih & Ikan Bakar Jimbaran Style',
      dinner: 'Kepiting Saus Padang Pasar Ikan & Jus Kelapa Kopyor',
    },
    accommodation: 'The Allure Villas Managed by Sahid / Hau Eco Lodges Citumang',
    bestSeason: 'April - Oktober (Ombak ideal & air Green Canyon hijau jernih)',
    tips: ['Lakukan body rafting Citumang atau Green Canyon di pagi hari saat arus tenang.'],
  },
  'garut': {
    canonicalName: 'Garut Swiss van Java, Jawa Barat',
    parentRegion: 'Kabupaten Garut',
    spots: ['Kawah Kamojang & Kawah Putih Talaga Bodas', 'Candi Cangkuang & Kampung Pulo', 'Pemandian Air Panas Cipanas Garut', 'Situ Bagendit', 'Kebun Mawar Situhapa'],
    culinary: {
      breakfast: 'Surabi Khas Garut & Kopi Papandayan',
      lunch: 'Nasi Liwet Asep Stroberi Kadungora',
      dinner: 'Sate Domba Khas Garut & Dodol Picnic',
    },
    accommodation: 'Kampung Sampireun Resort & Spa / Hotel Santika Garut',
    bestSeason: 'Sepanjang Tahun (Sejuk & cocok untuk berendam air panas)',
    tips: ['Beli oleh-oleh Dodol Garut Picnic, Chocodot, dan kerajinan kulit Sukaregang.'],
  },
  'kuningan': {
    canonicalName: 'Kuningan & Lereng Gunung Ciremai, Jawa Barat',
    parentRegion: 'Kabupaten Kuningan',
    spots: ['Telaga Biru Cicerem (Danau Kaca)', 'Curug Putri Palutungan', 'Waduk Darma', 'Pondok Cai Pinus Palutungan', 'Kebun Raya Kuningan'],
    culinary: {
      breakfast: 'Hucap (Tahu Kecap) Mang Kapi Kuningan',
      lunch: 'Nasi Kasreng Luragung & Pepes Ikan Nila',
      dinner: 'Tahu Lamping Kuningan & Kopi Luwak Ciremai',
    },
    accommodation: 'Grage Sangkan Hotel & Spa / Horison Tirta Sanita Kuningan',
    bestSeason: 'Mei - November',
    tips: ['Foto bersama ikan dewa di Telaga Biru Cicerem dengan latar air bening toska.'],
  },
  'sukabumi': {
    canonicalName: 'Sukabumi & Geopark Ciletuh, Jawa Barat',
    parentRegion: 'Sukabumi & Pelabuhan Ratu',
    spots: ['Geopark Ciletuh Pelabuhan Ratu UNESCO', 'Jembatan Gantung Situgunung Suspension Bridge', 'Curug Cimarinjung & Curug Sodong', 'Pantai Ujung Genteng', 'Puncak Darma'],
    culinary: {
      breakfast: 'Bubur Ayam Sukabumi Bunut Asli',
      lunch: 'Seafood Pantai Pelabuhan Ratu',
      dinner: 'Mochi Lampion Kaswari & Bandrek Jahe Merah',
    },
    accommodation: 'Grand Inna Samudra Beach Pelabuhan Ratu / Balong Kabayan Eco Glamping',
    bestSeason: 'April - September',
    tips: ['Lewati Situgunung Suspension Bridge, jembatan gantung terpanjang di Asia Tenggara.'],
  },

  // ─── JAWA TIMUR ───
  'batu': {
    canonicalName: 'Kota Wisata Batu & Pujon, Jawa Timur',
    parentRegion: 'Kota Batu & Malang',
    spots: ['Museum Angkut Movie Star Studio', 'Jatim Park 2 & 3', 'Coban Rondo & Labirin Hijau', 'Cafe Sawah Desa Wisata Pujon Kidul', 'Selecta Flower Garden', 'Alun-Alun Kota Batu Bianglala'],
    culinary: {
      breakfast: 'Soto Ayam Lamongan Oro-oro Dowo',
      lunch: 'Bakso De Stadion Batu & Pangsit Renyah',
      dinner: 'Pos Ketan Legenda 1967 Alun-Alun Batu & Susu Sapi Murni',
    },
    accommodation: 'The Singhasari Resort Batu / Jambuluwuk Convention Hall & Resort Batu',
    bestSeason: 'Sepanjang Tahun (Kota bunga dengan iklim sejuk 17°C-24°C)',
    tips: ['Petik buah apel manalagi segar langsung dari kebun petani lokal di Bumiaji.'],
  },
  'banyuwangi': {
    canonicalName: 'Banyuwangi Sunrise of Java, Jawa Timur',
    parentRegion: 'Kabupaten Banyuwangi',
    spots: ['Kawah Ijen Fenomena Blue Fire', 'Taman Nasional Baluran (Africa van Java)', 'Pantai Pulau Merah Sunset', 'De Djawatan Forest (Hutan Lord of the Rings)', 'Desa Kemiren Osing'],
    culinary: {
      breakfast: 'Sego Tempong Mbok Wah Super Pedas',
      lunch: 'Rujak Soto Khas Banyuwangi',
      dinner: 'Pecel Pitik Osing & Kopi Ijen Arabika',
    },
    accommodation: 'Dialoog Banyuwangi / Jiwa Jawa Resort Ijen',
    bestSeason: 'Juli - September (Paling jernih untuk melihat Blue Fire Ijen)',
    tips: ['Mulai pendakian Kawah Ijen pukul 01.00 dini hari untuk menyaksikan Blue Fire langka.'],
  },
  'lumajang': {
    canonicalName: 'Lumajang & Air Terjun Tumpak Sewu, Jawa Timur',
    parentRegion: 'Kabupaten Lumajang',
    spots: ['Air Terjun Tumpak Sewu (Niagara Jawa)', 'Goa Tetes Belerang', 'Air Terjun Kapas Biru', 'Kebun Teh Kertowono Gucialit', 'Ranu Regulo Semeru'],
    culinary: {
      breakfast: 'Nasi Pecel Lumajang & Rempeyek Kacang',
      lunch: 'Ikan Bakar Gurame Cobek Bawang',
      dinner: 'Pisang Agung Bakar Madu & Kopi Semeru',
    },
    accommodation: 'Tumpak Sewu Homestay / Gajah Mada Hotel Lumajang',
    bestSeason: 'April - Oktober',
    tips: ['Bawa sandal gunung / sepatu trekking anti basah untuk turun ke dasar Tumpak Sewu.'],
  },
  'pacitan': {
    canonicalName: 'Pacitan Kota 1001 Goa & Pantai Paradise, Jawa Timur',
    parentRegion: 'Kabupaten Pacitan',
    spots: ['Goa Gong (Goa Terindah Se-Asia Tenggara)', 'Pantai Klayar Seruling Samudera', 'Pantai Kasap (Raja Ampat van Java)', 'Pantai Banyu Tibo', 'Sungai Maron Green River'],
    culinary: {
      breakfast: 'Nasi Tiwul Komplit Sambal Kelapa Pacitan',
      lunch: 'Soto Pacitan & Taburan Kacang Goreng',
      dinner: 'Ikan Tuna Bakar Pantai Teleng Ria',
    },
    accommodation: 'Parai Teleng Ria Beach Resort / Watukarung Rinjani Glamping',
    bestSeason: 'Mei - Oktober',
    tips: ['Susuri Sungai Maron dengan perahu tradisional seperti menyusuri Sungai Amazon.'],
  },

  // ─── BALI & NUSA TENGGARA ───
  'kintamani': {
    canonicalName: 'Kintamani & Danau Batur, Bali',
    parentRegion: 'Bangli, Bali',
    spots: ['Puncak Gunung Batur Sunrise', 'Danau Batur & Toya Devasya Hot Spring', 'Desa Wisata Tradisional Penglipuran', 'Kintamani Scenic Coffee Trail', 'Pura Ulun Danu Batur'],
    culinary: {
      breakfast: 'Kopi Arabika Kintamani & Pisang Goreng Madu',
      lunch: 'Ikan Mujair Nyat-Nyat Khas Danau Batur',
      dinner: 'Ayam Betutu Kuah Khas Bali & Sambal Matah',
    },
    accommodation: 'Lakeview Resort Kintamani / Glamping Batur Volcano View',
    bestSeason: 'April - Oktober (Pagi hari bebas kabut tebal)',
    tips: ['Bangun pukul 03.30 pagi untuk sunrise trekking Gunung Batur atau ngopi di cafe tebing Danau Batur.'],
  },
  'ubud': {
    canonicalName: 'Ubud Jantung Seni & Budaya, Bali',
    parentRegion: 'Gianyar, Bali',
    spots: ['Sacred Monkey Forest Sanctuary', 'Campuhan Ridge Walk Sunset', 'Tegalalang Rice Terraces', 'Puri Saren Agung Ubud Palace', 'Pasar Seni Tradisional Ubud', 'Goa Gajah'],
    culinary: {
      breakfast: 'Acai Bowl & Jamu Herbal Ubud Organik',
      lunch: 'Bebek Bengil / Bebek Tepi Sawah Crispy Duck',
      dinner: 'Nasi Campur Ayam Kedewatan Ibu Mangku',
    },
    accommodation: 'Maya Ubud Resort & Spa / Komaneka at Bisma Ubud',
    bestSeason: 'April - Oktober',
    tips: ['Jalan kaki di Campuhan Ridge Walk pada pukul 06.30 pagi untuk suasana tenang dan sejuk.'],
  },
  'nusa penida': {
    canonicalName: 'Nusa Penida Pulau Tebing Eksotis, Bali',
    parentRegion: 'Klungkung, Bali',
    spots: ['Kelingking T-Rex Beach', 'Broken Beach (Pasih Uug)', 'Angel’s Billabong Natural Pool', 'Crystal Bay Sunset & Snorkeling Manta Ray', 'Diamond Beach & Rumah Pohon Molenteng'],
    culinary: {
      breakfast: 'Nasi Sela Khas Klungkung & Sambal Tomat',
      lunch: 'Ikan Bakar Pantai Crystal Bay',
      dinner: 'Seafood Platter Penida Beach Lounge',
    },
    accommodation: 'MAUA Nusa Penida / Semabu Hills Hotel Nusa Penida',
    bestSeason: 'Mei - September (Laut tenang untuk menyeberang fast boat)',
    tips: ['Sewa mobil dengan supir lokal karena medan jalanan di pulau Nusa Penida cukup menantang.'],
  },
  'labuan bajo': {
    canonicalName: 'Labuan Bajo & Taman Nasional Komodo, NTT',
    parentRegion: 'Manggarai Barat, Nusa Tenggara Timur',
    spots: ['Pulau Padar Tiga Warna Teluk', 'Trekking Pulau Komodo / Rinca', 'Pink Beach Snorkeling', 'Manta Point Berenang Bersama Manta Ray', 'Goa Rangko Kolam Asin Alami', 'Sunset Bukit Sylvia'],
    culinary: {
      breakfast: 'Roti Kompiang Khas Manggarai & Kopi Flores Bajawa',
      lunch: 'Ikan Kuah Asam Khas Bajo di Kampung Ujung',
      dinner: 'Seafood Bakar Pasar Malam Kampung Ujung',
    },
    accommodation: 'AYANA Komodo Waecicu Beach / Plataran Komodo Resort',
    bestSeason: 'April - Juni & September - November (Cuaca cerah & arus laut optimal)',
    tips: ['Pilih paket liveaboard (Phinisi) 3H2M untuk pengalaman keliling pulau-pulau terbaik.'],
  },

  // ─── SUMATERA, SULAWESI & LAINNYA ───
  'bukittinggi': {
    canonicalName: 'Bukittinggi Kota Jam Gadang, Sumatera Barat',
    parentRegion: 'Sumatera Barat',
    spots: ['Jam Gadang Heritage', 'Ngarai Sianok Panorama', 'Lobang Jepang Sejarah', 'Janjang Koto Gadang (Great Wall Minang)', 'Taman Panorama Bukittinggi', 'Benteng Fort de Kock'],
    culinary: {
      breakfast: 'Katupek Pical Kapau & Kopi Kawa Daun',
      lunch: 'Nasi Kapau Los Lambuang Uni Lis',
      dinner: 'Itiak Lado Mudo Ngarai Sianok & Pisang Kapik',
    },
    accommodation: 'Grand Rocky Hotel Bukittinggi / The Balcone Hotel & Resort',
    bestSeason: 'Sepanjang Tahun (Kota sejuk di dataran tinggi Minangkabau)',
    tips: ['Cicipi Nasi Kapau asli di Los Lambuang Pasar Atas Bukittinggi.'],
  },
  'berastagi': {
    canonicalName: 'Berastagi Dataran Tinggi Karo, Sumatera Utara',
    parentRegion: 'Kabupaten Karo, Sumatera Utara',
    spots: ['Gunung Sibayak Sunrise Trekking', 'Taman Alam Lumbini Pagoda Emas', 'Air Terjun Sipiso-piso Tongging Danau Toba', 'Pasar Buah Berastagi', 'Pemandian Air Panas Sidebuk-debuk'],
    culinary: {
      breakfast: 'Bihun Bebek Berastagi & Telur Rebus',
      lunch: 'Gulai Ikan Mas Arsik Khas Karo',
      dinner: 'Jagung Bakar Manis & Wedang Bandrek Berastagi',
    },
    accommodation: 'Grand Mutiara Hotel Berastagi / Sinabung Hills Resort',
    bestSeason: 'Mei - September',
    tips: ['Beli buah markisa manis segar dan jeruk Berastagi di Pasar Buah.'],
  },
  'toraja': {
    canonicalName: 'Tana Toraja Warisan Budaya Sakral, Sulawesi Selatan',
    parentRegion: 'Tana Toraja & Toraja Utara',
    spots: ['Desa Adat Kete Kesu Tongkonan', 'Makam Tebing Batu Londa & Lemo', 'Negeri di Atas Awan Lolai Tongkonan Lempe', 'Bori Kalimbuang Menhir Megalitikum', 'Batutumonga Sawah Bertingkat'],
    culinary: {
      breakfast: 'Kopi Arabika Toraja Asli & Deppa Tori (Kue Tradisional)',
      lunch: 'Pa’piong Daging Masak Bambu Khas Toraja',
      dinner: 'Pantollo Pamarrasan Kuah Rawon Hitam Toraja',
    },
    accommodation: 'Misiliana Hotel Toraja / Toraja Heritage Hotel',
    bestSeason: 'Juli - September (Waktu puncak upacara adat Rambu Solo)',
    tips: ['Gunakan pemandu lokal berlisensi untuk memahami filosofi luhur adat Tongkonan.'],
  },
}

function resolveLocalGrounding(destination: string) {
  const knowledge = findDestinationKnowledge(destination)
  if (knowledge) return knowledge

  const norm = destination.toLowerCase().trim()
  // 1. Direct key match
  for (const [key, data] of Object.entries(INDONESIAN_LOCAL_KNOWLEDGE)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return data
    }
  }
  // 2. Token / word boundary match
  const words = norm.split(/[\s,/-]+/).filter(Boolean)
  for (const word of words) {
    if (word.length >= 4) {
      for (const [key, data] of Object.entries(INDONESIAN_LOCAL_KNOWLEDGE)) {
        if (key.includes(word) || word.includes(key)) {
          return data
        }
      }
    }
  }
  return null
}

async function findCountryData(destination: string) {
  try {
    const raw = await readFile(DESTINATIONS_FILE, 'utf-8')
    const list = JSON.parse(raw)
    if (Array.isArray(list)) {
      const match = list.find((item: { country: string; city: string }) =>
        item.country.toLowerCase().includes(destination.toLowerCase()) ||
        destination.toLowerCase().includes(item.country.toLowerCase()) ||
        item.city.toLowerCase().includes(destination.toLowerCase())
      )
      if (match) return match
    }
  } catch (err) {
    console.error('Error finding country data:', err)
  }
  return null
}

import { fetchRealPlacePhoto } from '@/lib/real-photos'

function cleanTravelTimeText(text: string): string {
  if (!text || typeof text !== 'string') return text || ''
  return text
    // Strip parenthetical travel times e.g. "(sekitar 2,5 jam dari Semarang)" or "(2 jam perjalanan dari bandara)"
    .replace(/\s*\([^)]*?\d+(?:[.,]\d+)?\s*(?:jam|menit|km)\s+(?:perjalanan\s+)?dari[^)]*\)/gi, '')
    // Strip "perjalanan sekitar 2,5 jam dari..." or "sekitar 2,5 jam dari..."
    .replace(/(?:,\s*)?(?:perjalanan\s+)?(?:sekitar\s+)?\d+(?:[.,]\d+)?\s*(?:jam|menit|km)\s+(?:perjalanan\s+)?dari\s+[^,.;\n]+/gi, '')
    // Strip "berjarak sekitar 2,5 jam dari..."
    .replace(/(?:,\s*)?berjarak\s+(?:sekitar\s+)?\d+(?:[.,]\d+)?\s*(?:jam|menit|km)\s+dari\s+[^,.;\n]+/gi, '')
    // Clean up residual standalone "2,5 jam" or "2.5 jam"
    .replace(/^\s*\d+(?:[.,]\d+)?\s*(?:jam|menit)\s*$/gi, '')
    // Clean dangling punctuation or duplicate spaces
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/^[,.;:\s-]+|[,.;:\s-]+$/g, '')
    .trim()
}

function buildDynamicActivity(
  time: string,
  placeName: string,
  destName: string,
  slot: 'morning' | 'lunch' | 'afternoon' | 'evening',
  index: number
) {
  const morningVerbs = [
    'Jalan pagi santai menikmati udara sejuk & suasana segar',
    'Hunting foto panorama alam & eksplorasi spot ikonik',
    'Eksplorasi keindahan daya tarik utama & sudut pemandangan estetik',
    'Menyusuri rimbunnya lanskap alam & menikmati udara terbuka',
  ]
  const lunchVerbs = [
    `Wisata gastronomi & santap siang menu otentik khas ${destName.split(',')[0]}`,
    'Makan siang santai mencicipi hidangan tradisional favorit warga lokal',
    'Istirahat siang & menikmati santapan lezat dengan cita rasa khas',
    'Makan siang menu pilihan di tempat makan populer sekitar area',
  ]
  const afternoonVerbs = [
    'Menjelajahi warisan budaya, keunikan arsitektur & pusat kerajinan',
    'Berburu golden hour senja & hunting foto estetik di sudut terbaik',
    'Mengunjungi spot populer & menikmati rekreasi sore hari',
    'Menikmati suasana sore yang teduh sambil melihat aktivitas warga lokal',
  ]
  const eveningVerbs = [
    `Menikmati kuliner malam, street food & suasana hangat ${destName.split(',')[0]}`,
    'Santap malam istimewa sambil menikmati kerlap-kerlip lampu kota',
    'Nongkrong santai, ngopi lokal & mencicipi jajanan malam legendaris',
    'Makan malam santai penutup hari & refleksi perjalanan menyenangkan',
  ]

  const tipsList = [
    'Datang lebih awal untuk menghindari keramaian dan dapat spot foto terbaik.',
    'Bawa kamera atau pastikan baterai smartphone terisi penuh.',
    'Gunakan pakaian dan alas kaki yang nyaman untuk berjalan kaki.',
    'Siapkan uang tunai pecahan kecil untuk parkir dan jajanan lokal.',
    'Coba tanyakan menu rekomendasi hari ini kepada penjual lokal.'
  ]

  let activityTitle = ''
  let cost = 'Rp 15.000 - Rp 35.000'

  if (slot === 'morning') {
    activityTitle = morningVerbs[index % morningVerbs.length]
    cost = 'Rp 10.000 - Rp 25.000'
  } else if (slot === 'lunch') {
    activityTitle = lunchVerbs[index % lunchVerbs.length]
    cost = 'Rp 30.000 - Rp 65.000'
  } else if (slot === 'afternoon') {
    activityTitle = afternoonVerbs[index % afternoonVerbs.length]
    cost = 'Rp 15.000 - Rp 40.000'
  } else {
    activityTitle = eveningVerbs[index % eveningVerbs.length]
    cost = 'Rp 35.000 - Rp 85.000'
  }

  return {
    time,
    activity: activityTitle,
    location: placeName,
    duration: 'Fleksibel',
    cost,
    tips: tipsList[(index + slot.length) % tipsList.length],
  }
}

const COMMON_STOPWORDS = new Set([
  'wisata', 'taman', 'pantai', 'museum', 'desa', 'benteng', 'pulau', 'hutan', 'sentra', 'alun',
  'kura', 'air', 'terjun', 'bukit', 'lembah', 'kawasan', 'pusat', 'dan', 'di', 'ke', 'dari',
  'yang', 'untuk', 'dengan', 'khas', 'pesisir', 'kota', 'kabupaten', 'provinsi', 'indonesia',
  'area', 'spot', 'jepara', 'bali', 'jogja', 'yogyakarta', 'bandung', 'malang', 'surabaya',
  'jakarta', 'kunjungan', 'menikmati', 'eksplorasi', 'tour', 'tur', 'hari', 'siang', 'sore',
  'pagi', 'malam', 'indah', 'sejuk', 'terkenal', 'populer', 'estetik', 'asli', 'lokal', 'tradisional'
])

function extractDistinctiveTokens(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !COMMON_STOPWORDS.has(t))
}

function normalizePlaceKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/(taman|pantai|museum|wisata|desa|benteng|pulau|hutan|sentra|alun-alun|kura-kura|air terjun|bukit)\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function getContextualSpotThemes(destName: string): string[] {
  const clean = destName.split(',')[0].replace(/(kabupaten|kota)\s+/i, '').trim()
  return [
    `Pantai Pesisir & Sudut Senja ${clean}`,
    `Pusat Cagar Budaya & Museum ${clean}`,
    `Sentra Seni Ukir & Kerajinan Kayu ${clean}`,
    `Pulau Eksotis & Wisata Bahari ${clean}`,
    `Hutan Wisata Pinus & Udara Sejuk ${clean}`,
    `Sentra Tenun Tradisional & Kain Tenun ${clean}`,
    `Alun-Alun Utama & Masjid Bersejarah ${clean}`,
    `Kawasan Heritage & Benteng Kolonial ${clean}`,
    `Puncak Bukit & Kebun Kopi Panorama ${clean}`,
    `Pantai Pasir Putih & Suasana Teduh ${clean}`,
    `Air Terjun Alami & Lembah Pegunungan ${clean}`,
    `Sentra Keramik Gerabah & Industri Kreatif ${clean}`,
    `Taman Rekreasi Bahari & Edukasi Samudra ${clean}`,
    `Desa Wisata Budaya & Agrowisata Buah ${clean}`,
    `Gua Alami & Tebing Pemandangan Laut ${clean}`,
    `Pusat Kuliner Tradisional & Pasar Malam ${clean}`,
    `Dermaga Perahu Tradisional & Mangrove ${clean}`,
    `Kawasan Konservasi Penyu & Terumbu Karang ${clean}`,
    `Sentra Perhiasan & Kerajinan Khas ${clean}`,
    `Pusat Cinderamata & Galeri Oleh-Oleh ${clean}`,
    `Taman Rekreasi Air & Spot Foto Estetik ${clean}`,
    `Lembah Hijau & Jalur Gowes Pedesaan ${clean}`,
    `Pasar Tradisional Pagi & Wisata Gastronomi ${clean}`,
    `Kawasan Ekowisata Pesisir & Muara ${clean}`,
    `Kawasan Santai Tepi Laut & Kafe Sunset ${clean}`,
    `Bukit Teletubbies & Hamparan Savana ${clean}`,
    `Sentra Kuliner Seafood Tepi Pantai ${clean}`,
    `Kawasan Relaksasi & Pemandian Air Alami ${clean}`,
    `Taman Kota Bunga & Sudut Santai ${clean}`,
    `Kompleks Makam Tokoh Bersejarah & Ziarah ${clean}`,
  ]
}

function buildUniquePlacesPool(destName: string, rawSpots: string[], neededCount: number): string[] {
  const pool: string[] = []
  const seen = new Set<string>()

  const add = (item: string) => {
    if (!item || typeof item !== 'string') return
    const trimmed = item.trim()
    const key = normalizePlaceKey(trimmed)
    if (key.length >= 2 && !seen.has(key)) {
      seen.add(key)
      pool.push(trimmed)
    }
  }

  for (const s of rawSpots) add(s)
  const fallbacks = getContextualSpotThemes(destName)
  for (const f of fallbacks) add(f)

  let counter = 1
  const clean = destName.split(',')[0].replace(/(kabupaten|kota)\s+/i, '').trim()
  while (pool.length < neededCount) {
    add(`Kawasan Wisata Unggulan ${clean} Area #${counter++}`)
  }

  return pool
}

function isSpotDuplicate(
  locOrText: string,
  usedLocationKeys: Set<string>,
  usedTokens: Set<string>
): boolean {
  if (!locOrText || locOrText.trim().length < 2) return true
  const normKey = normalizePlaceKey(locOrText)
  if (!normKey || normKey.length < 2) return true
  if (usedLocationKeys.has(normKey)) return true

  // Check token overlap with already visited landmarks
  const tokens = extractDistinctiveTokens(locOrText)
  for (const t of tokens) {
    if (usedTokens.has(t)) {
      return true
    }
  }

  // Check substring overlap with existing location keys
  for (const existing of usedLocationKeys) {
    if (existing.length >= 5 && normKey.length >= 5) {
      if (existing.includes(normKey) || normKey.includes(existing)) {
        return true
      }
    }
  }

  return false
}

function registerSpot(
  locOrText: string,
  usedLocationKeys: Set<string>,
  usedTokens: Set<string>
) {
  const normKey = normalizePlaceKey(locOrText)
  if (normKey) usedLocationKeys.add(normKey)
  const tokens = extractDistinctiveTokens(locOrText)
  for (const t of tokens) {
    usedTokens.add(t)
  }
}

function deduplicateItinerary(itinerary: any, destName: string, knownSpots: string[] = []): any {
  if (!itinerary || !Array.isArray(itinerary.days)) return itinerary

  const cleanDest = destName.split(',')[0].replace(/(kabupaten|kota)\s+/i, '').trim()
  const usedLocationKeys = new Set<string>()
  const usedTokens = new Set<string>()
  const usedTitles = new Set<string>()

  // Resolve hyper-local grounding spots for backup pool
  const knowledge = findDestinationKnowledge(destName)
  const localGrounding = resolveLocalGrounding(destName)
  const combinedRawSpots = [
    ...(knowledge?.spots || []),
    ...(localGrounding?.spots || []),
    ...knownSpots
  ]

  // Build a backup pool of guaranteed unique spots
  const backupPool = buildUniquePlacesPool(destName, combinedRawSpots, itinerary.days.length * 6 + 40)
  let backupCursor = 0

  const getUnusedSpot = (): string => {
    while (backupCursor < backupPool.length) {
      const spot = backupPool[backupCursor++]
      if (!isSpotDuplicate(spot, usedLocationKeys, usedTokens)) {
        registerSpot(spot, usedLocationKeys, usedTokens)
        return spot
      }
    }
    backupCursor++
    const fallbackSpot = `Destinasi Menarik ${cleanDest} #${backupCursor}`
    registerSpot(fallbackSpot, usedLocationKeys, usedTokens)
    return fallbackSpot
  }

  for (let d = 0; d < itinerary.days.length; d++) {
    const day = itinerary.days[d]
    const dayNum = day.day || (d + 1)
    let morningSpot = ''

    if (Array.isArray(day.activities)) {
      for (let a = 0; a < day.activities.length; a++) {
        const act = day.activities[a]
        const loc = act.location || ''

        if (isSpotDuplicate(loc, usedLocationKeys, usedTokens)) {
          // Duplicate detected across days or within same day — assign guaranteed unique location
          const newSpot = getUnusedSpot()
          act.location = newSpot
          // Also sanitize activity title to avoid repeating the duplicate place name
          const actTokens = extractDistinctiveTokens(act.activity || '')
          const hasDuplicateTokens = actTokens.some(t => usedTokens.has(t))
          if (hasDuplicateTokens || !act.activity) {
            act.activity = `Eksplorasi spot ikonik & keunikan ${newSpot}`
          }
        } else {
          registerSpot(loc, usedLocationKeys, usedTokens)
        }

        act.location = cleanTravelTimeText(act.location) || ''
        act.activity = cleanTravelTimeText(act.activity) || `Eksplorasi spot ikonik & keunikan ${act.location}`
        act.tips = cleanTravelTimeText(act.tips)
        act.duration = cleanTravelTimeText(act.duration)

        if (a === 0) {
          morningSpot = act.location
        }
      }
    }

    if (!morningSpot) {
      morningSpot = getUnusedSpot()
    }

    // Ensure day title is unique and doesn't repeat spots from previous days
    const titleTokens = extractDistinctiveTokens(day.title || '')
    const titleDuplicatesPrevDay = titleTokens.some(t => {
      // Check if token was used by a different spot in earlier days
      const morningTokens = new Set(extractDistinctiveTokens(morningSpot))
      return usedTokens.has(t) && !morningTokens.has(t)
    })

    const currentTitleKey = normalizePlaceKey(day.title || '')
    if (!day.title || usedTitles.has(currentTitleKey) || titleDuplicatesPrevDay || day.title.includes('undefined')) {
      day.title = `Hari ${dayNum} — Eksplorasi ${morningSpot} & Keindahan ${cleanDest}`
    } else {
      day.title = cleanTravelTimeText(day.title)
    }
    usedTitles.add(normalizePlaceKey(day.title))
  }

  if (itinerary.aiIntro) {
    itinerary.aiIntro = cleanTravelTimeText(itinerary.aiIntro)
  }
  if (Array.isArray(itinerary.travelTips)) {
    itinerary.travelTips = itinerary.travelTips.map((t: string) => cleanTravelTimeText(t)).filter(Boolean)
  }

  // Deduplicate attractions list
  if (Array.isArray(itinerary.attractions)) {
    const seenAttr = new Set<string>()
    itinerary.attractions = itinerary.attractions.filter((attr: any) => {
      if (!attr || !attr.name) return false
      const k = normalizePlaceKey(attr.name)
      if (seenAttr.has(k)) return false
      seenAttr.add(k)
      return true
    })
  }

  return itinerary
}

const MOCK_INTROS = [
  (destName: string, duration: number) =>
    `Rencana perjalanan ${duration} hari di ${destName} ini dirancang khusus dengan kombinasi spot alam, kuliner otentik, dan sudut estetik terbaik agar liburanmu berkesan!`,
  (destName: string, duration: number) =>
    `Siap menjelajahi ${destName}? Kami telah menyusun rute ${duration} hari yang efisien, santai, dan kaya pengalaman lokal tanpa rasa terburu-buru.`,
  (destName: string, duration: number) =>
    `Menikmati pesona ${destName} selama ${duration} hari jadi lebih istimewa dengan susunan aktivitas harian yang variatif dan penuh kejutan menarik.`,
  (destName: string, duration: number) =>
    `Dari panorama pagi yang menyejukkan hingga kuliner malam legendaris, ini dia itinerary ${duration} hari pilihan terbaik untuk eksplorasi ${destName}!`,
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateMockItinerary(destination: string, duration: number, countryData: any = null, realPlaces: string[] = []) {
  const knowledge = findDestinationKnowledge(destination)
  const localGrounding = knowledge || resolveLocalGrounding(destination)
  
  let destName = destination
  if (localGrounding) {
    destName = localGrounding.canonicalName
  } else if (countryData) {
    const isMulti = countryData.city.includes('&') || countryData.city.includes(',')
    destName = isMulti ? `${destination.trim()}, ${countryData.country}` : `${countryData.city}, ${countryData.country}`
  }

  const cleanDest = destName.split(',')[0].replace(/(kabupaten|kota)\s+/i, '').trim()

  // Build a 100% unique pool of spots
  const rawSpots = [
    ...(localGrounding?.spots || []),
    ...realPlaces
  ]
  const uniquePool = buildUniquePlacesPool(destName, rawSpots, duration * 4 + 20)

  let cursor = 0
  const getNextSpot = (): string => {
    if (cursor < uniquePool.length) {
      return uniquePool[cursor++]
    }
    cursor++
    return `Kawasan Wisata ${cleanDest} #${cursor}`
  }

  const intro = MOCK_INTROS[Math.floor(Math.random() * MOCK_INTROS.length)]

  const defaultAttractions = uniquePool.slice(0, 4).map((name) => ({
    name,
    description: `Destinasi ikonik dan spot favorit wajib kunjung di ${destName}.`,
    image: '',
  }))

  const days = Array.from({ length: duration }, (_, i) => {
    const dayNum = i + 1
    const morningSpot = getNextSpot()
    const afternoonSpot = getNextSpot()
    const eveningSpot = getNextSpot()

    return {
      day: dayNum,
      title: `Hari ${dayNum} — Eksplorasi ${morningSpot} & Keindahan ${cleanDest}`,
      activities: [
        buildDynamicActivity('08:30', morningSpot, destName, 'morning', dayNum),
        buildDynamicActivity('12:30', `Sentra Kuliner Khas ${cleanDest}`, destName, 'lunch', dayNum + 1),
        buildDynamicActivity('15:00', afternoonSpot, destName, 'afternoon', dayNum + 2),
        buildDynamicActivity('19:00', eveningSpot, destName, 'evening', dayNum + 3),
      ],
      meals: localGrounding && 'culinary' in localGrounding ? localGrounding.culinary : {
        breakfast: `Sarapan Khas Pagi di Sekitar ${morningSpot}`,
        lunch: `Makan Siang Menu Andalan Khas ${cleanDest}`,
        dinner: `Kuliner Malam & Santap Santai di ${eveningSpot}`,
      },
      accommodation: localGrounding && 'accommodation' in localGrounding ? localGrounding.accommodation : `Resort / Boutique Homestay Nyaman di ${destName}`,
      estimatedDailyCost: 'Rp 250.000 - Rp 450.000',
    }
  })

  return deduplicateItinerary({
    isMock: true,
    destination: destName,
    duration,
    totalEstimatedCost: localGrounding && 'totalEstimatedCost' in localGrounding ? (localGrounding as any).totalEstimatedCost : (countryData ? countryData.price : 'Rp 2.500.000 - Rp 5.000.000'),
    heroImage: countryData ? countryData.image : null,
    days,
    attractions: defaultAttractions,
    travelTips: localGrounding ? localGrounding.tips : [
      `Siapkan dokumen perjalanan untuk kunjungan ke ${countryData ? countryData.country : destination}.`,
      'Bawa mata uang lokal atau kartu pembayaran non-tunai.',
      'Gunakan pakaian yang nyaman sesuai cuaca setempat.'
    ],
    bestTimeToVisit: localGrounding ? localGrounding.bestSeason : (countryData ? 'Sepanjang Tahun (Kondisi Terbaik)' : 'April hingga Oktober'),
    localPhrases: localGrounding && 'localPhrases' in localGrounding && Array.isArray((localGrounding as any).localPhrases)
      ? (localGrounding as any).localPhrases
      : [
          { phrase: 'Matur Nuwun / Terima kasih', meaning: 'Ungkapan rasa terima kasih' },
          { phrase: 'Pinten nggih? / Berapa harganya?', meaning: 'Menanyakan harga ke penjual' },
          { phrase: 'Nyuwun sewu / Permisi', meaning: 'Ungkapan sopan santun' }
        ],
    aiIntro: intro(destName, duration),
  }, destName, rawSpots)
}

export async function POST(request: Request) {
  let destination = 'Bali'
  let duration = 3

  try {
    const body = await request.json()
    destination = body.destination || 'Bali'
    duration = Number(body.duration) || 3
    const { travelers, budget, preferences } = body

    const countryData = await findCountryData(destination)

    // 1. Resolve hyper-local search grounding & verified active places
    const groundedData = await resolveGroundingForDestination(destination)
    const realPlaces = await getOrFetchPlaces(destination)
    const placeNames = realPlaces.length > 0 ? realPlaces.map((p) => p.name) : groundedData.spots.map((s) => s.name)
    const shuffledPlaces = shuffle(realPlaces)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'placeholder' || apiKey.startsWith('AQ.')) {
      const mockResult = generateMockItinerary(destination, duration, countryData, placeNames)
      mockResult.destination = groundedData.destinationName || mockResult.destination

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actPromises = mockResult.days.flatMap((day: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        day.activities.map(async (act: any) => {
          const photoData = await fetchRealPlacePhotoWithScore(act.location, destination)
          if (photoData) {
            act.image = photoData.url
            act.accuracy = photoData.accuracy
          }
        })
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attrPromises = mockResult.attractions.map(async (attr: any) => {
        const photoData = await fetchRealPlacePhotoWithScore(attr.name, destination)
        if (photoData) {
          attr.image = photoData.url
          attr.accuracy = photoData.accuracy
        }
      })
      await Promise.all([...actPromises, ...attrPromises])

      return NextResponse.json(mockResult)
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
      },
    })

    const placeLines = shuffledPlaces.slice(0, 15).map(pl => `- ${pl.name} — ${pl.address}`).join('\n')
    const angle = CREATIVE_ANGLES[Math.floor(Math.random() * CREATIVE_ANGLES.length)]

    const prompt = `You are a world-class travel guide and hyper-local geographic expert with deep knowledge of small cities, villages, regional landmarks, public parks, subdistricts (kecamatan/kelurahan), and hidden gems across Indonesia and the world.

Target Destination / Place: "${destination}"
Duration: ${duration} days
Travelers: ${travelers} people
Budget Category: ${budget}
Preferences: ${preferences || 'general sightseeing'}
Creative Angle: emphasize ${angle}

CRITICAL ACCURACY & DYNAMIC COPYWRITING INSTRUCTIONS:
1. GEOGRAPHIC IDENTIFICATION:
   - If "${destination}" is a specific local landmark, park, neighborhood, or village (e.g. "Kebon Polo" -> located in Magelang, Central Java; "Kintamani" -> Bangli, Bali; "Dieng" -> Wonosobo/Banjarnegara; "Batu" -> Malang):
   - Accurately resolve its parent city, regency (kabupaten), province, and country.
   - Set the top-level "destination" field to a clear, professional name (e.g. "Kebon Polo & Magelang, Jawa Tengah").
2. VIVID, DIVERSE, NON-REPETITIVE ACTIVITY DESCRIPTIONS:
   - Write creative, inspiring, dynamic activity titles and descriptions. Never use boring repetitive templates like "Tur Selamat Datang" or "Makan Siang Restoran Tradisional".
   - Mention sensory details (aroma kopi lokal, hembusan angin sejuk, pemandangan sunrise, keramahan warga lokal).
3. AUTHENTIC LOCAL CULINARY & REAL ACCOMMODATIONS:
   - Suggest the exact real dishes and famous stalls (e.g. Kupat Tahu Pojok, Wedang Kacang Kebonpolo, Sop Senerek Bu Atmo).
   - Suggest real hotels / resorts in that area.
4. ABSOLUTE ZERO DUPLICATION ACROSS DAYS:
   - Every day (Day 1 through Day ${duration}) MUST feature completely unique, non-overlapping spots and activities.
   - NEVER repeat the same museum, beach, park, or tourist attraction across different days.
   - If a place was visited on Day 1, it must NEVER appear on Day 2, Day 3, or any later day.
5. NO DISTANT TRAVEL DURATION OR "X JAM DARI BLABLA":
   - STRICTLY PROHIBITED: NEVER mention travel duration or distance estimates referencing other cities, airports, or stations (e.g. NEVER write "2,5 jam dari Semarang", "2 jam perjalanan dari bandara", "X jam dari Y").
   - Focus exclusively on the experience, atmosphere, and activities at the destination itself.

Return a JSON object with this exact structure:
{
  "destination": "string (e.g. Kebon Polo & Magelang, Jawa Tengah)",
  "duration": number,
  "totalEstimatedCost": "string (e.g. Rp 1.500.000 - Rp 3.200.000)",
  "days": [
    {
      "day": number,
      "title": "string (e.g. Eksplorasi Hijau Kebonpolo, Gunung Tidar & Kuliner Legendaris)",
      "activities": [
        {
          "time": "string (e.g. 08:30)",
          "activity": "string (Specific inspiring activity title)",
          "location": "string (Exact real place name)",
          "duration": "string (e.g. Fleksibel)",
          "cost": "string (e.g. Rp 15.000 / Gratis)",
          "tips": "string (Actionable practical local tip)"
        }
      ],
      "meals": { 
        "breakfast": "string", 
        "lunch": "string", 
        "dinner": "string" 
      },
      "accommodation": "string (Real hotel / homestay name nearby)",
      "estimatedDailyCost": "string"
    }
  ],
  "attractions": [
    {
      "name": "string (Real famous nearby spot)",
      "description": "string (1-2 sentences about what makes it special)"
    }
  ],
  "aiIntro": "string (1-2 kalimat hangat dalam Bahasa Indonesia yang menyebutkan destinasi spesifik ini secara tepat dan personal)",
  "travelTips": ["string (3-5 tips praktis spesifik untuk area ini)"],
  "bestTimeToVisit": "string",
  "localPhrases": [{"phrase": "string", "meaning": "string"}]
}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let itinerary: any = null
    let lastError: unknown = null
    for (let attempt = 1; attempt <= 2 && !itinerary; attempt++) {
      try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Invalid AI response')
        itinerary = JSON.parse(jsonMatch[0])
      } catch (err) {
        lastError = err
        console.error(`Gemini itinerary attempt ${attempt} failed:`, err)
      }
    }
    if (!itinerary) throw lastError ?? new Error('AI itinerary generation failed')

    itinerary = deduplicateItinerary(itinerary, destination, placeNames)

    // Galeri attractions
    if (realPlaces.length > 0) {
      itinerary.attractions = mergePlacesIntoAttractions(shuffledPlaces)
    } else {
      itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photoPromises = itinerary.days.flatMap((day: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      day.activities.map(async (act: any) => {
        const photoData = await fetchRealPlacePhotoWithScore(act.location || act.activity, destination)
        if (photoData) {
          act.image = photoData.url
          act.accuracy = photoData.accuracy
        }
      })
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrPromises = itinerary.attractions.map(async (attr: any) => {
      const photoData = await fetchRealPlacePhotoWithScore(attr.name, destination)
      if (photoData) {
        attr.image = photoData.url
        attr.accuracy = photoData.accuracy
      }
    })
    await Promise.all([...photoPromises, ...attrPromises])

    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('AI itinerary fallback:', error)
    const dest = destination || 'Bali'
    const countryData = await findCountryData(dest)

    const realPlaces = await getOrFetchPlaces(dest)
    const realPlaceNames = shuffle(realPlaces.map(p => p.name))

    const mock = generateMockItinerary(dest, Number(duration) || 3, countryData, realPlaceNames)

    if (realPlaces.length > 0) {
      mock.attractions = mergePlacesIntoAttractions(shuffle(realPlaces))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPhotoPromises = mock.days.flatMap((day: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      day.activities.map(async (act: any) => {
        const photoData = await fetchRealPlacePhotoWithScore(act.location || act.activity, dest)
        if (photoData) {
          act.image = photoData.url
          act.accuracy = photoData.accuracy
        }
      })
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockAttrPromises = mock.attractions.map(async (attr: any) => {
      const photoData = await fetchRealPlacePhotoWithScore(attr.name, dest)
      if (photoData) {
        attr.image = photoData.url
        attr.accuracy = photoData.accuracy
      }
    })
    await Promise.all([...mockPhotoPromises, ...mockAttrPromises])

    return NextResponse.json(deduplicateItinerary(mock, dest, realPlaceNames), { status: 200 })
  }
}

