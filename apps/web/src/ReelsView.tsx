import { useEffect, useRef } from "react";
import { useVideoSearch, usePopularVideos, useMediaTracking, type MediaVideo } from "media-react";
import { useReelSwiper } from "media-ui-react";

export interface ReelsViewProps {
  query: string;
}

export function ReelsView({ query }: ReelsViewProps) {
  const search = useVideoSearch({ query, enabled: Boolean(query) });
  const popular = usePopularVideos();
  const { trackView } = useMediaTracking();

  const active = query ? search : popular;
  const { items, loading, error, hasNextPage, loadMore } = active;

  const reel = useReelSwiper<MediaVideo>({
    items,
    onActiveIndexChange: (_, item) => trackView(item, "reel"),
  });

  // Load more when nearing the end of the loaded items.
  useEffect(() => {
    if (hasNextPage && reel.activeIndex >= items.length - 2) {
      loadMore();
    }
  }, [reel.activeIndex, items.length, hasNextPage, loadMore]);

  if (error) {
    return <div className="error-state">Couldn't load videos: {error.message}</div>;
  }
  if (loading && items.length === 0) {
    return <p className="status-text">Loading reels…</p>;
  }
  if (items.length === 0) {
    return <p className="status-text">No videos yet — try a search.</p>;
  }

  return (
    <div className="reel-container" {...reel.getContainerProps()}>
      {items.map((video, index) => (
        <ReelItem key={video.id} video={video} index={index} isActive={index === reel.activeIndex} reel={reel} />
      ))}
    </div>
  );
}

function ReelItem({
  video,
  index,
  isActive,
  reel,
}: {
  video: MediaVideo;
  index: number;
  isActive: boolean;
  reel: ReturnType<typeof useReelSwiper<MediaVideo>>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const file = video.videoFiles.find((f) => f.quality === "sd") ?? video.videoFiles[0];

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.play().catch(() => {
        /* autoplay can be blocked before user interaction — non-fatal */
      });
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="reel-item" {...reel.getItemProps(index)}>
      <video
        ref={videoRef}
        className="reel-video"
        src={file?.link}
        poster={video.image}
        muted
        loop
        playsInline
      />
      <div className="reel-meta">
        <span>
          By{" "}
          <a href={video.userUrl} target="_blank" rel="noreferrer">
            {video.user}
          </a>
        </span>
      </div>
    </div>
  );
}
