import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { summarizeTranscript } from "~/services/openai";
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

  try {
    const [metadata, transcript] = await Promise.all([
      fetchMetadata(videoId, false),
      fetchTranscript(videoId, false),
    ]);
    const summary = await summarizeTranscript(
      transcript.join(" "),
      metadata,
      true
    );

    return json({
      summary,
      metadata: {
        title: metadata.title,
        imageUrl: metadata.imageUrl,
        author: metadata.author,
        avatar: metadata.avatar,
        publishedDate: metadata.publishedDate,
      },
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
