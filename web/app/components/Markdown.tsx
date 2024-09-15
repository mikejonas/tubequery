import { ChevronRight } from "lucide-react";
import ReactMarkdown, { Options } from "react-markdown";

const Markdown = ({ children, ...props }: Options) => {
  return (
    <ReactMarkdown
      {...props}
      components={{
        h3: ({ children }) => (
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="text-sm leading-relaxed space-y-2 text-zinc-700 dark:text-zinc-300">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="flex items-start">
            <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mr-2 mt-1 flex-shrink-0" />
            <span>{children}</span>
          </li>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
