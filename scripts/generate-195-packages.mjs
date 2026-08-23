import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

// 1. Load Environment Variables from .env
const envFile = readFileSync('.env', 'utf8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const [k, ...v] = l.split('=')
      const val = v.join('=').trim().replace(/\r$/, '').replace(/^["']|["']$/g, '')
      return [k.trim(), val]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// 2. Load Local Data Sources
const destinationsFile = path.join(process.cwd(), 'data', 'destinations.json')
const packagesFile = path.join(process.cwd(), 'data', 'packages.json')
const departuresFile = path.join(process.cwd(), 'data', 'departures.json')

const destinations = JSON.parse(readFileSync(destinationsFile, 'utf8'))
const existingPackages = JSON.parse(readFileSync(packagesFile, 'utf8'))
let existingDepartures = []
try {
  existingDepartures = JSON.parse(readFileSync(departuresFile, 'utf8'))
} catch {
  existingDepartures = []
}

// 3. Helper Functions
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function parsePrice(priceStr) {
  const match = priceStr.match(/\d+/g)
  if (match) {
    const usd = parseInt(match.join(''), 10)
    // Convert to IDR with Rp15,000 rate, round to nearest Rp50,000
    const idr = usd * 15000
    return Math.round(idr / 50000) * 50000
  }
  return 9500000 // default fallback
}

function parseDuration(durationStr) {
  const match = durationStr.match(/(\d+)-(\d+)/)
  if (match) {
    const minDays = parseInt(match[1], 10)
    const maxDays = parseInt(match[2], 10)
    const averageDays = Math.round((minDays + maxDays) / 2)
    return {
      days: averageDays,
      nights: averageDays - 1,
      str: `${averageDays} Hari ${averageDays - 1} Malam`
    }
  }
  const singleMatch = durationStr.match(/(\d+)/)
  if (singleMatch) {
    const days = parseInt(singleMatch[1], 10)
    return {
      days,
      nights: days - 1,
      str: `${days} Hari ${days - 1} Malam`
    }
  }
  return { days: 7, nights: 6, str: "7 Hari 6 Malam" } // fallback
}

function generateTitle(city, country, category, index) {
  const cleanCity = city.split('&')[0].trim().split(',')[0].trim()
  const alt = index % 2 === 0
  
  switch(category) {
    case 'Beach':
      return alt ? `Pesona Pantai ${cleanCity}` : `Eksotika Bahari ${country}`
    case 'Mountain':
      return alt ? `Petualangan Puncak ${cleanCity}` : `Jelajah Pegunungan ${country}`
    case 'Cultural':
    case 'Culture':
      return alt ? `Warisan Budaya ${cleanCity}` : `Jelajah Sejarah & Budaya ${country}`
    case 'City':
      return alt ? `Metro Tour ${cleanCity}` : `Eksplorasi Kota Modern ${country}`
    case 'Adventure':
      return alt ? `Ekspedisi Seru ${cleanCity}` : `Petualangan Ekstrim ${country}`
    case 'Nature':
      return alt ? `Jelajah Alam Liar ${cleanCity}` : `Pesona Alam Asri ${country}`
    default:
      return alt ? `Pesona Keindahan ${cleanCity}` : `Paket Wisata Spesial ${country}`
  }
}

function generateIncludes(category) {
  const base = ["Tiket Pesawat PP", "Hotel Bintang 4", "Sarapan Pagi", "Private Tour Guide"]
  switch(category) {
    case 'Beach':
      return [...base, "Peralatan Snorkeling", "Sunset Yacht Cruise"]
    case 'Mountain':
      return [...base, "Tiket Kereta Gantung", "Peralatan Mendaki Standard"]
    case 'Cultural':
    case 'Culture':
      return [...base, "Tiket Masuk Candi & Museum", "Makan Malam Tradisional"]
    case 'City':
      return [...base, "Tiket Bus Hop-On Hop-Off", "Kartu Akses Subway"]
    case 'Adventure':
      return [...base, "Peralatan Safety Lengkap", "Asuransi Perjalanan Ekstrim"]
    case 'Nature':
      return [...base, "Tiket Masuk Taman Nasional", "Sewa Kamera DSLR/Mirrorless"]
    default:
      return [...base, "Dokumentasi Perjalanan"]
  }
}

// 4. Seeding Logic
async function main() {
  console.log('🚀 Starting package generation for all 195 countries...')

  // 1. Clean and format destinations for Supabase (removing tagline and id columns to respect identity columns)
  const cleanDestinations = destinations.map((d) => ({
    city: d.city,
    country: d.country,
    image: d.image,
    description: d.description || `${d.tagline}. Jelajahi keindahan panorama ${d.city} di ${d.country} dengan paket perjalanan eksklusif NOVA.`,
    rating: Number(d.rating),
    duration: d.duration,
    price: d.price,
    category: d.category,
    name: d.city,
    slug: slugify(d.city)
  }))

  console.log('Syncing destinations to Supabase...')
  for (let i = 0; i < cleanDestinations.length; i += 50) {
    const chunk = cleanDestinations.slice(i, i + 50)
    const { error } = await supabase
      .from('Destination')
      .upsert(chunk, { onConflict: 'slug' })
    if (error) {
      console.error(`❌ Error upserting destinations chunk ${i}:`, error.message)
      process.exit(1)
    }
  }
  console.log('✓ Successfully synced 195 destinations to Supabase.')

  // Fetch all destinations from Supabase to ensure accurate database IDs (PK/FK)
  const { data: dbDestinations, error: destError } = await supabase
    .from('Destination')
    .select('id, city, country')
  if (destError) {
    console.error('❌ Error fetching destinations from database:', destError.message)
    process.exit(1)
  }
  console.log(`✓ Fetched ${dbDestinations.length} destinations from Supabase.`)

  // Create a map from country/city to DB ID
  const destDbMap = new Map()
  for (const d of dbDestinations) {
    const key = `${d.country.toLowerCase()}|${d.city.toLowerCase()}`
    destDbMap.set(key, d.id)
  }

  const getDestDbId = (country, city) => {
    const key = `${country.toLowerCase()}|${city.toLowerCase()}`
    if (destDbMap.has(key)) return destDbMap.get(key)
    
    // Fallback matching by country name only
    const cleanCountry = country.toLowerCase()
    for (const [k, id] of destDbMap.entries()) {
      if (k.startsWith(`${cleanCountry}|`)) {
        return id
      }
    }
    return null
  }

  const packagesList = []
  const TAGS = ['Best Seller', 'Trending', "Editor's Pick", 'Luxury', 'New Offer', 'Popular']
  const TAG_COLORS = {
    'Best Seller': 'bg-amber-400 text-black',
    'Popular': 'bg-amber-400 text-black',
    'New Offer': 'bg-emerald-400 text-black',
    'Luxury': 'bg-violet-400 text-white',
    'Adventure': 'bg-orange-400 text-black',
    'Trending': 'bg-rose-400 text-white',
    "Editor's Pick": 'bg-sky-400 text-black'
  }

  // Build existing package mapping by country name
  const existingPkgMap = new Map()
  for (const pkg of existingPackages) {
    if (pkg.slug === 'bali-paradise-escape') existingPkgMap.set('Indonesia', pkg)
    else if (pkg.slug === 'japan-cherry-blossom') existingPkgMap.set('Japan', pkg)
    else if (pkg.slug === 'santorini-sunsets-villa') existingPkgMap.set('Greece', pkg)
    else if (pkg.slug === 'swiss-alps-experience') existingPkgMap.set('Switzerland', pkg)
    else if (pkg.slug === 'maldives-overwater-luxury') existingPkgMap.set('Maldives', pkg)
    else if (pkg.slug === 'paris-french-riviera') existingPkgMap.set('France', pkg)
  }

  for (const dest of destinations) {
    const dbId = getDestDbId(dest.country, dest.city)
    if (!dbId) {
      console.warn(`⚠️ Warning: Could not find database ID for ${dest.city}, ${dest.country}. Skipping package.`)
      continue
    }

    const existingPkg = existingPkgMap.get(dest.country)
    let pkgRecord

    if (existingPkg) {
      // Reuse existing hand-crafted package
      let includes = existingPkg.includes
      if (typeof includes === 'string') {
        try { includes = JSON.parse(includes) } catch { includes = [] }
      } else if (!Array.isArray(includes)) {
        includes = []
      }
      
      let gallery = existingPkg.gallery
      if (typeof gallery === 'string') {
        try { gallery = JSON.parse(gallery) } catch { gallery = [] }
      } else if (!Array.isArray(gallery)) {
        gallery = []
      }
      
      let excluded = existingPkg.excluded
      if (typeof excluded === 'string') {
        try { excluded = JSON.parse(excluded) } catch { excluded = [] }
      } else if (!Array.isArray(excluded)) {
        excluded = [
          "Makan siang & malam (kecuali disebutkan)",
          "Pengeluaran pribadi & belanja",
          "Tips driver & local guide",
          "Biaya pembuatan visa (bila diperlukan)"
        ]
      }

      pkgRecord = {
        tag: existingPkg.tag || 'Popular',
        tagColor: existingPkg.tagColor || 'bg-amber-400 text-black',
        title: existingPkg.title,
        subtitle: existingPkg.subtitle || `${dest.city} • ${dest.country}`,
        image: existingPkg.image || dest.image,
        coverImage: existingPkg.coverImage || existingPkg.image || dest.image,
        price: existingPkg.price,
        originalPrice: existingPkg.originalPrice || Math.round(existingPkg.price * 1.2 / 100000) * 100000,
        duration: existingPkg.duration || '8 Hari 7 Malam',
        groupSize: existingPkg.groupSize || '2-12 Orang',
        rating: existingPkg.rating || dest.rating || 4.8,
        reviews: existingPkg.reviews || 150,
        includes: JSON.stringify(includes),
        highlight: existingPkg.highlight || dest.tagline,
        category: existingPkg.category || dest.category,
        slug: existingPkg.slug,
        destinationId: dbId,
        shortDescription: existingPkg.shortDescription || `${dest.tagline}. Jelajahi keindahan panorama ${dest.city} di ${dest.country}.`,
        description: existingPkg.description || `${dest.tagline}. Jelajahi keindahan panorama ${dest.city} di ${dest.country} dengan paket perjalanan eksklusif NOVA.`,
        durationDays: existingPkg.durationDays || parseDuration(existingPkg.duration || '8').days,
        durationNights: existingPkg.durationNights || parseDuration(existingPkg.duration || '8').nights,
        gallery: JSON.stringify(gallery),
        excluded: JSON.stringify(excluded),
        status: 'published'
      }
    } else {
      // Generate package dynamically
      const price = parsePrice(dest.price)
      const originalPrice = Math.round((price * 1.2) / 100000) * 100000
      const durInfo = parseDuration(dest.duration)
      
      const tag = TAGS[dest.id % TAGS.length]
      const tagColor = TAG_COLORS[tag] || 'bg-sky-400 text-black'
      
      const title = generateTitle(dest.city, dest.country, dest.category, dest.id)
      const slug = slugify(title)
      
      const includes = generateIncludes(dest.category)
      const excluded = [
        "Makan siang & malam (kecuali disebutkan)",
        "Pengeluaran pribadi & belanja",
        "Tips driver & local guide",
        "Biaya pembuatan visa (bila diperlukan)"
      ]
      
      pkgRecord = {
        tag,
        tagColor,
        title,
        subtitle: `${dest.city} • ${dest.country}`,
        image: dest.image,
        coverImage: dest.image,
        price,
        originalPrice,
        duration: durInfo.str,
        groupSize: `${2 + (dest.id % 3) * 2}-${8 + (dest.id % 4) * 2} Orang`,
        rating: dest.rating || 4.7,
        reviews: 50 + (dest.id * 7) % 200,
        includes: JSON.stringify(includes),
        highlight: dest.tagline,
        category: dest.category,
        slug,
        destinationId: dbId,
        shortDescription: `${dest.tagline}. Jelajahi keindahan panorama ${dest.city} di ${dest.country}.`,
        description: `${dest.tagline}. Jelajahi keindahan panorama ${dest.city} di ${dest.country} dengan paket perjalanan eksklusif NOVA.`,
        durationDays: durInfo.days,
        durationNights: durInfo.nights,
        gallery: JSON.stringify([]),
        excluded: JSON.stringify(excluded),
        status: 'published'
      }
    }
    packagesList.push(pkgRecord)
  }

  // 5. Generate Departures
  const localDepartures = []
  let depIdCounter = 1

  const existingDepsMap = new Map()
  for (const dep of existingDepartures) {
    const slug = dep.packageSlug
    if (slug) {
      if (!existingDepsMap.has(slug)) {
        existingDepsMap.set(slug, [])
      }
      existingDepsMap.get(slug).push(dep)
    }
  }

  for (const pkg of packagesList) {
    const slug = pkg.slug
    const existingDeps = existingDepsMap.get(slug)
    
    if (existingDeps && existingDeps.length > 0) {
      for (const dep of existingDeps) {
        localDepartures.push({
          id: depIdCounter++,
          packageSlug: slug,
          startDate: dep.startDate,
          endDate: dep.endDate,
          capacity: dep.capacity || 16,
          remainingSlots: dep.remainingSlots !== undefined ? dep.remainingSlots : 10,
          price: dep.price || pkg.price,
          status: dep.status || 'available'
        })
      }
    } else {
      // Generate 5 dynamic departures for 2026/2027
      const startDates = [
        '2026-08-15',
        '2026-09-10',
        '2026-10-05',
        '2026-11-02',
        '2026-12-20'
      ]
      
      for (const startStr of startDates) {
        const startDate = new Date(startStr)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + pkg.durationDays)
        
        const startDateStr = startDate.toISOString().split('T')[0]
        const endDateStr = endDate.toISOString().split('T')[0]
        
        const capacity = 16
        const remainingSlots = Math.floor(Math.random() * 14) + 1
        const status = remainingSlots <= 3 ? 'limited' : 'available'
        
        localDepartures.push({
          id: depIdCounter++,
          packageSlug: slug,
          startDate: startDateStr,
          endDate: endDateStr,
          capacity,
          remainingSlots,
          price: pkg.price,
          status
        })
      }
    }
  }

  // 6. Write JSON files locally
  console.log('Writing local packages.json and departures.json files...')
  const cleanLocalPackages = packagesList.map(p => ({
    ...p,
    includes: JSON.parse(p.includes),
    gallery: JSON.parse(p.gallery),
    excluded: JSON.parse(p.excluded)
  }))

  writeFileSync(packagesFile, JSON.stringify(cleanLocalPackages, null, 2), 'utf8')
  writeFileSync(departuresFile, JSON.stringify(localDepartures, null, 2), 'utf8')
  console.log(`✓ Local JSON files populated with ${cleanLocalPackages.length} packages and ${localDepartures.length} departures.`)

  // 7. Sync database
  console.log('Clearing old PackageDeparture entries in Supabase...')
  const { error: clearError } = await supabase.from('PackageDeparture').delete().neq('id', 0)
  if (clearError) {
    console.warn('⚠️ Warning: Could not clear old departures (likely due to active bookings):', clearError.message)
  } else {
    console.log('✓ Old departures cleared.')
  }

  console.log('Cleaning up old packages from Supabase...')
  const cleanSlugs = new Set(packagesList.map(p => p.slug))
  const { data: currentPkgs, error: fetchPkgsError } = await supabase.from('Package').select('id, slug')
  if (fetchPkgsError) {
    console.error('❌ Error fetching packages for cleanup:', fetchPkgsError.message)
  } else {
    const toDelete = currentPkgs.filter(p => !cleanSlugs.has(p.slug)).map(p => p.id)
    if (toDelete.length > 0) {
      console.log(`Deleting ${toDelete.length} outdated packages...`)
      for (let i = 0; i < toDelete.length; i += 100) {
        const chunk = toDelete.slice(i, i + 100)
        const { error: delError } = await supabase.from('Package').delete().in('id', chunk)
        if (delError) {
          console.warn(`⚠️ Warning: Could not delete old packages chunk:`, delError.message)
        }
      }
      console.log('✓ Old packages cleaned up successfully.')
    } else {
      console.log('✓ No outdated packages to delete.')
    }
  }

  console.log('Upserting packages to Supabase...')
  const dbPackages = []
  for (let i = 0; i < packagesList.length; i += 50) {
    const chunk = packagesList.slice(i, i + 50)
    const { data: upsertedChunk, error } = await supabase
      .from('Package')
      .upsert(chunk, { onConflict: 'slug' })
      .select()
    if (error) {
      console.error('❌ Error upserting packages chunk:', error.message)
      process.exit(1)
    }
    dbPackages.push(...upsertedChunk)
  }
  console.log(`✓ Upserted ${dbPackages.length} packages to Supabase.`)

  const slugToDbIdMap = new Map()
  for (const p of dbPackages) {
    slugToDbIdMap.set(p.slug, p.id)
  }

  // Map local departures to db PackageDeparture structure (using FK packageId)
  const dbDepartures = localDepartures.map(d => {
    const packageId = slugToDbIdMap.get(d.packageSlug)
    return {
      packageId,
      startDate: d.startDate,
      endDate: d.endDate,
      capacity: d.capacity,
      remainingSlots: d.remainingSlots,
      price: d.price,
      status: d.status
    }
  })

  console.log('Inserting departures into Supabase...')
  let insertedDepsCount = 0
  for (let i = 0; i < dbDepartures.length; i += 100) {
    const chunk = dbDepartures.slice(i, i + 100)
    const { error } = await supabase.from('PackageDeparture').insert(chunk)
    if (error) {
      console.error('❌ Error inserting departures chunk:', error.message)
      process.exit(1)
    }
    insertedDepsCount += chunk.length
  }
  console.log(`✓ Inserted ${insertedDepsCount} departures into Supabase.`)
  console.log('🎉 Database and local seed successfully updated with 195 packages and departures!')
}

main().catch(console.error)
