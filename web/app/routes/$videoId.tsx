import { useRef } from "react";
import { useParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import VideoPlayer from "~/components/VideoPlayer";
import Header from "~/components/Header";
import { VideoProvider, useVideoContext } from "~/context/VideoContext";
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

const ResultContent = () => {
  const { videoId } = useParams() as { videoId: string };
  const { seekTo } = useVideoContext();
  const mainContentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<OverviewData, Error>({
    queryKey: ["overview", videoId],
    queryFn: () =>
      fetch(`/api/overview?videoId=${videoId}`).then((res) => res.json()),
  });

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow overflow-y-auto" ref={mainContentRef}>
        <main className="max-w-2xl mx-auto p-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <VideoPlayer videoId={videoId} seekTo={seekTo} />
              <VideoDetails data={data!} />
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
