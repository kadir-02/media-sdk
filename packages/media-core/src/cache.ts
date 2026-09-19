
export class RequestCache {
  private store = new Map<string, { value: unknown; expiresAt: number }>();
  private inFlight = new Map<string, Promise<unknown>>();

  constructor(private ttlMs: number) {}

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.ttlMs > 0) {
      const hit = this.store.get(key);
      if (hit && hit.expiresAt > Date.now()) {
        return hit.value as T;
      }
    }

    const pending = this.inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const promise = fetcher()
      .then((value) => {
        if (this.ttlMs > 0) {
          this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
        }
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  invalidate(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}
