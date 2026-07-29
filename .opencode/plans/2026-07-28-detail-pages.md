# Destination & Package Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add individual detail pages for destinations and packages so users can view full info and navigate to booking.

**Architecture:** Add GET handlers to the two existing `[id]` route files (currently only PUT/DELETE), then create server-component detail pages that fetch a single record by id. Update the homepage section components to link cards to their detail pages instead of opening the lightbox/router.push.

**Tech Stack:** Next.js 16.2.12 App Router, React 19, TypeScript strict, Tailwind CSS v4, Supabase (service role via `@/lib/supabase`), lucide-react, `components/ScrollReveal.tsx`

## Global Constraints

- Next.js 16 App Router — `params` is a `Promise<{ id: string }>`, always `await params`
- Tailwind v4: use `@import "tailwindcss"` — no `tailwind.config.js` class allowlists
- All DB access in API routes uses `import { supabase } from '@/lib/supabase'` (service role)
- Client components: `'use client'` at top; server components: no directive
- `includes` field in Package table is stored as a JSON string — parse with `JSON.parse(item.includes)`
- No test framework exists — manual verification via `curl` and browser
- Icons: lucide-react only
- Dark theme background: `bg-[#0a0a0a]` text: `text-white`, muted: `text-white/60`

---

### Task 1: Add GET handler to `/api/destinations/[id]` and `/api/packages/[id]`

**Files:**
- Modify: `app/api/destinations/[id]/route.ts` (currently 25 lines — prepend GET handler)
- Modify: `app/api/packages/[id]/route.ts` (currently 26 lines — prepend GET handler)

**Interfaces:**
- Produces:
  - `GET /api/destinations/[id]` → `200 { id, city, country, tagline, price, image, tag, rating, duration, description? }` or `404 { error: 'Not found' }`
  - `GET /api/packages/[id]` → `200 { id, tag, tagColor, title, subtitle, image, price, originalPrice, duration, groupSize, rating, reviews, includes: string[], highlight, category }` or `404 { error: 'Not found' }`
  - `includes` is returned as a parsed array (not raw JSON string)

- [ ] **Step 1: Add GET to `app/api/destinations/[id]/route.ts`**

Add this block at the top of the file, before the existing `PUT`:

```typescript
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('Destination').select('*').eq('id', Number(id)).single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
```

- [ ] **Step 2: Verify destinations GET**

```bash
curl http://localhost:3000/api/destinations/1
```

Expected: JSON object with `id`, `city`, `country`, etc.
Expected on bad id: `{"error":"Not found"}` with status 404.

- [ ] **Step 3: Add GET to `app/api/packages/[id]/route.ts`**

Add this block at the top of the file, before the existing `PUT`:

```typescript
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('Package').select('*').eq('id', Number(id)).single()
    if (error) throw error
    return NextResponse.json({ ...data, includes: typeof data.includes === 'string' ? JSON.parse(data.includes) : data.includes })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
```

- [ ] **Step 4: Verify packages GET**

```bash
curl http://localhost:3000/api/packages/1
```

Expected: JSON with `includes` as an array, not a string.

- [ ] **Step 5: Commit**

```bash
git add app/api/destinations/[id]/route.ts app/api/packages/[id]/route.ts
git commit -m "feat: add GET handler to destinations and packages [id] routes"
```

---

### Task 2: Destination detail page

**Files:**
- Create: `app/destinations/[id]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/destinations/[id]` from Task 1 — returns `{ id, city, country, tagline, price, image, tag, rating, duration }`
- Consumes: `components/ScrollReveal.tsx` — `<ScrollReveal animation="slide-up">` wraps sections
- Produces: `/destinations/[id]` route — server component page

- [ ] **Step 1: Create `app/destinations/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react'
import ScrollReveal from '@/components/ScrollReveal'

interface Destination {
  id: number
  city: string
  country: string
  tagline: string
  price: string
  image: string
  tag: string | null
  rating: number
  duration: string
}

async function getDestination(id: string): Promise<Destination | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/destinations/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dest = await getDestination(id)
  if (!dest) notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 px-6 md:px-16">
          {dest.tag && (
            <span className="inline-block bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
              {dest.tag}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            {dest.city}
          </h1>
          <p className="text-white/60 text-lg mt-1">{dest.country}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 md:px-16 pt-6">
        <nav className="text-sm text-white/40 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#destinations" className="hover:text-white transition-colors">Destinations</Link>
          <span>/</span>
          <span className="text-white/70">{dest.city}</span>
        </nav>
      </div>

      {/* Details */}
      <ScrollReveal animation="slide-up">
        <div className="px-6 md:px-16 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-white/70 text-lg leading-relaxed">{dest.tagline}</p>
          </div>
          <div className="flex flex-col gap-4 bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center gap-3 text-white/70">
              <MapPin className="w-4 h-4 text-white/40" />
              <span>{dest.city}, {dest.country}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Clock className="w-4 h-4 text-white/40" />
              <span>{dest.duration}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{dest.rating} / 5.0</span>
            </div>
            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Starting from</p>
              <p className="text-white text-2xl font-bold">{dest.price}</p>
            </div>
            <Link
              href={`/booking?destination=${encodeURIComponent(dest.city)}`}
              className="mt-2 flex items-center justify-center gap-2 bg-white text-black text-sm font-bold px-6 py-3.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              Book this destination <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/destinations/1`.
Expected: page renders with hero image, city name, country, rating, duration, price, and "Book this destination" button.
Navigate to `http://localhost:3000/destinations/99999`.
Expected: Next.js 404 page.

- [ ] **Step 3: Commit**

```bash
git add app/destinations/[id]/page.tsx
git commit -m "feat: add destination detail page"
```

---

### Task 3: Package detail page

**Files:**
- Create: `app/packages/[id]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/packages/[id]` from Task 1 — returns `{ id, tag, tagColor, title, subtitle, image, price, originalPrice, duration, groupSize, rating, reviews, includes: string[], highlight, category }`
- Consumes: `components/ScrollReveal.tsx`
- Produces: `/packages/[id]` route — server component page

- [ ] **Step 1: Create `app/packages/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, Users, Star, ArrowRight, Check } from 'lucide-react'
import ScrollReveal from '@/components/ScrollReveal'

interface Package {
  id: number
  tag: string
  tagColor: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice: number
  duration: string
  groupSize: string
  rating: number
  reviews: number
  includes: string[]
  highlight: string
  category: string
}

async function getPackage(id: string): Promise<Package | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/packages/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pkg = await getPackage(id)
  if (!pkg) notFound()

  const discount = pkg.originalPrice > pkg.price
    ? Math.round((1 - pkg.price / pkg.originalPrice) * 100)
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor}`}>
            {pkg.tag}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 md:px-16 pt-6">
        <nav className="text-sm text-white/40 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#packages" className="hover:text-white transition-colors">Packages</Link>
          <span>/</span>
          <span className="text-white/70">{pkg.title}</span>
        </nav>
      </div>

      {/* Content */}
      <ScrollReveal animation="slide-up">
        <div className="px-6 md:px-16 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                {pkg.title}
              </h1>
              <p className="text-white/60 text-lg mt-2">{pkg.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-white/40" />{pkg.duration}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-white/40" />{pkg.groupSize}</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{pkg.rating} ({pkg.reviews} reviews)</span>
            </div>

            {pkg.highlight && (
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6">
                <p className="text-white/70 text-sm leading-relaxed italic">"{pkg.highlight}"</p>
              </div>
            )}

            {pkg.includes?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">What's included</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: price + CTA */}
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06] h-fit sticky top-6 flex flex-col gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Package price</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold">${pkg.price.toLocaleString()}</span>
                {pkg.originalPrice > pkg.price && (
                  <span className="text-white/40 text-lg line-through">${pkg.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {discount && (
                <span className="inline-block mt-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                  {discount}% off
                </span>
              )}
            </div>
            <Link
              href={`/booking?package=${encodeURIComponent(pkg.title)}`}
              className="flex items-center justify-center gap-2 bg-white text-black text-sm font-bold px-6 py-3.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              Book this package <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/packages/1`.
Expected: page renders tag badge, title, subtitle, duration, group size, rating, includes list with checkmarks, price with strikethrough if discounted, "Book this package" CTA.
Navigate to `http://localhost:3000/packages/99999`.
Expected: Next.js 404 page.

- [ ] **Step 3: Commit**

```bash
git add app/packages/[id]/page.tsx
git commit -m "feat: add package detail page"
```

---

### Task 4: Link homepage cards to detail pages

**Files:**
- Modify: `components/DestinationsSection.tsx` — destination cards currently open a lightbox; add a "View details" link to each card pointing to `/destinations/{id}`
- Modify: `components/PackagesSection.tsx` — `PackageCard` div currently has no link; wrap it or add a "View details" link to `/packages/{id}`

**Interfaces:**
- Consumes: `/destinations/[id]` and `/packages/[id]` routes from Tasks 2–3

- [ ] **Step 1: Update `DestinationsSection.tsx` destination cards**

Locate the destination card render block (around line 130–165). Each card renders inside a `<div>` in the `ScrollReveal` block. Add a `Link` over the arrow button at the bottom of each card to navigate to the detail page. Find the `<div className="w-12 h-12 rounded-full...">` with the ArrowRight icon and wrap it in a `Link`:

```typescript
// At the top of the file, Link is already imported from 'next/link'
// Replace the ArrowRight button div with:
<Link
  href={`/destinations/${dest.id}`}
  className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/25 transition-colors"
  onClick={(e) => e.stopPropagation()}
>
  <ArrowRight className="w-5 h-5 text-white" />
</Link>
```

Note: `e.stopPropagation()` prevents the parent `onClick` (which opens the lightbox) from firing when the link is clicked.

- [ ] **Step 2: Update `PackagesSection.tsx` PackageCard**

Locate `PackageCard` (line 31). The outer `<div>` has `cursor-pointer` but no navigation. Add a `Link` wrapping the entire card's header/image area, or add a "View details" text link in the card footer alongside the existing "Book now" button.

Find the card's footer section (the `<div className="p-6 pt-0">` or similar bottom area). Add a "View details" link before the "Book now" button:

```typescript
// Add this import at the top if not already present: import Link from 'next/link'
// In the PackageCard footer, before the "Book now" button area, add:
<Link
  href={`/packages/${pkg.id}`}
  className="w-full flex items-center justify-center gap-2 border border-black/10 text-black/70 text-sm font-medium px-4 py-2.5 rounded-full hover:border-black/20 hover:text-black transition-colors"
>
  View details
</Link>
```

- [ ] **Step 3: Verify links in browser**

Open `http://localhost:3000`.
Click the ArrowRight button on a destination card → should navigate to `/destinations/{id}`.
Click "View details" on a package card → should navigate to `/packages/{id}`.
Lightbox should still open when clicking the destination card body (not the ArrowRight link).

- [ ] **Step 4: Commit**

```bash
git add components/DestinationsSection.tsx components/PackagesSection.tsx
git commit -m "feat: link destination and package cards to detail pages"
```
