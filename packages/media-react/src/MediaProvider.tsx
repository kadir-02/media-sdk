import React, { createContext, useContext, useMemo } from "react";
import { MediaClient, type MediaCoreConfig } from "media-core";

const MediaClientContext = createContext<MediaClient | null>(null);

export interface MediaProviderProps extends MediaCoreConfig {
  children: React.ReactNode;
  client?: MediaClient;
}

export function MediaProvider({ children, client, ...config }: MediaProviderProps) {
  const instance = useMemo(() => {
    if (client) return client;
    return new MediaClient(config as MediaCoreConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, config.apiKey, config.baseUrl, config.defaultPerPage, config.cacheTtlMs]);

  return <MediaClientContext.Provider value={instance}>{children}</MediaClientContext.Provider>;
}

/** Internal: throws a clear error if used outside a MediaProvider. */
export function useMediaClient(): MediaClient {
  const client = useContext(MediaClientContext);
  if (!client) {
    throw new Error("useMediaClient (and every media-react hook) must be used inside <MediaProvider>.");
  }
  return client;
}
