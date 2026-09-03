/**
 * Assign super_admin role to admin test account
 * Run: node scripts/assign-admin-role.js
 */
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load .env
try {
  const envText = fs.readFileSync('.env', 'utf-8')
  envText.split('\n').forEach(line => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
    }
  })
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const EMAIL = 'admin_test@nova.com'
const G = '\x1b[32m', R = '\x1b[31m', W = '\x1b[0m', B = '\x1b[1m'

async function run() {
  console.log(`\n${B}Assigning super_admin role to ${EMAIL}...${W}\n`)

  // Find user
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error(`${R}List users failed:${W}`, listErr.message); process.exit(1) }

  const user = users.find(u => u.email === EMAIL)
  if (!user) { console.error(`${R}User ${EMAIL} not found${W}`); process.exit(1) }

  console.log(`Found user: ${user.id}`)

  // Upsert role
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'super_admin' }, { onConflict: 'user_id' })

  if (error) {
    console.error(`${R}Failed to assign role:${W}`, error.message)
    process.exit(1)
  }

  console.log(`${G}SUCCESS: super_admin role assigned to ${EMAIL}${W}`)
}

run()
