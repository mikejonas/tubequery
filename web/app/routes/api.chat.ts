import type { ActionFunction } from "@remix-run/node";
import { chatResponse } from "~/services/openai/chat";
import { getUserSupabaseClient } from "~/services/supabase";

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new Response("Missing Authorization header", { status: 401 });
  }

  const userSupabaseClient = getUserSupabaseClient(authHeader);

  const {
    data: { user },
    error: userError,
  } = await userSupabaseClient.auth.getUser();

  if (userError || !user) {
    console.error(userError);
    return new Response("Invalid or expired token", { status: 401 });
  }

  const userId = user.id;

  if (!videoId || !userId) {
    throw new Error("Missing videoId or userId");
  }

  const { content } = await request.json();

  const { error } = await userSupabaseClient.from("chat").insert({
    video_id: videoId,
    content,
    role: "user",
    user_id: userId,
  });

  if (error) {
    console.error(error);
    throw new Error("Error inserting chat message");
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await chatResponse(
          userId,
          videoId,
          content,
          (chunk) => {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(chunk));
          }
        );

        await userSupabaseClient.from("chat").insert({
          video_id: videoId,
          content: response,
          role: "assistant",
          user_id: userId,
        });

        controller.close();
      } catch (err) {
        console.error("Error while generating chat response:", err);
        controller.error(err);
      }
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
