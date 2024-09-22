import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { useState, useEffect, useRef } from "react";

import "./styles/tailwind.css";
import { supabaseClient } from "./services/supabase";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader: LoaderFunction = async () => {
  return json({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme, setTheme] = useState("dark");
  const signInAttempted = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "dark";
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    // Make ENV available to the window object
    window.ENV = data.ENV;

    const signInAnonymously = async () => {
      if (signInAttempted.current) return;
      signInAttempted.current = true;

      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (!session) {
        await supabaseClient.auth.signInAnonymously();
      }
    };

    signInAnonymously();
  }, []);

  // const toggleTheme = () => {
  //   const newTheme = theme === "light" ? "dark" : "light";
  //   setTheme(newTheme);
  //   localStorage.setItem("theme", newTheme);
  //   document.documentElement.classList.toggle("dark", newTheme === "dark");
  // };

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-zinc-900 text-black dark:text-white">
        {/* <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 bg-zinc-200 dark:bg-zinc-700 rounded"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button> */}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const data = useLoaderData<typeof loader>();

  return (
    <QueryClientProvider client={queryClient}>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
      <Outlet />
    </QueryClientProvider>
  );
}
