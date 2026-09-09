export type DocRole = 'PUBLIC' | 'USER' | 'ADMIN'

export interface PageAnatomyItem {
  id: string
  number: string
  name: string
  description: string
  selectorHint?: string
}

export interface PageActionItem {
  name: string
  action: string
  targetUrl?: string
}

export interface DocPageItem {
  id: string
  slug: string
  pageNumber: string
  title: string
  subtitle: string
  role: DocRole
  urlPath: string
  category: 'Discovery & Public' | 'Account & Auth' | 'Booking & Payments' | 'User Dashboard' | 'Admin Portal'
  screenshot: string
  overview: string
  features: string[]
  anatomy: PageAnatomyItem[]
  actions: PageActionItem[]
  userFlow: string[]
  relatedPages: { title: string; slug: string }[]
}

export const DOC_PAGES: DocPageItem[] = [
  // ==========================================
  // A. Discovery & Public
  // ==========================================
  {
    id: 'page-home',
    slug: 'home',
    pageNumber: '01',
    title: 'Homepage & Luxury Showcase',
    subtitle: 'Halaman beranda utama yang menampilkan kurasi perjalanan eksklusif, hero visual, dan navigasi utama.',
    role: 'PUBLIC',
    urlPath: '/',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/home.png',
    overview: 'Halaman ini merupakan pintu masuk utama aplikasi Nova Travel. Pengunjung disajikan pengalaman visual editorial mewah, sorotan destinasi populer dunia, video hero atmosferik, dan akses cepat ke pencarian paket tur serta perencana AI.',
    features: [
      'Hero section dinamis dengan visual video sinematik dan slogan mewah',
      'Quick Search Bar untuk mencari destinasi atau tur secara instan',
      'Carousel Destinasi Unggulan dunia dengan label harga dan rating',
      'Curated Journeys: Daftar paket wisata unggulan dengan tag eksklusif',
      'Kalkulator ringkasan kurs mata uang interaktif (USD, IDR, EUR, GBP)',
      'Newsletter subscription banner untuk mendapatkan penawaran privat'
    ],
    anatomy: [
      { id: 'h-1', number: '01', name: 'Luxury Header Navigation', description: 'Menu navigasi atas transparan/solid dengan logo NOVA, link destinasi, paket, dan tombol masuk.' },
      { id: 'h-2', number: '02', name: 'Hero Cinematic Banner', description: 'Area visual utama dengan judul editorial mewah dan tombol Call To Action (CTA).' },
      { id: 'h-3', number: '03', name: 'Quick Discovery Search', description: 'Widget input untuk mencari negara, kota tujuan, dan tanggal keberangkatan.' },
      { id: 'h-4', number: '04', name: 'Curated Packages Grid', description: 'Daftar kartu paket wisata mewah yang dilengkapi foto asli, durasi, dan harga mulai.' },
      { id: 'h-5', number: '05', name: 'AI Travel Planner Banner', description: 'Banner interaktif yang mengarahkan tamu ke modul perencanaan otomatis berbasis kecerdasan buatan.' }
    ],
    actions: [
      { name: 'Jelajahi Paket', action: 'Membuka katalog paket tur lengkap', targetUrl: '/packages' },
      { name: 'Rencanakan dengan AI', action: 'Membuka asisten pembuat itinerary otomatis', targetUrl: '/ai-planner' },
      { name: 'Cari Destinasi', action: 'Melakukan query pencarian destinasi', targetUrl: '/search' },
      { name: 'Masuk / Daftar', action: 'Membuka pop-up atau halaman autentikasi', targetUrl: '/login' }
    ],
    userFlow: ['Kunjungi Homepage', 'Jelajahi Hero & Destinasi', 'Gunakan Filter Pencarian', 'Klik Kartu Paket untuk Detail'],
    relatedPages: [
      { title: 'Katalog Paket Wisata', slug: 'packages' },
      { title: 'Eksplorasi Destinasi Dunia', slug: 'destinations' },
      { title: 'AI Travel Planner', slug: 'ai-planner' }
    ]
  },
  {
    id: 'page-packages',
    slug: 'packages',
    pageNumber: '02',
    title: 'Katalog Paket Wisata',
    subtitle: 'Daftar lengkap seluruh paket perjalanan wisata dengan sistem filter lanjutan, pencarian, dan pengurutan harga.',
    role: 'PUBLIC',
    urlPath: '/packages',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/packages.png',
    overview: 'Halaman ini menyajikan seluruh katalog perjalanan wisata yang disediakan oleh Nova Travel. Tamu dapat memfilter paket berdasarkan negara tujuan, rentang harga, durasi hari, dan jenis gaya liburan (romantic, luxury, adventure).',
    features: [
      'Multi-parameter filter (Kategori, Destinasi, Rentang Harga, Durasi)',
      'Sorting dropdown (Harga termurah, termahal, terpopuler, terbaru)',
      'Kartu paket informatif dengan status ketersediaan kuota (Limited / Available)',
      'Tombol Wishlist cepat di setiap kartu tanpa harus meninggalkan halaman',
      'Pagination dan load-more dinamis untuk performa tinggi'
    ],
    anatomy: [
      { id: 'p-1', number: '01', name: 'Filter Sidebar / Topbar', description: 'Kontrol penyaringan kategori liburan, negara, dan slider batasan harga.' },
      { id: 'p-2', number: '02', name: 'Sorting & Counter Bar', description: 'Menampilkan total paket ditemukan serta opsi pengurutan urutan tampil.' },
      { id: 'p-3', number: '03', name: 'Package Card Collection', description: 'Grid kartu paket tur dengan thumbnail foto HD, badge negara, bintang rating, dan durasi malam.' },
      { id: 'p-4', number: '04', name: 'CTA Booking Cepat', description: 'Tombol pada kartu untuk langsung menelusuri tanggal keberangkatan.' }
    ],
    actions: [
      { name: 'Filter Kategori', action: 'Menyaring paket sesuai tema liburan' },
      { name: 'Simpan ke Wishlist', action: 'Menandai paket ke daftar favorit pengguna' },
      { name: 'Lihat Detail Paket', action: 'Membuka informasi komprehensif paket', targetUrl: '/packages/paris-french-riviera' }
    ],
    userFlow: ['Masuk Katalog Paket', 'Terapkan Filter & Sortir', 'Bandingkan Opsi Tur', 'Pilih Paket Favorit'],
    relatedPages: [
      { title: 'Homepage & Hero', slug: 'home' },
      { title: 'Detail Paket Wisata', slug: 'package-detail' },
      { title: 'Pencarian Global', slug: 'search' }
    ]
  },
  {
    id: 'page-package-detail',
    slug: 'package-detail',
    pageNumber: '03',
    title: 'Detail Paket Wisata & Itinerary',
    subtitle: 'Halaman mendalam yang menyajikan jadwal hari demi hari, fasilitas inklusi/eksklusi, galeri foto, dan opsi tanggal.',
    role: 'PUBLIC',
    urlPath: '/packages/paris-french-riviera',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/package-detail.png',
    overview: 'Halaman ini memberikan transparansi penuh tentang apa saja yang akan didapatkan wisatawan dalam satu paket perjalanan. Menampilkan galeri foto interaktif, rincian jadwal hari per hari (day-by-day itinerary), hotel berbintang, dan pemilihan slot jadwal keberangkatan.',
    features: [
      'Galeri foto interaktif resolusi tinggi dengan zoom viewer',
      'Peta rute interaktif Geoapify / Mapbox perhentian perjalanan',
      'Accordion jadwal harian terperinci (Day 1 hingga Day X)',
      'Daftar Fasilitas Termasuk (Inclusions) & Tidak Termasuk (Exclusions)',
      'Widget Pemilihan Tanggal & Slot Kuota yang tersisa secara real-time',
      'Sticky Booking Card dengan kalkulasi estimasi total biaya'
    ],
    anatomy: [
      { id: 'pd-1', number: '01', name: 'Photo Gallery Showcase', description: 'Kumpulan visual hotel, pemandangan, dan aktivitas utama.' },
      { id: 'pd-2', number: '02', name: 'Package Title & Highlights', description: 'Judul paket, lokasi negara, kategori, dan rating ulasan terverifikasi.' },
      { id: 'pd-3', number: '03', name: 'Day-by-Day Itinerary Accordion', description: 'Rincian terstruktur setiap kegiatan pagi, siang, dan malam selama tur berlangsung.' },
      { id: 'pd-4', number: '04', name: 'Departure Schedule Picker', description: 'Tabel pilihan tanggal berangkat dengan indikator sisa seat.' },
      { id: 'pd-5', number: '05', name: 'Sticky Booking Bar', description: 'Tombol Book Now mengambang dengan harga per pax yang jelas.' }
    ],
    actions: [
      { name: 'Pilih Tanggal Berangkat', action: 'Memilih jadwal keberangkatan yang diinginkan' },
      { name: 'Mulai Pemesanan (Book Now)', action: 'Mengarahkan ke formulir pemesanan tamu', targetUrl: '/booking-flow' },
      { name: 'Bagikan Paket (Share)', action: 'Menyalin tautan paket ke clipboard atau WhatsApp' }
    ],
    userFlow: ['Pelajari Itinerary & Hotel', 'Pilih Jadwal Keberangkatan', 'Periksa Kuota Tersisa', 'Klik "Pesan Sekarang"'],
    relatedPages: [
      { title: 'Katalog Paket Wisata', slug: 'packages' },
      { title: 'Formulir Pemesanan', slug: 'booking-flow' }
    ]
  },
  {
    id: 'page-destinations',
    slug: 'destinations',
    pageNumber: '04',
    title: 'Eksplorasi Destinasi Dunia',
    subtitle: 'Kompilasi negara dan kota wisata mewah di seluruh penjuru benua dengan informasi budaya dan iklim.',
    role: 'PUBLIC',
    urlPath: '/destinations',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/destinations.png',
    overview: 'Halaman ini dirancang untuk menginspirasi wisatawan menentukan destinasi impian. Disusun berdasarkan benua (Eropa, Asia, Amerika, Afrika, Oseania) dan dilengkapi dengan kartu destinasi estetis yang memuat foto ikonik dan ikhtisar cuaca/musim terbaik untuk berkunjung.',
    features: [
      'Filter berdasarkan Benua dan Region',
      'Pencarian destinasi berdasarkan nama negara atau kota',
      'Informasi "Best Time to Visit" dan cuaca rata-rata',
      'Tautan langsung ke paket wisata yang berkaitan dengan destinasi tersebut'
    ],
    anatomy: [
      { id: 'dst-1', number: '01', name: 'Continent Filter Tabs', description: 'Tab untuk memilah destinasi per kawasan dunia.' },
      { id: 'dst-2', number: '02', name: 'Destination Grid Cards', description: 'Kartu visual kota dan negara dengan efek hover animasi halus.' },
      { id: 'dst-3', number: '03', name: 'Package Counter Badge', description: 'Indikator jumlah paket perjalanan yang sedang aktif di destinasi tersebut.' }
    ],
    actions: [
      { name: 'Pilih Benua', action: 'Menyaring daftar kota di kawasan tertentu' },
      { name: 'Buka Detail Destinasi', action: 'Melihat daya tarik wisata dan paket terkait', targetUrl: '/destinations/2' }
    ],
    userFlow: ['Pilih Kawasan / Benua', 'Pilih Destinasi Tertarik', 'Lihat Info Wisata & Paket'],
    relatedPages: [
      { title: 'Homepage & Hero', slug: 'home' },
      { title: 'Detail Destinasi', slug: 'destination-detail' }
    ]
  },
  {
    id: 'page-destination-detail',
    slug: 'destination-detail',
    pageNumber: '05',
    title: 'Detail Destinasi Kota / Negara',
    subtitle: 'Informasi komprehensif mengenai tempat wisata terbaik, landmark bersejarah, dan tips perjalanan.',
    role: 'PUBLIC',
    urlPath: '/destinations/2',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/destination-detail.png',
    overview: 'Menampilkan ulasan mendalam mengenai suatu kota atau negara tertentu (contoh: Tokyo, Paris, Roma). Menghadirkan tempat wisata populer (attractions), rekomendasi kuliner lokal, informasi visa, serta paket tur eksklusif yang beroperasi di wilayah tersebut.',
    features: [
      'Hero foto panorama kota dengan nama negara dan mata uang lokal',
      'Daftar Landmark & Tempat Wisata Populer dengan koordinat peta',
      'Panduan Musim & Cuaca Terbaik (Spring, Summer, Autumn, Winter)',
      'Rekomendasi Paket Wisata yang mencakup destinasi ini'
    ],
    anatomy: [
      { id: 'dd-1', number: '01', name: 'City Header Banner', description: 'Banner visual lanskap kota dengan ringkasan singkat geografis.' },
      { id: 'dd-2', number: '02', name: 'Top Attractions List', description: 'Daftar objek wisata ikonik yang wajib dikunjungi di kota ini.' },
      { id: 'dd-3', number: '03', name: 'Available Tour Packages', description: 'Paket liburan aktif yang memiliki rute ke destinasi ini.' }
    ],
    actions: [
      { name: 'Eksplorasi Objek Wisata', action: 'Melihat detail landmark dan rekomendasi spot foto' },
      { name: 'Pilih Paket Terkait', action: 'Beralih ke halaman paket untuk memesan tur' }
    ],
    userFlow: ['Baca Panduan Kota', 'Lihat Objek Wisata', 'Pilih Paket Terkait'],
    relatedPages: [
      { title: 'Eksplorasi Destinasi', slug: 'destinations' },
      { title: 'Katalog Paket Wisata', slug: 'packages' }
    ]
  },
  {
    id: 'page-search',
    slug: 'search',
    pageNumber: '06',
    title: 'Pencarian Global Aplikasi',
    subtitle: 'Mesin pencari terpadu untuk menemukan paket wisata, destinasi, dan itinerary berdasarkan kata kunci bebas.',
    role: 'PUBLIC',
    urlPath: '/search',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/search.png',
    overview: 'Pusat pencarian instan yang memungkinkan pengguna mengetikkan nama kota, negara, tema kegiatan (misal: "skiing", "honeymoon", "diving"), atau rentang budget untuk mendapatkan hasil rekomendasi secara instan dan akurat.',
    features: [
      'Pencarian real-time dengan debounce query',
      'Filter multi-tag (budget, durasi, benua)',
      'Saran pencarian populer (trending searches)'
    ],
    anatomy: [
      { id: 'sr-1', number: '01', name: 'Central Search Input', description: 'Input teks berukuran besar dengan tombol reset dan submit.' },
      { id: 'sr-2', number: '02', name: 'Results Category Tabs', description: 'Tab untuk memisahkan hasil Paket vs Destinasi.' },
      { id: 'sr-3', number: '03', name: 'Search Results Grid', description: 'Kartu-kartu hasil pencarian yang cocok dengan kata kunci.' }
    ],
    actions: [
      { name: 'Ketik Kata Kunci', action: 'Mencari data berdasarkan teks yang dimasukkan' },
      { name: 'Klik Hasil Pencarian', action: 'Membuka halaman detail dari item yang ditemukan' }
    ],
    userFlow: ['Ketik Kata Kunci', 'Lihat Rekomendasi Instan', 'Klik Hasil'],
    relatedPages: [
      { title: 'Homepage', slug: 'home' },
      { title: 'Katalog Paket', slug: 'packages' }
    ]
  },
  {
    id: 'page-promo',
    slug: 'promo',
    pageNumber: '07',
    title: 'Penawaran Khusus & Kode Promo',
    subtitle: 'Halaman promosi eksklusif yang memuat voucher diskon musiman, promo early bird, dan diskon grup.',
    role: 'PUBLIC',
    urlPath: '/promo',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/promo.png',
    overview: 'Menampilkan kumpulan penawaran hemat dan kode kupon aktif yang dapat disalin pengguna untuk digunakan saat proses checkout pemesanan paket tur.',
    features: [
      'Daftar voucher diskon aktif dengan tanggal kedaluwarsa yang jelas',
      'Tombol "Salin Kode" satu-klik dengan notifikasi toast konfirmasi',
      'Syarat & Ketentuan (T&C) penggunaan kupon'
    ],
    anatomy: [
      { id: 'pr-1', number: '01', name: 'Promo Banner Hero', description: 'Banner tematik musim liburan (cth: Musim Gugur / Liburan Akhir Tahun).' },
      { id: 'pr-2', number: '02', name: 'Coupon Card Collection', description: 'Kartu kupon dengan nominal potongan harga, kode unik, dan tombol salin.' }
    ],
    actions: [
      { name: 'Salin Kode Kupon', action: 'Menyalin kode kupon ke clipboard untuk pembayaran' },
      { name: 'Gunakan Sekarang', action: 'Mengarahkan ke katalog paket wisata' }
    ],
    userFlow: ['Pilih Promo Menarik', 'Salin Kode Kupon', 'Gunakan saat Booking'],
    relatedPages: [
      { title: 'Katalog Paket Wisata', slug: 'packages' },
      { title: 'Gerbang Pembayaran', slug: 'payment' }
    ]
  },
  {
    id: 'page-how-it-works',
    slug: 'how-it-works',
    pageNumber: '08',
    title: 'Cara Pemesanan & Alur Layanan',
    subtitle: 'Panduan langkah demi langkah bagaimana memesan liburan mewah di Nova Travel dari awal hingga selesai.',
    role: 'PUBLIC',
    urlPath: '/how-it-works',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/how-it-works.png',
    overview: 'Halaman edukasi bagi calon wisatawan untuk memahami proses bisnis Nova Travel, mulai dari kurasi paket, konsultasi visa, pembayaran terverifikasi, hingga pendampingan oleh tour manager profesional.',
    features: [
      'Infografis alur 4 tahap pemesanan yang mudah dipahami',
      'Penjelasan jaminan keamanan transaksi dan asuransi perjalanan',
      'Layanan dukungan concierge 24/7'
    ],
    anatomy: [
      { id: 'hiw-1', number: '01', name: 'Step Timeline Flow', description: 'Visualisasi tahapan: 1. Pilih Paket -> 2. Isi Data -> 3. Bayar Aman -> 4. Nikmati Liburan.' },
      { id: 'hiw-2', number: '02', name: 'Trust & Safety Section', description: 'Logo rekanan resmi perbankan, maskapai internasional, dan lisensi agen tour.' }
    ],
    actions: [
      { name: 'Mulai Pesan Sekarang', action: 'Membuka katalog paket tur', targetUrl: '/packages' },
      { name: 'Konsultasi Perjalanan', action: 'Membuka obrolan concierge / WhatsApp' }
    ],
    userFlow: ['Pahami Alur', 'Pelajari Keamanan Transaksi', 'Lakukan Pemesanan'],
    relatedPages: [
      { title: 'Pusat Bantuan & FAQ', slug: 'faq' },
      { title: 'Katalog Paket Wisata', slug: 'packages' }
    ]
  },
  {
    id: 'page-faq',
    slug: 'faq',
    pageNumber: '09',
    title: 'Pusat Bantuan & FAQ',
    subtitle: 'Kumpulan tanya jawab seputar kebijakan pembatalan, pengajuan visa, metode pembayaran, dan syarat tur.',
    role: 'PUBLIC',
    urlPath: '/faq',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/faq.png',
    overview: 'Menyediakan jawaban atas pertanyaan-pertanyaan umum dari pelanggan mengenai pembayaran Midtrans, e-ticket, kebijakan refund dana, dan ketentuan bagasi maskapai penerbangan.',
    features: [
      'Kategori FAQ (Pembayaran, Pembatalan, Paspor & Visa, Jadwal Tur)',
      'Accordion interaktif buka-tutup pertanyaan',
      'Pencarian teks instan di dalam daftar pertanyaan'
    ],
    anatomy: [
      { id: 'faq-1', number: '01', name: 'Category Filter Badges', description: 'Tombol penyaring kategori pertanyaan.' },
      { id: 'faq-2', number: '02', name: 'Accordion Q&A List', description: 'Daftar pertanyaan dengan transisi animasi halus saat dibuka.' },
      { id: 'faq-3', number: '03', name: 'Support Contact CTA', description: 'Bagian kontak langsung jika jawaban tidak ditemukan.' }
    ],
    actions: [
      { name: 'Buka Pertanyaan', action: 'Melihat jawaban detail dari pertanyaan' },
      { name: 'Hubungi Bantuan', action: 'Mengirim pesan ke admin layanan pelanggan' }
    ],
    userFlow: ['Cari Pertanyaan', 'Buka Accordion Jawaban', 'Dapatkan Solusi'],
    relatedPages: [
      { title: 'Cara Pemesanan', slug: 'how-it-works' },
      { title: 'Ulasan Pelanggan', slug: 'reviews' }
    ]
  },
  {
    id: 'page-reviews',
    slug: 'reviews',
    pageNumber: '10',
    title: 'Ulasan & Testimonial Pelanggan',
    subtitle: 'Ulasan otentik dari wisatawan yang telah menikmati perjalanan mewah bersama Nova Travel.',
    role: 'PUBLIC',
    urlPath: '/reviews',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/reviews.png',
    overview: 'Halaman bukti sosial (social proof) yang memuat penilaian bintang, pengalaman berlibur, dan foto dokumentasi perjalanan yang diunggah langsung oleh pelanggan terverifikasi.',
    features: [
      'Rata-rata rating keseluruhan (Overall Satisfaction Score)',
      'Daftar ulasan lengkap dengan avatar, nama tamu, dan nama paket yang diambil',
      'Formulir kirim ulasan bagi tamu yang telah menyelesaikan perjalanan'
    ],
    anatomy: [
      { id: 'rev-1', number: '01', name: 'Rating Summary Header', description: 'Ringkasan skor kepuasan pelanggan dan distribusi rating bintang 1-5.' },
      { id: 'rev-2', number: '02', name: 'Review Cards Grid', description: 'Kartu testimonial yang memuat testimoni, foto perjalanan, dan tanggal liburan.' }
    ],
    actions: [
      { name: 'Filter Berdasarkan Bintang', action: 'Menyaring ulasan bintang 5 atau ulasan dengan foto' },
      { name: 'Tulis Ulasan', action: 'Membuka dialog pengisian rating dan komentar' }
    ],
    userFlow: ['Baca Pengalaman Tamu', 'Lihat Foto Asli Perjalanan', 'Semakin Percaya Memesan'],
    relatedPages: [
      { title: 'Homepage & Hero', slug: 'home' },
      { title: 'Katalog Paket Wisata', slug: 'packages' }
    ]
  },
  {
    id: 'page-ai-planner',
    slug: 'ai-planner',
    pageNumber: '11',
    title: 'AI Travel Itinerary Planner',
    subtitle: 'Asisten pintar kecerdasan buatan berbasis Gemini AI untuk merancang itinerary liburan kustom dalam hitungan detik.',
    role: 'PUBLIC',
    urlPath: '/ai-planner',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/ai-planner.png',
    overview: 'Fitur inovatif berbasis AI canggih di mana pengguna cukup memasukkan destinasi impian, jumlah hari, budget, dan preferensi aktivitas (misal: "Liburan romantis santai di Jepang selama 7 hari"). Sistem akan secara otomatis menyusun jadwal perjalanan terperinci lengkap dengan perkiraan biaya.',
    features: [
      'Formulir preferensi cerdas (Tujuan, Durasi, Jumlah Orang, Anggaran, Gaya Liburan)',
      'Generasi jadwal otomatis bertenaga Google Gemini AI',
      'Kemampuan mengekspor hasil ke PDF atau menyimpannya ke Dashboard Akun',
      'Rekomendasi hotel dan tempat kuliner lokal yang terintegrasi'
    ],
    anatomy: [
      { id: 'aip-1', number: '01', name: 'AI Generator Input Form', description: 'Input kota tujuan, durasi hari, dan opsi suasana liburan.' },
      { id: 'aip-2', number: '02', name: 'Generated Itinerary Preview', description: 'Area hasil render jadwal hari demi hari yang rapi dan terstruktur.' },
      { id: 'aip-3', number: '03', name: 'Save & Export Actions', description: 'Tombol untuk menyimpan rencana ke profil atau mencetak PDF.' }
    ],
    actions: [
      { name: 'Hasilkan Itinerary (Generate)', action: 'Memicu AI untuk memproses rencana perjalanan' },
      { name: 'Simpan ke Akun', action: 'Menyimpan jadwal ke daftar itinerary tersimpan pengguna' },
      { name: 'Unduh Ringkasan', action: 'Mencetak jadwal perjalanan ke format dokumen' }
    ],
    userFlow: ['Isi Preferensi Liburan', 'Klik Hasilkan dengan AI', 'Tinjau Rekomendasi Jadwal', 'Simpan ke Akun'],
    relatedPages: [
      { title: 'Perencana Rencana Perjalanan', slug: 'itinerary' },
      { title: 'Itinerary Tersimpan User', slug: 'dashboard-itineraries' }
    ]
  },
  {
    id: 'page-itinerary',
    slug: 'itinerary',
    pageNumber: '12',
    title: 'Perencana Rencana Perjalanan Mandiri',
    subtitle: 'Kanban board dan builder interaktif untuk menyusun jadwal kegiatan liburan hari per hari secara fleksibel.',
    role: 'PUBLIC',
    urlPath: '/itinerary',
    category: 'Discovery & Public',
    screenshot: '/docs/screenshots/itinerary.png',
    overview: 'Alat perencana liburan mandiri di mana pengguna dapat menambahkan tempat kunjungan, mengatur jam kedatangan, mencatat tiket masuk, dan mengatur urutan destinasi sesuai kenyamanan pribadi.',
    features: [
      'Interactive day selector (Hari 1, Hari 2, dst.)',
      'Pencarian tempat wisata terintegrasi Geoapify Places API',
      'Penyusunan estimasi waktu tempuh dan rute perjalanan'
    ],
    anatomy: [
      { id: 'it-1', number: '01', name: 'Trip Header Information', description: 'Nama perjalanan, tanggal mulai, dan total estimasi pengeluaran.' },
      { id: 'it-2', number: '02', name: 'Day-by-Day Timeline Builder', description: 'Daftar perhentian wisata dengan jam, catatan kegiatan, dan lokasi peta.' }
    ],
    actions: [
      { name: 'Tambah Aktivitas', action: 'Menambahkan tempat baru ke jadwal perjalanan' },
      { name: 'Simpan Perjalanan', action: 'Menyimpan konfigurasi rencana perjalanan' }
    ],
    userFlow: ['Tentukan Destinasi', 'Susun Rangkaian Acara', 'Simpan Perjalanan'],
    relatedPages: [
      { title: 'AI Travel Planner', slug: 'ai-planner' },
      { title: 'Dashboard Pengguna', slug: 'dashboard' }
    ]
  },

  // ==========================================
  // B. Authentication & Account
  // ==========================================
  {
    id: 'page-login',
    slug: 'login',
    pageNumber: '13',
    title: 'Masuk Akun (Sign In)',
    subtitle: 'Antarmuka autentikasi pengguna dengan validasi kredensial aman Supabase Auth dan pengalihan peran.',
    role: 'PUBLIC',
    urlPath: '/login',
    category: 'Account & Auth',
    screenshot: '/docs/screenshots/login.png',
    overview: 'Halaman gerbang masuk utama bagi pelanggan maupun staf. Menggunakan enkripsi session token Supabase yang aman dan secara cerdas mengarahkan pengguna ke User Dashboard atau Admin Portal sesuai peran akun.',
    features: [
      'Input email dan password dengan ikon toggle intip sandi (Eye/EyeOff)',
      'Tab beralih instan antara "Sign In" dan "Sign Up"',
      'Pintasan "Forgot Password" untuk pemulihan akun',
      'Pesan kesalahan berbahasa Indonesia yang jelas dan informatif'
    ],
    anatomy: [
      { id: 'log-1', number: '01', name: 'Brand Identity', description: 'Logo mewah NOVA dan slogan Curated Luxury Journeys.' },
      { id: 'log-2', number: '02', name: 'Auth Mode Switcher', description: 'Tab kapsul untuk berganti antara login dan pendaftaran akun.' },
      { id: 'log-3', number: '03', name: 'Credentials Form', description: 'Input email dan password dengan feedback validasi instan.' },
      { id: 'log-4', number: '04', name: 'Submit Button', description: 'Tombol aksi masuk dengan status pemuatan (loading spinner).' }
    ],
    actions: [
      { name: 'Masuk (Sign In)', action: 'Mengotentikasi akun dan memulai sesi' },
      { name: 'Beralih ke Daftar', action: 'Membuka formulir pendaftaran akun baru' },
      { name: 'Lupa Kata Sandi', action: 'Mengirim tautan reset sandi ke email pengguna' }
    ],
    userFlow: ['Buka Halaman Login', 'Masukkan Email & Sandi', 'Klik Masuk', 'Diarahkan ke Dashboard'],
    relatedPages: [
      { title: 'Daftar Akun Baru', slug: 'register' },
      { title: 'Atur Ulang Kata Sandi', slug: 'reset-password' }
    ]
  },
  {
    id: 'page-register',
    slug: 'register',
    pageNumber: '14',
    title: 'Daftar Akun Baru (Sign Up)',
    subtitle: 'Formulir pendaftaran anggota baru untuk menikmati layanan pemesanan tur dan pelacakan transaksi.',
    role: 'PUBLIC',
    urlPath: '/register',
    category: 'Account & Auth',
    screenshot: '/docs/screenshots/register.png',
    overview: 'Memungkinkan calon wisatawan mendaftar ke ekosistem Nova Travel dalam beberapa detik. Sistem secara otomatis membuat profil pengguna di Supabase dan memberikan akses instan ke seluruh fitur reservasi.',
    features: [
      'Pendaftaran instan dengan konfirmasi kata sandi ganda',
      'Validasi panjang sandi minimal dan pencegahan duplikasi email',
      'Langsung login otomatis setelah pendaftaran berhasil'
    ],
    anatomy: [
      { id: 'reg-1', number: '01', name: 'Registration Inputs', description: 'Formulir input nama, email, sandi, dan konfirmasi sandi.' },
      { id: 'reg-2', number: '02', name: 'Terms & Conditions Note', description: 'Pemberitahuan persetujuan ketentuan layanan privasi.' }
    ],
    actions: [
      { name: 'Buat Akun', action: 'Mendaftarkan akun baru ke database' },
      { name: 'Masuk ke Akun Lama', action: 'Pindah ke form Sign In jika sudah punya akun' }
    ],
    userFlow: ['Isi Form Pendaftaran', 'Klik Buat Akun', 'Masuk ke Dashboard'],
    relatedPages: [
      { title: 'Masuk Akun', slug: 'login' },
      { title: 'Ringkasan Dashboard', slug: 'dashboard' }
    ]
  },
  {
    id: 'page-reset-password',
    slug: 'reset-password',
    pageNumber: '15',
    title: 'Atur Ulang Kata Sandi',
    subtitle: 'Halaman keamanan untuk memperbarui kata sandi baru setelah menerima tautan pemulihan melalui email.',
    role: 'PUBLIC',
    urlPath: '/auth/reset-password',
    category: 'Account & Auth',
    screenshot: '/docs/screenshots/reset-password.png',
    overview: 'Menjamin keamanan akun wisatawan ketika mereka lupa kata sandi. Halaman ini memvalidasi token sesi khusus pemulihan dan meminta kata sandi baru yang kuat.',
    features: [
      'Validasi keamanan token pemulihan sandi',
      'Input kata sandi baru dan konfirmasi kata sandi',
      'Pengalihan otomatis ke halaman masuk setelah berhasil diubah'
    ],
    anatomy: [
      { id: 'rp-1', number: '01', name: 'Password Reset Form', description: 'Formulir input kata sandi baru dengan standar minimal 6 karakter.' },
      { id: 'rp-2', number: '02', name: 'Update CTA', description: 'Tombol simpan perubahan kata sandi baru.' }
    ],
    actions: [
      { name: 'Perbarui Sandi', action: 'Menyimpan kata sandi baru ke sistem keamanan' }
    ],
    userFlow: ['Buka Link dari Email', 'Ketik Sandi Baru', 'Simpan & Login Kembali'],
    relatedPages: [
      { title: 'Masuk Akun', slug: 'login' }
    ]
  },
  {
    id: 'page-profile',
    slug: 'profile',
    pageNumber: '16',
    title: 'Profil & Preferensi Pengguna',
    subtitle: 'Manajemen informasi pribadi, nomor telepon darurat, preferensi bahasa, dan mata uang.',
    role: 'USER',
    urlPath: '/profile',
    category: 'Account & Auth',
    screenshot: '/docs/screenshots/profile.png',
    overview: 'Pusat data diri anggota Nova Travel. Wisatawan dapat memperbarui nama lengkap, nomor paspor, kontak darurat, serta preferensi mata uang yang digunakan di seluruh aplikasi.',
    features: [
      'Manajemen Nama Lengkap dan Email Akun',
      'Pengaturan nomor WhatsApp / Telepon untuk konfirmasi tiket',
      'Pilihan mata uang default (IDR, USD, EUR, GBP, JPY)',
      'Riwayat aktivitas login dan tombol Logout aman'
    ],
    anatomy: [
      { id: 'prf-1', number: '01', name: 'Profile Avatar & Role Badge', description: 'Foto profil pengguna, nama tampilan, dan label membership.' },
      { id: 'prf-2', number: '02', name: 'Personal Details Form', description: 'Field pengeditan informasi kontak dan dokumen perjalanan.' },
      { id: 'prf-3', number: '03', name: 'Account Actions Bar', description: 'Tombol Simpan Perubahan dan opsi Keluar dari Akun.' }
    ],
    actions: [
      { name: 'Simpan Perubahan', action: 'Memperbarui profil pengguna di database' },
      { name: 'Keluar (Sign Out)', action: 'Menghapus sesi login dan kembali ke beranda' }
    ],
    userFlow: ['Buka Profil Akun', 'Perbarui Data Kontak', 'Simpan Perubahan'],
    relatedPages: [
      { title: 'Ringkasan Dashboard', slug: 'dashboard' },
      { title: 'Wishlist & Paket Impian', slug: 'wishlist' }
    ]
  },
  {
    id: 'page-wishlist',
    slug: 'wishlist',
    pageNumber: '17',
    title: 'Wishlist & Paket Impian',
    subtitle: 'Koleksi paket wisata yang telah ditandai dan disimpan pengguna untuk direncanakan di masa mendatang.',
    role: 'USER',
    urlPath: '/wishlist',
    category: 'Account & Auth',
    screenshot: '/docs/screenshots/wishlist.png',
    overview: 'Memudahkan pengguna melacak tur yang mereka minati tanpa harus mencari ulang dari awal. Dari halaman ini, pengguna dapat langsung mengecek apakah kuota masih tersedia atau langsung melanjutkan ke proses pemesanan.',
    features: [
      'Grid kartu paket yang tersimpan di daftar favorit',
      'Opsi satu klik untuk menghapus paket dari wishlist',
      'Tombol langsung memesan paket yang tersimpan'
    ],
    anatomy: [
      { id: 'wsh-1', number: '01', name: 'Wishlist Counter Header', description: 'Jumlah paket liburan impian yang telah dikoleksi.' },
      { id: 'wsh-2', number: '02', name: 'Saved Package Cards', description: 'Kartu tur dengan penanda ikon hati merah dan harga terkini.' }
    ],
    actions: [
      { name: 'Hapus dari Favorit', action: 'Menghilangkan item dari daftar wishlist' },
      { name: 'Pesan Sekarang', action: 'Membuka jadwal tur untuk pemesanan', targetUrl: '/packages' }
    ],
    userFlow: ['Lihat Koleksi Wishlist', 'Tinjau Paket Tersimpan', 'Lanjut ke Booking'],
    relatedPages: [
      { title: 'Katalog Paket Wisata', slug: 'packages' },
      { title: 'Ringkasan Dashboard', slug: 'dashboard' }
    ]
  },

  // ==========================================
  // C. Booking & Transaction
  // ==========================================
  {
    id: 'page-booking-flow',
    slug: 'booking-flow',
    pageNumber: '18',
    title: 'Formulir Pemesanan & Data Tamu',
    subtitle: 'Langkah pemesanan terpadu untuk mengisi data pemesan, nama penumpang/peserta tur, dan kontak konfirmasi.',
    role: 'USER',
    urlPath: '/booking/131/2171',
    category: 'Booking & Payments',
    screenshot: '/docs/screenshots/booking-flow.png',
    overview: 'Formulir 3-tahap (Data Pemesan -> Rincian Peserta -> Review Pesanan) yang dirancang bersih dan bebas distorsi. Memastikan seluruh data paspor dan kebutuhan khusus (vegetarian, kursi roda) tercatat dengan akurat sebelum diterbitkan invoice.',
    features: [
      'Multi-step wizard form yang intuitif (Details -> Review -> Payment)',
      'Input dinamis jumlah peserta (dewasa / anak-anak)',
      'Kalkulasi otomatis biaya per pax dikalikan jumlah peserta ditambah service fee',
      'Pemberian kode reservasi unik booking instan'
    ],
    anatomy: [
      { id: 'bf-1', number: '01', name: 'Step Progress Tracker', description: 'Indikator tahapan pengisian formulir pemesanan.' },
      { id: 'bf-2', number: '02', name: 'Contact & Guest Details Form', description: 'Field nama lengkap, nomor WhatsApp, email, dan catatan perjalanan.' },
      { id: 'bf-3', number: '03', name: 'Price & Order Summary Card', description: 'Kotak ringkasan nama tur, tanggal berangkat, dan kalkulasi total pembayaran.' }
    ],
    actions: [
      { name: 'Lanjutkan ke Review', action: 'Memvalidasi formulir dan menampilkan ringkasan pesanan' },
      { name: 'Konfirmasi & Bayar', action: 'Membuat rekaman pesanan dan mengarahkan ke halaman pembayaran' }
    ],
    userFlow: ['Pilih Jadwal Keberangkatan', 'Isi Data Tamu & Kontak', 'Periksa Ringkasan Biaya', 'Lanjut ke Pembayaran'],
    relatedPages: [
      { title: 'Detail Paket Wisata', slug: 'package-detail' },
      { title: 'Gerbang Pembayaran', slug: 'payment' }
    ]
  },
  {
    id: 'page-payment',
    slug: 'payment',
    pageNumber: '19',
    title: 'Gerbang Pembayaran & Invoice',
    subtitle: 'Halaman pemilihan kanal pembayaran resmi yang terhubung dengan Midtrans Payment Gateway.',
    role: 'USER',
    urlPath: '/payment/1',
    category: 'Booking & Payments',
    screenshot: '/docs/screenshots/payment.png',
    overview: 'Menghubungkan tamu dengan berbagai metode pembayaran terpercaya di Indonesia dan internasional, termasuk Virtual Account BCA/Mandiri/BNI, Kartu Kredit 3D-Secure, QRIS instan, dan e-Wallet.',
    features: [
      'Dukungan integrasi resmi Midtrans Snap Gateway',
      'Pilihan Bank Virtual Account (BCA, Mandiri, BNI, BRI, Permata)',
      'QRIS instan untuk pembayaran melalui aplikasi perbankan apa saja',
      'Input kode kupon promo untuk mendapatkan potongan langsung di tempat',
      'Timer hitung mundur batas waktu pembayaran (Payment Expiry Timer)'
    ],
    anatomy: [
      { id: 'pay-1', number: '01', name: 'Booking Reference & Countdown', description: 'Kode booking, tenggat waktu penyelesaian pembayaran, dan status tagihan.' },
      { id: 'pay-2', number: '02', name: 'Payment Method Selector', description: 'Opsi kanal bayar (VA Bank, QRIS, Kartu Kredit, GoPay/ShopeePay).' },
      { id: 'pay-3', number: '03', name: 'Voucher Code Section', description: 'Field input kode kupon promo dengan tombol "Terapkan".' },
      { id: 'pay-4', number: '04', name: 'Final Payment Trigger', description: 'Tombol "Bayar Sekarang" yang memunculkan popup pembayaran Midtrans.' }
    ],
    actions: [
      { name: 'Terapkan Kupon', action: 'Menghitung diskon tagihan secara real-time' },
      { name: 'Bayar Sekarang', action: 'Membuka popup Snap Midtrans untuk transaksi langsung' }
    ],
    userFlow: ['Pilih Metode Bayar', 'Terapkan Diskon Kupon', 'Selesaikan Pembayaran', 'Terima Tiket Konfirmasi'],
    relatedPages: [
      { title: 'Formulir Pemesanan', slug: 'booking-flow' },
      { title: 'Konfirmasi Pembayaran Sukses', slug: 'payment-confirmation' }
    ]
  },
  {
    id: 'page-payment-confirmation',
    slug: 'payment-confirmation',
    pageNumber: '20',
    title: 'Konfirmasi Pembayaran & Tiket',
    subtitle: 'Halaman status akhir setelah pembayaran diverifikasi, dilengkapi tanda bukti reservasi dan nomor tiket.',
    role: 'USER',
    urlPath: '/payment/confirmation/1',
    category: 'Booking & Payments',
    screenshot: '/docs/screenshots/payment-confirmation.png',
    overview: 'Memberikan kepastian kepada wisatawan bahwa dana telah diterima dan kursi keberangkatan telah dikonfirmasi secara resmi. Dilengkapi tombol unduh tanda terima dan pintasan ke Dashboard Akun.',
    features: [
      'Visual animasi centang sukses pembayaran terverifikasi',
      'Rincian nomor booking, tanggal keberangkatan, dan total nominal dibayar',
      'Opsi cetak bukti pembayaran atau simpan PDF',
      'Tautan cepat menuju manajemen pemesanan di dashboard pengguna'
    ],
    anatomy: [
      { id: 'pc-1', number: '01', name: 'Success Confirmation Banner', description: 'Badge status "Payment Successful" berwarna hijau elegan.' },
      { id: 'pc-2', number: '02', name: 'Booking Summary Receipt', description: 'Struk digital transaksi yang memuat seluruh rincian pembelian.' },
      { id: 'pc-3', number: '03', name: 'Navigation Quick Links', description: 'Tombol "Lihat Pesanan Saya" dan "Kembali ke Beranda".' }
    ],
    actions: [
      { name: 'Buka Tiket Saya', action: 'Membuka halaman detail pesanan di user dashboard', targetUrl: '/dashboard-bookings' },
      { name: 'Cetak Bukti Bayar', action: 'Membuka dialog print / save PDF di browser' }
    ],
    userFlow: ['Pembayaran Terverifikasi', 'Tinjau Rincian Struk', 'Buka Tiket di Dashboard'],
    relatedPages: [
      { title: 'Gerbang Pembayaran', slug: 'payment' },
      { title: 'Riwayat Pesanan Saya', slug: 'dashboard-bookings' }
    ]
  },

  // ==========================================
  // D. User Dashboard
  // ==========================================
  {
    id: 'page-dashboard',
    slug: 'dashboard',
    pageNumber: '21',
    title: 'Ringkasan Dashboard Pengguna',
    subtitle: 'Beranda sentral bagi wisatawan untuk memantau perjalanan aktif, pesanan mendatang, dan notifikasi akun.',
    role: 'USER',
    urlPath: '/dashboard',
    category: 'User Dashboard',
    screenshot: '/docs/screenshots/dashboard.png',
    overview: 'Panel kendali pribadi wisatawan yang merangkum semua aktivitas perjalanan. Dari sini tamu dapat melihat hitung mundur keberangkatan tur berikutnya, status pembayaran yang belum diselesaikan, dan akses cepat ke layanan bantuan concierge.',
    features: [
      'Statistik ringkas (Total Perjalanan, Booking Aktif, Itinerary Tersimpan)',
      'Widget "Next Upcoming Trip" dengan countdown hari menuju keberangkatan',
      'Daftar pesanan terbaru beserta status konfirmasi',
      'Sidebar navigasi khusus anggota'
    ],
    anatomy: [
      { id: 'ud-1', number: '01', name: 'Welcome Banner & Avatar', description: 'Sapaan personal nama pengguna beserta status keanggotaan.' },
      { id: 'ud-2', number: '02', name: 'Quick Stat Metric Cards', description: 'Indikator ringkas jumlah pesanan dan rencana perjalanan.' },
      { id: 'ud-3', number: '03', name: 'Upcoming Trip Highlight', description: 'Kartu perjalanan terdekat lengkap dengan jadwal dan destinasi.' },
      { id: 'ud-4', number: '04', name: 'Recent Activity Feed', description: 'Daftar transaksi dan pembaruan terkini.' }
    ],
    actions: [
      { name: 'Kelola Pesanan', action: 'Melihat seluruh riwayat tiket dan booking', targetUrl: '/dashboard-bookings' },
      { name: 'Lihat Wishlist', action: 'Membuka paket yang disimpan pengguna' },
      { name: 'Eksplorasi Paket Baru', action: 'Membuka katalog tur untuk merencanakan liburan baru' }
    ],
    userFlow: ['Login ke Akun', 'Cek Jadwal Berangkat Terdekat', 'Akses Tiket / Invoice'],
    relatedPages: [
      { title: 'Riwayat Pesanan Saya', slug: 'dashboard-bookings' },
      { title: 'Profil Pengguna', slug: 'profile' }
    ]
  },
  {
    id: 'page-dashboard-bookings',
    slug: 'dashboard-bookings',
    pageNumber: '22',
    title: 'Riwayat Pesanan Saya',
    subtitle: 'Daftar komprehensif seluruh transaksi dan reservasi paket tur yang pernah dilakukan oleh pengguna.',
    role: 'USER',
    urlPath: '/dashboard/bookings',
    category: 'User Dashboard',
    screenshot: '/docs/screenshots/dashboard-bookings.png',
    overview: 'Halaman pelacakan pesanan di mana wisatawan dapat memeriksa status tiket mereka (Pending, Confirmed, Cancelled, Refunded). Setiap pesanan dapat dibuka untuk melihat e-ticket, kwitansi pembayaran, atau mengajukan pembatalan/refund jika berhalangan.',
    features: [
      'Filter status pesanan (Semua, Menunggu Pembayaran, Terkonfirmasi, Selesai)',
      'Kartu tiket informatif dengan kode booking dan tanggal keberangkatan',
      'Akses langsung ke tombol "Lanjutkan Pembayaran" jika status masih unpaid',
      'Tombol "Lihat E-Ticket & Detail"'
    ],
    anatomy: [
      { id: 'db-1', number: '01', name: 'Booking Filter Tabs', description: 'Tab pemilahan status reservasi.' },
      { id: 'db-2', number: '02', name: 'Booking Cards List', description: 'Daftar kartu reservasi dengan nama paket, jumlah pax, dan status tagihan.' },
      { id: 'db-3', number: '03', name: 'Quick Action Buttons', description: 'Tombol rincian pesanan dan unduh e-ticket.' }
    ],
    actions: [
      { name: 'Lihat Detail Tiket', action: 'Membuka halaman detail pesanan dan e-ticket', targetUrl: '/dashboard-booking-detail' },
      { name: 'Bayar Tagihan', action: 'Melanjutkan transaksi yang tertunda' }
    ],
    userFlow: ['Buka Riwayat Pesanan', 'Pilih Reservasi yang Ingin Dicek', 'Buka E-Ticket / Invoice'],
    relatedPages: [
      { title: 'Ringkasan Dashboard', slug: 'dashboard' },
      { title: 'Detail Tiket & Invoice', slug: 'dashboard-booking-detail' }
    ]
  },
  {
    id: 'page-dashboard-booking-detail',
    slug: 'dashboard-booking-detail',
    pageNumber: '23',
    title: 'Detail Tiket & Invoice Pesanan',
    subtitle: 'Informasi lengkap pemesanan, tiket digital, rincian biaya, dan opsi pengajuan pengembalian dana (refund).',
    role: 'USER',
    urlPath: '/dashboard/bookings/1',
    category: 'User Dashboard',
    screenshot: '/docs/screenshots/dashboard-booking-detail.png',
    overview: 'Merupakan bukti reservasi digital sah yang memuat QR Code tiket, data seluruh peserta tur, rincian meeting point di bandara, dan formulir pengajuan refund dana jika terjadi kendala perjalanan.',
    features: [
      'Tampilan E-Ticket bergaya boarding pass mewah dengan QR Code verifikasi',
      'Rincian data kontak dan seluruh nama penumpang yang terdaftar',
      'Rincian finansial (Harga Paket, Diskon Kupon, Service Fee, Total Dibayar)',
      'Tombol Pengajuan Refund dengan formulir alasan pembatalan resmi',
      'Unduh tiket PDF resmi untuk dicetak fisik'
    ],
    anatomy: [
      { id: 'dbd-1', number: '01', name: 'E-Ticket Boarding Pass', description: 'Komponen tiket visual dengan logo maskapai/tur, barcode, dan tanggal terbang.' },
      { id: 'dbd-2', number: '02', name: 'Passenger & Schedule Table', description: 'Tabel nama-nama tamu dan jadwal pertemuan tour leader.' },
      { id: 'dbd-3', number: '03', name: 'Payment Breakdown Receipt', description: 'Rincian transaksi resmi dan metode bayar yang digunakan.' },
      { id: 'dbd-4', number: '04', name: 'Refund Request Modal / Section', description: 'Area pengajuan permohonan pengembalian dana sesuai kebijakan.' }
    ],
    actions: [
      { name: 'Unduh E-Ticket (PDF)', action: 'Mengunduh berkas tiket PDF ke perangkat' },
      { name: 'Ajukan Pengembalian Dana (Refund)', action: 'Membuka modal alasan pembatalan pesanan' }
    ],
    userFlow: ['Pilih Pesanan', 'Tinjau Tiket & Jadwal', 'Unduh PDF atau Ajukan Bantuan'],
    relatedPages: [
      { title: 'Riwayat Pesanan', slug: 'dashboard-bookings' },
      { title: 'Manajemen Pengembalian Dana', slug: 'admin-refunds' }
    ]
  },
  {
    id: 'page-dashboard-itineraries',
    slug: 'dashboard-itineraries',
    pageNumber: '24',
    title: 'Itinerary Tersimpan Pengguna',
    subtitle: 'Arsip rencana perjalanan kustom hasil rancangan AI Planner atau susunan mandiri.',
    role: 'USER',
    urlPath: '/dashboard/itineraries',
    category: 'User Dashboard',
    screenshot: '/docs/screenshots/dashboard-itineraries.png',
    overview: 'Tempat pengguna menyimpan berbagai konsep liburan masa depan. Jadwal yang telah dirancang dapat diedit kembali, dibagikan ke rekan seperjalanan, atau dikonversi menjadi permintaan paket privat ke admin.',
    features: [
      'Daftar rencana perjalanan tersimpan lengkap dengan estimasi hari',
      'Opsi membuka kembali rencana untuk diedit',
      'Tombol ekspor dokumen rencana perjalanan'
    ],
    anatomy: [
      { id: 'di-1', number: '01', name: 'Itinerary Collection Grid', description: 'Kartu ringkasan rencana perjalanan dengan nama kota tujuan.' },
      { id: 'di-2', number: '02', name: 'Create New Plan CTA', description: 'Tombol untuk membuka AI Planner atau perencana mandiri.' }
    ],
    actions: [
      { name: 'Buka & Edit Itinerary', action: 'Membuka editor rencana perjalanan' },
      { name: 'Buat Rencana Baru', action: 'Membuka AI Travel Planner', targetUrl: '/ai-planner' }
    ],
    userFlow: ['Buka Koleksi Itinerary', 'Pilih Rencana Liburan', 'Kustomisasi Jadwal'],
    relatedPages: [
      { title: 'AI Travel Planner', slug: 'ai-planner' },
      { title: 'Perencana Perjalanan', slug: 'itinerary' }
    ]
  },
  {
    id: 'page-dashboard-wishlist',
    slug: 'dashboard-wishlist',
    pageNumber: '25',
    title: 'Favorit & Paket Disimpan Dashboard',
    subtitle: 'Akses cepat ke daftar paket wisata impian di dalam navigasi user dashboard.',
    role: 'USER',
    urlPath: '/dashboard/wishlist',
    category: 'User Dashboard',
    screenshot: '/docs/screenshots/dashboard-wishlist.png',
    overview: 'Menyinkronkan wishlist pengguna di dalam tata letak dashboard yang rapi, memungkinkan wisatawan memantau penurunan harga atau kuota yang menipis pada paket incaran.',
    features: [
      'Sinkronisasi real-time dengan database akun Supabase',
      'Tanda indikator kuota tersisa pada setiap paket favorit'
    ],
    anatomy: [
      { id: 'dw-1', number: '01', name: 'Wishlist Item Cards', description: 'Kartu tur dengan foto, harga, dan tombol pesan langsung.' }
    ],
    actions: [
      { name: 'Pesan Paket Favorit', action: 'Membuka halaman pemesanan paket tur', targetUrl: '/packages' }
    ],
    userFlow: ['Lihat Paket Favorit', 'Periksa Ketersediaan', 'Lakukan Pemesanan'],
    relatedPages: [
      { title: 'Ringkasan Dashboard', slug: 'dashboard' },
      { title: 'Katalog Paket', slug: 'packages' }
    ]
  },
  {
    id: 'page-dashboard-notifications',
    slug: 'dashboard-notifications',
    pageNumber: '26',
    title: 'Pusat Pemberitahuan Akun',
    subtitle: 'Pemberitahuan real-time mengenai status pembayaran, konfirmasi tiket, dan pengingat keberangkatan.',
    role: 'USER',
    urlPath: '/dashboard/notifications',
    category: 'User Dashboard',
    screenshot: '/docs/screenshots/dashboard-notifications.png',
    overview: 'Mengumpulkan seluruh notifikasi penting akun, mulai dari perubahan jam penerbangan, tiket yang telah terbit, hingga promosi eksklusif yang ditujukan khusus untuk profil pengguna.',
    features: [
      'Daftar notifikasi dengan penanda status Dibaca / Belum Dibaca',
      'Filter berdasarkan kategori pesan (Transaksi, Pengumuman, Promo)',
      'Pemberitahuan terintegrasi sistem email Resend'
    ],
    anatomy: [
      { id: 'dn-1', number: '01', name: 'Notification Feed', description: 'Daftar baris notifikasi dengan ikon penanda status dan waktu kejadian.' },
      { id: 'dn-2', number: '02', name: 'Mark All as Read Action', description: 'Tombol untuk menandai semua notifikasi telah dibaca.' }
    ],
    actions: [
      { name: 'Tandai Telah Dibaca', action: 'Mengubah status notifikasi menjadi terbaca' },
      { name: 'Klik Notifikasi', action: 'Membuka halaman terkait transaksi yang dimaksud' }
    ],
    userFlow: ['Buka Notifikasi', 'Baca Informasi Terkini', 'Buka Tautan Transaksi'],
    relatedPages: [
      { title: 'Ringkasan Dashboard', slug: 'dashboard' },
      { title: 'Riwayat Pesanan', slug: 'dashboard-bookings' }
    ]
  },

  // ==========================================
  // E. Admin Portal
  // ==========================================
  {
    id: 'page-admin-dashboard',
    slug: 'admin-dashboard',
    pageNumber: '27',
    title: 'Ringkasan Metrik Admin Portal',
    subtitle: 'Pusat komando eksekutif untuk memantau pendapatan kotor, total booking, okupansi tur, dan pengguna aktif.',
    role: 'ADMIN',
    urlPath: '/admin',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-dashboard.png',
    overview: 'Dasbor komprehensif bagi manajemen dan super admin Nova Travel. Menampilkan ringkasan finansial (Gross Revenue), tingkat keberhasilan transaksi Midtrans, jumlah kuota terisi, serta tabel reservasi terbaru yang memerlukan perhatian operasional.',
    features: [
      'Metric Cards (Total Pendapatan, Booking Selesai, Pengguna Baru, Okupansi Kursi)',
      'Grafik Tren Penjualan & Performa Bulanan',
      'Tabel Transaksi Terbaru yang terhubung langsung ke status Midtrans',
      'Pintasan cepat untuk menambah paket tur baru atau meninjau refund tertunda'
    ],
    anatomy: [
      { id: 'ad-1', number: '01', name: 'Executive Metric Cards', description: 'Kartu KPI dengan perbandingan persentase pertumbuhan bulanan.' },
      { id: 'ad-2', number: '02', name: 'Revenue & Occupancy Charts', description: 'Visualisasi grafik pendapatan dan tren destinasi paling diminati.' },
      { id: 'ad-3', number: '03', name: 'Live Orders Table', description: 'Tabel transaksi masuk dengan badge status pembayaran real-time.' },
      { id: 'ad-4', number: '04', name: 'Admin Sidebar Navigation', description: 'Menu navigasi lengkap modul operasional, CMS, dan laporan finansial.' }
    ],
    actions: [
      { name: 'Tambah Paket Baru', action: 'Membuka formulir pembuatan paket tur baru' },
      { name: 'Buka Manajemen Booking', action: 'Melihat seluruh daftar transaksi', targetUrl: '/admin-bookings' },
      { name: 'Unduh Laporan Keuangan', action: 'Beralih ke modul laporan dan ekspor PDF', targetUrl: '/admin-reports' }
    ],
    userFlow: ['Login Admin', 'Tinjau Performa Bisnis Hari Ini', 'Kelola Transaksi & Operasional'],
    relatedPages: [
      { title: 'Manajemen Paket Wisata', slug: 'admin-packages' },
      { title: 'Manajemen Seluruh Transaksi', slug: 'admin-bookings' },
      { title: 'Laporan Finansial', slug: 'admin-reports' }
    ]
  },
  {
    id: 'page-admin-packages',
    slug: 'admin-packages',
    pageNumber: '28',
    title: 'Manajemen Paket Wisata (CRUD)',
    subtitle: 'Pengelolaan katalog tur, penetapan harga, durasi malam, fasilitas inklusi, dan unggah galeri foto.',
    role: 'ADMIN',
    urlPath: '/admin/packages',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-packages.png',
    overview: 'Modul inti untuk mengelola produk tour yang dipasarkan di aplikasi. Admin dapat membuat paket baru, mengubah deskripsi, mengatur jadwal itinerary hari demi hari, serta mengatur status publikasi (Aktif / Nonaktif).',
    features: [
      'Tabel paket komprehensif dengan pencarian dan filter kategori',
      'Modal formulir pembuatan dan penyuntingan paket lengkap dengan Rich Text',
      'Pengaturan harga, durasi malam, dan kapasitas maksimal rombongan',
      'Opsi hapus paket atau nonaktifkan dari katalog publik'
    ],
    anatomy: [
      { id: 'ap-1', number: '01', name: 'Packages Action Header', description: 'Tombol "Tambah Paket Baru" dan bilah pencarian nama paket.' },
      { id: 'ap-2', number: '02', name: 'Package Data Table', description: 'Tabel daftar paket dengan kolom Gambar, Judul, Kategori, Harga, dan Aksi.' },
      { id: 'ap-3', number: '03', name: 'Action Buttons (Edit/Delete)', description: 'Ikon pensil untuk ubah dan ikon tempat sampah untuk hapus.' }
    ],
    actions: [
      { name: 'Tambah Paket Baru', action: 'Membuka modal input data paket lengkap' },
      { name: 'Edit Paket', action: 'Memperbarui informasi itinerary dan harga' },
      { name: 'Hapus Paket', action: 'Menghapus paket dari database dengan konfirmasi aman' }
    ],
    userFlow: ['Buka Menu Paket', 'Klik Tambah / Edit', 'Isi Deskripsi & Harga', 'Simpan ke Database'],
    relatedPages: [
      { title: 'Ringkasan Metrik Admin', slug: 'admin-dashboard' },
      { title: 'Jadwal Keberangkatan Tour', slug: 'admin-departures' }
    ]
  },
  {
    id: 'page-admin-destinations',
    slug: 'admin-destinations',
    pageNumber: '29',
    title: 'Manajemen Destinasi & Lokasi',
    subtitle: 'Pengelolaan daftar negara, kota, foto lanskap, koordinat peta, dan deskripsi kebudayaan.',
    role: 'ADMIN',
    urlPath: '/admin/destinations',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-destinations.png',
    overview: 'Menata seluruh basis data destinasi yang menjadi tujuan tur. Admin dapat menambahkan destinasi baru di seluruh benua, menyematkan landmark populer, dan menghubungkannya dengan paket wisata.',
    features: [
      'CRUD Destinasi (Nama Kota, Negara, Benua, Foto Utama, Deskripsi)',
      'Pencarian dan penataan kawasan geografis',
      'Penetapan koordinat lintang & bujur untuk integrasi peta Mapbox / Geoapify'
    ],
    anatomy: [
      { id: 'ads-1', number: '01', name: 'Add Destination Button', description: 'Tombol untuk meluncurkan formulir input destinasi baru.' },
      { id: 'ads-2', number: '02', name: 'Destination Table / Grid', description: 'Koleksi destinasi dengan foto thumbnail dan jumlah paket terkait.' }
    ],
    actions: [
      { name: 'Tambah Destinasi', action: 'Menyimpan negara/kota baru ke sistem' },
      { name: 'Edit Data Destinasi', action: 'Mengubah deskripsi dan foto kota' }
    ],
    userFlow: ['Buka Menu Destinasi', 'Tambahkan Kota Baru', 'Kaitkan dengan Paket Tur'],
    relatedPages: [
      { title: 'Manajemen Paket Wisata', slug: 'admin-packages' },
      { title: 'Eksplorasi Destinasi Dunia', slug: 'destinations' }
    ]
  },
  {
    id: 'page-admin-departures',
    slug: 'admin-departures',
    pageNumber: '30',
    title: 'Jadwal Keberangkatan Tour & Kuota',
    subtitle: 'Manajemen tanggal penerbangan, kapasitas kursi rombongan, dan pelacakan sisa slot tersedia.',
    role: 'ADMIN',
    urlPath: '/admin/departures',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-departures.png',
    overview: 'Mengontrol slot kuota keberangkatan untuk setiap paket wisata. Admin menentukan tanggal mulai dan selesai tur, kapasitas kursi (contoh: 16 pax per rombongan), serta harga khusus pada tanggal tertentu.',
    features: [
      'Manajemen jadwal tanggal (Start Date - End Date)',
      'Pengaturan batas kapasitas kursi dan otomatisasi status (Available / Limited / Sold Out)',
      'Penyesuaian harga musiman (High Season vs Low Season)'
    ],
    anatomy: [
      { id: 'adp-1', number: '01', name: 'Departure Scheduler Form', description: 'Pemilihan paket dan penentuan rentang tanggal keberangkatan.' },
      { id: 'adp-2', number: '02', name: 'Slot Allocation Table', description: 'Tabel sisa kursi per jadwal beserta daftar tamu yang telah memesan.' }
    ],
    actions: [
      { name: 'Buat Jadwal Baru', action: 'Membuka slot tanggal baru untuk paket yang dipilih' },
      { name: 'Ubah Kuota', action: 'Menambah atau mengurangi kapasitas maksimal peserta' }
    ],
    userFlow: ['Pilih Paket Tur', 'Tetapkan Tanggal & Kuota', 'Simpan Jadwal'],
    relatedPages: [
      { title: 'Manajemen Paket Wisata', slug: 'admin-packages' },
      { title: 'Manajemen Seluruh Transaksi', slug: 'admin-bookings' }
    ]
  },
  {
    id: 'page-admin-bookings',
    slug: 'admin-bookings',
    pageNumber: '31',
    title: 'Manajemen Seluruh Transaksi & Approval',
    subtitle: 'Pengawasan seluruh transaksi reservasi, verifikasi status Midtrans, dan penerbitan tiket manual.',
    role: 'ADMIN',
    urlPath: '/admin/bookings',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-bookings.png',
    overview: 'Pusat operasi kasir dan pemesanan. Petugas dapat melihat semua reservasi yang masuk, mencari berdasarkan kode booking, memverifikasi pembayaran yang tertunda, dan mengubah status menjadi Terkonfirmasi.',
    features: [
      'Pencarian instan berdasarkan Kode Booking, Nama Tamu, atau Email',
      'Filter multi-status (Unpaid, Paid, Pending, Confirmed, Cancelled)',
      'Sinkronisasi manual dengan status transaksi Midtrans Payment Gateway',
      'Ekspor daftar pesanan ke format CSV / Excel'
    ],
    anatomy: [
      { id: 'ab-1', number: '01', name: 'Booking Search & Filter Bar', description: 'Filter status pembayaran dan kolom pencarian kode booking.' },
      { id: 'ab-2', number: '02', name: 'Master Bookings Table', description: 'Tabel berisi ID pesanan, nama paket, data pemesan, total bayar, dan status.' },
      { id: 'ab-3', number: '03', name: 'Status Toggle & Actions', description: 'Tombol untuk mengubah status pembayaran atau membuka rincian invoice.' }
    ],
    actions: [
      { name: 'Cari Transaksi', action: 'Menemukan pesanan berdasarkan kode atau email' },
      { name: 'Perbarui Status', action: 'Mengubah status pesanan menjadi Confirmed atau Cancelled' },
      { name: 'Ekspor Data Pesanan', action: 'Mengunduh laporan transaksi ke format spreadsheet' }
    ],
    userFlow: ['Buka Menu Booking', 'Filter Status yang Perlu Dicek', 'Verifikasi Pembayaran', 'Konfirmasi Pesanan'],
    relatedPages: [
      { title: 'Ringkasan Metrik Admin', slug: 'admin-dashboard' },
      { title: 'Manajemen Pengembalian Dana', slug: 'admin-refunds' }
    ]
  },
  {
    id: 'page-admin-coupons',
    slug: 'admin-coupons',
    pageNumber: '32',
    title: 'Kupon Diskon & Voucher Promo',
    subtitle: 'Pembuatan kode voucher diskon persentase atau nominal tetap dengan kuota penggunaan dan tanggal kedaluwarsa.',
    role: 'ADMIN',
    urlPath: '/admin/coupons',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-coupons.png',
    overview: 'Alat pemasaran bagi tim marketing untuk mengelola kode promo. Admin dapat menetapkan kode (misal: "NOVA15"), besaran diskon, minimum transaksi, kuota batas pemakaian, serta periode waktu berlakunya kupon.',
    features: [
      'Pembuatan kupon dengan tipe diskon Persen (%) atau Potongan Tetap (IDR)',
      'Batas minimum pembelanjaan dan batas kuota maksimal pemakaian',
      'Tanggal mulai dan berakhirnya voucher promosi'
    ],
    anatomy: [
      { id: 'ac-1', number: '01', name: 'Create Coupon Modal', description: 'Formulir input kode kupon, nilai diskon, dan aturan penggunaan.' },
      { id: 'ac-2', number: '02', name: 'Active Coupons Table', description: 'Daftar kupon aktif dengan indikator berapa kali kode telah digunakan oleh tamu.' }
    ],
    actions: [
      { name: 'Buat Kode Kupon Baru', action: 'Menambahkan kupon promosi baru ke sistem' },
      { name: 'Nonaktifkan Kupon', action: 'Menonaktifkan kupon agar tidak bisa digunakan lagi di checkout' }
    ],
    userFlow: ['Buka Menu Kupon', 'Klik Buat Kupon', 'Tentukan Besaran Diskon', 'Bagikan ke Pelanggan'],
    relatedPages: [
      { title: 'Penawaran & Promo Spesial', slug: 'promo' },
      { title: 'Gerbang Pembayaran', slug: 'payment' }
    ]
  },
  {
    id: 'page-admin-refunds',
    slug: 'admin-refunds',
    pageNumber: '33',
    title: 'Manajemen Pengembalian Dana (Refund)',
    subtitle: 'Pusat persetujuan pembatalan pesanan, validasi alasan tamu, dan pemrosesan transfer kembali dana.',
    role: 'ADMIN',
    urlPath: '/admin/refunds',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-refunds.png',
    overview: 'Menangani permohonan pengembalian dana dari tamu yang batal berangkat. Super admin dapat meninjau alasan pembatalan, memverifikasi nomor rekening tujuan refund, menyetujui (Approve), atau menolak (Reject) sesuai kebijakan pembatalan.',
    features: [
      'Daftar permohonan refund masuk (Status: Pending, Approved, Rejected, Refunded)',
      'Detail alasan pembatalan dan bukti pendukung dari tamu',
      'Pencatatan tanggal persetujuan dan riwayat audit trail'
    ],
    anatomy: [
      { id: 'ar-1', number: '01', name: 'Refund Queue List', description: 'Tabel antrean pengajuan refund yang menunggu keputusan admin.' },
      { id: 'ar-2', number: '02', name: 'Action Decision Buttons', description: 'Tombol hijau "Approve" dan tombol merah "Reject".' }
    ],
    actions: [
      { name: 'Setujui Refund (Approve)', action: 'Mengizinkan pengembalian dana dan memperbarui status tiket' },
      { name: 'Tolak Refund (Reject)', action: 'Menolak permohonan dengan memberikan catatan alasan' }
    ],
    userFlow: ['Tinjau Permohonan Masuk', 'Periksa Alasan Tamu', 'Klik Setujui atau Tolak'],
    relatedPages: [
      { title: 'Manajemen Seluruh Transaksi', slug: 'admin-bookings' },
      { title: 'Log Keamanan & Audit Jejak', slug: 'admin-audit-logs' }
    ]
  },
  {
    id: 'page-admin-users',
    slug: 'admin-users',
    pageNumber: '34',
    title: 'Manajemen Hak Akses & User',
    subtitle: 'Pengaturan akun pengguna, penugasan peran (User, Admin, Super Admin), dan audit keanggotaan.',
    role: 'ADMIN',
    urlPath: '/admin/users',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-users.png',
    overview: 'Pusat kontrol Role-Based Access Control (RBAC). Super admin memiliki wewenang untuk melihat seluruh akun yang terdaftar di Supabase Auth, mengubah peran staf (misal: mengangkat staf menjadi admin), atau menonaktifkan akun.',
    features: [
      'Daftar seluruh pengguna dengan email, tanggal registrasi, dan role',
      'Dropdown pemilihan peran instan (user, admin, super_admin)',
      'Pencarian pengguna berdasarkan alamat email atau ID unik'
    ],
    anatomy: [
      { id: 'au-1', number: '01', name: 'User Directory Table', description: 'Tabel pengguna terdaftar dengan avatar inisial dan badge role.' },
      { id: 'au-2', number: '02', name: 'Role Assignment Dropdown', description: 'Pemilihan hak akses pengguna secara real-time.' }
    ],
    actions: [
      { name: 'Ubah Role Pengguna', action: 'Memperbarui peran pengguna di tabel user_roles Supabase' },
      { name: 'Cari Pengguna', action: 'Memfilter daftar pengguna berdasarkan email' }
    ],
    userFlow: ['Buka Menu Users', 'Cari Email Staf', 'Pilih Role Baru', 'Hak Akses Langsung Berubah'],
    relatedPages: [
      { title: 'Ringkasan Metrik Admin', slug: 'admin-dashboard' },
      { title: 'Log Keamanan & Audit Jejak', slug: 'admin-audit-logs' }
    ]
  },
  {
    id: 'page-admin-audit-logs',
    slug: 'admin-audit-logs',
    pageNumber: '35',
    title: 'Log Keamanan & Audit Jejak Sistem',
    subtitle: 'Catatan forensik seluruh aktivitas krusial admin, perubahan harga, modifikasi booking, dan riwayat login.',
    role: 'ADMIN',
    urlPath: '/admin/audit-logs',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-audit-logs.png',
    overview: 'Menjamin akuntabilitas dan integritas data aplikasi. Setiap kali ada perubahan harga paket, penambahan kupon, approval refund, atau perubahan hak akses, sistem secara otomatis mencatat aktor, timestamp, alamat IP, dan data sebelum/sesudah perubahan.',
    features: [
      'Tabel kronologis aktivitas sistem (Timestamp, Aktor, Aksi, Modul, Detail)',
      'Filter berdasarkan jenis aksi (CREATE, UPDATE, DELETE, AUTH)',
      'Pencarian jejak audit berdasarkan email administrator'
    ],
    anatomy: [
      { id: 'al-1', number: '01', name: 'Audit Timeline Table', description: 'Tabel jejak rekam aktivitas dengan format kode waktu ISO presisi.' },
      { id: 'al-2', number: '02', name: 'Action Severity Badge', description: 'Indikator warna untuk aksi penting (Hijau: Create, Kuning: Update, Merah: Delete).' }
    ],
    actions: [
      { name: 'Filter Aktivitas', action: 'Menyaring log berdasarkan kategori atau waktu' },
      { name: 'Lihat Detail Perubahan (Diff)', action: 'Membuka payload data sebelum dan sesudah diedit' }
    ],
    userFlow: ['Buka Audit Log', 'Cari Riwayat Perubahan', 'Verifikasi Keamanan Sistem'],
    relatedPages: [
      { title: 'Manajemen Hak Akses & User', slug: 'admin-users' },
      { title: 'Laporan Finansial', slug: 'admin-reports' }
    ]
  },
  {
    id: 'page-admin-reports',
    slug: 'admin-reports',
    pageNumber: '36',
    title: 'Laporan Finansial & Unduh PDF',
    subtitle: 'Pusat pelaporan performa pendapatan, analisis destinasi terlaris, dan ekspor laporan resmi.',
    role: 'ADMIN',
    urlPath: '/admin/reports',
    category: 'Admin Portal',
    screenshot: '/docs/screenshots/admin-reports.png',
    overview: 'Menyajikan analisis keuangan mendalam untuk rapat manajemen. Admin dapat melihat laporan laba kotor, komisi, rata-rata transaksi per tamu, serta mengunduh dokumen laporan resmi dalam format PDF beresolusi cetak tinggi (@react-pdf/renderer).',
    features: [
      'Pemilihan rentang tanggal laporan (Bulan ini, Kuartal ini, Tahun ini, Kustom)',
      'Grafik rincian pendapatan berdasarkan destinasi dan metode pembayaran',
      'Ekspor instan ke dokumen PDF berformat laporan formal eksekutif'
    ],
    anatomy: [
      { id: 'ar-1', number: '01', name: 'Date Range Selector', description: 'Kontrol rentang waktu analisis finansial.' },
      { id: 'ar-2', number: '02', name: 'Financial Breakdown Summary', description: 'Tabel ringkasan omset kotor, diskon kupon, fee gateway, dan laba bersih.' },
      { id: 'ar-3', number: '03', name: 'Download PDF Button', description: 'Tombol untuk merender dan mengunduh laporan PDF resmi.' }
    ],
    actions: [
      { name: 'Ubah Rentang Periode', action: 'Menghitung ulang statistik sesuai tanggal yang dipilih' },
      { name: 'Unduh Laporan PDF', action: 'Menghasilkan dokumen PDF laporan eksekutif' }
    ],
    userFlow: ['Pilih Periode Laporan', 'Tinjau Statistik Finansial', 'Unduh Laporan PDF Resmi'],
    relatedPages: [
      { title: 'Ringkasan Metrik Admin', slug: 'admin-dashboard' },
      { title: 'Manajemen Seluruh Transaksi', slug: 'admin-bookings' }
    ]
  }
]
