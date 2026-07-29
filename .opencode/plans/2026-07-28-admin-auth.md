# Admin Panel Auth Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect all `/admin/*` routes so only an authenticated user matching `ADMIN_EMAIL` can access them. Unauthenticated users are redirected to `/login`; authenticated non-admin users are redirected to `/`.

**Architecture:** Next.js `middleware.ts` (currently missing) intercepts all `/admin/*` requests, checks the Supabase session via `@supabase/ssr`, and redirects if unauthorized. A secondary client-side check in `app/admin/layout.tsx` provides a loading state and graceful UX.

**Tech Stack:** Next.js 16.2.12 App Router, TypeScript strict, Supabase anon key via `@supabase/ssr`, `@/lib/supabase-client` for client-side checks

## Before You Start

Run this to install the required package (not currently in the project):

```bash
npm install @supabase/ssr
```

Verify it installed:
```bash
cat package.json | grep "@supabase/ssr"
```

## Global Constraints

- `middleware.ts` must live at the project root (next to `package.json`), NOT inside `app/`
- Next.js 16 middleware uses `NextRequest` / `NextResponse` from `next/server`
- `@supabase/ssr` `createServerClient` requires cookie helpers — use `request.cookies.get` / `response.cookies.set`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already set in `.env`
- Add `ADMIN_EMAIL` to `.env` — user must set this to their actual admin email
- Tailwind v4: `@import "tailwindcss"` — no config file
- Icons: lucide-react

---

### Task 1: Install @supabase/ssr and add ADMIN_EMAIL to .env

**Files:**
- Run: `npm install @supabase/ssr`
- Modify: `.env` — add `ADMIN_EMAIL`

**Interfaces:**
- Produces: `process.env.ADMIN_EMAIL` available in middleware and API routes

- [ ] **Step 1: Install package**

```bash
npm install @supabase/ssr
```

- [ ] **Step 2: Check current .env for existing entries**

```bash
cat .env
```

Do NOT echo the contents back or log secrets. Just verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist.

- [ ] **Step 3: Add ADMIN_EMAIL to .env**

Append to `.env` (do not overwrite existing values):

```
# Admin authentication — set this to the Supabase user email that should have admin access
ADMIN_EMAIL=admin@nova.com
```

Change `admin@nova.com` to the actual admin user email in your Supabase project.

- [ ] **Step 4: Verify**

```bash
node -e "require('dotenv').config(); console.log('ADMIN_EMAIL set:', !!process.env.ADMIN_EMAIL)"
```

Expected: `ADMIN_EMAIL set: true`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @supabase/ssr for middleware auth"
```

Note: Do NOT commit `.env` — it should already be in `.gitignore`.

---

### Task 2: Create middleware.ts

**Files:**
- Create: `middleware.ts` (at project root, next to `package.json`)

**Interfaces:**
- Intercepts all requests matching `/admin/:path*`
- Reads Supabase session from cookies using `@supabase/ssr` `createServerClient`
- Redirects to `/login?redirect=/admin` if no session
- Redirects to `/` if user email does not match `process.env.ADMIN_EMAIL`
- Passes through if user is authenticated and is admin

- [ ] **Step 1: Verify middleware location**

Confirm no `middleware.ts` exists yet:
```bash
Test-Path middleware.ts
```
Expected: `False`

- [ ] **Step 2: Create `middleware.ts`**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Create a mutable response to allow @supabase/ssr to set cookies
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() is safe to call in middleware — it validates with the Supabase Auth server
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nova.com'
  if (user.email !== adminEmail) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 3: Verify middleware is picked up**

Start dev server:
```bash
npm run dev
```

In another terminal, test with curl (or browser):
```bash
curl -I http://localhost:3000/admin
```
Expected: `302` redirect to `/login?redirect=/admin` (since no auth cookie in curl).

- [ ] **Step 4: Test with an authenticated non-admin user**

Log in via the app as any non-admin user, then navigate to `http://localhost:3000/admin`.
Expected: redirected to `/`.

- [ ] **Step 5: Test with the admin user**

Log in as the user whose email matches `ADMIN_EMAIL`, then navigate to `http://localhost:3000/admin`.
Expected: admin page loads normally.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware to protect /admin routes with Supabase auth"
```

---

### Task 3: Add admin layout with client-side secondary check

**Files:**
- Create: `app/admin/layout.tsx` (create if it does not exist — check first)

**Interfaces:**
- `'use client'` component
- Checks auth via `supabaseClient.auth.getUser()` on mount
- Shows a loading skeleton while checking auth
- If not authed or not admin: shows a "Redirecting..." message (middleware already handles the redirect, this is a fallback for client navigation)
- Renders `{children}` when authed

- [ ] **Step 1: Check if app/admin/layout.tsx already exists**

```bash
Test-Path app/admin/layout.tsx
```

If `True`, read its contents first before modifying. If `False`, create it.

- [ ] **Step 2: Create `app/admin/layout.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''
      if (!data.user) {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      // Note: email check is best-effort client-side; middleware is the real gate
      if (adminEmail && data.user.email !== adminEmail) {
        router.replace('/')
        return
      }
      setAuthorized(true)
      setChecking(false)
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-400">Redirecting...</p>
      </div>
    )
  }

  return <>{children}</>
}
```

**Note on `NEXT_PUBLIC_ADMIN_EMAIL`:** The client-side check uses `NEXT_PUBLIC_ADMIN_EMAIL` (a public env var). Add this to `.env` as well:

```
NEXT_PUBLIC_ADMIN_EMAIL=admin@nova.com
```

This is intentionally a public var since it just controls a UI redirect — the real security gate is the middleware using `ADMIN_EMAIL` server-side.

- [ ] **Step 3: Add NEXT_PUBLIC_ADMIN_EMAIL to .env**

Append to `.env`:
```
NEXT_PUBLIC_ADMIN_EMAIL=admin@nova.com
```

Set the same value as `ADMIN_EMAIL`.

- [ ] **Step 4: Verify loading state**

Temporarily simulate a slow auth check by adding `await new Promise(r => setTimeout(r, 2000))` before the `getUser()` call, then remove it.
Expected: loading spinner visible for 2s, then admin content appears for admin user.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx .env
git commit -m "feat: add admin layout with client-side auth check and loading state"
```

---

### Task 4: Show logged-in user email in admin header

**Files:**
- Modify: `app/admin/page.tsx` — add current user email display in the header area

**Interfaces:**
- Reads user from `supabaseClient.auth.getUser()`
- Since `app/admin/layout.tsx` already guards auth, the user is guaranteed to be the admin here
- Display: small text in top-right area of the page showing the admin email and a logout button

- [ ] **Step 1: Read the current admin page**

```bash
# Read the file to understand existing structure before modifying
```

Use the Read tool on `app/admin/page.tsx`. Find the header element or top-level container.

- [ ] **Step 2: Add user display to admin header**

At the top of `app/admin/page.tsx`, ensure it's a client component (`'use client'`) or extract the header into a small client component. Add a user badge in the header:

If `app/admin/page.tsx` is already `'use client'`, add state and effect:

```typescript
// At top of component:
const [adminEmail, setAdminEmail] = useState<string>('')
useEffect(() => {
  supabaseClient.auth.getUser().then(({ data }) => {
    setAdminEmail(data.user?.email ?? '')
  })
}, [])
```

Add to JSX in the header area:

```typescript
{adminEmail && (
  <div className="flex items-center gap-3">
    <span className="text-xs text-neutral-400">{adminEmail}</span>
    <button
      onClick={async () => {
        await supabaseClient.auth.signOut()
        router.push('/login')
      }}
      className="text-xs text-neutral-500 hover:text-black transition-colors underline underline-offset-2"
    >
      Sign out
    </button>
  </div>
)}
```

If `app/admin/page.tsx` is a server component, create a small `components/AdminHeader.tsx` client component that handles the user display and import it into the page.

- [ ] **Step 3: Verify**

Log in as admin, navigate to `http://localhost:3000/admin`.
Expected: admin email visible in header and "Sign out" link. Clicking sign out redirects to `/login` and subsequent visit to `/admin` redirects back to `/login`.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
# or if a new component was created:
git add app/admin/page.tsx components/AdminHeader.tsx
git commit -m "feat: show admin user email and sign-out in admin header"
```
