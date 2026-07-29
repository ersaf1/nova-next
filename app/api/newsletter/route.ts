import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendNewsletterWelcome } from '@/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, message: 'Format email tidak valid.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('Newsletter')
      .select('id, is_active')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      if (!existing.is_active) {
        // Reactivate
        await supabase.from('Newsletter').update({ is_active: true }).eq('email', normalizedEmail)
        return NextResponse.json({ success: true, message: 'Terima kasih! Kamu berhasil berlangganan kembali.' })
      }
      return NextResponse.json({ success: true, message: 'Kamu sudah berlangganan!' })
    }

    const { error } = await supabase.from('Newsletter').insert({ email: normalizedEmail })
    if (error) throw error

    // Send welcome email (fire-and-forget)
    sendNewsletterWelcome({ to: normalizedEmail }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Terima kasih! Kamu berhasil berlangganan.' })
  } catch {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { count } = await supabase
      .from('Newsletter')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
