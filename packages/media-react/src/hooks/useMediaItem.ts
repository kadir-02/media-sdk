import { useEffect, useState } from "react";
import type { MediaPhoto, MediaVideo } from "media-core";
import { useMediaClient } from "../MediaProvider.js";

export interface UseMediaItemState<T> {
  item: T | null;
  loading: boolean;
  error: Error | null;
}

export function usePhoto(id: number | null): UseMediaItemState<MediaPhoto> {
  const client = useMediaClient();
  const [item, setItem] = useState<MediaPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    client
      .getPhoto(id)
      .then((res) => !cancelled && setItem(res))
      .catch((err) => !cancelled && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [client, id]);

  return { item, loading, error };
}

export function useVideo(id: number | null): UseMediaItemState<MediaVideo> {
  const client = useMediaClient();
  const [item, setItem] = useState<MediaVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    client
      .getVideo(id)
      .then((res) => !cancelled && setItem(res))
      .catch((err) => !cancelled && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [client, id]);

  return { item, loading, error };
}
