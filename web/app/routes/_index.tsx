// app/routes/_index.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useNavigate } from "@remix-run/react";
import Logo from "~/components/Logo";
import { Menu, ArrowRight } from "lucide-react";
import { extractVideoId } from "~/utils";

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="flex-grow">
        <div className="max-w-2xl mx-auto p-6">
          <header className="flex justify-between items-center mb-16">
            <Logo />
            <button className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              <Menu className="w-6 h-6" />
            </button>
          </header>

          <main className="text-center">
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
        </div>
      </div>

      <footer className="mt-auto py-6 text-center text-zinc-600 dark:text-zinc-400">
        <p>&copy; {currentYear} TubeQuery. All rights reserved.</p>
      </footer>
    </div>
  );
}
