# SKILL: Wiring Data with media-react

Use this skill whenever you (the AI coding assistant) are asked to fetch,
search, paginate, or track media data in a React app that uses `media-core`
+ `media-react`. It teaches you the *only* correct way to get Pexels photo
or video data into a React component in this codebase.

## The one hard rule

**`media-core` and its API key must never be imported or referenced
directly inside app components or `media-ui-react` components.** All data
access goes through `media-react` hooks. If you find yourself writing
`new MediaClient(...)` or `import { MediaClient } from "media-core"` inside
a component, stop — that's wrong. The only legitimate `media-core` import
in the whole app is the single `MediaProvider` mount point.

## Setup (do this once, at the app root)

```tsx
import { MediaProvider } from "media-react";

<MediaProvider apiKey={import.meta.env.VITE_PEXELS_API_KEY}>
  <App />
</MediaProvider>
```

Never hardcode the API key. Never pass it down as a prop past the
`MediaProvider` boundary. Every hook below reads the key indirectly via
React context — you never touch it again.

## Fetching lists (search, curated, popular)

Use these hooks — do not write your own `fetch()` or `useEffect` data
loading. They already handle loading/error/pagination state consistently:

| Hook | Use for |
|---|---|
| `usePhotoSearch({ query, orientation?, enabled? })` | Photo search results |
| `useCuratedPhotos(perPage?)` | Curated/trending photos (no query) |
| `useVideoSearch({ query, orientation?, enabled? })` | Video search results |
| `usePopularVideos(perPage?)` | Popular videos (no query) |

Every one of these returns the same shape:

```ts
{ items, loading, loadingMore, error, hasNextPage, totalResults, loadMore, refresh }
```

- Render `items` directly into `media-ui-react`'s `useGrid`/`useReelSwiper` — don't reshape them first.
- Call `loadMore()` from a button, or wire it to `useGrid`'s `onLoadMore` — don't build your own pagination counter.
- Check `error` before checking `items.length === 0` — an empty array during an error is not "no results."
- If a query can be empty (e.g. a search box before the user types), pass `enabled: Boolean(query)` so it doesn't fire on `""`.

If asked to fetch a *single* item by ID (e.g. a permalink page), use
`usePhoto(id)` / `useVideo(id)`, not `usePhotoSearch`.

## Tracking activity (views, downloads)

Two options, both valid — pick based on what's being tracked:

1. **Imperative**, inside an event handler (most common — e.g. "track when
   a photo is opened in the lightbox" or "track when the download button is
   clicked"):
   ```tsx
   const { trackView, trackDownload } = useMediaTracking();
   <img onClick={() => trackView(photo, "grid")} />
   ```

2. **Reactive**, to observe events fired elsewhere (e.g. building an
   activity feed or analytics sidebar):
   ```tsx
   useMediaEvent("view", (payload) => { /* payload.item, payload.source */ });
   useMediaEvent("download", (payload) => { /* payload.item, payload.variant */ });
   ```

Do not reimplement event tracking with your own state — `media-core`
already has a default console listener running; `useMediaEvent` adds to it,
it doesn't replace it.

## Checklist before you finish a data-wiring task

- [ ] No `media-core` import outside the app's single `MediaProvider` mount.
- [ ] No `fetch()` calls written by hand for Pexels data — a hook exists for it.
- [ ] `enabled`/`Boolean(query)` guard used for any hook driven by a search box.
- [ ] `error` state is rendered, not silently swallowed.
- [ ] `loading` vs `loadingMore` are distinguished (full-page spinner vs. "loading more" at the bottom of a list) — they are different states on purpose.
