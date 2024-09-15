import { Menu } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full max-w-2xl mx-auto p-6">
      <Logo />
      <button className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
}
