# PLAN 6: User Profile Page
**File:** 2026-07-28-user-profile.md
**Date:** 2026-07-28

## Goal
Add a /profile page where users can view and edit their profile info.

## Approach
Supabase auth.users has email, created_at. User metadata stored in `auth.updateUser({data: {name, phone, travel_style}})`.
No new DB table needed — use Supabase auth user metadata.

## New Files
- `app/profile/page.tsx` — profile page (protected, redirect to /login if not auth)
- `app/api/profile/route.ts` — GET current user profile, PATCH update user metadata

## Modified Files
- `components/Navbar.tsx` — add Profile link in user menu (already has Dashboard link)
- `app/dashboard/page.tsx` — add link to /profile

---

## Tasks

### Task 1 — Profile API route
- `GET /api/profile`: uses supabaseClient from cookie/header, returns user email, metadata (name, phone, travel_style), created_at
- `PATCH /api/profile`: body `{name, phone, travel_style}` → `supabase.auth.updateUser({data: {...}})`
- Note: this needs to use the user's own session, not service role. Use `createServerClient` from `@supabase/ssr` or read cookie.

### Task 2 — Profile page
`app/profile/page.tsx` — `'use client'`:
- Auth check: if not logged in → redirect to /login
- Show: avatar (initials circle), email (read-only), member since date
- Editable fields: Nama Lengkap, Nomor HP, Gaya Perjalanan (dropdown: Solo, Keluarga, Petualangan, Bisnis)
- Save button → PATCH /api/profile
- Success/error toast
- Link: "Lihat Riwayat Booking" → /dashboard
- Style: dark theme, card layout, consistent with site

### Task 3 — Add Profile to Navbar
In `components/Navbar.tsx`, add "Profil" link next to "Dashboard" in the user menu (show when logged in).
