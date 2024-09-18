import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { summarizeTranscript } from "~/services/openai";
import { supabase } from "~/services/supabase";
import { fetchMetadata, fetchTranscript } from "~/services/youtube";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return json(
      { error: "Missing 'videoId' query parameter." },
      { status: 400 }
    );
  }
  const { data: storedSummary } = await supabase
    .from("summary")
    .select("summary_text")
    .eq("video_id", videoId)
    .single();

  if (storedSummary) {
    console.log("Using cached summary for video ID:", videoId);
    return json({
      summary: storedSummary.summary_text,
    });
  }

  try {
    const metadata = await fetchMetadata(videoId);
    const transcript = await fetchTranscript(videoId);

    if (!transcript) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    const summary = await summarizeTranscript(
      {
        transcript: transcript.transcript.join(" "),
        title: metadata?.title || "",
        author: metadata?.channel?.channel_name || "",
        description: metadata?.description || "",
      },
      false
    );

    const { error } = await supabase.from("summary").insert({
      video_id: videoId,
      summary_text: summary,
    });

    if (error) {
      console.error("Error inserting summary:", error);
    }

    return json({
      // summary,
      metadata,
    });
  } catch (error) {
    console.error(
      `Error processing transcript for Video ID ${videoId}:`,
      error instanceof Error ? error.message : error
    );

    // Handle specific errors
    if (
      error instanceof Error &&
      error.message.includes("No transcript available")
    ) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    // Generic server error
    return json({ error: "Failed to process transcript." }, { status: 500 });
  }
};
