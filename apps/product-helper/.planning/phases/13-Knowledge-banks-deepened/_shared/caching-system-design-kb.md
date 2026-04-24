# Caching — Architecture, Patterns, and Trade-Offs

## Context (Why This Matters)

A cache is temporary storage that keeps recently or frequently used data in a faster layer so the system does not have to fetch it from the slower source every time. The performance difference is dramatic: reading from disk (SSD/database) takes ~1 ms; reading from memory (RAM/cache) takes ~100 ns — roughly **10,000x faster**. At thousands of requests per second, that gap determines whether a system feels instant or sluggish, and whether a database stays healthy or collapses under load.

Caching trades storage and complexity for speed. The challenge is not *whether* to cache, but *what* to cache, *where* to cache it, *how* to keep it fresh, and *what breaks* when you get it wrong.

## Where to Cache

There are four layers where caching can live, each with distinct trade-offs:

### 1. External Cache (Default Choice)

A dedicated caching service (Redis, Memcached) running on its own server, separate from your application and database.

| Pros | Cons |
|------|------|
| Shared across all application servers — one cache hit benefits everyone | Requires a network hop (adds ~0.5–1 ms vs. in-process) |
| Scales independently from the application | Additional infrastructure to manage |
| Global view — no consistency issues between app servers | Cache is another point of failure |

**When to use:** This is the default. Use it unless you have a specific reason not to.

### 2. In-Process Cache

Data cached directly in the application server's memory (e.g., a HashMap, Guava Cache, or similar library).

| Pros | Cons |
|------|------|
| Fastest possible — no network hop, data is in the same memory space | Each server has its own copy — no sharing between instances |
| Zero additional infrastructure | Can cause inconsistencies across servers |
| Simple to implement | Limited by application server memory |

**When to use:** Config data, feature flags, small lookup tables, or any data that every request needs and that changes infrequently. Not suitable as a primary caching layer for user-facing data in a multi-server environment.

### 3. CDN (Content Delivery Network)

A geographically distributed network of edge servers that cache content close to users. Optimizes for **network latency**, not memory vs. disk speed.

| Without CDN | With CDN |
|-------------|----------|
| Request travels to origin server (e.g., Virginia → Australia = ~300–350 ms round trip) | Request hits nearest edge server (~20–40 ms round trip) |

**How it works:** User requests content → nearest CDN edge checks its cache → if hit, return immediately → if miss, fetch from origin, cache at edge, then return.

**Beyond static assets:** Modern CDNs can also cache public API responses, HTML pages, and run edge logic for personalization. But the primary use case is media delivery: images, videos, static files.

**When to use:** Global users accessing media, static assets, or any content that can be served from edge locations.

### 4. Client-Side Cache

Data stored on the user's device — browser HTTP cache, local storage, or mobile app local data.

| Pros | Cons |
|------|------|
| Fastest — no network call at all | Least control over freshness and invalidation |
| Enables offline functionality | Data can go stale without the server knowing |

**When to use:** Offline-capable apps, browser asset caching, or client-heavy workloads where the device can meaningfully reduce server load.

## Cache Architectures

Cache architectures define the **read/write interaction pattern** between application, cache, and database.

### Cache-Aside (Default Choice)

```
Read path:
  App → check cache → HIT → return data
                     → MISS → read from DB → write to cache → return data

Write path:
  App → write to DB (cache is not updated on writes)
```

| Pros | Cons |
|------|------|
| Cache stays lean — only caches data that is actually requested | First request for any data is slower (cache miss + DB read + cache write) |
| Simple — no special frameworks needed | Cache can become stale after writes until TTL expires or key is invalidated |
| Works with any cache (Redis, Memcached) | |

**This is the default caching pattern.** Use it unless you have a specific reason to choose something else.

### Write-Through

```
Write path:
  App → write to cache → cache synchronously writes to DB → return to client

Read path:
  App → check cache → HIT → return data (always fresh because writes go through cache)
```

| Pros | Cons |
|------|------|
| Cache is always up to date after writes | Slower writes (must wait for both cache and DB) |
| Strong consistency between cache and DB | Pollutes cache with data that may never be read |
| | Dual-write problem: if cache succeeds but DB fails (or vice versa), they become inconsistent |
| | Requires specialized framework (Spring Cache, Hazelcast) — Redis/Memcached don't natively support this |

**When to use:** Only when reads *must* always return the freshest data AND you can tolerate slower writes. Verify that cache-aside with invalidate-on-write doesn't already solve your problem.

### Write-Behind (Write-Back)

```
Write path:
  App → write to cache → cache asynchronously flushes to DB in batches

Read path:
  Same as write-through (cache is always fresh from writes)
```

| Pros | Cons |
|------|------|
| Very fast writes (only writes to cache) | **Data loss risk** — if cache crashes before flushing, writes are lost |
| Batched DB writes reduce database load | Complex — requires reliable flush mechanism |

**When to use:** High write throughput where some data loss is acceptable (analytics, metrics pipelines). Avoid unless you can strongly justify it — there are usually better alternatives.

### Read-Through

```
Read path:
  App → check cache → HIT → return data
                     → MISS → cache fetches from DB → cache stores it → return to app
```

Identical to cache-aside, except the **cache itself** handles the database lookup instead of the application. This is essentially how CDNs work — on a miss, the CDN fetches from the origin server, caches the result, and serves it next time.

**When to use:** CDNs and edge caching. For application-level caching, cache-aside is simpler because it doesn't require a special framework.

### Summary

| Pattern | Best For | Avoid When |
|---------|----------|-----------|
| **Cache-aside** | General-purpose reads (default) | N/A — this is the safe default |
| **Write-through** | Reads that must always be fresh | Write-heavy workloads (slow writes) |
| **Write-behind** | High write throughput, loss-tolerant | Data integrity matters |
| **Read-through** | CDN/edge caching | Application-level caching (adds complexity) |

## Eviction Policies

Memory is limited — you cannot cache everything. Eviction policies determine what to remove when the cache is full.

| Policy | How It Works | Best For |
|--------|-------------|----------|
| **LRU** (Least Recently Used) | Evicts the item that hasn't been accessed for the longest time | General-purpose (default choice) |
| **LFU** (Least Frequently Used) | Evicts the item accessed the fewest times, regardless of recency | Highly skewed access patterns (a few items are read far more than others) |
| **TTL** (Time to Live) | Each item has an expiration timestamp; removed when it expires | Data that goes stale (sessions, API responses, feeds) |
| **FIFO** (First In, First Out) | Oldest item is removed regardless of access pattern | Rarely the right choice — listed for completeness |

**In practice:** Most systems use **LRU + TTL together** — LRU handles capacity pressure, TTL handles freshness.

## Common Problems

### 1. Cache Stampede (Thundering Herd)

**What happens:** A popular cache entry expires (TTL). Thousands of simultaneous requests all miss the cache and hit the database at the same time, potentially overwhelming it.

**Example:** A homepage feed cached with 60s TTL. 100,000 requests/second. At second 61, all 100,000 requests miss the cache and flood the database.

**Solutions:**

| Solution | How It Works |
|----------|-------------|
| **Request coalescing (single-flight)** | When multiple requests try to rebuild the same cache key, only the first one queries the database. The rest wait for that result. |
| **Cache warming (proactive refresh)** | Refresh popular keys *before* they expire (e.g., at the 55-second mark of a 60-second TTL), so the key never actually expires under load. |

### 2. Cache Consistency (Stale Data)

**What happens:** A write updates the database, but the old value remains in the cache. Subsequent reads return stale data until the cache entry expires or is invalidated.

**Example:** User updates their profile picture. The database has the new image, but the cache still serves the old one.

**Solutions (choose based on freshness requirements):**

| Solution | Trade-Off | Use When |
|----------|----------|----------|
| **Invalidate on write** | Slightly more complex write path | Consistency is important — delete the cache key when writing to the DB, so the next read fetches fresh data |
| **Short TTL** | Bounded staleness (e.g., max 60 seconds stale) | Some staleness is acceptable but should be limited |
| **Accept eventual consistency** | Simplest — no extra logic | Brief delays are fine (feeds, analytics, non-critical displays) |

### 3. Hot Keys

**What happens:** One cache key receives disproportionately more traffic than all others. Even with a healthy cache hit rate, that single key can overload a single Redis node or shard.

**Example:** Taylor Swift's profile on Twitter — millions of requests per second to one key.

**Solutions:**

| Solution | How It Works |
|----------|-------------|
| **Replicate hot keys** | Copy the hot key to every shard/node in the cache cluster. Load balance reads across all copies. |
| **Local fallback cache** | Use in-process caching for extremely hot values, so requests never even leave the application server. |

## When to Introduce Caching

Do not cache by default. Introduce caching when one of these conditions is true:

| Condition | Signal |
|-----------|--------|
| **Read-heavy workload** | Database is handling far more reads than it can sustain (e.g., 2 billion reads/day) |
| **Expensive queries** | Computing the result requires joining multiple tables or heavy aggregation (e.g., personalized news feed) |
| **Latency requirements** | A non-functional requirement demands response times the database alone cannot achieve (e.g., <100 ms P99) |
| **Database under stress** | CPU, connections, or IOPS are near capacity |

## How to Introduce Caching (Step by Step)

1. **Identify the bottleneck.** Quantify it with rough numbers (requests/sec, query cost, latency target).
2. **Decide what to cache.** Focus on data that is read frequently, changes infrequently, or is expensive to compute. Not everything should be cached.
3. **Define cache keys explicitly.** What is the key? What is the value? (e.g., key = `user:{userId}:profile`, value = serialized profile object)
4. **Choose the architecture.** Default to cache-aside unless you have a specific reason for another pattern.
5. **Set the eviction policy.** Default to LRU + TTL. Justify the TTL duration based on how stale the data can acceptably be.
6. **Address the trade-offs.** For your specific system, which problems apply: stampede risk? consistency concerns? hot keys? State your mitigation.

## Validation Checklist

- [ ] I can explain the performance difference between disk and memory access and why it matters at scale.
- [ ] I can describe the four caching layers (external, in-process, CDN, client-side) and when each applies.
- [ ] I can explain cache-aside and describe the read path for both cache hit and cache miss.
- [ ] I can distinguish cache-aside from write-through, write-behind, and read-through.
- [ ] I can name and explain LRU, LFU, TTL, and FIFO eviction policies.
- [ ] I can describe cache stampede and two solutions (coalescing, warming).
- [ ] I can describe cache consistency problems and three mitigation strategies.
- [ ] I can describe the hot key problem and two solutions (replication, local fallback).
- [ ] I can articulate when caching is justified and when it is not.
