import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULT_FAQS = [
  { id: 1, q: 'How do I book a trip with NOVA?', a: 'Simply search for your destination, choose a package that suits your budget and preferences, fill in your travel details, and confirm your booking. The whole process takes less than 5 minutes.' },
  { id: 2, q: 'Can I customize my travel package?', a: 'Yes! Every package can be customized — you can adjust travel dates, number of travelers, room types, and add optional experiences. Contact our concierge team for fully bespoke itineraries.' },
  { id: 3, q: 'What is included in the package price?', a: 'Package prices include flights, accommodation, listed tours, and any meals specified in the package details. Airport transfers and travel insurance are optional add-ons available at checkout.' },
  { id: 4, q: 'How does the AI Itinerary Planner work?', a: 'Our AI Planner uses Gemini to generate a personalized day-by-day itinerary based on your destination, duration, budget, and interests. It suggests activities, restaurants, accommodation, and local tips — all in seconds.' },
  { id: 5, q: 'What is the cancellation policy?', a: 'Cancellations made more than 30 days before departure receive a full refund. Cancellations 14-30 days before receive a 50% refund. Within 14 days, refunds are subject to supplier terms. Travel insurance is strongly recommended.' },
  { id: 6, q: 'Is my payment secure?', a: 'Absolutely. All transactions are processed through encrypted payment gateways. We never store your card details, and all bookings are protected by our secure payment infrastructure.' },
  { id: 7, q: 'Can I book for a group?', a: 'Yes — most packages support groups of up to 12 people. For larger groups or corporate travel, please reach out to our team directly for special group rates and dedicated coordination.' },
  { id: 8, q: 'How do I get my e-ticket after booking?', a: 'Once payment is confirmed, your e-ticket and booking confirmation are instantly available on your dashboard under "My Bookings". You can print or save your e-ticket from there.' },
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
