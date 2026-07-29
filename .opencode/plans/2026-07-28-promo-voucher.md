# PLAN 5: Promo & Voucher System
**File:** 2026-07-28-promo-voucher.md
**Date:** 2026-07-28

## Goal
Add a working voucher/coupon system. Currently "NOVA15" is hardcoded in UI with no backend validation.

## DB Changes
```sql
CREATE TABLE IF NOT EXISTS "Coupon" (
  id bigint generated always as identity primary key,
  code text not null unique,
  discount_type text not null CHECK (discount_type IN ('percent', 'fixed')),
  discount_value integer not null,
  min_amount integer default 0,
  max_uses integer default 100,
  used_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);
ALTER TABLE "Coupon" DISABLE ROW LEVEL SECURITY;

-- Seed default coupon
INSERT INTO "Coupon" (code, discount_type, discount_value, min_amount, max_uses) 
VALUES ('NOVA15', 'percent', 15, 100000, 1000) ON CONFLICT DO NOTHING;
```

## New Files
- `app/api/coupons/validate/route.ts` — POST, validate coupon code
- `app/api/coupons/route.ts` — GET all (admin), POST create (admin)
- `app/api/coupons/[id]/route.ts` — PUT, DELETE (admin)
- `app/promo/page.tsx` — public promo listing page
- `app/admin/coupons/page.tsx` — admin CRUD for coupons
- `supabase/add_coupon_table.sql` — migration SQL

## Modified Files
- `components/BookingPage.tsx` — add voucher input field in step 3 (Details), apply discount to totalAmount

---

## Tasks

### Task 1 — Create Coupon table SQL
Create `supabase/add_coupon_table.sql` with the SQL above.

### Task 2 — Coupon validation API
`POST /api/coupons/validate`
- Body: `{ code: string, amount: number }`
- Find coupon by code (case insensitive)
- Validate: `is_active=true`, not expired, `used_count < max_uses`, `amount >= min_amount`
- Return: `{ valid: true, discount_type, discount_value, discounted_amount }` or `{ valid: false, message }`

### Task 3 — Add voucher input to BookingPage step 3
In `components/BookingPage.tsx`:
- Add state: `voucherCode`, `voucherResult`, `discountAmount`
- Below order summary, add "Kode Promo" input + "Gunakan" button
- On click: POST `/api/coupons/validate` with `{code, amount: totalAmount}`
- If valid: show green checkmark + discount amount, update total displayed
- If invalid: show red error message
- Store voucherCode in booking notes or pass to payment

### Task 4 — Promo page (`app/promo/page.tsx`)
- Fetch active coupons (non-expired, `is_active=true`) — show code, discount, expires_at, min_amount
- Cards with copy-to-clipboard button for coupon code
- Style: dark theme, consistent with site

### Task 5 — Admin coupons page
- `app/admin/coupons/page.tsx`: table of all coupons, create/edit/delete, toggle `is_active`
- Add "Coupons" link to admin sidebar/nav
