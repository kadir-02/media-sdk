import { useMediaTracking, type MediaPhoto } from "media-react";
import { useLightbox } from "media-ui-react";

export interface PhotoLightboxProps {
  photos: MediaPhoto[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const { trackView, trackDownload } = useMediaTracking();

  const lightbox = useLightbox<MediaPhoto>({
    items: photos,
    isOpen: true,
    initialIndex,
    onClose,
    onIndexChange: (_, item) => trackView(item, "lightbox"),
  });

  const photo = lightbox.currentItem;
  if (!photo) return null;

  return (
    <div className="lightbox-overlay" {...lightbox.getOverlayProps()}>
      <div className="lightbox-dialog" {...lightbox.getDialogProps()}>
        <button className="lightbox-close" {...lightbox.getCloseButtonProps()}>
          ✕
        </button>
        <button className="lightbox-prev" {...lightbox.getPrevButtonProps()}>
          ‹
        </button>
        <img className="lightbox-image" src={photo.src.large} alt={photo.alt} />
        <button className="lightbox-next" {...lightbox.getNextButtonProps()}>
          ›
        </button>
        <div className="lightbox-meta">
          <span>
            Photo by{" "}
            <a href={photo.photographerUrl} target="_blank" rel="noreferrer">
              {photo.photographer}
            </a>
          </span>
          <a
            className="lightbox-download"
            href={photo.src.original}
            download
            onClick={() => trackDownload(photo, "original")}
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
