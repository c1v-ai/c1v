# Data Modeling — Database Selection, Schema Design, and Scaling

## Context (Why This Matters)

Data modeling is the process of defining how your application's data is structured, stored, and related. Every system design decision flows through the database: which entities exist, how they connect, how they're queried, and how they scale. A poor data model creates slow queries, data inconsistencies, and scaling bottlenecks that are expensive to fix later. The database choice and schema design should be driven by three factors you determine early in the design:

1. **Data volume** — how much data, and does it fit on a single machine?
2. **Access patterns** — how will the data be queried? (derived from your API design)
3. **Consistency requirements** — does this data need strong consistency or is eventual consistency acceptable?

## Database Types

### Relational Database (Default Choice)

Data is organized into **tables** with fixed schemas, rows, and columns. Tables are connected through **foreign keys**. Supports complex queries via SQL joins.

**Examples:** PostgreSQL, MySQL, Google Spanner

| Pros | Cons |
|------|------|
| Strong consistency and referential integrity | Schema changes require migrations |
| Powerful joins for complex queries | Can be slower for very high write volumes |
| Well-understood, mature ecosystem | Horizontal scaling (sharding) adds complexity |

**When to use:** This is the default. Unless you have a specific reason to choose something else, use PostgreSQL. Even Facebook models its social graph in MySQL.

### Document Database

Data is stored as JSON-like documents in collections. Schemas are flexible — each document can have different fields.

**Examples:** MongoDB, Firestore, CouchDB

| Pros | Cons |
|------|------|
| Flexible schema — add fields without migrations | Weaker join support (historically) |
| Natural fit for nested/hierarchical data | Denormalization can lead to data inconsistencies |
| Easy to get started | Less referential integrity enforcement |

**When to use:** When schema flexibility is genuinely needed — the data structure evolves frequently and you can't predict future fields. In a scoped system design exercise with fixed requirements, this advantage is largely neutralized.

### Key-Value Store

The simplest model — data is stored and retrieved by an exact key match. Like a giant hash map.

**Examples:** Redis, Memcached, DynamoDB (hybrid key-value/document)

| Pros | Cons |
|------|------|
| Extremely fast lookups (O(1) by key) | Cannot query by anything other than the key |
| Simple to understand and operate | Requires heavy denormalization and data duplication |
| Perfect for caching | Not suitable as a primary database for most use cases |

**When to use:** As a **cache layer in front of a primary database** (e.g., Redis caching user feeds, session data, hot queries). Rarely as a standalone primary database.

### Wide-Column Database

Each row can have different columns. Data is organized into **column families**. Optimized for massive write volumes — writes always append new columns rather than updating existing data.

**Examples:** Cassandra, HBase, ScyllaDB

| Pros | Cons |
|------|------|
| Extremely fast writes (append-only) | Limited query flexibility |
| Scales horizontally with ease | Breaks relational intuition — harder to reason about |
| Ideal for time-series and event data | Not suitable for complex joins |

**When to use:** Time-series data, event logging, IoT sensor data, analytics workloads — anywhere with massive write volume and simple read patterns.

### Graph Database

Data is stored as **nodes** (entities) and **edges** (relationships). Optimized for traversing complex relationship networks.

**Examples:** Neo4j, Amazon Neptune

| Pros | Cons |
|------|------|
| Fast traversal of complex relationships | Narrow use case — most problems don't need graph queries |
| Natural for recommendation engines, social graphs | Can be modeled with relational databases in most cases |

**When to use:** Almost never in practice. Even the largest social networks (Facebook) use relational databases for their social graph. Avoid unless your problem is fundamentally about multi-hop relationship traversal that cannot be modeled relationally.

### Database Selection Summary

| Database Type | Best For | Default? |
|--------------|----------|----------|
| **Relational (PostgreSQL)** | Almost everything | **Yes — start here** |
| **Document (MongoDB)** | Truly flexible/evolving schemas | No |
| **Key-Value (Redis)** | Caching layer, session storage | As a complement, not primary |
| **Wide-Column (Cassandra)** | Massive write volumes, time-series | No |
| **Graph (Neo4j)** | Complex multi-hop traversals | No — avoid |

---

## Schema Design

### Primary Keys and Foreign Keys

| Concept | Definition | Purpose |
|---------|-----------|---------|
| **Primary Key (PK)** | A unique identifier for each record in a table | Ensures every record can be uniquely identified (like a social security number) |
| **Foreign Key (FK)** | A field in one table that references the primary key of another table | Creates relationships between tables and enforces referential integrity |

**Referential integrity:** The database prevents creating a record that references a non-existent parent. You cannot create a post by a user that doesn't exist.

### Worked Example (Instagram)

```
USERS
  id (PK)
  username
  email (UNIQUE)

POSTS
  id (PK)
  user_id (FK → users.id)
  content
  created_at

LIKES
  id (PK)
  user_id (FK → users.id)
  post_id (FK → posts.id)

COMMENTS
  id (PK)
  user_id (FK → users.id)
  post_id (FK → posts.id)
  text
  created_at
```

**Relationships become obvious from foreign keys:**
- `posts.user_id → users.id` → one user can have many posts
- `likes.user_id + likes.post_id` → users can like many posts, posts can be liked by many users (many-to-many)

**Don't get caught up memorizing "one-to-many" vs "many-to-many" terminology.** Define your foreign keys clearly and the relationships speak for themselves.

### Constraints

| Constraint | Purpose | Example |
|-----------|---------|---------|
| **NOT NULL** | Column must have a value | `username NOT NULL` — every user must have a username |
| **UNIQUE** | No two rows can have the same value | `email UNIQUE` — no duplicate emails |
| **CHECK** | Value must meet a condition | `age CHECK (age >= 0)` |

---

## Normalization vs Denormalization

### Normalization (Default)

Each piece of data is stored in **exactly one location**. No duplication.

| Pros | Cons |
|------|------|
| Data consistency — update in one place, reflected everywhere | Requires joins to combine related data |
| No risk of stale/conflicting copies | Joins can be slower for read-heavy workloads |

### Denormalization

Deliberately **duplicating data** across tables or stores for read performance.

| Pros | Cons |
|------|------|
| Faster reads — no joins needed | Risk of inconsistency when data changes |
| Reduces query complexity | More storage used |

### Decision Rule

1. **Always start normalized.** No duplication, clean relationships.
2. **Only denormalize when you have a specific performance need** that cannot be solved by indexing.
3. **If you denormalize, prefer doing it in the cache** (e.g., a denormalized user feed in Redis) rather than in the primary database. Caches tolerate eventual consistency; primary databases should not have conflicting copies.

---

## Indexing

An index is a data structure (typically a B-tree) that helps the database find records without scanning every row. Adding an index makes specific queries faster but adds overhead on writes (the index must be updated on every insert/update).

### How to Choose Indexes

**Work backwards from your API endpoints.** Each endpoint implies a query; each query may need an index.

| API Endpoint | Query | Index Needed |
|-------------|-------|-------------|
| `GET /users/:id/posts` | Find all posts by a given user | `posts.user_id` |
| `GET /posts/:id/comments` | Find all comments on a post | `comments.post_id` |
| `GET /posts?sort=created_at` | Sort posts by date | `posts.created_at` |
| `POST /login` | Find user by email | `users.email` (already UNIQUE, which creates an index) |

### Index Trade-Offs

| Pros | Cons |
|------|------|
| Dramatically faster reads for indexed columns | Slower writes (index must be updated) |
| Essential for any column used in WHERE, JOIN, or ORDER BY | Uses additional storage |

**Rule:** Index the columns that appear in your most common and performance-critical queries. Don't index everything — only what your access patterns require.

---

## Sharding (Horizontal Partitioning)

When data exceeds what a single database machine can handle, you **shard** — split data across multiple machines.

### How Sharding Works

Choose a **shard key** (partition key) that determines which machine holds each record:

```
Shard 1: post_id 0–10,000
Shard 2: post_id 10,001–20,000
Shard 3: post_id 20,001–30,000
```

### Shard Key Selection

The shard key is one of the most important decisions in data modeling. It affects every query.

| Criterion | Why It Matters |
|-----------|---------------|
| **Keep related data together** | Comments should be on the same shard as their post, so `GET /posts/:id/comments` hits one shard, not all of them |
| **Even distribution** | Avoid hot shards where one machine handles disproportionate traffic |
| **Match primary access pattern** | The most common query should be answerable from a single shard |

**Golden rule:** Shard by your primary access pattern so that you avoid cross-shard joins.

**Co-location example:** If you shard posts by `post_id`, also shard comments by `post_id` (not by `comment_id`). This keeps a post and its comments on the same machine.

### When to Shard

Only when the data volume exceeds what fits on a single machine. Sharding adds significant complexity — don't do it prematurely.

---

## Step-by-Step Data Modeling Process

When you reach the database in your design:

1. **Choose a database type.** Default to PostgreSQL unless you have a specific reason otherwise.
2. **Define your tables and columns.** Only the columns needed to satisfy your functional requirements — don't over-specify.
3. **Add primary keys and foreign keys.** Define relationships and referential integrity.
4. **Add constraints.** UNIQUE, NOT NULL, CHECK where appropriate.
5. **Determine indexes.** Work backwards from your API endpoints — what queries must be fast?
6. **Consider denormalization.** Start normalized. Only denormalize for specific performance needs, preferably in a cache layer.
7. **Consider sharding.** Only if data volume exceeds single-machine capacity. Choose a shard key that matches your primary access pattern and keeps related data together.

All decisions in steps 3–7 should be grounded in your three design factors: **data volume**, **access patterns**, and **consistency requirements**.

## Validation Checklist

- [ ] I can name and describe the five database types (relational, document, key-value, wide-column, graph) and know when each applies.
- [ ] I default to PostgreSQL unless I can justify a specific alternative.
- [ ] I can define primary keys, foreign keys, and explain referential integrity.
- [ ] I understand normalization vs denormalization and know to start normalized.
- [ ] I can determine which indexes are needed by working backwards from API endpoints.
- [ ] I understand the trade-off of indexes (faster reads, slower writes).
- [ ] I can explain sharding, choose a shard key, and articulate the importance of data co-location.
- [ ] I know when sharding is needed (data exceeds single-machine capacity) and when it's premature.
- [ ] I can ground all schema decisions in the three key factors: data volume, access patterns, and consistency requirements.
