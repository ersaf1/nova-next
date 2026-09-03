import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Extracts and validates a user from an incoming Request.
 * Checks Authorization: Bearer <token> header first, then falls back
 * to the sb-access-token cookie or the Supabase SSR cookie format.
 */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  try {
    let token: string | null = null

    // 1. Try Authorization: Bearer <token>
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }

    // 2. Fall back to cookies
    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(';').map((c) => {
            const [key, ...rest] = c.trim().split('=')
            return [key.trim(), rest.join('=')]
          })
        )

        // 2a. Explicit sb-access-token cookie
        if (cookies['sb-access-token']) {
          token = cookies['sb-access-token']
        } else {
          // 2b. Supabase SSR cookies (supports both chunked .0, .1 and unchunked formats)
          const allKeys = Object.keys(cookies)
          const chunkedKeys = allKeys
            .filter((k) => /sb-.+-auth-token\.\d+$/.test(k))
            .sort((a, b) => {
              const idxA = parseInt(a.split('.').pop() || '0', 10)
              const idxB = parseInt(b.split('.').pop() || '0', 10)
              return idxA - idxB
            })

          let raw = ''
          if (chunkedKeys.length > 0) {
            raw = chunkedKeys.map((k) => decodeURIComponent(cookies[k])).join('')
          } else {
            const singleKey = allKeys.find((k) => k.startsWith('sb-') && k.includes('-auth-token'))
            if (singleKey) {
              raw = decodeURIComponent(cookies[singleKey])
            }
          }

          if (raw) {
            try {
              if (raw.startsWith('base64-')) {
                raw = Buffer.from(raw.slice(7), 'base64').toString('utf-8')
              }
              const parsed: unknown = JSON.parse(raw)
              if (parsed && typeof parsed === 'object') {
                const session = parsed as { access_token?: string }
                if (typeof session.access_token === 'string') {
                  token = session.access_token
                } else if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].startsWith('ey')) {
                  token = parsed[0]
                }
              }
            } catch {
              // Malformed cookie — ignore
            }
          }
        }
      }
    }

    if (!token) return null

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) return null

    return data.user
  } catch {
    return null
  }
}

export type AppRole = 'user' | 'booking_officer' | 'admin' | 'super_admin'

/**
 * Returns the role for a given user from the user_roles table.
 * Defaults to 'user' when no record exists.
 */
export async function getUserRole(
  userId: string
): Promise<AppRole | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return null
    if (!data) return 'user' // default role when no record

    const role = data.role as string
    if (role === 'admin' || role === 'super_admin' || role === 'booking_officer' || role === 'user') {
      return role as AppRole
    }

    return 'user'
  } catch {
    return null
  }
}

/**
 * Requires a valid authenticated user.
 * Returns { user } on success or a 401 NextResponse on failure.
 */
export async function requireAuth(
  request: Request
): Promise<{ user: User } | NextResponse> {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { user }
}

/**
 * Requires a valid authenticated user whose role is in allowedRoles.
 * Returns { user, role } on success, 401 if unauthenticated, or 403 if role is insufficient.
 */
export async function requireRole(
  request: Request,
  allowedRoles: string[]
): Promise<{ user: User; role: string } | NextResponse> {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = await getUserRole(user.id)
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return { user, role }
}
