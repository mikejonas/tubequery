import ytdl from "@distube/ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";
import { supabaseAdminClient } from "~/services/supabase-backend";
import { formatTranscript } from "~/utils";

const videoAndChannelSelect = `
  id,
  title,
  description,
  embed_width, 
  embed_height,
  thumbnail_url,
  length_seconds,
  category,
  chapters,
  is_family_safe,
  is_age_restricted,
  channel(
    id,
    user_url,
    channel_name,
    thumbnail_url,
    subscriber_count,
    channel_url
  ),
  summary(
    summary_text
  )
`;

/*
  Fetch all video and channel data from to render the page
  Includes summary, if it exists. If not, the client should fetch the summary
  from the stream summary endpoint.
*/
export async function fetchMetadata(videoId: string) {
  const { data: cachedVideo, error: fetchedError } = await supabaseAdminClient
    .from("video")
    .select(videoAndChannelSelect)
    .eq("id", videoId)
    .maybeSingle();
  if (fetchedError) {
    console.error(fetchedError);
  }

  if (cachedVideo) {
    return cachedVideo;
  }

  // Fetch video data from YouTube
  const ytdlInfo = await ytdl.getInfo(
    `https://www.youtube.com/watch?v=${videoId}`
  );

  const videoDetails = ytdlInfo.videoDetails;
  const author = videoDetails.author;
  const avatar = author?.thumbnails?.[author.thumbnails.length - 1]?.url || "";

  const { error: channelError } = await supabaseAdminClient
    .from("channel")
    .upsert(
      {
        id: videoDetails.channelId,
        channel_name: author.name,
        thumbnail_url: avatar,
        subscriber_count: author.subscriber_count || 0,
        channel_url: author.channel_url || "",
        is_verified: author.verified || false,
        user_url: author.user_url || "",
      },
      { onConflict: "id" }
    );

  if (channelError) {
    console.error("Error upserting channel:", channelError);
    return null;
  }

  const { data, error: videoError } = await supabaseAdminClient
    .from("video")
    .insert({
      id: videoId,
      channel_id: videoDetails.channelId,
      title: videoDetails.title || "Unknown Title",
      description: videoDetails.description || "",
      embed_width: videoDetails.embed?.width || 0,
      embed_height: videoDetails.embed?.height || 0,
      thumbnail_url: videoDetails.thumbnails?.[0]?.url || "",
      length_seconds: parseInt(videoDetails.lengthSeconds || "0", 10),
      is_family_safe: videoDetails.isFamilySafe || false,
      is_age_restricted: videoDetails.age_restricted || false,
      is_unlisted: videoDetails.isUnlisted || false,
      available_countries: JSON.stringify(
        videoDetails.availableCountries || []
      ),
      is_crawlable: videoDetails.isCrawlable || false,
      category: videoDetails.category || "",
      publish_date: videoDetails.publishDate || "",
      upload_date: videoDetails.uploadDate || "",
      is_private: videoDetails.isPrivate || false,
      chapters: JSON.stringify(videoDetails.chapters || []),
    })
    .select(videoAndChannelSelect)
    .single();

  if (videoError) {
    console.error("Error inserting video:", videoError);
    return null;
  }

  return data;
}

// Fetch video data from YouTube
export async function fetchTranscript(videoId: string) {
  // Check if transcript exists in the database
  const { data: cachedTranscript, error: fetchError } =
    await supabaseAdminClient
      .from("transcript")
      .select("transcript")
      .eq("video_id", videoId)
      .single();

  if (fetchError) {
    console.error("Error fetching transcript:", fetchError);
  }
  if (cachedTranscript) {
    return {
      transcript: formatTranscript(cachedTranscript.transcript || []),
    };
  }
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  const { data: insertedTranscript, error: insertError } =
    await supabaseAdminClient
      .from("transcript")
      .insert({
        video_id: videoId,
        transcript: JSON.stringify(transcript),
      })
      .select("transcript")
      .single();

  if (insertError) {
    console.error("Error saving transcript to database:", insertError);
    return null;
  }

  return {
    transcript: formatTranscript(insertedTranscript.transcript),
  };
}
