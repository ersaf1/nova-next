import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function generateMockItinerary(destination: string, duration: number) {
  return {
    destination,
    duration,
    totalEstimatedCost: '$800 - $1200',
    days: Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1} — Explore ${destination}`,
      activities: [
        { time: '09:00', activity: 'Morning city tour', location: `${destination} City Center`, duration: '3 hours', cost: '$20', tips: 'Wear comfortable shoes' },
        { time: '13:00', activity: 'Local lunch experience', location: 'Local restaurant', duration: '1.5 hours', cost: '$15', tips: 'Try the local specialties' },
        { time: '15:00', activity: 'Cultural site visit', location: `${destination} Museum`, duration: '2 hours', cost: '$10', tips: 'Book tickets in advance' },
        { time: '19:00', activity: 'Sunset dinner', location: 'Rooftop restaurant', duration: '2 hours', cost: '$40', tips: 'Make a reservation' },
      ],
      meals: { breakfast: 'Hotel breakfast', lunch: 'Local warung', dinner: 'Fine dining' },
      accommodation: `${destination} Central Hotel`,
      estimatedDailyCost: '$150',
    })),
    travelTips: ['Book accommodation early', 'Carry local currency', 'Learn basic local phrases'],
    bestTimeToVisit: 'April to October',
    localPhrases: [{ phrase: 'Hello', meaning: 'Greeting' }],
  }
}

export async function POST(request: Request) {
  try {
    const { destination, duration, travelers, budget, preferences } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'placeholder') {
      return NextResponse.json(generateMockItinerary(destination || 'Bali', Number(duration) || 3))
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination} for ${travelers} travelers with a budget of ${budget}. 
Preferences: ${preferences || 'general sightseeing'}.

Return a JSON object with this exact structure:
{
  "destination": "string",
  "duration": number,
  "totalEstimatedCost": "string",
  "days": [
    {
      "day": number,
      "title": "string",
      "activities": [
        {
          "time": "string (e.g. 09:00)",
          "activity": "string",
          "location": "string", 
          "duration": "string (e.g. 2 hours)",
          "cost": "string",
          "tips": "string"
        }
      ],
      "meals": { "breakfast": "string", "lunch": "string", "dinner": "string" },
      "accommodation": "string",
      "estimatedDailyCost": "string"
    }
  ],
  "travelTips": ["string"],
  "bestTimeToVisit": "string",
  "localPhrases": [{"phrase": "string", "meaning": "string"}]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response')
    const itinerary = JSON.parse(jsonMatch[0])
    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('AI itinerary error:', error)
    return NextResponse.json(generateMockItinerary('Bali', 3), { status: 200 })
  }
}
