
export interface MediaCoreConfig {
  apiKey: string;
  baseUrl?: string;
  defaultPerPage?: number;
  cacheTtlMs?: number;
}

export type MediaKind = "photo" | "video";

export interface MediaPhoto {
  kind: "photo";
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographerUrl: string;
  avgColor: string | null;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  };
  alt: string;
}

export interface MediaVideoFile {
  id: number;
  quality: string;
  width: number | null;
  height: number | null;
  fileType: string;
  link: string;
}

export interface MediaVideo {
  kind: "video";
  id: number;
  width: number;
  height: number;
  url: string;
  durationSeconds: number;
  image: string;
  user: string;
  userUrl: string;
  videoFiles: MediaVideoFile[];
}

export type MediaItem = MediaPhoto | MediaVideo;

export interface MediaSearchResult<T extends MediaItem = MediaItem> {
  items: T[];
  page: number;
  perPage: number;
  totalResults: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: "landscape" | "portrait" | "square";
}

export interface ListParams {
  page?: number;
  perPage?: number;
}

export class MediaApiError extends Error {
  readonly status: number;
  readonly cause?: unknown;

  constructor(message: string, status: number, cause?: unknown) {
    super(message);
    this.name = "MediaApiError";
    this.status = status;
    this.cause = cause;
  }
}

/** Events emitted by the core client's activity emitter. */
export interface MediaEventMap {
  view: { item: MediaItem; source?: string };
  download: { item: MediaItem; variant?: string };
  error: { error: MediaApiError; context: string };
}

export type MediaEventName = keyof MediaEventMap;

export type MediaEventListener<E extends MediaEventName> = (
  payload: MediaEventMap[E]
) => void;
