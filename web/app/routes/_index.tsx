// app/routes/_index.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useNavigate } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { extractVideoId } from "~/utils";
import Header from "~/components/Header";
import Footer from "~/components/Footer";

export default function Index() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const videoId = extractVideoId(url);
    if (videoId) {
      navigate(`/${videoId}`);
    } else {
      alert("Invalid YouTube URL");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto w-full p-6 text-center">
        <h1 className="text-3xl font-medium mb-6">
          Summarize and Query YouTube Videos
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12">
          Enter a YouTube URL to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="text-lg py-6 dark:bg-zinc-800 dark:text-white"
          />
          <Button
            type="submit"
            className="w-full py-6 text-lg dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Generate Summary
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
