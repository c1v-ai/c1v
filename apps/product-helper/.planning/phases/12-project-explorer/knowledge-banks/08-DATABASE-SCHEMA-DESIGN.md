# Knowledge Bank: Database Schema Design (Full Schema Generation)

**Step:** 2.2 - Database Schema Design
**Purpose:** Guide generation of complete database schemas with fields, types, constraints, indexes, and relationships
**Core Question:** "What does the complete database look like — every table, every column, every constraint?"
**Feeds Into:** Schema extraction agent (`schema-extraction-agent.ts`)

---

## WHY THIS STEP MATTERS

> "It's 2026, just use Postgres." — The dominant industry consensus

Entity discovery identifies WHAT needs to be stored. Schema design specifies HOW — field types, constraints, indexes, relationships, and patterns that make the difference between a database that scales and one that collapses under real traffic.

**PostgreSQL 18** (released September 2025) is the current standard:
- Async I/O subsystem: up to 3x storage read performance
- `uuidv7()`: database-friendly UUIDs with sort ordering (replaces `gen_random_uuid()`)
- Virtual generated columns: computed at query time, no storage cost
- OAuth 2.0 native authentication
- 55.6% developer adoption — most popular database in 2026

---

## FIELD TYPE SELECTION RULES

### Primary Keys

| Strategy | Type | When to Use | Example |
|----------|------|-------------|---------|
| UUIDv7 | `uuid` | **Default for new projects (2026)** — sortable, no collision, distributed-safe | `id UUID DEFAULT uuidv7() PRIMARY KEY` |
| UUIDv4 | `uuid` | Legacy projects, random distribution needed | `id UUID DEFAULT gen_random_uuid() PRIMARY KEY` |
| Serial | `serial` / `bigserial` | Simple apps, internal tools, migration from older systems | `id SERIAL PRIMARY KEY` |

**2026 consensus:** Use UUIDv7 for all new projects. PostgreSQL 18 ships `uuidv7()` natively — no extension needed. It provides time-ordering (better index performance than v4) while remaining globally unique.

### Data Types

| Data Type | When to Use | Example Columns |
|-----------|-------------|-----------------|
| `uuid` | Primary keys, external references, API-facing IDs | `id`, `user_id`, `organization_id` |
| `text` | Variable-length strings with no max needed | `description`, `content`, `bio` |
| `varchar(N)` | Constrained strings (validated input) | `email` (255), `slug` (100), `phone` (20) |
| `integer` | Counts, quantities, small numbers | `quantity`, `sort_order`, `retry_count` |
| `bigint` | Large IDs, external system references | `external_id`, `stripe_customer_id` |
| `boolean` | True/false flags | `is_active`, `is_verified`, `is_deleted` |
| `timestamptz` | **Always use WITH timezone** — dates and times | `created_at`, `updated_at`, `scheduled_for` |
| `jsonb` | Flexible/nested data, metadata, settings | `preferences`, `metadata`, `config` |
| `decimal(P,S)` | Money and precise calculations | `price` (10,2), `amount` (12,4), `tax_rate` (5,4) |
| `text[]` | Simple tag lists, small arrays | `tags`, `permissions` |

**Never use:**
- `timestamp` without timezone — always use `timestamptz`
- `money` type — use `decimal(10,2)` instead
- `float`/`double` for money — precision loss
- `char(N)` — use `varchar(N)` or `text` instead

### JSONB vs Normalized Columns (2026 Guidance)

| Use Case | Approach | Why |
|----------|----------|-----|
| Fixed, frequently queried attributes | Normalized columns | 2000x faster query planning, indexable |
| Variable product attributes | JSONB | Schema flexibility across product types |
| User preferences/settings | JSONB | Evolving structure, rarely queried relationally |
| Event payloads, webhook data | JSONB | Flexible, write-once read-rarely |
| Feature flags, A/B config | JSONB | Frequently changing structure |
| Financial data, inventory | **Always normalized** | ACID integrity, query performance critical |

---

## NULLABLE VS REQUIRED DECISION LOGIC

**Required (NOT NULL) when:**
- Part of entity identity (`name`, `email`)
- Needed for business logic (`status`, `type`)
- Foreign key relationship (`user_id`, `project_id`)
- Audit fields (`created_at`)

**Nullable when:**
- Optional user-provided data (`bio`, `avatar_url`, `phone`)
- Populated asynchronously (`processed_at`, `completed_at`)
- Backward compatibility (adding column to existing table)
- External data that may not exist (`stripe_customer_id`)

**Default values:**
```sql
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
is_active     BOOLEAN NOT NULL DEFAULT true
status        TEXT NOT NULL DEFAULT 'draft'
role          TEXT NOT NULL DEFAULT 'member'
sort_order    INTEGER NOT NULL DEFAULT 0
```

---

## CONSTRAINT PATTERNS

| Constraint | When to Use | Example |
|------------|-------------|---------|
| `PRIMARY KEY` | Every table, always on `id` | `id UUID PRIMARY KEY` |
| `FOREIGN KEY` | Reference to another table | `REFERENCES users(id) ON DELETE CASCADE` |
| `UNIQUE` | Email, username, slug, API keys, external IDs | `UNIQUE(email)`, `UNIQUE(org_id, slug)` |
| `NOT NULL` | Required fields (see above) | `name TEXT NOT NULL` |
| `CHECK` | Value validation | `CHECK (status IN ('draft','active','archived'))` |
| `DEFAULT` | Auto-populated values | `DEFAULT now()`, `DEFAULT true` |

### Foreign Key Actions

| Action | When to Use |
|--------|-------------|
| `ON DELETE CASCADE` | Child has no meaning without parent (OrderItem → Order) |
| `ON DELETE SET NULL` | Reference is optional (Post.author_id when author deleted) |
| `ON DELETE RESTRICT` | Prevent deletion if children exist (Organization with active users) |
| `ON UPDATE CASCADE` | Rarely needed with UUID PKs (UUIDs don't change) |

---

## RELATIONSHIP IMPLEMENTATION

| Relationship | Implementation | Example |
|-------------|----------------|---------|
| **One-to-one** | FK with UNIQUE constraint on child | `user_profile.user_id UNIQUE REFERENCES users(id)` |
| **One-to-many** | FK on the "many" side | `posts.author_id REFERENCES users(id)` |
| **Many-to-many** | Junction table | `project_tags(project_id, tag_id)` |
| **Self-referential** | FK to same table | `categories.parent_id REFERENCES categories(id)` |
| **Polymorphic** | Type + ID columns or separate FKs | `commentable_type TEXT, commentable_id UUID` |

### Junction Table Pattern
```sql
CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
```

---

## INDEX RECOMMENDATIONS

### Always Index
- All foreign keys (PostgreSQL does NOT auto-index FKs)
- Columns in WHERE clauses (status, type, is_active)
- Columns in ORDER BY (created_at, sort_order)
- UNIQUE columns (automatically indexed)

### Index Types

| Type | When to Use | Example |
|------|-------------|---------|
| B-tree (default) | Equality and range queries | `CREATE INDEX ON users(email)` |
| GIN | JSONB queries, array contains, full-text search | `CREATE INDEX ON products USING gin(metadata)` |
| GiST | Geometric data, range types, nearest-neighbor | Full-text search with `tsvector` |
| HNSW (pgvector) | Vector similarity search | `CREATE INDEX ON embeddings USING hnsw(embedding vector_cosine_ops)` |
| Partial | Filtered queries | `CREATE INDEX ON orders(status) WHERE status = 'pending'` |
| Composite | Multi-column WHERE clauses | `CREATE INDEX ON posts(author_id, created_at DESC)` |

### Partial Index Pattern (High Value)
```sql
-- Only index active records (90% of queries filter on active)
CREATE INDEX idx_users_active_email ON users(email) WHERE is_active = true;

-- Only index pending orders (most queries are for pending)
CREATE INDEX idx_orders_pending ON orders(created_at DESC) WHERE status = 'pending';
```

---

## COMMON SCHEMA PATTERNS

### Timestamps (Every Table)
```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
```
Use a trigger or application-level middleware to auto-update `updated_at`.

### Soft Delete
```sql
deleted_at  TIMESTAMPTZ  -- NULL = active, non-NULL = deleted
```
- Use `deleted_at` timestamp (not boolean `is_deleted`) — you know WHEN it was deleted
- Add partial index: `WHERE deleted_at IS NULL` for all active-record queries
- For high-volume: consider moving deleted records to archive table

### Audit Log
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,  -- 'create', 'update', 'delete'
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON audit_logs(table_name, record_id);
CREATE INDEX ON audit_logs(user_id, created_at DESC);
```

### Multi-Tenancy (B2B SaaS Default)
```sql
-- Every table gets organization_id
CREATE TABLE projects (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  name             TEXT NOT NULL,
  ...
);
CREATE INDEX ON projects(organization_id);

-- Row-Level Security enforces isolation
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
  USING (organization_id = current_setting('app.current_org')::uuid);
```

### Vector Embeddings (AI Products)
```sql
-- Requires: CREATE EXTENSION vector;
CREATE TABLE document_chunks (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  embedding   vector(1536),  -- OpenAI text-embedding-3-small dimension
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON document_chunks USING hnsw(embedding vector_cosine_ops);
```

**2026 guidance:** pgvector is competitive with purpose-built vector DBs up to ~50-100M vectors. pgvectorscale (Timescale) achieves 471 QPS at 99% recall on 50M vectors.

---

## SCHEMA PATTERNS BY PROJECT TYPE

### B2B SaaS
```
organizations     (id, name, slug, plan, stripe_customer_id, created_at, updated_at)
users             (id, email, name, password_hash, avatar_url, is_active, created_at, updated_at)
memberships       (id, organization_id, user_id, role, invited_by, joined_at) UNIQUE(org_id, user_id)
invitations       (id, organization_id, email, role, token, expires_at, accepted_at, created_at)
subscriptions     (id, organization_id, plan_id, status, stripe_subscription_id, current_period_start, current_period_end)
api_keys          (id, organization_id, name, key_hash, last_used_at, expires_at, created_at)
audit_logs        (id, organization_id, user_id, action, table_name, record_id, old_values, new_values, created_at)
```

### Marketplace
```
users             (id, email, name, role, stripe_account_id, created_at, updated_at)
seller_profiles   (id, user_id, business_name, description, verified_at, rating_avg, rating_count)
products          (id, seller_id, name, slug, description, price, currency, status, attributes JSONB, created_at)
product_images    (id, product_id, url, alt_text, sort_order)
categories        (id, parent_id, name, slug, sort_order)
product_categories (product_id, category_id) PK(product_id, category_id)
orders            (id, buyer_id, status, total, currency, shipping_address JSONB, created_at)
order_items       (id, order_id, product_id, seller_id, quantity, unit_price, status)
reviews           (id, product_id, user_id, rating, title, body, created_at) UNIQUE(product_id, user_id)
transactions      (id, order_id, type, amount, currency, stripe_payment_intent_id, status, created_at)
```

### API Platform
```
organizations     (id, name, plan, rate_limit_tier)
api_keys          (id, organization_id, name, key_prefix, key_hash, scopes TEXT[], last_used_at, created_at)
endpoints         (id, path, method, version, description, is_deprecated)
request_logs      (id, api_key_id, endpoint_id, status_code, latency_ms, request_size, response_size, created_at)
rate_limits       (id, api_key_id, window_start, request_count)
webhook_endpoints (id, organization_id, url, events TEXT[], secret_hash, is_active)
webhook_deliveries(id, webhook_endpoint_id, event_type, payload JSONB, status, attempts, last_attempt_at)
```

---

## ORM GUIDANCE (February 2026)

| ORM | Best For | Key Strength |
|-----|----------|-------------|
| **Drizzle ORM** | Serverless/edge, SQL transparency, new projects | Mirrors SQL in TypeScript; ~7.4kb bundle; no codegen step |
| **Prisma** | Rapid prototyping, DX-first teams | Intuitive schema DSL; auto-generated client; broad DB support |

**2026 status:** Drizzle and Prisma are converging. Drizzle added relational queries and migrations. Prisma removed its Rust engine for faster cold starts. Choose based on team preference — both are production-ready.

**Migration tools:**
- Drizzle Kit: generates SQL from TypeScript schema diffs
- Prisma Migrate: declarative from `.prisma` file
- Atlas: "Terraform for databases" — declarative desired-state, auto-computes diff

---

## DATABASE PLATFORM RECOMMENDATIONS (February 2026)

| Platform | Best For | Key Feature |
|----------|----------|-------------|
| **Supabase** | Full-stack SaaS, AI products | All-in-one: Auth, RLS, Realtime, Edge Functions, AI Assistant |
| **Neon** | Serverless apps, CI/CD workflows | Git-like branching, scale-to-zero, instant provisioning |
| **PlanetScale** | High-performance, global distribution | Metal (NVMe), unlimited I/O, now supports PostgreSQL |
| **Turso** | Edge/offline-first, mobile | Embedded replicas, zero-latency reads, concurrent writes |
| **Self-hosted PG** | Full control, cost optimization | PostgreSQL 18 on Hetzner/AWS with Coolify/Docker |

---

## QUALITY CHECKS

**Done right:**
- Every entity from discovery has a complete table definition
- All fields have explicit types, nullable/required, and defaults
- Foreign keys defined with appropriate ON DELETE actions
- Indexes on all FKs and commonly queried columns
- Timestamps (created_at, updated_at) on every table
- Multi-tenancy column if B2B SaaS
- Audit log table if compliance/enterprise

**Done wrong:**
- Tables with only `id` and `name` (missing real fields)
- No foreign keys defined (just IDs without REFERENCES)
- Using `timestamp` without timezone
- No indexes beyond primary keys
- Missing junction tables for many-to-many relationships
- JSONB for everything (over-flexible, under-queryable)

---

## INDUSTRY VERTICAL SCHEMAS

### Healthcare (HIPAA-Compliant)
```sql
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  mrn             VARCHAR(20) NOT NULL UNIQUE,  -- Medical Record Number
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  date_of_birth   DATE NOT NULL,
  gender          TEXT NOT NULL CHECK (gender IN ('male','female','other','unknown')),
  email           VARCHAR(255),
  phone           VARCHAR(20),
  address         JSONB,  -- street, city, state, zip, country
  emergency_contact JSONB,
  insurance_id    UUID REFERENCES insurance_plans(id),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON patients(mrn);
CREATE INDEX ON patients(last_name, first_name);

CREATE TABLE encounters (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  encounter_type  TEXT NOT NULL CHECK (encounter_type IN ('outpatient','inpatient','emergency','telehealth')),
  status          TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in-progress','completed','cancelled')),
  reason          TEXT,
  notes           TEXT,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  location_id     UUID REFERENCES locations(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON encounters(patient_id, started_at DESC);
CREATE INDEX ON encounters(practitioner_id, started_at DESC);
CREATE INDEX ON encounters(status) WHERE status = 'in-progress';

CREATE TABLE observations (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  encounter_id    UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  code            VARCHAR(20) NOT NULL,  -- LOINC code
  display_name    TEXT NOT NULL,          -- "Blood Pressure", "Heart Rate"
  value_quantity  DECIMAL(10,2),
  value_unit      VARCHAR(20),
  value_text      TEXT,
  status          TEXT NOT NULL DEFAULT 'final' CHECK (status IN ('preliminary','final','amended','cancelled')),
  effective_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by     UUID REFERENCES practitioners(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON observations(patient_id, code, effective_at DESC);

-- MANDATORY: PHI audit trail (HIPAA requirement)
CREATE TABLE phi_access_logs (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id         UUID NOT NULL,
  patient_id      UUID NOT NULL,
  action          TEXT NOT NULL,  -- 'view', 'create', 'update', 'export', 'print'
  resource_type   TEXT NOT NULL,  -- 'patient', 'encounter', 'observation'
  resource_id     UUID NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON phi_access_logs(patient_id, created_at DESC);
CREATE INDEX ON phi_access_logs(user_id, created_at DESC);
```

### Fintech (Double-Entry Ledger)
```sql
CREATE TABLE accounts (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  account_type    TEXT NOT NULL CHECK (account_type IN ('checking','savings','investment','credit')),
  account_number  VARCHAR(20) NOT NULL UNIQUE,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','frozen','closed')),
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ledger_accounts (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  name            TEXT NOT NULL UNIQUE,
  account_type    TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','revenue','expense')),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  balance         DECIMAL(18,4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable: NEVER update or delete ledger entries
CREATE TABLE ledger_entries (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id),
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  entry_type      TEXT NOT NULL CHECK (entry_type IN ('debit','credit')),
  amount          DECIMAL(18,4) NOT NULL CHECK (amount > 0),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON ledger_entries(transaction_id);
CREATE INDEX ON ledger_entries(ledger_account_id, created_at DESC);

CREATE TABLE kyc_verifications (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity','address','income','beneficial_owner')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  provider        TEXT NOT NULL,  -- 'plaid_identity', 'jumio', 'manual'
  provider_ref    TEXT,
  verified_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON kyc_verifications(customer_id, verification_type);
```

### E-Commerce
```sql
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_id       UUID REFERENCES users(id),
  sku             VARCHAR(50) NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  base_price      DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived','out_of_stock')),
  category_id     UUID REFERENCES categories(id),
  attributes      JSONB DEFAULT '{}',  -- variable attrs (size, color, material)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON products(seller_id);
CREATE INDEX ON products(category_id);
CREATE INDEX ON products(status) WHERE status = 'active';
CREATE INDEX ON products USING gin(attributes);  -- JSONB attribute queries

CREATE TABLE product_variants (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku             VARCHAR(50) NOT NULL UNIQUE,
  attributes      JSONB NOT NULL,  -- {"size": "M", "color": "blue"}
  price_override  DECIMAL(10,2),   -- NULL = use base_price
  inventory_count INTEGER NOT NULL DEFAULT 0 CHECK (inventory_count >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON product_variants(product_id);

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  buyer_id        UUID NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal        DECIMAL(10,2) NOT NULL,
  tax             DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost   DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  shipping_address JSONB,
  placed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON orders(buyer_id, placed_at DESC);
CREATE INDEX ON orders(status) WHERE status IN ('pending','processing','shipped');

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      DECIMAL(10,2) NOT NULL,
  total           DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON order_items(order_id);
```

### Education (LMS)
```sql
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  instructor_id   UUID NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  max_enrollment  INTEGER,
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON courses(instructor_id);
CREATE INDEX ON courses(status) WHERE status = 'published';

CREATE TABLE modules (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON modules(course_id, sort_order);

CREATE TABLE lessons (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('video','reading','quiz','assignment','discussion')),
  content_url     TEXT,
  duration_minutes INTEGER,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lessons(module_id, sort_order);

CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  student_id      UUID NOT NULL REFERENCES users(id),
  course_id       UUID NOT NULL REFERENCES courses(id),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','dropped','waitlisted')),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  final_grade     DECIMAL(5,2),
  UNIQUE(student_id, course_id)
);
CREATE INDEX ON enrollments(student_id);
CREATE INDEX ON enrollments(course_id);

CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  lesson_id       UUID NOT NULL REFERENCES lessons(id),
  student_id      UUID NOT NULL REFERENCES users(id),
  content         TEXT,
  file_url        TEXT,
  score           DECIMAL(5,2),
  feedback        TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at       TIMESTAMPTZ,
  graded_by       UUID REFERENCES users(id)
);
CREATE INDEX ON submissions(lesson_id, student_id);
CREATE INDEX ON submissions(student_id, submitted_at DESC);
```

### Automotive (Dealer Management)
```sql
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  vin             CHAR(17) NOT NULL UNIQUE,
  make            TEXT NOT NULL,
  model           TEXT NOT NULL,
  year            INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2030),
  trim_level      TEXT,
  exterior_color  TEXT,
  interior_color  TEXT,
  mileage         INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  condition       TEXT NOT NULL CHECK (condition IN ('new','certified_pre_owned','used')),
  status          TEXT NOT NULL DEFAULT 'in_stock'
                  CHECK (status IN ('in_stock','reserved','sold','in_transit','service')),
  dealer_id       UUID NOT NULL REFERENCES dealers(id),
  sticker_price   DECIMAL(10,2),
  internet_price  DECIMAL(10,2),
  acquired_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON vehicles(dealer_id, status);
CREATE INDEX ON vehicles(make, model, year);
CREATE INDEX ON vehicles(status) WHERE status = 'in_stock';

CREATE TABLE service_appointments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  dealer_id       UUID NOT NULL REFERENCES dealers(id),
  service_type    TEXT NOT NULL CHECK (service_type IN ('maintenance','repair','recall','inspection','warranty')),
  status          TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','checked_in','in_progress','completed','cancelled')),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  labor_hours     DECIMAL(5,2),
  parts_cost      DECIMAL(10,2),
  labor_cost      DECIMAL(10,2),
  total_cost      DECIMAL(10,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON service_appointments(vehicle_id);
CREATE INDEX ON service_appointments(customer_id);
CREATE INDEX ON service_appointments(scheduled_at) WHERE status = 'scheduled';
```

### Multi-Tenancy Approaches

| Approach | Isolation | Complexity | Best For |
|----------|-----------|------------|----------|
| **Shared schema + RLS** | Row-level | Low | SaaS with <1000 tenants, Supabase |
| **Schema-per-tenant** | Schema-level | Medium | Healthcare (HIPAA), regulated industries |
| **Database-per-tenant** | Full | High | Enterprise, strict data residency |

**Shared schema + RLS (recommended default):**
```sql
-- Every table gets tenant_id
ALTER TABLE projects ADD COLUMN tenant_id UUID NOT NULL REFERENCES organizations(id);
CREATE INDEX ON projects(tenant_id);

-- RLS policy enforces isolation at the database level
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Logistics / Supply Chain
```sql
CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  shipper_id      UUID NOT NULL REFERENCES customers(id),
  consignee_id    UUID NOT NULL REFERENCES customers(id),
  carrier_id      UUID REFERENCES carriers(id),
  tracking_number VARCHAR(50) UNIQUE,
  origin          JSONB NOT NULL,   -- {address, city, state, country, postal_code, lat, lng}
  destination     JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'created'
                  CHECK (status IN ('created','booked','picked_up','in_transit','out_for_delivery','delivered','exception','returned')),
  service_level   TEXT NOT NULL CHECK (service_level IN ('ground','express','overnight','freight','ltl','ftl')),
  weight_kg       DECIMAL(10,3),
  dimensions      JSONB,            -- {length, width, height, unit}
  declared_value  DECIMAL(12,2),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  estimated_delivery TIMESTAMPTZ,
  actual_delivery    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON shipments(shipper_id, created_at DESC);
CREATE INDEX ON shipments(tracking_number);
CREATE INDEX ON shipments(status) WHERE status IN ('in_transit','out_for_delivery');

CREATE TABLE shipment_events (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,    -- 'pickup_scan', 'departure_scan', 'arrival_scan', 'delivery', 'exception'
  location        JSONB,            -- {city, state, country, facility_code}
  description     TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON shipment_events(shipment_id, occurred_at DESC);

CREATE TABLE inventory_items (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  warehouse_id    UUID NOT NULL REFERENCES warehouses(id),
  sku             VARCHAR(50) NOT NULL,
  name            TEXT NOT NULL,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  bin_location    VARCHAR(20),      -- 'A-01-03' (aisle-rack-shelf)
  lot_number      VARCHAR(50),
  expiry_date     DATE,
  reorder_point   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(warehouse_id, sku, lot_number)
);
CREATE INDEX ON inventory_items(warehouse_id, sku);
CREATE INDEX ON inventory_items(quantity_available) WHERE quantity_available <= 0;  -- stockout alert
```

### Insurance / Insurtech
```sql
CREATE TABLE policies (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_number   VARCHAR(30) NOT NULL UNIQUE,
  policyholder_id UUID NOT NULL REFERENCES customers(id),
  product_line    TEXT NOT NULL CHECK (product_line IN ('auto','home','life','health','commercial','cyber')),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','quoted','bound','active','lapsed','cancelled','expired')),
  effective_date  DATE NOT NULL,
  expiration_date DATE NOT NULL,
  premium_amount  DECIMAL(12,2) NOT NULL,
  premium_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (premium_frequency IN ('monthly','quarterly','semi_annual','annual')),
  deductible      DECIMAL(10,2),
  coverage_limit  DECIMAL(14,2),
  coverages       JSONB NOT NULL DEFAULT '[]',  -- [{type, limit, deductible, premium}]
  underwriting_data JSONB,          -- risk factors (varies by product line)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expiration_date > effective_date)
);
CREATE INDEX ON policies(policyholder_id);
CREATE INDEX ON policies(status) WHERE status = 'active';
CREATE INDEX ON policies(expiration_date) WHERE status = 'active';  -- renewal processing

-- Immutable: policy changes create new versions
CREATE TABLE policy_versions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id       UUID NOT NULL REFERENCES policies(id),
  version_number  INTEGER NOT NULL,
  change_type     TEXT NOT NULL CHECK (change_type IN ('new_business','endorsement','renewal','cancellation','reinstatement')),
  effective_date  DATE NOT NULL,
  changes         JSONB NOT NULL,   -- diff of what changed
  premium_delta   DECIMAL(12,2),    -- change in premium
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(policy_id, version_number)
);
CREATE INDEX ON policy_versions(policy_id, version_number DESC);

CREATE TABLE claims (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_number    VARCHAR(20) NOT NULL UNIQUE,
  policy_id       UUID NOT NULL REFERENCES policies(id),
  claimant_id     UUID NOT NULL REFERENCES customers(id),
  adjuster_id     UUID REFERENCES users(id),
  loss_date       DATE NOT NULL,
  reported_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  loss_type       TEXT NOT NULL,     -- 'collision', 'theft', 'water_damage', 'liability', etc.
  status          TEXT NOT NULL DEFAULT 'fnol'
                  CHECK (status IN ('fnol','under_investigation','evaluation','negotiation','settled','closed','denied','reopened')),
  description     TEXT NOT NULL,
  estimated_loss  DECIMAL(12,2),
  paid_amount     DECIMAL(12,2) DEFAULT 0,
  reserved_amount DECIMAL(12,2) DEFAULT 0,
  location        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON claims(policy_id);
CREATE INDEX ON claims(adjuster_id) WHERE status NOT IN ('closed','denied');
CREATE INDEX ON claims(status) WHERE status NOT IN ('closed','denied','settled');
```

### Real Estate
```sql
CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  mls_number      VARCHAR(20) UNIQUE,
  address         JSONB NOT NULL,   -- {street, unit, city, state, zip, county, lat, lng}
  property_type   TEXT NOT NULL CHECK (property_type IN ('single_family','condo','townhouse','multi_family','land','commercial')),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','coming_soon','active','pending','contingent','sold','withdrawn','expired')),
  list_price      DECIMAL(12,2),
  sold_price      DECIMAL(12,2),
  bedrooms        INTEGER,
  bathrooms       DECIMAL(3,1),
  sqft            INTEGER,
  lot_sqft        INTEGER,
  year_built      INTEGER,
  description     TEXT,
  features        JSONB DEFAULT '[]',  -- ['pool', 'garage', 'fireplace', ...]
  listing_agent_id UUID REFERENCES agents(id),
  listed_at       TIMESTAMPTZ,
  sold_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON properties(status) WHERE status = 'active';
CREATE INDEX ON properties USING gin(address);  -- JSONB location queries
CREATE INDEX ON properties(list_price) WHERE status = 'active';

CREATE TABLE offers (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id     UUID NOT NULL REFERENCES properties(id),
  buyer_id        UUID NOT NULL REFERENCES contacts(id),
  buyer_agent_id  UUID REFERENCES agents(id),
  offer_price     DECIMAL(12,2) NOT NULL,
  earnest_money   DECIMAL(10,2),
  financing_type  TEXT CHECK (financing_type IN ('conventional','fha','va','cash','other')),
  contingencies   JSONB DEFAULT '[]',  -- ['inspection', 'appraisal', 'financing', 'sale_of_home']
  closing_date    DATE,
  expiration      TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','countered','accepted','rejected','withdrawn','expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON offers(property_id, created_at DESC);
CREATE INDEX ON offers(buyer_id);
```

### Legal / LegalTech
```sql
CREATE TABLE cases (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  case_number     VARCHAR(30) NOT NULL UNIQUE,
  client_id       UUID NOT NULL REFERENCES clients(id),
  lead_attorney_id UUID NOT NULL REFERENCES users(id),
  practice_area   TEXT NOT NULL CHECK (practice_area IN ('litigation','corporate','ip','employment','real_estate','family','criminal','immigration')),
  case_type       TEXT NOT NULL,     -- 'breach_of_contract', 'trademark_filing', 'merger', etc.
  status          TEXT NOT NULL DEFAULT 'intake'
                  CHECK (status IN ('intake','active','discovery','trial','appeal','settled','closed','archived')),
  court           TEXT,
  docket_number   VARCHAR(50),
  statute_of_limitations DATE,
  description     TEXT,
  opposing_party  TEXT,
  opposing_counsel TEXT,
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON cases(client_id);
CREATE INDEX ON cases(lead_attorney_id) WHERE status IN ('active','discovery','trial');
CREATE INDEX ON cases(statute_of_limitations) WHERE status = 'active';  -- critical deadline tracking

CREATE TABLE time_entries (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id         UUID NOT NULL REFERENCES cases(id),
  attorney_id     UUID NOT NULL REFERENCES users(id),
  date            DATE NOT NULL,
  hours           DECIMAL(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  billing_rate    DECIMAL(8,2) NOT NULL,  -- rate at time of entry (snapshot)
  description     TEXT NOT NULL,           -- "Drafted motion for summary judgment"
  activity_code   VARCHAR(10),            -- UTBMS/LEDES codes for e-billing
  is_billable     BOOLEAN NOT NULL DEFAULT true,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','invoiced','written_off')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON time_entries(case_id, date DESC);
CREATE INDEX ON time_entries(attorney_id, date DESC);
CREATE INDEX ON time_entries(status) WHERE status IN ('draft','submitted');

-- IOLTA Trust Account (separate from operating — ethics requirement)
CREATE TABLE trust_transactions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  trust_account_id UUID NOT NULL REFERENCES trust_accounts(id),
  case_id         UUID REFERENCES cases(id),
  client_id       UUID NOT NULL REFERENCES clients(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit','withdrawal','interest','fee')),
  amount          DECIMAL(12,2) NOT NULL,
  running_balance DECIMAL(12,2) NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON trust_transactions(trust_account_id, created_at DESC);
CREATE INDEX ON trust_transactions(client_id);
-- AUDIT: Trust transactions are NEVER deleted or modified (ethics/bar requirement)
```

### Hospitality / Travel
```sql
CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  host_id         UUID NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  property_type   TEXT NOT NULL CHECK (property_type IN ('hotel','vacation_rental','hostel','bnb','resort','apartment')),
  description     TEXT,
  address         JSONB NOT NULL,
  coordinates     POINT,           -- PostGIS for location queries
  amenities       TEXT[] DEFAULT '{}',
  house_rules     JSONB,
  check_in_time   TIME NOT NULL DEFAULT '15:00',
  check_out_time  TIME NOT NULL DEFAULT '11:00',
  max_guests      INTEGER NOT NULL DEFAULT 2,
  star_rating     DECIMAL(2,1),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','listed','unlisted','suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON properties(host_id);
CREATE INDEX ON properties USING gist(coordinates);  -- geospatial queries

-- Calendar-based inventory (one row per room per date)
CREATE TABLE availability (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  price           DECIMAL(10,2) NOT NULL,
  min_stay_nights INTEGER NOT NULL DEFAULT 1,
  UNIQUE(room_id, date)
);
CREATE INDEX ON availability(room_id, date) WHERE is_available = true;

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id     UUID NOT NULL REFERENCES properties(id),
  room_id         UUID NOT NULL REFERENCES rooms(id),
  guest_id        UUID NOT NULL REFERENCES users(id),
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  guests_count    INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled','no_show')),
  subtotal        DECIMAL(10,2) NOT NULL,
  cleaning_fee    DECIMAL(10,2) DEFAULT 0,
  service_fee     DECIMAL(10,2) DEFAULT 0,
  taxes           DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  special_requests TEXT,
  cancellation_policy TEXT NOT NULL DEFAULT 'moderate'
                  CHECK (cancellation_policy IN ('flexible','moderate','strict','non_refundable')),
  cancelled_at    TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);
CREATE INDEX ON bookings(property_id, check_in, check_out);
CREATE INDEX ON bookings(guest_id, created_at DESC);
CREATE INDEX ON bookings(status) WHERE status IN ('pending','confirmed','checked_in');

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) UNIQUE,  -- one review per stay
  property_id     UUID NOT NULL REFERENCES properties(id),
  guest_id        UUID NOT NULL REFERENCES users(id),
  overall_rating  INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness     INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
  accuracy        INTEGER CHECK (accuracy BETWEEN 1 AND 5),
  communication   INTEGER CHECK (communication BETWEEN 1 AND 5),
  location        INTEGER CHECK (location BETWEEN 1 AND 5),
  value           INTEGER CHECK (value BETWEEN 1 AND 5),
  comment         TEXT,
  host_response   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON reviews(property_id, created_at DESC);
```
