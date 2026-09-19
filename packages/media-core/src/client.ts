import { MediaEventEmitter } from "./emitter.js";
import { RequestCache } from "./cache.js";
import { mapPhoto, mapVideo } from "./pexels-mapper.js";
import type { RawPhotoSearchResponse, RawVideoSearchResponse } from "./pexels-mapper.js";
import {
  MediaApiError,
  type MediaCoreConfig,
  type MediaEventName,
  type MediaEventListener,
  type MediaPhoto,
  type MediaVideo,
  type MediaSearchResult,
  type SearchParams,
  type ListParams,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.pexels.com/v1"; // photos
const VIDEO_BASE_URL = "https://api.pexels.com/videos"; // videos live on a different path


//  MediaClient is the single entry point for media-core.

export class MediaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly videoBaseUrl: string;
  private readonly defaultPerPage: number;
  private readonly cache: RequestCache;
  private readonly emitter = new MediaEventEmitter();

  constructor(config: MediaCoreConfig) {
    if (!config.apiKey) {
      throw new Error("MediaClient: apiKey is required");
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.videoBaseUrl = config.baseUrl
      ? config.baseUrl.replace(/\/v1$/, "/videos")
      : VIDEO_BASE_URL;
    this.defaultPerPage = config.defaultPerPage ?? 20;
    this.cache = new RequestCache(config.cacheTtlMs ?? 60_000);

    // Default listener: log every activity event. Apps can subscribe
    // independently on top of this (see media-react's useMediaEvents).
    this.emitter.on("view", (p) => console.log("[media-core] view", p.item.kind, p.item.id));
    this.emitter.on("download", (p) =>
      console.log("[media-core] download", p.item.kind, p.item.id, p.variant ?? "")
    );
    this.emitter.on("error", (p) => console.error("[media-core] error in", p.context, p.error));
  }

  // ---- Event subscription (public surface over the private emitter) ----

  on<E extends MediaEventName>(event: E, listener: MediaEventListener<E>): () => void {
    return this.emitter.on(event, listener);
  }

  off<E extends MediaEventName>(event: E, listener: MediaEventListener<E>): void {
    this.emitter.off(event, listener);
  }

  /** Call when a consumer displays an item, e.g. lightbox open / reel becomes active. */
  trackView(item: MediaPhoto | MediaVideo, source?: string): void {
    this.emitter.emit("view", { item, source });
  }

  /** Call when a consumer initiates a download/save of an item. */
  trackDownload(item: MediaPhoto | MediaVideo, variant?: string): void {
    this.emitter.emit("download", { item, variant });
  }

  // ---- Photos ----

  async searchPhotos(params: SearchParams): Promise<MediaSearchResult<MediaPhoto>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? this.defaultPerPage;
    const search = new URLSearchParams({
      query: params.query,
      page: String(page),
      per_page: String(perPage),
    });
    if (params.orientation) search.set("orientation", params.orientation);

    const key = `photos:search:${search.toString()}`;
    const raw = await this.cache.getOrFetch(key, () =>
      this.request<RawPhotoSearchResponse>(`${this.baseUrl}/search?${search}`, "searchPhotos")
    );
    return this.toPhotoResult(raw);
  }

  async curatedPhotos(params: ListParams = {}): Promise<MediaSearchResult<MediaPhoto>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? this.defaultPerPage;
    const search = new URLSearchParams({ page: String(page), per_page: String(perPage) });

    const key = `photos:curated:${search.toString()}`;
    const raw = await this.cache.getOrFetch(key, () =>
      this.request<RawPhotoSearchResponse>(`${this.baseUrl}/curated?${search}`, "curatedPhotos")
    );
    return this.toPhotoResult(raw);
  }

  async getPhoto(id: number): Promise<MediaPhoto> {
    const key = `photos:item:${id}`;
    const raw = await this.cache.getOrFetch(key, () =>
      this.request<Parameters<typeof mapPhoto>[0]>(`${this.baseUrl}/photos/${id}`, "getPhoto")
    );
    return mapPhoto(raw);
  }

  // ---- Videos ----

  async searchVideos(params: SearchParams): Promise<MediaSearchResult<MediaVideo>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? this.defaultPerPage;
    const search = new URLSearchParams({
      query: params.query,
      page: String(page),
      per_page: String(perPage),
    });
    if (params.orientation) search.set("orientation", params.orientation);

    const key = `videos:search:${search.toString()}`;
    const raw = await this.cache.getOrFetch(key, () =>
      this.request<RawVideoSearchResponse>(`${this.videoBaseUrl}/search?${search}`, "searchVideos")
    );
    return this.toVideoResult(raw);
  }

  async popularVideos(params: ListParams = {}): Promise<MediaSearchResult<MediaVideo>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? this.defaultPerPage;
    const search = new URLSearchParams({ page: String(page), per_page: String(perPage) });

    const key = `videos:popular:${search.toString()}`;
    const raw = await this.cache.getOrFetch(key, () =>
      this.request<RawVideoSearchResponse>(`${this.videoBaseUrl}/popular?${search}`, "popularVideos")
    );
    return this.toVideoResult(raw);
  }

  async getVideo(id: number): Promise<MediaVideo> {
    const key = `videos:item:${id}`;
    const raw = await this.cache.getOrFetch(key, () =>
      this.request<Parameters<typeof mapVideo>[0]>(`${this.videoBaseUrl}/videos/${id}`, "getVideo")
    );
    return mapVideo(raw);
  }

  // ---- internals ----

  private toPhotoResult(raw: RawPhotoSearchResponse): MediaSearchResult<MediaPhoto> {
    const hasNextPage = Boolean(raw.next_page);
    return {
      items: raw.photos.map(mapPhoto),
      page: raw.page,
      perPage: raw.per_page,
      totalResults: raw.total_results,
      hasNextPage,
      nextPage: hasNextPage ? raw.page + 1 : null,
    };
  }

  private toVideoResult(raw: RawVideoSearchResponse): MediaSearchResult<MediaVideo> {
    const hasNextPage = Boolean(raw.next_page);
    return {
      items: raw.videos.map(mapVideo),
      page: raw.page,
      perPage: raw.per_page,
      totalResults: raw.total_results,
      hasNextPage,
      nextPage: hasNextPage ? raw.page + 1 : null,
    };
  }

  private async request<T>(url: string, context: string): Promise<T> {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Authorization: this.apiKey },
      });
    } catch (err) {
      const apiErr = new MediaApiError(`Network error in ${context}`, 0, err);
      this.emitter.emit("error", { error: apiErr, context });
      throw apiErr;
    }

    if (!res.ok) {
      const apiErr = new MediaApiError(
        `Pexels API error ${res.status} in ${context}`,
        res.status
      );
      this.emitter.emit("error", { error: apiErr, context });
      throw apiErr;
    }

    return (await res.json()) as T;
  }
}
