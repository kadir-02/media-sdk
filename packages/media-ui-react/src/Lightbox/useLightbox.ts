import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { mergeProps } from "../shared/propGetters.js";

export interface UseLightboxOptions<T> {
  items: T[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  onIndexChange?: (index: number, item: T) => void;
  /** Wrap from last item to first (and vice versa). Default true. */
  loop?: boolean;
}

export interface UseLightboxReturn<T> {
  currentIndex: number;
  currentItem: T | null;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getOverlayProps: (external?: Record<string, any>) => Record<string, any>;
  getDialogProps: (external?: Record<string, any>) => Record<string, any>;
  getCloseButtonProps: (external?: Record<string, any>) => Record<string, any>;
  getNextButtonProps: (external?: Record<string, any>) => Record<string, any>;
  getPrevButtonProps: (external?: Record<string, any>) => Record<string, any>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Headless lightbox: owns index state, keyboard navigation (Left/Right/Esc),
 * and a focus trap while open (focus moves into the dialog on open, Tab is
 * contained inside it, and focus is restored to the previously-focused
 * element on close). Ships zero styles or markup — consumer renders the
 * overlay/image/controls and spreads the prop-getters onto their elements.
 */
export function useLightbox<T>(options: UseLightboxOptions<T>): UseLightboxReturn<T> {
  const { items, isOpen, onClose, initialIndex = 0, onIndexChange, loop = true } = options;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialIndex]);

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      let next = index;
      if (loop) {
        next = ((index % items.length) + items.length) % items.length;
      } else {
        next = Math.max(0, Math.min(items.length - 1, index));
      }
      setCurrentIndex(next);
      onIndexChange?.(next, items[next]);
    },
    [items, loop, onIndexChange]
  );

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Focus management: move focus into the dialog on open, restore on close.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      // Defer so the dialog node is mounted/attached by the time we focus it.
      const id = window.setTimeout(() => dialogRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    } else if (previouslyFocusedRef.current instanceof HTMLElement) {
      previouslyFocusedRef.current.focus();
    }
  }, [isOpen]);

  const handleDialogKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        return;
      }
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [next, prev, onClose]
  );

  const getOverlayProps = useCallback(
    (external?: Record<string, any>) =>
      mergeProps(
        {
          onClick: (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) onClose();
          },
        },
        external
      ),
    [onClose]
  );

  const getDialogProps = useCallback(
    (external?: Record<string, any>) =>
      mergeProps(
        {
          ref: dialogRef as React.RefObject<HTMLElement>,
          role: "dialog",
          "aria-modal": true,
          tabIndex: -1,
          onKeyDown: handleDialogKeyDown,
        },
        external
      ),
    [handleDialogKeyDown]
  );

  const getCloseButtonProps = useCallback(
    (external?: Record<string, any>) =>
      mergeProps({ onClick: () => onClose(), "aria-label": "Close" }, external),
    [onClose]
  );

  const getNextButtonProps = useCallback(
    (external?: Record<string, any>) =>
      mergeProps({ onClick: () => next(), "aria-label": "Next", disabled: !loop && currentIndex >= items.length - 1 }, external),
    [next, loop, currentIndex, items.length]
  );

  const getPrevButtonProps = useCallback(
    (external?: Record<string, any>) =>
      mergeProps({ onClick: () => prev(), "aria-label": "Previous", disabled: !loop && currentIndex <= 0 }, external),
    [prev, loop, currentIndex]
  );

  return {
    currentIndex,
    currentItem: items[currentIndex] ?? null,
    next,
    prev,
    goTo,
    getOverlayProps,
    getDialogProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
  };
}
