import { NextResponse } from 'next/server'
import { getAutocompleteSuggestions } from '@/lib/geoapify/autocomplete'

export async function GET(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ suggestions: [] })

  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') ?? ''

  if (text.length < 2) return NextResponse.json({ suggestions: [] })

  try {
    const suggestions = await getAutocompleteSuggestions(text, apiKey)
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
