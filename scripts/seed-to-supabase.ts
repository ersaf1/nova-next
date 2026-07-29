import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedBatch(batchNum: number) {
  console.log(`\n📦 Seeding batch ${batchNum}...`)
  
  const filePath = path.join(__dirname, '..', 'supabase', `seed-batch-${batchNum}.sql`)
  const sql = readFileSync(filePath, 'utf-8')
  
  // Parse INSERT statements manually
  const destInsert = sql.match(/INSERT INTO "Destination"[^;]+;/s)?.[0]
  const pkgInsert = sql.match(/INSERT INTO "Package"[^;]+;/s)?.[0]
  
  if (destInsert) {
    // Extract destination rows
    const values = destInsert.match(/VALUES\s*(.+);/s)?.[1]
    if (values) {
      const rows = values.split(/\),\s*\(/)
        .map((row, i, arr) => {
          let clean = row
          if (i === 0) clean = clean.replace(/^\(/, '')
          if (i === arr.length - 1) clean = clean.replace(/\)$/, '')
          
          const parts = clean.split(/,\s*'/).map(p => p.replace(/^'|'$/g, '').trim())
          return {
            city: parts[0],
            country: parts[1],
            image: parts[2],
            description: parts[3],
            rating: parseFloat(parts[4]),
            duration: parts[5],
            price: parts[6],
            category: parts[7]
          }
        })
      
      const { error } = await supabase.from('Destination').insert(rows)
      if (error) {
        console.error('❌ Destination error:', error.message)
      } else {
        console.log(`✓ ${rows.length} destinations inserted`)
      }
    }
  }
  
  if (pkgInsert) {
    // Extract package rows
    const values = pkgInsert.match(/VALUES\s*(.+);/s)?.[1]
    if (values) {
      const rows = values.split(/\),\s*\(/)
        .map((row, i, arr) => {
          let clean = row
          if (i === 0) clean = clean.replace(/^\(/, '')
          if (i === arr.length - 1) clean = clean.replace(/\)$/, '')
          
          const parts = clean.split(/,\s*'/).map(p => p.replace(/^'|'$/g, '').replace(/\\'/g, "'").trim())
          return {
            tag: parts[0],
            tagColor: parts[1],
            title: parts[2],
            subtitle: parts[3],
            image: parts[4],
            price: parseInt(parts[5]),
            originalPrice: parseInt(parts[6]),
            duration: parts[7],
            groupSize: parts[8],
            rating: parseFloat(parts[9]),
            reviews: parseInt(parts[10]),
            includes: parts[11],
            highlight: parts[12],
            category: parts[13]
          }
        })
      
      const { error } = await supabase.from('Package').insert(rows)
      if (error) {
        console.error('❌ Package error:', error.message)
      } else {
        console.log(`✓ ${rows.length} packages inserted`)
      }
    }
  }
}

async function main() {
  console.log('🌍 Starting world seed (195 countries)...')
  
  for (let i = 1; i <= 10; i++) {
    await seedBatch(i)
  }
  
  const { count: dCount } = await supabase.from('Destination').select('*', { count: 'exact', head: true })
  const { count: pCount } = await supabase.from('Package').select('*', { count: 'exact', head: true })
  
  console.log(`\n✅ Done! Total: ${dCount} destinations, ${pCount} packages`)
}

main()
