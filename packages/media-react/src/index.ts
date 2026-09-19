export { MediaProvider, useMediaClient } from "./MediaProvider.js";
export type { MediaProviderProps } from "./MediaProvider.js";

export { usePhotoSearch, useCuratedPhotos, useVideoSearch, usePopularVideos } from "./hooks/useMediaLists.js";
export type { UsePhotoSearchOptions, UseVideoSearchOptions } from "./hooks/useMediaLists.js";

export { usePhoto, useVideo } from "./hooks/useMediaItem.js";
export type { UseMediaItemState } from "./hooks/useMediaItem.js";

export { useMediaEvent, useMediaTracking } from "./hooks/useMediaEvents.js";
export type { MediaTracking } from "./hooks/useMediaEvents.js";

export type { PaginatedListState } from "./hooks/usePaginatedList.js";

// Re-export the domain types consumers need to type their own props,
// without re-exporting MediaClient itself (that stays wrapper-internal).
export type { MediaItem, MediaPhoto, MediaVideo, MediaKind, MediaSearchResult } from "media-core";
// MediaApiError is a class (used with `instanceof`), so it's a value export, not type-only.
export { MediaApiError } from "media-core";
