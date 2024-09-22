// app/routes/api/getTranscript.ts
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { fetchTranscript } from "~/services/youtube";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return json(
      { error: "Missing 'videoId' query parameter." },
      { status: 400 }
    );
  }
  console.log(videoId);

  try {
    const transcript = await fetchTranscript(videoId);
    return transcript;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      `Error fetching transcript for Video ID ${videoId}:`,
      error.message || error
    );

    // Handle specific errors (e.g., transcript not available)
    if (error.message.includes("No transcript available")) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    // Generic server error
    return json({ error: "Failed to fetch transcript." }, { status: 500 });
  }
};
