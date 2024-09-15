// app/routes/api/summarizeTranscript.ts
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { summarizeTranscript } from "~/services/openai";
import { fetchVideoInfo, fetchTranscript } from "~/services/youtube";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return json(
      { error: "Missing 'videoId' query parameter." },
      { status: 400 }
    );
  }

  try {
    const videoInfo = await fetchVideoInfo(videoId, false);

    console.log({ videoInfo });
    const transcript = await fetchTranscript(videoId, false);
    const summary = await summarizeTranscript(transcript.join(" "), videoInfo);

    return json({ summary });
  } catch (error: any) {
    console.error(
      `Error processing transcript for Video ID ${videoId}:`,
      error.message || error
    );

    // Handle specific errors
    if (error.message.includes("No transcript available")) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    // Generic server error
    return json({ error: "Failed to process transcript." }, { status: 500 });
  }
};
