// app/routes/_index.tsx
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useNavigate } from "@remix-run/react";

export default function Index() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In a real implementation, you'd want to validate and maybe fetch the data before navigating
    setTimeout(() => {
      setLoading(false);
      navigate(`/result?url=${encodeURIComponent(url)}`);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 dark:bg-zync-900">
      <h1 className="text-3xl font-bold text-center dark:text-white">
        TubeQuery
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="url"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="dark:bg-zinc-800 dark:text-white"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {loading ? "Generating Summary..." : "Generate Summary"}
        </Button>
      </form>
    </div>
  );
}
