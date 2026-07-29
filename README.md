# NOVA — Platform Perjalanan Modern

NOVA adalah platform perjalanan berbasis Next.js dengan fitur pencarian paket wisata, booking, pembayaran Midtrans, dashboard pengguna, wishlist, dan AI itinerary planner.

---

## Requirements

- Node.js 18+
- npm atau yarn
- Akun Supabase
- Akun Midtrans (opsional, ada mock mode)
- Google Gemini API key (opsional, untuk AI itinerary)

---

## Cara Install

```bash
git clone <repo-url>
cd nova-next
npm install
```

---

## Environment Variables

Salin `.env.example` menjadi `.env` dan isi nilainya:

```bash
cp .env.example .env
```

Lihat bagian **Setup** di bawah untuk cara mendapatkan setiap nilai.

---

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Salin **Project URL** dan **anon key** dari Settings > API
3. Salin **service_role key** dari Settings > API (jangan expose ke browser)
4. Isi nilai di `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

---

## Setup Database

### Link ke Supabase project

```bash
supabase login
supabase link --project-ref <project-ref>
```

`project-ref` adalah ID project dari URL Supabase kamu (contoh: `jrnmzwtjqcvknoclycbd`).

### Jalankan migrations

```bash
supabase db push --include-all
```

Migrations yang akan dijalankan:
- `001_add_departure_table.sql` — tabel PackageDeparture
- `002_extend_package_destination.sql` — extend Package dan Destination (slug, gallery, dll)
- `003_booking_payment_fields.sql` — Midtrans tracking fields, fix CHECK constraint
- `004_wishlist_itinerary_promo.sql` — SavedItinerary, PromoCode, Traveler, extend Wishlist

### Seed data

Jalankan `supabase/seed.sql` di Supabase SQL Editor untuk mengisi data awal (Packages, Destinations, FAQ, Testimonials).

Setelah seed, jalankan bagian `-- Seed departures` yang ada di `002_extend_package_destination.sql` (uncomment terlebih dahulu) untuk menambahkan jadwal keberangkatan ke setiap paket.

---

## Setup Gemini (AI Itinerary)

1. Buka [aistudio.google.com](https://aistudio.google.com)
2. Buat API key baru
3. Isi di `.env`:
   ```
   GEMINI_API_KEY=AIza...
   ```

---

## Setup Midtrans

1. Daftar di [midtrans.com](https://midtrans.com)
2. Buka Settings > Access Keys
3. Gunakan **Sandbox** untuk development
4. Isi di `.env`:
   ```
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
   NEXT_PUBLIC_MIDTRANS_ENV=sandbox
   ```

### Mock Payment Mode

Untuk development tanpa Midtrans key, gunakan mock mode:

```env
PAYMENT_MODE=mock
```

Dalam mock mode, tombol **Simulasi Pembayaran Berhasil** akan muncul sebagai pengganti Midtrans Snap. Booking akan langsung dikonfirmasi tanpa pembayaran nyata. Banner kuning akan tampil untuk menandai bahwa ini adalah mode demo.

---

## Cara Menjalankan Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Cara Menjalankan Test

Pastikan dev server berjalan di `localhost:3000` terlebih dahulu, lalu:

```bash
npx playwright test
```

Playwright e2e tests ada di `tests/e2e/`.

---

## Cara Build

```bash
npm run build
npm run start
```

---

## Membuat Admin User

NOVA menggunakan Supabase Auth. Untuk membuat user dengan role admin:

1. Daftarkan user melalui halaman `/login` (Sign Up)
2. Di Supabase Dashboard, buka **Authentication > Users**
3. Temukan user yang baru dibuat
4. Di **Table Editor**, buka tabel `profiles` (jika ada) atau gunakan SQL Editor:

```sql
-- Contoh jika ada kolom role di profiles atau users
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

Atau sesuaikan dengan struktur yang ada di project.

---

## Struktur Folder Utama

```
nova-next/
├── app/
│   ├── admin/          # Panel admin (packages, departures, dll)
│   ├── api/            # API routes (bookings, payment, wishlist, dll)
│   ├── booking/        # Multi-step booking flow
│   ├── dashboard/      # Dashboard pengguna
│   ├── packages/       # Package list + detail [slug]
│   ├── payment/        # Payment pending + confirmation
│   ├── search/         # Search & filter halaman
│   └── page.tsx        # Homepage
├── components/
│   ├── booking/        # BookingProgress, Step components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── WishlistButton.tsx
│   └── DashboardNav.tsx
├── lib/
│   ├── types.ts        # Shared TypeScript types (single source of truth)
│   ├── supabase.ts     # Server-side Supabase client (service role)
│   └── supabase-client.ts  # Browser Supabase client
├── supabase/
│   ├── migrations/     # SQL migrations (jalankan berurutan)
│   └── seed.sql        # Seed data awal
└── tests/
    └── e2e/            # Playwright e2e tests
```

---

## Promo Code

Kode promo `NOVA15` sudah di-seed secara otomatis (diskon 15%, minimum pembelian Rp5.000.000, maksimum diskon Rp3.000.000). Kode ini dapat digunakan di halaman review booking.

Untuk menambah promo code baru, insert langsung ke tabel `PromoCode` di Supabase atau melalui admin panel.
