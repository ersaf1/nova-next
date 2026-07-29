import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabaseWithUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { user } = await getSupabaseWithUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    name: user.user_metadata?.name ?? '',
    phone: user.user_metadata?.phone ?? '',
    travel_style: user.user_metadata?.travel_style ?? '',
  })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getSupabaseWithUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, phone, travel_style } = body

  const { data, error } = await supabase.auth.updateUser({
    data: {
      name: name ?? user.user_metadata?.name,
      phone: phone ?? user.user_metadata?.phone,
      travel_style: travel_style ?? user.user_metadata?.travel_style,
    },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, user: data.user })
}
