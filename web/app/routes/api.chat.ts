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

  // Extract question from request body
  const { question } = await request.json();

  // Insert user message
  await supabase.from("chat").insert({
    video_id: videoId!,
    message: question,
    sender_type: "user",
    user_id: userId,
  });

  const stream = new ReadableStream({
    async start(controller) {
      await chatResponse(userId!, videoId!, question, (chunk) => {
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
