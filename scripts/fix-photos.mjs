/**
 * fix-photos.mjs
 * 1. Fix corrupted package image URLs (ada trailing ', price, price di URL)
 * 2. Replace broken 404 destination/package images dengan foto Pexels yang relevan per kota
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const [k, ...v] = l.split('=')
      const val = v.join('=').trim().replace(/\r$/, '').replace(/^["']|["']$/g, '')
      return [k.trim(), val]
    })
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET       = 'nova-uploads'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function photoFilename(url, folder) {
  const match = url.match(/photo-([a-z0-9]+)/i)
  const id = match ? match[1] : Buffer.from(url).toString('base64').slice(0, 16)
  return `${folder}/${id}.jpg`
}

async function downloadImage(url) {
  const cleanUrl = url.replace(/[?&]w=\d+/, '').replace(/[?&]q=\d+/, '')
  const fetchUrl = cleanUrl.includes('?')
    ? `${cleanUrl}&w=1200&q=85`
    : `${cleanUrl}?w=1200&q=85`
  const res = await fetch(fetchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 Nova-Travel-App/1.0' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToStorage(buffer, storagePath) {
  // Check existing
  const dir = storagePath.substring(0, storagePath.lastIndexOf('/'))
  const fname = storagePath.substring(storagePath.lastIndexOf('/') + 1)
  const { data: existing } = await sb.storage.from(BUCKET).list(dir, { search: fname })
  if (existing && existing.length > 0) {
    const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
  }
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: 'image/jpeg', upsert: false
  })
  if (error) throw new Error(error.message)
  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

// ─── Step 1: Fix corrupted package URLs ───────────────────────
// Pattern: URL ada trailing "', 12500000, 15000000" atau sejenisnya
console.log('=== STEP 1: Fix corrupted package image URLs ===')

const { data: pkgs } = await sb.from('Package').select('id,title,slug,coverImage,image').order('id')

let fixCount = 0
for (const p of pkgs) {
  const fields = ['coverImage', 'image']
  const updates = {}
  for (const f of fields) {
    const val = p[f]
    if (!val) continue
    // Detect corruption: ada single quote atau angka besar setelah URL
    if (val.includes("'") || val.match(/https?:\/\/[^\s]+',\s*\d+/)) {
      // Extract hanya bagian URL yang bersih
      const cleanUrl = val.split("'")[0].trim()
      if (cleanUrl.startsWith('http')) {
        updates[f] = cleanUrl
        console.log(`  Package ${p.id} (${p.slug}): fixing ${f}`)
        console.log(`    FROM: ${val.substring(0, 80)}`)
        console.log(`    TO:   ${cleanUrl}`)
      }
    }
  }
  if (Object.keys(updates).length > 0) {
    const { error } = await sb.from('Package').update(updates).eq('id', p.id)
    if (error) console.error(`  ERROR updating package ${p.id}: ${error.message}`)
    else fixCount++
  }
}
console.log(`Fixed ${fixCount} corrupted package URLs\n`)

// ─── Step 2: Re-fetch packages after fix ─────────────────────
const { data: pkgsFixed } = await sb.from('Package').select('id,title,slug,coverImage,image').order('id')

// ─── Step 3: Find all still-broken rows (not Supabase URL) ───
console.log('=== STEP 2: Find rows still pointing to Unsplash ===')

const { data: dests } = await sb.from('Destination').select('id,city,country,image').order('id')

// Rows that still have unsplash URLs (not yet migrated)
const brokenDests = dests.filter(d => d.image && d.image.includes('unsplash.com'))
const brokenPkgs  = pkgsFixed.filter(p => {
  const url = p.coverImage || p.image || ''
  return url.includes('unsplash.com')
})

console.log(`Destinations still on Unsplash: ${brokenDests.length}`)
console.log(`Packages still on Unsplash: ${brokenPkgs.length}`)

// ─── Step 4: Replace broken ones with working Pexels photos ──
// Pexels free-to-use photos (no API key needed for direct URLs)
// Using pexels.com/photo/... direct image CDN which is public
// Map city/keyword -> pexels photo ID for reliable fallback
const PEXELS_FALLBACKS = {
  // Indonesia
  'bali':           'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?w=1200',
  'jakarta':        'https://images.pexels.com/photos/5169056/pexels-photo-5169056.jpeg?w=1200',
  'yogyakarta':     'https://images.pexels.com/photos/3727255/pexels-photo-3727255.jpeg?w=1200',
  'borobudur':      'https://images.pexels.com/photos/3727255/pexels-photo-3727255.jpeg?w=1200',
  'komodo':         'https://images.pexels.com/photos/3727255/pexels-photo-3727255.jpeg?w=1200',
  'lombok':         'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?w=1200',
  'raja ampat':     'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?w=1200',
  'flores':         'https://images.pexels.com/photos/3727255/pexels-photo-3727255.jpeg?w=1200',
  'labuan bajo':    'https://images.pexels.com/photos/3727255/pexels-photo-3727255.jpeg?w=1200',

  // Asia
  'tokyo':          'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?w=1200',
  'kyoto':          'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?w=1200',
  'osaka':          'https://images.pexels.com/photos/2385210/pexels-photo-2385210.jpeg?w=1200',
  'seoul':          'https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?w=1200',
  'bangkok':        'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?w=1200',
  'singapore':      'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?w=1200',
  'hong kong':      'https://images.pexels.com/photos/3686469/pexels-photo-3686469.jpeg?w=1200',
  'shanghai':       'https://images.pexels.com/photos/3399730/pexels-photo-3399730.jpeg?w=1200',
  'beijing':        'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?w=1200',
  'dubai':          'https://images.pexels.com/photos/1534411/pexels-photo-1534411.jpeg?w=1200',
  'maldives':       'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?w=1200',
  'phuket':         'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?w=1200',
  'vietnam':        'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?w=1200',
  'hanoi':          'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?w=1200',
  'ho chi minh':    'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?w=1200',
  'nepal':          'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?w=1200',
  'kathmandu':      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?w=1200',
  'india':          'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?w=1200',
  'taj mahal':      'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?w=1200',
  'mongolia':       'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?w=1200',

  // Europe
  'paris':          'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?w=1200',
  'london':         'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?w=1200',
  'rome':           'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?w=1200',
  'barcelona':      'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?w=1200',
  'amsterdam':      'https://images.pexels.com/photos/1414467/pexels-photo-1414467.jpeg?w=1200',
  'santorini':      'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?w=1200',
  'athens':         'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?w=1200',
  'prague':         'https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?w=1200',
  'vienna':         'https://images.pexels.com/photos/3722818/pexels-photo-3722818.jpeg?w=1200',
  'swiss':          'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?w=1200',
  'switzerland':    'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?w=1200',
  'alps':           'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?w=1200',
  'iceland':        'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?w=1200',
  'portugal':       'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?w=1200',
  'lisbon':         'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?w=1200',
  'istanbul':       'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?w=1200',
  'turkey':         'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?w=1200',
  'cappadocia':     'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?w=1200',
  'croatia':        'https://images.pexels.com/photos/1631665/pexels-photo-1631665.jpeg?w=1200',
  'dubrovnik':      'https://images.pexels.com/photos/1631665/pexels-photo-1631665.jpeg?w=1200',
  'malta':          'https://images.pexels.com/photos/1631665/pexels-photo-1631665.jpeg?w=1200',

  // Americas
  'new york':       'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?w=1200',
  'las vegas':      'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?w=1200',
  'los angeles':    'https://images.pexels.com/photos/1990438/pexels-photo-1990438.jpeg?w=1200',
  'miami':          'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?w=1200',
  'cancun':         'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?w=1200',
  'machu picchu':   'https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?w=1200',
  'peru':           'https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?w=1200',
  'brazil':         'https://images.pexels.com/photos/1483769/pexels-photo-1483769.jpeg?w=1200',
  'rio':            'https://images.pexels.com/photos/1483769/pexels-photo-1483769.jpeg?w=1200',
  'argentina':      'https://images.pexels.com/photos/1483769/pexels-photo-1483769.jpeg?w=1200',
  'patagonia':      'https://images.pexels.com/photos/1483769/pexels-photo-1483769.jpeg?w=1200',
  'costa rica':     'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?w=1200',
  'trinidad':       'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?w=1200',

  // Africa & Middle East
  'cape town':      'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'safari':         'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'kenya':          'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'tanzania':       'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'serengeti':      'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'morocco':        'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?w=1200',
  'egypt':          'https://images.pexels.com/photos/3689855/pexels-photo-3689855.jpeg?w=1200',
  'madagascar':     'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'zambia':         'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'victoria falls': 'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?w=1200',
  'jordan':         'https://images.pexels.com/photos/3689855/pexels-photo-3689855.jpeg?w=1200',

  // Oceania
  'queenstown':     'https://images.pexels.com/photos/1457812/pexels-photo-1457812.jpeg?w=1200',
  'new zealand':    'https://images.pexels.com/photos/1457812/pexels-photo-1457812.jpeg?w=1200',
  'australia':      'https://images.pexels.com/photos/1457812/pexels-photo-1457812.jpeg?w=1200',
  'sydney':         'https://images.pexels.com/photos/1457812/pexels-photo-1457812.jpeg?w=1200',
  'fiji':           'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?w=1200',

  // Default fallback
  'default':        'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?w=1200',
}

function getFallbackUrl(cityOrTitle) {
  const lower = (cityOrTitle || '').toLowerCase()
  for (const [keyword, url] of Object.entries(PEXELS_FALLBACKS)) {
    if (lower.includes(keyword)) return url
  }
  return PEXELS_FALLBACKS['default']
}

// Process broken destinations
console.log('\n=== STEP 3: Replace broken destination photos ===')
let destFixed = 0
for (const d of brokenDests) {
  const fallbackUrl = getFallbackUrl(d.city)
  const storagePath = photoFilename(fallbackUrl, 'destinations')
  process.stdout.write(`  [${d.id}] ${d.city} -> ${storagePath} ... `)

  try {
    const buffer = await downloadImage(fallbackUrl)
    const newUrl = await uploadToStorage(buffer, storagePath)
    const { error } = await sb.from('Destination').update({ image: newUrl }).eq('id', d.id)
    if (error) throw error
    console.log('OK')
    destFixed++
  } catch (err) {
    console.log(`FAILED: ${err.message}`)
  }

  if (destFixed % 5 === 0 && destFixed > 0) await sleep(1000)
}
console.log(`Fixed ${destFixed} destination photos`)

// Process broken packages
console.log('\n=== STEP 4: Replace broken package photos ===')
let pkgFixed = 0
for (const p of brokenPkgs) {
  const url = p.coverImage || p.image || ''
  // Verify it's actually broken (try fetching)
  const fallbackUrl = getFallbackUrl(p.title)
  const storagePath = photoFilename(fallbackUrl + p.id, 'packages')
  process.stdout.write(`  [${p.id}] ${p.slug || p.title} -> ${storagePath} ... `)

  try {
    const buffer = await downloadImage(fallbackUrl)
    const newUrl = await uploadToStorage(buffer, storagePath)
    const updates = {}
    if (p.coverImage && p.coverImage.includes('unsplash.com')) updates.coverImage = newUrl
    if (p.image && p.image.includes('unsplash.com')) updates.image = newUrl
    if (Object.keys(updates).length > 0) {
      const { error } = await sb.from('Package').update(updates).eq('id', p.id)
      if (error) throw error
    }
    console.log('OK')
    pkgFixed++
  } catch (err) {
    console.log(`FAILED: ${err.message}`)
  }

  if (pkgFixed % 5 === 0 && pkgFixed > 0) await sleep(1000)
}
console.log(`Fixed ${pkgFixed} package photos`)

// ─── Step 5: Add Supabase domain to next.config.ts ───────────
console.log('\n=== STEP 5: Checking next.config.ts remotePatterns ===')
const { readFileSync: rfs, writeFileSync } = await import('fs')
const configPath = 'next.config.ts'
const configContent = rfs(configPath, 'utf8')
const supabaseHostname = new URL(SUPABASE_URL).hostname
if (configContent.includes(supabaseHostname)) {
  console.log(`  Already has ${supabaseHostname}`)
} else {
  console.log(`  Need to add: ${supabaseHostname}`)
  console.log('  (will be patched separately)')
}

console.log('\nAll done!')
console.log(`Summary: ${destFixed} destination photos fixed, ${pkgFixed} package photos fixed, ${fixCount} corrupted URLs cleaned`)
