import { BotMessageSquare } from "lucide-react";
import { Link } from "@remix-run/react";

interface LogoProps {
  size?: "base" | "large";
}

const Logo = ({ size = "base" }: LogoProps) => {
  const iconSizeClass = size === "large" ? "w-8 h-8" : "w-5 h-5";
  const textSizeClass = size === "large" ? "text-2xl" : "text-xl";

  return (
    <Link
      to="/"
      className="flex justify-center items-center space-x-1 hover:opacity-80 transition-opacity"
    >
      <BotMessageSquare
        className={`${iconSizeClass} text-zinc-300`} // Apply size class conditionally
        strokeWidth={2}
      />
      <h1 className={`${textSizeClass} font-normal text-zinc-300`}>
        tubequery
      </h1>
    </Link>
  );
};

export default Logo;
