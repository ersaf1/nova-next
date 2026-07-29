# Plan A: Zero-Dependency Features

## Context
- Project: C:\Users\lulus\Dominator\nova-next
- Branch: security/rbac-hardening (work here, do NOT create new branch)
- Stack: Next.js App Router, TypeScript, Supabase, Tailwind CSS
- All 4 tasks in this plan are fully independent and can run in parallel

## Task A1: SEO (sitemap + robots + metadata)

### Files to create
- `app/sitemap.ts` — dynamic sitemap
- `app/robots.ts` — robots config

### Files to modify
- `app/layout.tsx` — add openGraph + twitter metadata

### Specs

**app/sitemap.ts**
```typescript
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'
  
  // Static pages
  const staticRoutes = ['/', '/destinations', '/packages', '/search', '/how-it-works']
  
  // Dynamic: destinations + packages from Supabase
  const { data: destinations } = await supabase.from('Destination').select('id, city')
  const { data: packages } = await supabase.from('Package').select('id, slug')
  
  return [
    ...staticRoutes.map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1 : 0.8,
    })),
    ...(destinations ?? []).map(d => ({
      url: `${baseUrl}/destinations/${d.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...(packages ?? []).map(p => ({
      url: `${baseUrl}/packages/${p.slug ?? p.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
```

**app/robots.ts**
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

**app/layout.tsx** — add to existing metadata export:
```typescript
export const metadata: Metadata = {
  title: 'Nova — Travel Platform',
  description: 'Your AI-powered travel companion — from first search to safe return across 195 countries.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'),
  openGraph: {
    title: 'Nova — Travel Platform',
    description: 'Your AI-powered travel companion — from first search to safe return across 195 countries.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Nova Travel',
    images: [{ url: '/nova_official_logo.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nova — Travel Platform',
    description: 'Your AI-powered travel companion across 195 countries.',
    images: ['/nova_official_logo.png'],
  },
  robots: { index: true, follow: true },
}
```

Also add to `.env.example` (not .env): `NEXT_PUBLIC_BASE_URL=https://your-domain.com`

### Verification
Run `npx tsc --noEmit` — no errors in new files.

---

## Task A2: Rate Limiting

### Install
```bash
npm install @upstash/ratelimit@latest @upstash/redis@latest
```

### Files to create
- `lib/rate-limit.ts` — rate limiter factory with in-memory fallback

### Files to modify
- `proxy.ts` (middleware) — add rate limiting to sensitive routes

### Specs

**lib/rate-limit.ts**
```typescript
// Rate limiter with Upstash Redis when available, in-memory fallback for dev
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory store fallback (development / when Upstash not configured)
const memoryStore = new Map<string, { count: number; reset: number }>()

function inMemoryRateLimit(key: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now()
  const entry = memoryStore.get(key)
  if (!entry || now > entry.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowMs })
    return { success: true }
  }
  if (entry.count >= limit) return { success: false }
  entry.count++
  return { success: true }
}

// Upstash limiter instances (only created if env vars are set)
function createUpstashLimiter(requests: number, window: `${number} s` | `${number} m`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  })
}

export const loginLimiter = createUpstashLimiter(10, '10 m')    // 10 attempts per 10 min
export const signupLimiter = createUpstashLimiter(5, '10 m')    // 5 signups per 10 min
export const bookingLimiter = createUpstashLimiter(10, '1 m')   // 10 bookings per min
export const reviewLimiter = createUpstashLimiter(5, '1 m')     // 5 reviews per min
export const paymentLimiter = createUpstashLimiter(5, '1 m')    // 5 payment attempts per min

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  fallbackLimit: number,
  fallbackWindowMs: number
): Promise<{ success: boolean }> {
  if (limiter) {
    return limiter.limit(identifier)
  }
  return inMemoryRateLimit(identifier, fallbackLimit, fallbackWindowMs)
}
```

**proxy.ts** — add rate limiting before auth checks:
- Import `checkRateLimit` and the limiter instances from `lib/rate-limit.ts`
- Get client IP from `request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown'`
- For POST `/api/auth/signup` → `signupLimiter`, limit 5/10min
- For POST `/api/bookings` → `bookingLimiter`, limit 10/min
- For POST `/api/reviews` → `reviewLimiter`, limit 5/min
- For POST `/api/payment/create` → `paymentLimiter`, limit 5/min
- If rate limited: return `NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })`

Add to `.env` (as comments/placeholders):
```
# UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
```

### Verification
- `npx tsc --noEmit` — no errors

---

## Task A3: Password Reset Callback + Page

### Files to create
- `app/auth/callback/route.ts` — exchange code for session
- `app/auth/reset-password/page.tsx` — new password form

### Files to modify
- `app/login/page.tsx` — fix redirectTo in resetPasswordForEmail call

### Specs

**app/auth/callback/route.ts**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

**app/auth/reset-password/page.tsx**
- Client component with `'use client'`
- Form with: new password input + confirm password input + submit button
- On mount: check for active session via `supabaseClient.auth.getUser()` — if no session, redirect to `/login`
- On submit: call `supabaseClient.auth.updateUser({ password: newPassword })`
- Validate: password min 8 chars, passwords match
- On success: show success message, redirect to `/dashboard` after 2s
- On error: show error message
- Style: match existing login page design (white card, centered, Geist font)

**app/login/page.tsx** — find the `resetPasswordForEmail` call and update:
```typescript
await supabaseClient.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
})
```
Read the file first to find the exact call location.

### Verification
- `npx tsc --noEmit` — no errors in new files

---

## Task A4: Live Chat (Crisp)

### Files to create
- `components/CrispChat.tsx` — Crisp widget loader

### Files to modify
- `app/layout.tsx` — import and use CrispChat

### Specs

**components/CrispChat.tsx**
```typescript
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

export default function CrispChat() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!websiteId) return // Skip if not configured
    
    window.$crisp = []
    window.CRISP_WEBSITE_ID = websiteId
    
    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)
    
    return () => {
      // Cleanup on unmount
      document.head.removeChild(script)
    }
  }, [])
  
  return null
}
```

**app/layout.tsx** — add `<CrispChat />` inside `<body>` after `<PageTransition>`:
```typescript
import CrispChat from '@/components/CrispChat'
// ...
<body>
  <PageTransition>{children}</PageTransition>
  <CrispChat />
</body>
```

Add to `.env` as placeholder:
```
# NEXT_PUBLIC_CRISP_WEBSITE_ID=your-crisp-website-id
```

### Verification
- `npx tsc --noEmit` — no errors
