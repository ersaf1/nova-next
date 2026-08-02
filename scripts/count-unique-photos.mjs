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

// Destinations unique images
const { data: dests } = await sb.from('Destination').select('id,city,country,image').order('id')
const destImgMap = new Map() // url -> [ids]
for (const d of dests) {
  const url = d.image || ''
  if (!destImgMap.has(url)) destImgMap.set(url, [])
  destImgMap.get(url).push(d.id)
}
const destUnique = [...destImgMap.keys()].filter(u => u.startsWith('http'))
console.log(`Destinations: ${dests.length} rows, ${destUnique.length} unique photos`)

// Packages unique images
const { data: pkgs } = await sb.from('Package').select('id,title,slug,coverImage,image').order('id')
const pkgImgMap = new Map()
for (const p of pkgs) {
  const url = p.coverImage || p.image || ''
  if (!pkgImgMap.has(url)) pkgImgMap.set(url, [])
  pkgImgMap.get(url).push(p.id)
}
const pkgUnique = [...pkgImgMap.keys()].filter(u => u.startsWith('http'))
console.log(`Packages: ${pkgs.length} rows, ${pkgUnique.length} unique photos`)

// All unique combined
const allUnique = new Set([...destUnique, ...pkgUnique])
console.log(`Total unique photos to download+upload: ${allUnique.size}`)

// Sample
console.log('\nSample dest images:')
destUnique.slice(0, 5).forEach(u => console.log(' ', u))
console.log('\nSample pkg images:')
pkgUnique.slice(0, 5).forEach(u => console.log(' ', u))
