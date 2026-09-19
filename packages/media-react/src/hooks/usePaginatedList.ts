import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem, MediaSearchResult } from "media-core";

export interface PaginatedListState<T extends MediaItem> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  totalResults: number;
  /** Call to fetch the next page and append. No-op if already loading or no next page. */
  loadMore: () => void;
  /** Re-run from page 1, replacing current items. */
  refresh: () => void;
}

type Fetcher<T extends MediaItem> = (page: number) => Promise<MediaSearchResult<T>>;

/**
 * Internal hook: drives any "fetch a page, allow load-more" list. Every
 * public list hook (usePhotoSearch, useCuratedPhotos, useVideoSearch, ...)
 * is a thin wrapper over this so pagination/loading/error behavior stays
 * consistent — this is the "no business logic duplicated per hook" rule
 * applied inside the wrapper package itself.
 *
 * `deps` should capture anything that should reset pagination back to page 1
 * (e.g. the search query, orientation filter).
 */
export function usePaginatedList<T extends MediaItem>(
  fetcher: Fetcher<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean } = {}
): PaginatedListState<T> {
  const enabled = options.enabled ?? true;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const nextPageRef = useRef<number | null>(1);
  const requestIdRef = useRef(0);

  const runFetch = useCallback(
    async (page: number, mode: "replace" | "append") => {
      const requestId = ++requestIdRef.current;
      mode === "replace" ? setLoading(true) : setLoadingMore(true);
      setError(null);
      try {
        const result = await fetcher(page);
        if (requestId !== requestIdRef.current) return; // stale response, ignore
        setItems((prev) => (mode === "replace" ? result.items : [...prev, ...result.items]));
        setHasNextPage(result.hasNextPage);
        setTotalResults(result.totalResults);
        nextPageRef.current = result.nextPage;
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetcher]
  );

  useEffect(() => {
    if (!enabled) return;
    nextPageRef.current = 1;
    runFetch(1, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasNextPage || nextPageRef.current == null) return;
    runFetch(nextPageRef.current, "append");
  }, [loading, loadingMore, hasNextPage, runFetch]);

  const refresh = useCallback(() => {
    nextPageRef.current = 1;
    runFetch(1, "replace");
  }, [runFetch]);

  return { items, loading, loadingMore, error, hasNextPage, totalResults, loadMore, refresh };
}
