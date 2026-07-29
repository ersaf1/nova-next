# PLAN 8: Newsletter Backend
**File:** 2026-07-28-newsletter-backend.md
**Date:** 2026-07-28

## Goal
The AppCtaSection has a subscribe form but no backend. Wire it up to save emails to Supabase.

## DB Changes
```sql
CREATE TABLE IF NOT EXISTS "Newsletter" (
  id bigint generated always as identity primary key,
  email text not null unique,
  subscribed_at timestamptz default now(),
  is_active boolean default true
);
ALTER TABLE "Newsletter" DISABLE ROW LEVEL SECURITY;
```

## New Files
- `app/api/newsletter/route.ts` — POST subscribe, GET count (admin)
- `supabase/add_newsletter_table.sql` — migration SQL
- `app/admin/newsletter/page.tsx` — admin view of subscribers

## Modified Files
- `components/AppCtaSection.tsx` — wire subscribe form to POST /api/newsletter

---

## Tasks

### Task 1 — Create Newsletter table SQL
Create `supabase/add_newsletter_table.sql` with the SQL above.

### Task 2 — Newsletter API
`POST /api/newsletter`:
- Body: `{ email: string }`
- Validate email format (basic regex)
- Check if already subscribed: if yes, return `{success: true, message: "Kamu sudah berlangganan!"}`
- Insert into Newsletter table
- Return `{success: true, message: "Terima kasih! Kamu berhasil berlangganan."}`

`GET /api/newsletter`:
- Return count of active subscribers (for admin display)

### Task 3 — Wire AppCtaSection form
In `components/AppCtaSection.tsx`:
- Find the existing email input and subscribe button
- Add state: `email`, `loading`, `message`, `error`
- On submit: POST `/api/newsletter` with `{email}`
- Show success message (green) or error (red)
- Clear input on success
- Basic email validation client-side before submit

### Task 4 — Admin newsletter page
`app/admin/newsletter/page.tsx`:
- Table of all subscribers (email, subscribed_at, is_active)
- Total count display
- Toggle is_active per subscriber
- Add "Newsletter" link to admin nav
