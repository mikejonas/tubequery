import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
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
    // metadata and transcript need to be sequential
    const metadata = await fetchMetadata(videoId);
    const transcript = await fetchTranscript(videoId);

    if (!transcript) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    return json({
      metadata,
      transcript,
    });
  } catch (error) {
    console.error(
      `Error processing transcript for Video ID ${videoId}:`,
      error instanceof Error ? error.message : error
    );

    if (
      error instanceof Error &&
      error.message.includes("No transcript available")
    ) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    return json({ error: "Failed to process transcript." }, { status: 500 });
  }
};
