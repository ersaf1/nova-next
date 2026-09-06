import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULT_FAQS = [
  {
    id: 1,
    q: 'Apa saja yang sudah termasuk dalam paket perjalanan All-Inclusive?',
    a: 'Seluruh paket All-Inclusive mencakup tiket pesawat pulang-pergi (PP), akomodasi hotel atau resort bintang 4/5 terverifikasi, transportasi lokal privat, jadwal makan terencana, tiket masuk destinasi wisata, serta asuransi perjalanan dasar.'
  },
  {
    id: 2,
    q: 'Bagaimana kebijakan pembatalan dan jaminan pengembalian dana (refund)?',
    a: 'NOVA memberikan jaminan 100% refund untuk pembatalan lebih dari 30 hari sebelum keberangkatan, dan 50% refund untuk 15-30 hari sebelum keberangkatan. Jika terjadi kendala bencana alam atau penutupan bandara resmi, perjalanan dapat dijadwalkan ulang secara fleksibel tanpa penalti.'
  },
  {
    id: 3,
    q: 'Kapan dan bagaimana saya menerima e-ticket setelah pembayaran?',
    a: 'Setelah pembayaran berhasil diverifikasi, e-ticket dan voucher akomodasi resmi langsung terbit di menu Pemesanan Saya dan dikirimkan salinannya ke email terdaftar dalam hitungan menit.'
  },
  {
    id: 4,
    q: 'Bagaimana jika saya memerlukan bantuan darurat selama liburan?',
    a: 'Pemandu lokal berlisensi dan tim Travel Concierge NOVA siap mendampingi Anda 24 jam via WhatsApp untuk menangani kendala akomodasi, penyesuaian jadwal, atau bantuan darurat di lapangan.'
  }
]

export async function GET() {
  try {
    const { data, error } = await supabase.from('FAQ').select('*')
    if (error || !data || data.length === 0) return NextResponse.json(DEFAULT_FAQS)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(DEFAULT_FAQS)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from('FAQ').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create faq' }, { status: 500 })
  }
}
