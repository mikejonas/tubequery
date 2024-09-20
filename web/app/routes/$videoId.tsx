import React, { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { ArrowUp, Loader2, Clock, Volume2 } from "lucide-react";
import { useParams } from "@remix-run/react";
import Markdown from "~/components/Markdown";
import { mockResponse } from "~/data";
import { useQuery } from "@tanstack/react-query";
import VideoPlayer from "~/components/VideoPlayer";
import { estimateReadingTime } from "~/utils";
import Header from "~/components/Header";
import { VideoProvider, useVideoContext } from "~/context/VideoContext";
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

const ResultContent = () => {
  const [question, setQuestion] = useState("");
  const [responding, setResponding] = useState(false);
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { videoId } = useParams() as { videoId: string };
  const { seekTo } = useVideoContext();

  const { data, isLoading } = useQuery<OverviewData, Error>({
    queryKey: ["overview", videoId],
    queryFn: () =>
      fetch(`/api/overview?videoId=${videoId}`).then((res) => res.json()),
  });

  const overview = data?.metadata;
  const summary = data?.metadata.summary;

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [question]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat, pendingQuestion]);

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setResponding(true);
    const currentQuestion = question;
    setPendingQuestion(currentQuestion);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setQuestion("");

    let displayedAnswer = "";
    const words = mockResponse[0].split(" ");
    const wordsPerChunk = 5;
    const delayBetweenChunks = 100; // milliseconds

    // Add the new question to the chat immediately
    setChat((prev) => [...prev, { question: currentQuestion, answer: "" }]);

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(" ");
      displayedAnswer += chunk + " ";
      setChat((prev) => {
        const newChat = [...prev];
        newChat[newChat.length - 1].answer = displayedAnswer.trim();
        return newChat;
      });
      await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
    }

    setResponding(false);
    setPendingQuestion(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuestion(e);
    }
  };

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
      return <StreamingSummary videoId={videoId} />;
    }
  };

  const renderQuestion = (question: string) => {
    return (
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-0.5 h-6 bg-red-500 mr-2"></span>
        {question}
      </h2>
    );
  };
  const renderChat = () => (
    <div className="mt-8 space-y-4" ref={chatContainerRef}>
      {chat.map((item, index) => (
        <div key={index} className="space-y-2">
          <hr className="my-4 border-t border-zinc-200 dark:border-zinc-700" />
          <p className="pv-3 ">{renderQuestion(item.question)}</p>
          <p className="pv-3 ">
            <Markdown>{item.answer}</Markdown>
          </p>
        </div>
      ))}
    </div>
  );

  const renderChatInput = () => (
    <form onSubmit={handleQuestion} className="relative mx-6">
      <textarea
        ref={textareaRef}
        className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg py-4 px-4 pr-12 text-sm placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 resize-none overflow-hidden"
        placeholder="Ask anything..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{
          minHeight: "2.5rem",
          maxHeight: "10rem",
          overflowY: "auto",
        }}
      />
      <Button
        type="submit"
        disabled={responding}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        aria-label="Submit question"
      >
        {responding ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ArrowUp className="w-5 h-5" />
        )}
      </Button>
    </form>
  );

  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex-grow overflow-y-auto pb-24" ref={chatContainerRef}>
        <main className="max-w-2xl mx-auto p-6">
          <div className="mb-4">{renderTitle()}</div>
          <VideoPlayer videoId={videoId ?? ""} seekTo={seekTo} />
          {isLoading ? <div>Loading!</div> : renderSummary()}
          {renderChat()}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 py-4">
        <div className="max-w-2xl mx-auto">{renderChatInput()}</div>
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
