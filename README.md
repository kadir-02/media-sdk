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

## Skill docs

See `skills/wiring-data.skill.md` and `skills/using-components.skill.md`.
Both encode the one hard rule for their layer (no `media-core` outside the
provider mount; no styles/markup shipped by `media-ui-react`) plus concrete
do/don't patterns pulled directly from mistakes that are easy to make with
this architecture (e.g. spreading `key` from a prop-getter object, double
handling Escape/Arrow keys in the lightbox).
