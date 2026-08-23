import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: testimonials, error } = await supabase
      .from('Testimonial')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(testimonials ?? [])
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role, content, rating, avatar, country } = body

    if (!name || !email || !content || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user has a confirmed booking in database
    const { data: confirmedBookings } = await supabase
      .from('Booking')
      .select('id, packageName')
      .eq('email', email.toLowerCase())
      .eq('status', 'confirmed')

    const isVerified = Array.isArray(confirmedBookings) && confirmedBookings.length > 0

    const testimonialData = {
      name,
      email,
      role: isVerified ? `Verified Traveler · ${confirmedBookings[0]?.packageName || 'NOVA Explorer'}` : role || 'Travel Enthusiast',
      content,
      rating: Number(rating),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      country: country || 'Indonesia',
      verified: isVerified,
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('Testimonial')
      .insert(testimonialData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
