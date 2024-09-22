import { Database } from "./supabase";

export type SupabaseTranscript = {
  text: string;
  duration: number;
  offset: number;
  lang: string;
};

export type ChatMessage = Database["public"]["Tables"]["chat"]["Row"];
