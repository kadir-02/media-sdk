import type { MediaEventMap, MediaEventName, MediaEventListener } from "./types.js";

export class MediaEventEmitter {
  private listeners: {
    [K in MediaEventName]?: Set<MediaEventListener<K>>;
  } = {};

  on<E extends MediaEventName>(event: E, listener: MediaEventListener<E>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as Set<MediaEventListener<E>> & Set<MediaEventListener<MediaEventName>>;
    }
    const set = this.listeners[event] as Set<MediaEventListener<E>>;
    set.add(listener);
    return () => this.off(event, listener);
  }

  off<E extends MediaEventName>(event: E, listener: MediaEventListener<E>): void {
    const set = this.listeners[event] as Set<MediaEventListener<E>> | undefined;
    set?.delete(listener);
  }

  emit<E extends MediaEventName>(event: E, payload: MediaEventMap[E]): void {
    const set = this.listeners[event] as Set<MediaEventListener<E>> | undefined;
    if (!set) return;
    // Copy to array so a listener unsubscribing mid-emit doesn't skip others.
    for (const listener of Array.from(set)) {
      listener(payload);
    }
  }

  removeAllListeners(event?: MediaEventName): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}
