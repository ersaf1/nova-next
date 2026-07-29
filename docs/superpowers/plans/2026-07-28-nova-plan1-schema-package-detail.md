# NOVA Plan 1 — Schema Cleanup + Package Detail Page
**Tahap 1 & 2 | Definition of Done milestone**

Date: 2026-07-28

---

## Context

Stack: Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + Auth), Tailwind v4.

Key files already read:
- `lib/types.ts` — shared types, already has `TravelPackage`, `PackageDeparture`, `Booking`
- `supabase/migrations/001_add_departure_table.sql` — `PackageDeparture` table exists
- `app/packages/[id]/page.tsx` — detail page exists but uses local `type Package`, bypasses shared types, routes booking to `/booking?package=title` (wrong)
- `app/packages/page.tsx` — uses static hardcoded data array, prices in USD, cards link to `/packages/[id]` (correct)
- `components/PackagesSection.tsx` — homepage cards do NOT link to detail page, click goes to `/booking` directly (wrong)
- `app/search/page.tsx` — cards link to `/booking?packageId=...` (wrong), local `interface Package` duplicate
- `components/BookingPage.tsx` — multi-step form, uses local `interface Package`, USD prices
- `app/api/bookings/route.ts` — POST creates booking, fetches price from DB (good), but GET allows `?email=` filter with no auth (security hole)
- `app/api/payment/create/route.ts` — trusts `amount` from browser (security hole)
- `app/api/payment/notification/route.ts` — no webhook signature verification (security hole)
- `supabase/seed.sql` — `Package` table has no `slug`, `destinationId`, `shortDescription`, `description`, `durationDays`, `durationNights`, `gallery`, `excluded`, `status` columns
- `supabase/seed.sql` — `Destination` table has no `name`, `slug` columns; has `city` as the de-facto name

---

## What this plan delivers (Definition of Done)

1. `lib/types.ts` updated — `Destination`, `TravelPackage`, `PackageDeparture` use the target schema; backward-compat fields preserved
2. Database migration SQL for new `Package` columns (`slug`, `destinationId`, `shortDescription`, `description`, `durationDays`, `durationNights`, `coverImage`, `gallery`, `excluded`, `status`) and `Destination` columns (`name`, `slug`)
3. `app/packages/[slug]/page.tsx` created — full detail page with all required sections
4. `app/packages/[id]/page.tsx` kept as redirect to slug URL (backward compat)
5. All package cards (homepage, /packages, /search) link to `/packages/[slug]` not to `/booking`
6. Booking button on detail page is disabled until departure is selected
7. Prices formatted as Rupiah everywhere
8. Admin: departure management UI added to existing admin packages section
9. Type checking and lint pass

---

## File Structure

### Modified files
| File | What changes |
|------|-------------|
| `lib/types.ts` | Extend `TravelPackage` with new fields; add `slug`, `name` to `Destination`; add `Traveler` type; keep backward-compat fields |
| `app/packages/[id]/page.tsx` | Turn into redirect to `/packages/[slug]` |
| `app/packages/page.tsx` | Fetch from API, use shared types, link cards to `/packages/[slug]` |
| `components/PackagesSection.tsx` | Link cards to `/packages/[slug]` instead of `/booking` |
| `app/search/page.tsx` | Link cards to `/packages/[slug]`, remove local interface duplication |

### New files
| File | Responsibility |
|------|---------------|
| `app/packages/[slug]/page.tsx` | Full package detail page (server component) |
| `components/PackageDetailClient.tsx` | Client-side departure selector + booking button |
| `app/api/packages/[id]/route.ts` | Already exists — extend to return `slug` |
| `supabase/migrations/002_extend_package_destination.sql` | Add new columns to `Package` and `Destination` |

---

## Tasks

### Task 1 — Database migration: extend Package and Destination tables

**File:** `supabase/migrations/002_extend_package_destination.sql`

Create this migration. Run it in Supabase SQL Editor.

```sql
-- Add name + slug to Destination
ALTER TABLE "Destination"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Backfill name from city
UPDATE "Destination" SET "name" = city WHERE "name" IS NULL;

-- Add slug from city (lowercase, spaces to hyphens)
UPDATE "Destination"
SET "slug" = lower(regexp_replace(city, '\s+', '-', 'g'))
WHERE "slug" IS NULL;

-- Add new columns to Package
ALTER TABLE "Package"
  ADD COLUMN IF NOT EXISTS "slug"             TEXT,
  ADD COLUMN IF NOT EXISTS "destinationId"    BIGINT REFERENCES "Destination"("id"),
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "description"      TEXT,
  ADD COLUMN IF NOT EXISTS "durationDays"     INTEGER,
  ADD COLUMN IF NOT EXISTS "durationNights"   INTEGER,
  ADD COLUMN IF NOT EXISTS "coverImage"       TEXT,
  ADD COLUMN IF NOT EXISTS "gallery"          TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "excluded"         TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "status"           TEXT NOT NULL DEFAULT 'published'
    CHECK ("status" IN ('draft','published','archived')),
  ADD COLUMN IF NOT EXISTS "updatedAt"        TIMESTAMPTZ DEFAULT NOW();

-- Backfill slug from title
UPDATE "Package"
SET "slug" = lower(regexp_replace(
  regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE "slug" IS NULL;

-- Backfill coverImage from existing image column
UPDATE "Package" SET "coverImage" = image WHERE "coverImage" IS NULL AND image IS NOT NULL;

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_package_slug ON "Package"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS idx_destination_slug ON "Destination"("slug");

-- Index for destinationId lookup
CREATE INDEX IF NOT EXISTS idx_package_destination ON "Package"("destinationId");
```

**Seed departures for existing packages** (run separately after confirming package IDs):
```sql
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT
  id,
  (NOW()::date + 30) AS startDate,
  (NOW()::date + 37) AS endDate,
  20, 20, price, 'available'
FROM "Package"
WHERE "status" = 'published'
ON CONFLICT DO NOTHING;

INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT
  id,
  (NOW()::date + 60) AS startDate,
  (NOW()::date + 67) AS endDate,
  20, 20, price, 'limited'
FROM "Package"
WHERE "status" = 'published'
ON CONFLICT DO NOTHING;
```

**Test:** In Supabase Studio, confirm `Package` rows now have `slug` populated. Confirm `PackageDeparture` rows exist for each package.

---

### Task 2 — Update shared types in lib/types.ts

**File:** `lib/types.ts`

Extend `TravelPackage` to include the new fields while keeping all existing fields (backward compat).
Add `Traveler` type. Add `slug` and `name` to `Destination`.

Key changes:
- `TravelPackage`: add `slug`, `destinationId`, `shortDescription`, `description`, `durationDays`, `durationNights`, `coverImage`, `gallery: string[]`, `excluded: string[]`, `status`; keep `tag`, `tagColor`, `subtitle`, `image`, `duration`, `groupSize`, `highlight`, `category` as optional for compat
- `Destination`: add `name`, `slug`; keep `city`, `country`, `image`, `rating`, `price`, `tag` as optional for compat
- Add `Traveler` interface per spec
- Keep all existing utility functions (`formatIDR`, `getDepartureStatusLabel`, `getDepartureStatusColor`)

**Test:** Run `npx tsc --noEmit`. Zero errors.

---

### Task 3 — API: extend GET /api/packages/[id] to return slug

**File:** `app/api/packages/[id]/route.ts`

The existing GET handler already returns all columns. Since the migration adds `slug` as a DB column, the `select('*')` will automatically include it after the migration runs. No code change needed — but verify by hitting `GET /api/packages/1` and checking the response includes `slug`.

Also add a new route: `GET /api/packages/by-slug/[slug]/route.ts` so the detail page can fetch by slug.

**New file:** `app/api/packages/by-slug/[slug]/route.ts`

```ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { TravelPackage } from '@/lib/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('Package')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }

  let includes: string[] = []
  let gallery: string[] = []
  let excluded: string[] = []
  try { includes = JSON.parse(data.includes ?? '[]') } catch { includes = [] }
  try { gallery = JSON.parse(data.gallery ?? '[]') } catch { gallery = [] }
  try { excluded = JSON.parse(data.excluded ?? '[]') } catch { excluded = [] }

  return NextResponse.json({ ...data, includes, gallery, excluded } as TravelPackage)
}
```

**Test:** `GET /api/packages/by-slug/bali-paradise-escape` returns a package JSON with `includes` as array.

---

### Task 4 — Package detail page: app/packages/[slug]/page.tsx

This is the main deliverable of Tahap 2. Server component. Fetches package + departures server-side.

**New file:** `app/packages/[slug]/page.tsx`

Structure:
1. Fetch package by slug via `supabase` (service role, server-side)
2. If not found → `notFound()`
3. Fetch departures via `supabase` (upcoming, non-cancelled)
4. Render:
   - `<Navbar />`
   - Hero with cover image (full-width, `next/image`, same style as existing `[id]/page.tsx`)
   - Back button → `/packages`
   - Two-column layout (content left, sticky booking card right)
   - Left: title, city/country badge, category badge, rating + review count, duration
   - Left: gallery strip (if `gallery.length > 0`)
   - Left: description (if present, else `subtitle`/`highlight`)
   - Left: included items (green checkmarks)
   - Left: excluded items (red X marks)
   - Right sticky card: price (Rupiah format), departure selector (`<PackageDetailClient />`), booking button
5. Loading/not-found/error states

**Departure selector rules:**
- Show each departure as a selectable card: date range, price, slots remaining, status badge
- "sold_out" and "cancelled" departures are shown but not selectable (dimmed)
- "limited" shows amber badge
- Booking button disabled until a departure is selected
- When departure selected, booking button links to `/booking?packageId=[id]&departureId=[departureId]`

**Price format:** Use `formatIDR` from `lib/types.ts`. Never show USD `$`.

**Key component split:**
- `app/packages/[slug]/page.tsx` — server component, fetches data
- `components/PackageDetailClient.tsx` — `'use client'`, handles departure selection state and booking button

**PackageDetailClient props:**
```ts
type Props = {
  packageId: number
  departures: PackageDeparture[]
  basePrice: number
}
```

**Test:**
- Navigate to `/packages/bali-paradise-escape` (or any slug from DB) — page renders
- No departure selected → booking button is disabled/greyed
- Select a departure → button becomes active, href includes correct `packageId` and `departureId`
- Non-existent slug → 404 page

---

### Task 5 — Redirect: app/packages/[id]/page.tsx → slug

**File:** `app/packages/[id]/page.tsx`

Replace the existing full detail page with a redirect to the slug-based URL. This preserves any existing links.

```ts
import { redirect, notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function PackageByIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const packageId = parseInt(id)
  if (isNaN(packageId)) notFound()

  const { data } = await supabase
    .from('Package')
    .select('slug')
    .eq('id', packageId)
    .single()

  if (!data?.slug) notFound()

  redirect(`/packages/${data.slug}`)
}
```

**Test:** Navigate to `/packages/1` → browser redirects to `/packages/bali-paradise-escape`.

---

### Task 6 — Fix package card links across the app

All package cards must link to `/packages/[slug]`, not `/booking`.

**Files to update:**

**`app/packages/page.tsx`:**
- Replace static `STATIC_PACKAGES` array with `useEffect` fetch from `/api/packages`
- Change `<Link href={...}>` to use `/packages/${pkg.slug}` (fall back to `/packages/${pkg.id}` if no slug)
- Format price as Rupiah using `formatIDR`

**`components/PackagesSection.tsx`:**
- `PackageCard` is currently a `div` with no link. Wrap with `<Link href={/packages/${pkg.slug || pkg.id}}>` 
- The `ClaimOfferButton` at the bottom stays pointing to `/booking` (it's a CTA, not a card)
- Format prices as Rupiah

**`app/search/page.tsx`:**
- `PackageCard` links to `/booking?packageId=...` — change to `/packages/${pkg.slug || pkg.id}`
- Remove local `interface Package` and `interface Destination`, import from `@/lib/types`
- Format price as Rupiah

**Test:**
- Homepage package card click → navigates to `/packages/[slug]`
- `/packages` page card click → navigates to `/packages/[slug]`
- `/search` page card click → navigates to `/packages/[slug]`

---

### Task 7 — Admin: departure management UI

The existing admin has a packages section. Add departure management.

**Check existing admin structure first:** `app/admin/` directory. Read the existing packages admin page to understand the UI pattern, then add a departures sub-section.

The admin departure UI needs:
- List departures for a selected package (table: date range, price in Rupiah, capacity, remaining slots, status)
- Add departure form: start date, end date, capacity, price (IDR), status
- Edit departure inline or via modal
- Delete with confirmation dialog
- Status badge (color-coded per `getDepartureStatusColor`)
- Loading state, success toast, error message
- Pagination if >10 departures

This task requires reading the existing admin packages page first to match UI patterns exactly. Do not introduce new UI component libraries.

**Test:**
- Open admin → packages → select a package → departures tab/section shows
- Add a departure → appears in list
- Delete a departure → confirmation dialog shown, then removed from list

---

### Task 8 — Type check and lint

```bash
npx tsc --noEmit
npx eslint . --max-warnings 0
```

Fix all errors before marking done.

Common issues to watch for:
- `pkg.slug` might be `undefined` in places where the DB hasn't been migrated yet — use optional chaining and fallback to `pkg.id`
- `formatIDR` import paths
- `PackageDeparture` params still using `{ params: { id: string } }` without `Promise<>` wrapper in some routes — Next.js 16 requires `Promise<>`

---

## Risks and notes

1. **Slug backfill**: The migration generates slugs from titles. If two packages have titles that produce the same slug (e.g. "Bali Tour" and "Bali-Tour"), the unique index will fail. Review the backfill output before applying.

2. **Static data in packages/page.tsx**: The page uses a hardcoded `STATIC_PACKAGES` array with USD prices. Task 6 replaces this with a live fetch. If the API isn't available during development, add a fallback that shows an empty state rather than stale static data.

3. **PackageDetailClient as client component**: The departure selector needs `useState`. Keep this component small — only the interactive parts. The rest of the detail page stays server-rendered for SEO.

4. **No slug yet in DB**: If you run the app before running the migration, `pkg.slug` will be `undefined`. The fallback `pkg.slug || pkg.id` in card links handles this gracefully.

5. **Existing `/packages/[id]` links**: After Task 5 those 301-redirect to slug. Playwright tests or external links using numeric IDs will continue to work.
