// GET /api/auth/me — returns authenticated user info + role
// Used by admin layout and client components to check auth state
import { NextResponse } from 'next/server'
import { getUserFromRequest, getUserRole } from '@/lib/auth-server'

export async function GET(request: Request) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = await getUserRole(user.id)
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name ?? user.email,
    role: role ?? 'user',
  })
}
