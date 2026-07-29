import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables:')
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceRoleKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const TARGET_EMAIL = 'ersafrexx@gmail.com'
const TARGET_BUCKET = 'nova-uploads'

async function seedAdminRole() {
  console.log('=== Seed Admin Role Script ===\n')

  // Step 1: Find user by email
  console.log(`[1/3] Looking up user: ${TARGET_EMAIL}`)
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    console.error('  FAILED to list users:', listError.message)
    process.exit(1)
  }

  const user = users.find((u) => u.email === TARGET_EMAIL)

  if (!user) {
    console.error(`  FAILED: No user found with email ${TARGET_EMAIL}`)
    process.exit(1)
  }

  console.log(`  Found user: ${user.id} (${user.email})`)

  // Step 2: Upsert super_admin role
  console.log(`\n[2/3] Assigning super_admin role to user ${user.id}`)
  const { error: upsertError } = await supabaseAdmin
    .from('user_roles')
    .upsert(
      { user_id: user.id, role: 'super_admin' },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    console.error('  FAILED to upsert user_roles:', upsertError.message)
    process.exit(1)
  }

  console.log('  SUCCESS: super_admin role assigned to ersafrexx@gmail.com')

  // Step 3: Create storage bucket
  console.log(`\n[3/3] Creating storage bucket: ${TARGET_BUCKET}`)
  const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.createBucket(
    TARGET_BUCKET,
    { public: true }
  )

  if (bucketError) {
    // Ignore duplicate bucket error
    if (bucketError.message.toLowerCase().includes('duplicate') || bucketError.message.toLowerCase().includes('already exists')) {
      console.log(`  OK: Bucket '${TARGET_BUCKET}' already exists — skipping creation`)
    } else {
      console.error(`  FAILED to create bucket '${TARGET_BUCKET}':`, bucketError.message)
      process.exit(1)
    }
  } else {
    console.log(`  SUCCESS: Storage bucket '${TARGET_BUCKET}' created (public: true)`)
  }

  console.log('\n=== Seed complete ===')
}

seedAdminRole().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
