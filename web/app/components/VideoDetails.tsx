import { Clock, Volume2 } from "lucide-react";
import Markdown from "~/components/Markdown";
import { estimateReadingTime } from "~/utils";
import { StreamingSummary } from "~/components/Stream";
import { Tables } from "~/types/supabase";

type VideoData = Tables<"video">;
type ChannelData = Tables<"channel">;
type SummaryData = Tables<"summary"> | undefined;

type OverviewData = {
  metadata: VideoData & {
    channel: ChannelData;
    summary?: SummaryData;
  };
};

export default function VideoDetailsComponent({
  data,
}: {
  data: OverviewData;
}) {
  const overview = data.metadata;
  const summary = data.metadata.summary;

  const renderTitle = () => (
    <div>
      <h1 className="text-xl font-semibold flex items-center mb-2">
        {overview?.title}
      </h1>
      <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 space-x-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {summary && (
            <span>{estimateReadingTime(summary.summary_text)} min read</span>
          )}
        </div>
        <button
          onClick={() => {
            /* Implement audio playback logic */
          }}
          className="flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          aria-label="Listen to summary"
        >
          <Volume2 className="w-4 h-4 mr-1" />
          <span>Listen</span>
        </button>
      </div>
    </div>
  );

  const renderSummary = () => {
    if (summary) {
      return (
        <div>
          {summary && (
            <div className="space-y-6">
              <Markdown>{summary.summary_text}</Markdown>
            </div>
          )}
        </div>
      );
    } else {
      return <StreamingSummary videoId={overview.id} />;
    }
  };

  return (
    <div>
      <div className="mb-4">{renderTitle()}</div>
      {summary ? renderSummary() : <StreamingSummary videoId={overview.id} />}
    </div>
  );
}
