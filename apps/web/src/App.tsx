import { useState, useCallback } from "react";
import { useMediaEvent, type MediaPhoto } from "media-react";
import { SearchBar } from "./SearchBar.js";
import { PhotoGrid } from "./PhotoGrid.js";
import { PhotoLightbox } from "./PhotoLightbox.js";
import { ReelsView } from "./ReelsView.js";

interface LightboxState {
  photos: MediaPhoto[];
  index: number;
}

export function App() {
  const [mode, setMode] = useState<"photos" | "videos">("photos");
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const logActivity = useCallback((line: string) => {
    setActivityLog((prev) => [line, ...prev].slice(0, 6));
  }, []);

  useMediaEvent(
    "view",
    useCallback((p) => logActivity(`👁 viewed ${p.item.kind} #${p.item.id}${p.source ? ` (${p.source})` : ""}`), [
      logActivity,
    ])
  );
  useMediaEvent(
    "download",
    useCallback((p) => logActivity(`⬇ downloaded ${p.item.kind} #${p.item.id}`), [logActivity])
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Media Explorer</h1>
        <p className="app-subtitle">Powered by Pexels</p>
      </header>

      <SearchBar mode={mode} onModeChange={setMode} onSearch={setQuery} />

      <main className="app-main">
        {mode === "photos" ? (
          <PhotoGrid query={query} onSelect={(_photo, index, allPhotos) => setLightbox({ photos: allPhotos, index })} />
        ) : (
          <ReelsView query={query} />
        )}
      </main>

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      {activityLog.length > 0 && (
        <aside className="activity-log" aria-live="polite">
          <h2>Activity</h2>
          <ul>
            {activityLog.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
