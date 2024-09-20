import type { LoaderFunction } from "@remix-run/node";
import { fetchMetadata, fetchTranscript } from "~/services/youtube";
import { summarizeTranscript } from "~/services/openai";
import { supabase } from "~/services/supabase";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return new Response("Missing 'videoId' query parameter.", { status: 400 });
  }

  try {
    const metadata = await fetchMetadata(videoId);
    const transcript = await fetchTranscript(videoId);

    if (!transcript) {
      return new Response("Transcript not available for this video.", {
        status: 404,
      });
    }

    // Check if summary already exists in the database
    const { data: cachedSummary, error: summaryError } = await supabase
      .from("summary")
      .select("summary_text")
      .eq("video_id", videoId)
      .maybeSingle();

    if (summaryError) {
      console.error("Error fetching summary:", summaryError);
    }

    // If cached, stream the cached summary
    if (cachedSummary?.summary_text) {
      return new Response(cachedSummary.summary_text, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Create a ReadableStream to push chunks to the client
    const stream = new ReadableStream({
      async start(controller) {
        // Pass chunks to the stream and accumulate full content
        await summarizeTranscript(
          {
            transcript: transcript.transcript.join(" "),
            title: metadata?.title || "",
            author: metadata?.channel?.channel_name || "",
            description: metadata?.description || "",
            videoId: videoId,
          },
          (chunk) => {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(chunk));
          }
        );

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
  } catch (error) {
    console.error(
      `Error processing transcript for Video ID ${videoId}:`,
      error
    );
    return new Response("Failed to process transcript.", { status: 500 });
  }
};
