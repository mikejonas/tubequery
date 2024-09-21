import { supabase } from "~/services/supabase";

export async function postChat(
  videoId: string,
  question: string
): Promise<ReadableStream> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`/api/chat?videoId=${videoId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat response");
  }
  return response.body as ReadableStream;
}
