/**
 * Seed script to create the admin user.
 * Usage: node scripts/create-admin.js
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const SALT_ROUNDS = 12;

async function main() {
  const email = process.argv[2] || "sanith@saisanithreddy.online";
  const password = process.argv[3];
  const name = process.argv[4] || "Sai Sanith Reddy";

  if (!password) {
    console.error("Usage: node scripts/create-admin.js <email> <password> [name]");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        email: email.toLowerCase(),
        name,
        password_hash: passwordHash,
        role: "admin",
        theme: "system",
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }

  console.log("Admin user created/updated successfully:");
  console.log(`  Email: ${data.email}`);
  console.log(`  Name:  ${data.name}`);
  console.log(`  Role:  ${data.role}`);
  console.log(`  ID:    ${data.id}`);
}

main();
