const { createClient } = require("@supabase/supabase-js");

const configuredUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!configuredUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

// Supabase's SDK expects the project root (https://<ref>.supabase.co), not
// its REST endpoint. `origin` also makes an accidentally pasted /rest/v1 URL safe.
let url;
try {
  url = new URL(configuredUrl).origin;
} catch {
  throw new Error("SUPABASE_URL must be a valid project URL.");
}

// Server-only client: never expose the service-role key to the Vite frontend.
module.exports = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
