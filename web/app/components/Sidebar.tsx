import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActivityHistory } from "~/api-calls/activity";

// Function to generate navigation links from history
const generateVideoLinks = (history: { id: string; title: string }[]) => {
  return history.map((item) => ({
    name: item.title,
    path: `/${item.id}`,
  }));
};

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { data: activityHistory } = useQuery({
    queryKey: ["activity"],
    queryFn: getActivityHistory,
  });

  const navigation = [
    {
      section: "History",
      links: generateVideoLinks(activityHistory ?? []),
    },
  ];

  return (
    <>
      {/* Overlay for small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out z-30 w-64 bg-zinc-950 text-zinc-100`}
      >
        <nav className="h-full flex flex-col">
          <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto mt-16">
            {navigation.map((section) => (
              <div key={section.section}>
                <p className="text-zinc-400 text-xs font-semibold uppercase mb-2">
                  {section.section}
                </p>
                <ul className="space-y-2">
                  {section.links.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center p-2 text-xs font-medium rounded-md transition-colors ${
                          location.pathname === item.path
                            ? "bg-zinc-700 text-zinc-100"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        } whitespace-nowrap overflow-hidden`}
                        onClick={toggleSidebar}
                      >
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer (Logout) */}
          <div className="px-4 py-2 border-t border-zinc-800">
            <Link
              to="/logout"
              className="flex items-center p-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 rounded-md"
              onClick={toggleSidebar}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Link>
          </div>
        </nav>
      </div>

      <button
        className="fixed top-2 left-2 p-2 z-40 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        onClick={toggleSidebar}
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
