import { supabaseClient } from "~/services/supabase";

async function signInAnonymously(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabaseClient.auth.signInAnonymously();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error during anonymous sign-in:", error);
    return { error: "Failed to sign in anonymously. Please try again." };
  }
}

export { signInAnonymously };
