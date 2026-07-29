# Booking Cancellation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to cancel their own pending bookings from the dashboard. Uses a confirmation modal with policy text. Soft-deletes by setting `status='cancelled'` — the booking record is kept.

**Architecture:** Secure the existing `PATCH /api/bookings/[id]/status` route with email ownership verification → new `CancelBookingModal` component → add cancel button to dashboard booking table (visible only for `status='pending'` rows).

**Tech Stack:** Next.js 16.2.12 App Router, React 19, TypeScript strict, Tailwind CSS v4, Supabase (service role via `@/lib/supabase` in API, anon via `@/lib/supabase-client` in client), lucide-react

## Codebase Context

**`app/api/bookings/[id]/status/route.ts`** (15 lines):
- Currently: `PATCH` reads `{ status }` from body, updates directly with no ownership check
- Problem: any caller knowing a booking `id` can change its status to anything
- Fix needed: read `user_email` from body too, verify `booking.email === user_email` before updating, restrict to `'cancelled'` only via this route

**`app/dashboard/page.tsx`** (268 lines):
- `'use client'` component
- Booking type: `{ id, packageName, country, travelDate, participants, status: 'paid'|'pending'|'cancelled', email }`
- Status styles live in `STATUS_STYLES` constant (line 42-46) — `paid`, `pending`, `cancelled`
- Bookings rendered in a table (not cards) — Actions column exists
- `user.email` is available from Supabase auth state

## Global Constraints

- Tailwind v4: `@import "tailwindcss"` — no config file
- `'use client'` required on any component using hooks or browser APIs
- Dark page background: `bg-neutral-50` (dashboard uses light theme, not dark)
- Status badge colors already defined in `STATUS_STYLES` — reuse them, don't create new ones
- No test framework — manual verification in browser
- Icons: lucide-react only
- Booking `status` type in dashboard is `'paid'|'pending'|'cancelled'` — note `'paid'` not `'confirmed'` (matches existing code)

---

### Task 1: Secure the status API route

**Files:**
- Modify: `app/api/bookings/[id]/status/route.ts`

**Current state** (15 lines):
```typescript
const { status } = await request.json()
// updates unconditionally
```

**After this task:**
- Reads `{ status, user_email }` from body
- Fetches the booking first, checks `booking.email === user_email`
- Only allows `status = 'cancelled'` via this route (admin sets `'confirmed'`/`'pending'` directly in DB or via a separate admin route)
- Returns `403` if email mismatch, `400` if status is not `'cancelled'`

**Interfaces:**
- `PATCH /api/bookings/[id]/status` body: `{ status: 'cancelled', user_email: string }` → `200 Booking` on success
- Error responses: `400 { error: 'Only cancellation is allowed via this endpoint' }`, `400 { error: 'Missing required fields' }`, `403 { error: 'Forbidden' }`, `404 { error: 'Booking not found' }`, `500`

- [ ] **Step 1: Rewrite `app/api/bookings/[id]/status/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, user_email } = body

    if (!status || !user_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Only allow cancellation via this route
    if (status !== 'cancelled') {
      return NextResponse.json({ error: 'Only cancellation is allowed via this endpoint' }, { status: 400 })
    }

    // Fetch booking to verify ownership
    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('id, email, status')
      .eq('id', Number(id))
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.email !== user_email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only pending bookings can be cancelled by users
    if (booking.status !== 'pending') {
      return NextResponse.json({ error: `Cannot cancel a booking with status '${booking.status}'` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Booking')
      .update({ status: 'cancelled' })
      .eq('id', Number(id))
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify the security fix**

Create a test booking via the admin panel or Supabase Table Editor with `status='pending'` and note its `id` and `email`.

Test ownership check:
```bash
# Should succeed (correct email)
curl -X PATCH http://localhost:3000/api/bookings/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled","user_email":"correct@email.com"}'
```
Expected: `200` with updated booking showing `status: 'cancelled'`.

```bash
# Should be forbidden (wrong email)
curl -X PATCH http://localhost:3000/api/bookings/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled","user_email":"wrong@email.com"}'
```
Expected: `403 { "error": "Forbidden" }`.

```bash
# Should reject non-cancellation status
curl -X PATCH http://localhost:3000/api/bookings/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed","user_email":"correct@email.com"}'
```
Expected: `400 { "error": "Only cancellation is allowed via this endpoint" }`.

- [ ] **Step 3: Commit**

```bash
git add app/api/bookings/[id]/status/route.ts
git commit -m "fix: secure booking status route with ownership verification"
```

---

### Task 2: CancelBookingModal component

**Files:**
- Create: `components/CancelBookingModal.tsx`

**Interfaces:**
- Props: `{ bookingId: number; packageName: string; onConfirm: () => Promise<void>; onClose: () => void }`
- `onConfirm` is async — component shows loading state while it resolves
- Renders over a backdrop blur overlay
- Two buttons: "Kembali" (closes modal) and "Ya, Batalkan" (red, calls onConfirm)
- Shows error message if `onConfirm` throws

- [ ] **Step 1: Create `components/CancelBookingModal.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface CancelBookingModalProps {
  bookingId: number
  packageName: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function CancelBookingModal({ bookingId: _bookingId, packageName, onConfirm, onClose }: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      await onConfirm()
      // onConfirm is responsible for closing the modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan booking. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-black text-base font-bold leading-snug">Batalkan Booking?</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-black transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 mb-6">
          <p className="text-neutral-600 text-sm">
            Kamu akan membatalkan booking untuk:
          </p>
          <div className="bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
            <p className="text-black text-sm font-semibold">{packageName}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-amber-800 text-xs leading-relaxed">
              <span className="font-semibold">Kebijakan pembatalan:</span> Pembatalan akan diproses dalam 3–5 hari kerja. Refund (jika berlaku) akan dikembalikan ke metode pembayaran asal.
            </p>
          </div>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-black/10 text-black/70 text-sm font-medium px-4 py-2.5 rounded-full hover:border-black/20 hover:text-black transition-colors disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white text-sm font-bold px-4 py-2.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Membatalkan...
              </>
            ) : (
              'Ya, Batalkan'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component renders correctly**

Temporarily render the modal in `app/dashboard/page.tsx` with hardcoded props to visually check:
```typescript
<CancelBookingModal
  bookingId={1}
  packageName="Bali Paradise Package"
  onConfirm={async () => { await new Promise(r => setTimeout(r, 1500)) }}
  onClose={() => {}}
/>
```

Check:
- Backdrop blur renders
- Package name shown in highlighted box
- Policy text in amber box
- "Kembali" button closes (but not wired yet — just visually check)
- "Ya, Batalkan" shows spinner for 1.5s then resolves
- Clicking outside modal closes it (via `onClose`)

Remove the temp render after checking.

- [ ] **Step 3: Commit**

```bash
git add components/CancelBookingModal.tsx
git commit -m "feat: add CancelBookingModal component"
```

---

### Task 3: Add cancel button and modal to dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

**Current state:** Booking table renders rows with status badge. `STATUS_STYLES` has entries for `paid`, `pending`, `cancelled`. The `Booking` type includes `status: 'paid' | 'pending' | 'cancelled'`.

**Changes needed:**
1. Add `cancellingId` state (tracks which booking is being cancelled, `number | null`)
2. Add `modalBooking` state (tracks which booking the modal is open for, `Booking | null`)
3. Add `cancelBooking` async function that calls `PATCH /api/bookings/{id}/status`
4. Add "Batalkan" button in the Actions column for `status === 'pending'` rows
5. Render `CancelBookingModal` when `modalBooking` is set
6. On success: update local `bookings` state (replace the booking's status with `'cancelled'`), close modal, show a brief inline success indicator

**Interfaces:**
- Consumes: `PATCH /api/bookings/[id]/status` with body `{ status: 'cancelled', user_email: string }`
- Consumes: `CancelBookingModal` component from Task 2

- [ ] **Step 1: Read `app/dashboard/page.tsx` carefully**

Before editing, read the full file. Identify:
- Where the booking table rows are rendered (around line 160–210)
- Where the Actions column is (if it exists) or where to add it
- The existing `STATUS_STYLES` constant (line 42-46)

- [ ] **Step 2: Add state and cancel handler**

Add these state variables inside `DashboardPage` after the existing state declarations:

```typescript
const [modalBooking, setModalBooking] = useState<Booking | null>(null)
```

Add the cancel handler function inside `DashboardPage`:

```typescript
const handleCancelBooking = async () => {
  if (!modalBooking || !user?.email) return
  const res = await fetch(`/api/bookings/${modalBooking.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled', user_email: user.email }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Gagal membatalkan booking')
  }
  // Update local state — replace the booking's status
  setBookings((prev) =>
    prev.map((b) => (b.id === modalBooking.id ? { ...b, status: 'cancelled' as const } : b))
  )
  setModalBooking(null)
}
```

- [ ] **Step 3: Add the cancel button to the table row**

Locate the table row where each booking is rendered. In the Actions cell (or add a new `<td>` at the end of each row), add:

```typescript
<td className="px-4 py-3">
  {booking.status === 'pending' && (
    <button
      onClick={() => setModalBooking(booking)}
      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors underline underline-offset-2"
    >
      Batalkan
    </button>
  )}
</td>
```

If the table already has a `<th>` header row, add a matching `<th>` for "Aksi":
```typescript
<th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Aksi</th>
```

- [ ] **Step 4: Render the modal**

At the bottom of the JSX (before the closing `</div>` of the main container), add:

```typescript
import CancelBookingModal from '@/components/CancelBookingModal'

// In JSX:
{modalBooking && (
  <CancelBookingModal
    bookingId={modalBooking.id}
    packageName={modalBooking.packageName}
    onConfirm={handleCancelBooking}
    onClose={() => setModalBooking(null)}
  />
)}
```

- [ ] **Step 5: Verify end-to-end in browser**

1. Log in as a user who has a booking with `status='pending'`
2. Navigate to `http://localhost:3000/dashboard`
3. Confirm "Batalkan" button is visible only on `pending` rows (not `paid` or `cancelled`)
4. Click "Batalkan" → modal appears with the package name and policy text
5. Click "Kembali" → modal closes, nothing changes
6. Click "Ya, Batalkan" → spinner appears, then modal closes and the row's status badge changes from yellow "pending" to red "cancelled" without a page reload
7. The "Batalkan" button should disappear from that row after cancellation
8. Confirm via Supabase Table Editor that the booking record `status` is now `'cancelled'` (not deleted)

- [ ] **Step 6: Verify wrong-user scenario cannot cancel**

Using curl with a different email than the booking's email:
```bash
curl -X PATCH http://localhost:3000/api/bookings/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled","user_email":"notowner@email.com"}'
```
Expected: `403 Forbidden`. The booking in Supabase should remain unchanged.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: add booking cancellation flow with confirmation modal to dashboard"
```
