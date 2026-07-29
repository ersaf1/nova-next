import fs from 'fs'
import path from 'path'
import https from 'https'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrnmzwtjqcvknoclycbd.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impybm16d3RqcWN2a25vY2x5Y2JkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTExNzk3OCwiZXhwIjoyMTAwNjkzOTc4fQ.KzPJJmVj0sdnnblUY2Akezd7bfVxdvqy4EPNR0WCxr4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// High resolution public travel images from Unsplash / Pexels CDN
const DESTINATION_SEEDS = [
  {
    city: 'Bali',
    country: 'Indonesia',
    tagline: 'Spirit, serenity, and soul',
    description: 'Tropical paradise with stunning temples, rice terraces, and world-class surf beaches.',
    rating: 4.9,
    duration: '5-14 days',
    price: 'From $699',
    category: 'Beach',
    tag: 'Editor\'s Pick',
    remoteUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=90',
    localFilename: 'bali.jpg'
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    tagline: 'Where tradition meets tomorrow',
    description: 'A dazzling blend of ultramodern and traditional, neon lights and ancient temples.',
    rating: 4.8,
    duration: '7-14 days',
    price: 'From $899',
    category: 'City',
    tag: 'Popular',
    remoteUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=90',
    localFilename: 'tokyo.jpg'
  },
  {
    city: 'Santorini',
    country: 'Greece',
    tagline: 'Sunsets worth crossing oceans for',
    description: 'Iconic white-washed villages perched on volcanic cliffs above the Aegean Sea.',
    rating: 4.9,
    duration: '5-10 days',
    price: 'From $1,199',
    category: 'Beach',
    tag: 'Trending',
    remoteUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
    localFilename: 'santorini.jpg'
  },
  {
    city: 'Paris',
    country: 'France',
    tagline: 'Romance written in stone and light',
    description: 'The city of light — art, cuisine, fashion, and the iconic Eiffel Tower.',
    rating: 4.8,
    duration: '4-10 days',
    price: 'From $1,049',
    category: 'City',
    tag: null,
    remoteUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=90',
    localFilename: 'paris.jpg'
  },
  {
    city: 'Queenstown',
    country: 'New Zealand',
    tagline: 'The adventure capital of the world',
    description: 'Surrounded by dramatic alpine scenery, majestic lakes, and exhilarating extreme sports.',
    rating: 4.8,
    duration: '7-14 days',
    price: 'From $1,499',
    category: 'Adventure',
    tag: 'New',
    remoteUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&q=90',
    localFilename: 'queenstown.jpg'
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    tagline: 'Classical Buddhist temples & cherry blossoms',
    description: 'Ancient capital with thousands of classical Buddhist temples, shrines, and stunning gardens.',
    rating: 4.9,
    duration: '4-8 days',
    price: 'From $999',
    category: 'Cultural',
    tag: 'Popular',
    remoteUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=90',
    localFilename: 'kyoto.jpg'
  },
  {
    city: 'Maldives',
    country: 'Maldives',
    tagline: 'Overwater luxury & turquoise lagoons',
    description: 'Overwater bungalows, crystal-clear lagoons, and the world\'s finest coral reefs.',
    rating: 5.0,
    duration: '5-10 days',
    price: 'From $2,499',
    category: 'Beach',
    tag: 'Luxury',
    remoteUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=90',
    localFilename: 'maldives.jpg'
  },
  {
    city: 'Machu Picchu',
    country: 'Peru',
    tagline: 'Ancient mystery high in the clouds',
    description: 'The lost city of the Incas, hidden high in the Andes mountains of Peru.',
    rating: 4.9,
    duration: '7-12 days',
    price: 'From $1,399',
    category: 'Mountain',
    tag: null,
    remoteUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=90',
    localFilename: 'machupicchu.jpg'
  },
  {
    city: 'Dubai',
    country: 'UAE',
    tagline: 'Futuristic skyline & desert adventures',
    description: 'Futuristic skyline, luxury shopping, and desert adventures in one glittering city.',
    rating: 4.7,
    duration: '4-8 days',
    price: 'From $1,099',
    category: 'City',
    tag: 'Trending',
    remoteUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=90',
    localFilename: 'dubai.jpg'
  },
  {
    city: 'Cape Town',
    country: 'South Africa',
    tagline: 'Where mountains meet dramatic oceans',
    description: 'Where mountains meet the ocean — vineyards, safaris, and stunning coastal drives.',
    rating: 4.8,
    duration: '7-14 days',
    price: 'From $1,199',
    category: 'Adventure',
    tag: null,
    remoteUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1600&q=90',
    localFilename: 'capetown.jpg'
  },
  {
    city: 'Rome',
    country: 'Italy',
    tagline: 'History, beauty, and culinary magic',
    description: 'The Eternal City featuring ancient Roman ruins, world-class pasta, and timeless art.',
    rating: 4.8,
    duration: '5-7 days',
    price: 'From $949',
    category: 'Cultural',
    tag: 'Popular',
    remoteUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=90',
    localFilename: 'rome.jpg'
  },
  {
    city: 'Reykjavik',
    country: 'Iceland',
    tagline: 'Land of fire, ice, and aurora skies',
    description: 'Volcanic landscapes, natural geothermal hot springs, cascading waterfalls, and northern lights.',
    rating: 4.9,
    duration: '6-9 days',
    price: 'From $1,249',
    category: 'Mountain',
    tag: 'Trending',
    remoteUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1600&q=90',
    localFilename: 'reykjavik.jpg'
  }
]

const PACKAGE_SEEDS = [
  {
    tag: 'Best Seller',
    tagColor: 'bg-amber-400 text-black',
    title: 'Bali Paradise Escape',
    subtitle: 'Ubud • Seminyak • Uluwatu',
    price: 12500000,
    originalPrice: 15500000,
    duration: '8 Hari 7 Malam',
    groupSize: '2-12 Orang',
    rating: 4.9,
    reviews: 248,
    includes: ['Tiket Pesawat PP', 'Resort Bintang 5', 'Tur Private Ubud', 'Sarapan & Makan Malam'],
    highlight: 'Tur pura bersejarah & teras terasering Ubud',
    category: 'Beach',
    slug: 'bali-paradise-escape',
    remoteUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=90',
    localFilename: 'bali_escape.jpg'
  },
  {
    tag: 'New Offer',
    tagColor: 'bg-emerald-400 text-black',
    title: 'Japan Cherry Blossom Tour',
    subtitle: 'Tokyo • Kyoto • Osaka',
    price: 28500000,
    originalPrice: 32000000,
    duration: '12 Hari 11 Malam',
    groupSize: '2-8 Orang',
    rating: 4.8,
    reviews: 184,
    includes: ['Tiket Pesawat PP', 'Hotel Bintang 4', 'JR Shinkansen Pass', 'Tour Guide Bahasa Indonesia'],
    highlight: 'Pengalaman festival Bunga Sakura & Kuil Kuno',
    category: 'City',
    slug: 'japan-cherry-blossom',
    remoteUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=90',
    localFilename: 'japan_blossom.jpg'
  },
  {
    tag: 'Luxury Suite',
    tagColor: 'bg-violet-400 text-white',
    title: 'Santorini Sunsets Villa',
    subtitle: 'Oia • Fira • Akrotiri',
    price: 36000000,
    originalPrice: 42000000,
    duration: '7 Hari 6 Malam',
    groupSize: '2 Orang',
    rating: 4.9,
    reviews: 132,
    includes: ['Tiket Pesawat PP', 'Private Villa Cliffside', 'Private Wine Tasting', 'Sunset Yacht Cruise'],
    highlight: 'Private Villa dengan pemandangan Caldera Santorini',
    category: 'Beach',
    slug: 'santorini-sunsets-villa',
    remoteUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90',
    localFilename: 'santorini_villa.jpg'
  },
  {
    tag: 'Adventure',
    tagColor: 'bg-orange-400 text-black',
    title: 'Swiss Alps Ski & Mountain Experience',
    subtitle: 'Zermatt • Interlaken • Zurich',
    price: 45000000,
    originalPrice: 52000000,
    duration: '9 Hari 8 Malam',
    groupSize: '2-6 Orang',
    rating: 4.9,
    reviews: 96,
    includes: ['Tiket Pesawat PP', 'Chalet Resort', 'Swiss Travel Pass', 'Ski Pass & Gear Rental'],
    highlight: 'Kereta gantung Matterhorn & pemandangan Alpine spektakuler',
    category: 'Mountain',
    slug: 'swiss-alps-experience',
    remoteUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1600&q=90',
    localFilename: 'swiss_ski.jpg'
  },
  {
    tag: 'Overwater Luxury',
    tagColor: 'bg-sky-400 text-black',
    title: 'Maldives Overwater Resort Luxury',
    subtitle: 'North Malé • Baa Atoll',
    price: 52000000,
    originalPrice: 60000000,
    duration: '6 Hari 5 Malam',
    groupSize: '2 Orang',
    rating: 5.0,
    reviews: 211,
    includes: ['Tiket Pesawat PP', 'Overwater Villa Private Pool', 'Seaplane Transfer', 'All Inclusive Meals & Diving'],
    highlight: 'Villa terapung & menyelam di UNESCO Biosphere Reserve',
    category: 'Beach',
    slug: 'maldives-overwater-luxury',
    remoteUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=90',
    localFilename: 'maldives_luxury.jpg'
  },
  {
    tag: 'Cultural Heritage',
    tagColor: 'bg-rose-400 text-white',
    title: 'Paris & French Riviera Romantic Getaway',
    subtitle: 'Paris • Nice • Cannes',
    price: 31000000,
    originalPrice: 35000000,
    duration: '8 Hari 7 Malam',
    groupSize: '2 Orang',
    rating: 4.8,
    reviews: 167,
    includes: ['Tiket Pesawat PP', 'Hotel Boutique Bintang 4', 'Eiffel Dinner Cruise', 'TGV First Class Train'],
    highlight: 'Makan malam romantis di Menara Eiffel & Pantai Nice',
    category: 'City',
    slug: 'paris-french-riviera',
    remoteUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=90',
    localFilename: 'paris_getaway.jpg'
  }
]

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject)
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close(() => resolve())
      })
    }).on('error', (err) => {
      fs.unlink(destPath, () => {})
      reject(err)
    })
  })
}

async function main() {
  console.log('🚀 Starting Pexels & Unsplash photo downloader & DB seeder...')

  const destDir = path.join(process.cwd(), 'public', 'uploads', 'destinations')
  const pkgDir = path.join(process.cwd(), 'public', 'uploads', 'packages')
  const dataDir = path.join(process.cwd(), 'data')

  fs.mkdirSync(destDir, { recursive: true })
  fs.mkdirSync(pkgDir, { recursive: true })
  fs.mkdirSync(dataDir, { recursive: true })

  // 1. Process Destinations
  const processedDestinations = []
  for (const item of DESTINATION_SEEDS) {
    const localFilePath = path.join(destDir, item.localFilename)
    const publicUrl = `/uploads/destinations/${item.localFilename}`

    try {
      console.log(`Downloading destination photo for ${item.city}...`)
      await downloadFile(item.remoteUrl, localFilePath)
      console.log(`✅ Downloaded: ${publicUrl}`)
    } catch (err) {
      console.error(`⚠️ Failed to download ${item.city}, using fallback remote URL:`, err)
    }

    const record = {
      city: item.city,
      country: item.country,
      tagline: item.tagline,
      description: item.description,
      rating: item.rating,
      duration: item.duration,
      price: item.price,
      category: item.category,
      tag: item.tag,
      image: fs.existsSync(localFilePath) ? publicUrl : item.remoteUrl
    }
    processedDestinations.push(record)
  }

  // 2. Process Packages
  const processedPackages = []
  for (const item of PACKAGE_SEEDS) {
    const localFilePath = path.join(pkgDir, item.localFilename)
    const publicUrl = `/uploads/packages/${item.localFilename}`

    try {
      console.log(`Downloading package photo for ${item.title}...`)
      await downloadFile(item.remoteUrl, localFilePath)
      console.log(`✅ Downloaded: ${publicUrl}`)
    } catch (err) {
      console.error(`⚠️ Failed to download ${item.title}:`, err)
    }

    const record = {
      tag: item.tag,
      tagColor: item.tagColor,
      title: item.title,
      subtitle: item.subtitle,
      price: item.price,
      originalPrice: item.originalPrice,
      duration: item.duration,
      groupSize: item.groupSize,
      rating: item.rating,
      reviews: item.reviews,
      includes: JSON.stringify(item.includes),
      highlight: item.highlight,
      category: item.category,
      slug: item.slug,
      image: fs.existsSync(localFilePath) ? publicUrl : item.remoteUrl
    }
    processedPackages.push(record)
  }

  // Save to local JSON files
  fs.writeFileSync(path.join(dataDir, 'destinations.json'), JSON.stringify(processedDestinations, null, 2), 'utf-8')
  fs.writeFileSync(path.join(dataDir, 'packages.json'), JSON.stringify(processedPackages, null, 2), 'utf-8')
  console.log('✅ Saved local JSON stores in data/destinations.json & data/packages.json')

  // Seed Supabase Database
  try {
    console.log('Syncing data to Supabase database...')

    // Upsert Destinations
    for (const d of processedDestinations) {
      const { data: existing } = await supabase.from('Destination').select('id').eq('city', d.city).limit(1).single()
      if (existing) {
        await supabase.from('Destination').update(d).eq('id', existing.id)
      } else {
        await supabase.from('Destination').insert(d)
      }
    }

    // Upsert Packages
    for (const p of processedPackages) {
      const { data: existing } = await supabase.from('Package').select('id').eq('slug', p.slug).limit(1).single()
      if (existing) {
        await supabase.from('Package').update(p).eq('id', existing.id)
      } else {
        await supabase.from('Package').insert(p)
      }
    }

    console.log('🎉 Successfully seeded Supabase Database with high-res downloaded photos!')
  } catch (err) {
    console.error('Database sync note (local JSON ready):', err)
  }
}

main().catch(console.error)
