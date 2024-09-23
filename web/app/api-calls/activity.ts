import { supabaseClient } from "~/services/supabase";

export async function getActivityHistory() {
  const response = await supabaseClient
    .from("summary")
    .select(
      `
      video_id,
      video (
        id,
        title
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (response.error) {
    console.error("Supabase error:", response.error);
    return [];
  }

  const idTitlePairs =
    response.data
      ?.map((item) => ({
        id: item.video?.id,
        title: item.video?.title,
      }))
      .filter(
        (item): item is { id: string; title: string } =>
          !!item.id && !!item.title
      ) || [];

  return idTitlePairs;
}
