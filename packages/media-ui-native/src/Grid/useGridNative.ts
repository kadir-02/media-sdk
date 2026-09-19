import { useCallback, useRef } from "react";

export interface UseGridNativeOptions<T> {
  items: T[];
  getKey: (item: T, index: number) => string | number;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
}

export interface UseGridNativeReturn<T> {
  /** Spread onto a FlatList: keyExtractor, onEndReached, onEndReachedThreshold. */
  getListProps: () => {
    keyExtractor: (item: T, index: number) => string;
    onEndReached: () => void;
    onEndReachedThreshold: number;
  };
  loadMore: () => void;
  hasNextPage: boolean;
  loading: boolean;
  loadingMore: boolean;
}


export function useGridNative<T>(options: UseGridNativeOptions<T>): UseGridNativeReturn<T> {
  const { getKey, onLoadMore, hasNextPage = false, loading = false, loadingMore = false } = options;

  const loadingRef = useRef({ loading, loadingMore, hasNextPage });
  loadingRef.current = { loading, loadingMore, hasNextPage };

  const loadMore = useCallback(() => {
    const { loading: l, loadingMore: lm, hasNextPage: hnp } = loadingRef.current;
    if (l || lm || !hnp) return;
    onLoadMore?.();
  }, [onLoadMore]);

  const getListProps = useCallback(
    () => ({
      keyExtractor: (item: T, index: number) => String(getKey(item, index)),
      onEndReached: loadMore,
      onEndReachedThreshold: 0.5,
    }),
    [getKey, loadMore]
  );

  return { getListProps, loadMore, hasNextPage, loading, loadingMore };
}
