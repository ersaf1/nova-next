# NOVA Plan 3 — Dashboard, Wishlist, AI Itinerary, Promo Code
**Tahap 7, 8, 9, 10**

Date: 2026-07-28
Depends on: Plan 1 + Plan 2 completed

---

## Context

Stack: Next.js 16 (App Router), React 19, TypeScript, Supabase, Tailwind v4.

What already exists after Plan 1 + 2:
- `/packages/[slug]` — detail page with departure selector
- `/booking/[packageId]/[departureId]` — multi-step booking
- `/payment/pending/[bookingId]` — payment pending page
- `app/dashboard/page.tsx` — single file, fetches bookings by `?email=` query (insecure), no sub-routes
- `app/wishlist/page.tsx` — unknown state, needs investigation
- `app/itinerary/page.tsx` — AI itinerary generator exists, unknown state
- `lib/types.ts` — shared types including `Booking`, `TravelPackage`
- NOVA15 promo code banner shown on homepage/packages section

---

## What this plan delivers

1. Dashboard expanded to sub-routes: `/dashboard/bookings`, `/dashboard/bookings/[bookingId]`, `/dashboard/wishlist`, `/dashboard/itineraries`, `/dashboard/profile`
2. Dashboard home: upcoming trip, countdown, pending payment alert, stats
3. Booking detail page: full info, status, price breakdown, pay/cancel/invoice actions
4. Wishlist: DB-connected heart buttons, add/remove, dashboard list
5. AI itinerary: save results, rename, delete, share link, "Cari Paket" button
6. Promo code: validated server-side, NOVA15 actually works, price breakdown shown
7. All dashboard routes require auth and only show the logged-in user's data

---

## File Structure

### Modified files
| File | What changes |
|------|-------------|
| `app/dashboard/page.tsx` | Become dashboard home overview; use server session |
| `app/wishlist/page.tsx` | Connect to DB wishlist table |
| `app/itinerary/page.tsx` | Add save/rename/delete/share to generated itineraries |
| `components/PackagesSection.tsx` | Heart button connected to wishlist API |
| `app/packages/[slug]/page.tsx` | Heart button connected to wishlist API |
| `app/api/bookings/route.ts` | Already secured in Plan 2; add userId to POST |
| `app/api/payment/create/route.ts` | Already secured in Plan 2 |

### New files
| File | Responsibility |
|------|---------------|
| `app/dashboard/layout.tsx` | Shared dashboard layout with sidebar nav |
| `app/dashboard/bookings/page.tsx` | Booking list with filters |
| `app/dashboard/bookings/[bookingId]/page.tsx` | Booking detail |
| `app/dashboard/wishlist/page.tsx` | Saved packages list |
| `app/dashboard/itineraries/page.tsx` | Saved AI itineraries list |
| `app/dashboard/profile/page.tsx` | User profile edit |
| `app/api/wishlist/route.ts` | GET (list), POST (add), DELETE (remove) |
| `app/api/itineraries/route.ts` | GET (list), POST (save), PATCH (rename), DELETE |
| `app/api/itineraries/[id]/route.ts` | GET single (public if shared), PATCH, DELETE |
| `app/api/coupons/validate/route.ts` | POST — server-side promo validation |
| `supabase/migrations/004_wishlist_itinerary_promo.sql` | Schema for Wishlist (package), SavedItinerary, PromoCode |

---

## Tasks

### Task 1 — Database migration: Wishlist (packages), SavedItinerary, PromoCode

**File:** `supabase/migrations/004_wishlist_itinerary_promo.sql`

```sql
-- Extend Wishlist to support packages (currently only destinations)
ALTER TABLE "Wishlist"
  ADD COLUMN IF NOT EXISTS "packageId"  BIGINT REFERENCES "Package"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "type"       TEXT NOT NULL DEFAULT 'destination'
    CHECK ("type" IN ('destination', 'package'));

-- SavedItinerary table
CREATE TABLE IF NOT EXISTS "SavedItinerary" (
  "id"               BIGSERIAL PRIMARY KEY,
  "userId"           TEXT NOT NULL,
  "title"            TEXT NOT NULL DEFAULT 'Itinerary Baru',
  "destination"      TEXT NOT NULL,
  "duration"         INTEGER NOT NULL,
  "travelers"        INTEGER NOT NULL DEFAULT 1,
  "budget"           BIGINT,
  "preferences"      TEXT DEFAULT '[]',  -- JSON array of strings
  "generatedContent" JSONB,
  "visibility"       TEXT NOT NULL DEFAULT 'private'
    CHECK ("visibility" IN ('private', 'shared')),
  "shareToken"       TEXT UNIQUE,        -- UUID for shared link
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_user ON "SavedItinerary"("userId");
CREATE INDEX IF NOT EXISTS idx_itinerary_token ON "SavedItinerary"("shareToken");

-- PromoCode table
CREATE TABLE IF NOT EXISTS "PromoCode" (
  "id"               BIGSERIAL PRIMARY KEY,
  "code"             TEXT NOT NULL UNIQUE,
  "discountType"     TEXT NOT NULL CHECK ("discountType" IN ('percentage', 'fixed')),
  "discountValue"    NUMERIC(10,2) NOT NULL,
  "minimumPurchase"  BIGINT,
  "maximumDiscount"  BIGINT,
  "startDate"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "endDate"          TIMESTAMPTZ NOT NULL,
  "usageLimit"       INTEGER,
  "usagePerUser"     INTEGER DEFAULT 1,
  "usageCount"       INTEGER NOT NULL DEFAULT 0,
  "active"           BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed NOVA15 promo
INSERT INTO "PromoCode" ("code", "discountType", "discountValue", "minimumPurchase", "maximumDiscount", "endDate", "usageLimit", "usagePerUser", "active")
VALUES ('NOVA15', 'percentage', 15, 5000000, 3000000, NOW() + INTERVAL '365 days', 1000, 1, TRUE)
ON CONFLICT ("code") DO NOTHING;

-- Track promo usage per booking
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "promoCode"   TEXT,
  ADD COLUMN IF NOT EXISTS "serviceFee"  BIGINT NOT NULL DEFAULT 250000,
  ADD COLUMN IF NOT EXISTS "userId"      TEXT;

-- Backfill userId from email where possible (best effort)
-- UPDATE "Booking" b SET "userId" = u.id FROM auth.users u WHERE u.email = b.email;
```

**Test:** In Supabase Studio, confirm all three tables exist with correct columns. Confirm NOVA15 promo row.

---

### Task 2 — Dashboard layout with sidebar

**File:** `app/dashboard/layout.tsx`

Server component. Renders sidebar + content area. Auth gate: if no session, redirect to `/login?redirect=/dashboard`.

Sidebar nav links:
- Overview (dashboard home)
- Booking Saya (`/dashboard/bookings`)
- Wishlist (`/dashboard/wishlist`)
- Itinerary AI (`/dashboard/itineraries`)
- Profil (`/dashboard/profile`)

Sidebar shows user avatar, name, email (from Supabase session).

Mobile: sidebar collapses to bottom nav or hamburger menu.

Match existing NOVA design — white background, neutral borders, no new color tokens.

**Test:**
- Visit `/dashboard` logged out → redirect to login
- Visit `/dashboard` logged in → sidebar renders with correct user name
- Sidebar links all work

---

### Task 3 — Dashboard home: overview page

**File:** `app/dashboard/page.tsx`

Replace current single-file implementation with focused overview.

Sections:
1. **Perjalanan Terdekat** — next upcoming confirmed booking. Show package name, departure date, days until departure (countdown). If none: "Belum ada perjalanan mendatang."
2. **Pembayaran Menunggu** — any booking with `paymentStatus = 'unpaid'` or `'pending'`. Show alert card with "Selesaikan Pembayaran" button → `/payment/pending/[bookingId]`.
3. **Statistik** — total bookings, total destinations visited (completed bookings), total spend in Rupiah.
4. **Quick Actions** — Search Packages, Plan Itinerary, Book a Trip.

Fetch bookings server-side using service role, scoped to `userId = session.user.id`.

**Test:**
- No bookings → all empty states shown correctly
- Pending payment booking → alert card visible with correct button
- Upcoming trip → countdown shows correct days remaining

---

### Task 4 — Dashboard booking list

**File:** `app/dashboard/bookings/page.tsx`

List all bookings for logged-in user. Sorted by `created_at` descending.

Columns: Booking code, Package, Departure date, Travelers, Total (Rupiah), Booking status, Payment status, Action.

Status badges:
- Booking status: pending (amber), confirmed (green), cancelled (red), completed (neutral)
- Payment status: unpaid (red), pending (amber), paid (green), failed (red), expired (neutral), refunded (blue)

Filter tabs: Semua, Aktif, Selesai, Dibatalkan.

Each row → link to `/dashboard/bookings/[bookingId]`.

Pagination: 10 per page.

**Test:**
- No bookings → empty state: "Belum ada booking. Cari paket wisata?"
- Click booking row → navigates to detail page
- Filter by status → list updates

---

### Task 5 — Dashboard booking detail

**File:** `app/dashboard/bookings/[bookingId]/page.tsx`

Server component. Fetch booking by ID, verify `userId = session.user.id`. If not owner → 404 (not 403, to avoid enumeration).

Sections:
- Header: booking code, booking status badge, payment status badge
- Package info: name, destination, cover image thumbnail
- Departure: start date, end date, duration
- Travelers: list of traveler names
- Contact: name, email, phone
- Price breakdown: unit price, travelers, subtotal, promo discount, service fee, total — all in Rupiah
- Actions:
  - If `paymentStatus = 'unpaid'` or `'pending'`: "Lanjutkan Pembayaran" → `/payment/pending/[bookingId]`
  - If `bookingStatus = 'confirmed'` and departure in future: "Download E-Ticket" button
  - If `bookingStatus = 'pending'` and not yet paid: "Batalkan Booking" with confirmation dialog
  - "Hubungi Support" link (mailto or WhatsApp)
- Cancellation policy section

**Test:**
- Visit logged out → 404 (not redirect, to prevent enumeration)
- Visit other user's booking → 404
- Visit own booking → renders correctly
- "Lanjutkan Pembayaran" only shown when payment not complete
- "Download E-Ticket" only shown when confirmed

---

### Task 6 — Wishlist: API + heart button

**Files:**
- `app/api/wishlist/route.ts` — GET list, POST add, DELETE remove
- `components/WishlistButton.tsx` — reusable heart button client component

**API design:**

```ts
// GET /api/wishlist?type=package — returns user's wishlist items
// Requires session auth

// POST /api/wishlist — add item
// Body: { type: 'package', packageId: number }

// DELETE /api/wishlist?type=package&packageId=123 — remove item
```

All three endpoints require session. User can only access their own wishlist.

**WishlistButton component:**
```tsx
type Props = {
  type: 'package'
  itemId: number
  initialWishlisted?: boolean
}
```

- Shows filled heart if wishlisted, outline if not
- On click: if not logged in → redirect to `/login?redirect=[current path]`
- If logged in: optimistic toggle, call API, revert on error
- `'use client'` component

**Update these files to include WishlistButton:**
- `app/packages/[slug]/page.tsx` — heart button in sticky booking card
- `components/PackagesSection.tsx` — heart button on each package card (visible on hover)

**Test:**
- Click heart logged out → redirect to login
- Click heart logged in → heart fills, POST called, refreshing page keeps heart filled
- Click again → heart empties, DELETE called
- Dashboard wishlist → shows saved packages with link to detail + "Book Now"

---

### Task 7 — Dashboard wishlist page

**File:** `app/dashboard/wishlist/page.tsx`

Grid of wishlisted packages. Each card:
- Cover image
- Package title
- Price from (Rupiah)
- Rating
- Button: "Lihat Detail" → `/packages/[slug]`
- Button: "Booking" → `/packages/[slug]` (not directly to booking, to allow departure selection)
- Heart button to remove from wishlist

Empty state: "Wishlist kamu masih kosong. Temukan paket yang kamu suka!"

**Test:**
- Empty wishlist → empty state shown
- Items shown → correct package info rendered
- Remove from wishlist → item disappears immediately (optimistic)
- "Booking" button → navigates to package detail

---

### Task 8 — AI Itinerary: save, rename, delete, share

**File:** `app/itinerary/page.tsx`

Read the existing file first to understand what already exists. Then add:

1. After AI generates an itinerary: show "Simpan Itinerary" button.
2. On save: POST `/api/itineraries` with the generated content, destination, duration, travelers, budget, preferences.
3. If AI returns fallback/mock result (not real AI): show banner: "Ini adalah contoh sementara. Hubungkan Gemini API untuk hasil nyata."
4. Rate limiting: track generation attempts in session, limit to 5 per hour per user. Show error: "Batas generasi tercapai. Coba lagi dalam 1 jam."

**File:** `app/dashboard/itineraries/page.tsx`

List saved itineraries. Each card:
- Title (editable inline on double-click)
- Destination + duration
- Created date
- Actions: View, Rename (pencil icon), Delete (trash icon, confirmation), Share (chain icon → copy link)

**File:** `app/api/itineraries/route.ts`

GET: returns user's saved itineraries (auth required).
POST: saves new itinerary (auth required).

**File:** `app/api/itineraries/[id]/route.ts`

GET: returns single itinerary. If `visibility = 'shared'`, no auth required. If `visibility = 'private'`, auth + ownership check.
PATCH: rename or change visibility (auth + ownership required).
DELETE: delete (auth + ownership required).

**Share link:** `/itinerary/shared/[shareToken]` — public page showing read-only itinerary. Create `app/itinerary/shared/[shareToken]/page.tsx`.

**"Cari Paket yang Sesuai" button:** After viewing a saved itinerary, show button that links to `/search?q=[destination]`. Do not auto-create a booking.

**Test:**
- Generate itinerary → save button appears
- Save → appears in dashboard itineraries list
- Rename inline → updates on blur, PATCH called
- Delete → confirmation dialog, then removed
- Share → copies link, visiting link without auth shows read-only itinerary
- Rate limiting → after 5 generations in 1 hour, button disabled with error message

---

### Task 9 — Promo code: server-side validation

**File:** `app/api/coupons/validate/route.ts`

POST endpoint. Validates promo code server-side.

```ts
// Body: { code: string, subtotal: number }
// Response: { valid: true, discountAmount: number, finalAmount: number }
//       or: { valid: false, message: string }

// Validation steps:
// 1. Find promo by code (case-insensitive)
// 2. Check active = true
// 3. Check startDate <= now <= endDate
// 4. Check usageCount < usageLimit (if limit set)
// 5. If auth: check user hasn't used this code more than usagePerUser times
// 6. Check subtotal >= minimumPurchase (if set)
// 7. Calculate discount:
//    - percentage: Math.floor(subtotal * discountValue / 100), capped at maximumDiscount
//    - fixed: discountValue, capped at subtotal
// 8. Return discountAmount and finalAmount
```

Never return the raw promo row. Only return `{ valid, discountAmount, finalAmount, message }`.

**Update booking POST:** When a promo code is submitted with a booking, re-validate it server-side. Store the validated `discountAmount` in the booking. Never use the discount amount from the browser body.

**Update BookingStepReview:** Add promo code input field. On apply: POST to `/api/coupons/validate`. Show breakdown:
```
Subtotal          Rp10.000.000
Diskon NOVA15    -Rp1.500.000
Biaya layanan       Rp250.000
Total             Rp8.750.000
```

**Remove misleading promo banners if promo not working:** The `PackagesSection.tsx` banner shows "Use code NOVA15 at checkout." This is fine to keep now that NOVA15 actually works.

**Test:**
- POST with invalid code → `{ valid: false, message: 'Kode promo tidak valid' }`
- POST with expired code → `{ valid: false, message: 'Kode promo telah kadaluarsa' }`
- POST with NOVA15 and subtotal Rp10.000.000 → discount = Rp1.500.000 (15%, capped at Rp3.000.000)
- POST with NOVA15 and subtotal Rp1.000.000 (below minimum) → `{ valid: false, message: 'Minimum pembelian Rp5.000.000' }`
- Apply promo in booking review → price breakdown updates correctly
- Submit booking with valid promo → discount stored in DB, not taken from browser

---

### Task 10 — Type check, lint, and final verification

```bash
npx tsc --noEmit
npx eslint . --max-warnings 0
```

Additional checks:
- All dashboard pages return 404 (not 403) for unauthorized access to other users' data
- No route leaks the full booking list without auth
- Share itinerary link works without login
- Promo code endpoint does not expose raw promo table data

---

## New environment variables needed

No new env vars required for this plan. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (already used by existing itinerary page)

Add to `.env.example` if not already present.

---

## Risks and notes

1. **Existing itinerary page**: Read `app/itinerary/page.tsx` before modifying. If it uses a complex custom implementation, be careful not to break existing generation logic. Only add the save/load layer on top.

2. **Wishlist table currently stores `destination_id`**: The migration adds `packageId` and `type`. Existing destination wishlist rows will have `type = 'destination'` (default). The dashboard wishlist page in this plan only shows package wishlist. Destination wishlist can be a future enhancement.

3. **UsagePerUser tracking for promo codes**: Requires knowing the userId at validation time. If the user is not logged in, skip the per-user limit check. They'll hit the global limit eventually.

4. **E-ticket download**: `EticketDownloadButton` and `EticketPDF` components already exist in `components/`. Use them for the booking detail page. Read those files first to understand required props.

5. **CancelBookingModal**: Already exists in `components/CancelBookingModal.tsx`. Use it for the cancel action on the booking detail page.

6. **`Booking.userId` column**: Added in migration 004. For old bookings without `userId`, ownership is checked by `email = session.user.email` as fallback. New bookings must always set `userId` from session.
