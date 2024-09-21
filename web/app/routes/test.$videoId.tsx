import React, { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import { useParams } from "@remix-run/react";
import Markdown from "~/components/Markdown";
import { useMutation } from "@tanstack/react-query";
import { postChat } from "~/api-calls/chat";

export default function ResultContent() {
  const [question, setQuestion] = useState("");
  const [responding, setResponding] = useState(false);
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { videoId } = useParams() as { videoId: string };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (question: string) => postChat(videoId, question),
    onMutate: () => {
      setResponding(true);
      setChat((prev) => [...prev, { question, answer: "" }]);
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
          <div className="pv-3 ">{renderQuestion(item.question)}</div>
          <div className="pv-3 ">
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
        <main className="max-w-2xl mx-auto p-6">{renderChat()}</main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 py-4">
        <div className="max-w-2xl mx-auto">{renderChatInput()}</div>
      </div>
    </div>
  );
}
