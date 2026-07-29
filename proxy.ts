import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = ['/dashboard', '/profile', '/booking', '/itinerary']

async function getUser(request: NextRequest, response: NextResponse) {
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
  return supabase.auth.getUser()
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request: { headers: request.headers } })

  // Admin auth guard
  if (pathname.startsWith('/admin')) {
    const { data: { user } } = await getUser(request, response)

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? ''
    if (adminEmail && user.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  }

  // Protected user routes — use proper Supabase session check
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const { data: { user } } = await getUser(request, response)
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*', '/booking/:path*', '/itinerary/:path*'],
}
