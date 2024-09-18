import { SupabaseTranscript } from "~/types/supabase-additional";
import { decode } from "html-entities";
import { Database } from "~/types/supabase";

export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const estimateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const formatTimestamp = (seconds: number): string => {
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
};

// [00:01:20] transcribed text from the video!
export const formatTranscript = (
  transcript: Database["public"]["Tables"]["transcript"]["Row"]["transcript"]
): string[] => {
  const parsedTranscript = JSON.parse(
    transcript as string
  ) as SupabaseTranscript[];

  return parsedTranscript.map((entry) => {
    return `[${formatTimestamp(entry.offset)}] ${decode(decode(entry.text))}`;
  });
};
