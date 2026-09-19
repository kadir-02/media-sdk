import { usePhotoSearch, useCuratedPhotos, useMediaTracking, type MediaPhoto } from "media-react";
import { useGrid } from "media-ui-react";

export interface PhotoGridProps {
  query: string;
  onSelect: (photo: MediaPhoto, index: number, allPhotos: MediaPhoto[]) => void;
}

export function PhotoGrid({ query, onSelect }: PhotoGridProps) {
  const search = usePhotoSearch({ query, enabled: Boolean(query) });
  const curated = useCuratedPhotos();
  const { trackView } = useMediaTracking();

  const active = query ? search : curated;
  const { items, loading, loadingMore, error, hasNextPage } = active;

  const grid = useGrid<MediaPhoto>({
    items,
    getKey: (item) => item.id,
    onLoadMore: active.loadMore,
    hasNextPage,
    loading,
    loadingMore,
  });

  if (error) {
    return <div className="error-state">Couldn't load photos: {error.message}</div>;
  }

  return (
    <div>
      <div className="grid" {...grid.getGridProps()}>
        {items.map((photo, index) => {
          const { key, ...itemProps } = grid.getItemProps(photo, index, {
            onClick: () => {
              trackView(photo, "grid");
              onSelect(photo, index, items);
            },
          });
          return (
            <button key={key} className="grid-cell" {...itemProps}>
              <img src={photo.src.small} alt={photo.alt} loading="lazy" />
            </button>
          );
        })}
      </div>

      <div ref={grid.sentinelRef} className="sentinel" />

      {loading && items.length === 0 && <p className="status-text">Loading photos…</p>}
      {loadingMore && <p className="status-text">Loading more…</p>}
      {!loading && items.length === 0 && <p className="status-text">No results yet — try a search.</p>}
      {hasNextPage && !loadingMore && (
        <button className="load-more-btn" onClick={grid.loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
