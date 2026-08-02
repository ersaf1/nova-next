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

// Destinations
const { data: dests, error: e1 } = await sb.from('Destination').select('id,city,country,image').order('id')
console.log('=== DESTINATIONS ===')
console.log('Error:', e1)
console.log('Count:', dests?.length)
dests?.forEach(d => console.log(` [${d.id}] ${d.city}, ${d.country} | img: ${d.image ? d.image.substring(0,80) : 'NULL'}`))

// Packages
const { data: pkgs, error: e2 } = await sb.from('Package').select('id,title,slug,coverImage,image').order('id')
console.log('\n=== PACKAGES ===')
console.log('Error:', e2)
console.log('Count:', pkgs?.length)
pkgs?.forEach(p => console.log(` [${p.id}] ${p.slug || p.title} | cover: ${(p.coverImage || p.image || 'NULL').substring(0,80)}`))

// Buckets
const { data: buckets, error: e3 } = await sb.storage.listBuckets()
console.log('\n=== STORAGE BUCKETS ===')
console.log('Error:', e3)
console.log('Buckets:', buckets?.map(b => `${b.name} (public:${b.public})`).join(', '))
