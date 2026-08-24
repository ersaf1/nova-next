import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAttractionsForDestination, mergePlacesIntoAttractions } from '@/lib/attractions'
import { getOrFetchPlaces } from '@/lib/geoapify/places-cache'
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

function buildDynamicActivity(
  time: string,
  placeName: string,
  destName: string,
  slot: 'morning' | 'lunch' | 'afternoon' | 'evening',
  index: number
) {
  const morningVerbs = [
    `Menikmati udara sejuk & jalan pagi santai di ${placeName}`,
    `Hunting foto pemandangan & menjelajahi keindahan ${placeName}`,
    `Eksplorasi spot ikonik & panorama segar ${placeName}`,
    `Menyusuri rimbunnya alam & sudut estetik di ${placeName}`,
  ]
  const lunchVerbs = [
    `Mencicipi kuliner otentik & makan siang lezat khas ${destName}`,
    `Wisata gastronomi lokal & santap siang favorit warga sekitar`,
    `Istirahat santai & menikmati hidangan tradisional khas daerah`,
    `Makan siang dengan cita rasa legendaris di sekitar ${placeName}`,
  ]
  const afternoonVerbs = [
    `Menjelajahi warisan budaya & keunikan arsitektur di ${placeName}`,
    `Berburu golden hour, bersantai & hunting foto estetik di ${placeName}`,
    `Mengunjungi pusat kerajinan, spot foto viral & daya tarik ${placeName}`,
    `Menikmati suasana sore yang teduh sambil melihat aktivitas lokal di ${placeName}`,
  ]
  const eveningVerbs = [
    `Menikmati kuliner malam, street food & suasana hangat ${placeName}`,
    `Santap malam istimewa sambil menikmati kerlap-kerlip lampu kota di ${placeName}`,
    `Nongkrong santai, ngopi lokal & mencicipi jajanan malam khas ${destName}`,
    `Makan malam santai penutup hari & refleksi liburan menyenangkan di ${placeName}`,
  ]

  const tipsList = [
    'Datang lebih awal untuk menghindari keramaian dan dapat spot foto terbaik.',
    'Bawa kamera atau pastikan baterai smartphone terisi penuh.',
    'Gunakan pakaian dan alas kaki yang nyaman untuk berjalan kaki.',
    'Siapkan uang tunai pecahan kecil untuk parkir dan jajanan lokal.',
    'Coba tanyakan menu rekomendasi hari ini kepada penjual lokal.'
  ]

  let activityTitle = ''
  let duration = '2 jam'
  let cost = 'Rp 15.000 - Rp 35.000'

  if (slot === 'morning') {
    activityTitle = morningVerbs[index % morningVerbs.length]
    duration = '2 - 3 jam'
    cost = 'Rp 10.000 - Rp 25.000'
  } else if (slot === 'lunch') {
    activityTitle = lunchVerbs[index % lunchVerbs.length]
    duration = '1.5 jam'
    cost = 'Rp 30.000 - Rp 65.000'
  } else if (slot === 'afternoon') {
    activityTitle = afternoonVerbs[index % afternoonVerbs.length]
    duration = '2.5 jam'
    cost = 'Rp 15.000 - Rp 40.000'
  } else {
    activityTitle = eveningVerbs[index % eveningVerbs.length]
    duration = '2 jam'
    cost = 'Rp 35.000 - Rp 85.000'
  }

  return {
    time,
    activity: activityTitle,
    location: placeName,
    duration,
    cost,
    tips: tipsList[(index + slot.length) % tipsList.length],
  }
}

function getMockDayData(dayNum: number, destName: string, realPlaces: string[]) {
  const p = (idx: number, fallback: string) =>
    realPlaces.length > 0 ? realPlaces[idx % realPlaces.length] : fallback

  const dayTitles = [
    `Hari ${dayNum} — Selamat Datang & Eksplorasi Ikonik ${destName}`,
    `Hari ${dayNum} — Pesona Alam, Spot Foto & Jelajah Hidden Gems`,
    `Hari ${dayNum} — Kuliner Legendaris, Budaya & Kehidupan Lokal`,
    `Hari ${dayNum} — Relaksasi, Kafe Tepi Alam & Sunset Panorama`,
    `Hari ${dayNum} — Petualangan Seru & Belanja Cinderamata Khas`,
  ]

  const spot1 = p((dayNum - 1) * 3, `${destName} Landmark`)
  const spot2 = p((dayNum - 1) * 3 + 1, `${destName} Local Spot`)
  const spot3 = p((dayNum - 1) * 3 + 2, `${destName} Night Area`)

  return {
    title: dayTitles[(dayNum - 1) % dayTitles.length],
    activities: [
      buildDynamicActivity('08:30', spot1, destName, 'morning', dayNum),
      buildDynamicActivity('12:30', `${spot1} Area`, destName, 'lunch', dayNum + 1),
      buildDynamicActivity('15:00', spot2, destName, 'afternoon', dayNum + 2),
      buildDynamicActivity('19:00', spot3, destName, 'evening', dayNum + 3),
    ],
    meals: {
      breakfast: `Sarapan Khas Pagi di Sekitar ${spot1}`,
      lunch: `Makan Siang Menu Andalan Lokal ${destName}`,
      dinner: `Kuliner Malam & Santap Santai di ${spot3}`,
    },
    accommodation: `Resort / Boutique Homestay Nyaman di ${destName}`,
    estimatedDailyCost: 'Rp 250.000 - Rp 450.000',
  }
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
  const localGrounding = resolveLocalGrounding(destination)
  const destName = localGrounding ? localGrounding.canonicalName : (countryData ? `${countryData.city}, ${countryData.country}` : destination)
  
  const allPlaces = localGrounding ? [...localGrounding.spots, ...realPlaces] : realPlaces
  const defaultAttractions = localGrounding ? localGrounding.spots.slice(0, 3).map((name) => ({
    name,
    description: `Destinasi ikonik dan spot favorit wajib kunjung di ${localGrounding.parentRegion}.`,
    image: '',
  })) : (countryData ? [
    { name: `Pemandangan & Landmark Utama ${countryData.city}`, description: countryData.tagline || countryData.description, image: countryData.image },
    { name: `Kawasan Wisata Khas ${countryData.country}`, description: `Nikmati pesona alam, kebudayaan, dan daya tarik lokal ${countryData.country}.`, image: countryData.image },
    { name: `Pusat Kuliner & Seni ${countryData.city}`, description: `Cicipi hidangan otentik dan jelajahi pusat kerajinan lokal.`, image: countryData.image }
  ] : getAttractionsForDestination(destination))

  const shuffledPlaces = shuffle(allPlaces)
  const intro = MOCK_INTROS[Math.floor(Math.random() * MOCK_INTROS.length)]

  return {
    isMock: true,
    destination: destName,
    duration,
    totalEstimatedCost: localGrounding ? 'Rp 1.200.000 - Rp 2.800.000' : (countryData ? countryData.price : 'Rp 2.500.000 - Rp 5.000.000'),
    heroImage: countryData ? countryData.image : null,
    days: Array.from({ length: duration }, (_, i) => {
      const dayNum = i + 1
      const dayData = getMockDayData(dayNum, destName, shuffledPlaces)
      return {
        day: dayNum,
        title: localGrounding ? `Hari ${dayNum} — Eksplorasi ${localGrounding.spots[i % localGrounding.spots.length]}` : dayData.title,
        activities: dayData.activities.map((act, aIdx) => ({
          ...act,
          location: localGrounding ? localGrounding.spots[(i * 2 + aIdx) % localGrounding.spots.length] : act.location,
          cost: localGrounding ? 'Rp 10.000 - Rp 25.000' : act.cost,
        })),
        meals: localGrounding ? localGrounding.culinary : dayData.meals,
        accommodation: localGrounding ? localGrounding.accommodation : dayData.accommodation,
        estimatedDailyCost: localGrounding ? 'Rp 250.000 - Rp 450.000' : 'Rp 350.000 - Rp 700.000',
      }
    }),
    attractions: defaultAttractions,
    travelTips: localGrounding ? localGrounding.tips : [
      `Siapkan dokumen perjalanan untuk kunjungan ke ${countryData ? countryData.country : destination}.`,
      'Bawa mata uang lokal atau kartu pembayaran non-tunai.',
      'Gunakan pakaian yang nyaman sesuai cuaca setempat.'
    ],
    bestTimeToVisit: localGrounding ? localGrounding.bestSeason : (countryData ? 'Sepanjang Tahun (Kondisi Terbaik)' : 'April hingga Oktober'),
    localPhrases: [
      { phrase: 'Matur Nuwun / Terima kasih', meaning: 'Ungkapan rasa terima kasih' },
      { phrase: 'Pinten nggih? / Berapa harganya?', meaning: 'Menanyakan harga ke penjual' },
      { phrase: 'Nyuwun sewu / Permisi', meaning: 'Ungkapan sopan santun' }
    ],
    aiIntro: intro(destName, duration),
  }
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

    // Ambil tempat asli Geoapify lebih dulu — dipakai untuk grounding prompt & galeri
    const realPlaces = await getOrFetchPlaces(destination)
    const shuffledPlaces = shuffle(realPlaces)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'placeholder' || apiKey.startsWith('AQ.')) {
      const mockResult = generateMockItinerary(destination, duration, countryData, shuffledPlaces.map(p => p.name))
      
      // Resolve authentic real photos for mock result
      mockResult.heroImage = await fetchRealPlacePhoto(destination, countryData?.country || '')
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actPromises = mockResult.days.flatMap((day: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        day.activities.map(async (act: any) => {
          act.image = await fetchRealPlacePhoto(act.location, destination, 'spot')
        })
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attrPromises = mockResult.attractions.map(async (attr: any) => {
        attr.image = await fetchRealPlacePhoto(attr.name, destination, 'spot')
      })
      await Promise.all([...actPromises, ...attrPromises])

      return NextResponse.json(mockResult)
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.95,
        topP: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
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
          "duration": "string (e.g. 2 jam)",
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

    // Galeri attractions
    if (realPlaces.length > 0) {
      itinerary.attractions = mergePlacesIntoAttractions(shuffledPlaces)
    } else {
      itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)
    }
    
    // Resolve authentic real photos
    itinerary.heroImage = await fetchRealPlacePhoto(destination, countryData?.country || '')

    // Resolve dynamic photos for activities and attractions
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const photoPromises = itinerary.days.flatMap((day: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        day.activities.map(async (act: any) => {
          act.image = await fetchRealPlacePhoto(act.location || act.activity, destination, 'spot')
        })
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attrPromises = itinerary.attractions.map(async (attr: any) => {
        attr.image = await fetchRealPlacePhoto(attr.name, destination, 'spot')
      })
      await Promise.all([...photoPromises, ...attrPromises])
    } catch (err) {
      console.error('Error resolving activity photos:', err)
    }

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

    mock.heroImage = await fetchRealPlacePhoto(dest, countryData?.country || '')

    // Resolve dynamic photos for activities in mock itinerary
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockPhotoPromises = mock.days.flatMap((day: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        day.activities.map(async (act: any) => {
          act.image = await fetchRealPlacePhoto(act.location || act.activity, dest, 'spot')
        })
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockAttrPromises = mock.attractions.map(async (attr: any) => {
        attr.image = await fetchRealPlacePhoto(attr.name, dest, 'spot')
      })
      await Promise.all([...mockPhotoPromises, ...mockAttrPromises])
    } catch (err) {
      console.error('Error resolving mock activity photos:', err)
    }

    return NextResponse.json(mock, { status: 200 })
  }
}

