import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const ADMIN_ROLES = ['admin', 'super_admin']

/**
 * Looks up the role for a given user ID using the service role client,
 * bypassing RLS so the proxy can always read user_roles.
 */
async function getUserRole(userId: string): Promise<string | null> {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role as string
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  // Only act on matched routes (matcher keeps other traffic out, but be explicit)
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next({ request })
  }

  // Build a Supabase SSR client that can read/refresh the session from cookies
  const response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // getUser() validates the JWT server-side (no stale session risk)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── /api/admin/* — return JSON errors, never redirect ──────────────────────
  if (isAdminApi) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = await getUserRole(user.id)
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return response
  }

  // ── /admin/* — redirect unauthenticated / unauthorised users ───────────────
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = await getUserRole(user.id)
  if (!role || !ADMIN_ROLES.includes(role)) {
    const homeUrl = new URL('/', request.url)
    homeUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
