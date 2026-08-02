import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAttractionsForDestination, mergePlacesIntoAttractions } from '@/lib/attractions'
import { getOrFetchPlaces } from '@/lib/geoapify/places-cache'
import { readFile } from 'fs/promises'
import path from 'path'

const DESTINATIONS_FILE = path.join(process.cwd(), 'data', 'destinations.json')

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Sudut kreatif acak supaya tiap generate terasa berbeda
const CREATIVE_ANGLES = [
  'kuliner lokal dan hidden gems',
  'alam, spot foto ikonik, dan suasana santai',
  'budaya, sejarah, dan kehidupan warga lokal',
  'pengalaman unik yang jarang dikunjungi turis',
  'keseimbangan antara landmark terkenal dan tempat anti-mainstream',
  'petualangan aktif di siang hari dan suasana malam yang hidup',
]

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

function getMockDayData(dayNum: number, destName: string, realPlaces: string[], shuffledTemplates: number[]) {
  // Use real place names when available, fallback to generic templates
  const p = (idx: number, fallback: string) => realPlaces.length > 0
    ? realPlaces[idx % realPlaces.length]
    : fallback

  const dayTemplates = [
    {
      title: `Hari ${dayNum} — Selamat Datang & Eksplorasi Pusat Kota ${destName}`,
      activities: [
        { time: '09:00', activity: `Tur Selamat Datang & Orientasi Kota ${destName}`, location: p(0, `${destName} City Center`), duration: '3 jam', cost: 'Gratis/Tips', tips: 'Gunakan pakaian dan sepatu yang nyaman' },
        { time: '13:00', activity: 'Makan Siang & Kuliner Khas Setempat', location: p(1, 'Restoran Tradisional'), duration: '1.5 jam', cost: '$15', tips: 'Cobalah menu andalan lokal yang direkomendasikan' },
        { time: '15:00', activity: 'Kunjungan Landmark Sejarah & Museum Utama', location: p(2, `${destName} Historical Site`), duration: '2.5 jam', cost: '$12', tips: 'Bawa kamera untuk mengabadikan arsitektur bersejarah' },
        { time: '19:00', activity: 'Makan Malam Selamat Datang & Suasana Malam', location: p(3, 'Panoramic Rooftop Café'), duration: '2 jam', cost: '$30', tips: 'Sangat direkomendasikan melakukan reservasi awal' }
      ],
      meals: { breakfast: 'Sarapan Hotel', lunch: 'Restoran Lokal', dinner: 'Rooftop Cafe' },
      accommodation: `Hotel Boutique di Pusat Kota ${destName}`
    },
    {
      title: `Hari ${dayNum} — Petualangan Alam & Spot Foto Ikonik ${destName}`,
      activities: [
        { time: '08:30', activity: `Petualangan Alam & Trekking Ringan`, location: p(4, `${destName} Nature Park / Ridge`), duration: '4 jam', cost: '$20', tips: 'Bawa air minum dan pakai krim pelindung matahari' },
        { time: '13:00', activity: 'Makan Siang di Area Tepi Sungai/Tepi Pantai', location: p(5, 'Rumah Makan Tradisional'), duration: '1.5 jam', cost: '$10', tips: 'Nikmati pemandangan alam sambil makan siang' },
        { time: '15:30', activity: 'Jelajah Desa Wisata atau Kawasan Heritage', location: p(6, `${destName} Old Town`), duration: '3 jam', cost: 'Gratis', tips: 'Cobalah berinteraksi ramah dengan penduduk sekitar' },
        { time: '19:30', activity: 'Makan Malam Santai & Berburu Street Food', location: p(7, 'Street Food Market / Pasar Malam'), duration: '2 jam', cost: '$15', tips: 'Siapkan uang tunai kecil untuk kemudahan transaksi' }
      ],
      meals: { breakfast: 'Sarapan Buffet', lunch: 'Cafe Tepi Jalan', dinner: 'Street Food Market' },
      accommodation: `Hotel Boutique di Pusat Kota ${destName}`
    },
    {
      title: `Hari ${dayNum} — Meresapi Kebudayaan & Kehidupan Lokal ${destName}`,
      activities: [
        { time: '09:30', activity: `Jelajah Galeri Seni, Istana Kuno, atau Kastil`, location: p(8, `${destName} Palace / Art Gallery`), duration: '3 jam', cost: '$18', tips: 'Patuhi aturan pengambilan gambar di dalam area gedung' },
        { time: '13:00', activity: 'Makan Siang dengan Tema Gastronomi Lokal', location: p(9, 'Bistro Modern'), duration: '1.5 jam', cost: '$25', tips: 'Tanyakan rekomendasi Chef untuk menu hari ini' },
        { time: '15:00', activity: 'Berbelanja Oleh-oleh & Kerajinan Khas', location: p(10, 'Pasar Seni / Local Craft Bazaar'), duration: '3 jam', cost: 'Sesuai belanja', tips: 'Tawar harga secara wajar jika berbelanja di pasar tradisional' },
        { time: '19:00', activity: 'Makan Malam Perpisahan & Pertunjukan Seni', location: p(11, 'Theater & Dinner Hall'), duration: '3 jam', cost: '$40', tips: 'Gunakan pakaian kasual rapi untuk acara makan malam' }
      ],
      meals: { breakfast: 'Sarapan Sehat', lunch: 'Bistro Gastronomi', dinner: 'Dinner & Culture Show' },
      accommodation: `Resort / Villa Wisata di ${destName}`
    },
    {
      title: `Hari ${dayNum} — Rileksasi & Waktu Bebas di ${destName}`,
      activities: [
        { time: '10:00', activity: `Waktu Santai, Rekreasi Mandiri, atau Spa`, location: p(12, `${destName} Recreation Area / Spa`), duration: '2.5 jam', cost: '$35', tips: 'Saatnya rileks setelah hari-hari penuh petualangan' },
        { time: '13:00', activity: 'Makan Siang Santai di Kafe Tepi Jalan', location: p(13, 'Estetik Café'), duration: '1.5 jam', cost: '$18', tips: 'Cocok untuk bersantai sambil mengamati aktivitas lokal kota' },
        { time: '15:00', activity: 'Kunjungan Taman Botani / Taman Kota Terbuka', location: p(14, `${destName} Botanical Garden`), duration: '2 jam', cost: '$5', tips: 'Nikmati suasana sore yang teduh dan asri' },
        { time: '18:30', activity: 'Makan Malam Santai & Berburu Sunset Terakhir', location: p(15, 'Sunset View Point Lounge'), duration: '2 jam', cost: '$25', tips: 'Datang lebih awal sebelum waktu matahari terbenam untuk spot terbaik' }
      ],
      meals: { breakfast: 'Sarapan Hotel', lunch: 'Kafe Estetik', dinner: 'Sunset Lounge' },
      accommodation: `Resort / Villa Wisata di ${destName}`
    }
  ]

  // Urutan template diacak per request supaya susunan hari tidak selalu sama
  const index = shuffledTemplates[(dayNum - 1) % shuffledTemplates.length]
  return dayTemplates[index]
}

const MOCK_INTROS = [
  (destName: string, duration: number) => `Yang cocok untuk kamu adalah itinerary ${destName} selama ${duration} hari ini — susunannya sengaja bervariasi biar tiap hari terasa beda!`,
  (destName: string, duration: number) => `Berdasarkan preferensi kamu, perjalanan ${duration} hari di ${destName} ini pas banget. Ada campuran kota, alam, dan kulinernya!`,
  (destName: string, duration: number) => `Ini dia rencana ${duration} hari di ${destName} yang dirancang santai tapi tetap padat pengalaman. Selamat jalan-jalan!`,
  (destName: string, duration: number) => `${destName} selama ${duration} hari? Bisa! Itinerary ini menyeimbangkan waktu eksplorasi dan waktu santai kamu.`,
]

function generateMockItinerary(destination: string, duration: number, countryData: any = null, realPlaces: string[] = []) {
  const destName = countryData ? `${countryData.city}, ${countryData.country}` : destination
  const defaultAttractions = countryData ? [
    { name: `Pemandangan & Landmark Utama ${countryData.city}`, description: countryData.tagline || countryData.description, image: countryData.image },
    { name: `Kawasan Wisata Khas ${countryData.country}`, description: `Nikmati pesona alam, kebudayaan, dan daya tarik lokal ${countryData.country}.`, image: countryData.image },
    { name: `Pusat Kuliner & Seni ${countryData.city}`, description: `Cicipi hidangan otentik dan jelajahi pusat kerajinan lokal.`, image: countryData.image }
  ] : getAttractionsForDestination(destination)

  // Acak urutan template hari + nama tempat supaya fallback tidak statis
  const shuffledTemplates = shuffle([0, 1, 2, 3])
  const shuffledPlaces = shuffle(realPlaces)
  const intro = MOCK_INTROS[Math.floor(Math.random() * MOCK_INTROS.length)]

  return {
    isMock: true,
    destination: destName,
    duration,
    totalEstimatedCost: countryData ? countryData.price : '$800 - $1500',
    heroImage: countryData ? countryData.image : null,
    days: Array.from({ length: duration }, (_, i) => {
      const dayNum = i + 1
      const dayData = getMockDayData(dayNum, destName, shuffledPlaces, shuffledTemplates)
      return {
        day: dayNum,
        title: dayData.title,
        activities: dayData.activities,
        meals: dayData.meals,
        accommodation: dayData.accommodation,
        estimatedDailyCost: '$120 - $200',
      }
    }),
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
    aiIntro: intro(destName, duration),
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

    // Ambil tempat asli Geoapify lebih dulu — dipakai untuk grounding prompt & galeri
    const realPlaces = await getOrFetchPlaces(destination)
    const shuffledPlaces = shuffle(realPlaces)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'placeholder') {
      return NextResponse.json(generateMockItinerary(destination, duration, countryData, shuffledPlaces.map(p => p.name)))
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.95,
        topP: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    })

    const placeLines = shuffledPlaces.slice(0, 15).map(pl => `- ${pl.name} — ${pl.address}`).join('\n')
    const angle = CREATIVE_ANGLES[Math.floor(Math.random() * CREATIVE_ANGLES.length)]

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination} for ${travelers} travelers with a budget of ${budget}.
Preferences: ${preferences || 'general sightseeing'}.
Creative angle for this itinerary: emphasize ${angle}. Write with fresh, natural wording — every generation must feel different. Avoid generic filler phrases and vary activity descriptions between days.
${placeLines ? `\nHere are REAL, verified places in/near ${destination} from a places database. Build the itinerary around THESE places — use their exact names as activity "location" values whenever relevant, and never invent place names:\n${placeLines}\n` : ''}
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

    // Coba sampai 2x sebelum menyerah ke fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let itinerary: any = null
    let lastError: unknown = null
    for (let attempt = 1; attempt <= 2 && !itinerary; attempt++) {
      try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Invalid AI response')
        itinerary = JSON.parse(jsonMatch[0])
      } catch (err) {
        lastError = err
        console.error(`Gemini itinerary attempt ${attempt} failed:`, err)
      }
    }
    if (!itinerary) throw lastError ?? new Error('AI itinerary generation failed')

    // Galeri attractions tetap memakai tempat asli Geoapify (fallback statis bila kosong)
    if (realPlaces.length > 0) {
      itinerary.attractions = mergePlacesIntoAttractions(shuffledPlaces)
    } else {
      itinerary.attractions = getAttractionsForDestination(destination, itinerary.attractions)
    }
    if (countryData && countryData.image) {
      itinerary.heroImage = countryData.image
    }

    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('AI itinerary fallback:', error)
    const dest = destination || 'Bali'
    const countryData = await findCountryData(dest)

    // Fetch real Geoapify places first — use names for activity locations + attractions
    const realPlaces = await getOrFetchPlaces(dest)
    const realPlaceNames = shuffle(realPlaces.map(p => p.name))

    const mock = generateMockItinerary(dest, Number(duration) || 3, countryData, realPlaceNames)

    // Inject real Geoapify places into attractions gallery
    if (realPlaces.length > 0) {
      mock.attractions = mergePlacesIntoAttractions(shuffle(realPlaces))
    }

    return NextResponse.json(mock, { status: 200 })
  }
}
