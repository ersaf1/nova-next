import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrnmzwtjqcvknoclycbd.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function runMigration() {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260729000001_add_refund_fields.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')

  console.log('Running refund fields migration...')
  console.log(sql)

  const { error } = await supabaseAdmin.rpc('exec_sql', { sql }).single()

  if (error) {
    // rpc may not exist — fall back to raw REST via the pg endpoint
    console.warn('rpc exec_sql not available, trying direct query approach...')

    // Execute each statement individually using supabase-js
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 80)}...`)
      const { error: stmtError } = await supabaseAdmin.rpc('exec_sql', { sql: statement + ';' })
      if (stmtError) {
        console.error('Statement error:', stmtError)
        // Try alternative: use from().select() trick won't work for DDL
        // The migration must be run via Supabase Dashboard SQL Editor if rpc is unavailable
        console.error('\nCould not apply migration via RPC.')
        console.error('Please run the following SQL in your Supabase Dashboard SQL Editor:')
        console.error('\n' + sql)
        process.exit(1)
      }
    }
  }

  console.log('Migration applied successfully.')
}

runMigration().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
