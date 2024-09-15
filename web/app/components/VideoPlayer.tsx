interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  return (
    <div className="mb-6 relative w-full aspect-video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&rel=0`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="w-full h-full border-0"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
