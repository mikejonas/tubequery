import React, { createContext, useState, useContext } from "react";

interface VideoContextType {
  seekTo: number | null;
  setSeekTo: (time: number | null) => void;
}

export const VideoContext = createContext<VideoContextType>({
  seekTo: null,
  setSeekTo: () => {},
});

export const VideoProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [seekTo, setSeekTo] = useState<number | null>(null);

  return (
    <VideoContext.Provider value={{ seekTo, setSeekTo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
