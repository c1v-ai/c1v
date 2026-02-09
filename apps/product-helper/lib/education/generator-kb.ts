/**
 * Generator Knowledge Bank - Prompt Blocks for Generator Agents
 *
 * Curated decision-guidance content from Knowledge Banks 07-13.
 * Each function returns a prompt-ready text block that gets injected
 * into the corresponding generator agent's system prompt.
 *
 * All functions accept optional KBProjectContext. When context matches
 * an industry/market/budget, generic content for that section is REPLACED
 * by specific content (filter, not addendum). No context = generic behavior.
 *
 * Token budget: ~2,500 tokens per function output (hard ceiling).
 *
 * KB 07+08: Entity Discovery + Schema -> schema-extraction-agent
 * KB 09: Tech Stack Selection -> tech-stack-agent
 * KB 10: API Specification Patterns -> api-spec-agent
 * KB 11: Infrastructure Patterns -> infrastructure-agent
 * KB 12: Coding Standards -> guidelines-agent
 * KB 13: User Stories -> user-stories-agent
 */

import type { KBProjectContext } from './reference-data/types';
import { getIndustryEntities } from './reference-data/industry-patterns';
import { counterArguments } from './reference-data/influencer-data';
import { getBudgetStack } from './reference-data/budget-stacks';
import { getMarketPattern, marketplacePatterns } from './reference-data/market-patterns';

// ---------------------------------------------------------------------------
// KB 07 + 08: Entity Discovery + Database Schema (for schema-extraction-agent)
// ---------------------------------------------------------------------------

export function getSchemaKnowledge(context?: Partial<KBProjectContext>): string {
  const parts: string[] = [];

  parts.push(`## Knowledge Bank: Entity Discovery & Database Schema Design (February 2026)

### Entity Discovery Techniques
- **Noun analysis**: Every noun in use cases/vision is a candidate entity
- **Persistence test**: If data survives a page refresh, it's a database entity
- **Identity test**: Does this thing have a unique identity? Can there be multiples?
- **Attribute vs entity**: If it has 3+ attributes of its own, promote to entity`);

  // Industry-specific entity patterns (replaces generic list when matched)
  const catalog = getIndustryEntities(context?.industry);
  if (catalog) {
    const entityLines = catalog.entities
      .map(e => `**${e.name}**: ${e.keyFields.slice(0, 6).join(', ')}`)
      .join('\n');
    parts.push(`
### Industry Entity Catalog (${context!.industry})
${entityLines}

### Industry Schema Snippets
${catalog.entities
  .filter(e => e.sqlSnippet)
  .map(e => e.sqlSnippet)
  .join('\n')}`);
  } else {
    parts.push(`
### Domain Entity Patterns by Project Type
**B2B SaaS**: organizations, users, memberships, invitations, subscriptions, api_keys, audit_logs
**E-Commerce**: users, products, product_images, categories, orders, order_items, reviews, transactions, carts
**Social Platform**: users, posts, comments, likes, follows, notifications, media, reports
**Mobile App**: users, devices, sessions, push_tokens, preferences, sync_state
**API Platform**: organizations, api_keys, endpoints, request_logs, rate_limits, webhook_endpoints, webhook_deliveries
**AI/LLM Product**: users, projects, conversations, messages, documents, document_chunks (with vector embeddings), prompts, usage_logs`);
  }

  parts.push(`
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

### Constraint & Relationship Patterns
- **Foreign keys**: Always define with ON DELETE action (CASCADE for children, SET NULL for optional refs, RESTRICT to prevent orphans)
- **Indexes**: All foreign keys (PG does NOT auto-index FKs), columns in WHERE/ORDER BY, partial indexes for filtered queries
- One-to-many: FK on the "many" side. Many-to-many: Junction table with composite unique.`);

  // Multi-tenancy for B2B
  if (context?.market === 'b2b' || context?.market === 'b2b2c') {
    parts.push(`
### Multi-Tenancy (Required for B2B)
Every table gets \`organization_id uuid FK\` with index. Use Row-Level Security (RLS):
\`ALTER TABLE orders ENABLE ROW LEVEL SECURITY;\`
\`CREATE POLICY tenant_isolation ON orders USING (org_id = current_setting('app.org_id')::uuid);\`
Include audit_logs table: (id, org_id, actor_id, actor_type, action, resource_type, resource_id, changes jsonb, ip_address, created_at) — append-only, partitioned by month.`);
  } else {
    parts.push(`
### Multi-Tenancy (B2B SaaS Default)
Every table gets \`organization_id\` with index. Consider Row-Level Security (RLS) for tenant isolation.`);
  }

  // Vector embeddings for AI products
  if (context?.projectType === 'ai-product') {
    parts.push(`
### Vector Embeddings (AI Product)
\`document_chunks(id, document_id, content text, embedding vector(1536), chunk_index int, metadata jsonb, created_at timestamptz)\`
\`CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);\`
pgvector handles up to ~50-100M vectors competitively.`);
  }

  parts.push(`
### ORM Guidance (2026)
- **Drizzle ORM**: 7.4kB bundle, SQL-like API, serverless/edge-friendly — recommended for new projects
- **Prisma**: Intuitive schema DSL, broad DB support — still production-ready`);

  return parts.join('');
}

// ---------------------------------------------------------------------------
// KB 09: Tech Stack Selection (for tech-stack-agent)
// ---------------------------------------------------------------------------

export function getTechStackKnowledge(context?: Partial<KBProjectContext>): string {
  const parts: string[] = [];

  parts.push(`## Knowledge Bank: Tech Stack Selection (February 2026)

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
| Supabase ecosystem | Supabase Auth | Integrated with DB, RLS | Better Auth |`);

  // Budget-specific stack recommendation (replaces generic deployment table)
  const stack = getBudgetStack(context?.budget, context?.stage);
  if (stack) {
    const stackLines = Object.entries(stack.stack)
      .map(([k, v]) => `- **${k}**: ${v}`)
      .join('\n');
    parts.push(`
### Recommended Stack (${stack.tier} / ${stack.stage}, ~${stack.monthlyCost}/mo)
${stackLines}
Tradeoffs: ${stack.tradeoffs.join('. ')}`);
  } else {
    parts.push(`
### Recommended Stacks by Project Type
**B2B SaaS**: Next.js 16 + tRPC v11 + PostgreSQL/Supabase + Drizzle + Clerk/Better Auth + Stripe + Tailwind v4 + shadcn/ui
**Marketplace**: Next.js 16 + Hono + PostgreSQL/Neon + Prisma + Clerk + Stripe Connect + Meilisearch
**Mobile App**: React Native + Expo + Hono on Cloudflare Workers + Turso/Supabase
**API Platform**: Hono 4 + PostgreSQL/Neon + Drizzle + API keys + Scalar (OpenAPI 3.2)
**AI/LLM Product**: Next.js 16 + Vercel AI SDK + LangChain/LangGraph + PostgreSQL + pgvector + Supabase`);
  }

  // Market-specific patterns
  const market = getMarketPattern(context?.market);
  if (market) {
    parts.push(`
### ${context!.market!.toUpperCase()} Architecture Patterns
Auth: ${market.authPatterns.slice(0, 3).join('. ')}
Billing: ${market.billingPatterns.slice(0, 3).join('. ')}`);
  }

  parts.push(`
### Additional Tool Recommendations
- **CSS**: Tailwind CSS v4 + shadcn/ui (industry standard, AI generates it natively)
- **ORM**: Drizzle ORM (serverless) or Prisma (DX-first)
- **Testing**: Vitest + Playwright. **Linting**: Biome v2.3 (replaces ESLint + Prettier)
- **State**: Zustand. **Forms**: React Hook Form + Zod. **Payments**: Stripe
- **Analytics**: PostHog. **Errors**: Sentry. **Email**: Resend + React Email

### Key 2026 Shift
Self-hosting is back. Coolify on Hetzner gives Vercel-like DX at 10-20% cost.`);

  return parts.join('');
}

// ---------------------------------------------------------------------------
// KB 10: API Specification Patterns (for api-spec-agent)
// ---------------------------------------------------------------------------

export function getAPISpecKnowledge(context?: Partial<KBProjectContext>): string {
  const parts: string[] = [];

  parts.push(`## Knowledge Bank: API Specification Patterns (February 2026)

### API Style Selection (2026 Consensus)
REST for public APIs + tRPC for internal TypeScript APIs. GraphQL adoption plateaued.

### REST Endpoint Naming Rules
- **Plural nouns**: /users, /projects, /orders (not singular)
- **Lowercase, hyphen-separated**: /api-keys, /user-stories (not camelCase)
- **Nested resources max 2 levels**: /organizations/{orgId}/projects/{projectId}
- **Actions as sub-resources**: POST /orders/{id}/cancel, POST /users/{id}/verify

### HTTP Method Semantics
| Method | Purpose | Idempotent | Success Code |
|--------|---------|-----------|-------------|
| GET | Retrieve | Yes | 200 |
| POST | Create | No | 201 |
| PATCH | Partial update | Yes | 200 |
| DELETE | Remove | Yes | 204 |

### Query Parameters
Filtering: ?role=admin&status=active. Pagination (cursor-based): ?cursor=eyJ0...&limit=20. Sorting: ?sort=created_at&order=desc

### Response Patterns
Single: \`{ "data": { ... } }\`
List: \`{ "data": [...], "pagination": { "total", "hasMore", "nextCursor" } }\`
Error: \`{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }\`

### Error Codes
400 malformed, 401 not authenticated, 403 forbidden, 404 not found, 409 conflict, 422 semantic error, 429 rate limited, 500 internal

### Auth Patterns
API-to-API: X-API-Key header. User sessions: JWT Bearer. Web apps: HTTP-only cookies. Webhooks: HMAC-SHA256

### Rate Limiting
Headers: X-RateLimit-Limit/Remaining/Reset, Retry-After. Sliding window (Redis). Tiers: Free 100/min, Pro 1K/min, Enterprise 10K/min`);

  // Industry-specific API patterns (replaces generic endpoint rules when matched)
  const catalog = getIndustryEntities(context?.industry);
  if (catalog && catalog.apiPatterns.length > 0) {
    parts.push(`
### Industry API Patterns (${context!.industry})
${catalog.apiPatterns.map(p => `- ${p}`).join('\n')}`);
  }

  // Marketplace patterns
  if (context?.projectType === 'marketplace') {
    parts.push(`
### Marketplace Payment API Patterns
- Stripe Connect: POST /connected-accounts, POST /transfers, POST /payouts
- Escrow flow: POST /escrow/hold → POST /escrow/release or POST /escrow/refund
- Dispute resolution: POST /disputes, PATCH /disputes/{id}/resolve
- All marketplace mutations require idempotency keys`);
  }

  parts.push(`
### Endpoint Generation Rules
1. Every entity gets CRUD endpoints
2. Nested resources for strong parent-child
3. Action endpoints for state transitions: POST /orders/{id}/cancel
4. Health check: GET /health
5. Bulk operations where needed: POST /users/bulk-invite

### Webhook Design
Event format: { "id", "type": "resource.action", "created", "data": {...} }. HMAC-SHA256 signature. Idempotency via event ID. Exponential backoff retries.

### OpenAPI 3.2 (Current Standard)
Hierarchical tags, streaming support, QUERY method. Use Scalar for API docs viewer.`);

  return parts.join('');
}

// ---------------------------------------------------------------------------
// KB 11: Infrastructure Patterns (for infrastructure-agent)
// ---------------------------------------------------------------------------

export function getInfrastructureKnowledge(context?: Partial<KBProjectContext>): string {
  const parts: string[] = [];

  parts.push(`## Knowledge Bank: Infrastructure Patterns (February 2026)

### Hosting by Project Stage
| Stage | Stack | Monthly Cost |
|-------|-------|-------------|
| Prototype | Vercel Free + Supabase Free | $0 |
| MVP | Vercel Pro + Supabase Pro | $45-100 |
| Growth (cost-conscious) | Coolify on Hetzner VPS + Supabase | $20-100 |
| Growth (scale) | Railway or AWS (ECS + RDS) | $200-500 |
| Enterprise | Kubernetes (EKS/GKE) | $1,000+ |

### CI/CD Pipeline (GitHub Actions Standard)
1. Lint + Type check (Biome v2.3 + tsc --noEmit)
2. Unit tests (Vitest) → Build → Integration tests
3. Deploy to preview (auto on PR) → E2E tests (Playwright) → Deploy to production (merge to main)

### Monitoring Stack
| Layer | Tool | Purpose |
|-------|------|---------|
| Error tracking | Sentry | Exceptions with source maps and replay |
| Logging | BetterStack | Structured logging, search, alerts |
| Analytics | PostHog | Product analytics + feature flags + session replay |
| LLM monitoring | LangSmith or Helicone | Token usage, cost tracking, prompt debugging |`);

  // Compliance infra by industry (replaces generic security checklist)
  const catalog = getIndustryEntities(context?.industry);
  if (catalog && catalog.complianceRequirements.length > 0) {
    parts.push(`
### Compliance Requirements (${context!.industry})
${catalog.complianceRequirements.map(r => `- ${r}`).join('\n')}`);
  } else {
    parts.push(`
### Security Checklist (Day 1)
- HTTPS everywhere (TLS 1.3)
- Secrets not in code (.env in .gitignore)
- Rate limiting on public endpoints (Redis-backed sliding window)
- Input validation at boundaries (Zod schemas)
- SQL injection prevention (parameterized queries via ORM)
- Auth on every API route (middleware pattern)
- CORS: explicit origin allowlist`);
  }

  // AI-ready infra for AI products
  if (context?.projectType === 'ai-product') {
    parts.push(`
### AI-Ready Infrastructure
- Vector DB sizing: pgvector handles 50-100M vectors. Beyond: Pinecone or Qdrant
- LLM gateway: Proxy all LLM calls for cost tracking, rate limiting, caching, fallback models
- Token cost management: Cache LLM responses (Redis, 40-60% cost reduction), use smaller models for classification
- Embedding pipeline: Batch embed on ingestion, store in pgvector, HNSW index with m=16, ef_construction=64`);
  }

  // Self-hosting guidance for growth stage
  if (context?.stage === 'growth' || context?.budget === 'bootstrap') {
    parts.push(`
### Self-Hosting Option (2026 Trend)
Vercel bill at $500/mo → Coolify on Hetzner CX42 at $35/mo = 93% savings.
You lose: managed edge network (add Cloudflare CDN). You gain: full server access, predictable billing, data sovereignty.
Who should: Growth stage, >$200/mo Vercel bill. Who shouldn't: Prototype/MVP, no DevOps experience.`);
  }

  parts.push(`
### Environment Strategy
Local (seed data, pnpm dev) → Preview (branched DB, push to PR) → Staging (anonymized prod data) → Production (merge to main)
Environment variables: never commit .env, use .env.example, rotate secrets quarterly, platform secret manager for production.

### Backup & Recovery
Database: automated daily backups (Supabase/Neon built-in), 30-day retention, WAL archiving for point-in-time recovery.
File storage: cross-region replication (S3/R2).

### Scaling Patterns
CPU → horizontal (more instances). DB reads → read replicas + connection pooling. DB writes → optimize queries, queue writes. Global latency → CDN + edge caching.

### Cost Optimization
Vercel → Coolify: 80-90% savings at >$200/mo. LLM caching (Redis): 40-60% savings. Scale-to-zero: pay only for usage.`);

  return parts.join('');
}

// ---------------------------------------------------------------------------
// KB 12: Coding Standards (for guidelines-agent)
// ---------------------------------------------------------------------------

export function getCodingStandardsKnowledge(context?: Partial<KBProjectContext>): string {
  const parts: string[] = [];

  parts.push(`## Knowledge Bank: Coding Standards & Conventions (February 2026)

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

### File Organization — Feature-Based (Recommended for Large Apps)
src/features/{feature}/components/, hooks/, api/, types.ts, __tests__/
src/components/ui/ (shared), lib/ (utilities), app/ (routes)

### React 19 + React Compiler Patterns
- Functional components only. React Compiler eliminates manual useMemo/useCallback.
- Props interface above component. One component per file (named export).
- Server Components by default — add 'use client' only for interactivity.
- No prop drilling beyond 2 levels.

### Code Quality Hard Limits
| Rule | Limit |
|------|-------|
| Max function length | 50 lines |
| Max file length | 300 lines |
| Max cyclomatic complexity | 10 |
| No \`any\` types | 0 (TypeScript strict) |
| No console.log in production | 0 (use structured logger) |
| Max function parameters | 3 (use object for more) |

### Linting & Formatting — Biome v2.3 (Recommended)
423 lint rules, type-aware linting, GritQL custom rules, 10-100x faster than ESLint + Prettier.

### Testing Stack
Unit: Vitest. Component: Vitest + React Testing Library. Integration: Vitest. E2E: Playwright.
P0: Business logic (90%+), API handlers (80%+). P1: Complex UI (70%+), top 5 E2E flows.

### Git Conventions
Branch: feature/, bugfix/, hotfix/, chore/, docs/, refactor/
Commits: Conventional Commits — feat:, fix:, chore:, docs:, refactor:, test:, perf:
Merge: Squash to main. Rebase for feature branches. Never force-push main.

### Error Handling
Validate at boundaries (Zod). Trust internal code. Never expose stack traces. Structured logging with context. Fail fast.

### Dependency Management
Pin versions. Weekly dependency review (Dependabot/Renovate). Audit before merge. Minimize dependencies. Lock file committed.`);

  // Market-specific conventions
  if (context?.market === 'b2b') {
    parts.push(`
### B2B-Specific Standards
- Audit logging middleware on all admin actions
- RBAC checks as middleware, not inline conditionals
- API versioning from day 1 (URL path: /v1/)
- OpenAPI spec maintained alongside code`);
  }

  // Project type standards (replaces generic "by project type")
  if (context?.projectType === 'open-source') {
    parts.push(`
### Open-Source Conventions
- CONTRIBUTING.md template, issue/PR templates
- Semantic versioning (semver), CHANGELOG.md automation (changesets)
- License: MIT (permissive), Apache 2.0 (patent grant), AGPL (copyleft for SaaS)
- CI: Matrix testing (Node 18/20/22), multiple OS, automated release`);
  } else if (context?.projectType === 'api-platform') {
    parts.push(`
### API Platform Standards
- OpenAPI-first: write spec before code, contract testing
- API documentation with Scalar (interactive, modern UI)
- Semantic versioning for API versions (/v1/, /v2/)
- Load testing with k6 in CI pipeline`);
  } else {
    parts.push(`
### Standards by Project Type
**B2B SaaS**: TypeScript strict + Biome v2.3 + Vitest + Playwright + Server Components + Zustand + tRPC + Conventional Commits
**Mobile**: TypeScript + Biome v2.3 + Vitest + Detox/Maestro + Zustand + Expo Router
**API Platform**: TypeScript or Go + Biome/golangci-lint + Vitest/go test + k6 + OpenAPI 3.2 + Scalar + semver`);
  }

  return parts.join('');
}

// ---------------------------------------------------------------------------
// KB 13: User Stories (for user-stories-agent) — NEW
// ---------------------------------------------------------------------------

export function getUserStoriesKnowledge(context?: Partial<KBProjectContext>): string {
  const parts: string[] = [];

  parts.push(`## Knowledge Bank: User Story Patterns (February 2026)

### Story Format
"As a [role], I want to [action] so that [benefit]"
- Role: specific actor from the system (not "user" — use "Customer", "Admin", "Doctor")
- Action: one clear, testable capability
- Benefit: business value (why this matters)

### Acceptance Criteria (Given/When/Then)
Given [context/precondition]
When [action/trigger]
Then [expected outcome]

Example:
Given a logged-in Customer with items in cart
When they click "Checkout" and enter valid payment details
Then an Order is created, inventory is decremented, and a confirmation email is sent

### Story Quality Rules
- One story = one testable behavior (if you need "and" in the action, split it)
- Stories describe WHAT, not HOW (no technical implementation details)
- Every story must trace to at least one use case
- Acceptance criteria are binary (pass/fail, not subjective)
- Include negative/edge cases: "When payment fails, Then show error and preserve cart"

### Story Sizing (Fibonacci Points)
| Points | Scope | Example |
|--------|-------|---------|
| 1 | Simple CRUD, UI tweak, config change | "Display user avatar in header" |
| 3 | New feature with 1-2 API calls, basic validation | "Filter projects by status" |
| 5 | Feature with external integration, complex state | "Send email notification on order status change" |
| 8 | Cross-cutting concern — consider breaking down | "Add role-based access control to all admin routes" |
| 13+ | Epic, not a story — MUST decompose | "Implement payment system" → 5-8 stories |`);

  // Industry-specific story catalogs (replaces generic examples)
  if (context?.industry === 'healthcare') {
    parts.push(`
### Healthcare Story Catalog
- "As a Doctor, I want to view a patient's medication history so that I can avoid harmful drug interactions"
- "As a Nurse, I want to scan a patient's wristband so that I can pull up their medication schedule without manual lookup"
- "As a Billing Admin, I want to submit insurance claims electronically so that the hospital receives reimbursement faster"
- "As a Patient, I want to view my upcoming appointments online so that I can manage my schedule"
- "As a Compliance Officer, I want to audit PHI access logs so that I can detect unauthorized access"

### Healthcare Epics
Auth & Compliance → Patient Management → Clinical Workflows → Scheduling → Billing & Claims → Reporting`);
  } else if (context?.industry === 'fintech') {
    parts.push(`
### Fintech Story Catalog
- "As a Customer, I want to see my transactions categorized automatically so that I can track spending by category"
- "As a Customer, I want to set up recurring transfers so that I don't miss bill payments"
- "As a Compliance Officer, I want to flag transactions above threshold amounts so that AML requirements are met"
- "As an Account Holder, I want to link external bank accounts via Plaid so that I can view all balances in one place"
- "As an Admin, I want to generate monthly statements so that customers have records for tax purposes"

### Fintech Epics
KYC & Onboarding → Account Management → Transactions & Transfers → Statements & Reporting → Compliance & Audit`);
  } else if (context?.projectType === 'e-commerce' || context?.projectType === 'marketplace') {
    parts.push(`
### E-Commerce / Marketplace Story Catalog
- "As a Seller, I want to set quantity-based pricing tiers so that bulk buyers get automatic discounts"
- "As a Buyer, I want to filter products by price range, rating, and category so that I find what I need quickly"
- "As a Buyer, I want to track my order status in real-time so that I know when to expect delivery"
- "As a Seller, I want to view my sales analytics dashboard so that I can optimize my listings"
- "As a Buyer, I want to leave a review after receiving my order so that other buyers can make informed decisions"

### E-Commerce Epics
Seller Onboarding → Product Catalog → Search & Discovery → Cart & Checkout → Payment & Escrow → Fulfillment → Reviews & Trust`);
  } else {
    parts.push(`
### Example Stories (Generic SaaS)
- "As an Admin, I want to invite team members by email so that my team can collaborate on projects"
- "As a User, I want to export my data as CSV so that I can analyze it in a spreadsheet"
- "As a User, I want to receive email notifications for important events so that I stay informed without checking the app"
- "As an Admin, I want to view usage analytics so that I can understand how the team uses the product"
- "As a User, I want to connect my Google account so that I can sign in without remembering a password"`);
  }

  // Epic grouping patterns by project type
  if (context?.projectType === 'saas') {
    parts.push(`
### SaaS Epic Grouping
Auth & Onboarding → Core Features → Team Management → Billing & Subscription → Integrations → Analytics & Reporting`);
  } else if (context?.projectType === 'marketplace') {
    parts.push(`
### Marketplace Epic Grouping
Seller Onboarding → Listing Management → Search & Discovery → Checkout & Payment → Reviews & Trust → Seller Payouts → Dispute Resolution`);
  } else if (context?.projectType === 'mobile') {
    parts.push(`
### Mobile Epic Grouping
Onboarding & Permissions → Core Loop → Notifications → Offline Mode → Social Features → Monetization`);
  } else {
    parts.push(`
### Epic Grouping (General)
Auth & Onboarding → Core Features → Billing → Team/Admin → Integrations → Analytics`);
  }

  parts.push(`
### Undesired Stories (Security / Abuse Cases)
Always include negative stories for security-critical areas:
- "As an Attacker, I want to brute-force login credentials — the system SHALL lock accounts after 5 failed attempts"
- "As a Malicious User, I want to access other users' data — the system SHALL enforce tenant isolation"
- "As a Spammer, I want to create fake accounts — the system SHALL require email verification"

### Story Organization Tips
- Group by epic, not by sprint
- Prioritize: Must (MVP) → Should (v1.1) → Could (backlog)
- Each epic should have 3-8 stories (decompose if >8)
- Include at least 1 negative/security story per epic`);

  return parts.join('');
}
