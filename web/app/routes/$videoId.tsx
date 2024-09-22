import { useRef } from "react";
import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { useQuery } from "@tanstack/react-query";
import Header from "~/components/Header";
import { VideoProvider } from "~/context/VideoContext";
import Chat from "~/components/Chat";
import { Tables } from "~/types/supabase";
import VideoDetails from "~/components/VideoDetails";

type VideoData = Tables<"video">;
type ChannelData = Tables<"channel">;
type SummaryData = Tables<"summary"> | undefined;

type OverviewData = {
  metadata: VideoData & {
    channel: ChannelData;
    summary?: SummaryData;
  };
};

// TODO: Implement server SSR when I have tome to refine SSR UX
export const loader: LoaderFunction = async (/* { params, request } */) => {
  // console.log({ params, request });
  // const { videoId } = params;
  // const url = new URL(request.url);
  // const apiUrl = `${url.protocol}//${url.host}/api/overview?videoId=${videoId}`;

  // const response = await fetch(apiUrl);
  // if (!response.ok) {
  //   throw new Response("Failed to fetch video data", {
  //     status: response.status,
  //   });
  // }

  // const data = await response.json();
  // return json(data);
  return null;
};

const ResultContent = () => {
  const { videoId } = useParams() as { videoId: string };
  const mainContentRef = useRef<HTMLDivElement>(null);
  const loadedData = useLoaderData<OverviewData | null>();

  const { data, isLoading } = useQuery<OverviewData, Error>({
    queryKey: ["overview", videoId],
    queryFn: () =>
      fetch(`/api/overview?videoId=${videoId}`).then((res) => res.json()),
    enabled: !loadedData, // Only run the query if loadedData is null or undefined
  });

  const overviewData = loadedData || data;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow overflow-y-auto" ref={mainContentRef}>
        <main className="max-w-2xl mx-auto p-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {overviewData && <VideoDetails data={overviewData} />}
              <Chat videoId={videoId} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default function Result() {
  return (
    <VideoProvider>
      <ResultContent />
    </VideoProvider>
  );
}
