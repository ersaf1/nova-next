/**
 * migrate-photos.mjs
 * Download semua foto dari Unsplash, upload ke Supabase Storage,
 * lalu update kolom image/coverImage di DB.
 *
 * Usage: node scripts/migrate-photos.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ─── Env ─────────────────────────────────────────────────────
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

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── Helpers ─────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

/** Extract unsplash photo id from URL for a stable filename */
function photoFilename(url, folder) {
  const match = url.match(/photo-([a-z0-9]+)/i)
  const id = match ? match[1] : Buffer.from(url).toString('base64').slice(0, 16)
  return `${folder}/${id}.jpg`
}

/** Download image buffer from URL */
async function downloadImage(url) {
  // Ensure we get a reasonably-sized image
  const cleanUrl = url.replace(/[?&]w=\d+/, '').replace(/[?&]q=\d+/, '')
  const fetchUrl = cleanUrl.includes('?') 
    ? `${cleanUrl}&w=1200&q=85` 
    : `${cleanUrl}?w=1200&q=85`
  
  const res = await fetch(fetchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 Nova-Travel-App/1.0' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${fetchUrl}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
}

/** Upload buffer to Supabase Storage, return public URL */
async function uploadToStorage(buffer, storagePath) {
  // Check if already exists
  const { data: existing } = await sb.storage.from(BUCKET).list(
    storagePath.substring(0, storagePath.lastIndexOf('/')),
    { search: storagePath.substring(storagePath.lastIndexOf('/') + 1) }
  )
  if (existing && existing.length > 0) {
    // Already uploaded, just return URL
    const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
  }

  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error(`Upload error: ${error.message}`)

  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  // 1. Fetch all destinations & packages
  const { data: dests, error: e1 } = await sb.from('Destination').select('id,city,country,image').order('id')
  if (e1) throw e1
  const { data: pkgs, error: e2 } = await sb.from('Package').select('id,title,slug,coverImage,image').order('id')
  if (e2) throw e2

  console.log(`Loaded ${dests.length} destinations, ${pkgs.length} packages`)

  // 2. Build deduplicated map: oldUrl -> { storagePath, newUrl, destIds[], pkgIds[] }
  const urlMap = new Map() // oldUrl -> { storagePath, newUrl, destIds, pkgIds }

  for (const d of dests) {
    const url = d.image
    if (!url || !url.startsWith('http')) continue
    if (!urlMap.has(url)) urlMap.set(url, { storagePath: photoFilename(url, 'destinations'), newUrl: null, destIds: [], pkgIds: [] })
    urlMap.get(url).destIds.push(d.id)
  }

  for (const p of pkgs) {
    const url = p.coverImage || p.image
    if (!url || !url.startsWith('http')) continue
    const key = url
    if (!urlMap.has(key)) urlMap.set(key, { storagePath: photoFilename(url, 'packages'), newUrl: null, destIds: [], pkgIds: [] })
    urlMap.get(key).pkgIds.push(p.id)
  }

  const entries = [...urlMap.entries()]
  console.log(`\nTotal unique photos: ${entries.length}`)
  console.log('Starting download + upload...\n')

  let done = 0
  let failed = 0
  const failedUrls = []

  for (const [oldUrl, info] of entries) {
    done++
    process.stdout.write(`[${done}/${entries.length}] ${info.storagePath} ... `)

    try {
      const buffer = await downloadImage(oldUrl)
      const newUrl = await uploadToStorage(buffer, info.storagePath)
      info.newUrl = newUrl
      console.log(`OK (${(buffer.length / 1024).toFixed(0)}KB)`)
    } catch (err) {
      failed++
      failedUrls.push({ url: oldUrl, error: err.message })
      console.log(`FAILED: ${err.message}`)
    }

    // Rate limit: 5 requests/sec max
    if (done % 5 === 0) await sleep(1000)
  }

  console.log(`\nDownload+Upload done: ${done - failed} success, ${failed} failed`)

  // 3. Update DB rows
  console.log('\nUpdating database...')

  let destUpdated = 0
  let pkgUpdated = 0

  for (const [oldUrl, info] of urlMap.entries()) {
    if (!info.newUrl) continue // skip failed

    // Update destinations
    if (info.destIds.length > 0) {
      const { error } = await sb.from('Destination')
        .update({ image: info.newUrl })
        .in('id', info.destIds)
      if (error) {
        console.error(`Failed to update destination ids ${info.destIds}: ${error.message}`)
      } else {
        destUpdated += info.destIds.length
      }
    }

    // Update packages — update both coverImage and image if they match
    if (info.pkgIds.length > 0) {
      // Update coverImage where coverImage matches
      const { data: pkgCover } = await sb.from('Package')
        .select('id,coverImage,image')
        .in('id', info.pkgIds)

      for (const p of (pkgCover ?? [])) {
        const updates = {}
        if (p.coverImage === oldUrl) updates.coverImage = info.newUrl
        if (p.image === oldUrl) updates.image = info.newUrl
        if (Object.keys(updates).length === 0) continue

        const { error } = await sb.from('Package').update(updates).eq('id', p.id)
        if (error) {
          console.error(`Failed to update package ${p.id}: ${error.message}`)
        } else {
          pkgUpdated++
        }
      }
    }
  }

  console.log(`\nDB updated: ${destUpdated} destination rows, ${pkgUpdated} package rows`)

  if (failedUrls.length > 0) {
    console.log('\nFailed URLs:')
    failedUrls.forEach(f => console.log(`  ${f.url}\n    -> ${f.error}`))
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
