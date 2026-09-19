import { useCallback, useEffect, useRef } from "react";
import { mergeProps } from "../shared/propGetters.js";

export interface UseGridOptions<T> {
  items: T[];
  /** Stable key per item, used for the getItemProps `key`/`data-key`. */
  getKey: (item: T, index: number) => string | number;
  /** Called when the load-more sentinel becomes visible, or the consumer calls loadMore() manually. */
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  /** IntersectionObserver rootMargin for the sentinel — how far ahead to prefetch. Default '200px'. */
  rootMargin?: string;
  /** Set false to disable the IntersectionObserver auto-load and rely on manual loadMore() only. */
  autoLoadOnScroll?: boolean;
}

export interface GridRootProps {
  role: string;
  "aria-busy": boolean;
  [key: string]: any;
}

export interface GridItemProps {
  key: string | number;
  "data-grid-item": string | number;
  role: string;
  [key: string]: any;
}

export interface UseGridReturn<T> {
  getGridProps: (external?: Partial<GridRootProps>) => GridRootProps;
  getItemProps: (item: T, index: number, external?: Partial<GridItemProps>) => GridItemProps;
  /** Attach to a sentinel element (e.g. a div at the end of the grid) to auto-trigger loadMore. */
  sentinelRef: (node: Element | null) => void;
  /** Trigger a load-more manually, e.g. from a "Load more" button. */
  loadMore: () => void;
  hasNextPage: boolean;
  loading: boolean;
  loadingMore: boolean;
}

/**
 * Headless grid: no rendering, no styles. Ships the a11y/data attributes
 * for the grid container and each cell, plus infinite-scroll wiring via an
 * IntersectionObserver sentinel. The consumer renders their own markup
 * (CSS grid, flex, whatever) and spreads the returned props onto it.
 */
export function useGrid<T>(options: UseGridOptions<T>): UseGridReturn<T> {
  const {
    getKey,
    onLoadMore,
    hasNextPage = false,
    loading = false,
    loadingMore = false,
    rootMargin = "200px",
    autoLoadOnScroll = true,
  } = options;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasNextPage) return;
    onLoadMore?.();
  }, [loading, loadingMore, hasNextPage, onLoadMore]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const sentinelRef = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      if (!node || !autoLoadOnScroll || typeof IntersectionObserver === "undefined") return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            loadMoreRef.current();
          }
        },
        { rootMargin }
      );
      observerRef.current.observe(node);
    },
    [autoLoadOnScroll, rootMargin]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const getGridProps = useCallback(
    (external?: Partial<GridRootProps>) =>
      mergeProps({ role: "list", "aria-busy": loading || loadingMore }, external),
    [loading, loadingMore]
  );

  const getItemProps = useCallback(
    (item: T, index: number, external?: Partial<GridItemProps>) =>
      mergeProps(
        { key: getKey(item, index), "data-grid-item": getKey(item, index), role: "listitem" },
        external
      ),
    [getKey]
  );

  return { getGridProps, getItemProps, sentinelRef, loadMore, hasNextPage, loading, loadingMore };
}
