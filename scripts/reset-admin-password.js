const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function resetPassword() {
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error(listError);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === 'testadmin_qa@example.com');
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  
  console.log(`Resetting password for user ${user.id}...`);
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { 
      password: 'TestAdmin123!',
      email_confirm: true 
    }
  );
  
  if (updateError) {
    console.error('Failed to update:', updateError.message);
  } else {
    console.log('SUCCESS: Password reset to TestAdmin123! and email verified.');
  }
}

resetPassword().catch(console.error);
