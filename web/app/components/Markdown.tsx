import React, { FC } from "react";
import { ChevronRight } from "lucide-react";
import ReactMarkdown, { Options } from "react-markdown";
import { useVideoContext } from "~/context/VideoContext";

// Improved TIMESTAMP_REGEX to match various time formats
const TIMESTAMP_REGEX = /\[\d{1,2}:\d{2}\]/g;

// Helper function to split and detect timestamps in the text
const processText = (text: string) => {
  const parts = text.split(TIMESTAMP_REGEX); // split text by the regex
  const matches = text.match(TIMESTAMP_REGEX) || []; // find all matches for timestamps
  return parts.flatMap(
    (part, index) => (index < matches.length ? [part, matches[index]] : [part]) // alternate between text and timestamps
  );
};

const Markdown: FC<Options> = ({ children, ...props }) => {
  const { setSeekTo } = useVideoContext();

  const handleTimestampClick = (timestamp: string) => {
    const [minutes, seconds] = timestamp.slice(1, -1).split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;
    setSeekTo(totalSeconds);
  };

  const renderChildren = (children: React.ReactNode): React.ReactNode => {
    if (typeof children === "string") {
      return processText(children).map((part, index) =>
        TIMESTAMP_REGEX.test(part) ? (
          <span
            key={index}
            className="timestamp-class text-blue-300 font-normal cursor-pointer vertical-middle text-xs"
            onClick={() => handleTimestampClick(part)}
            onKeyDown={(e) => e.key === "Enter" && handleTimestampClick(part)}
            role="button"
            tabIndex={0}
          >
            {part}
          </span>
        ) : (
          part
        )
      );
    }

    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <React.Fragment key={index}>{renderChildren(child)}</React.Fragment>
      ));
    }

    return children;
  };

  const customComponents = {
    h3: ({ children, ...props }: React.PropsWithChildren) => (
      <h3
        {...props}
        className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2"
      >
        {renderChildren(children)}
      </h3>
    ),
    p: ({ children, ...props }: React.PropsWithChildren) => (
      <p
        {...props}
        className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
      >
        {renderChildren(children)}
      </p>
    ),
    ul: (props: React.PropsWithChildren) => (
      <ul
        {...props}
        className="text-sm leading-relaxed space-y-2 text-zinc-700 dark:text-zinc-300"
      />
    ),
    li: ({ children, ...props }: React.PropsWithChildren) => (
      <li {...props} className="flex items-start">
        <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mr-2 mt-1 flex-shrink-0" />
        <span>{renderChildren(children)}</span>
      </li>
    ),
  };

  return (
    <ReactMarkdown {...props} components={customComponents}>
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
