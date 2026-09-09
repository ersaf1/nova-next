import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')

    // 1. If requested for a specific entity (destination or package)
    if (entityType && entityId) {
      const { data: reviews, error } = await supabase
        .from('Review')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', Number(entityId))
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching entity reviews:', error)
      }

      // Map to consistent format for ReviewList.tsx
      const formatted = (reviews ?? []).map((r: any) => ({
        id: r.id,
        user_name: r.user_name || r.name || 'Traveler',
        name: r.user_name || r.name || 'Traveler',
        user_email: r.user_email || '',
        rating: r.rating || 5,
        title: r.title || null,
        body: r.body || r.content || '',
        content: r.body || r.content || '',
        created_at: r.created_at || new Date().toISOString()
      }))

      return NextResponse.json(formatted)
    }

    // 2. Global reviews / testimonials
    const { data: testimonials, error } = await supabase
      .from('Testimonial')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Map testimonials to satisfy both formats
    const formattedTestimonials = (testimonials ?? []).map((t: any) => ({
      ...t,
      name: t.name || 'Traveler',
      user_name: t.name || 'Traveler',
      content: t.content || t.text || '',
      body: t.content || t.text || '',
      rating: t.rating || 5
    }))

    return NextResponse.json(formattedTestimonials)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_id,
      user_email,
      user_name,
      entity_type,
      entity_id,
      name,
      email,
      role,
      content,
      rating,
      title,
      body: reviewBody,
      avatar,
      country
    } = body

    // 1. Check if this is a submission to the Review table (destination / package)
    if (entity_type && entity_id) {
      const finalUserName = user_name || name || 'Traveler'
      const finalEmail = user_email || email || ''
      const finalBody = reviewBody || content || ''

      if (!finalBody || !rating) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('Review')
        .insert({
          user_id: user_id || 'anonymous',
          user_email: finalEmail,
          user_name: finalUserName,
          entity_type,
          entity_id: Number(entity_id),
          rating: Number(rating),
          title: title || null,
          body: finalBody
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data, { status: 201 })
    }

    // 2. Otherwise handle general Testimonial submission
    const finalName = name || user_name
    const finalEmail = email || user_email
    const finalContent = content || reviewBody

    if (!finalName || !finalEmail || !finalContent || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user has a confirmed booking in database
    const { data: confirmedBookings } = await supabase
      .from('Booking')
      .select('id, packageName')
      .eq('email', finalEmail.toLowerCase())
      .eq('status', 'confirmed')

    const isVerified = Array.isArray(confirmedBookings) && confirmedBookings.length > 0

    const testimonialData = {
      name: finalName,
      email: finalEmail,
      role: isVerified ? `Verified Traveler · ${confirmedBookings[0]?.packageName || 'NOVA Explorer'}` : role || 'Travel Enthusiast',
      content: finalContent,
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

