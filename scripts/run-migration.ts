import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.log('ERROR: Missing env vars')
  process.exit(1)
}

// Extract the project ref from the URL (e.g. jrnmzwtjqcvknoclycbd)
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

async function runMigration() {
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20260729000000_add_user_roles.sql')
  const sql = readFileSync(sqlPath, 'utf-8')
  console.log(`Running migration via Supabase Management API (project: ${projectRef})`)

  // Supabase Management API: POST /v1/projects/{ref}/database/query
  const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

  const response = await fetch(mgmtUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  const text = await response.text()
  console.log('Status:', response.status)
  console.log('Response:', text)

  if (response.ok) {
    console.log('\nMigration applied successfully.')
  } else {
    // Try the direct database REST endpoint as fallback
    console.log('\nManagement API failed, trying pg/query endpoint...')
    const pgUrl = `${supabaseUrl}/pg/query`
    const pgResp = await fetch(pgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    const pgText = await pgResp.text()
    console.log('pg/query status:', pgResp.status)
    console.log('pg/query response:', pgText)

    if (!pgResp.ok) {
      process.exit(1)
    } else {
      console.log('\nMigration applied successfully via pg/query.')
    }
  }
}

runMigration().catch(err => {
  console.log('CAUGHT ERROR:', err.message)
  process.exit(1)
})
