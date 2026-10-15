import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memoryCache } from '../cache';

describe('MemoryCache', () => {
  beforeEach(() => {
    memoryCache.clear();
    vi.useRealTimers();
  });

  it('stores and retrieves values', () => {
    memoryCache.set('test_key', { data: 123 }, 1000);
    const result = memoryCache.get<{ data: number }>('test_key');
    expect(result).toEqual({ data: 123 });
  });

  it('returns null for missing keys', () => {
    const result = memoryCache.get('non_existent');
    expect(result).toBeNull();
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    memoryCache.set('short_lived', 'hello', 500);

    expect(memoryCache.get('short_lived')).toBe('hello');

    vi.advanceTimersByTime(501);

    expect(memoryCache.get('short_lived')).toBeNull();
  });

  it('invalidates by exact key', () => {
    memoryCache.set('key1', 'val1');
    memoryCache.set('key2', 'val2');

    memoryCache.invalidate('key1');

    expect(memoryCache.get('key1')).toBeNull();
    expect(memoryCache.get('key2')).toBe('val2');
  });

  it('invalidates by prefix', () => {
    memoryCache.set('menu_categories', ['cat1']);
    memoryCache.set('menu_items', ['item1']);
    memoryCache.set('tables', ['tab1']);

    memoryCache.invalidate('menu_');

    expect(memoryCache.get('menu_categories')).toBeNull();
    expect(memoryCache.get('menu_items')).toBeNull();
    expect(memoryCache.get('tables')).toEqual(['tab1']);
  });

  it('clears all items', () => {
    memoryCache.set('a', 1);
    memoryCache.set('b', 2);

    memoryCache.clear();

    expect(memoryCache.get('a')).toBeNull();
    expect(memoryCache.get('b')).toBeNull();
  });
});
