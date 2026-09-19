import { useCallback } from "react";
import type { MediaPhoto, MediaVideo, SearchParams } from "media-core";
import { useMediaClient } from "../MediaProvider.js";
import { usePaginatedList, type PaginatedListState } from "./usePaginatedList.js";

export interface UsePhotoSearchOptions {
  query: string;
  orientation?: SearchParams["orientation"];
  perPage?: number;
  /** Set false to skip fetching, e.g. while the search box is empty. */
  enabled?: boolean;
}

export function usePhotoSearch(options: UsePhotoSearchOptions): PaginatedListState<MediaPhoto> {
  const client = useMediaClient();
  const { query, orientation, perPage, enabled = Boolean(query) } = options;

  const fetcher = useCallback(
    (page: number) => client.searchPhotos({ query, orientation, perPage, page }),
    [client, query, orientation, perPage]
  );

  return usePaginatedList(fetcher, [query, orientation, perPage], { enabled });
}

export function useCuratedPhotos(perPage?: number): PaginatedListState<MediaPhoto> {
  const client = useMediaClient();
  const fetcher = useCallback((page: number) => client.curatedPhotos({ page, perPage }), [client, perPage]);
  return usePaginatedList(fetcher, [perPage]);
}

export interface UseVideoSearchOptions {
  query: string;
  orientation?: SearchParams["orientation"];
  perPage?: number;
  enabled?: boolean;
}

export function useVideoSearch(options: UseVideoSearchOptions): PaginatedListState<MediaVideo> {
  const client = useMediaClient();
  const { query, orientation, perPage, enabled = Boolean(query) } = options;

  const fetcher = useCallback(
    (page: number) => client.searchVideos({ query, orientation, perPage, page }),
    [client, query, orientation, perPage]
  );

  return usePaginatedList(fetcher, [query, orientation, perPage], { enabled });
}

export function usePopularVideos(perPage?: number): PaginatedListState<MediaVideo> {
  const client = useMediaClient();
  const fetcher = useCallback((page: number) => client.popularVideos({ page, perPage }), [client, perPage]);
  return usePaginatedList(fetcher, [perPage]);
}
