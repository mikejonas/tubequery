// VideoPlayer.tsx
import React, { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player/youtube";

interface VideoPlayerProps {
  videoId: string;
  seekTo: number | null;
}

function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, seekTo }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const isHydrated = useHydrated();

  useEffect(() => {
    if (seekTo !== null && playerRef.current) {
      playerRef.current.seekTo(seekTo, "seconds");
      setPlaying(true);
    }
  }, [seekTo]);

  if (!isHydrated) {
    return <div className="mb-6 relative w-full aspect-video bg-gray-200" />;
  }

  return (
    <div className="mb-6 relative w-full aspect-video">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${videoId}`}
        playing={playing}
        controls
        width="100%"
        height="100%"
        className="w-full h-full"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
    </div>
  );
};

export default VideoPlayer;
