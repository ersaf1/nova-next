import { supabaseClient } from '@/lib/supabase-client'

/**
 * Robust fetch client for admin panel operations.
 * Automatically injects the active Supabase JWT into Authorization: Bearer <token>
 * and syncs the sb-access-token cookie so server-side middleware and routes
 * can always authorize admin PUT, POST, PATCH, and DELETE requests.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  let token: string | null = null

  try {
    const { data: { session } } = await supabaseClient.auth.getSession()
    token = session?.access_token ?? null
  } catch (err) {
    console.error('Failed to get Supabase session in adminFetch:', err)
  }

  const headers = new Headers(init.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
    if (typeof document !== 'undefined') {
      // Sync access token to cookie for fallback
      document.cookie = `sb-access-token=${token}; path=/; max-age=604800; SameSite=Lax`
    }
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
