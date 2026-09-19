# Headless Media SDK + Component Library

A framework-agnostic media SDK (`media-core`), thin per-platform wrappers
(`media-react`, `media-native`), an independent headless UI component
library per platform (`media-ui-react`, `media-ui-native`), and one React
web app that wires them together. Data source: [Pexels](https://www.pexels.com/api/).

## Architecture

```
                 media-core (zero UI, zero React)
                    ▲                    ▲
                    │                    │
              media-react          media-native
              (hooks + provider)   (hooks + provider)
                    ▲                    ▲
                    │                    │
              apps/web  ─────────►  media-ui-react
                                    (headless: Grid, Lightbox, ReelSwiper)
```

**Dependency direction, enforced:**
- `media-core` imports nothing from this repo. Pure TypeScript, portable to a CLI or any other UI.
- `media-react` / `media-native` import `media-core` only. They contain no business logic — they adapt core to hooks.
- `media-ui-react` / `media-ui-native` import **nothing** from `media-core` or the wrappers. They take data and callbacks as plain props.
- `apps/web` is the *only* place that imports both `media-react` (data/auth/events) and `media-ui-react` (display), and wires one to the other.

## Packages

| Package | What it is |
|---|---|
| `packages/media-core` | Pexels API client, typed responses, in-memory cache + request de-dupe, `view`/`download`/`error` event emitter with a default console listener |
| `packages/media-react` | `MediaProvider` + hooks: `usePhotoSearch`, `useCuratedPhotos`, `useVideoSearch`, `usePopularVideos`, `usePhoto`, `useVideo`, `useMediaEvent`, `useMediaTracking` |
| `packages/media-native` | Same hook contract, React Native wrapper (see "What we cut" below) |
| `packages/media-ui-react` | Headless `useGrid`, `useLightbox`, `useReelSwiper` — prop-getter pattern, no shipped styles |
| `packages/media-ui-native` | `useGridNative` implemented; Lightbox/ReelSwiper interfaces defined, implementation cut (see below) |
| `apps/web` | The demo app: search bar → grid → lightbox, and a reels-style vertical video view |
| `skills/*.skill.md` | Two AI-agent skill docs for consuming `media-react` + `media-ui-react` correctly |

## Running it

```bash
npm install
cp apps/web/.env.local.example apps/web/.env.local   # add your Pexels API key
npm run dev:web
```

Get a free Pexels key at https://www.pexels.com/api/.

To typecheck everything: `npm run typecheck`. To build every package + the app: `npm run build`.

## What we cut, and why (time-boxed to ~1 day)

Judgment under time pressure was explicitly part of the brief, so here's
what was deprioritized and the reasoning:

1. **`media-ui-native`'s Lightbox and ReelSwiper are unimplemented** (interfaces only, with a thrown error explaining why). The app deliverable is React web only, so a fully-working `media-ui-react` (all three components, genuinely headless, keyboard/focus handling included) was worth more than a half-working native equivalent. `useGridNative` *is* implemented because Grid is the piece most likely to be reused/demoed on native, and it's the cheapest to get right (RN's `FlatList.onEndReached` does most of the work `IntersectionObserver` does on web).
2. **`media-native`'s hooks are near-duplicates of `media-react`'s**, not built on a shared internal package. This is a conscious shortcut, not an oversight: React Native uses the same React hook rules, so the actual platform fork only matters in the *UI* layer (which is why `media-ui-native` diverges more meaningfully). With more time, I'd extract the pagination/event logic into an internal `media-react-core` package that both wrappers consume, so a bug fix doesn't need to land in two places.
3. **No automated test suite.** Given the time budget, I prioritized getting the type contracts and dependency boundaries right (which `tsc` verifies for every package) over hand-writing unit tests. The riskiest untested logic is `usePaginatedList`'s stale-response guard (`requestIdRef`) and `useLightbox`'s focus trap — those are where I'd start.
4. **Cache is an unbounded `Map` with TTL, not LRU-bounded.** Fine for a demo session; would leak memory in a long-lived app. Noted in the code with a one-line comment rather than fixed, since it doesn't affect the architecture being evaluated.
5. **No error boundary / retry UI beyond a plain error message.** The app shows `error.message` and stops; a production app would want retry buttons and richer error classification (network vs. 4xx vs. 429 rate limit).
6. **Video quality selection is naive** (`find(f => f.quality === "sd") ?? videoFiles[0]`) rather than picking based on viewport/bandwidth.

## AI-assisted vs. hand-written

_(Fill in for your actual submission — be specific about which files/parts
were AI-generated vs. reviewed/rewritten by hand, and note how the two
skill docs were tested against a real AI coding session while building
`apps/web`.)_

## Skill docs

See `skills/wiring-data.skill.md` and `skills/using-components.skill.md`.
Both encode the one hard rule for their layer (no `media-core` outside the
provider mount; no styles/markup shipped by `media-ui-react`) plus concrete
do/don't patterns pulled directly from mistakes that are easy to make with
this architecture (e.g. spreading `key` from a prop-getter object, double
handling Escape/Arrow keys in the lightbox).
