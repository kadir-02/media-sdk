# SKILL: Using media-ui-react Components

Use this skill whenever you (the AI coding assistant) are asked to render a
grid, lightbox, or reel/swiper view using `media-ui-react`. It teaches the
headless prop-getter pattern this library uses, so generated code doesn't
fight the library or silently break accessibility.

## The one hard rule

**`media-ui-react` ships zero styles and zero opinions about markup.**
Every hook (`useGrid`, `useLightbox`, `useReelSwiper`) returns *behavior*
(state + prop-getter functions) — never a rendered component. If you find
yourself looking for a `<Grid>` or `<Lightbox>` JSX component to import,
stop — it doesn't exist on purpose. You write the JSX; the hook wires the
behavior onto it via spread props.

**`media-ui-react` also never imports `media-core` or `media-react`.** Its
hooks take plain arrays and callbacks as props. Do not try to pass a
`MediaClient` or a `media-react` hook's return value directly into
`useGrid`/`useLightbox`/`useReelSwiper` — pass `items`, and pass a plain
callback for anything that should trigger a data operation (e.g.
`onLoadMore: dataHook.loadMore`).

## Pattern: prop-getters

Every `getXProps()` function returns an object of DOM props to spread onto
an element. Always spread the *return value*, never call the getter without
using its result, and never manually re-implement what it already provides
(e.g. don't add your own `onClick` for closing the lightbox — use
`getCloseButtonProps()`).

```tsx
const grid = useGrid({ items, getKey: (p) => p.id, onLoadMore, hasNextPage, loading });

<div {...grid.getGridProps()}>
  {items.map((item, i) => {
    const { key, ...itemProps } = grid.getItemProps(item, i, { onClick: () => open(item) });
    return <div key={key} {...itemProps}>...</div>;
  })}
</div>
```

Note the `key` extraction: React's `key` must be a JSX attribute, not part
of a spread object, or you'll get a "specified more than once" error/warning.
Always destructure `key` out before spreading the rest.

You may pass your own extra props (e.g. `onClick`, `className`) as the
optional last argument to any `getXProps` — the library merges them and
composes event handlers (both your handler and the internal one run), it
does not overwrite yours.

## Grid — infinite scroll

- Attach `grid.sentinelRef` to an empty element at the end of the list (a
  `<div ref={grid.sentinelRef} />`) for automatic load-on-scroll. It uses
  `IntersectionObserver`, not a scroll listener — don't add `onScroll`
  handlers to reimplement this.
- Also render a manual "Load more" button wired to `grid.loadMore()` as a
  fallback — don't rely on the sentinel alone, some users/devices disable
  IO-based lazy loading.
- `grid.loading` = first page loading. `grid.loadingMore` = subsequent page
  loading. Show different UI for each; don't collapse them into one spinner.

## Lightbox — focus, keyboard, a11y

- `getDialogProps()` already wires `role="dialog"`, `aria-modal`, a Tab
  focus trap, and Escape/ArrowLeft/ArrowRight keyboard handling. **Do not**
  add your own `onKeyDown` for Escape or arrow keys — you'll get double
  handling. If you need additional key handling, pass it as the `external`
  arg and it will compose (yours runs too, not instead).
- `getOverlayProps()` closes on backdrop click (click on the overlay
  itself, not its children) — don't add a separate backdrop `onClick`.
- The hook restores focus to whatever was focused before the lightbox
  opened. Don't manually manage `document.activeElement` yourself.
- Video-in-lightbox: the hook only tracks index/nav state; you own the
  `<video>` element and its play/pause. Pause/reset video on `next`/`prev`
  yourself (e.g. in a `useEffect` keyed on `currentIndex`).

## ReelSwiper — vertical snap paging

- `useReelSwiper` does **not** ship CSS. You must add
  `scroll-snap-type: y mandatory; overflow-y: scroll` to the container
  (via `getContainerProps()`'s target element) and
  `scroll-snap-align: start` to each item (via `getItemProps(index)`'s
  target element) yourself, in your stylesheet or inline styles.
- `activeIndex`/`activeItem` update automatically via `IntersectionObserver`
  as the user scrolls — don't add your own scroll-position math to detect
  the active item.
- Use `reel.goToIndex(i)` for programmatic navigation (e.g. a "next" button
  outside the normal scroll flow) instead of calling `scrollIntoView`
  yourself on the DOM node.

## Checklist before you finish a components task

- [ ] No hardcoded styles/CSS shipped *inside* `media-ui-react` usage — all styling lives in the app's own CSS/className.
- [ ] `key` is destructured out of every `getItemProps()` result before spreading.
- [ ] No duplicate keyboard/click handlers that fight the ones `getXProps()` already provides.
- [ ] Grid has both a sentinel *and* a manual load-more control.
- [ ] Reel/swiper container + items have the scroll-snap CSS applied by the app, not assumed to exist.
