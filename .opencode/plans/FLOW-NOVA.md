# NOVA — Diagram Alur (Flow)

> Semua diagram menggunakan Mermaid. Render di GitHub, Notion, atau https://mermaid.live

---

## 1. Alur Navigasi Utama (Sitemap)

```mermaid
flowchart TD
    HOME["/  Home"]
    DEST["/destinations  List Destinasi"]
    DEST_ID["/destinations/[id]  Detail Destinasi"]
    PKG["/packages  List Paket"]
    PKG_SLUG["/packages/[slug]  Detail Paket"]
    AI["/ai-planner  AI Planner"]
    HOW["/how-it-works"]
    SEARCH["/search"]
    PROMO["/promo"]
    REVIEW["/reviews"]
    FAQ["/faq"]
    LOGIN["/login"]
    REGISTER["/register"]
    DASH["/dashboard"]
    BOOKING_FLOW["/booking/...  Alur Booking"]
    PAYMENT["/payment/...  Pembayaran"]
    ADMIN["/admin  Panel Admin"]

    HOME --> DEST
    HOME --> PKG
    HOME --> AI
    HOME --> SEARCH
    DEST --> DEST_ID
    DEST_ID --> PKG_SLUG
    PKG --> PKG_SLUG
    PKG_SLUG --> BOOKING_FLOW
    BOOKING_FLOW --> PAYMENT
    AI --> DASH
    LOGIN --> DASH
    REGISTER --> DASH
    DASH --> ADMIN
```

---

## 2. Alur Autentikasi

```mermaid
flowchart TD
    START([User buka halaman protected])
    CHECK{Sudah login?}
    REDIRECT[Redirect ke /login?redirect=...]
    LOGIN_PAGE["/login"]
    ACTION{Aksi}
    SIGNIN["Isi email + password\nklik Masuk"]
    SIGNUP["Isi email + password\nklik Daftar"]
    FORGOT["Klik Lupa Password?\nIsi email"]
    SUPABASE_AUTH{Supabase Auth verifikasi}
    FAIL[Tampil error]
    CREATE_ACCOUNT["Buat akun\nAssign role: user"]
    RESET_EMAIL[Email reset dikirim]
    RESET_PAGE["/auth/reset-password\nIsi password baru"]
    SUCCESS[Login berhasil]
    REDIRECT_BACK["Redirect ke halaman asal / /dashboard"]

    START --> CHECK
    CHECK -- Tidak --> REDIRECT
    REDIRECT --> LOGIN_PAGE
    CHECK -- Ya --> REDIRECT_BACK
    LOGIN_PAGE --> ACTION
    ACTION -- Sign In --> SIGNIN
    ACTION -- Sign Up --> SIGNUP
    ACTION -- Lupa Password --> FORGOT
    SIGNIN --> SUPABASE_AUTH
    SUPABASE_AUTH -- Gagal --> FAIL
    FAIL --> LOGIN_PAGE
    SUPABASE_AUTH -- Berhasil --> SUCCESS
    SIGNUP --> CREATE_ACCOUNT
    CREATE_ACCOUNT --> SUCCESS
    FORGOT --> RESET_EMAIL
    RESET_EMAIL --> RESET_PAGE
    RESET_PAGE --> SUCCESS
    SUCCESS --> REDIRECT_BACK
```

---

## 3. Alur Booking End-to-End

```mermaid
flowchart TD
    PKG_PAGE["/packages/[slug]\nHalaman Detail Paket"]
    CHECK_SLOT{Status slot\nkeberangkatan?}
    SOLD_OUT[Tombol disabled\n'Slot Penuh']
    CHECK_LOGIN{Sudah login?}
    LOGIN_REDIRECT[Redirect ke /login]
    STEP1["Step 1 — Detail Pesanan\nNama, email, HP, jumlah peserta\nPreview harga real-time"]
    STEP2["Step 2 — Data Traveler\nPer peserta: nama, gender,\ntgl lahir, paspor"]
    STEP3["Step 3 — Review & Promo\nRingkasan + kode promo\nKalkulasi total akhir"]
    PROMO_CHECK{Kode promo\nvalid?}
    PROMO_OK[Diskon diterapkan]
    PROMO_FAIL[Tampil pesan error]
    STEP4["Step 4 — Pembayaran\nKode booking + total tagihan"]
    MIDTRANS[Midtrans Snap Widget\nPilih metode bayar]
    PAY_RESULT{Hasil pembayaran?}
    SUCCESS[paymentStatus: paid\nbookingStatus: confirmed]
    FAILED[paymentStatus: failed\nBisa retry]
    EXPIRED[paymentStatus: expired\nbookingStatus: cancelled]
    CONFIRM_PAGE["/payment/confirmation/[id]\nBukti booking"]
    PENDING_PAGE["/payment/pending/[id]"]
    NOTIF[Email konfirmasi\n+ WhatsApp dikirim]
    ADMIN_NOTIF[Booking muncul\ndi /admin/bookings]

    PKG_PAGE --> CHECK_SLOT
    CHECK_SLOT -- sold_out / cancelled --> SOLD_OUT
    CHECK_SLOT -- available / limited --> CHECK_LOGIN
    CHECK_LOGIN -- Tidak --> LOGIN_REDIRECT
    CHECK_LOGIN -- Ya --> STEP1
    STEP1 --> STEP2
    STEP2 --> STEP3
    STEP3 --> PROMO_CHECK
    PROMO_CHECK -- Valid --> PROMO_OK
    PROMO_CHECK -- Invalid --> PROMO_FAIL
    PROMO_FAIL --> STEP3
    PROMO_OK --> STEP3
    STEP3 --> STEP4
    STEP4 --> MIDTRANS
    MIDTRANS --> PAY_RESULT
    PAY_RESULT -- Berhasil --> SUCCESS
    PAY_RESULT -- Gagal/Ditolak --> FAILED
    PAY_RESULT -- Timeout --> EXPIRED
    SUCCESS --> CONFIRM_PAGE
    SUCCESS --> NOTIF
    SUCCESS --> ADMIN_NOTIF
    FAILED --> STEP4
    EXPIRED --> PENDING_PAGE
```

---

## 4. Alur Refund End-to-End

```mermaid
flowchart TD
    DASH["/dashboard/bookings\nList Booking User"]
    DETAIL["/dashboard/bookings/[id]\nDetail Booking"]
    CHECK_STATUS{Status booking?}
    NO_REFUND[Tombol Ajukan Refund\ntidak tampil]
    REFUND_FORM[Form Refund\nIsi alasan]
    SUBMIT[klik Submit]
    REQUESTED[refund_status: requested\nMenunggu review admin]
    ADMIN_PANEL["/admin/refunds\nList request refund"]
    ADMIN_REVIEW{Admin review}
    APPROVE[refund_status: approved]
    REJECT["refund_status: rejected\n+ alasan penolakan"]
    USER_NOTIF_OK[Notifikasi: Refund disetujui]
    USER_NOTIF_FAIL[Notifikasi: Refund ditolak + alasan]
    MANUAL_TRANSFER[Transfer dana manual\nvia Midtrans / bank]

    DASH --> DETAIL
    DETAIL --> CHECK_STATUS
    CHECK_STATUS -- confirmed --> REFUND_FORM
    CHECK_STATUS -- lainnya --> NO_REFUND
    REFUND_FORM --> SUBMIT
    SUBMIT --> REQUESTED
    REQUESTED --> ADMIN_PANEL
    ADMIN_PANEL --> ADMIN_REVIEW
    ADMIN_REVIEW -- Approve --> APPROVE
    ADMIN_REVIEW -- Reject --> REJECT
    APPROVE --> USER_NOTIF_OK
    APPROVE --> MANUAL_TRANSFER
    REJECT --> USER_NOTIF_FAIL
```

---

## 5. Alur AI Planner

```mermaid
flowchart TD
    AI_PAGE["/ai-planner"]
    CHECK_LOGIN{Sudah login?}
    LOGIN_REDIRECT[Redirect ke /login?redirect=/ai-planner]
    FORM["Isi Form:\nDestinasi, Durasi, Traveler\nBudget, Travel Vibe"]
    GENERATE[klik Rancang Itinerary Sekarang]
    API[POST /api/ai/itinerary\nGoogle Gemini proses]
    RESULT["Hasil Itinerary:\nHari per hari, peta, cuaca\ncuaca, packing list, dll"]
    ACTION{Aksi user}
    SAVE[klik Simpan Itinerary]
    SHARE[klik Bagikan]
    BOOK[klik Book This Trip]
    PRINT[klik Print]
    COPY[klik Copy]
    SAVED[Tersimpan di SavedItinerary\nvisibility: private]
    SHARED[visibility: shared\nshareToken di-generate\nLink unik aktif]
    BOOKING_MODAL[Modal AIConvertBookingModal\nArahkan ke paket relevan]
    DASHBOARD_ITIN[Lihat di /dashboard/itineraries]
    BOOKING_FLOW[Mulai alur booking]

    AI_PAGE --> CHECK_LOGIN
    CHECK_LOGIN -- Tidak --> LOGIN_REDIRECT
    CHECK_LOGIN -- Ya --> FORM
    FORM --> GENERATE
    GENERATE --> API
    API --> RESULT
    RESULT --> ACTION
    ACTION -- Simpan --> SAVE
    ACTION -- Bagikan --> SHARE
    ACTION -- Book --> BOOK
    ACTION -- Print --> PRINT
    ACTION -- Copy --> COPY
    SAVE --> SAVED
    SAVED --> DASHBOARD_ITIN
    SHARE --> SHARED
    BOOK --> BOOKING_MODAL
    BOOKING_MODAL --> BOOKING_FLOW
```

---

## 6. Alur Dashboard User

```mermaid
flowchart TD
    DASH["/dashboard\nOverview"]
    BOOKINGS["/dashboard/bookings\nList Booking"]
    BOOKING_DETAIL["/dashboard/bookings/[id]\nDetail Booking"]
    WISHLIST["/dashboard/wishlist\nWishlist"]
    ITIN["/dashboard/itineraries\nItinerary AI"]
    NOTIF["/dashboard/notifications\nNotifikasi"]
    PROFILE["/profile\nProfil"]

    DASH --> BOOKINGS
    DASH --> WISHLIST
    DASH --> ITIN
    DASH --> NOTIF
    DASH --> PROFILE
    BOOKINGS --> BOOKING_DETAIL

    BOOKING_DETAIL --> PDF["Download PDF Bukti Booking\nhanya jika confirmed/completed"]
    BOOKING_DETAIL --> REFUND["Ajukan Refund\nhanya jika confirmed"]
    WISHLIST --> PKG_PAGE["Klik item → /packages/[slug]"]
    WISHLIST --> REMOVE[Hapus dari wishlist]
    ITIN --> ITIN_DETAIL[Lihat detail hari per hari]
    ITIN --> ITIN_SHARE["Bagikan → link unik"]
    ITIN --> ITIN_DELETE[Hapus itinerary]
    NOTIF --> MARK_READ[Tandai semua dibaca]
```

---

## 7. Alur Admin — Kelola Booking & Refund

```mermaid
flowchart TD
    ADMIN_DASH["/admin\nDashboard Admin"]
    BOOKINGS["/admin/bookings\nList Semua Booking"]
    BOOKING_DETAIL[Detail Booking\nTraveler, metode bayar, total]
    UPDATE_STATUS[Update status booking]
    CANCEL[Cancel booking]
    REFUNDS["/admin/refunds\nList Refund Requested"]
    REFUND_DETAIL[Detail Refund\nAlasan, nilai, booking terkait]
    APPROVE[Approve Refund]
    REJECT[Reject + isi alasan]
    NOTIF_USER_OK[Notifikasi ke user: disetujui]
    NOTIF_USER_FAIL[Notifikasi ke user: ditolak]
    MANUAL[Transfer dana manual]

    ADMIN_DASH --> BOOKINGS
    ADMIN_DASH --> REFUNDS
    BOOKINGS --> BOOKING_DETAIL
    BOOKING_DETAIL --> UPDATE_STATUS
    BOOKING_DETAIL --> CANCEL
    REFUNDS --> REFUND_DETAIL
    REFUND_DETAIL --> APPROVE
    REFUND_DETAIL --> REJECT
    APPROVE --> NOTIF_USER_OK
    APPROVE --> MANUAL
    REJECT --> NOTIF_USER_FAIL
```

---

## 8. Alur Admin — Kelola Konten & Paket

```mermaid
flowchart TD
    ADMIN["/admin"]
    PKG_ADMIN["/admin/packages\nKelola Paket"]
    DEP_ADMIN["/admin/departures\nKelola Jadwal"]
    DEST_ADMIN["/admin/destinations\nKelola Destinasi"]
    CMS["CMS:\nhero / faqs / testimonials\nfeatures / how-it-works / partners"]
    COUPON["/admin/coupons\nKelola Kupon"]
    REPORTS["/admin/reports\nLaporan"]
    USERS["/admin/users\nKelola User"]
    AUDIT["/admin/audit-logs\nLog Aktivitas"]

    ADMIN --> PKG_ADMIN
    ADMIN --> DEP_ADMIN
    ADMIN --> DEST_ADMIN
    ADMIN --> CMS
    ADMIN --> COUPON
    ADMIN --> REPORTS
    ADMIN --> USERS
    ADMIN --> AUDIT

    PKG_ADMIN --> DRAFT[Status: draft\ntidak tampil di frontend]
    PKG_ADMIN --> PUBLISH[Publish → tampil di /packages]
    PKG_ADMIN --> ARCHIVE[Archive → tersembunyi]

    DEP_ADMIN --> SLOT_STATUS["Set status slot:\navailable / limited / sold_out / cancelled"]

    REPORTS --> PDF[Export PDF]
    REPORTS --> CSV[Export CSV]

    USERS --> ROLE{Super Admin?}
    ROLE -- Ya --> CHANGE_ROLE[Ubah role user\nuser ↔ admin ↔ super_admin]
    ROLE -- Tidak --> VIEW_ONLY[Lihat detail user saja]
```

---

## 9. Matriks Akses per Role

```mermaid
flowchart LR
    subgraph USER["Role: user (Customer)"]
        U1[Browse & search]
        U2[Booking & payment]
        U3[Wishlist]
        U4[AI Planner]
        U5[Dashboard pribadi]
        U6[Ajukan refund]
    end

    subgraph OFFICER["Role: booking_officer (Staff Ops)"]
        O1[Cek & verifikasi booking]
        O2[Review & proses refund]
        O3[Lihat laporan transaksi]
        O4[Akses terbatas /admin]
    end

    subgraph ADMIN["Role: admin (Content & Ops)"]
        A1[Semua akses booking officer]
        A2[Kelola paket & jadwal]
        A3[Kelola destinasi]
        A4[Kelola CMS hero & FAQ]
        A5[Buat kupon promo]
        A6[Export laporan keuangan]
    end

    subgraph SUPER["Role: super_admin (Super Admin)"]
        S1[Semua akses admin]
        S2["Kelola akun & ubah role\n(EKSKLUSIF)"]
        S3[Audit logs & setting sistem]
    end

    USER -.-> OFFICER
    OFFICER --> ADMIN
    ADMIN --> SUPER
```
