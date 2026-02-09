/**
 * Generator Knowledge Bank - Prompt Blocks for Generator Agents
 *
 * Curated decision-guidance content from Knowledge Banks 07-12.
 * Each function returns a prompt-ready text block that gets injected
 * into the corresponding generator agent's system prompt.
 *
 * These blocks give the LLM current (February 2026) industry knowledge
 * so generated output reflects real tools, patterns, and best practices
 * instead of generic or outdated recommendations.
 *
 * KB 07: Entity Discovery -> schema-extraction-agent
 * KB 08: Database Schema Design -> schema-extraction-agent
 * KB 09: Tech Stack Selection -> tech-stack-agent
 * KB 10: API Specification Patterns -> api-spec-agent
 * KB 11: Infrastructure Patterns -> infrastructure-agent
 * KB 12: Coding Standards -> guidelines-agent
 */

// ---------------------------------------------------------------------------
// KB 07 + 08: Entity Discovery + Database Schema (for schema-extraction-agent)
// ---------------------------------------------------------------------------

export function getSchemaKnowledge(): string {
  return `## Knowledge Bank: Entity Discovery & Database Schema Design (February 2026)

### Entity Discovery Techniques
- **Noun analysis**: Every noun in use cases/vision is a candidate entity
- **Persistence test**: If data survives a page refresh, it's a database entity
- **Identity test**: Does this thing have a unique identity? Can there be multiples?
- **Attribute vs entity**: If it has 3+ attributes of its own, promote to entity

### Domain Entity Patterns by Project Type
**B2B SaaS**: organizations, users, memberships, invitations, subscriptions, api_keys, audit_logs
**E-Commerce**: users, products, product_images, categories, orders, order_items, reviews, transactions, carts
**Social Platform**: users, posts, comments, likes, follows, notifications, media, reports
**Mobile App**: users, devices, sessions, push_tokens, preferences, sync_state
**API Platform**: organizations, api_keys, endpoints, request_logs, rate_limits, webhook_endpoints, webhook_deliveries
**AI/LLM Product**: users, projects, conversations, messages, documents, document_chunks (with vector embeddings), prompts, usage_logs

### PostgreSQL 18 Standards (Current)
- **Primary keys**: UUIDv7 via \`uuidv7()\` — sortable, no collision, native in PG 18
- **Timestamps**: Always \`timestamptz\` (NOT \`timestamp\`), \`created_at\` + \`updated_at\` on every table
- **Money**: \`decimal(10,2)\` — never \`float\`, never \`money\` type
- **Flexible data**: \`jsonb\` for settings/metadata/preferences; normalized columns for frequently queried data
- **Soft delete**: \`deleted_at timestamptz\` (not boolean) — knows WHEN deleted

### Field Type Rules
| Pattern | Type | Example |
|---------|------|---------|
| \`*_id\`, \`id\` | uuid | user_id, organization_id |
| \`*_at\` | timestamptz | created_at, deleted_at |
| \`is_*\`, \`has_*\`, \`can_*\` | boolean | is_active, has_permission |
| \`*_count\`, quantity | integer | order_count, retry_count |
| price, amount, cost | decimal(10,2) | price, tax_amount |
| metadata, settings, config | jsonb | preferences, attributes |
| status, type, role | text + CHECK or enum | order_status, user_role |

### Constraint Patterns
- **Foreign keys**: Always define with ON DELETE action (CASCADE for children, SET NULL for optional refs, RESTRICT to prevent orphans)
- **Unique**: email, slug, API key hash, (org_id + slug) composite
- **Check**: status IN ('draft','active','archived')
- **Indexes**: All foreign keys (PG does NOT auto-index FKs), columns in WHERE/ORDER BY, partial indexes for filtered queries

### Relationship Patterns
| Relationship | Implementation |
|-------------|----------------|
| One-to-one | FK with UNIQUE constraint on child |
| One-to-many | FK on the "many" side |
| Many-to-many | Junction table with composite unique |
| Self-referential | FK to same table (categories.parent_id) |

### Multi-Tenancy (B2B SaaS Default)
Every table gets \`organization_id\` with index. Consider Row-Level Security (RLS) for tenant isolation.

### Vector Embeddings (AI Products)
\`embedding vector(1536)\` with HNSW index for cosine similarity. pgvector handles up to ~50-100M vectors competitively.

### ORM Guidance (2026)
- **Drizzle ORM**: 7.4kB bundle, SQL-like API, serverless/edge-friendly — recommended for new projects
- **Prisma**: Intuitive schema DSL, broad DB support — still production-ready
- Both converging in features. Pick based on team preference.`;
}

// ---------------------------------------------------------------------------
// KB 09: Tech Stack Selection (for tech-stack-agent)
// ---------------------------------------------------------------------------

export function getTechStackKnowledge(): string {
  return `## Knowledge Bank: Tech Stack Selection (February 2026)

### Decision Framework
Evaluate every recommendation against: project type, team size, scale requirements, budget, time to market, compliance needs.

### Frontend Framework Selection
| Requirement | Primary | Why | Runner-Up |
|-------------|---------|-----|-----------|
| SaaS / B2B dashboard | Next.js 16 | RSC, React Compiler, largest ecosystem | TanStack Start v1 |
| Marketing / content | Astro 5 | Islands architecture, 95% less JS | SvelteKit 5 |
| Complex SPA | React 19 + Vite | React Compiler, AI tools generate React | Vue 3 + Nuxt 4 |
| Performance-critical | SvelteKit 5 (Runes) | Compiles away framework, 50% smaller | Solid.js |
| Mobile + Web | React Native + Expo | File-based routing, OTA updates | Flutter |
| Desktop + Mobile | Tauri 2.0 | Under 10MB apps, iOS/Android | Electron |

### Backend Framework Selection
| Requirement | Primary | Why | Runner-Up |
|-------------|---------|-----|-----------|
| Edge/serverless API | Hono 4 | <12kB, runs everywhere | Elysia (Bun) |
| TypeScript internal | tRPC v11 | End-to-end type safety | Server Actions |
| Node.js server | Fastify | Perf over Express, mature | NestJS |
| High concurrency | Go (Gin/Echo) | Goroutines, cloud-native | Rust (Axum) |
| ML/data pipeline | Python (FastAPI) | ML ecosystem, async | Django REST |

### Database Selection
| Requirement | Primary | Why | Runner-Up |
|-------------|---------|-----|-----------|
| General purpose | PostgreSQL 18 | 55.6% adoption, UUIDv7, async I/O 3x perf | MySQL 8 |
| Full-stack platform | Supabase | PG + Auth + Realtime + Edge Functions | Firebase |
| Serverless | Neon | Git-like branching, scale-to-zero | Turso (edge) |
| Vector/AI | pgvector | Same DB for relational + vectors | Pinecone |

### Authentication Selection
| Requirement | Primary | Why | Runner-Up |
|-------------|---------|-----|-----------|
| Self-hosted | Better Auth | Framework-agnostic, data in YOUR DB, YC W25 | Auth.js |
| Managed/enterprise | Clerk | Pre-built UI, SOC2/HIPAA, org management | Auth0 |
| Supabase ecosystem | Supabase Auth | Integrated with DB, RLS | Better Auth |

### Additional Tool Recommendations
- **CSS**: Tailwind CSS v4 + shadcn/ui (industry standard, AI generates it natively)
- **ORM**: Drizzle ORM (serverless) or Prisma (DX-first)
- **Testing**: Vitest + Playwright (unit/integration + E2E)
- **Linting**: Biome v2.3 (replaces ESLint + Prettier, 10-100x faster)
- **Package manager**: pnpm (disk-efficient, strict deps)
- **State**: Zustand (simple, hook-based)
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe
- **Analytics**: PostHog (open-source, feature flags + replay)
- **Error tracking**: Sentry
- **Email**: Resend + React Email
- **CI/CD**: GitHub Actions

### Recommended Stacks by Project Type
**B2B SaaS**: Next.js 16 + tRPC v11 + PostgreSQL/Supabase + Drizzle + Clerk/Better Auth + Stripe + Tailwind v4 + shadcn/ui
**Marketplace**: Next.js 16 + Hono + PostgreSQL/Neon + Prisma + Clerk + Stripe Connect + Meilisearch
**Mobile App**: React Native + Expo + Hono on Cloudflare Workers + Turso/Supabase
**API Platform**: Hono 4 + PostgreSQL/Neon + Drizzle + API keys + Scalar (OpenAPI 3.2)
**AI/LLM Product**: Next.js 16 + Vercel AI SDK + LangChain/LangGraph + PostgreSQL + pgvector + Supabase
**E-Commerce**: Next.js 16 + PostgreSQL/Supabase + Drizzle + Stripe + Meilisearch

### Deployment
| Stage | Stack | Cost |
|-------|-------|------|
| Prototype | Vercel Free + Supabase Free | $0 |
| MVP | Vercel Pro + Supabase Pro | $45-100/mo |
| Growth (cost-conscious) | Coolify on Hetzner VPS | $20-100/mo |
| Growth (scale) | Railway or AWS ECS | $200-500/mo |
| Enterprise | Kubernetes (EKS/GKE) | $1,000+/mo |

**Key 2026 shift**: Self-hosting is back. Coolify gives Vercel-like DX at 10-20% cost.`;
}

// ---------------------------------------------------------------------------
// KB 10: API Specification Patterns (for api-spec-agent)
// ---------------------------------------------------------------------------

export function getAPISpecKnowledge(): string {
  return `## Knowledge Bank: API Specification Patterns (February 2026)

### API Style Selection (2026 Consensus)
REST for public APIs + tRPC for internal TypeScript APIs. GraphQL adoption plateaued.

### REST Endpoint Naming Rules
- **Plural nouns**: /users, /projects, /orders (not singular)
- **Lowercase, hyphen-separated**: /api-keys, /user-stories (not camelCase)
- **Nested resources max 2 levels**: /organizations/{orgId}/projects/{projectId}
- **Actions as sub-resources**: POST /orders/{id}/cancel, POST /users/{id}/verify
- **No verbs in URLs**: /users not /getUsers

### HTTP Method Semantics
| Method | Purpose | Idempotent | Success Code |
|--------|---------|-----------|-------------|
| GET | Retrieve | Yes | 200 |
| POST | Create | No | 201 |
| PUT | Replace entire | Yes | 200 |
| PATCH | Partial update | Yes | 200 |
| DELETE | Remove | Yes | 204 |
Prefer PATCH over PUT for most updates.

### Query Parameters
- Filtering: ?role=admin&status=active
- Pagination (cursor-based preferred): ?cursor=eyJ0...&limit=20
- Sorting: ?sort=created_at&order=desc
- Search: ?search=john
- Fields: ?fields=id,name,email

### Response Patterns
Single: \`{ "data": { ... } }\`
List: \`{ "data": [...], "pagination": { "total", "page", "limit", "hasMore", "nextCursor" } }\`
Error: \`{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...], "requestId": "..." } }\`

### Error Code Standards
| Code | When |
|------|------|
| 400 | Malformed JSON, missing fields |
| 401 | Not authenticated |
| 403 | Authenticated but lacks permission |
| 404 | Resource doesn't exist |
| 409 | Duplicate / version conflict |
| 422 | Valid JSON but semantic errors |
| 429 | Rate limited |
| 500 | Unexpected failure (never expose internals) |

### Authentication Patterns
- **API-to-API**: API key in X-API-Key header
- **User sessions (SPA)**: JWT Bearer in Authorization header
- **Web apps (SSR)**: HTTP-only cookies
- **Webhooks**: HMAC-SHA256 signature verification

### Rate Limiting
Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After
Algorithm: Sliding window (Redis-backed)
Tiers: Free (100/min), Pro (1,000/min), Enterprise (10,000/min)

### Versioning
URL path versioning: /v1/users, /v2/users (recommended for public APIs)

### Endpoint Generation Rules
1. Every entity gets CRUD endpoints
2. Nested resources for strong parent-child
3. Search endpoints for complex filtering
4. Action endpoints for state transitions: POST /orders/{id}/cancel
5. Health check: GET /health
6. Bulk operations where needed: POST /users/bulk-invite

### Webhook Design
- Event format: { "id", "type": "resource.action", "created", "data": {...} }
- HMAC-SHA256 signature verification
- Idempotency via event ID
- Exponential backoff retries

### OpenAPI 3.2 (Current Standard)
New: hierarchical tags, streaming support, QUERY method. Use Scalar for API docs viewer.`;
}

// ---------------------------------------------------------------------------
// KB 11: Infrastructure Patterns (for infrastructure-agent)
// ---------------------------------------------------------------------------

export function getInfrastructureKnowledge(): string {
  return `## Knowledge Bank: Infrastructure Patterns (February 2026)

### Hosting by Project Stage
| Stage | Stack | Monthly Cost |
|-------|-------|-------------|
| Prototype | Vercel Free + Supabase Free | $0 |
| MVP | Vercel Pro + Supabase Pro | $45-100 |
| Growth (cost-conscious) | Coolify on Hetzner VPS + Supabase | $20-100 |
| Growth (scale) | Railway or AWS (ECS + RDS) | $200-500 |
| Edge-first | Cloudflare Workers + D1 + R2 | $5-50 |
| Enterprise | Kubernetes (EKS/GKE) | $1,000+ |

### Platform Comparison
- **Vercel**: Best Next.js deployment, CDN. Cost escalates at scale.
- **Coolify**: Git-push deploys, preview URLs, auto-SSL on your own server. You manage the server.
- **Cloudflare**: Workers, unlimited bandwidth. Limited runtime (no Node.js APIs).
- **Railway**: 3-4x faster server rendering than Vercel. Predictable pricing.
- **SST**: OpenNext (self-host Next.js on AWS). AWS complexity.

### CI/CD Pipeline (GitHub Actions Standard)
1. Lint + Type check (Biome v2.3 + tsc --noEmit)
2. Unit tests (Vitest)
3. Build (next build / vite build)
4. Integration tests (Vitest + test DB)
5. Deploy to preview (automatic on PR)
6. E2E tests on preview (Playwright)
7. Deploy to production (merge to main)

### Environment Strategy
| Environment | Data | Deploy Trigger |
|-------------|------|---------------|
| Local | Seed data (Supabase local) | pnpm dev |
| Preview | Branched DB or cloned staging | Push to PR |
| Staging | Anonymized production data | Merge to staging |
| Production | Real data | Merge to main |

### Environment Variables Rules
- Never commit .env files
- Use .env.example with placeholders
- Rotate secrets quarterly
- Different API keys per environment
- Store production secrets in platform's secret manager

### Monitoring Stack
| Layer | Tool | Purpose |
|-------|------|---------|
| Error tracking | Sentry | Exceptions with source maps and replay |
| Logging | BetterStack (Logtail) | Structured logging, search, alerts |
| Uptime | BetterStack | Availability, status pages |
| Analytics | PostHog | Product analytics + feature flags + session replay |
| LLM monitoring | LangSmith or Helicone | Token usage, cost tracking, prompt debugging |

### Security Checklist (Day 1)
- HTTPS everywhere (TLS 1.3)
- Secrets not in code (.env in .gitignore)
- Rate limiting on public endpoints (Redis-backed sliding window)
- Input validation at boundaries (Zod schemas)
- SQL injection prevention (parameterized queries via ORM)
- XSS prevention (React auto-escapes; sanitize user HTML with DOMPurify)
- Auth on every API route (middleware pattern)
- CORS: explicit origin allowlist

### Backup & Recovery
| Component | Strategy |
|-----------|----------|
| Database | Automated daily backups (Supabase/Neon built-in), 30-day retention |
| Point-in-time | WAL archiving, 7-30 days |
| File storage | Cross-region replication (S3/R2) |
| Code | Git |

### Scaling Patterns
| Bottleneck | Solution |
|-----------|----------|
| CPU | Add more app instances (horizontal) |
| DB reads | Read replicas, connection pooling |
| DB writes | Optimize queries, queue writes |
| Memory | Increase instance size (vertical) |
| Global latency | CDN, edge caching, multi-region |

### Infrastructure by Project Type
**B2B SaaS**: Vercel + Railway (background) + Supabase Pro + Upstash Redis + Resend + Stripe + Sentry + BetterStack
**AI/LLM Product**: Vercel + Railway (agent workers) + Supabase + pgvector + Redis (LLM cache) + Sentry + LangSmith + Inngest/Trigger.dev
**Mobile Backend**: Cloudflare Workers + Turso/Supabase + Firebase Cloud Messaging + R2
**Marketplace**: Vercel/Railway + Neon + Meilisearch + Stripe Connect + PostHog

### Cost Optimization
- Vercel -> Coolify: 80-90% savings when bill exceeds $200/mo
- LLM response caching (Redis): 40-60% of LLM costs
- Edge caching (CDN): reduced origin requests
- Scale-to-zero: pay only for usage`;
}

// ---------------------------------------------------------------------------
// KB 12: Coding Standards (for guidelines-agent)
// ---------------------------------------------------------------------------

export function getCodingStandardsKnowledge(): string {
  return `## Knowledge Bank: Coding Standards & Conventions (February 2026)

### Naming Conventions — TypeScript/JavaScript (Primary)
| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase | userName, isActive |
| Functions | camelCase | getUser(), handleSubmit() |
| Classes | PascalCase | UserService, OrderController |
| Interfaces/Types | PascalCase | UserProfile, CreateOrderInput |
| Constants | UPPER_SNAKE_CASE | MAX_RETRIES, API_BASE_URL |
| Enum members | PascalCase | OrderStatus.Pending |
| Files (components) | kebab-case or PascalCase | user-profile.tsx |
| Files (utilities) | kebab-case | format-date.ts |
| Directories | kebab-case | user-stories/ |
| Booleans | is/has/can prefix | isActive, hasPermission |

### Naming — Python
Variables/functions: snake_case. Classes: PascalCase. Constants: UPPER_SNAKE_CASE. Files: snake_case.

### Naming — Go
Exported: PascalCase. Unexported: camelCase. Packages: lowercase single word.

### Naming — Rust
Variables/functions: snake_case. Types/Structs: PascalCase. Constants: UPPER_SNAKE_CASE. Modules: snake_case.

### File Organization — Feature-Based (Recommended for Large Apps)
src/features/{feature}/components/, hooks/, api/, types.ts, __tests__/
src/components/ui/ (shared), lib/ (utilities), app/ (routes)

### File Organization — Next.js App Router (2026)
app/(auth)/sign-in/, (dashboard)/projects/[id]/, api/[domain]/route.ts

### React 19 + React Compiler Patterns
- Functional components only (no class components)
- React Compiler eliminates manual useMemo/useCallback
- Props interface defined above component
- One component per file (named export)
- Server Components by default — add 'use client' only when needed
- No prop drilling beyond 2 levels

### Server vs Client Components (Next.js 16)
Server: DB queries, API calls, secrets, large deps. No useState/useEffect.
Client: Interactivity, browser APIs, custom hooks with state. No direct DB.

### Code Quality Hard Limits
| Rule | Limit |
|------|-------|
| Max function length | 50 lines |
| Max file length | 300 lines |
| Max cyclomatic complexity | 10 |
| No \`any\` types | 0 (TypeScript strict) |
| No console.log in production | 0 (use structured logger) |
| Max function parameters | 3 (use object for more) |

### TypeScript Configuration (Strict)
strict: true, noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, noImplicitReturns: true

### Linting & Formatting — Biome v2.3 (Recommended, Replaces ESLint + Prettier)
423 lint rules, type-aware linting, GritQL custom rules, 10-100x faster. Vue/Svelte/Astro support.
Alternative: ESLint 9 + Prettier (established, for existing projects).

### Testing Stack
| Layer | Tool |
|-------|------|
| Unit | Vitest |
| Component | Vitest + React Testing Library |
| Integration | Vitest |
| E2E | Playwright |

### Testing Priorities
P0: Business logic (90%+), API handlers (80%+)
P1: Complex UI with state (70%+), Critical user flows (top 5 E2E)
P2: Simple presentational (optional), Styling (visual regression only)

### Git Conventions
Branch: feature/, bugfix/, hotfix/, chore/, docs/, refactor/
Commits: Conventional Commits — feat:, fix:, chore:, docs:, refactor:, test:, perf:, ci:
Merge: Squash to main (clean history), rebase for feature branches. Never force-push main.

### Error Handling Patterns
- Validate at boundaries (Zod on API inputs)
- Trust internal code
- Never expose internals (no stack traces in responses)
- Structured logging with context (userId, requestId)
- Fail fast, return errors early

### Dependency Management
- Pin versions (no ^ or ~)
- Weekly dependency review (Dependabot/Renovate)
- Audit before merge (pnpm audit)
- Minimize dependencies (prefer stdlib)
- Lock file committed

### Standards by Project Type
**B2B SaaS**: TypeScript strict + Biome v2.3 + Vitest + Playwright + Server Components + Zustand + React Hook Form/Zod + tRPC + Conventional Commits
**Mobile**: TypeScript + Biome v2.3 + Vitest + Detox/Maestro + Zustand + Expo Router
**API Platform**: TypeScript or Go + Biome/golangci-lint + Vitest/go test + k6 + OpenAPI 3.2 + Scalar + semver`;
}
