import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { supabase } from "~/services/supabase";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");

    if (!videoId) {
      return json(
        { error: "Missing 'videoId' query parameter." },
        { status: 400 }
      );
    }

    const { data: storedSummary, error } = await supabase
      .from("summary")
      .select("summary_text")
      .eq("video_id", videoId)
      .single();

    if (error) {
      console.error("Error fetching summary:", error);
      return json({ error: "Failed to fetch summary." }, { status: 500 });
    }

    if (storedSummary) {
      return json({
        summary: storedSummary.summary_text,
      });
    }

    // No summary found
    return json({ error: "Summary not found." }, { status: 404 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return json({ error: "An unexpected error occurred." }, { status: 500 });
  }
};
