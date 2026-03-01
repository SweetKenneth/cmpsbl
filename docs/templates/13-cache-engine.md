# 13 — Cache Engine

> **Module:** MEMORY | **Source:** `src/crownjewels/s-tier/016-cache-engine.ts`

Multi-tier caching with LRU eviction, TTL expiry, stale-while-revalidate, namespace isolation, tag-based invalidation, and hit/miss analytics.

## Quick Start

```typescript
import { createCacheEngine } from './cache-engine';

const cache = createCacheEngine({
  maxSize: 500,
  defaultTtlMs: 300_000,         // 5 minutes
  staleWhileRevalidateMs: 60_000, // serve stale for 1 more minute
});

// Basic set/get
cache.set('user:123', { name: 'Alice' }, { tags: ['users'] });
const user = cache.get('user:123');

// Get-or-set pattern
const data = await cache.getOrSet('expensive_query', async () => {
  return await db.query('SELECT ...');
}, { ttlMs: 60_000, tags: ['queries'] });

// Stale-while-revalidate
if (cache.isStale('user:123')) {
  cache.revalidate('user:123', () => fetchUser(123));
}

// Tag-based invalidation
cache.invalidateByTag('users'); // clear all user-tagged entries
```

## API Reference

| Method | Description |
|--------|-------------|
| `set(key, value, opts?)` | Store with optional TTL, tags, namespace |
| `get(key, namespace?)` | Retrieve (returns stale if within revalidate window) |
| `getOrSet(key, factory, opts?)` | Get or compute and cache |
| `isStale(key, namespace?)` | Check if entry has expired |
| `revalidate(key, fetcher, opts?)` | Background refresh (deduped) |
| `invalidate(key, namespace?)` | Remove specific entry |
| `invalidateByTag(tag)` | Remove all entries with tag |
| `invalidateNamespace(ns)` | Clear entire namespace |
| `clear()` | Clear everything |
| `getStats()` | Hit rate, evictions, namespace list |

## Use Cases

- **API response caching** — Reduce redundant external calls
- **Computed value memoization** — Cache expensive projections
- **Multi-tenant isolation** — Namespace per tenant
- **Graceful degradation** — Serve stale data during outages
