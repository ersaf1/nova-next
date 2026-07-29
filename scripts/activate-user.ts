import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load .env manually
try {
  const envText = fs.readFileSync('.env', 'utf-8')
  envText.split('\n').forEach(line => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = val
    }
  })
} catch (e) {
  console.log('Error reading .env:', e)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrnmzwtjqcvknoclycbd.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Using Supabase URL:', supabaseUrl)

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

async function activateUser() {
  const email = 'ersafrexx@gmail.com'
  const password = 'Password123!'

  console.log(`Activating user: ${email}...`)

  // 1. Try creating user with email_confirm: true
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Ersa Frexx' }
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists') || error.code === 'email_exists') {
      console.log(`User ${email} already exists. Updating email_confirm status...`)
      
      // Get user list to find user ID
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) {
        console.error('List users error:', listError)
        return
      }
      const existingUser = usersData.users.find(u => u.email === email)
      if (existingUser) {
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true, password }
        )
        if (updateError) {
          console.error('Update error:', updateError)
        } else {
          console.log(`SUCCESS: User ${email} has been updated & set to ACTIVE & CONFIRMED! User ID: ${updateData.user.id}`)
        }
      }
    } else {
      console.error('Create user error:', error)
    }
  } else {
    console.log(`SUCCESS: User ${email} created & set to ACTIVE & CONFIRMED! User ID: ${data.user.id}`)
  }
}

activateUser()
