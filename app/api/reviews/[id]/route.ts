import { NextResponse } from 'next/server'
import { requireAuth, getUserRole } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const { id } = await params

  const { data: review } = await supabaseAdmin
    .from('Review')
    .select('user_id')
    .eq('id', Number(id))
    .single()

  if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  if (review.user_id !== user.id) {
    const role = await getUserRole(user.id)
    if (!['admin', 'super_admin'].includes(role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await supabaseAdmin.from('Review').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
