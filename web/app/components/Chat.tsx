import React, { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import Markdown from "~/components/Markdown";
import { useMutation } from "@tanstack/react-query";
import { postChat } from "~/api-calls/chat";

export default function ChatComponent({
  videoId,
  onNewMessage,
}: {
  videoId: string;
  onNewMessage: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [responding, setResponding] = useState(false);
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (question: string) => postChat(videoId, question),
    onMutate: () => {
      setResponding(true);
      setChat((prev) => [...prev, { question, answer: "" }]);

      setTimeout(() => {
        onNewMessage(); // Call this when a new message is added
      }, 1);
    },
    onSuccess: async (stream) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = "";

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (done) break;
        const chunk = decoder.decode(result.value);
        accumulatedAnswer += chunk;
        setChat((prev) => {
          const newChat = [...prev];
          newChat[newChat.length - 1].answer = accumulatedAnswer;
          return newChat;
        });
      }
    },
    onSettled: () => {
      setResponding(false);
      setQuestion("");
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [question]);

  // Add this new useEffect hook
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat]);

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    chatMutation.mutate(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuestion(e);
    }
  };

  const renderQuestion = (question: string) => {
    return (
      <div className="text-message flex w-full flex-col items-end whitespace-normal break-words mb-8">
        <div className="relative max-w-[70%] rounded-xl px-5 py-2.5 bg-[#f4f4f4] dark:bg-zinc-800">
          {question}
        </div>
      </div>
    );
  };

  const renderChat = () => (
    <div className="mt-4" ref={chatContainerRef}>
      {chat.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="pv-3 ">{renderQuestion(item.question)}</div>
          <div className="pv-3 min-h-12">
            <Markdown>{item.answer}</Markdown>
          </div>
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
    <div>
      <div className="flex-grow overflow-y-auto pb-24" ref={chatContainerRef}>
        <div className="space-y-4">{renderChat()}</div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 py-4">
        <div className="max-w-2xl mx-auto">{renderChatInput()}</div>
      </div>
    </div>
  );
}
