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

export default function Result() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { videoId } = useParams();

  const query = useQuery({
    queryKey: ["summary", videoId],
    queryFn: () =>
      fetch(`/api/summary?videoId=${videoId}`).then((res) => res.json()),
  });
  const summary = query?.data?.summary || "";
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
    setLoading(true);
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
    console.log(chat);
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

    setLoading(false);
    setPendingQuestion(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuestion(e);
    }
  };

  const renderSummary = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold flex items-center mb-2">
          Exercise Scientist Critiques Ronnie Coleman
        </h2>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{estimateReadingTime(summary)} min read</span>
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
      {summary && (
        <div className="space-y-6">
          <Markdown>{summary}</Markdown>
        </div>
      )}
    </div>
  );

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
        placeholder="Ask a question about the video..."
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
        disabled={loading}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent p-0"
        aria-label="Submit question"
      >
        {loading ? (
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
          <VideoPlayer videoId={videoId ?? ""} />
          {renderSummary()}
          {renderChat()}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 py-4">
        <div className="max-w-2xl mx-auto">{renderChatInput()}</div>
      </div>
    </div>
  );
}
