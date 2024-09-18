import { Database } from "~/types/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? throwError("SUPABASE_URL is not set");
const supabaseKey =
  process.env.SUPABASE_KEY ?? throwError("SUPABASE_KEY is not set");

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

function throwError(message: string): never {
  throw new Error(message);
}
