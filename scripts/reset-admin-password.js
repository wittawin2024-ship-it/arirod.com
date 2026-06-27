const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environmental variables
const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local not found.");
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, "utf8");
const env = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing credentials in env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function resetAdmin() {
  const targetEmail = "admin@arairod.com";
  const newPassword = "adminpassword123";
  
  console.log(`Checking user: ${targetEmail}...`);
  
  // List users to see if the user exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    return;
  }
  
  const existingUser = users.find(u => u.email === targetEmail);
  
  if (existingUser) {
    console.log(`Found existing user with ID: ${existingUser.id}. Resetting password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: newPassword, email_confirm: true }
    );
    
    if (updateError) {
      console.error("Failed to update password:", updateError.message);
    } else {
      console.log(`Successfully updated password for ${targetEmail} to: ${newPassword}`);
    }
  } else {
    console.log(`User ${targetEmail} not found. Creating a new admin user...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: newPassword,
      email_confirm: true
    });
    
    if (createError) {
      console.error("Failed to create user:", createError.message);
    } else {
      console.log(`Successfully created user ${targetEmail} with password: ${newPassword}`);
      
      // Make sure the trigger syncs them as admin. If not, insert it manually.
      console.log("Checking user_roles status...");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("id", newUser.user.id);
        
      if (roleError) {
        console.warn("Could not check roles table:", roleError.message);
      } else if (!roleData || roleData.length === 0) {
        console.log("Role not found in public.user_roles. Inserting as admin manually...");
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ id: newUser.user.id, email: targetEmail, role: "admin" });
          
        if (insertError) {
          console.error("Failed to insert role manually:", insertError.message);
        } else {
          console.log("Manually assigned 'admin' role successfully.");
        }
      }
    }
  }
}

resetAdmin();
