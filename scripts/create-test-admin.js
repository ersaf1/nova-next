const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Strip quotes
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_EMAIL = 'testadmin_qa@example.com';
const TEST_PASSWORD = 'TestAdmin123!';

async function createAndPromote() {
  console.log('--- Creating Test Admin ---');
  
  // 1. List users to see if already exists
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }
  
  let user = users.find(u => u.email === TEST_EMAIL);
  
  if (!user) {
    console.log(`Creating user: ${TEST_EMAIL}`);
    const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true
    });
    
    if (createError) {
      console.error('Failed to create user:', createError.message);
      process.exit(1);
    }
    user = newUser;
    console.log(`Created user: ${user.id}`);
  } else {
    console.log(`User already exists: ${user.id}`);
  }
  
  // 2. Promote to super_admin in user_roles
  console.log(`Promoting ${TEST_EMAIL} to super_admin...`);
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .upsert(
      { user_id: user.id, role: 'super_admin' },
      { onConflict: 'user_id' }
    );
    
  if (roleError) {
    console.error('Failed to set role:', roleError.message);
    process.exit(1);
  }
  
  console.log('SUCCESS: testadmin_qa@example.com is now super_admin!');
}

createAndPromote().catch(console.error);
