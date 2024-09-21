import { Database } from "~/types/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  typeof document === "undefined"
    ? process.env.SUPABASE_URL
    : window.ENV.SUPABASE_URL;
const supabaseKey =
  typeof document === "undefined"
    ? process.env.SUPABASE_KEY
    : window.ENV.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
