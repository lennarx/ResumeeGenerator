import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local not found or already loaded; continue with existing process.env
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const { error } = await supabase.storage.createBucket("cvs-files", {
  public: false,
  fileSizeLimit: "10MB",
  allowedMimeTypes: ["application/pdf"],
});

if (error && !error.message?.toLowerCase().includes("already exists")) {
  console.error("Failed to create bucket:", error.message);
  process.exit(1);
}

console.log("Bucket 'cvs-files' is ready.");
