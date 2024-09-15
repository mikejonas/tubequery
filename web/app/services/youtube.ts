import { decode } from "html-entities";
import ytdl from "@distube/ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";
import { mockMetaData, mockTranscript } from "~/data";

export interface Metadata {
  title: string;
  description: string;
  author: string;
  authorId?: string;
  avatar?: string;
  keywords?: string[];
  imageUrl?: string;
  publishedDate?: string;
  genre?: string;
  viewCount?: number;
  isLive?: boolean;
}

export async function fetchMetadata(
  videoId: string,
  returnMock: boolean
): Promise<Metadata> {
  if (returnMock) {
    return mockMetaData;
  }
  const ytdlInfo = await ytdl.getInfo(
    `https://www.youtube.com/watch?v=${videoId}`
  );

  const videoDetails = ytdlInfo.videoDetails;
  const author = videoDetails.author;
  const avatar =
    author && author.thumbnails && author.thumbnails.length > 0
      ? author.thumbnails[author.thumbnails.length - 1].url
      : ""; // Getting the highest resolution avatar

  return {
    title: videoDetails.title || "Unknown Title",
    description: videoDetails.description || "No description available",
    author: author.name || "Unknown Author",
    avatar,
    keywords: videoDetails.keywords || [],
    imageUrl: videoDetails.thumbnails?.[0]?.url || "",
    publishedDate: videoDetails.publishDate || "",
    genre: videoDetails.category || "",
    viewCount: parseInt(videoDetails.viewCount || "0", 10),
    isLive: videoDetails.isLiveContent || false,
  };
}

export async function fetchTranscript(
  videoId: string,
  returnMock: boolean
): Promise<string[]> {
  if (returnMock) {
    return mockTranscript;
  }
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  const formattedTranscript = transcript.map((entry) => {
    return `[${formatTimestamp(entry.offset)}] ${decode(decode(entry.text))}`;
  });

  return formattedTranscript;
}

function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  } else {
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
}
