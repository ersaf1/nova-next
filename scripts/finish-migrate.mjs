// Fix Egypt packages dan run migrate sisa Unsplash packages
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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const BUCKET = 'nova-uploads'

async function downloadImage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Nova-Travel-App/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToStorage(buffer, storagePath) {
  const dir = storagePath.substring(0, storagePath.lastIndexOf('/'))
  const fname = storagePath.substring(storagePath.lastIndexOf('/') + 1)
  const { data: existing } = await sb.storage.from(BUCKET).list(dir, { search: fname })
  if (existing && existing.length > 0) {
    const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
  }
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(error.message)
  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

// Fix Egypt packages (58, 83) - pakai foto pyramid dari Pexels yang berbeda
const EGYPT_URL = 'https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg?w=1200'
console.log('Fixing Egypt packages 58 & 83...')
try {
  const buf = await downloadImage(EGYPT_URL)
  const newUrl = await uploadToStorage(buf, 'packages/egypt-71241.jpg')
  const { error } = await sb.from('Package').update({ image: newUrl }).in('id', [58, 83])
  if (error) throw error
  console.log(`Fixed: ${newUrl}`)
} catch (err) {
  console.log(`Egypt fix failed: ${err.message}`)
}

// Run migrate untuk semua package yang masih Unsplash (90 package yang URL-nya sudah dibersihkan tapi belum diupload)
console.log('\nMigrating remaining Unsplash package URLs to Supabase...')
const { data: pkgs } = await sb.from('Package').select('id,title,slug,coverImage,image').order('id')
const remaining = pkgs.filter(p => {
  const url = p.coverImage || p.image || ''
  return url.includes('unsplash.com')
})
console.log(`Remaining Unsplash packages: ${remaining.length}`)

// Build URL->storage map, deduplicated
const urlMap = new Map()
for (const p of remaining) {
  const url = p.coverImage || p.image || ''
  if (!url.startsWith('http')) continue
  const match = url.match(/photo-([a-z0-9]+)/i)
  const id = match ? match[1] : Buffer.from(url).toString('base64').slice(0, 16)
  const storagePath = `packages/${id}.jpg`
  if (!urlMap.has(url)) urlMap.set(url, { storagePath, newUrl: null, pkgIds: [] })
  urlMap.get(url).pkgIds.push(p.id)
}

let done = 0
for (const [oldUrl, info] of urlMap.entries()) {
  done++
  process.stdout.write(`[${done}/${urlMap.size}] ${info.storagePath}...`)
  try {
    const cleanUrl = oldUrl.replace(/[?&]w=\d+/, '').replace(/[?&]q=\d+/, '')
    const fetchUrl = cleanUrl.includes('?') ? `${cleanUrl}&w=1200&q=85` : `${cleanUrl}?w=1200&q=85`
    const buf = await downloadImage(fetchUrl)
    const newUrl = await uploadToStorage(buf, info.storagePath)
    info.newUrl = newUrl

    // Update all pkg rows using this URL
    const { data: pkgRows } = await sb.from('Package').select('id,coverImage,image').in('id', info.pkgIds)
    for (const p of (pkgRows ?? [])) {
      const updates = {}
      if (p.coverImage === oldUrl) updates.coverImage = newUrl
      if (p.image === oldUrl) updates.image = newUrl
      if (Object.keys(updates).length > 0) {
        await sb.from('Package').update(updates).eq('id', p.id)
      }
    }
    console.log(' OK')
  } catch (err) {
    console.log(` FAILED: ${err.message}`)
  }
  if (done % 5 === 0) await new Promise(r => setTimeout(r, 1000))
}

// Verify final state
const { data: final } = await sb.from('Package').select('id,coverImage,image').order('id')
const stillUnsplash = final.filter(p => (p.coverImage || p.image || '').includes('unsplash.com'))
console.log(`\nFinal check: ${stillUnsplash.length} packages still on Unsplash`)
if (stillUnsplash.length > 0) {
  stillUnsplash.forEach(p => console.log(`  [${p.id}] cover:${p.coverImage?.substring(0,60)} img:${p.image?.substring(0,60)}`))
}

const { data: finalD } = await sb.from('Destination').select('id,image').order('id')
const stillUnsplashD = finalD.filter(d => (d.image || '').includes('unsplash.com'))
console.log(`Final check: ${stillUnsplashD.length} destinations still on Unsplash`)

console.log('\nDone!')
