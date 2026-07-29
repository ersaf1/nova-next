# Review & Rating System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to submit reviews on destinations and packages. Reviews are stored in Supabase. Any visitor can read reviews; only authenticated users can write one.

**Prerequisite:** Plan `2026-07-28-detail-pages.md` must be completed first — this plan adds ReviewList and ReviewForm to the detail pages created there.

**Architecture:** New `Review` table in Supabase → API routes for read/write → two focused client components (`ReviewList`, `ReviewForm`) → wired into both detail pages.

**Tech Stack:** Next.js 16.2.12 App Router, React 19, TypeScript strict, Tailwind CSS v4, Supabase (service role via `@/lib/supabase` for API routes; anon via `@/lib/supabase-client` in client components), lucide-react

## Global Constraints

- Next.js 16 App Router — `params` is a `Promise<{ id: string }>`, always `await params`
- Tailwind v4: `@import "tailwindcss"` — no config file class allowlists
- API routes: `import { supabase } from '@/lib/supabase'` (service role)
- Client components: `import { supabaseClient } from '@/lib/supabase-client'` (anon key)
- `'use client'` directive required at top of any component using hooks or browser APIs
- Dark theme: `bg-[#0a0a0a]`, text `text-white`, muted `text-white/60`
- Icons: lucide-react only
- No test framework — manual verification via curl and browser

---

### Task 1: Create Review table in Supabase

**Files:**
- Create: `supabase/add_reviews_table.sql`

**Interfaces:**
- Produces: `Review` table with columns: `id`, `user_id`, `user_email`, `user_name`, `entity_type` (CHECK IN ('destination','package')), `entity_id`, `rating` (CHECK 1–5), `title`, `body`, `created_at`

- [ ] **Step 1: Create migration file `supabase/add_reviews_table.sql`**

```sql
CREATE TABLE IF NOT EXISTS "Review" (
  id bigint generated always as identity primary key,
  user_id text not null,
  user_email text not null,
  user_name text not null,
  entity_type text not null CHECK (entity_type IN ('destination', 'package')),
  entity_id bigint not null,
  rating integer not null CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text not null,
  created_at timestamptz default now()
);

ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS review_entity_idx ON "Review" (entity_type, entity_id);
```

- [ ] **Step 2: Run the migration in Supabase**

Go to your Supabase project → SQL Editor → paste and run the SQL above.

Verify:
- Table `Review` appears in the Table Editor
- Insert a test row manually in the SQL Editor:
  ```sql
  INSERT INTO "Review" (user_id, user_email, user_name, entity_type, entity_id, rating, body)
  VALUES ('test-uid', 'test@test.com', 'Test User', 'destination', 1, 5, 'Great place!');
  SELECT * FROM "Review";
  ```
- Clean up: `DELETE FROM "Review" WHERE user_email = 'test@test.com';`

- [ ] **Step 3: Commit**

```bash
git add supabase/add_reviews_table.sql
git commit -m "feat: add Review table migration SQL"
```

---

### Task 2: API routes for reviews

**Files:**
- Create: `app/api/reviews/route.ts` — GET (list by entity) and POST (create review)
- Create: `app/api/reviews/[id]/route.ts` — DELETE (admin check by email)

**Interfaces:**
- `GET /api/reviews?entity_type=destination&entity_id=1` → `200 Review[]` sorted by `created_at desc`
- `POST /api/reviews` body: `{ user_id, user_email, user_name, entity_type, entity_id, rating, title?, body }` → `201 Review`
- `DELETE /api/reviews/[id]` body: `{ admin_email }` → `200 { message }` — only if `admin_email === process.env.ADMIN_EMAIL`
- Error responses: `400 { error: string }` for validation, `401 { error: 'Unauthorized' }` for auth failures, `500` for DB errors

- [ ] **Step 1: Create `app/api/reviews/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entity_type = searchParams.get('entity_type')
    const entity_id = searchParams.get('entity_id')

    if (!entity_type || !entity_id) {
      return NextResponse.json({ error: 'Missing entity_type or entity_id' }, { status: 400 })
    }
    if (!['destination', 'package'].includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Review')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', Number(entity_id))
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, user_email, user_name, entity_type, entity_id, rating, title, body: reviewBody } = body

    if (!user_id || !user_email || !user_name) {
      return NextResponse.json({ error: 'Missing user fields' }, { status: 400 })
    }
    if (!['destination', 'package'].includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }
    if (!entity_id) {
      return NextResponse.json({ error: 'Missing entity_id' }, { status: 400 })
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }
    if (!reviewBody || reviewBody.trim().length === 0) {
      return NextResponse.json({ error: 'Review body is required' }, { status: 400 })
    }

    // Prevent duplicate review from same user for same entity
    const { data: existing } = await supabase
      .from('Review')
      .select('id')
      .eq('user_id', user_id)
      .eq('entity_type', entity_type)
      .eq('entity_id', Number(entity_id))
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this item' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('Review')
      .insert({ user_id, user_email, user_name, entity_type, entity_id: Number(entity_id), rating, title: title ?? null, body: reviewBody.trim() })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/reviews/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { admin_email } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nova.com'
    if (admin_email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('Review').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ message: 'Review deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Verify GET**

```bash
curl "http://localhost:3000/api/reviews?entity_type=destination&entity_id=1"
```
Expected: `[]` (empty array, no error).

- [ ] **Step 4: Verify POST**

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"user_id":"uid1","user_email":"a@b.com","user_name":"Alice","entity_type":"destination","entity_id":1,"rating":5,"body":"Amazing place!"}'
```
Expected: `201` with the created review object.
Then repeat the same request — expected: `409 { "error": "You have already reviewed this item" }`.

- [ ] **Step 5: Commit**

```bash
git add app/api/reviews/route.ts app/api/reviews/[id]/route.ts
git commit -m "feat: add reviews API routes (GET, POST, DELETE)"
```

---

### Task 3: ReviewList component

**Files:**
- Create: `components/ReviewList.tsx`

**Interfaces:**
- Props: `{ entityType: 'destination' | 'package'; entityId: number }`
- Fetches: `GET /api/reviews?entity_type=...&entity_id=...`
- Renders: average rating, total count, list of review cards; empty state if no reviews
- Re-exported type: `Review` interface (used by ReviewForm in Task 4)

- [ ] **Step 1: Create `components/ReviewList.tsx`**

```typescript
'use client'

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Star } from 'lucide-react'

export interface Review {
  id: number
  user_name: string
  rating: number
  title: string | null
  body: string
  created_at: string
}

export interface ReviewListHandle {
  refresh: () => void
}

interface ReviewListProps {
  entityType: 'destination' | 'package'
  entityId: number
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-white/10 text-white/10'}
        />
      ))}
    </div>
  )
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const ReviewList = forwardRef<ReviewListHandle, ReviewListProps>(function ReviewList({ entityType, entityId }, ref) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = () => {
    setLoading(true)
    fetch(`/api/reviews?entity_type=${entityType}&entity_id=${entityId}`)
      .then((r) => r.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [entityType, entityId])

  useImperativeHandle(ref, () => ({ refresh: fetchReviews }))

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white/[0.03] rounded-2xl p-5 animate-pulse h-24 border border-white/[0.05]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <span className="text-4xl font-bold">{reviews.length > 0 ? avg.toFixed(1) : '—'}</span>
        <div>
          <StarRow rating={Math.round(avg)} size={16} />
          <p className="text-white/40 text-sm mt-1">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-white/40 text-sm py-4">Belum ada ulasan. Jadilah yang pertama!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white/70">
                  {getInitials(review.user_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{review.user_name}</span>
                    <span className="text-xs text-white/30 shrink-0">
                      {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <StarRow rating={review.rating} size={12} />
                  {review.title && <p className="text-white/80 text-sm font-medium mt-2">{review.title}</p>}
                  <p className="text-white/60 text-sm mt-1 leading-relaxed">{review.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default ReviewList
```

- [ ] **Step 2: Verify component renders**

Temporarily add `<ReviewList entityType="destination" entityId={1} />` to any existing page and confirm:
- Shows "—" rating and "0 reviews" if no reviews exist
- Shows skeleton cards while loading
- Renders review cards correctly once data exists (use the test POST from Task 2 Step 4 to create data first)

Remove the temp usage after verifying.

- [ ] **Step 3: Commit**

```bash
git add components/ReviewList.tsx
git commit -m "feat: add ReviewList component"
```

---

### Task 4: ReviewForm component

**Files:**
- Create: `components/ReviewForm.tsx`

**Interfaces:**
- Props: `{ entityType: 'destination' | 'package'; entityId: number; onSuccess: () => void }`
- Consumes: `supabaseClient.auth.getUser()` to check auth state
- Consumes: `POST /api/reviews`
- Renders: star rating picker, title input, body textarea, submit button
- States: unauthenticated (show login link), already reviewed (show message), form, submitting, submitted

- [ ] **Step 1: Create `components/ReviewForm.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface ReviewFormProps {
  entityType: 'destination' | 'package'
  entityId: number
  onSuccess: () => void
}

export default function ReviewForm({ entityType, entityId, onSuccess }: ReviewFormProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
      if (data.user) {
        // Check if already reviewed
        fetch(`/api/reviews?entity_type=${entityType}&entity_id=${entityId}`)
          .then((r) => r.json())
          .then((reviews: Array<{ user_id: string }>) => {
            if (Array.isArray(reviews) && reviews.some((r) => r.user_id === data.user!.id)) {
              setAlreadyReviewed(true)
            }
          })
      }
    })
  }, [entityType, entityId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return
    setError(null)
    setSubmitting(true)

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Pengguna',
        entity_type: entityType,
        entity_id: entityId,
        rating,
        title: title.trim() || undefined,
        body,
      }),
    })

    setSubmitting(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Gagal mengirim ulasan')
      return
    }

    setAlreadyReviewed(true)
    onSuccess()
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
        <p className="text-white/60 text-sm">
          <Link href="/login" className="text-white underline underline-offset-2 hover:text-white/80 transition-colors">Login</Link>
          {' '}untuk memberikan ulasan
        </p>
      </div>
    )
  }

  if (alreadyReviewed) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
        <p className="text-white/60 text-sm">Kamu sudah memberikan ulasan. Terima kasih!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
      <h3 className="text-white text-base font-semibold">Tulis Ulasan</h3>

      {/* Star picker */}
      <div>
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  i <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-white/10 text-white/10'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-white/40 text-xs ml-2">{['', 'Sangat buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat bagus'][rating]}</span>
          )}
        </div>
      </div>

      {/* Title (optional) */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Judul (opsional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ringkasan singkat ulasanmu"
          maxLength={120}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Ulasan <span className="text-red-400">*</span></label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="Ceritakan pengalamanmu..."
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none"
        />
        <p className="text-white/20 text-xs mt-1 text-right">{body.length}/1000</p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting || rating === 0 || body.trim().length < 10}
        className="w-full bg-white text-black text-sm font-bold px-6 py-3 rounded-full hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verify form behavior**

Add temporarily to a detail page:
- Not logged in → shows "Login untuk memberikan ulasan" link
- Logged in → shows form with star picker, inputs, submit button
- Submit button disabled when rating = 0 or body < 10 chars
- Submit success → `alreadyReviewed` state shows "Kamu sudah memberikan ulasan"

- [ ] **Step 3: Commit**

```bash
git add components/ReviewForm.tsx
git commit -m "feat: add ReviewForm component with star rating and auth guard"
```

---

### Task 5: Wire ReviewList and ReviewForm into detail pages

**Files:**
- Modify: `app/destinations/[id]/page.tsx` — add reviews section at bottom
- Modify: `app/packages/[id]/page.tsx` — add reviews section at bottom

**Interfaces:**
- `ReviewList` is a `forwardRef` component — import `useRef` and pass ref so `ReviewForm.onSuccess` can call `ref.current.refresh()`
- Both detail pages are server components — reviews section must be extracted to a client wrapper component since it uses `useRef`

- [ ] **Step 1: Create `components/ReviewSection.tsx` (client wrapper)**

Because `useRef` cannot be used in server components, extract the connected list+form into a small client wrapper:

```typescript
'use client'

import { useRef } from 'react'
import ReviewList, { ReviewListHandle } from './ReviewList'
import ReviewForm from './ReviewForm'

interface ReviewSectionProps {
  entityType: 'destination' | 'package'
  entityId: number
}

export default function ReviewSection({ entityType, entityId }: ReviewSectionProps) {
  const listRef = useRef<ReviewListHandle>(null)

  return (
    <section className="px-6 md:px-16 py-12 border-t border-white/[0.05]">
      <h2 className="text-white text-2xl font-bold mb-8" style={{ letterSpacing: '-0.02em' }}>Ulasan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ReviewList ref={listRef} entityType={entityType} entityId={entityId} />
        <ReviewForm entityType={entityType} entityId={entityId} onSuccess={() => listRef.current?.refresh()} />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add ReviewSection to `app/destinations/[id]/page.tsx`**

At the bottom of the page, after the main content `ScrollReveal` block, add:

```typescript
import ReviewSection from '@/components/ReviewSection'

// In the JSX, after the last </ScrollReveal>:
<ReviewSection entityType="destination" entityId={dest.id} />
```

- [ ] **Step 3: Add ReviewSection to `app/packages/[id]/page.tsx`**

Same pattern as Step 2:

```typescript
import ReviewSection from '@/components/ReviewSection'

// In the JSX, after the closing </ScrollReveal>:
<ReviewSection entityType="package" entityId={pkg.id} />
```

- [ ] **Step 4: Verify end-to-end flow**

1. Navigate to `http://localhost:3000/destinations/1` — reviews section visible at bottom
2. Not logged in: form shows login link; list shows "Belum ada ulasan"
3. Log in as any user
4. Submit a review: form disappears, list refreshes and shows the new review with star rating, name, date
5. Try submitting again: "Kamu sudah memberikan ulasan" message shown
6. Repeat for `http://localhost:3000/packages/1`

- [ ] **Step 5: Commit**

```bash
git add components/ReviewSection.tsx app/destinations/[id]/page.tsx app/packages/[id]/page.tsx
git commit -m "feat: wire ReviewSection into destination and package detail pages"
```
