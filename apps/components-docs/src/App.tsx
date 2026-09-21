import { PropTable, Code, Rule } from "./DocPrimitives.js";

export function App() {
  return (
    <div className="wrap">
      <h1>media-ui-react</h1>
      <p className="lede">
        Headless components for building photo/video UIs — Grid, Lightbox, and ReelSwiper. No styles, no markup, no
        data-fetching. You bring the JSX and CSS; these hooks bring the behavior.
      </p>

      <nav className="toc">
        <a href="#rules">Ground rules</a>
        <a href="#grid">useGrid</a>
        <a href="#lightbox">useLightbox</a>
        <a href="#reelswiper">useReelSwiper</a>
      </nav>

      <h2 id="rules">Ground rules</h2>

      <Rule>
        <strong>Zero styles, zero markup.</strong> Every hook returns state + prop-getter functions (
        <code>getXProps()</code>), never a rendered component. There is no <code>&lt;Grid&gt;</code> JSX component
        to import — you write the JSX, the hook wires behavior onto it via spread props.
      </Rule>

      <Rule>
        <strong>Zero dependency on media-core / media-react.</strong> These hooks take plain arrays and callbacks
        as props. Pass <code>items</code> from a <code>media-react</code> hook's <code>.items</code>, and pass a
        plain callback (e.g. <code>onLoadMore: dataHook.loadMore</code>) for anything that should trigger a data
        operation.
      </Rule>

      <h3>Prop-getter pattern</h3>
      <p>
        Spread the return value of each <code>getXProps()</code> onto an element. You can pass your own extra
        props (onClick, className, etc.) as the optional last argument — internal and external handlers are
        composed, not overwritten, so both run.
      </p>
      <Code>{`const grid = useGrid({ items, getKey: (p) => p.id, onLoadMore, hasNextPage, loading });

<div {...grid.getGridProps()}>
  {items.map((item, i) => {
    const { key, ...itemProps } = grid.getItemProps(item, i, { onClick: () => open(item) });
    return <div key={key} {...itemProps}>...</div>;
  })}
</div>`}</Code>
      <p>
        <code>key</code> must always be destructured out before spreading — React's <code>key</code> can't be part
        of a spread object.
      </p>

      <h2 id="grid">useGrid</h2>
      <p>
        Infinite-scroll / load-more grid. Uses <code>IntersectionObserver</code> on a sentinel element, plus a
        manual <code>loadMore()</code> for a "Load more" button as a fallback.
      </p>

      <h4>Options</h4>
      <PropTable
        columns={["Prop", "Type", "Notes"]}
        rows={[
          [<code>items</code>, <code>T[]</code>, "The current page of items."],
          [<code>getKey</code>, <code>{"(item, index) => string | number"}</code>, "Stable key per item."],
          [<code>onLoadMore</code>, <code>{"() => void"}</code>, "Called by the sentinel or manual loadMore()."],
          [<code>hasNextPage</code>, <code>boolean</code>, <>Default <code>false</code>.</>],
          [<code>loading</code>, <code>boolean</code>, "First-page loading."],
          [<code>loadingMore</code>, <code>boolean</code>, "Subsequent-page loading — render different UI."],
          [<code>rootMargin</code>, <code>string</code>, <>IntersectionObserver rootMargin. Default <code>"200px"</code>.</>],
          [
            <code>autoLoadOnScroll</code>,
            <code>boolean</code>,
            <>
              Set <code>false</code> to disable the sentinel and rely on manual <code>loadMore()</code> only.
            </>,
          ],
        ]}
      />

      <h4>Returns</h4>
      <PropTable
        columns={["Field", "Type"]}
        rows={[
          [<code>getGridProps(external?)</code>, <code>{"{ role, aria-busy, ...external }"}</code>],
          [<code>getItemProps(item, index, external?)</code>, <code>{"{ key, data-grid-item, role, ...external }"}</code>],
          [<code>sentinelRef</code>, <>Attach to an element at the end of the list.</>],
          [<code>loadMore</code>, <code>{"() => void"}</code>],
          [<code>hasNextPage</code>, "loading, loadingMore — passthrough of current state"],
        ]}
      />

      <h4>Example (from apps/web/src/PhotoGrid.tsx)</h4>
      <Code>{`const grid = useGrid<MediaPhoto>({
  items,
  getKey: (item) => item.id,
  onLoadMore: active.loadMore,
  hasNextPage,
  loading,
  loadingMore,
});

<div className="grid" {...grid.getGridProps()}>
  {items.map((photo, index) => {
    const { key, ...itemProps } = grid.getItemProps(photo, index, {
      onClick: () => onSelect(photo, index, items),
    });
    return (
      <button key={key} className="grid-cell" {...itemProps}>
        <img src={photo.src.small} alt={photo.alt} />
      </button>
    );
  })}
</div>
<div ref={grid.sentinelRef} />
{grid.hasNextPage && <button onClick={grid.loadMore}>Load more</button>}`}</Code>

      <h2 id="lightbox">useLightbox</h2>
      <p>Modal image/video viewer with index state, keyboard navigation, and full focus management — no styling.</p>

      <h4>Options</h4>
      <PropTable
        columns={["Prop", "Type", "Notes"]}
        rows={[
          [<code>items</code>, <code>T[]</code>, ""],
          [<code>isOpen</code>, <code>boolean</code>, ""],
          [<code>onClose</code>, <code>{"() => void"}</code>, ""],
          [<code>initialIndex</code>, <code>number</code>, <>Default <code>0</code>.</>],
          [<code>onIndexChange</code>, <code>{"(index, item) => void"}</code>, "Fires on next/prev/goTo."],
          [<code>loop</code>, <code>boolean</code>, <>Wrap last→first item. Default <code>true</code>.</>],
        ]}
      />

      <h4>Returns</h4>
      <PropTable
        columns={["Field", "Notes"]}
        rows={[
          [<code>currentIndex</code>, <code>currentItem</code>],
          [<code>next() / prev() / goTo(index)</code>, ""],
          [<code>getOverlayProps()</code>, "Closes on backdrop click."],
          [
            <code>getDialogProps()</code>,
            <>
              <code>role="dialog"</code>, <code>aria-modal</code>, Tab focus trap, Escape/←/→ handling.
            </>,
          ],
          [
            <code>getCloseButtonProps() / getNextButtonProps() / getPrevButtonProps()</code>,
            <>
              Prev/next auto-disable at the ends when <code>loop: false</code>.
            </>,
          ],
        ]}
      />

      <Rule>
        <strong>Don't double-handle keys.</strong> <code>getDialogProps()</code> already wires Escape/←/→ and the
        Tab trap. Adding your own <code>onKeyDown</code> for the same keys causes double handling — pass extra
        handling as the <code>external</code> arg instead; it composes.
      </Rule>

      <h4>Example (from apps/web/src/PhotoLightbox.tsx)</h4>
      <Code>{`const lightbox = useLightbox<MediaPhoto>({
  items: photos,
  isOpen: true,
  initialIndex,
  onClose,
  onIndexChange: (_, item) => trackView(item, "lightbox"),
});

<div className="lightbox-overlay" {...lightbox.getOverlayProps()}>
  <div className="lightbox-dialog" {...lightbox.getDialogProps()}>
    <button {...lightbox.getCloseButtonProps()}>✕</button>
    <button {...lightbox.getPrevButtonProps()}>‹</button>
    <img src={lightbox.currentItem?.src.large} />
    <button {...lightbox.getNextButtonProps()}>›</button>
  </div>
</div>`}</Code>

      <h2 id="reelswiper">useReelSwiper</h2>
      <p>
        Vertical snap-paging reel (TikTok/Reels-style). Tracks which item is "active" via{" "}
        <code>IntersectionObserver</code> as the user scrolls. Ships no CSS — you apply{" "}
        <code>scroll-snap-type</code>/<code>scroll-snap-align</code> yourself.
      </p>

      <h4>Options</h4>
      <PropTable
        columns={["Prop", "Type", "Notes"]}
        rows={[
          [<code>items</code>, <code>T[]</code>, ""],
          [<code>initialIndex</code>, <code>number</code>, <>Default <code>0</code>.</>],
          [<code>onActiveIndexChange</code>, <code>{"(index, item) => void"}</code>, ""],
          [<code>activeThreshold</code>, <code>number</code>, <>Visibility fraction to count as active. Default <code>0.6</code>.</>],
        ]}
      />

      <h4>Returns</h4>
      <PropTable
        columns={["Field", "Notes"]}
        rows={[
          [<code>activeIndex</code>, <code>activeItem</code>],
          [
            <code>getContainerProps()</code>,
            <>
              Attach to the scroll container — you add <code>overflow-y: scroll; scroll-snap-type: y mandatory</code>.
            </>,
          ],
          [
            <code>getItemProps(index)</code>,
            <>
              Attach to each item — you add <code>scroll-snap-align: start</code>.
            </>,
          ],
          [<code>goToIndex(index)</code>, "Programmatic scroll-to, e.g. from an external \"next\" button."],
        ]}
      />

      <h4>Example (from apps/web/src/ReelsView.tsx)</h4>
      <Code>{`const reel = useReelSwiper<MediaVideo>({
  items,
  onActiveIndexChange: (_, item) => trackView(item, "reel"),
});

<div className="reel-container" {...reel.getContainerProps()}>
  {items.map((video, index) => (
    <div key={video.id} className="reel-item" {...reel.getItemProps(index)}>
      <video src={video.videoFiles[0]?.link} autoPlay={index === reel.activeIndex} />
    </div>
  ))}
</div>`}</Code>
      <Code>{`/* app CSS — required, not shipped by the library */
.reel-container { scroll-snap-type: y mandatory; overflow-y: scroll; }
.reel-item { scroll-snap-align: start; }`}</Code>

      <footer>
        See the <a href="../docs-sdk/">SDK API reference</a> for <code>media-core</code> / <code>media-react</code>,
        and the repo README for architecture and scoping notes.
      </footer>
    </div>
  );
}
