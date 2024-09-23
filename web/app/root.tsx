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
import Sidebar from "./components/Sidebar";
import Logo from "./components/Logo";

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
  const signInAttempted = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "dark";
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

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white dark:bg-zinc-900 text-black dark:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [isOpen, setIsOpen] = useState(false); // State to manage sidebar visibility
  const data = useLoaderData<typeof loader>();

  // Function to toggle the sidebar open/close state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
      <div className="flex h-full">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-grow flex flex-col">
          <main className="flex-grow overflow-y-auto">
            <Outlet context={{ isOpen }} />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
