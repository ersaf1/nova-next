export interface DayPlanTemplate {
  title: string
  activities: {
    time: string
    activity: string
    location: string
    duration: string
    cost: string
    tips: string
    category?: 'sightseeing' | 'culinary' | 'hidden-gem' | 'sunset' | 'culture'
    image?: string
  }[]
  meals: { breakfast: string; lunch: string; dinner: string }
  accommodation: string
  estimatedDailyCost: string
}

export interface DestinationKnowledge {
  canonicalName: string
  parentRegion: string
  category?: string
  totalEstimatedCost: string
  spots: string[]
  culinary: { breakfast: string; lunch: string; dinner: string }
  accommodation: string
  bestSeason: string
  tips: string[]
  localPhrases: { phrase: string; meaning: string }[]
  dayTemplates: DayPlanTemplate[]
}

export const TRAVEL_KNOWLEDGE_BASE: Record<string, DestinationKnowledge> = {
  // ─────────────────────────────────────────────────────────────
  // 1. BALI (Pulau Dewata)
  // ─────────────────────────────────────────────────────────────
  bali: {
    canonicalName: 'Pulau Bali, Indonesia',
    parentRegion: 'Provinsi Bali',
    totalEstimatedCost: 'Rp 1.800.000 - Rp 4.500.000',
    spots: [
      'Pura Luhur Uluwatu & Tari Kecak Sunset',
      'Tegalalang Rice Terraces & Alas Harum Ubud',
      'Pura Ulun Danu Beratan Bedugul',
      'Pura Tanah Lot Tabanan Sunset',
      'Sacred Monkey Forest Sanctuary Ubud',
      'Pantai Melasti Ungasan & Tebing Kapur',
      'Campuhan Ridge Walk Ubud',
      'Garuda Wisnu Kencana (GWK Cultural Park)',
      'Diamond Beach & Kelingking Nusa Penida',
      'Pura Tirta Empul Tampaksiring',
      'Kintamani Scenic Coffee Trail & View Batur',
      'Pantai Seminyak & Double Six Sunset'
    ],
    culinary: {
      breakfast: 'Nasi Ayam Kedewatan Ibu Mangku / Nasi Kuning Bali',
      lunch: 'Bebek Tepi Sawah / Bebek Bengil Crispy Duck Ubud',
      dinner: 'Seafood Bakar Khas Pantai Jimbaran & Sambal Matah'
    },
    accommodation: 'Padma Resort Ubud / Maya Sanur Resort / The Stones Hotel Legian',
    bestSeason: 'April - Oktober (Musim kemarau dengan cuaca cerah & sunset optimal)',
    tips: [
      'Gunakan kain kamen dan selendang saat memasuki area pura suci di Bali.',
      'Sewa mobil dengan supir lokal atau rental motor untuk mobilitas praktis antar kawasan.',
      'Saksikan Tari Kecak di Uluwatu menjelang sunset sekitar pukul 17:45 WITA (pesan tiket lebih awal).',
      'Cicipi hidangan otentik seperti Ayam Betutu, Nasi Campur Bali, dan Sate Lilit Ikan khas Bali.'
    ],
    localPhrases: [
      { phrase: 'Om Swastyastu', meaning: 'Salam panganjali khas Bali / Halo / Selamat' },
      { phrase: 'Matur Suksma', meaning: 'Terima kasih banyak' },
      { phrase: 'Mewali', meaning: 'Sama-sama / Kembali' },
      { phrase: 'Kuda niki?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Nunas lugra', meaning: 'Permisi / Mohon izin' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Eksplorasi Seni, Sawah Bertingkat & Hutan Monyet Ubud',
        activities: [
          {
            time: '08:30',
            activity: 'Menyusuri bukit asri & jalan pagi santai di Campuhan Ridge Walk',
            location: 'Campuhan Ridge Walk Ubud',
            duration: '2 jam',
            cost: 'Gratis',
            tips: 'Mulai pagi hari pukul 06:30 - 08:30 agar udara sejuk dan suasana tenang.'
          },
          {
            time: '11:00',
            activity: 'Melihat kera sakral & menjelajahi hutan asri Sacred Monkey Forest',
            location: 'Sacred Monkey Forest Sanctuary Ubud',
            duration: '1.5 jam',
            cost: 'Rp 80.000',
            tips: 'Simpan kacamata, topi, dan perhiasan di dalam tas untuk keamanan.'
          },
          {
            time: '12:45',
            activity: 'Santap siang kuliner legendaris Bebek Goreng Renyah di tepi sawah',
            location: 'Bebek Tepi Sawah Ubud',
            duration: '1.5 jam',
            cost: 'Rp 120.000 - Rp 180.000',
            tips: 'Pilih tempat duduk gazebo bambu menghadap hamparan sawah hijau.'
          },
          {
            time: '14:30',
            activity: 'Hunting foto panorama terasering sawah hijau di Tegalalang & Alas Harum',
            location: 'Tegalalang Rice Terraces & Alas Harum Ubud',
            duration: '2.5 jam',
            cost: 'Rp 50.000',
            tips: 'Coba wahana swing atau jalan di pematang sawah dengan alas kaki anti selip.'
          },
          {
            time: '18:30',
            activity: 'Jalan santai di Pasar Seni Tradisional Ubud & makan malam kuliner lokal',
            location: 'Pasar Seni Ubud & Puri Saren Agung',
            duration: '2 jam',
            cost: 'Rp 45.000 - Rp 95.000',
            tips: 'Tawar dengan ramah dan sopan saat berbelanja kerajinan anyaman dan lukisan.'
          }
        ],
        meals: {
          breakfast: 'Nasi Ayam Kedewatan Ibu Mangku Asli Gianyar',
          lunch: 'Bebek Crispy Tepi Sawah & Sambal Matah',
          dinner: 'Nasi Campur Bali Sukawati & Es Kelapa Muda'
        },
        accommodation: 'Resort / Boutique Villa Bernuansa Tropis di Ubud',
        estimatedDailyCost: 'Rp 350.000 - Rp 650.000'
      },
      {
        title: 'Hari 2 — Kemegahan Tebing Kapur, Pantai Melasti & Sunset Tari Kecak Uluwatu',
        activities: [
          {
            time: '09:00',
            activity: 'Menikmati birunya laut & jalan santai di Pantai Melasti Ungasan',
            location: 'Pantai Melasti Ungasan',
            duration: '2.5 jam',
            cost: 'Rp 15.000',
            tips: 'Spot foto jalan tebing kapur membelah bukit sangat estetik di pagi hari.'
          },
          {
            time: '12:30',
            activity: 'Makan siang santai menu nusantara & seafood khas Bali Selatan',
            location: 'Restoran Pesisir Jimbaran Selatan',
            duration: '1.5 jam',
            cost: 'Rp 65.000 - Rp 120.000',
            tips: 'Nikmati kelapa muda segar penyejuk dahaga di terik siang hari.'
          },
          {
            time: '14:30',
            activity: 'Mengagumi kemegahan patung mahakarya Garuda Wisnu Kencana (GWK)',
            location: 'Garuda Wisnu Kencana (GWK Cultural Park)',
            duration: '2.5 jam',
            cost: 'Rp 125.000',
            tips: 'Gunakan shuttle buggie jika tidak ingin berjalan terlalu jauh antar plaza.'
          },
          {
            time: '17:30',
            activity: 'Menyaksikan matahari terbenam spektakuler & pementasan Tari Kecak Uluwatu',
            location: 'Pura Luhur Uluwatu',
            duration: '2 jam',
            cost: 'Rp 50.000 (Pura) + Rp 150.000 (Kecak)',
            tips: 'Ambil tempat duduk tribun tengah atas untuk sudut pandang panggung dan laut terbaik.'
          },
          {
            time: '19:45',
            activity: 'Makan malam romantis BBQ Seafood bakar di atas pasir Pantai Jimbaran',
            location: 'Pantai Jimbaran Seafood',
            duration: '2 jam',
            cost: 'Rp 150.000 - Rp 300.000',
            tips: 'Pilih paket seafood komplit ikan bakar, udang bakar madu, dan cumi saus padang.'
          }
        ],
        meals: {
          breakfast: 'Smoothie Bowl Buah Tropis Segar di Kafe Lokal',
          lunch: 'Ikan Bakar Sambal Bongkot & Sayur Urap',
          dinner: 'Candlelight BBQ Seafood Jimbaran'
        },
        accommodation: 'Resort Tepi Pantai di Kawasan Jimbaran / Kuta Selatan',
        estimatedDailyCost: 'Rp 500.000 - Rp 950.000'
      },
      {
        title: 'Hari 3 — Pura Terapung Danau Beratan Bedugul & Sunset Ikonik Pura Tanah Lot',
        activities: [
          {
            time: '08:30',
            activity: 'Menikmati udara sejuk pegunungan & pura terapung di Danau Beratan',
            location: 'Pura Ulun Danu Beratan Bedugul',
            duration: '2 jam',
            cost: 'Rp 40.000',
            tips: 'Bawa jaket ringan karena udara Bedugul cukup sejuk di pagi hari.'
          },
          {
            time: '11:00',
            activity: 'Hunting foto di gerbang megah khas Bali di Handara Iconic Gate',
            location: 'Handara Golf & Resort Iconic Gate',
            duration: '1 jam',
            cost: 'Rp 30.000',
            tips: 'Antrean foto bergerak cukup cepat, siapkan pose terbaik Anda.'
          },
          {
            time: '12:30',
            activity: 'Makan siang santap menu lokal & mencicipi stroberi segar Bedugul',
            location: 'Restoran Panorama Danau Beratan',
            duration: '1.5 jam',
            cost: 'Rp 50.000 - Rp 90.000',
            tips: 'Coba jus stroberi petik segar khas perkebunan Bedugul.'
          },
          {
            time: '16:00',
            activity: 'Menyaksikan siluet magis matahari terbenam di atas batu karang Tanah Lot',
            location: 'Pura Tanah Lot Tabanan',
            duration: '2.5 jam',
            cost: 'Rp 30.000',
            tips: 'Datang saat air laut mulai surut untuk dapat mendekat ke area sumber air suci.'
          },
          {
            time: '19:30',
            activity: 'Makan malam kuliner Ayam Betutu kuah rempah legendaris khas Bali',
            location: 'Ayam Betutu Khas Gilimanuk / Bali',
            duration: '1.5 jam',
            cost: 'Rp 45.000 - Rp 80.000',
            tips: 'Tingkat pedas sambal matah dan sambal embe bisa disesuaikan dengan selera.'
          }
        ],
        meals: {
          breakfast: 'Nasi Kuning Bali & Telur Bumbu Bali',
          lunch: 'Ayam Goreng Sambal Matah & Sayur Plecing',
          dinner: 'Ayam Betutu Kuah Pedas Rempah & Plecing Kangkung'
        },
        accommodation: 'Hotel / Resort Nyaman di Area Canggu / Seminyak',
        estimatedDailyCost: 'Rp 300.000 - Rp 600.000'
      },
      {
        title: 'Hari 4 — Eksplorasi Pulau Nusa Penida & Tebing T-Rex Kelingking Beach',
        activities: [
          {
            time: '07:30',
            activity: 'Menyeberang dengan Fast Boat dari Pelabuhan Sanur menuju Nusa Penida',
            location: 'Pelabuhan Sanur ke Nusa Penida',
            duration: '1 jam',
            cost: 'Rp 100.000 - Rp 150.000 (PP)',
            tips: 'Gunakan celana pendek dan sandal jepit karena naik boat langsung dari bibir pantai.'
          },
          {
            time: '09:30',
            activity: 'Menyaksikan panorama tebing mahakarya T-Rex di Kelingking Beach',
            location: 'Kelingking Beach T-Rex Cliff Nusa Penida',
            duration: '2 jam',
            cost: 'Rp 10.000',
            tips: 'Berfoto dari gardu pandang atas tebing; jalur turun ke pantai sangat terjal.'
          },
          {
            time: '12:30',
            activity: 'Makan siang ikan bakar segar kelapa muda di resto pulau Penida',
            location: 'Resto Lokal Nusa Penida Barat',
            duration: '1.5 jam',
            cost: 'Rp 50.000 - Rp 85.000',
            tips: 'Isi tenaga dan minum air putih secukupnya di cuaca pesisir tropis.'
          },
          {
            time: '14:00',
            activity: 'Menikmati kolam alami Broken Beach (Pasih Uug) & Angel’s Billabong',
            location: 'Broken Beach & Angel’s Billabong Nusa Penida',
            duration: '2 jam',
            cost: 'Rp 10.000',
            tips: 'Waspadai ombak saat mendekati bibir tebing karang Angel’s Billabong.'
          },
          {
            time: '17:00',
            activity: 'Kembali dengan boat ke Sanur & santap malam seafood segar Sanur',
            location: 'Pantai Sanur & Pusat Kuliner Malam',
            duration: '2 jam',
            cost: 'Rp 60.000 - Rp 120.000',
            tips: 'Beli suvenir kain pantai khas Bali di kios pelabuhan.'
          }
        ],
        meals: {
          breakfast: 'Roti Panggang & Kopi Bali di Sanur',
          lunch: 'Ikan Karang Bakar Pedas Manis Nusa Penida',
          dinner: 'Sup Ikan Mak Beng Sanur / Seafood Pesisir'
        },
        accommodation: 'Boutique Hotel di Kawasan Sanur / Denpasar Selatan',
        estimatedDailyCost: 'Rp 450.000 - Rp 850.000'
      },
      {
        title: 'Hari 5 — Kintamani Coffee Trail & Desa Wisata Terbersih Penglipuran',
        activities: [
          {
            time: '08:30',
            activity: 'Mengunjungi Desa Wisata Tradisional Penglipuran yang asri dan bersih',
            location: 'Desa Wisata Penglipuran Bangli',
            duration: '2 jam',
            cost: 'Rp 25.000',
            tips: 'Cicipi minuman khas herbal Loloh Cemcem yang segar dan menyehatkan.'
          },
          {
            time: '11:00',
            activity: 'Ngopi santai di kafe tebing Kintamani dengan view Gunung & Danau Batur',
            location: 'Kintamani Coffee Trail (Akasa / Montana del Cafe)',
            duration: '2 jam',
            cost: 'Rp 40.000 - Rp 80.000',
            tips: 'Duduk di balkon luar untuk mendapatkan latar megah Gunung Batur berkabut tipis.'
          },
          {
            time: '13:00',
            activity: 'Makan siang Ikan Mujair Nyat-Nyat bumbu khas Danau Batur',
            location: 'Restoran Apung Danau Batur Kintamani',
            duration: '1.5 jam',
            cost: 'Rp 45.000 - Rp 85.000',
            tips: 'Padukan dengan sambal matah dan nasi putih hangat.'
          },
          {
            time: '15:30',
            activity: 'Melakukan ritual pembersihan diri di mata air suci Pura Tirta Empul',
            location: 'Pura Tirta Empul Tampaksiring',
            duration: '2 jam',
            cost: 'Rp 30.000',
            tips: 'Sewa kain kamen khusus melukat jika ingin mencoba ritual siraman air suci.'
          },
          {
            time: '18:30',
            activity: 'Makan malam santai suasana alam Gianyar & belanja pie susu Bali',
            location: 'Gianyar & Sentra Oleh-Oleh Khas Bali',
            duration: '1.5 jam',
            cost: 'Rp 50.000 - Rp 100.000',
            tips: 'Beli Pie Susu Asli Enaaak atau Kacang Bali untuk buah tangan.'
          }
        ],
        meals: {
          breakfast: 'Kopi Arabika Kintamani & Pisang Goreng Keju',
          lunch: 'Mujair Nyat-Nyat Khas Kintamani Bumbu Kuning',
          dinner: 'Sate Lilit Ayam & Nasi Urap Gianyar'
        },
        accommodation: 'Resort Pemandangan Lembah di Ubud / Kintamani Glamping',
        estimatedDailyCost: 'Rp 300.000 - Rp 600.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 2. YOGYAKARTA / JOGJA
  // ─────────────────────────────────────────────────────────────
  yogyakarta: {
    canonicalName: 'DI Yogyakarta & Candi Warisan Dunia, Indonesia',
    parentRegion: 'Daerah Istimewa Yogyakarta',
    totalEstimatedCost: 'Rp 1.200.000 - Rp 3.200.000',
    spots: [
      'Candi Prambanan Kompleks Warisan UNESCO',
      'Keraton Ngayogyakarta Hadiningrat',
      'Taman Sari Water Castle Heritage',
      'Jalan Malioboro & Titik Nol Kilometer',
      'Candi Borobudur Sunrise',
      'HeHa Sky View Patuk & Puncak Segoro',
      'Goa Jomblang Vertical Caving',
      'Tebing Breksi Sleman',
      'Pantai Parangtritis & Gumuk Pasir'
    ],
    culinary: {
      breakfast: 'Gudeg Yu Djum Wijilan & Telur Areh Gurih',
      lunch: 'Mangut Lele Mbah Marto Asli Sewon',
      dinner: 'Bakmi Jawa Mbah Gito Kotagede & Wedang Ronde'
    },
    accommodation: 'The Phoenix Hotel Yogyakarta / Hotel Tentrem Yogyakarta / Royal Ambarrukmo',
    bestSeason: 'Mei - Oktober (Musim kemarau dengan cuaca cerah untuk wisata candi)',
    tips: [
      'Beli tiket terusan candi atau pesan tiket secara online untuk Candi Borobudur & Prambanan.',
      'Gunakan transportasi Trans Jogja atau taksi online untuk mobilitas nyaman di pusat kota.',
      'Sempatkan jalan santai di Malioboro pada malam hari untuk menikmati musisi jalanan dan kuliner lesehan.'
    ],
    localPhrases: [
      { phrase: 'Matur Nuwun', meaning: 'Terima kasih banyak' },
      { phrase: 'Pinten nggih?', meaning: 'Berapa harganya ya?' },
      { phrase: 'Nyuwun sewu', meaning: 'Permisi / Maaf' },
      { phrase: 'Monggo', meaning: 'Silakan' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Sejarah Keraton, Taman Sari & Suasana Malam Malioboro',
        activities: [
          {
            time: '08:30',
            activity: 'Menjelajahi arsitektur luhur & pusaka Keraton Ngayogyakarta Hadiningrat',
            location: 'Keraton Ngayogyakarta Hadiningrat',
            duration: '2 jam',
            cost: 'Rp 15.000',
            tips: 'Sewa pemandu abdi dalem untuk mendengarkan kisah sejarah filosofis Keraton.'
          },
          {
            time: '11:00',
            activity: 'Menyusuri lorong bawah tanah & kolam pemandian Taman Sari',
            location: 'Taman Sari Water Castle',
            duration: '1.5 jam',
            cost: 'Rp 15.000',
            tips: 'Kunjungi Masjid Bawah Tanah Sumur Gumuling untuk spot foto arsitektur unik.'
          },
          {
            time: '12:45',
            activity: 'Makan siang Gudeg legendaris manis gurih di sentra Wijilan',
            location: 'Gudeg Yu Djum Wijilan 167',
            duration: '1.5 jam',
            cost: 'Rp 35.000 - Rp 65.000',
            tips: 'Pesan gudeg komplit krecek pedas gurih, telur areh, dan ayam kampung suwir.'
          },
          {
            time: '15:00',
            activity: 'Belanja kerajinan perak & jalan santai di gang bersejarah Kotagede',
            location: 'Kawasan Wisata Heritage Kotagede',
            duration: '2.5 jam',
            cost: 'Gratis',
            tips: 'Kunjungi rumah tradisional joglo dan cicipi kue Kembang Waru khas Kotagede.'
          },
          {
            time: '18:30',
            activity: 'Jalan malam di Malioboro, Teras Malioboro & Titik Nol Kilometer',
            location: 'Jalan Malioboro & Titik Nol KM',
            duration: '2.5 jam',
            cost: 'Gratis',
            tips: 'Nikmati wedang ronde hangat dan kopi joss arang menyala di sekitar stasiun Tugu.'
          }
        ],
        meals: {
          breakfast: 'Soto Kadipiro Asli / Soto Lenthok',
          lunch: 'Gudeg Wijilan Komplit Krecek & Tahu Bacem',
          dinner: 'Bakmi Jawa Godhog Mbah Gito Kotagede'
        },
        accommodation: 'Hotel Heritage Bersejarah di Pusat Kota Yogyakarta',
        estimatedDailyCost: 'Rp 200.000 - Rp 450.000'
      },
      {
        title: 'Hari 2 — Kemegahan Candi Prambanan, Tebing Breksi & Sunset HeHa Sky View',
        activities: [
          {
            time: '08:30',
            activity: 'Mengagumi relief epik kisah Ramayana di Candi Prambanan',
            location: 'Candi Prambanan UNESCO World Heritage',
            duration: '2.5 jam',
            cost: 'Rp 50.000',
            tips: 'Kunjungi juga Candi Sewu yang berada dalam satu kompleks taman candi.'
          },
          {
            time: '11:45',
            activity: 'Makan siang Mangut Lele asap khas pedas gurih legendaris',
            location: 'Mangut Lele Mbah Marto Sewon Bantul',
            duration: '1.5 jam',
            cost: 'Rp 30.000 - Rp 50.000',
            tips: 'Ambil makanan langsung di dapur pawon tradisional kayu bakar Mbah Marto.'
          },
          {
            time: '14:00',
            activity: 'Hunting foto ukiran tebing kapur artistik di Tebing Breksi',
            location: 'Taman Wisata Tebing Breksi Sambirejo',
            duration: '2 jam',
            cost: 'Rp 10.000',
            tips: 'Naik ke puncak tebing untuk melihat panorama Candi Prambanan dari kejauhan.'
          },
          {
            time: '16:30',
            activity: 'Menikmati sunset golden hour & lampu kota berkilau di HeHa Sky View',
            location: 'HeHa Sky View Patuk Gunungkidul',
            duration: '2.5 jam',
            cost: 'Rp 25.000 - Rp 35.000',
            tips: 'Spot balon udara dan sky bridge sangat cantik saat senja mulai temaram.'
          },
          {
            time: '19:30',
            activity: 'Makan malam kuliner Sate Klatak daging kambing empuk tusuk jeruji besi',
            location: 'Sate Klatak Pak Pong Imogiri',
            duration: '1.5 jam',
            cost: 'Rp 40.000 - Rp 75.000',
            tips: 'Padukan sate klatak dengan kuah gulai gurih beraroma rempah.'
          }
        ],
        meals: {
          breakfast: 'Bubur Ayam Syarifah / Nasi Uduk Palagan',
          lunch: 'Mangut Lele Asap Bumbu Pedas Mbah Marto',
          dinner: 'Sate Klatak Pak Pong & Tongseng Kambing'
        },
        accommodation: 'Resort View Bukit Patuk / Hotel Bintang 4 Sleman',
        estimatedDailyCost: 'Rp 250.000 - Rp 550.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 3. BANDUNG
  // ─────────────────────────────────────────────────────────────
  bandung: {
    canonicalName: 'Kota Bandung & Kawasan Lembang Ciwidey, Jawa Barat',
    parentRegion: 'Bandung Raya, Jawa Barat',
    totalEstimatedCost: 'Rp 1.400.000 - Rp 3.500.000',
    spots: [
      'Kawah Putih Ciwidey & Danau Kawah Belerang',
      'Taman Hutan Raya Ir. H. Djuanda (Tahura Dago)',
      'Orchid Forest Cikole Lembang',
      'Jalan Braga Heritage & Gedung Merdeka',
      'Ranca Upas Penangkaran Rusa Ciwidey',
      'Dusun Bambu Family Leisure Park',
      'Saung Angklung Udjo',
      'Farmhouse Susu Lembang'
    ],
    culinary: {
      breakfast: 'Lontong Kari Kebon Karet / Surabi Cihapit',
      lunch: 'Nasi Timbel Bawean Komplit & Ayam Goreng Serundeng',
      dinner: 'Iga Bakar Si Jangkung & Es Cendol Elizabeth'
    },
    accommodation: 'Padma Hotel Bandung / The Gaia Hotel Bandung / Art Deco Luxury Hotel',
    bestSeason: 'Sepanjang Tahun (Udara sejuk 18°C-24°C, hindari weekend macet)',
    tips: [
      'Gunakan Whoosh (Kereta Cepat) dari Jakarta ke Stasiun Padalarang untuk perjalanan cepat 30 menit.',
      'Bawa jaket hangat jika berencana mengunjungi Kawah Putih Ciwidey atau Tangkuban Perahu.'
    ],
    localPhrases: [
      { phrase: 'Hatur Nuhun', meaning: 'Terima kasih banyak' },
      { phrase: 'Sabaraha ieu?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Punten', meaning: 'Permisi / Maaf' },
      { phrase: 'Mangga', meaning: 'Silakan' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Sejarah Jalan Braga, Kafe Estetik & Saung Angklung Udjo',
        activities: [
          {
            time: '08:30',
            activity: 'Jalan santai menikmati gedung kolonial Art Deco di Jalan Braga',
            location: 'Jalan Braga & Gedung Merdeka KAA',
            duration: '2 jam',
            cost: 'Gratis',
            tips: 'Mampir ke toko roti legendaris Sumber Hidangan sejak 1929.'
          },
          {
            time: '11:00',
            activity: 'Ngopi santai & hunting foto di kafe heritage Jalan Braga',
            location: 'Kawasan Heritage Braga',
            duration: '1.5 jam',
            cost: 'Rp 35.000 - Rp 65.000',
            tips: 'Cicipi kopi aroma asli Bandung Banceuy yang harum semerbak.'
          },
          {
            time: '12:45',
            activity: 'Makan siang Nasi Timbel komplit lalapan, sambal terasi & sayur asem',
            location: 'Nasi Timbel Bawean Bandung',
            duration: '1.5 jam',
            cost: 'Rp 40.000 - Rp 70.000',
            tips: 'Ayam goreng serundeng dan tahu tempe gorengnya sangat renyah.'
          },
          {
            time: '15:00',
            activity: 'Menyaksikan pertunjukan musik bambu interaktif Saung Angklung Udjo',
            location: 'Saung Angklung Udjo Padasuka',
            duration: '2.5 jam',
            cost: 'Rp 85.000',
            tips: 'Pengunjung diajak memainkan angklung bersama membentuk harmoni lagu.'
          },
          {
            time: '18:30',
            activity: 'Makan malam Iga Bakar cobek hangat dengan taburan cabai rawit gurih',
            location: 'Iga Bakar Si Jangkung Cipaganti',
            duration: '1.5 jam',
            cost: 'Rp 50.000 - Rp 95.000',
            tips: 'Daging iga sapi disajikan tanpa tulang di atas cobek tanah liat panas mendidih.'
          }
        ],
        meals: {
          breakfast: 'Surabi Cihapit Oncom Pedas / Keju Cokelat',
          lunch: 'Nasi Timbel Komplit Sambal Terasi',
          dinner: 'Iga Bakar Si Jangkung & Es Cendol Elizabeth'
        },
        accommodation: 'Boutique Hotel Bergaya Art Deco di Pusat Kota Bandung',
        estimatedDailyCost: 'Rp 250.000 - Rp 500.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 4. JAKARTA
  // ─────────────────────────────────────────────────────────────
  jakarta: {
    canonicalName: 'DKI Jakarta & Kawasan Kota Tua Heritage, Indonesia',
    parentRegion: 'DKI Jakarta',
    totalEstimatedCost: 'Rp 1.500.000 - Rp 4.000.000',
    spots: [
      'Monumen Nasional (Monas) & Puncak Cawan',
      'Kawasan Kota Tua & Museum Fatahillah',
      'Pantjoran PIK & Cove at Batavia PIK',
      'Taman Mini Indonesia Indah (TMII Baru)',
      'Dunia Fantasi (Dufan) Ancol',
      'Gedung Sarinah & Galeri Seni Budaya',
      'Bundaran HI & Skydeck Halte Tosari'
    ],
    culinary: {
      breakfast: 'Bubur Ayam Kwang Tung / Ketoprak Ciragil',
      lunch: 'Soto Betawi H. Husein Manggarai Daging Kuah Santan Susu',
      dinner: 'Nasi Uduk Kebon Kacang Puas Hati & Asinan Betawi'
    },
    accommodation: 'Hotel Indonesia Kempinski / The Dharmawangsa / Aloft Jakarta Wahid Hasyim',
    bestSeason: 'Sepanjang Tahun (Bisa menggunakan MRT, LRT & TransJakarta praktis)',
    tips: [
      'Gunakan kartu e-money atau QRIS JakLingko untuk naik MRT, LRT, dan TransJakarta tanpa repot.',
      'Sewa sepeda onthel warna-warni di Plaza Fatahillah Kota Tua untuk keliling bangunan kolonial.'
    ],
    localPhrases: [
      { phrase: 'Makasih ya!', meaning: 'Terima kasih (Bahasa Betawi/Jakarta)' },
      { phrase: 'Berapaan nih bang/mpok?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Permisi / Numpang tanya', meaning: 'Permisi' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Ikon Monas, Museum Fatahillah Kota Tua & Sunset PIK',
        activities: [
          {
            time: '08:30',
            activity: 'Melihat panorama Jakarta dari puncak Monas & museum cawan kemerdekaan',
            location: 'Monumen Nasional (Monas)',
            duration: '2 jam',
            cost: 'Rp 15.000 - Rp 25.000',
            tips: 'Datang pagi untuk antrean lift puncak yang lebih lancar.'
          },
          {
            time: '11:00',
            activity: 'Menjelajahi arsitektur kolonial & naik sepeda onthel di Kota Tua',
            location: 'Museum Sejarah Jakarta (Fatahillah)',
            duration: '2 jam',
            cost: 'Rp 5.000',
            tips: 'Sewa topi laken khas noni Belanda saat berfoto dengan sepeda onthel.'
          },
          {
            time: '13:00',
            activity: 'Makan siang Soto Betawi kuah santan gurih legendaris',
            location: 'Soto Betawi H. Husein Manggarai',
            duration: '1.5 jam',
            cost: 'Rp 40.000 - Rp 65.000',
            tips: 'Pesan daging campur paru goreng renyah yang sangat gurih.'
          },
          {
            time: '16:00',
            activity: 'Jalan santai tepi laut & kulineran estetik di Pantjoran PIK',
            location: 'Pantjoran PIK & Cove at Batavia',
            duration: '2.5 jam',
            cost: 'Gratis',
            tips: 'Spot pagoda raksasa dan jembatan tepi laut sangat estetik saat senja.'
          }
        ],
        meals: {
          breakfast: 'Ketoprak Ciragil Bumbu Kacang Medok',
          lunch: 'Soto Betawi Daging & Emping Renyah',
          dinner: 'Nasi Uduk Kebon Kacang & Ayam Goreng Kampung'
        },
        accommodation: 'Hotel Bintang 4 di Kawasan Thamrin / Senayan',
        estimatedDailyCost: 'Rp 300.000 - Rp 650.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 5. BOGOR & PUNCAK (Kota Hujan & Kawasan Sejuk)
  // ─────────────────────────────────────────────────────────────
  bogor: {
    canonicalName: 'Kota & Kabupaten Bogor Kota Hujan, Jawa Barat',
    parentRegion: 'Bogor & Puncak, Jawa Barat',
    totalEstimatedCost: 'Rp 1.000.000 - Rp 2.600.000',
    spots: [
      'Kebun Raya Bogor & Istana Kepresidenan',
      'Sentra Kuliner Suryakencana Bogor',
      'Agrowisata Gunung Mas Puncak Pass',
      'Taman Wisata Alam Curug Nangka Ciapus',
      'Taman Safari Indonesia Cisarua',
      'Curug Leuwi Hejo Sentul City',
      'Kawasan Wisata Puncak Pass & Kafe Tebing',
      'Sentra Oleh-Oleh Asinan Gedung Dalam & Roti Unyil Venus'
    ],
    culinary: {
      breakfast: 'Doclang Mantarena Bumbu Kacang Kental & Teh Hangat',
      lunch: 'Soto Kuning Pak Yusup Suryakencana & Ngo Hiang Khas Bogor',
      dinner: 'Toge Goreng Ibu Hj. Omah & Asinan Gedung Dalam Bogor Asli'
    },
    accommodation: 'The Alana Hotel Sentul City / Royal Tulip Gunung Geulis / Novotel Bogor',
    bestSeason: 'Sepanjang Tahun (Pagi hari bebas hujan untuk jalan santai di Kebun Raya)',
    tips: [
      'Bawa payung lipat atau jas hujan ringan karena Bogor sering diguyur hujan rintik di sore hari.',
      'Kunjungi Kebun Raya Bogor di pagi hari pukul 07:30 - 10:30 untuk udara sejuk dan spot foto jembatan merah asri.',
      'Cicipi kuliner legendaris di sepanjang Jalan Suryakencana seperti Soto Kuning dan Roti Unyil Venus.'
    ],
    localPhrases: [
      { phrase: 'Hatur Nuhun', meaning: 'Terima kasih banyak' },
      { phrase: 'Sabaraha ieu mang/teh?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Punten', meaning: 'Permisi / Maaf' },
      { phrase: 'Mangga', meaning: 'Silakan' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Pesona Hijau Kebun Raya Bogor, Rusa Istana & Kuliner Suryakencana',
        activities: [
          {
            time: '08:00',
            activity: 'Jalan santai menikmati pepohonan raksasa & Danau Gunting',
            location: 'Kebun Raya Bogor & Istana Kepresidenan',
            duration: '3 jam',
            cost: 'Rp 15.500 - Rp 25.500',
            tips: 'Sewa sepeda listrik atau jalan kaki melintasi jembatan merah dan taman anggrek.'
          },
          {
            time: '11:30',
            activity: 'Melihat kawanan rusa tutul jinak di halaman Istana Bogor',
            location: 'Pagar Luar Istana Kepresidenan Bogor',
            duration: '1 jam',
            cost: 'Gratis',
            tips: 'Bisa membeli wortel dari pedagang sekitar untuk memberi makan rusa tutul.'
          },
          {
            time: '12:45',
            activity: 'Makan siang Soto Kuning daging empuk kuah santan kuning gurih',
            location: 'Soto Kuning Pak Yusup Jalan Suryakencana',
            duration: '1.5 jam',
            cost: 'Rp 35.000 - Rp 65.000',
            tips: 'Pilih potongan daging sapi, perkedel hangat, dan emping renyah.'
          },
          {
            time: '14:30',
            activity: 'Berburu oleh-oleh legendaris Roti Unyil Venus & Asinan Bogor',
            location: 'Sentra Oleh-Oleh Asinan Gedung Dalam & Roti Unyil',
            duration: '2 jam',
            cost: 'Rp 40.000 - Rp 90.000',
            tips: 'Asinan buah dan asinan sayur dengan kuah cuka asam manis pedas sangat menyegarkan.'
          },
          {
            time: '18:00',
            activity: 'Santap malam Toge Goreng gurih dengan siraman bumbu tauco oncom',
            location: 'Toge Goreng Ibu Hj. Omah Suryakencana',
            duration: '1.5 jam',
            cost: 'Rp 25.000 - Rp 45.000',
            tips: 'Disajikan hangat dengan ketupat, tahu kuning, dan kerupuk mie.'
          }
        ],
        meals: {
          breakfast: 'Doclang Mantarena Bumbu Kacang Kental',
          lunch: 'Soto Kuning Daging Sapi Pak Yusup & Perkedel',
          dinner: 'Toge Goreng Tauco & Asinan Buah Segar'
        },
        accommodation: 'Hotel Nyaman Bernuansa Hijau di Pusat Kota Bogor',
        estimatedDailyCost: 'Rp 200.000 - Rp 450.000'
      },
      {
        title: 'Hari 2 — Udara Sejuk Puncak, Wisata Alam Curug & Kebun Teh Gunung Mas',
        activities: [
          {
            time: '08:30',
            activity: 'Tea Walk jalan pagi di tengah hamparan hijau kebun teh pegunungan',
            location: 'Agrowisata Gunung Mas Puncak Pass',
            duration: '2.5 jam',
            cost: 'Rp 20.000',
            tips: 'Berjalan di atas jembatan kayu tea bridge yang membentang di atas kebun teh.'
          },
          {
            time: '11:30',
            activity: 'Menikmati gemercik air jernih & kolam alami di Curug Nangka',
            location: 'Taman Wisata Alam Curug Nangka Ciapus',
            duration: '2 jam',
            cost: 'Rp 25.000',
            tips: 'Gunakan sandal gunung anti licin untuk menyusuri jalur sungai berbatu.'
          },
          {
            time: '13:45',
            activity: 'Makan siang Nasi Timbel Sunda hangat & ikan bakar di resto lereng bukit',
            location: 'Restoran Khas Sunda Alam Puncak',
            duration: '1.5 jam',
            cost: 'Rp 50.000 - Rp 95.000',
            tips: 'Padukan dengan sambal dadak pedas dan lalapan segar.'
          },
          {
            time: '16:00',
            activity: 'Menikmati senja berkabut sambil ngopi santai di kafe panorama Puncak',
            location: 'Kawasan Wisata Puncak Pass & Kafe Tebing',
            duration: '2 jam',
            cost: 'Rp 35.000 - Rp 70.000',
            tips: 'Pesona kabut sore hari berpadu jagung bakar manis dan wedang bandrek hangat.'
          }
        ],
        meals: {
          breakfast: 'Bubur Ayam Cianjur / Nasi Uduk Hangat',
          lunch: 'Nasi Timbel Komplit Ikan Gurame Bakar Cobek',
          dinner: 'Sate Kambing Puncak & Jagung Bakar Manis'
        },
        accommodation: 'Resort / Villa View Pegunungan di Kawasan Puncak / Sentul',
        estimatedDailyCost: 'Rp 250.000 - Rp 550.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 6. MAGELANG & KEBON POLO
  // ─────────────────────────────────────────────────────────────
  magelang: {
    canonicalName: 'Magelang & Kawasan Candi Borobudur, Jawa Tengah',
    parentRegion: 'Kabupaten & Kota Magelang',
    totalEstimatedCost: 'Rp 1.100.000 - Rp 2.800.000',
    spots: [
      'Candi Borobudur Sunrise',
      'Gereja Ayam Bukit Rhema',
      'Svargabumi Borobudur',
      'Taman Wisata Kyai Langgeng',
      'Gunung Tidar (Paku Tanah Jawa)',
      'Rafting Sungai Elo Magelang'
    ],
    culinary: {
      breakfast: 'Kupat Tahu Pojok Magelang Asli',
      lunch: 'Mangut Beong Sehati Asli Borobudur',
      dinner: 'Sop Senerek Iga Bu Atmo & Wedang Kacang Kebonpolo'
    },
    accommodation: 'Plataran Borobudur Resort / Hotel Puri Asri Magelang / Grand Artos Hotel',
    bestSeason: 'Mei - Oktober (Pagi hari bebas kabut untuk sunrise Borobudur)',
    tips: [
      'Pesan tiket naik struktur Candi Borobudur jauh-jauh hari secara online.',
      'Cicipi Kupat Tahu Magelang dan bawa oleh-oleh Getuk Trio asli Magelang.'
    ],
    localPhrases: [
      { phrase: 'Matur Nuwun', meaning: 'Terima kasih banyak' },
      { phrase: 'Pinten nggih?', meaning: 'Berapa harganya ya?' },
      { phrase: 'Nyuwun sewu', meaning: 'Permisi / Maaf' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Sunrise Candi Borobudur, Bukit Rhema & Svargabumi',
        activities: [
          {
            time: '05:30',
            activity: 'Menyaksikan magisnya matahari terbit di Candi Borobudur',
            location: 'Candi Borobudur UNESCO World Heritage',
            duration: '3 jam',
            cost: 'Rp 50.000 - Rp 120.000',
            tips: 'Gunakan sandal upanat khusus yang disediakan petugas saat naik struktur candi.'
          },
          {
            time: '09:00',
            activity: 'Melihat panorama Merapi & bukit Menoreh dari Mahkota Gereja Ayam',
            location: 'Bukit Rhema Gereja Ayam Magelang',
            duration: '1.5 jam',
            cost: 'Rp 25.000',
            tips: 'Tukarkan tiket dengan singkong goreng keju panas di kafe puncak bukit.'
          },
          {
            time: '11:00',
            activity: 'Hunting spot foto estetik di pematang sawah hijau Svargabumi',
            location: 'Svargabumi Borobudur',
            duration: '1.5 jam',
            cost: 'Rp 30.000',
            tips: 'Ada lebih dari 20 spot foto ayunan dan jembatan kayu di tengah sawah.'
          },
          {
            time: '12:45',
            activity: 'Makan siang pedas gurih Mangut Beong khas sungai Progo',
            location: 'Mangut Beong Sehati Borobudur',
            duration: '1.5 jam',
            cost: 'Rp 35.000 - Rp 65.000',
            tips: 'Ikan beong memiliki tekstur daging lembut dengan kuah santan cabai rawit melimpah.'
          },
          {
            time: '18:30',
            activity: 'Santap malam Sop Senerek iga sapi & Wedang Kacang empuk Kebonpolo',
            location: 'Warung Wedang Kacang Kebonpolo Magelang',
            duration: '1.5 jam',
            cost: 'Rp 25.000 - Rp 45.000',
            tips: 'Kuah manis hangat kacang tanah lumer sangat pas dinikmati di malam hari.'
          }
        ],
        meals: {
          breakfast: 'Kupat Tahu Pojok Magelang Bumbu Kacang Kecap',
          lunch: 'Mangut Beong Ikan Sungai Kuah Pedas',
          dinner: 'Sop Senerek Bu Atmo & Wedang Kacang'
        },
        accommodation: 'Resort Bernuansa Alam di Sekitar Borobudur',
        estimatedDailyCost: 'Rp 200.000 - Rp 450.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 6. DIENG & WONOSOBO
  // ─────────────────────────────────────────────────────────────
  dieng: {
    canonicalName: 'Dataran Tinggi Dieng & Wonosobo, Jawa Tengah',
    parentRegion: 'Wonosobo & Banjarnegara',
    totalEstimatedCost: 'Rp 1.100.000 - Rp 2.600.000',
    spots: [
      'Golden Sunrise Bukit Sikunir',
      'Kompleks Candi Arjuna Dieng',
      'Kawah Sikidang Vulkanik',
      'Telaga Warna & Telaga Pengilon',
      'Batu Pandang Ratapan Angin',
      'Kebun Teh Tambi Wonosobo'
    ],
    culinary: {
      breakfast: 'Mie Ongklok Pak Muhadi & Sate Sapi',
      lunch: 'Tempe Kemul Hangat & Nasi Jagung',
      dinner: 'Wedang Purwaceng Hangat & Manisan Carica'
    },
    accommodation: 'Homestay Syariah Dieng Plateau / The Kresna Hotel Wonosobo',
    bestSeason: 'Mei - September (Musim Kemarau & Fenomena Embun Upas Salju Dieng)',
    tips: [
      'Suhu malam hari bisa mencapai 0°C-5°C, siapkan jaket tebal, kupluk, dan sarung tangan.',
      'Mulai trekking Bukit Sikunir pukul 04.30 pagi dari Desa Sembungan (desa tertinggi di Jawa).'
    ],
    localPhrases: [
      { phrase: 'Matur Nuwun', meaning: 'Terima kasih banyak' },
      { phrase: 'Pinten nggih?', meaning: 'Berapa harganya?' },
      { phrase: 'Nyuwun sewu', meaning: 'Permisi' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Golden Sunrise Sikunir, Candi Arjuna & Telaga Warna',
        activities: [
          {
            time: '04:30',
            activity: 'Menyaksikan Golden Sunrise spektakuler di puncak Bukit Sikunir',
            location: 'Bukit Sikunir Desa Sembungan Dieng',
            duration: '2.5 jam',
            cost: 'Rp 15.000',
            tips: 'Jalur tangga setapak telah tertata rapi, butuh waktu sekitar 30 menit trekking.'
          },
          {
            time: '08:00',
            activity: 'Menjelajahi peninggalan Mataram Kuno di Kompleks Candi Arjuna',
            location: 'Kompleks Candi Arjuna Dieng',
            duration: '1.5 jam',
            cost: 'Rp 20.000 (Tiket Terusan)',
            tips: 'Saat musim kemarau pagi, hamparan rumput sering diselimuti kristal es (embun upas).'
          },
          {
            time: '10:00',
            activity: 'Melihat aktivitas kawah belerang mendidih di Kawah Sikidang',
            location: 'Kawah Sikidang Vulkanik Dieng',
            duration: '1.5 jam',
            cost: 'Termasuk tiket terusan',
            tips: 'Gunakan jembatan kayu yang membentang di atas kawah untuk spot foto dramatis.'
          },
          {
            time: '12:30',
            activity: 'Makan siang Mie Ongklok kuah kental gurih berpadu sate sapi manis',
            location: 'Mie Ongklok Pak Muhadi Wonosobo',
            duration: '1.5 jam',
            cost: 'Rp 25.000 - Rp 45.000',
            tips: 'Padukan dengan tempe kemul goreng renyah bertabur daun kucai.'
          },
          {
            time: '15:00',
            activity: 'Mengagumi gradasi air hijau toska di Telaga Warna dari Batu Pandang',
            location: 'Batu Pandang Ratapan Angin & Telaga Warna',
            duration: '2 jam',
            cost: 'Rp 15.000',
            tips: 'Pemandangan dua danau berdampingan dengan kandungan sulfur sangat memukau.'
          }
        ],
        meals: {
          breakfast: 'Kentang Goreng Dieng & Teh Manis Hangat',
          lunch: 'Mie Ongklok Sate Sapi & Tempe Kemul',
          dinner: 'Sego Megono Wonosobo & Wedang Purwaceng'
        },
        accommodation: 'Homestay Nyaman dengan Pemanas Air di Dataran Tinggi Dieng',
        estimatedDailyCost: 'Rp 180.000 - Rp 380.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 7. LABUAN BAJO & KOMODO
  // ─────────────────────────────────────────────────────────────
  labuanbajo: {
    canonicalName: 'Labuan Bajo & Taman Nasional Komodo, NTT',
    parentRegion: 'Manggarai Barat, Nusa Tenggara Timur',
    totalEstimatedCost: 'Rp 3.500.000 - Rp 8.500.000',
    spots: [
      'Pulau Padar Trekking Puncak Tiga Teluk',
      'Trekking Satwa Komodo di Pulau Komodo / Rinca',
      'Pink Beach Pasir Merah Muda & Snorkeling',
      'Manta Point Berenang Bersama Pari Manta',
      'Taka Makassar Pulau Pasir Timbul',
      'Goa Rangko Kolam Asin Alami Tersembunyi',
      'Sunset Cantik Bukit Sylvia Labuan Bajo'
    ],
    culinary: {
      breakfast: 'Roti Kompiang Hangat & Kopi Flores Bajawa',
      lunch: 'Ikan Kuah Asam Segar Khas Bajo',
      dinner: 'Seafood Bakar Pasar Malam Kampung Ujung'
    },
    accommodation: 'AYANA Komodo Waecicu Beach / Meruorah Komodo Labuan Bajo / Plataran Komodo',
    bestSeason: 'April - Juni & September - November (Cuaca cerah & arus laut tenang optimal)',
    tips: [
      'Pilih paket tur speed boat atau liveaboard Phinisi untuk mengunjungi pulau-pulau terbaik.',
      'Patuhi selalu instruksi ranger (pemandu) saat berada di habitat satwa purba komodo.',
      'Gunakan tabir surya reef-safe untuk melindungi ekosistem terumbu karang.'
    ],
    localPhrases: [
      { phrase: 'Matur Kesuk', meaning: 'Terima kasih (Manggarai)' },
      { phrase: 'Berapa harganya?', meaning: 'Berapa harganya?' },
      { phrase: 'Tabe', meaning: 'Permisi' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Puncak Pulau Padar, Pink Beach & Manta Point',
        activities: [
          {
            time: '06:00',
            activity: 'Berlayar dengan Speed Boat menuju Pulau Padar saat fajar',
            location: 'Pelabuhan Labuan Bajo ke Pulau Padar',
            duration: '1.5 jam',
            cost: 'Termasuk paket tur',
            tips: 'Mulai trekking pagi hari agar tidak terlalu panas saat menaiki 800 anak tangga.'
          },
          {
            time: '08:00',
            activity: 'Menikmati panorama 3 warna teluk pasir yang spektakuler di Pulau Padar',
            location: 'Puncak Pulau Padar TN Komodo',
            duration: '2 jam',
            cost: 'Tiket TN Komodo',
            tips: 'Gunakan sepatu trekking dan bawa botol minum.'
          },
          {
            time: '11:00',
            activity: 'Melihat satwa komodo langsung di habitat aslinya bersama Ranger',
            location: 'Pulau Komodo / Pulau Rinca',
            duration: '1.5 jam',
            cost: 'Jasa Ranger Komodo',
            tips: 'Jaga jarak aman minimal 3-5 meter dari satwa komodo.'
          },
          {
            time: '13:00',
            activity: 'Santap siang di atas kapal & snorkeling di pasir merah muda Pink Beach',
            location: 'Pink Beach (Pantai Merah) TN Komodo',
            duration: '2 jam',
            cost: 'Gratis di area pantai',
            tips: 'Warna pink berasal dari serpihan koral merah mikroskopis Foraminifera.'
          },
          {
            time: '15:30',
            activity: 'Berenang dan melihat pari manta raksasa di Manta Point',
            location: 'Manta Point & Taka Makassar',
            duration: '2 jam',
            cost: 'Termasuk tur boat',
            tips: 'Bawa kamera aksi anti air (GoPro) untuk merekam momen bersama manta.'
          },
          {
            time: '19:00',
            activity: 'Makan malam seafood bakar aneka ikan kerapu & cumi di Kampung Ujung',
            location: 'Pasar Kuliner Kampung Ujung Labuan Bajo',
            duration: '2 jam',
            cost: 'Rp 75.000 - Rp 150.000',
            tips: 'Pilih ikan segar langsung dari es batu nelayan dan minta dibakar bumbu rica.'
          }
        ],
        meals: {
          breakfast: 'Roti Kompiang & Kopi Arabika Bajawa',
          lunch: 'Ikan Kuah Asam Segar & Nasi Hangat di Kapal',
          dinner: 'Ikan Kerapu Bakar Madu & Cumi Saus Padang'
        },
        accommodation: 'Resort View Laut di Labuan Bajo / Kapal Phinisi',
        estimatedDailyCost: 'Rp 650.000 - Rp 1.500.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 8. BANYUWANGI (The Sunrise of Java)
  // ─────────────────────────────────────────────────────────────
  banyuwangi: {
    canonicalName: 'Banyuwangi Sunrise of Java, Jawa Timur',
    parentRegion: 'Kabupaten Banyuwangi',
    totalEstimatedCost: 'Rp 1.300.000 - Rp 3.000.000',
    spots: [
      'Kawah Ijen Fenomena Api Biru (Blue Fire)',
      'Taman Nasional Baluran (Africa van Java)',
      'De Djawatan Forest Benculuk (Hutan Lord of the Rings)',
      'Pantai Pulau Merah Sunset',
      'Desa Adat Osing Kemiren',
      'Pantai Teluk Hijau (Green Bay)'
    ],
    culinary: {
      breakfast: 'Sego Tempong Mbok Wah Super Pedas',
      lunch: 'Rujak Soto Khas Banyuwangi',
      dinner: 'Pecel Pitik Osing & Kopi Ijen Arabika'
    },
    accommodation: 'Dialoog Banyuwangi / Jiwa Jawa Resort Ijen / Kokoon Hotel Banyuwangi',
    bestSeason: 'Juli - Oktober (Musim kemarau paling jernih untuk Blue Fire)',
    tips: [
      'Sewa masker gas respirator dan senter kepala (headlamp) sebelum naik Kawah Ijen.',
      'Pendakian Ijen dimulai pukul 01.00 dini hari dari pos Paltuding.'
    ],
    localPhrases: [
      { phrase: 'Matur Kesuwun', meaning: 'Terima kasih (Bahasa Osing)' },
      { phrase: 'Piro regane?', meaning: 'Berapa harganya?' },
      { phrase: 'Nyuwun sewu', meaning: 'Permisi' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Fenomena Blue Fire Kawah Ijen & Hutan Magis De Djawatan',
        activities: [
          {
            time: '01:00',
            activity: 'Mulai pendakian dini hari menuju Kawah Ijen untuk fenomena Blue Fire',
            location: 'Kawah Ijen Paltuding Banyuwangi',
            duration: '4 jam',
            cost: 'Rp 10.000 (Tiket) + Rp 25.000 (Sewa Masker Gas)',
            tips: 'Jalur tanjakan cukup curam di 1,5 km pertama, atur ritme nafas dengan teratur.'
          },
          {
            time: '06:00',
            activity: 'Menyaksikan danau kawah asam toska terbesar di dunia saat matahari terbit',
            location: 'Puncak Kawah Ijen 2.443 MDPL',
            duration: '1.5 jam',
            cost: 'Gratis',
            tips: 'Pemandangan asap belerang dan danau kawah toska sangat spektakuler saat pagi.'
          },
          {
            time: '12:00',
            activity: 'Makan siang Sego Tempong lauk ikan asin, tahu tempe & sambal tomat pedas',
            location: 'Sego Tempong Mbok Wah Banyuwangi',
            duration: '1.5 jam',
            cost: 'Rp 25.000 - Rp 45.000',
            tips: 'Sambal tempong diulek segar dadakan dengan cabai rawit dan tomat ranti.'
          },
          {
            time: '15:00',
            activity: 'Hunting foto di lorong pohon trembesi raksasa De Djawatan Forest',
            location: 'De Djawatan Forest Benculuk',
            duration: '2 jam',
            cost: 'Rp 10.000',
            tips: 'Cahaya matahari yang menembus lumut gantung pohon trembesi sangat magis.'
          }
        ],
        meals: {
          breakfast: 'Kopi Arabika Hangat & Roti di Pos Paltuding',
          lunch: 'Sego Tempong Sambal Ranti Mbok Wah',
          dinner: 'Rujak Soto Babat Khas Banyuwangi'
        },
        accommodation: 'Resort Bernuansa Alam di Lereng Gunung Ijen',
        estimatedDailyCost: 'Rp 200.000 - Rp 450.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 9. LOMBOK
  // ─────────────────────────────────────────────────────────────
  lombok: {
    canonicalName: 'Pulau Lombok & Kepulauan Gili, NTB',
    parentRegion: 'Lombok, Nusa Tenggara Barat',
    totalEstimatedCost: 'Rp 1.800.000 - Rp 4.200.000',
    spots: [
      'Gili Trawangan Snorkeling & Sunset Point',
      'Pantai Tanjung Aan & Bukit Merese Mandalika',
      'Desa Adat Sade Suku Sasak',
      'Air Terjun Sendang Gile & Tiu Kelep Senaru',
      'Gili Meno & Gili Air Turtle Point',
      'Pantai Pink (Tangsi) Lombok Timur'
    ],
    culinary: {
      breakfast: 'Nasi Balap Puyung Inaq Esun Super Pedas',
      lunch: 'Ayam Taliwang H. Moerad & Plecing Kangkung',
      dinner: 'Seafood Bakar Ikan Karang Pantai Senggigi'
    },
    accommodation: 'The Oberoi Beach Resort Lombok / Katamaran Resort Senggigi',
    bestSeason: 'Mei - Oktober (Musim kemarau dengan laut tenang & jernih)',
    tips: [
      'Sewa sepeda atau naik Cidomo di Gili Trawangan karena pulau bebas kendaraan bermotor.',
      'Naik ke Bukit Merese sebelum pukul 17:30 WITA untuk sunset terbaik.'
    ],
    localPhrases: [
      { phrase: 'Tampi Asih', meaning: 'Terima kasih (Bahasa Sasak)' },
      { phrase: 'Piro ajine?', meaning: 'Berapa harganya?' },
      { phrase: 'Tabe’', meaning: 'Permisi / Maaf' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Desa Adat Sade, Pantai Tanjung Aan & Sunset Bukit Merese',
        activities: [
          {
            time: '09:00',
            activity: 'Mengenal kearifan lokal & rumah adat Bale Tani di Desa Adat Sade',
            location: 'Desa Adat Sade Suku Sasak Pujut',
            duration: '2 jam',
            cost: 'Donasi sukarela',
            tips: 'Lihat proses menenun kain songket tradisional Sasak motif Subahnale.'
          },
          {
            time: '12:00',
            activity: 'Makan siang Ayam Taliwang bakar bumbu pedas gurih & plecing kangkung',
            location: 'Ayam Taliwang Khas Kuta Mandalika',
            duration: '1.5 jam',
            cost: 'Rp 45.000 - Rp 80.000',
            tips: 'Kangkung lombok memiliki batang besar yang sangat renyah dan segar.'
          },
          {
            time: '14:00',
            activity: 'Menikmati pasir merica unik & ayunan laut di Pantai Tanjung Aan',
            location: 'Pantai Tanjung Aan Mandalika',
            duration: '2.5 jam',
            cost: 'Rp 10.000',
            tips: 'Air laut sangat jernih dan berombak tenang, cocok untuk berenang santai.'
          },
          {
            time: '17:00',
            activity: 'Trekking ringan ke puncak Bukit Merese untuk sunset teluk Mandalika',
            location: 'Bukit Merese Kuta Lombok',
            duration: '2 jam',
            cost: 'Rp 10.000',
            tips: 'Pemandangan garis pantai melengkung dan padang rumput hijau sangat dramatis.'
          }
        ],
        meals: {
          breakfast: 'Nasi Balap Puyung Ayam Suwir Pedas',
          lunch: 'Ayam Taliwang Bakar & Beberuk Terong',
          dinner: 'Ikan Kakap Bakar Madu & Kelapa Muda Segar'
        },
        accommodation: 'Resort Tropis Tepi Pantai di Kawasan Mandalika Lombok',
        estimatedDailyCost: 'Rp 300.000 - Rp 650.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 10. TOKYO (Jepang)
  // ─────────────────────────────────────────────────────────────
  tokyo: {
    canonicalName: 'Tokyo Metropolitan & Kanto, Jepang',
    parentRegion: 'Tokyo, Japan',
    totalEstimatedCost: 'Rp 8.500.000 - Rp 18.000.000',
    spots: [
      'Shibuya Crossing & Patung Hachiko',
      'Kuil Kuno Senso-ji di Asakusa & Nakamise Dori',
      'Tokyo Skytree / Tokyo Tower',
      'Shinjuku Gyoen National Garden',
      'Kuil Meiji Jingu & Kawasan Harajuku Takeshita',
      'Pusat Teknologi & Anime Akihabara Electric Town',
      'Pasar Ikan Tsukiji Outer Market'
    ],
    culinary: {
      breakfast: 'Tamagoyaki & Fresh Salmon Nigiri di Pasar Tsukiji',
      lunch: 'Ramen Ichiran / Ippudo Shibuya Tonkotsu Gurih',
      dinner: 'Wagyu Yakiniku & Yakitori di Omoide Yokocho Shinjuku'
    },
    accommodation: 'Keio Plaza Hotel Shinjuku / Hotel Gracery Shinjuku',
    bestSeason: 'Maret - Mei (Bunga Sakura) & Oktober - November (Musim Gugur)',
    tips: [
      'Beli kartu IC Suica / Pasmo atau Tokyo Subway Pass untuk mobilitas kereta metro hemat.',
      'Bawa uang tunai yen secukupnya untuk mesin tiket dan kedai ramen tradisional.'
    ],
    localPhrases: [
      { phrase: 'Arigatou Gozaimasu', meaning: 'Terima kasih banyak (Sopan)' },
      { phrase: 'Kore wa ikura desu ka?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Sumimasen', meaning: 'Permisi / Maaf' },
      { phrase: 'Konnichiwa', meaning: 'Halo / Selamat siang' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Sejarah Asakusa, Kuil Senso-ji & Kerlap-kerlip Shibuya Crossing',
        activities: [
          {
            time: '08:30',
            activity: 'Menjelajahi kuil Buddha tertua Senso-ji & melewati gerbang Kaminarimon',
            location: 'Kuil Senso-ji Asakusa Tokyo',
            duration: '2 jam',
            cost: 'Gratis',
            tips: 'Cicipi melonpan renyah hangat dan es krim matcha di jalan Nakamise Dori.'
          },
          {
            time: '11:00',
            activity: 'Kulineran street food sari laut segar di Pasar Ikan Tsukiji Outer Market',
            location: 'Tsukiji Outer Market Chuo City',
            duration: '2 jam',
            cost: '¥1,500 - ¥3,500',
            tips: 'Coba unagi bakar dan tamagoyaki manis hangat.'
          },
          {
            time: '14:00',
            activity: 'Jalan santai di hutan asri Kuil Meiji Jingu & kawasan modis Harajuku',
            location: 'Kuil Meiji Jingu & Takeshita Street Harajuku',
            duration: '2.5 jam',
            cost: 'Gratis',
            tips: 'Lihat deretan tong sake kayu raksasa persembahan di jalan setapak Meiji Jingu.'
          },
          {
            time: '17:30',
            activity: 'Menyeberang di persimpangan tersibuk dunia Shibuya Crossing & Hachiko',
            location: 'Shibuya Crossing & Shibuya Sky Observation Deck',
            duration: '2.5 jam',
            cost: '¥2,200',
            tips: 'Booking tiket Shibuya Sky saat golden hour menjelang lampu kota menyala.'
          },
          {
            time: '20:30',
            activity: 'Santap malam ramen tonkotsu hangat di booth privat Ichiran Ramen',
            location: 'Ichiran Ramen Shibuya',
            duration: '1.5 jam',
            cost: '¥1,200 - ¥1,800',
            tips: 'Pesan melalui mesin tiket otomatis dan atur tingkat kekenyalan mie.'
          }
        ],
        meals: {
          breakfast: 'Onigiri Salmon & Susu Meiji di Konbini 7-Eleven',
          lunch: 'Fresh Sashimi Donburi & Tamagoyaki Tsukiji',
          dinner: 'Ichiran Ramen Tonkotsu Rich Broth'
        },
        accommodation: 'Hotel Modern di Kawasan Shinjuku / Shibuya',
        estimatedDailyCost: 'Rp 650.000 - Rp 1.400.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 11. PARIS (Prancis)
  // ─────────────────────────────────────────────────────────────
  paris: {
    canonicalName: 'Paris Kota Cahaya & Seni, Prancis',
    parentRegion: 'Paris, France',
    totalEstimatedCost: 'Rp 9.500.000 - Rp 22.000.000',
    spots: [
      'Menara Eiffel (Tour Eiffel) & Champ de Mars',
      'Museum Seni Louvre & Piramida Kaca',
      'Katedral Notre-Dame de Paris di Île de la Cité',
      'Arc de Triomphe & Jalan Mewah Champs-Élysées',
      'Bukit Montmartre & Basilika Sacré-Cœur',
      'Pelayaran Kapal Sungai Seine Bateaux Mouches'
    ],
    culinary: {
      breakfast: 'Croissant Mentega Renyah & Café au Lait di Kafe Trotoar',
      lunch: 'Quiche Lorraine & French Onion Soup Klasik',
      dinner: 'Steak Frites & Crème Brûlée khas Bistro Paris'
    },
    accommodation: 'Pullman Paris Tour Eiffel / Hotel Le Bristol Paris',
    bestSeason: 'April - Juni & September - Oktober (Musim semi & gugur yang sejuk)',
    tips: [
      'Pesan tiket Menara Eiffel dan Museum Louvre online beberapa minggu sebelumnya.',
      'Saksikan Menara Eiffel berkilau (sparkle) selama 5 menit setiap jam setelah gelap.'
    ],
    localPhrases: [
      { phrase: 'Merci beaucoup', meaning: 'Terima kasih banyak' },
      { phrase: 'Combien ça coûte ?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Pardon / Excusez-moi', meaning: 'Permisi / Maaf' },
      { phrase: 'Bonjour', meaning: 'Halo / Selamat pagi' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Ikon Menara Eiffel, Museum Louvre & Pelayaran Sungai Seine',
        activities: [
          {
            time: '09:00',
            activity: 'Menikmati keindahan Menara Eiffel & berfoto dari Trocadéro',
            location: 'Menara Eiffel (Tour Eiffel) & Trocadéro',
            duration: '2.5 jam',
            cost: '€18 - €28',
            tips: 'Spot foto terbaik Menara Eiffel adalah dari teras Place du Trocadéro.'
          },
          {
            time: '12:30',
            activity: 'Makan siang santai di Bistro klasik Paris menikmati French Onion Soup',
            location: 'Bistro Tradisional Rue Saint-Dominique',
            duration: '1.5 jam',
            cost: '€20 - €35',
            tips: 'Duduk di kursi trotoar menghadap jalan untuk merasakan atmosfer khas Paris.'
          },
          {
            time: '14:30',
            activity: 'Melihat lukisan Mona Lisa & mahakarya seni dunia di Museum Louvre',
            location: 'Museum Seni Louvre & Piramida Kaca',
            duration: '3 jam',
            cost: '€22',
            tips: 'Masuk melalui pintu bawah tanah Carrousel du Louvre untuk antrean lebih singkat.'
          },
          {
            time: '18:30',
            activity: 'Menyusuri Sungai Seine dengan kapal pesiar Bateaux Parisiens',
            location: 'Pelayaran Sungai Seine Bateaux Mouches',
            duration: '1.5 jam',
            cost: '€16',
            tips: 'Pilih jadwal saat senja untuk melihat jembatan kota menyala keemasan.'
          }
        ],
        meals: {
          breakfast: 'Croissant au Beurre & Cappuccino Hangat',
          lunch: 'Quiche Lorraine & Salade Verte',
          dinner: 'Entrecôte Steak Frites & Crème Brûlée'
        },
        accommodation: 'Boutique Hotel di Kawasan Saint-Germain / Eiffel',
        estimatedDailyCost: 'Rp 800.000 - Rp 1.800.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 12. SINGAPURA (Singapore)
  // ─────────────────────────────────────────────────────────────
  singapore: {
    canonicalName: 'Singapura (Singapore City), Singapura',
    parentRegion: 'Singapore',
    totalEstimatedCost: 'Rp 3.500.000 - Rp 9.000.000',
    spots: [
      'Marina Bay Sands SkyPark & Spectra Light Show',
      'Gardens by the Bay (Supertree Grove & Flower Dome)',
      'Jewel Changi Airport HSBC Rain Vortex',
      'Universal Studios Singapore di Pulau Sentosa',
      'Kawasan Budaya Chinatown & Kuil Buddha Tooth Relic',
      'Haji Lane & Arab Street Kawasan Mural Estetik'
    ],
    culinary: {
      breakfast: 'Kaya Toast & Kopi Gu You di Ya Kun Kaya Toast',
      lunch: 'Tian Tian Hainanese Chicken Rice di Maxwell Food Centre',
      dinner: 'Chilli Crab Jumbo Seafood di Clarke Quay'
    },
    accommodation: 'Marina Bay Sands / Pan Pacific Singapore',
    bestSeason: 'Sepanjang Tahun (Banyak atraksi ber-AC modern & MRT praktis)',
    tips: [
      'Gunakan kartu debit/kredit contactless (Visa/Mastercard) langsung di MRT dan bus.',
      'Saksikan pertunjukan lampu gratis Garden Rhapsody di Supertree Grove pukul 19:45 dan 20:45.'
    ],
    localPhrases: [
      { phrase: 'Thank you lah!', meaning: 'Terima kasih (Singlish ramah)' },
      { phrase: 'How much is this?', meaning: 'Berapa harganya?' },
      { phrase: 'Excuse me', meaning: 'Permisi' },
      { phrase: 'Can / Cannot?', meaning: 'Bisa atau tidak?' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Ikon Marina Bay, Gardens by the Bay & Hawker Food Legendaris',
        activities: [
          {
            time: '09:00',
            activity: 'Menjelajahi kubah kaca raksasa Flower Dome & Cloud Forest Waterfall',
            location: 'Gardens by the Bay (Cloud Forest & Flower Dome)',
            duration: '2.5 jam',
            cost: 'SGD 32',
            tips: 'Air terjun indoor setinggi 35 meter di Cloud Forest sangat sejuk dan spektakuler.'
          },
          {
            time: '12:00',
            activity: 'Makan siang Nasi Ayam Hainan legendaris di Maxwell Food Centre',
            location: 'Tian Tian Hainanese Chicken Rice Maxwell',
            duration: '1.5 jam',
            cost: 'SGD 6 - SGD 10',
            tips: 'Daging ayamnya sangat lembut disiram kaldu gurih dan saus jahe otentik.'
          },
          {
            time: '14:00',
            activity: 'Hunting foto mural warna-warni & butik indie di Haji Lane & Arab Street',
            location: 'Haji Lane & Masjid Sultan Kampong Glam',
            duration: '2.5 jam',
            cost: 'Gratis',
            tips: 'Cicipi teh tarik busa tebal dan roti prata renyah di sekitar Masjid Sultan.'
          },
          {
            time: '17:30',
            activity: 'Menikmati pemandangan 360 derajat kota dari SkyPark Marina Bay Sands',
            location: 'Marina Bay Sands SkyPark Observation Deck',
            duration: '2 jam',
            cost: 'SGD 30',
            tips: 'Lihat pemandangan Selat Singapura dan deretan gedung pencakar langit.'
          }
        ],
        meals: {
          breakfast: 'Ya Kun Kaya Toast Set & Telur Setengah Matang',
          lunch: 'Tian Tian Hainanese Chicken Rice & Es Tebu Lemon',
          dinner: 'Chilli Crab Mantou Goreng / Satay Street Lau Pa Sat'
        },
        accommodation: 'Hotel Modern di Area Marina Bay / Bugis / Orchard',
        estimatedDailyCost: 'Rp 600.000 - Rp 1.500.000'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 13. SWISS (Switzerland)
  // ─────────────────────────────────────────────────────────────
  swiss: {
    canonicalName: 'Swiss Alps & Danau Cantik, Swiss (Switzerland)',
    parentRegion: 'Swiss (Switzerland)',
    totalEstimatedCost: 'Rp 14.000.000 - Rp 32.000.000',
    spots: [
      'Puncak Ikonik Matterhorn di Zermatt',
      'Kawasan Interlaken & Puncak Salju Jungfraujoch (Top of Europe)',
      'Desa Dongeng Lauterbrunnen Lembah 72 Air Terjun',
      'Danau Geneva & Kastil Chateau de Chillon Montreux',
      'Jembatan Kayu Bersejarah Chapel Bridge di Lucerne'
    ],
    culinary: {
      breakfast: 'Rösti Kentang Renyah & Keju Swiss Emmental',
      lunch: 'Fondue Keju Meleleh Tradisional dengan Roti Kering',
      dinner: 'Zürcher Geschnetzeltes Daging Saus Jamur & Cokelat Swiss Asli'
    },
    accommodation: 'The Chedi Andermatt / Victoria-Jungfrau Grand Hotel Interlaken',
    bestSeason: 'Juni - September (Musim panas hijau) atau Desember - Maret (Ski salju)',
    tips: [
      'Gunakan Swiss Travel Pass untuk akses kereta panorama dan kapal danau tanpa batas.',
      'Unduh aplikasi SBB Mobile untuk jadwal kereta Swiss yang sangat presisi.'
    ],
    localPhrases: [
      { phrase: 'Grüezi', meaning: 'Halo / Selamat sejahtera (Swiss Jerman)' },
      { phrase: 'Merci vilmal', meaning: 'Terima kasih banyak' },
      { phrase: 'Wie viel kostet das?', meaning: 'Berapa harganya ini?' },
      { phrase: 'Entschuldigung', meaning: 'Permisi / Maaf' }
    ],
    dayTemplates: [
      {
        title: 'Hari 1 — Desa Dongeng Lauterbrunnen & Keindahan Danau Interlaken',
        activities: [
          {
            time: '09:00',
            activity: 'Menyusuri lembah hijau 72 air terjun spektakuler di Desa Lauterbrunnen',
            location: 'Lauterbrunnen Valley & Air Terjun Staubbach Falls',
            duration: '2.5 jam',
            cost: 'Gratis',
            tips: 'Pemandangan tebing batu raksasa dengan air terjun terurai seperti dunia dongeng.'
          },
          {
            time: '12:00',
            activity: 'Makan siang Swiss Cheese Fondue hangat di chalet kayu tradisional',
            location: 'Restoran Alpen Tradisional Lauterbrunnen',
            duration: '1.5 jam',
            cost: 'CHF 28 - CHF 45',
            tips: 'Celupkan potongan roti gandum renyah ke dalam mangkuk keju gruyère meleleh.'
          },
          {
            time: '14:00',
            activity: 'Naik kereta gantung menuju desa bebas mobil Mürren di atas tebing',
            location: 'Desa Alpen Mürren & Schilthorn View',
            duration: '2.5 jam',
            cost: 'CHF 22',
            tips: 'Panorama tiga puncak salju legendaris Eiger, Mönch, dan Jungfrau terlihat sempurna.'
          },
          {
            time: '17:30',
            activity: 'Berlayar dengan kapal uap di Danau Brienz / Danau Thun berair toska',
            location: 'Danau Brienz Interlaken',
            duration: '2 jam',
            cost: 'Gratis dengan Swiss Pass',
            tips: 'Duduk di dek atas luar untuk hembusan angin segar pegunungan Alpen.'
          }
        ],
        meals: {
          breakfast: 'Swiss Birchermüesli dengan Buah Berry Segar',
          lunch: 'Traditional Swiss Cheese Fondue & Roti Baguette',
          dinner: 'Veal Geschnetzeltes dengan Rösti Kentang Emas'
        },
        accommodation: 'Chalet Hotel Menghadap Pegunungan Salju di Interlaken',
        estimatedDailyCost: 'Rp 1.200.000 - Rp 2.800.000'
      }
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// Normalizer & Resolver
// ─────────────────────────────────────────────────────────────
const ALIAS_MAP: Record<string, string> = {
  // Bali
  'bali': 'bali',
  'pulau bali': 'bali',
  'denpasar': 'bali',
  'kuta': 'bali',
  'seminyak': 'bali',
  'canggu': 'bali',
  'sanur': 'bali',
  'jimbaran': 'bali',
  'uluwatu': 'bali',
  'nusa dua': 'bali',
  'nusadua': 'bali',
  'bedugul': 'bali',
  'tanah lot': 'bali',
  'tanahlot': 'bali',
  'ubud': 'bali',
  'kintamani': 'bali',
  'nusa penida': 'bali',
  'nusapenida': 'bali',

  // Yogyakarta
  'jogja': 'yogyakarta',
  'yogya': 'yogyakarta',
  'yogyakarta': 'yogyakarta',
  'jogjakarta': 'yogyakarta',
  'malioboro': 'yogyakarta',
  'prambanan': 'yogyakarta',
  'sleman': 'yogyakarta',
  'bantul': 'yogyakarta',
  'gunungkidul': 'yogyakarta',

  // Bandung
  'bandung': 'bandung',
  'lembang': 'bandung',
  'ciwidey': 'bandung',
  'dago': 'bandung',
  'braga': 'bandung',

  // Jakarta
  'jakarta': 'jakarta',
  'dki jakarta': 'jakarta',
  'monas': 'jakarta',
  'kota tua': 'jakarta',
  'pik': 'jakarta',
  'pantjoran pik': 'jakarta',

  // Bogor & Puncak
  'bogor': 'bogor',
  'kota bogor': 'bogor',
  'kabupaten bogor': 'bogor',
  'puncak': 'bogor',
  'sentul': 'bogor',
  'sentul city': 'bogor',
  'kebun raya bogor': 'bogor',
  'cisarua': 'bogor',

  // Magelang
  'magelang': 'magelang',
  'kebon polo': 'magelang',
  'kebonpolo': 'magelang',
  'borobudur': 'magelang',

  // Dieng
  'dieng': 'dieng',
  'wonosobo': 'dieng',
  'sikunir': 'dieng',

  // Labuan Bajo
  'labuan bajo': 'labuanbajo',
  'labuanbajo': 'labuanbajo',
  'komodo': 'labuanbajo',
  'flores': 'labuanbajo',

  // Banyuwangi
  'banyuwangi': 'banyuwangi',
  'kawah ijen': 'banyuwangi',
  'ijen': 'banyuwangi',

  // Lombok
  'lombok': 'lombok',
  'gili': 'lombok',
  'gili trawangan': 'lombok',
  'gilitrawangan': 'lombok',
  'mandalika': 'lombok',
  'senggigi': 'lombok',

  // Tokyo & Japan
  'tokyo': 'tokyo',
  'shibuya': 'tokyo',
  'shinjuku': 'tokyo',
  'asakusa': 'tokyo',
  'jepang': 'tokyo',
  'japan': 'tokyo',

  // Paris & France
  'paris': 'paris',
  'prancis': 'paris',
  'france': 'paris',

  // Singapore
  'singapore': 'singapore',
  'singapura': 'singapore',

  // Swiss
  'swiss': 'swiss',
  'switzerland': 'swiss',
  'swiss alps': 'swiss',
  'interlaken': 'swiss',
  'zermatt': 'swiss',
}

export function findDestinationKnowledge(destinationQuery: string): DestinationKnowledge | null {
  if (!destinationQuery) return null
  const norm = destinationQuery
    .toLowerCase()
    .trim()
    .replace(/[()[\]{}"'“”.,/-]/g, ' ')
    .replace(/\s+/g, ' ')

  // 1. Direct key match in ALIAS_MAP
  if (ALIAS_MAP[norm] && TRAVEL_KNOWLEDGE_BASE[ALIAS_MAP[norm]]) {
    return TRAVEL_KNOWLEDGE_BASE[ALIAS_MAP[norm]]
  }

  // 2. Direct key match in TRAVEL_KNOWLEDGE_BASE
  if (TRAVEL_KNOWLEDGE_BASE[norm]) {
    return TRAVEL_KNOWLEDGE_BASE[norm]
  }

  // 3. Token / keyword match
  const words = norm.split(' ').filter((w) => w.length >= 3)
  for (const w of words) {
    if (ALIAS_MAP[w] && TRAVEL_KNOWLEDGE_BASE[ALIAS_MAP[w]]) {
      return TRAVEL_KNOWLEDGE_BASE[ALIAS_MAP[w]]
    }
    if (TRAVEL_KNOWLEDGE_BASE[w]) {
      return TRAVEL_KNOWLEDGE_BASE[w]
    }
  }

  // 4. Substring scan across canonical names and spots
  for (const [key, data] of Object.entries(TRAVEL_KNOWLEDGE_BASE)) {
    if (norm.includes(key) || key.includes(norm) || data.canonicalName.toLowerCase().includes(norm)) {
      return data
    }
  }

  return null
}
