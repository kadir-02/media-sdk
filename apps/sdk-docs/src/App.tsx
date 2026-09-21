import { PropTable, Code, Rule } from "./DocPrimitives.js";

export function App() {
  return (
    <div className="wrap">
      <h1>Media SDK — API Reference</h1>
      <p className="lede">
        <code>media-core</code> (framework-agnostic Pexels client) and its React bindings, <code>media-react</code>{" "}
        / <code>media-native</code>. See the{" "}
        <a href="/">components docs</a> separately for <code>media-ui-react</code>.
      </p>

      <nav className="toc">
        <a href="#media-core">media-core</a>
        <a href="#media-provider">MediaProvider</a>
        <a href="#hooks">Hooks</a>
        <a href="#types">Core types</a>
      </nav>

      <Rule>
        <strong>The API key lives in one place.</strong> <code>MediaClient</code> holds it in a closure-private
        field. It is never returned from any method, and every hook below reads the client from React context —
        never the key itself.
      </Rule>

      <h2 id="media-core">media-core — MediaClient</h2>
      <p>
        The single entry point of the SDK. Construct one via <code>new MediaClient(config)</code>, or — in React —
        let <code>&lt;MediaProvider&gt;</code> construct it for you.
      </p>

      <h3>Constructor config</h3>
      <PropTable
        columns={["Field", "Type", "Notes"]}
        rows={[
          [<code>apiKey</code>, <code>string</code>, "Required. Pexels API key."],
          [<code>baseUrl</code>, <code>string?</code>, "Override base URL, mainly for testing."],
          [<code>defaultPerPage</code>, <code>number?</code>, "Default 20."],
          [<code>cacheTtlMs</code>, <code>number?</code>, "In-memory cache TTL. Default 60,000. Set 0 to disable."],
        ]}
      />

      <h3>Methods</h3>
      <PropTable
        columns={["Method", "Signature", "Notes"]}
        rows={[
          [
            <code>searchPhotos</code>,
            <code>{"(params: SearchParams) => Promise<MediaSearchResult<MediaPhoto>>"}</code>,
            "Cached + de-duped by query string.",
          ],
          [
            <code>curatedPhotos</code>,
            <code>{"(params?: ListParams) => Promise<MediaSearchResult<MediaPhoto>>"}</code>,
            "No query — trending/curated feed.",
          ],
          [<code>getPhoto</code>, <code>{"(id: number) => Promise<MediaPhoto>"}</code>, ""],
          [
            <code>searchVideos</code>,
            <code>{"(params: SearchParams) => Promise<MediaSearchResult<MediaVideo>>"}</code>,
            "",
          ],
          [
            <code>popularVideos</code>,
            <code>{"(params?: ListParams) => Promise<MediaSearchResult<MediaVideo>>"}</code>,
            "",
          ],
          [<code>getVideo</code>, <code>{"(id: number) => Promise<MediaVideo>"}</code>, ""],
          [
            <><code>on</code> / <code>off</code></>,
            <code>{"(event, listener) => unsubscribe"}</code>,
            <>
              Events: <code>view</code>, <code>download</code>, <code>error</code>.
            </>,
          ],
          [
            <code>trackView</code>,
            <code>{"(item, source?) => void"}</code>,
            "Emits a view event. Call when a consumer displays an item.",
          ],
          [
            <code>trackDownload</code>,
            <code>{"(item, variant?) => void"}</code>,
            "Emits a download event.",
          ],
        ]}
      />

      <p>
        Every list method returns a normalized <code>MediaSearchResult</code>:{" "}
        <code>{"{ items, page, perPage, totalResults, hasNextPage, nextPage }"}</code> — pagination is uniform for
        photos and videos.
      </p>

      <h2 id="media-provider">MediaProvider</h2>
      <p>
        Wraps the app (or a subtree) and constructs one <code>MediaClient</code> via React context. This is the
        only place in the app that should see the API key.
      </p>
      <Code>{`import { MediaProvider } from "media-react"; // or "media-native"

<MediaProvider apiKey={import.meta.env.VITE_PEXELS_API_KEY}>
  <App />
</MediaProvider>`}</Code>
      <p>
        Advanced: pass an already-constructed <code>client</code> prop instead of config (e.g. to share one client
        across tests, or across a web + RN codebase).
      </p>

      <h2 id="hooks">Hooks (media-react / media-native)</h2>
      <p>
        <code>media-native</code>'s hooks are intentionally identical in logic — React Native uses the same hook
        rules, so there's no genuine platform fork needed at the data layer (only in the UI layer,{" "}
        <code>media-ui-native</code>).
      </p>

      <h3>List hooks</h3>
      <p>
        All four share the same return shape — <code>PaginatedListState&lt;T&gt;</code>:{" "}
        <code>{"{ items, loading, loadingMore, error, hasNextPage, totalResults, loadMore, refresh }"}</code>.
      </p>
      <PropTable
        columns={["Hook", "Signature", "Notes"]}
        rows={[
          [
            <code>usePhotoSearch</code>,
            <code>{"({ query, orientation?, perPage?, enabled? })"}</code>,
            <>
              Default <code>enabled</code> is <code>Boolean(query)</code>.
            </>,
          ],
          [<code>useCuratedPhotos</code>, <code>{"(perPage?)"}</code>, "No query."],
          [<code>useVideoSearch</code>, <code>{"({ query, orientation?, perPage?, enabled? })"}</code>, ""],
          [<code>usePopularVideos</code>, <code>{"(perPage?)"}</code>, "No query."],
        ]}
      />

      <h3>Single-item hooks</h3>
      <PropTable
        columns={["Hook", "Signature", "Returns"]}
        rows={[
          [
            <code>usePhoto</code>,
            <code>{"(id: number | null)"}</code>,
            <code>{"{ item, loading, error }"}</code>,
          ],
          [
            <code>useVideo</code>,
            <code>{"(id: number | null)"}</code>,
            <code>{"{ item, loading, error }"}</code>,
          ],
        ]}
      />

      <h3>Events / tracking hooks</h3>
      <PropTable
        columns={["Hook", "Signature", "Use for"]}
        rows={[
          [
            <code>useMediaEvent</code>,
            <code>{"(event, listener) => void"}</code>,
            "Reactive — observe view/download/error events fired anywhere (e.g. an activity feed).",
          ],
          [
            <code>useMediaTracking</code>,
            <code>{"() => { trackView, trackDownload }"}</code>,
            "Imperative — call from an event handler.",
          ],
        ]}
      />

      <Rule>
        <strong>Additive, not exclusive.</strong> <code>media-core</code> already runs a default console listener
        for every event. <code>useMediaEvent</code> adds to it — it doesn't replace it.
      </Rule>

      <h3>Example (from apps/web/src/PhotoGrid.tsx)</h3>
      <Code>{`const search = usePhotoSearch({ query, enabled: Boolean(query) });
const curated = useCuratedPhotos();
const { trackView } = useMediaTracking();

const active = query ? search : curated;
const { items, loading, loadingMore, error, hasNextPage } = active;`}</Code>

      <h2 id="types">Core types</h2>
      <PropTable
        columns={["Type", "Shape"]}
        rows={[
          [
            <code>MediaPhoto</code>,
            <code>
              {
                "{ kind: 'photo', id, width, height, url, photographer, photographerUrl, avgColor, src: { original, large, medium, small, thumbnail }, alt }"
              }
            </code>,
          ],
          [
            <code>MediaVideo</code>,
            <code>
              {
                "{ kind: 'video', id, width, height, url, durationSeconds, image, user, userUrl, videoFiles[] }"
              }
            </code>,
          ],
          [<code>MediaItem</code>, <code>MediaPhoto | MediaVideo</code>],
          [
            <code>SearchParams</code>,
            <code>{"{ query, page?, perPage?, orientation?: 'landscape' | 'portrait' | 'square' }"}</code>,
          ],
          [<code>MediaApiError</code>, <>Thrown/emitted on API failure. Extends <code>Error</code>, adds <code>status</code>.</>],
        ]}
      />

      <footer>
        See the <a href="../docs-components/">components docs</a> for <code>media-ui-react</code>, and the repo
        README for architecture and scoping notes.
      </footer>
    </div>
  );
}
