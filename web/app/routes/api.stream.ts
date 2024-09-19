import type { LoaderFunction } from "@remix-run/node";
import { fetchMetadata, fetchTranscript } from "~/services/youtube";
import { summarizeTranscript } from "~/services/openai";

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

    const stream = await summarizeTranscript(
      {
        transcript: transcript.transcript.join(" "),
        title: metadata?.title || "",
        author: metadata?.channel?.channel_name || "",
        description: metadata?.description || "",
      },
      false
    );

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
