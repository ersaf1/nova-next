# NOVA — Dokumen Skenario End-to-End

> Platform: NOVA Travel Booking | Next.js + Supabase + Midtrans  
> Tanggal: 23 Agustus 2026

---

## NAVIGASI UTAMA (Navbar)

```
Home | Destinations | Packages | AI Planner ✨ | How It Works | [ Cari Paket ]
                                                               [ Masuk ]         ← belum login
                                                               [ 🔔 ] [ Avatar ] ← sudah login
```

| Link | URL | Catatan |
|------|-----|---------|
| Home | `/` | Selalu tersedia |
| Destinations | `/destinations` | Selalu tersedia |
| Packages | `/packages` | Selalu tersedia |
| AI Planner ✨ | `/ai-planner` | Redirect ke `/login?redirect=/ai-planner` jika belum login |
| How It Works | `/how-it-works` | Informatif, tanpa interaksi |
| Cari Paket | `/search` | Selalu tersedia |
| Masuk | `/login` | Hanya tampil jika belum login |
| 🔔 Notifikasi | `/dashboard/notifications` | Hanya tampil jika sudah login |
| Avatar → Dashboard | `/dashboard` | Hanya tampil jika sudah login |
| Keluar | — | Sign out Supabase → redirect ke `/` |

---

## HALAMAN 1 — Home `/`

### Yang bisa dilakukan user:

| Elemen | Aksi | Butuh Login | Hasil |
|--------|------|-------------|-------|
| Hero video fullscreen | Tonton | Tidak | Video autoplay + headline "The World, Unlocked." |
| Tombol **[ Explore Packages ]** | Klik | Tidak | → `/packages` |
| Tombol **[ AI Planner ]** | Klik | Tidak | → `/ai-planner` (redirect login jika belum) |
| Kartu destinasi unggulan | Klik | Tidak | → `/destinations/[id]` |
| Kartu paket unggulan | Klik | Tidak | → `/packages/[slug]` |
| FAQ accordion | Klik pertanyaan | Tidak | Jawaban expand/collapse |
| Form newsletter (footer) | Isi email → **[ Subscribe ]** | Tidak | Email tersimpan di DB |

### Efek ke Admin:
- Konten hero (video/teks/poster) → diubah di `/admin/hero`
- Email subscriber → masuk ke `/admin/newsletter`
- Kartu destinasi & paket → dikelola di `/admin/destinations` & `/admin/packages`

---

## HALAMAN 2 — Destinations `/destinations`

### List destinasi:

| Aksi | Butuh Login | Hasil |
|------|-------------|-------|
| Lihat grid semua destinasi | Tidak | Tampil kartu destinasi |
| Klik kartu destinasi | Tidak | → `/destinations/[id]` |

### Detail destinasi `/destinations/[id]`:

| Elemen | Aksi | Butuh Login | Hasil |
|--------|------|-------------|-------|
| Galeri foto | Scroll/klik | Tidak | Tampil foto destinasi |
| Peta interaktif | Lihat | Tidak | MapLibre GL dengan pin lokasi |
| Daftar paket terkait | Klik paket | Tidak | → `/packages/[slug]` |
| Ikon ❤️ Wishlist | Klik | **Ya** | Item tersimpan ke wishlist, ikon jadi merah aktif |
| Form ulasan ⭐ | Beri bintang + tulis komentar → **[ Submit ]** | **Ya** | Ulasan tampil di halaman destinasi |

### Efek ke Admin:
- Destinasi → dikelola di `/admin/destinations`
- Ulasan user → masuk dan bisa dimoderasi

---

## HALAMAN 3 — Packages `/packages`

### List paket:

| Aksi | Butuh Login | Hasil |
|------|-------------|-------|
| Lihat grid semua paket | Tidak | Tampil paket berstatus `published` |
| Klik kartu paket | Tidak | → `/packages/[slug]` |

### Detail paket `/packages/[slug]`:

| Elemen | Aksi | Butuh Login | Hasil |
|--------|------|-------------|-------|
| Galeri foto | Klik | Tidak | Lightbox/galeri |
| Deskripsi, inklusi, ekslusi | Baca | Tidak | Info lengkap paket |
| Pilih jadwal keberangkatan | Klik departure | Tidak | Harga & sisa slot tampil |
| Tombol **[ Pesan Sekarang ]** | Klik | **Ya** | → `/booking/[packageId]/[departureId]` |
| Ikon ❤️ Wishlist | Klik | **Ya** | Tersimpan ke wishlist |
| Ulasan traveler | Baca | Tidak | List review pengguna lain |

### Status slot departure:

| Status | Tampilan Tombol |
|--------|----------------|
| `available` | **[ Pesan Sekarang ]** — aktif (biru) |
| `limited` | **[ Pesan Sekarang ]** + badge "Tersisa Sedikit" (kuning) |
| `sold_out` | **[ Slot Penuh ]** — disabled (abu-abu) |
| `cancelled` | Departure tidak tampil sama sekali |

### Efek ke Admin:
- Paket → dikelola di `/admin/packages`
- Jadwal/departure → dikelola di `/admin/departures`
- Sisa slot otomatis berkurang saat booking berhasil

---

## HALAMAN 4 — AI Planner `/ai-planner` ✨

> Wajib login. Jika belum → redirect ke `/login?redirect=/ai-planner`

### Langkah 1 — Isi Form

| Field | Tipe Input | Contoh |
|-------|-----------|--------|
| Destinasi | Text + tag cepat | "Bali", "Tokyo", "Paris" |
| Durasi | Select (hari) | 5 hari |
| Jumlah Traveler | Select | 2 orang |
| Budget | Select (range) | Budget / Mid-range / Luxury |
| Travel Vibe | Button grid (pilih 1) | Eksplorasi Lengkap / Cafe & Kuliner / Petualangan / Budaya / Hidden Gem |

Klik **[ Rancang Itinerary Sekarang ]** → `POST /api/ai/itinerary` → Google Gemini proses

### Langkah 2 — Hasil Generate

Tampil setelah AI selesai:
- Hero image destinasi + teks intro dari AI
- **Itinerary hari per hari**: jam, aktivitas, lokasi, durasi, estimasi biaya, tips, kategori
- Rekomendasi makan per hari (sarapan / makan siang / malam)
- Rekomendasi akomodasi per hari
- Estimasi total biaya harian
- Galeri atraksi terdekat + foto
- Tips perjalanan & waktu terbaik berkunjung
- Frasa lokal berguna
- Prakiraan cuaca (suhu, kondisi, saran pakaian)
- Packing list
- Info nilai tukar mata uang
- Peta interaktif (Leaflet `MapPanel`) dengan pin tiap lokasi

### Langkah 3 — Aksi Setelah Generate

| Tombol | Butuh Login | Hasil |
|--------|-------------|-------|
| **[ Simpan Itinerary ]** | **Ya** | Tersimpan di `SavedItinerary` (visibility: `private`) → lihat di `/dashboard/itineraries` |
| **[ Bagikan ]** | **Ya** | Visibility → `shared`, `shareToken` di-generate → link unik terbentuk |
| **[ Book This Trip ]** | **Ya** | Modal `AIConvertBookingModal` terbuka → arahkan ke paket relevan → mulai booking |
| **[ Print ]** | Tidak | Browser print dialog |
| **[ Copy ]** | Tidak | Konten di-copy ke clipboard |

---

## HALAMAN 5 — How It Works `/how-it-works`

Murni informatif. Step-by-step cara pakai NOVA. Tidak ada form atau interaksi.

### Efek ke Admin:
- Konten → dikelola di `/admin/how-it-works`

---

## HALAMAN 6 — Search `/search`

### Filter yang tersedia:

| Filter | Pilihan |
|--------|---------|
| Teks pencarian | Nama destinasi/paket bebas |
| Kategori | All / Beach / Adventure / Culture / City / Nature / Luxury |
| Harga maksimal | Slider dinamis |
| Durasi | Any / 1–3 hari / 4–7 hari / 8–14 hari / 15+ hari |
| Mode perjalanan | All / Solo / Family / Adventure / Business |
| Urutan | Rating / Termurah / Termahal / Popularitas |

Hasil → grid kartu paket → klik kartu → `/packages/[slug]`

---

## HALAMAN 7 — Login & Register `/login`

### Tab Masuk (Sign In):

| Field | Keterangan |
|-------|-----------|
| Email | Format email valid |
| Password | Toggle show/hide |
| **[ Masuk ]** | Supabase Auth verifikasi → redirect ke halaman asal atau `/dashboard` |
| **[ Lupa Password? ]** | Isi email → link reset dikirim ke email → `/auth/reset-password` → isi password baru |

### Tab Daftar (Sign Up):

| Field | Keterangan |
|-------|-----------|
| Email | Format email valid |
| Password | Min 8 karakter |
| Konfirmasi Password | Harus cocok |
| **[ Daftar ]** | Akun dibuat → role `user` di-assign otomatis → redirect ke `/dashboard` |

---

## ALUR BOOKING — End-to-End ⭐

```
/packages/[slug]
  → klik [ Pesan Sekarang ]
  → /booking/[packageId]/[departureId]
      ↓ Step 1 → Step 2 → Step 3 → Step 4
  → /payment/[bookingId]
      ↓
  BERHASIL → /payment/confirmation/[bookingId]
  EXPIRED  → /payment/pending/[bookingId]
```

### Step 1 — Detail Pesanan

| Field | Keterangan |
|-------|-----------|
| Nama Lengkap* | Pre-filled dari akun Supabase |
| Email* | Pre-filled dari akun Supabase |
| Nomor HP* | Format Indonesia, isi manual |
| Jumlah Peserta | Min 1, maks = sisa slot tersedia |

Preview harga real-time: `harga × peserta + Rp250.000 service fee = total`

Klik **[ Lanjut ]** → Step 2

### Step 2 — Data Traveler

Diisi per peserta:

| Field | Keterangan |
|-------|-----------|
| Nama Lengkap* | Sesuai identitas resmi |
| Gender | Pria / Wanita |
| Tanggal Lahir | Date picker |
| Kewarganegaraan | Dropdown |
| Nomor Paspor | Opsional tergantung paket |
| Tanggal Expired Paspor | Opsional |

Klik **[ Lanjut ]** → Step 3

### Step 3 — Review & Promo

| Elemen | Keterangan |
|--------|-----------|
| Ringkasan paket | Nama paket, jadwal, peserta |
| Input kode promo | Ketik → validasi real-time → diskon tampil jika valid |
| Total akhir | `subtotal − diskon + Rp250.000 service fee` |
| Checkbox T&C | Wajib dicentang |

#### Status validasi kode promo:

| Kondisi | Pesan |
|---------|-------|
| Kode valid | Diskon ditampilkan ✓ |
| Kode tidak ditemukan | "Kode promo tidak valid" |
| Sudah expired | "Kode promo sudah tidak berlaku" |
| Min. pembelian tidak terpenuhi | "Minimum pembelian tidak terpenuhi" |
| Kuota habis | "Kode promo sudah habis digunakan" |
| Sudah pernah dipakai | "Kode sudah pernah digunakan" |

Klik **[ Konfirmasi Pemesanan ]** → Step 4

### Step 4 — Pembayaran

Tampil: kode booking + total tagihan

Klik **[ Bayar Sekarang ]** → Midtrans Snap widget terbuka

Pilih metode pembayaran:
- Transfer bank (BCA, BNI, Mandiri, BRI, dll)
- Kartu kredit/debit Visa/Mastercard
- E-wallet: GoPay, OVO, Dana, ShopeePay
- QRIS

#### Hasil Pembayaran:

| Hasil | `paymentStatus` | `bookingStatus` | Redirect | Notifikasi |
|-------|----------------|-----------------|----------|-----------|
| Berhasil | `paid` | `confirmed` | `/payment/confirmation/[id]` | Email + WhatsApp |
| Gagal/ditolak | `failed` | tetap `pending_payment` | Tetap di halaman, bisa retry | — |
| Timeout/expired | `expired` | `cancelled` | `/payment/pending/[id]` | — |

### Efek ke Admin:
- Booking baru → muncul langsung di `/admin/bookings`
- Revenue → tercatat di `/admin/reports`
- Notifikasi webhook → masuk via `/api/payment/notification`

---

## HALAMAN 8 — Dashboard User `/dashboard`

> Wajib login. Sidebar navigasi:

| Menu | URL | Isi |
|------|-----|-----|
| Overview | `/dashboard` | Ringkasan booking terbaru, stats pribadi |
| Booking Saya | `/dashboard/bookings` | List semua booking + badge status |
| Wishlist | `/dashboard/wishlist` | Paket & destinasi tersimpan |
| Itinerary AI | `/dashboard/itineraries` | Itinerary dari AI planner |
| Notifikasi | `/dashboard/notifications` | Notifikasi sistem |
| Profil | `/profile` | Edit data diri & foto |

### Sub-halaman: Detail Booking `/dashboard/bookings/[bookingId]`

| Aksi | Kondisi | Hasil |
|------|---------|-------|
| Lihat detail | Semua status | Info paket, traveler, metode bayar, total |
| **[ Download PDF ]** | Status `confirmed` atau `completed` | File PDF bukti booking |
| **[ Ajukan Refund ]** | Status `confirmed` | Form refund muncul → isi alasan → submit |

#### Status booking:

| Status | Badge | Keterangan |
|--------|-------|-----------|
| `draft` | Abu | Booking belum selesai |
| `pending` | Kuning | Menunggu konfirmasi |
| `pending_payment` | Oranye | Menunggu pembayaran |
| `confirmed` | Hijau | Pembayaran berhasil |
| `cancelled` | Merah | Dibatalkan |
| `completed` | Biru | Perjalanan selesai |

---

## ALUR REFUND — End-to-End

```
Dashboard → Booking Saya → [Detail Booking]
  → klik [ Ajukan Refund ]   (hanya tampil jika status: confirmed)
  → isi alasan refund
  → klik [ Submit ]
  → refund_status: "requested"
  → tunggu review admin
  → APPROVED → notifikasi "Refund disetujui"
  → REJECTED → notifikasi "Refund ditolak" + alasan
```

### Efek ke Admin:
- Request → masuk ke `/admin/refunds` dengan status `requested`
- Admin approve/reject dari panel tersebut
- Transfer dana dilakukan manual (Midtrans dashboard / transfer bank)

---

## HALAMAN 9 — Wishlist `/dashboard/wishlist`

| Aksi | Hasil |
|------|-------|
| Lihat semua item tersimpan | Grid paket & destinasi |
| Klik item | → halaman detail paket/destinasi |
| **[ Hapus ]** dari wishlist | Item dihapus, ikon ❤️ kembali kosong |

---

## HALAMAN 10 — Itinerary AI `/dashboard/itineraries`

| Aksi | Hasil |
|------|-------|
| Lihat list itinerary | Semua itinerary tersimpan dari AI planner |
| Klik itinerary | Buka detail lengkap hari per hari |
| **[ Bagikan ]** | Visibility → `shared`, link unik aktif |
| **[ Hapus ]** | Record dihapus dari DB |

---

## HALAMAN 11 — Notifikasi `/dashboard/notifications`

| Aksi | Hasil |
|------|-------|
| Lihat notifikasi | List: konfirmasi booking, status refund, promo baru |
| Klik notifikasi | Buka halaman terkait (misal: detail booking) |
| **[ Tandai Semua Dibaca ]** | Semua notifikasi → status `read` |

---

## HALAMAN 12 — Reviews `/reviews`

| Aksi | Butuh Login | Hasil |
|------|-------------|-------|
| Baca semua ulasan | Tidak | List review dari semua traveler |
| Beri bintang + tulis komentar → **[ Submit Ulasan ]** | **Ya** | Ulasan tersimpan & tampil |

---

## HALAMAN 13 — Promo `/promo`

| Aksi | Hasil |
|------|-------|
| Lihat promo aktif | List kupon & promo yang sedang berlaku |
| **[ Salin Kode ]** | Kode di-copy ke clipboard → pakai di Step 3 booking |

---

## HALAMAN 14 — Profil `/profile`

| Field | Aksi | Hasil |
|-------|------|-------|
| Nama lengkap | Edit → **[ Simpan ]** | Update di Supabase |
| Foto profil | Upload gambar baru | Update avatar |
| Data lainnya | Edit → **[ Simpan ]** | Update di DB |

---

## HALAMAN 15 — FAQ `/faq`

Daftar FAQ dalam format accordion. Klik pertanyaan → jawaban expand/collapse.

### Efek ke Admin:
- Konten → dikelola di `/admin/faqs`

---

---

# SISI ADMIN `/admin`

> Akses dijaga middleware `requireRole(['admin','super_admin'])`.  
> User biasa yang akses `/admin` → **403 Forbidden**.

---

## A. Dashboard Admin `/admin`

| Tab | Isi |
|-----|-----|
| Overview | Total booking, revenue (hari ini/bulan ini/all time), user terdaftar, paket aktif, refund pending |
| Analytics | Grafik booking per periode, revenue trend, top paket & destinasi |
| Modules | Shortcut ke semua modul admin |

---

## B. Kelola Booking `/admin/bookings`

| Aksi | Hasil |
|------|-------|
| Filter: status, tanggal, nama/email | List booking tersaring |
| Klik detail booking | Lihat data traveler, metode bayar, promo dipakai, total |
| Update status booking | `bookingStatus` diupdate di DB |
| **[ Cancel ]** booking | Status → `cancelled` |

---

## C. Kelola Refund `/admin/refunds`

| Aksi | Hasil |
|------|-------|
| Lihat list refund `requested` | Filter berdasarkan status |
| Lihat detail | Alasan user, nilai refund, data booking terkait |
| **[ Approve ]** | `refund_status` → `approved` → notifikasi ke user |
| **[ Reject ]** + isi alasan | `refund_status` → `rejected` → notifikasi ke user |

> Transfer dana dilakukan manual via Midtrans dashboard atau transfer bank.

---

## D. Kelola Paket `/admin/packages`

| Aksi | Hasil |
|------|-------|
| Tambah paket baru | Form: nama, deskripsi, harga, kategori, durasi, galeri, inklusi/ekslusi |
| Edit paket | Update data di DB |
| **[ Publish ]** | Status `draft` → `published` → langsung tampil di frontend |
| **[ Archive ]** | Status → `archived` → tersembunyi dari user |
| **[ Hapus ]** | Record dihapus |

---

## E. Kelola Jadwal `/admin/departures`

| Aksi | Hasil |
|------|-------|
| Tambah jadwal baru | Tanggal berangkat, tanggal pulang, kapasitas, harga |
| Edit jadwal | Update data |
| Set status | `available` / `limited` / `sold_out` / `cancelled` |
| Lihat sisa slot | `remainingSlots` real-time |

---

## F. Kelola Destinasi `/admin/destinations`

| Aksi | Hasil |
|------|-------|
| Tambah destinasi | Nama, negara, deskripsi, gambar, koordinat (auto via Geoapify), kategori |
| Edit destinasi | Update data |
| **[ Hapus ]** | Record dihapus |

---

## G. Kelola User `/admin/users`

| Aksi | Siapa | Hasil |
|------|-------|-------|
| Lihat semua user | Admin & Super Admin | Nama, email, role, tanggal daftar |
| Klik user | Admin & Super Admin | Detail: riwayat booking, total spend |
| **[ Ubah Role ]** user | **Super Admin only** | `user` ↔ `admin` ↔ `super_admin` |

---

## H. Kelola Kupon `/admin/coupons`

| Aksi | Hasil |
|------|-------|
| Tambah kupon | Kode, tipe (persentase/fixed), nilai, min pembelian, kuota, tanggal expired |
| **[ Aktifkan ]** / **[ Nonaktifkan ]** | Kupon tersedia/tidak untuk user |
| Lihat statistik | Berapa kali kode dipakai |

---

## I. Laporan `/admin/reports`

| Aksi | Hasil |
|------|-------|
| Filter: periode, status, metode bayar | Data tersaring |
| **[ Export PDF ]** | File PDF laporan didownload |
| **[ Export CSV ]** | File CSV data mentah didownload |

Data: total revenue, booking per paket, top destinasi/paket, booking per status.

---

## J. CMS Halaman

| Panel Admin | Yang Dikelola | Efek di Frontend |
|-------------|---------------|-----------------|
| `/admin/hero` | Video, poster, headline, subheadline | Section hero homepage |
| `/admin/faqs` | Pertanyaan & jawaban | Accordion FAQ di homepage & `/faq` |
| `/admin/testimonials` | Foto, nama, kutipan | Section testimonial homepage |
| `/admin/features` | Fitur-fitur platform | Section features homepage |
| `/admin/how-it-works` | Step-by-step cara kerja | Halaman `/how-it-works` |
| `/admin/partners` | Logo partner | Section partner homepage |

---

## K. Audit Log `/admin/audit-logs`

- Semua aksi admin tercatat: siapa, apa, kapan
- Read-only — tidak bisa diedit atau dihapus
- Filter berdasarkan user admin atau tipe aksi

---

## L. Newsletter `/admin/newsletter`

- Lihat semua email subscriber
- Export daftar email

---

## M. Settings `/admin/settings`

- Pengaturan umum platform (nama, kontak, konfigurasi global)

---

## Matriks Hak Akses

| Fitur | User | Admin | Super Admin |
|-------|------|-------|-------------|
| Browse & search | ✓ | ✓ | ✓ |
| Booking & payment | ✓ | ✓ | ✓ |
| Wishlist | ✓ | ✓ | ✓ |
| AI Planner | ✓ | ✓ | ✓ |
| Dashboard user | ✓ | ✓ | ✓ |
| Ajukan refund | ✓ | ✓ | ✓ |
| Panel Admin `/admin` | ✗ | ✓ | ✓ |
| Kelola konten/paket/user | ✗ | ✓ | ✓ |
| Approve/reject refund | ✗ | ✓ | ✓ |
| Export laporan | ✗ | ✓ | ✓ |
| **Ubah role user** | ✗ | ✗ | **✓** |
