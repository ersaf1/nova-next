# NOVA Plan 2 — Search, Booking Flow, and Payment
**Tahap 3, 4, 5, 6**

Date: 2026-07-28
Depends on: Plan 1 completed (slug column exists, /packages/[slug] works)

---

## Context

Stack: Next.js 16 (App Router), React 19, TypeScript, Supabase, Tailwind v4, Midtrans Snap.

What already exists after Plan 1:
- `/packages/[slug]` — detail page with departure selector
- `lib/types.ts` — shared `TravelPackage`, `PackageDeparture`, `Booking`, `Traveler`
- `/api/packages/[id]/departures` — GET departures for a package
- `/api/bookings` — POST creates booking with price snapshot from DB
- `/api/payment/create` — sends to Midtrans Snap, falls back to mock token
- `/api/payment/notification` — webhook handler (currently no signature verification)
- `components/BookingPage.tsx` — multi-step form (legacy, destination→package→details)

Security issues to fix in this plan:
- `GET /api/bookings?email=...` — no auth, anyone can read any user's bookings
- `POST /api/payment/create` — trusts `amount` from browser
- `POST /api/payment/notification` — no webhook signature verification
- `BookingPage.tsx` — shows `$` USD prices instead of Rupiah

---

## What this plan delivers

1. `/search` — filters actually work, synced to URL, sorting, pagination, empty/error states
2. Flights/Hotels/Experiences tabs disabled with "Segera hadir" label
3. New booking flow: `/booking/[packageId]/[departureId]` — multi-step (details → travelers → review → payment)
4. Review order page before payment
5. Midtrans integration hardened: price fetched from DB server-side, webhook signature verified
6. Mock payment mode via `PAYMENT_MODE=mock` env var
7. Payment pending page so user can resume payment from dashboard
8. `GET /api/bookings` requires session auth

---

## File Structure

### Modified files
| File | What changes |
|------|-------------|
| `app/search/page.tsx` | URL-synced filters, sorting, pagination, disabled tabs |
| `app/api/bookings/route.ts` | GET requires session auth; POST validates departure capacity |
| `app/api/payment/create/route.ts` | Fetch amount from DB, not from browser; mock mode via env |
| `app/api/payment/notification/route.ts` | Webhook signature verification, idempotency |
| `components/BookingPage.tsx` | Deprecate — legacy form kept but new flow used from detail page |

### New files
| File | Responsibility |
|------|---------------|
| `app/booking/[packageId]/[departureId]/page.tsx` | Multi-step booking shell (server component, auth gate) |
| `components/booking/BookingStepDetails.tsx` | Step 1: contact info + traveler count |
| `components/booking/BookingStepTravelers.tsx` | Step 2: per-traveler details |
| `components/booking/BookingStepReview.tsx` | Step 3: order summary + T&C checkbox |
| `components/booking/BookingStepPayment.tsx` | Step 4: Midtrans Snap trigger |
| `components/booking/BookingProgress.tsx` | Step indicator bar |
| `app/payment/pending/[bookingId]/page.tsx` | "Complete your payment" page |
| `app/api/bookings/[id]/route.ts` | GET single booking (auth: owner only) |
| `lib/midtrans.ts` | Midtrans helpers: create transaction, verify signature |

---

## Tasks

### Task 1 — Fix search page: URL-synced filters + disabled tabs

**File:** `app/search/page.tsx`

Current problems:
- Card links go to `/booking?packageId=...` — fixed in Plan 1 Task 6
- Flights/Hotels/Experiences tabs appear active
- Filters are local state only (lost on refresh)
- No URL params used
- Price shown in USD

Changes:

**1a. Disabled tabs**
Find the tab bar rendering Flights, Hotels, Experiences. Change those tabs to:
```tsx
<button
  disabled
  className="... opacity-40 cursor-not-allowed"
  title="Segera hadir"
>
  Flights
  <span className="ml-1 text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">Segera hadir</span>
</button>
```
Do not remove them — just disable and label.

**1b. URL-synced filters**
Replace local state with `useSearchParams` + `useRouter`:
```ts
// Read from URL on mount
const searchParams = useSearchParams()
const initialQuery = searchParams.get('q') ?? ''
const initialCategory = searchParams.get('category') ?? 'All'
const initialMinPrice = Number(searchParams.get('minPrice') ?? 0)
const initialMaxPrice = Number(searchParams.get('maxPrice') ?? 50000000)
const initialSort = searchParams.get('sort') ?? 'rating'

// Write to URL on filter change
function updateFilter(key: string, value: string) {
  const params = new URLSearchParams(searchParams.toString())
  if (value) params.set(key, value) else params.delete(key)
  router.replace(`/search?${params.toString()}`, { scroll: false })
}
```

**1c. Sorting options**
Add sort control: cheapest, most expensive, rating, popularity (most reviews).

**1d. Active filter chips**
Show pills for each active filter with an X to remove. Example:
```tsx
{activeCategory !== 'All' && (
  <span className="inline-flex items-center gap-1 bg-black text-white text-xs px-3 py-1 rounded-full">
    {activeCategory}
    <button onClick={() => updateFilter('category', '')}><X size={10} /></button>
  </span>
)}
```

**1e. Price format**
Change `$` to Rupiah using `formatIDR` from `lib/types.ts`.

**1f. Pagination / load more**
Add a "Load more" button. Default: show 9 results. Each click shows 9 more.

**Test:**
- Navigate to `/search?category=Beach&sort=price_asc` — filters pre-filled on load
- Change a filter — URL updates without full page reload
- Clear all filters — URL params cleared
- Disabled tabs cannot be clicked

---

### Task 2 — Harden GET /api/bookings with auth

**File:** `app/api/bookings/route.ts`

Current GET handler allows `?email=` with zero auth. Replace with session-based filtering.

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role client for data fetch, scoped to this user
  const { data, error } = await supabase
    .from('Booking')
    .select('*')
    .eq('userId', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json(data ?? [])
}
```

Note: The existing `Booking` table uses `email` field, not `userId`. The migration in Plan 1 adds `userId`. For backward compat, also filter by `email = user.email` as fallback while `userId` is being backfilled.

**Test:**
- Unauthenticated request to `GET /api/bookings` → 401
- Authenticated request → only returns that user's bookings

---

### Task 3 — New booking flow: /booking/[packageId]/[departureId]

This replaces the old `BookingPage.tsx` flow for new bookings coming from the detail page.

**New file:** `app/booking/[packageId]/[departureId]/page.tsx`

Server component. Auth-gated (redirect to login if no session).

```ts
// Fetch package + departure server-side for rendering initial state
// Pass as props to client component
// If packageId or departureId invalid → notFound()
// If departure sold_out or cancelled → show error state, not the form
```

Steps:
```
Step 1: Details    — contact info (name, email, phone), traveler count
Step 2: Travelers  — per-traveler name (passport optional)
Step 3: Review     — full order summary + T&C checkbox
Step 4: Payment    — Midtrans Snap or mock
```

**State persistence between steps:** Use React state lifted to the parent shell component. Do NOT use localStorage or URL params for form data — keep it in memory. If user refreshes on step 3, they return to step 1 (acceptable for v1).

**`components/booking/BookingProgress.tsx`:**
```tsx
// Shows step indicators: 1 Details → 2 Travelers → 3 Review → 4 Payment
// Current step highlighted, completed steps show checkmark
// Props: currentStep: 1 | 2 | 3 | 4
```

**`components/booking/BookingStepDetails.tsx`:**
- Fields: Full name, Email, Phone, Number of travelers (1-20)
- Validation: name required, email format, phone min 8 digits, travelers >= 1
- If user is logged in, pre-fill name and email from Supabase auth session
- On continue → validate, advance to step 2

**`components/booking/BookingStepTravelers.tsx`:**
- One form row per traveler count selected in step 1
- Fields per traveler: Full name (required), Gender (optional select), Birth date (optional)
- Passport fields (optional): Passport number, Expiry date, Nationality
- On continue → validate required fields, advance to step 3

**`components/booking/BookingStepReview.tsx`:**
- Show: package title, destination, departure dates, traveler count
- Show: contact name, contact email, contact phone
- Show: list of traveler names
- Price breakdown:
  ```
  Harga per orang    Rp12.500.000
  Jumlah traveler    × 2
  Subtotal           Rp25.000.000
  Diskon             -Rp0
  Biaya layanan      Rp250.000
  Total              Rp25.250.000
  ```
- Checkbox: "Saya menyetujui syarat dan ketentuan NOVA"
- Button: "Lanjutkan ke Pembayaran" (disabled until checkbox checked)
- On submit → POST `/api/bookings` → get bookingId → advance to step 4

**`components/booking/BookingStepPayment.tsx`:**
- Show booking code
- Button: "Bayar Sekarang"
- On click → POST `/api/payment/create` with `bookingId` only (no amount from browser)
- If real Midtrans token → load Midtrans Snap JS, call `window.snap.pay(token, {...})`
- If mock mode → show mock payment UI with "Simulasi Pembayaran Berhasil" button → redirect to confirmation
- On Snap close without paying → show "Lanjutkan Pembayaran" option

**Test:**
- Navigate to `/booking/1/1` while logged out → redirect to login
- Navigate to `/booking/1/1` while logged in → step 1 rendered with user email pre-filled
- Fill step 1, continue → step 2 shows correct number of traveler rows
- Fill step 2, continue → step 3 shows correct price breakdown in Rupiah
- Uncheck T&C → "Lanjutkan ke Pembayaran" disabled
- Check T&C → button active, click → booking created → step 4 shows booking code
- In mock mode → "Simulasi" button → confirmation page

---

### Task 4 — Harden payment/create: fetch amount from DB

**File:** `app/api/payment/create/route.ts`

Current code trusts `amount` from browser. Fix:

```ts
export async function POST(request: Request) {
  // Auth check
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(...)
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await request.json()
  // ONLY accept bookingId from browser — fetch everything else from DB

  const { data: booking } = await supabase
    .from('Booking')
    .select('id, totalAmount, contactName, contactEmail, packageName, userId, email, bookingCode')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Verify ownership
  const isOwner = booking.userId === user.id || booking.email === user.email
  if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Mock mode
  const isMock = process.env.PAYMENT_MODE === 'mock'
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''

  if (isMock || !serverKey) {
    const orderId = `NOVA-${booking.id}-${Date.now()}`
    await supabase.from('Booking').update({ midtrans_order_id: orderId }).eq('id', booking.id)
    return NextResponse.json({
      token: null,
      mock: true,
      orderId,
      redirect_url: `/payment/pending/${booking.id}`,
    })
  }

  // Real Midtrans
  const orderId = `NOVA-${booking.id}-${Date.now()}`
  await supabase.from('Booking').update({ midtrans_order_id: orderId }).eq('id', booking.id)

  const auth = Buffer.from(serverKey + ':').toString('base64')
  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: booking.totalAmount,
    },
    customer_details: {
      first_name: booking.contactName,
      email: booking.contactEmail,
    },
    item_details: [{ id: `BKG-${booking.id}`, price: booking.totalAmount, quantity: 1, name: booking.packageName }],
  }

  const baseUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions'
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return NextResponse.json({ ...data, orderId, mock: false })
}
```

**Test:**
- POST without auth → 401
- POST with valid bookingId for another user → 403
- POST with valid bookingId for owner → receives Midtrans token (or mock response)

---

### Task 5 — Harden webhook: signature verification + idempotency

**File:** `app/api/payment/notification/route.ts`

Current code has no signature verification. Midtrans signs webhooks with SHA-512:
`SHA512(order_id + status_code + gross_amount + server_key)`

```ts
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.json()
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    payment_type,
    transaction_id,
    transaction_time,
  } = body

  // 1. Verify signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''
  if (serverKey && serverKey !== 'SB-Mid-server-placeholder') {
    const expected = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (expected !== signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
  }

  // 2. Extract bookingId — format: NOVA-{bookingId}-{timestamp}
  const parts = order_id.split('-')
  const bookingId = parseInt(parts[1])
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 })
  }

  // 3. Fetch booking from DB — verify amount
  const { data: booking } = await supabase
    .from('Booking')
    .select('id, totalAmount, paymentStatus, midtrans_order_id')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // 4. Idempotency: already paid → return ok without re-processing
  if (booking.paymentStatus === 'paid') {
    return NextResponse.json({ status: 'ok' })
  }

  // 5. Validate amount matches
  if (Number(gross_amount) !== booking.totalAmount) {
    console.error(`Amount mismatch: expected ${booking.totalAmount}, got ${gross_amount}`)
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  // 6. Map Midtrans status to our payment status
  let paymentStatus = 'pending'
  let bookingStatus = 'pending'
  if (transaction_status === 'capture' && fraud_status === 'accept') {
    paymentStatus = 'paid'; bookingStatus = 'confirmed'
  } else if (transaction_status === 'settlement') {
    paymentStatus = 'paid'; bookingStatus = 'confirmed'
  } else if (['cancel', 'deny'].includes(transaction_status)) {
    paymentStatus = 'failed'; bookingStatus = 'cancelled'
  } else if (transaction_status === 'expire') {
    paymentStatus = 'expired'; bookingStatus = 'cancelled'
  } else if (transaction_status === 'refund') {
    paymentStatus = 'refunded'
  }

  // 7. Update booking
  await supabase
    .from('Booking')
    .update({
      paymentStatus,
      bookingStatus,
      midtrans_order_id: order_id,
      midtrans_transaction_id: transaction_id,
      midtrans_payment_method: payment_type,
      paid_at: paymentStatus === 'paid' ? transaction_time : null,
    })
    .eq('id', bookingId)

  return NextResponse.json({ status: 'ok' })
}
```

Add columns to Booking table (migration):
```sql
-- supabase/migrations/003_booking_payment_fields.sql
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "midtrans_transaction_id" TEXT,
  ADD COLUMN IF NOT EXISTS "midtrans_payment_method" TEXT,
  ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMPTZ;
```

**Test:**
- POST with wrong signature → 403
- POST with valid signature, settled → booking paymentStatus = 'paid', bookingStatus = 'confirmed'
- POST same notification twice → second returns ok, status unchanged

---

### Task 6 — Payment pending page

**File:** `app/payment/pending/[bookingId]/page.tsx`

Shows when payment hasn't been completed yet. User can retry.

Content:
- Booking code
- Package name + departure dates
- Total amount in Rupiah
- Status: "Menunggu Pembayaran"
- Button: "Lanjutkan Pembayaran" → triggers Midtrans Snap again
- Link: "Kembali ke Dashboard"
- Note: "Pembayaran akan kadaluarsa dalam X jam" (based on booking `created_at` + 24h)

Auth required. User can only view their own pending booking.

**Test:**
- Visit `/payment/pending/[bookingId]` logged out → redirect to login
- Visit with another user's bookingId → 404
- Visit with valid bookingId → shows correct details and amount

---

### Task 7 — Type check and lint

```bash
npx tsc --noEmit
npx eslint . --max-warnings 0
```

Common issues:
- `cookies()` in Next.js 16 returns a Promise — await it: `const cookieStore = await cookies()`
- `createServerClient` needs `@supabase/ssr` — already in dependencies
- `window.snap` is not typed — add `declare global { interface Window { snap: { pay: (token: string, options: Record<string, unknown>) => void } } }` in a `.d.ts` file or inline

---

## New environment variables needed

```env
PAYMENT_MODE=mock          # set to 'mock' for development without real Midtrans key
MIDTRANS_SERVER_KEY=       # SB-Mid-server-xxx for sandbox
MIDTRANS_CLIENT_KEY=       # SB-Mid-client-xxx for Snap JS (already used?)
```

Add to `.env.example`.

---

## Risks and notes

1. **Supabase `userId` backfill**: Old bookings don't have `userId`. The GET /api/bookings fallback uses email comparison. For new bookings, always set `userId` from session at POST time.

2. **Midtrans Snap JS**: Must be loaded via `<Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={...} />` in the page. This is an external script — it won't be available in SSR. Load it only in the client component step 4.

3. **Service fee**: The spec shows a service fee in the price breakdown. Add `serviceFee` as a constant (e.g. `250000` IDR) server-side in the booking POST route. Do not let the browser set it.

4. **`decrement_departure_slots` RPC**: Already called in `app/api/bookings/route.ts` but the function may not exist in DB. Add it to the migration:
```sql
CREATE OR REPLACE FUNCTION decrement_departure_slots(p_departure_id BIGINT, p_count INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE "PackageDeparture"
  SET "remainingSlots" = GREATEST(0, "remainingSlots" - p_count),
      "status" = CASE
        WHEN ("remainingSlots" - p_count) <= 0 THEN 'sold_out'
        WHEN ("remainingSlots" - p_count) <= 3 THEN 'limited'
        ELSE "status"
      END,
      "updatedAt" = NOW()
  WHERE id = p_departure_id;
END;
$$ LANGUAGE plpgsql;
```
