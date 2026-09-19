import type { MediaPhoto, MediaVideo } from "./types.js";

interface RawPexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string | null;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
  alt: string | null;
}

interface RawPexelsVideoFile {
  id: number;
  quality: string;
  width: number | null;
  height: number | null;
  file_type: string;
  link: string;
}

interface RawPexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  duration: number;
  image: string;
  user: { name: string; url: string };
  video_files: RawPexelsVideoFile[];
}

export interface RawPhotoSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  photos: RawPexelsPhoto[];
}

export interface RawVideoSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  videos: RawPexelsVideo[];
}

export function mapPhoto(raw: RawPexelsPhoto): MediaPhoto {
  return {
    kind: "photo",
    id: raw.id,
    width: raw.width,
    height: raw.height,
    url: raw.url,
    photographer: raw.photographer,
    photographerUrl: raw.photographer_url,
    avgColor: raw.avg_color,
    src: {
      original: raw.src.original,
      large: raw.src.large,
      medium: raw.src.medium,
      small: raw.src.small,
      thumbnail: raw.src.tiny,
    },
    alt: raw.alt ?? "",
  };
}

export function mapVideo(raw: RawPexelsVideo): MediaVideo {
  return {
    kind: "video",
    id: raw.id,
    width: raw.width,
    height: raw.height,
    url: raw.url,
    durationSeconds: raw.duration,
    image: raw.image,
    user: raw.user?.name ?? "Unknown",
    userUrl: raw.user?.url ?? "",
    videoFiles: (raw.video_files ?? []).map((f) => ({
      id: f.id,
      quality: f.quality,
      width: f.width,
      height: f.height,
      fileType: f.file_type,
      link: f.link,
    })),
  };
}
