// app/routes/_index.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useNavigate } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { extractVideoId } from "~/utils";
import Footer from "~/components/Footer";
import Logo from "~/components/Logo";

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
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100">
      {/* Sticky Header with Logo */}
      <header className="sticky top-0 p-4 z-10">
        <Logo size="base" />
      </header>

      {/* Main Content */}
      <main className="flex-grow mx-auto w-full p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-10">Summarize YouTube Videos</h1>
        <form onSubmit={handleSubmit} className="relative max-w-xl w-full">
          <Input
            ref={inputRef}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full pr-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400 rounded-lg h-12 text-sm"
          />
          <Button
            type="submit"
            className="absolute right-1 top-1 bottom-1 h-auto w-10 rounded-md bg-zinc-700 hover:bg-zinc-600"
            disabled={!url.trim()}
          >
            <ArrowRight className="h-5 w-5 text-zinc-100" />
            <span className="sr-only">Generate Summary</span>
          </Button>
        </form>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
