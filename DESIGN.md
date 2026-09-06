# DESIGN.md — Nova Travel Platform

## 1. Brand Identity & Essence
- **Name:** Nova
- **Category:** Curated Luxury & Experiential Travel Platform
- **Core Value:** Perjalanan liburan terkurasi dengan standar kenyamanan bintang 5, transparansi harga tanpa biaya tersembunyi, dan pendampingan concierge nyata 24 jam.
- **Tone & Voice:** Editorial, berwibawa, hangat, jujur, mengutamakan kejelasan (tanpa jargon klise AI seperti "revolutionary", "unlock seamless power").

## 2. Design Dials (Anti-Slop Alignment)
- **ENERGY: 3 (Refined Luxury Editorial)** — Tenang, lapang, berkelas, tidak terburu-buru.
- **RHYTHM: 4 (Dynamic Editorial Cadence)** — Variasi layout seksi asimetris: hero sinematik, pilar jaminan, showcase visual berdimensi, katalog kartu yang rapi, dan seksi teks terarah.
- **MOTION: 3 (Subtle Precision Physics)** — Transisi halus via GSAP, efek zoom gambar lambat (*smooth zoom*), hover state terukur (tidak memantul atau bergetar liar).

## 3. Color Palette
- **Canvas / Background:** `#FAF9F6` (Warm Sunlit Ivory)
- **Primary Text & Obsidian Accents:** `#1C1917` (Deep Obsidian Charcoal)
- **Border & Dividers:** `stone-200/80` (Muted Natural Stone)
- **Brand Accent:** `#C29B38` (Warm Champagne Amber Gold)
- **Subtle Surface:** `#F5F2EB` (Warm Ecru Paper)
- **Trust & Verification:** `emerald-600` / `emerald-400` (Subtle Forest Green)
- **Forbidden:** Gradasi ungu-ke-biru neon tanpa tujuan, cyan neon, biru elektrik SaaS generik (`#0099FF` di halaman konten editorial).

## 4. Typography System
- **Headlines & Primary Sans:** `Urbanist` (Modernist geometric sans, architectural, luxury fashion editorial feel)
- **Editorial Serif Accent:** `Instrument Serif` (Italic luxury editorial display, razor-sharp serif elegance via `.font-serif-luxury`)
- **Body & Controls:** `Urbanist` / `Plus Jakarta Sans`, clean, high readability, WCAG AA compliant.
- **Visual Ratio:** 20% Words, 80% Photos. Biarkan fotografi destinasi dan kurasi visual menjadi pahlawan utama, copywriting padat dan terarah tanpa dinding teks.
- **Prohibited:** Penulisan ALL CAPS dengan letter spacing ekstrem pada teks panjang, monospace acak untuk tombol/label biasa.

## 5. Craftsmanship & Honesty Rules
- Tidak menampilkan counter statistik bombastis fiktif (`50K+ Travelers`, `10K+ Hotels`).
- Tidak membuat testimonial palsu berfoto Unsplash.
- Tidak menyajikan tombol aplikasi toko fiktif (App Store / Google Play).
- Setiap tombol dan link harus memiliki tujuan nyata yang dapat diakses.
- Bebas dari karakter em dash (`—`) pada seluruh copywriting antarmuka.
