import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  if (token === 'demo' || token === 'sample') {
    return NextResponse.json({
      id: 'demo-itinerary',
      title: 'Eksplorasi Budaya & Alam Bali Eksklusif',
      destination: 'Bali, Indonesia',
      duration: 3,
      travelers: 2,
      budget: 'Mid-range',
      preferences: '["cultural", "nature"]',
      visibility: 'public',
      shareToken: 'demo',
      generatedContent: JSON.stringify({
        destination: 'Bali, Indonesia',
        duration: 3,
        totalEstimatedCost: 'Rp 4.500.000',
        bestTimeToVisit: 'April - Oktober',
        travelTips: [
          'Gunakan pakaian sopan saat mengunjungi pura.',
          'Bawa tabir surya dan air mineral cukup.'
        ],
        days: [
          {
            day: 1,
            title: 'Ketibaan & Eksplorasi Ubud',
            meals: { breakfast: 'Hotel Resort', lunch: 'Warung Babi Guling Ibu Oka', dinner: 'Bebek Bengil Ubud' },
            accommodation: 'Maya Ubud Resort & Spa',
            estimatedDailyCost: 'Rp 1.200.000',
            activities: [
              { time: '09:00', activity: 'Check-in resort & bersantai', location: 'Ubud' },
              { time: '13:00', activity: 'Sacred Monkey Forest Sanctuary', location: 'Padangtegal' },
              { time: '16:30', activity: 'Menikmati sunset di Campuhan Ridge Walk', location: 'Campuhan' }
            ]
          }
        ]
      })
    })
  }

  const { data, error } = await supabase
    .from('SavedItinerary')
    .select('*')
    .eq('shareToken', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Itinerary not found or link has expired' }, { status: 404 })
  }

  return NextResponse.json(data)
}
