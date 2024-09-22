import type { ActionFunction } from "@remix-run/node";
import { chatResponse } from "~/services/openai/chat";
import { supabase } from "~/services/supabase";

export const action: ActionFunction = async ({ request }) => {
  // Get video id from url
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  // Get user id from auth
  const authHeader = request.headers.get("authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  const userId = userData.user?.id;
  const { content } = await request.json();

  if (videoId && userId) {
    const { error } = await supabase.from("chat").insert({
      video_id: videoId,
      content,
      role: "user",
      user_id: userId,
    });
    if (error) {
      console.error(error);
      throw new Error("Error inserting chat message");
    }
  } else {
    throw new Error("Missing videoId or userId");
  }

  const stream = new ReadableStream({
    async start(controller) {
      await chatResponse(userId!, videoId!, content, (chunk) => {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(chunk));
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
