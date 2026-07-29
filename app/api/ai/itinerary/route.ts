import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAttractionsForDestination } from '@/lib/attractions'
import { readFile } from 'fs/promises'
import path from 'path'

const DESTINATIONS_FILE = path.join(process.cwd(), 'data', 'destinations.json')

async function findCountryData(destination: string) {
  try {
    const raw = await readFile(DESTINATIONS_FILE, 'utf-8')
    const list = JSON.parse(raw)
    if (Array.isArray(list)) {
      const match = list.find((item: { country: string; city: string }) =>
        item.country.toLowerCase().includes(destination.toLowerCase()) ||
        destination.toLowerCase().includes(item.country.toLowerCase()) ||
        item.city.toLowerCase().includes(destination.toLowerCase())
      )
      if (match) return match
    }
  } catch (err) {
    console.error('Error finding country data:', err)
  }
  return null
}

function generateMockItinerary(destination: string, duration: number, countryData: any = null) {
  const destName = countryData ? `${countryData.city}, ${countryData.country}` : destination
  const defaultAttractions = countryData ? [
    { name: `Pemandangan & Landmark Utama ${countryData.city}`, description: countryData.tagline || countryData.description, image: countryData.image },
    { name: `Kawasan Wisata Khas ${countryData.country}`, description: `Nikmati pesona alam, kebudayaan, dan daya tarik lokal ${countryData.country}.`, image: countryData.image },
    { name: `Pusat Kuliner & Seni ${countryData.city}`, description: `Cicipi hidangan otentik dan jelajahi pusat kerajinan lokal.`, image: countryData.image }
  ] : getAttractionsForDestination(destination)

  return {
    destination: destName,
    duration,
    totalEstimatedCost: countryData ? countryData.price : '$800 - $1500',
    heroImage: countryData ? countryData.image : null,
    days: Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      title: `Hari ${i + 1} — Eksplorasi ${destName}`,
      activities: [
        { time: '09:00', activity: `Tur Selamat Datang ${destName}`, location: `${destName} City Center`, duration: '3 jam', cost: '$25', tips: 'Gunakan pakaian dan sepatu yang nyaman' },
        { time: '13:00', activity: 'Makan Siang & Kuliner Khas', location: 'Restoran Lokal', duration: '1.5 jam', cost: '$20', tips: 'Cobalah hidangan favorit warga setempat' },
        { time: '15:00', activity: 'Kunjungan Situs Objek Wisata Ikonik', location: `${destName} Museum / Landmark`, duration: '2.5 jam', cost: '$15', tips: 'Bawa kamera untuk mengabadikan momen' },
        { time: '19:00', activity: 'Santap Malam & Suasana Malam Hari', location: 'Spot Panoramic Restaurant', duration: '2 jam', cost: '$45', tips: 'Disarankan melakukan reservasi awal' },
      ],
      meals: { breakfast: 'Sarapan Hotel', lunch: 'Kuliner Lokal', dinner: 'Fine Dining / Rooftop' },
      accommodation: `Hotel Bintang 4 di ${destName}`,
      estimatedDailyCost: '$150 - $250',
    })),
    attractions: defaultAttractions,
    travelTips: [
      `Siapkan paspor dan dokumen perjalanan untuk kunjungan ke ${countryData ? countryData.country : destination}.`,
      'Bawa mata uang lokal atau kartu pembayaran internasional.',
      'Pelajari frasa sapaan dasar untuk kemudahan berinteraksi dengan warga lokal.'
    ],
    bestTimeToVisit: countryData ? 'Sepanjang Tahun (Kondisi Terbaik)' : 'April hingga Oktober',
    localPhrases: [
      { phrase: 'Halo / Good day', meaning: 'Salam sapaan' },
      { phrase: 'Terima kasih', meaning: 'Ungkapan rasa terima kasih' },
      { phrase: 'Berapa harganya?', meaning: 'Menanyakan harga' }
    ],
    aiIntro: `Yang cocok untuk kamu adalah itinerary ${destName} selama ${duration} hari ini. Kami sudah menyiapkan rencana perjalanan terbaik berdasarkan destinasi impianmu — tinggal ikuti saja dan nikmati perjalanannya!`,
  }
}

export async function POST(request: Request) {
  let destination = 'Bali'
  let duration = 3

  try {
    const body = await request.json()
    destination = body.destination || 'Bali'
    duration = Number(body.duration) || 3
    const { travelers, budget, preferences } = body

    const countryData = await findCountryData(destination)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'placeholder') {
      return NextResponse.json(generateMockItinerary(destination, duration, countryData))
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
  "attractions": [
    {
      "name": "string (name of a famous must-visit place in ${destination})",
      "description": "string (1-2 sentences about what makes it special)"
    }
  ],
  "aiIntro": "string (1-2 kalimat hangat dalam Bahasa Indonesia yang terasa personal, dimulai dengan 'Yang cocok untuk kamu adalah...' atau 'Berdasarkan preferensi kamu...' atau variasi serupa — sebutkan destinasi, durasi, dan preferensi/budget mereka secara natural)",
  "travelTips": ["string"],
  "bestTimeToVisit": "string",
  "localPhrases": [{"phrase": "string", "meaning": "string"}]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response')
    const itinerary = JSON.parse(jsonMatch[0])
    
    // Inject image for attractions & country data
    itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)
    if (countryData && countryData.image) {
      itinerary.heroImage = countryData.image
    }
    
    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('AI itinerary fallback:', error)
    const countryData = await findCountryData(destination || 'Bali')
    return NextResponse.json(generateMockItinerary(destination || 'Bali', Number(duration) || 3, countryData), { status: 200 })
  }
}
