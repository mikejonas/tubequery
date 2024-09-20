import React, { FC } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import { useVideoContext } from "~/context/VideoContext";

// Updated TIMESTAMP_REGEX to match various time formats including hours
const TIMESTAMP_REGEX = /\[(?:\d{1,2}:)?\d{1,2}:\d{2}\]/g;

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
    const timeparts = timestamp.slice(1, -1).split(":").map(Number);
    let totalSeconds;

    if (timeparts.length === 3) {
      // Format: [HH:MM:SS]
      const [hours, minutes, seconds] = timeparts;
      totalSeconds = hours * 3600 + minutes * 60 + seconds;
    } else {
      // Format: [MM:SS]
      const [minutes, seconds] = timeparts;
      totalSeconds = minutes * 60 + seconds;
    }

    setSeekTo(totalSeconds);
  };

  const renderChildren = (children: React.ReactNode): React.ReactNode => {
    if (typeof children === "string") {
      return processText(children).map((part, index) =>
        TIMESTAMP_REGEX.test(part) ? (
          <span
            key={index}
            className="timestamp-class text-blue-300 font-normal cursor-pointer align-middle text-xs"
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
    h2: ({ children, ...props }: React.PropsWithChildren) => (
      <h2 {...props}>{renderChildren(children)}</h2>
    ),
    h3: ({ children, ...props }: React.PropsWithChildren) => (
      <h3 {...props}>{renderChildren(children)}</h3>
    ),
    p: ({ children, ...props }: React.PropsWithChildren) => (
      <p {...props}>{renderChildren(children)}</p>
    ),
    ul: (props: React.PropsWithChildren) => <ul {...props} />,
    li: ({ children, ...props }: React.PropsWithChildren) => (
      <li {...props}>{renderChildren(children)}</li>
    ),
  };

  return (
    <ReactMarkdown
      {...props}
      components={customComponents}
      className="markdown"
    >
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
