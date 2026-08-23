import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { role } = await request.json()

    if (!role || !['user', 'booking_officer', 'admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Try updating profiles table
    await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)

    // Try updating user_roles table if it exists
    try {
      await supabase
        .from('user_roles')
        .upsert({ user_id: id, role })
    } catch {
      // ignore if user_roles table does not exist
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
