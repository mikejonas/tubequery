import { useLoaderData, useParams, useOutletContext } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { useQuery } from "@tanstack/react-query";
import { VideoProvider } from "~/context/VideoContext";
import Chat from "~/components/Chat";
import { Tables } from "~/types/supabase";
import VideoDetails from "~/components/VideoDetails";
import Logo from "~/components/Logo";

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
export const loader: LoaderFunction = async () => {
  return null;
};

const ResultContent = () => {
  const { videoId } = useParams() as { videoId: string };
  const loadedData = useLoaderData<OverviewData | null>();
  const { isOpen } = useOutletContext<{ isOpen: boolean }>();

  const { data, isLoading } = useQuery<OverviewData, Error>({
    queryKey: ["overview", videoId],
    queryFn: () =>
      fetch(`/api/overview?videoId=${videoId}`).then((res) => res.json()),
    enabled: !loadedData, // Only run the query if loadedData is null or undefined
  });

  const overviewData = loadedData || data;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 bg-white dark:bg-zinc-900 z-10 p-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex-shrink-0">
        <Logo size="base" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-2xl mx-auto p-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {overviewData && <VideoDetails data={overviewData} />}
            <Chat videoId={videoId} isOpen={isOpen} />
          </>
        )}
      </main>
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
