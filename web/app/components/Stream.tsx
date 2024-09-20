import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Markdown from "./Markdown";

interface StreamingSummaryProps {
  videoId: string;
}

export function StreamingSummary({ videoId }: StreamingSummaryProps) {
  const [summary, setSummary] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["streamSummary", videoId],
    queryFn: () => fetchStreamingSummary(videoId),
    enabled: !!videoId,
  });

  useEffect(() => {
    if (data) {
      const reader = data.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        try {
          let done = false;
          while (!done) {
            const { done: isDone, value } = await reader.read();
            done = isDone;
            if (done) break;
            const chunk = decoder.decode(value);
            setSummary((prev) => prev + chunk);
          }
        } finally {
          reader.releaseLock();
        }
      };

      readStream();
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <Markdown>{summary}</Markdown>
    </div>
  );
}

async function fetchStreamingSummary(videoId: string): Promise<ReadableStream> {
  const response = await fetch(`/api/summary?videoId=${videoId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }
  return response.body as ReadableStream;
}
