const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.log("Error:", listErr.message); return; }

  const user = users.users.find(u => u.email === "ersaf@gmail.com");
  if (!user) { console.log("User not found"); return; }
  console.log("User ID:", user.id);

  const { data: existing } = await supabase.from("user_roles").select("*").eq("user_id", user.id).maybeSingle();
  console.log("Existing role:", JSON.stringify(existing));

  const { data, error } = await supabase.from("user_roles").upsert({ user_id: user.id, role: "super_admin" }, { onConflict: "user_id" }).select();
  if (error) { console.log("Upsert error:", error.message); return; }
  console.log("Role assigned:", JSON.stringify(data));
})();
