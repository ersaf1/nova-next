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

const ADMIN_ACCOUNTS = [
  { email: 'admin@nova.com', password: 'Admin123456!', role: 'super_admin' },
  { email: 'testadmin_qa@example.com', password: 'TestAdmin123!', role: 'super_admin' },
  { email: 'ersaf@gmail.com', password: '11111111', role: 'super_admin' },
];

async function createAndPromote() {
  console.log('--- Setting Up Admin Accounts ---');
  
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }
  
  for (const acc of ADMIN_ACCOUNTS) {
    let user = users.find(u => u.email === acc.email);
    
    if (!user) {
      console.log(`Creating user: ${acc.email}`);
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true
      });
      
      if (createError) {
        console.error(`Failed to create ${acc.email}:`, createError.message);
        continue;
      }
      user = newUser;
    } else {
      console.log(`Updating password & confirming email for: ${acc.email}`);
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: acc.password,
        email_confirm: true,
      });
    }
    
    // Assign role
    await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: user.id, role: acc.role },
        { onConflict: 'user_id' }
      );
      
    console.log(`✓ ${acc.email} is active as ${acc.role}!`);
  }
}

createAndPromote().catch(console.error);
