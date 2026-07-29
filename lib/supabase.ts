import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  ''

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Use placeholder values at build time to prevent createClient from throwing.
// All API routes that need real data will fail gracefully when env vars are empty.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)
