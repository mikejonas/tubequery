import { supabaseClient } from "~/services/supabase";

export async function postChat(
  videoId: string,
  content: string
): Promise<ReadableStream> {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  const response = await fetch(`/api/chat?videoId=${videoId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat response");
  }
  return response.body as ReadableStream;
}

export async function getChatHistory(videoId: string) {
  const response = await supabaseClient
    .from("chat")
    .select("*")
    .eq("video_id", videoId)
    .order("created_at", { ascending: true });

  return response.data;
}

export async function deleteChatHistory(videoId: string) {
  console.log("Deleting chat history for videoId", videoId);
  const { error } = await supabaseClient
    .from("chat")
    .delete()
    .eq("video_id", videoId);
  if (error) {
    console.error("Error deleting chat history", error);
  }
  return [];
}
