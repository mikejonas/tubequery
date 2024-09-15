import { BotMessageSquare } from "lucide-react";
import { Link } from "@remix-run/react";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
    >
      <BotMessageSquare
        className="w-7 h-7 text-black dark:text-white"
        strokeWidth={2}
      />
      <h1 className="text-2xl font-normal">tubequery</h1>
    </Link>
  );
};

export default Logo;
