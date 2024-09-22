import { Database } from "~/types/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

// Admin level privileges
export const supabaseAdminClient = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey
);

// User level privileges
// Used for queries where the RLS policies are applied to the user
export const getUserSupabaseClient = (authHeader: string) => {
  const token = authHeader.replace("Bearer ", "");

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
