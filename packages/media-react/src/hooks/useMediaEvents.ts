import { useEffect } from "react";
import type { MediaEventListener, MediaEventName, MediaItem } from "media-core";
import { useMediaClient } from "../MediaProvider.js";

/**
 * Subscribe to a media-core activity event for the lifetime of the
 * component. This is additive — media-core's default console listener
 * keeps running; this just lets the app (or any component) observe the
 * same events, e.g. to send analytics.
 */
export function useMediaEvent<E extends MediaEventName>(event: E, listener: MediaEventListener<E>): void {
  const client = useMediaClient();
  useEffect(() => {
    const unsubscribe = client.on(event, listener);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, event, listener]);
}

export interface MediaTracking {
  trackView: (item: MediaItem, source?: string) => void;
  trackDownload: (item: MediaItem, variant?: string) => void;
}

/** Imperative helpers for emitting activity events from UI callbacks. */
export function useMediaTracking(): MediaTracking {
  const client = useMediaClient();
  return {
    trackView: (item, source) => client.trackView(item, source),
    trackDownload: (item, variant) => client.trackDownload(item, variant),
  };
}
