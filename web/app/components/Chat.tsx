import React, { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import Markdown from "~/components/Markdown";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChatHistory, getChatHistory, postChat } from "~/api-calls/chat";
import { ChatMessage } from "~/types/supabase-additional";

export default function ChatComponent({ videoId }: { videoId: string }) {
  const queryClient = useQueryClient();
  const { data: chatHistory, refetch: refetchChatHistory } = useQuery({
    queryKey: ["chatHistory", videoId],
    queryFn: () => getChatHistory(videoId),
  });

  const [question, setQuestion] = useState("");
  const [responding, setResponding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: "instant" | "smooth") => {
    dummyRef.current?.scrollIntoView({ behavior });
  };

  const deleteChatHistoryMututation = useMutation({
    mutationFn: () => deleteChatHistory(videoId),
    onSuccess: async () => {
      console.log("Deleted chat history");
      await queryClient.setQueryData(["chatHistory", videoId], []);
    },
  });

  const chatMutation = useMutation({
    mutationFn: (question: string) => postChat(videoId, question),
    onMutate: async (newQuestion) => {
      setResponding(true);

      const previousChatHistory = queryClient.getQueryData([
        "chatHistory",
        videoId,
      ]);
      queryClient.setQueryData(
        ["chatHistory", videoId],
        (old: ChatMessage[]) => [
          ...(old || []),
          { role: "user", content: newQuestion },
          { role: "assistant", content: "" },
        ]
      );

      scrollToBottom("smooth");
      return { previousChatHistory };
    },
    onSuccess: async (stream) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedAnswer += decoder.decode(value);

        queryClient.setQueryData(
          ["chatHistory", videoId],
          (old: ChatMessage[]) => {
            const newChatHistory = [...old];
            newChatHistory[newChatHistory.length - 1] = {
              ...newChatHistory[newChatHistory.length - 1],
              content: accumulatedAnswer,
            };
            return newChatHistory;
          }
        );

        scrollToBottom("instant");
      }
    },

    onError: (err, newQuestion, context) => {
      queryClient.setQueryData(
        ["chatHistory", videoId],
        context?.previousChatHistory
      );
    },
    onSettled: () => {
      setResponding(false);
      setQuestion("");
      refetchChatHistory();
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  const handleQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      chatMutation.mutate(question);
      scrollToBottom("smooth");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuestion(e);
    }
  };

  const renderChatMessage = (
    item: { role: string; content: string },
    index: number
  ) => {
    if (item.role === "user") {
      return (
        <div key={index} className="space-y-2">
          <div className="pv-3 ">
            <div className="flex w-full flex-col items-end whitespace-normal break-words mb-8">
              <div className="text-sm relative max-w-[70%] rounded-xl px-5 py-2.5 bg-[#f4f4f4] dark:bg-zinc-800">
                {item.content}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (item.role === "assistant") {
      return (
        <div key={index} className="space-y-2">
          <div className="pv-3 min-h-12">
            <Markdown>{item.content}</Markdown>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChat = () => {
    if (!chatHistory) {
      return <div>Loading chat history...</div>;
    }

    return (
      <div className="mt-4">
        {chatHistory.map(renderChatMessage)}
        <div ref={dummyRef} />
      </div>
    );
  };

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
    <div className="relative flex flex-col h-full">
      <div className="pb-24">
        <div className="space-y-4">{renderChat()}</div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 pb-2 bg-white dark:bg-zinc-900 text-center">
        <div className="max-w-2xl mx-auto">{renderChatInput()}</div>
        <div className="text-xs text-zinc-500">
          <button
            onClick={() => deleteChatHistoryMututation.mutate()}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs"
          >
            Delete conversation
          </button>
        </div>
      </div>
    </div>
  );
}
