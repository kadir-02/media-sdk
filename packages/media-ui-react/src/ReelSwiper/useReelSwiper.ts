import { useCallback, useEffect, useRef, useState } from "react";
import { mergeProps } from "../shared/propGetters.js";

export interface UseReelSwiperOptions<T> {
  items: T[];
  initialIndex?: number;
  onActiveIndexChange?: (index: number, item: T) => void;
  /** Fraction of an item that must be visible to count as "active". Default 0.6. */
  activeThreshold?: number;
}

export interface UseReelSwiperReturn<T> {
  activeIndex: number;
  activeItem: T | null;
  /** Attach to the scrollable container. Consumer applies their own CSS
   *  (e.g. `overflow-y: scroll; scroll-snap-type: y mandatory`). */
  getContainerProps: (external?: Record<string, any>) => Record<string, any>;
  /** Attach to each item. Consumer applies `scroll-snap-align: start` etc. */
  getItemProps: (index: number, external?: Record<string, any>) => Record<string, any>;
  goToIndex: (index: number) => void;
}

/**
 * Headless vertical reel/swiper: tracks which item is "active" (most
 * visible) via IntersectionObserver, and exposes a goToIndex that scrolls
 * an item into view. Ships no CSS — scroll-snap styling is the consumer's
 * job (documented in the skill doc / README), this hook only supplies
 * behavior + a11y wiring.
 */
export function useReelSwiper<T>(options: UseReelSwiperOptions<T>): UseReelSwiperReturn<T> {
  const { items, initialIndex = 0, onActiveIndexChange, activeThreshold = 0.6 } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<Element | null>(null);
  const itemRefs = useRef<Map<number, Element>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  onActiveIndexChangeRef.current = onActiveIndexChange;

  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.intersectionRatio >= activeThreshold);
        if (visible.length === 0) return;
        // Prefer the entry closest to fully visible.
        const best = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
        const index = Number((best.target as HTMLElement).dataset.reelIndex);
        if (!Number.isNaN(index)) {
          setActiveIndex((prev) => {
            if (prev === index) return prev;
            onActiveIndexChangeRef.current?.(index, items[index]);
            return index;
          });
        }
      },
      { root: containerRef.current, threshold: [0, activeThreshold, 1] }
    );

    for (const el of itemRefs.current.values()) {
      observerRef.current.observe(el);
    }
  }, [activeThreshold, items]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const containerRefCallback = useCallback(
    (node: Element | null) => {
      containerRef.current = node;
      setupObserver();
    },
    [setupObserver]
  );

  const itemRefCallback = useCallback(
    (index: number) => (node: Element | null) => {
      if (node) {
        itemRefs.current.set(index, node);
        observerRef.current?.observe(node);
      } else {
        const existing = itemRefs.current.get(index);
        if (existing) observerRef.current?.unobserve(existing);
        itemRefs.current.delete(index);
      }
    },
    []
  );

  const goToIndex = useCallback((index: number) => {
    const el = itemRefs.current.get(index);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const getContainerProps = useCallback(
    (external?: Record<string, any>) =>
      mergeProps({ ref: containerRefCallback, role: "list", "aria-label": "Media reel" }, external),
    [containerRefCallback]
  );

  const getItemProps = useCallback(
    (index: number, external?: Record<string, any>) =>
      mergeProps(
        {
          ref: itemRefCallback(index),
          "data-reel-index": index,
          role: "listitem",
          "aria-current": index === activeIndex,
        },
        external
      ),
    [itemRefCallback, activeIndex]
  );

  return {
    activeIndex,
    activeItem: items[activeIndex] ?? null,
    getContainerProps,
    getItemProps,
    goToIndex,
  };
}
