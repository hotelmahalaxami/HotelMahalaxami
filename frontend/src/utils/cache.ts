/**
 * Lightweight, zero-dependency in-memory cache with TTL support.
 * Does NOT persist to localStorage/sessionStorage, avoiding token or sensitive data exposure.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Retrieves an entry if present and not expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores a value in memory with a given TTL in milliseconds (default 5 minutes).
   */
  set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidates a specific key or all keys matching a prefix.
   */
  invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clears the entire in-memory store.
   */
  clear(): void {
    this.store.clear();
  }
}

export const memoryCache = new MemoryCache();
