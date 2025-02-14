import { Database } from "~/types/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  typeof document === "undefined"
    ? process.env.SUPABASE_URL
    : window.ENV.SUPABASE_URL;
const supabaseAnonKey =
  typeof document === "undefined"
    ? process.env.SUPABASE_ANON_KEY
    : window.ENV.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Get a supabase client with the user's auth token
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
