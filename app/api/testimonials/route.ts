import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth-server'

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: 'Reza Pramana & Siska',
    location: 'Jakarta, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    rating: 5,
    text: 'Sumpah pengalamannya luar biasa! Liburan ke Labuan Bajo naik kapal Phinisi semuanya diatur rapi dari tiket pesawat sampai makanan di kapal yang setara restoran bintang 5. Concierge NOVA sangat responsif.',
    trip: 'Labuan Bajo Phinisi Luxury'
  },
  {
    id: 2,
    name: 'Dion Kusuma',
    location: 'Surabaya, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    rating: 5,
    text: 'Fitur AI Travel Planner-nya gokil banget! Bikin rute 7 hari di Jepang langsung lengkap sama estimasi budget dan rekomendasi kuil yang gak terlalu ramai. E-ticket langsung terbit 2 menit setelah bayar.',
    trip: 'Japan Classic Cherry Blossom'
  },
  {
    id: 3,
    name: 'Anindya Putri',
    location: 'Bandung, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    rating: 5,
    text: 'Pertama kali solo trip ke Swiss dan awalnya takut nyasar, tapi berkat itinerary pocket offline dan support tim NOVA via WhatsApp, semuanya aman dan super seru. Worth every penny!',
    trip: 'Swiss Alps Experience'
  }
]

export async function GET() {
  try {
    const { data, error } = await supabase.from('Testimonial').select('*')
    if (error || !data || data.length === 0) return NextResponse.json(DEFAULT_TESTIMONIALS)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(DEFAULT_TESTIMONIALS)
  }
}

export async function POST(request: Request) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json()
    const { data, error } = await supabase.from('Testimonial').insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
