import { useEffect } from "react";
import type { MediaEventListener, MediaEventName, MediaItem } from "media-core";
import { useMediaClient } from "../MediaProvider.js";

export function useMediaEvent<E extends MediaEventName>(event: E, listener: MediaEventListener<E>): void {
  const client = useMediaClient();
  useEffect(() => {
    const unsubscribe = client.on(event, listener);
    return unsubscribe;
  }, [client, event, listener]);
}

export interface MediaTracking {
  trackView: (item: MediaItem, source?: string) => void;
  trackDownload: (item: MediaItem, variant?: string) => void;
}

export function useMediaTracking(): MediaTracking {
  const client = useMediaClient();
  return {
    trackView: (item, source) => client.trackView(item, source),
    trackDownload: (item, variant) => client.trackDownload(item, variant),
  };
}
