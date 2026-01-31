# Project State: Product Helper V2

**Project:** Product Helper
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications
**Updated:** 2026-01-31

---

## Current Position

**Milestone:** V2 -- Epic.dev Feature Parity
**Planning System:** GSD (Phase 16 active)
**Last Completed:** 16-05-PLAN.md (Mermaid Validation Before Save)
**Status:** ✅ V2 DEPLOYED | **Active Phase:** Phase 16 (Chat/LLM Quality Improvements)

```
CLEO Progress: [##########] 36 of 36 tasks done (100%)
Wave 0: ✓ Complete (T021, T034-T036)
Wave 1: ✓ Complete (T025-T028)
Wave 2: ✓ Complete (T038-T041)
Wave 3: ✓ Complete (T042, T045; T044/T046 deferred to v3)
Independent: ✓ Complete (T023, T033, T048, T056, T060)
Testing: ✓ Complete (T061-T068)
```

### Roadmap Evolution
- **Phase 16 added (2026-01-31):** Chat/LLM Quality Improvements
  - Categories: A (Chat UX), B (Extraction), C (Knowledge Bank), D (Dead Code), E (Architecture), F (Security), G (Environment/DX), H (Over-Engineering)
  - 40+ items identified from comprehensive code review
  - Execution split: Security items (F1-F3, G1-G2) NOW, rest during/after LangChain refactor
- **16-01 completed (2026-01-31):** Security and DX Quick Fixes (F2, F3, G1, G2)
- **16-02 completed (2026-01-31):** Cost Optimization - Prompt Caching and Haiku (A4, A5)
- **16-03 completed (2026-01-31):** Dead Code and OpenAI Cleanup (D1, D2, D4)
- **16-04 completed (2026-01-31):** Dead Code Cleanup and Tooltip Activation (D3, C3)
- **16-05 completed (2026-01-31):** Mermaid Validation Before Save (B4)

---

## What Was Built (V2 Sprint Summary)

### Wave 0 — Explorer Shell & Layout
- Explorer tree sidebar with 11 navigable sections
- Route pages for all requirements + backend sections
- Layout integration with project pages
- Mobile drawer support

### Wave 1 — Content Views
- T025: Coding guidelines section view
- T026: Content section views (system overview, architecture, tech stack, API spec, infrastructure, schema)
- T027: User stories table with filtering
- T028: Diagram viewer with Mermaid rendering

### Wave 2 — Extraction & Workflow
- T038: Problem statement extraction (new extraction prompt section, persistence, explorer query)
- T039: Enhanced actor personas (goals/painPoints), goals & metrics extraction, completeness scoring redistribution
- T040: Non-functional requirements end-to-end (Zod schemas, DB column, extraction prompt, merge logic, save route, NFR section component, route page, explorer tree entry)
- T041: Per-section review/approval workflow (draft → awaiting-review → approved, API route, status badge + actions components, explorer dot indicators)

### Wave 3 — Explorer Polish
- T045: Explorer progress bar updated with NFR section (11 journey segments)
- T044: Agent role selector — **deferred to v3**
- T046: Inline section editing — **deferred to v3**

### Independent Tasks
- T023: Staged validation gates
- T033: Knowledge bank ↔ agent integration (ThinkingState, TooltipTerm, phase mapping)
- T048: Project onboarding metadata (type, stage, role, budget selectors with chip grid UI, DB migration, server action + API validation)
- T056: Post-login redirect fix
- T060: Context diagram Mermaid syntax fix

### Testing (T061)
- T062-T068: Playwright E2E test suite (auth flows, project CRUD, chat/intake, 3-column layout, content views, accessibility)

---

## DB Migrations Applied

All v2 migrations applied directly via Supabase MCP (drizzle-kit migrate has a pre-existing conflict on `api_keys` table):

| Migration | Table | Columns Added |
|-----------|-------|---------------|
| 0007 | `projects` | `project_type`, `project_stage`, `user_role`, `budget` |
| manual | `project_data` | `problem_statement`, `goals_metrics`, `non_functional_requirements`, `review_status` |

---

## Bug Fixes Applied (This Session)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| "Failed to create project" on localhost | Migration 0007 not applied; metadata columns missing from DB | Applied via Supabase MCP |
| `useActionState` called outside transition | `formAction(formData)` called imperatively without `startTransition` | Wrapped in `startTransition()` in `welcome-onboarding.tsx` |
| Metadata INSERT fragility | `undefined` metadata values still included as keys in INSERT object | Changed to conditional spread `...(data.projectType ? {...} : {})` in `projects.ts` |

---

## Known Issues

- **drizzle-kit migrate broken:** Fails on pre-existing `api_keys` table conflict. Migrations must be applied manually via Supabase MCP or psql.
- ~~**Dual sidebar bug:**~~ ✅ FIXED - Removed old chat-client.tsx, layout.tsx, artifacts-sidebar.tsx. Chat is now persistent panel in 3-column layout.
- ~~**Duplicate chat messages:**~~ ✅ FIXED - Chat refactor eliminated duplicate message issue.
- ~6,500 lines duplicate code (~15-20%) — refactoring paused (Phase 15)
- ~~2 remaining security items~~ ✅ FIXED - P0 security fixes applied (CORS, rate limit, timeout)
- Live Stripe keys in `.env.local` (should be test keys)
- Shared production DB for local dev (should be separate)

---

## SDLC & Environment Issues (Action Required)

| Issue | Severity | Fix |
|-------|----------|-----|
| **Live Stripe keys in dev** | High | Switch to `sk_test_` keys in `.env.local` |
| **Shared production DB** | High | Create separate Supabase project for dev |
| **Wrong BASE_URL** | Medium | Set to `http://localhost:3000` in `.env.local` |
| **No CI pipeline** | Medium | Add GitHub Actions: build + test on PRs |
| **No branch protection** | Low | Require PRs, prevent direct pushes to main |
| **drizzle-kit migrate broken** | Medium | Fix `api_keys` conflict or reset migration journal |

---

## Security & Scalability Audit (2026-01-31)

**Audit Status:** P0 FIXED | **Risk Level:** 🟡 MEDIUM (post-fixes)

### P0 — Critical ✅ FIXED (2026-01-31)

| # | Issue | Status | Fix Applied |
|---|-------|--------|-------------|
| 1 | CORS allows `*` origin | ✅ FIXED | Changed to `process.env.BASE_URL \|\| 'http://localhost:3000'` |
| 2 | No rate limit on LLM chat | ✅ FIXED | Added 20 req/min per user via `checkRateLimit()` |
| 3 | No CSRF protection | ⏳ P1 | Deferred - auth cookies are httpOnly |
| 4 | No LLM API retry logic | ⏳ P1 | Deferred - timeout prevents hanging |
| 5 | In-memory rate limiter | ⏳ P1 | Works for MVP, upgrade to Redis later |
| 6 | Stripe webhook no idempotency | ⏳ P1 | Deferred |
| 7 | No LLM call timeout | ✅ FIXED | Added 30s timeout to all 5 ChatAnthropic instances |

### P1 — High (Fix Short-Term)

| Issue | File | Impact | Status |
|-------|------|--------|--------|
| Missing CSP header | `middleware.ts:18` | XSS injection risk | Pending |
| Session not rotated after password change | `app/(login)/actions.ts:290` | Compromised session persists | Pending |
| Mermaid diagrams not sandboxed | `app/api/chat/.../route.ts:333` | XSS via diagram injection | Pending |
| ~~No LLM call timeout~~ | ~~`lib/langchain/config.ts:17`~~ | ~~Requests hang indefinitely~~ | ✅ FIXED |
| Stripe webhook error handling | `app/api/stripe/webhook/route.ts:33` | Silent failures, infinite retries | Pending |

### P2 — Medium (Production Hardening)

| Issue | Recommendation |
|-------|----------------|
| DB pool size 10 (may be too small) | Increase to 20-30 in `lib/db/drizzle.ts` |
| No structured logging | Add Pino or Winston + Sentry |
| No APM monitoring | Add Datadog or New Relic |
| No LLM cost tracking | Track token usage per user/project |
| No background job queue | Consider Inngest or Trigger.dev |

### Quick Fixes (Copy-Paste)

**1. CORS Fix** (`app/api/mcp/[projectId]/route.ts:110`):
```typescript
'Access-Control-Allow-Origin': process.env.BASE_URL || 'http://localhost:3000',
```

**2. LLM Timeout** (`lib/langchain/config.ts`):
```typescript
export const streamingLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  timeout: 30000, // 30 second timeout
  // ...existing config
});
```

**3. Rate Limit Chat** (`app/api/chat/projects/[projectId]/route.ts` top of POST):
```typescript
import { checkRateLimit } from '@/lib/mcp/rate-limit';
const { allowed } = checkRateLimit(`chat-${params.projectId}`, 20, 60000);
if (!allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
```

### Estimated Effort

| Priority | Hours | Risk After |
|----------|-------|------------|
| P0 fixes | 6-8h | 🟡 Medium |
| P0 + P1 | 30-40h | 🟢 Low-Medium |
| Full hardening | 60-90h | 🟢 Low |

---

## Architecture Overview

### Agent System (8 agents)
- 1 intake agent (conversational PRD creation via LangGraph)
- 1 extraction agent (structured data from conversations)
- 6 specialist agents: schema, tech stack, user stories, API spec, infrastructure, guidelines

### Explorer Sidebar (11 sections)
```
Product Requirements
  ├── Problem Statement
  ├── Goals & Metrics
  ├── System Overview
  ├── Architecture
  ├── Tech Stack
  ├── User Stories
  └── Non-Functional Reqs
Backend
  ├── Database Schema
  ├── API Specification
  ├── Infrastructure
  └── Coding Guidelines
```

### Review Workflow
Per-section status: `draft` → `awaiting-review` → `approved`
Stored in `project_data.review_status` JSONB column.
Visual indicators: amber dot (awaiting review), green dot (approved) in explorer tree.

### Onboarding Metadata
4 optional fields on project creation: project type (8 options), stage (5), role (5), budget range (5).
Collapsible chip grid with icons. Stored as varchar(30) columns on `projects` table.

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| CLEO over GSD for task management | GSD's phase system too rigid; CLEO's wave-based hierarchy fits better |
| Explorer tree as primary navigation | Epic.dev's strongest UX pattern |
| Chat as persistent right panel | Chat is PH's differentiator; must stay visible |
| Additive pipeline changes only | Existing agents work; extend, don't replace |
| Migrations via Supabase MCP | drizzle-kit migrate broken; direct SQL with IF NOT EXISTS is safer |
| Conditional metadata spread | Defensive coding so missing DB columns don't break INSERT |
| Next.js stable over canary | Canary versions break in monorepo |

---

## V3 Backlog

Deferred from v2:
- **T044:** Agent role selector (H09) — select which agent personality guides the conversation
- **T046:** Inline section editing (B12-B13) — edit extracted data directly in section views

---

## V3 Feature: Backend Schema & Tech Stack Generation (Epic.dev Parity)

**Analysis Date:** 2026-01-30
**Goal:** Match Epic.dev's ability to generate complete backend schemas and tech stacks with rationale
**Status:** Gap analysis complete, implementation not started

### Current State vs Epic.dev

#### What Product Helper Has

**Knowledge Banks (6 files — methodology-focused):**

| KB | File | Focus |
|----|------|-------|
| 01 | `01-CONTEXT-DIAGRAM.md` | Mapping system scope/boundaries |
| 02 | `02-USE-CASE-DIAGRAM.md` | Use case discovery |
| 03 | `03-SCOPE-TREE.md` | Scope decomposition |
| 04 | `04-UCBD.md` | Extracting functional requirements via delving |
| 05 | `05-FUNCTIONAL-REQUIREMENTS.md` | Formalizing SHALL statements |
| 06 | `06-SYSML-ACTIVITY-DIAGRAM.md` | Visual behavior modeling |

**Generator Agents (6 files — exist but lack decision guidance):**

| Agent | File | Current Output |
|-------|------|----------------|
| Schema | `schema-extraction-agent.ts` | Entity names only |
| Tech Stack | `tech-stack-agent.ts` | Basic recommendations |
| API Spec | `api-spec-agent.ts` | Basic endpoints |
| Infrastructure | `infrastructure-agent.ts` | Basic hosting |
| Guidelines | `guidelines-agent.ts` | Basic conventions |
| User Stories | `user-stories-agent.ts` | Stories from use cases |

#### What Epic.dev Produces

**Backend Schema (18+ entities with full definitions):**
```
• Table names with descriptions
• Field names, types (uuid, varchar, timestamp, jsonb, boolean, integer)
• Nullable vs required markings
• Primary keys, foreign keys, constraints
• Relationships: one-to-one, one-to-many, many-to-many
• Index recommendations
• 8-15 fields per entity with types and constraints
```

**Tech Stack (8 categories with full rationale):**
```
• Categories: Backend, Frontend, Database, Infrastructure, CI/CD, Third Party, Dev Tools
• Primary choice + 2-3 alternatives per category
• Rationale for each primary choice
• "Why not" explanations for each alternative
• Justification section with overall architecture reasoning
• Risks & Mitigations section with mitigation strategies
```

### Gap Analysis

| Category | Product Helper Current | Epic.dev Output | Gap |
|----------|------------------------|-----------------|-----|
| **Knowledge Banks** | 6 (methodology-focused) | N/A | +6 technical decision KBs needed |
| **Schema Output** | Entity names only | Full fields/types/constraints | Major upgrade required |
| **Tech Stack Output** | Basic recommendations | Categories + rationale + alternatives | Major upgrade required |
| **Agent Integration** | Agents exist | Agents need KB-driven decision logic | Wiring needed |

### Required Knowledge Banks (6 New Files)

#### 07-ENTITY-DISCOVERY.md
**Purpose:** Guide extraction of data entities from requirements and use cases

**Required Sections:**
```
1. Entity Recognition Patterns
   - Noun analysis technique (subjects, objects from SHALL statements)
   - The "data persistence" test (does it need to be stored?)
   - Entity vs attribute distinction rules

2. Entity Naming Conventions
   - Singular nouns, PascalCase
   - Domain-specific naming patterns

3. Relationship Inference from Use Cases
   - One-to-many indicators in requirements
   - Many-to-many junction table patterns
   - Ownership vs reference relationships

4. Common Entity Patterns by Domain
   - SaaS: User, Organization, Subscription, ApiKey, AuditLog
   - E-commerce: User, Product, Order, OrderItem, Payment, Address
   - Social: User, Post, Comment, Like, Follow, Notification
   - Content: User, Article, Tag, Category, Media, Comment
```

#### 08-DATABASE-SCHEMA-DESIGN.md
**Purpose:** Guide generation of complete database schemas with fields, types, constraints

**Required Sections:**
```
1. FIELD TYPE SELECTION RULES
   | Data Type | When to Use | Example |
   |-----------|-------------|---------|
   | uuid | Primary keys, external references | id, userId |
   | text | Variable-length strings, no max needed | description, content |
   | varchar(N) | Constrained strings | email (255), code (50) |
   | integer | Counts, quantities, small numbers | quantity, order |
   | bigint | Large IDs, timestamps as numbers | externalId |
   | boolean | True/false flags | isActive, isDeleted |
   | timestamp | Date/time with timezone | createdAt, updatedAt |
   | timestamptz | Date/time with timezone (Postgres) | scheduledFor |
   | jsonb | Flexible/nested data, metadata | preferences, settings |
   | decimal(P,S) | Money, precise calculations | price, amount |
   | enum | Fixed set of values | status, role |

2. NULLABLE VS REQUIRED DECISION LOGIC
   - Required if: part of entity identity, needed for business logic, FK relationship
   - Nullable if: optional data, backward compatibility, external data source
   - Default values: createdAt (now()), isActive (true), role ('user')

3. CONSTRAINT PATTERNS
   | Constraint | When to Use |
   |------------|-------------|
   | PRIMARY KEY | Always on id column |
   | FOREIGN KEY | Reference to another table |
   | UNIQUE | Email, username, slug, API keys |
   | NOT NULL | Required fields |
   | CHECK | Value validation (status IN (...)) |
   | DEFAULT | Auto-populated values |

4. RELATIONSHIP IMPLEMENTATION PATTERNS
   | Relationship | Implementation |
   |--------------|----------------|
   | 1:1 | FK with UNIQUE constraint on child |
   | 1:N | FK on "many" side referencing "one" |
   | M:N | Junction table with composite PK or separate id |
   | Self-referential | FK to same table (parentId → id) |

5. INDEX RECOMMENDATIONS
   - Always index: foreign keys, unique columns, frequently filtered columns
   - Composite indexes: for common multi-column WHERE clauses
   - Partial indexes: for filtered queries (WHERE isActive = true)
   - GIN indexes: for JSONB columns with queries

6. COMMON SCHEMA PATTERNS BY PROJECT TYPE
   [Detailed patterns for SaaS, E-commerce, Social, Content, API Platform]

7. SOFT DELETE VS HARD DELETE
   - Soft delete: isDeleted boolean + deletedAt timestamp
   - Hard delete: CASCADE or SET NULL on FK
   - Audit requirements driving the choice
```

#### 09-TECH-STACK-SELECTION.md
**Purpose:** Guide technology recommendations with rationale and alternatives

**Required Sections:**
```
1. DECISION FRAMEWORK
   For each technology choice, consider:
   - Project type (web app, mobile, API, SaaS, e-commerce)
   - Team expertise (user-provided during intake)
   - Scale requirements (users, data volume, requests/sec)
   - Budget constraints (startup vs enterprise)
   - Time to market (MVP vs long-term)
   - Compliance requirements (HIPAA, SOC2, GDPR)

2. FRONTEND FRAMEWORK SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Web app, SEO important | Next.js | SSR, React ecosystem | Nuxt.js (Vue), Remix |
   | Mobile + web | React Native + Next.js | Code sharing, single team | Flutter (Dart), Expo |
   | Admin dashboard | React + Tailwind | Fast iteration, component libs | Vue + Vuetify |
   | Simple landing/marketing | Astro | Static, fast, islands | Next.js static, 11ty |
   | Complex SPA | React + Vite | Fast dev, mature ecosystem | Vue 3, Svelte |

3. BACKEND FRAMEWORK SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Real-time, websockets | Node.js (NestJS) | Event loop, TypeScript | Elixir/Phoenix |
   | ML/data processing | Python (FastAPI) | ML ecosystem, async | Django REST |
   | High concurrency API | Go (Gin/Echo) | Goroutines, performance | Rust (Axum) |
   | Enterprise, Java team | Spring Boot | Team familiarity, ecosystem | Quarkus |
   | Rapid prototyping | Node.js (Express) | Simple, fast setup | Fastify, Hono |

4. DATABASE SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Relational + JSON | PostgreSQL | ACID, jsonb, extensions | MySQL 8 |
   | Document-heavy | MongoDB | Schema flexibility | DynamoDB |
   | Time-series data | TimescaleDB | PostgreSQL + time partitioning | InfluxDB |
   | Graph relationships | Neo4j | Native graph queries | PostgreSQL + recursive CTEs |
   | Caching layer | Redis | In-memory, data structures | Memcached, Valkey |
   | Search | Elasticsearch | Full-text, analytics | Meilisearch, Typesense |

5. AUTHENTICATION SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Enterprise SSO/SAML | Auth0 | Comprehensive, enterprise | Okta, Azure AD |
   | Quick setup, modern | Clerk | DX, React components | Supabase Auth |
   | Full control | Custom JWT + bcrypt | No vendor lock-in | Passport.js |
   | Social login only | NextAuth.js | Simple OAuth setup | Supabase Auth |

6. INFRASTRUCTURE SELECTION MATRIX
   | Scale | Recommendation | Rationale | Alternatives |
   |-------|----------------|-----------|--------------|
   | MVP/startup | Vercel + Supabase | Free tier, managed | Netlify + PlanetScale |
   | Growth stage | AWS (ECS + RDS) | Scalable, full control | GCP Cloud Run |
   | Enterprise | Kubernetes (EKS/GKE) | Orchestration, multi-region | Nomad |
   | Serverless | AWS Lambda + Aurora Serverless | Pay-per-use | Cloudflare Workers |

7. CI/CD SELECTION
   | Platform | Recommendation |
   |----------|----------------|
   | GitHub repos | GitHub Actions |
   | GitLab repos | GitLab CI |
   | Complex pipelines | CircleCI, Buildkite |
   | Vercel/Netlify apps | Built-in CI/CD |

8. THIRD-PARTY SERVICES
   | Category | Recommendation | Alternatives |
   |----------|----------------|--------------|
   | Email (transactional) | Resend, SendGrid | Postmark, AWS SES |
   | Email (marketing) | Loops, Customer.io | Mailchimp, ConvertKit |
   | Payments | Stripe | Paddle (SaaS), Square |
   | Analytics | PostHog, Mixpanel | Amplitude, Plausible |
   | Error tracking | Sentry | Bugsnag, Rollbar |
   | Monitoring | Datadog | New Relic, Grafana Cloud |
   | Feature flags | LaunchDarkly | PostHog, Flagsmith |
   | File storage | AWS S3, Cloudflare R2 | GCS, Supabase Storage |

9. RATIONALE TEMPLATE
   Primary choice format:
   "We recommend {technology} because {primary_reason}.
    It provides {benefit_1}, {benefit_2}, and {benefit_3}."

   Alternative format:
   "Consider {alternative} if you need {specific_requirement}.
    We didn't choose it as the primary because {tradeoff}."

   Why-not format:
   "{rejected_option} was considered but not recommended because {reason}.
    Choose it only if {exception_case}."

10. RISKS & MITIGATIONS TEMPLATE
    | Risk | Impact | Mitigation |
    |------|--------|------------|
    | Vendor lock-in | High | Abstract behind interfaces |
    | Cost at scale | Medium | Monitor usage, set alerts |
    | Team learning curve | Medium | Start with familiar alternatives |
```

#### 10-API-SPECIFICATION-PATTERNS.md
**Purpose:** Guide REST/GraphQL API design and documentation

**Required Sections:**
```
1. REST VS GRAPHQL DECISION
   | Scenario | Recommendation | Rationale |
   |----------|----------------|-----------|
   | Simple CRUD, public API | REST | Wide adoption, caching |
   | Complex queries, mobile | GraphQL | Flexible queries, bandwidth |
   | Real-time + queries | GraphQL + subscriptions | Single protocol |
   | Microservices internal | gRPC | Performance, contracts |

2. REST ENDPOINT NAMING CONVENTIONS
   - Resources: plural nouns (/users, /projects, /orders)
   - Nested resources: /users/{userId}/projects
   - Actions on resources: POST /orders/{id}/cancel (verb as sub-resource)
   - Query filters: /users?role=admin&status=active
   - Pagination: /users?page=1&limit=20 or /users?cursor=abc123

3. HTTP METHOD SEMANTICS
   | Method | Purpose | Idempotent | Request Body |
   |--------|---------|------------|--------------|
   | GET | Retrieve resource(s) | Yes | No |
   | POST | Create new resource | No | Yes |
   | PUT | Replace entire resource | Yes | Yes |
   | PATCH | Partial update | Yes | Yes |
   | DELETE | Remove resource | Yes | No |

4. REQUEST/RESPONSE PATTERNS
   Success response:
   { "data": {...}, "meta": { "requestId": "..." } }

   List response:
   { "data": [...], "pagination": { "page": 1, "limit": 20, "total": 100 } }

   Error response:
   { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }

5. AUTHENTICATION PATTERNS
   | Context | Pattern |
   |---------|---------|
   | API-to-API | API key in header (X-API-Key) |
   | User sessions | JWT Bearer token |
   | Web apps | HTTP-only cookies |
   | Webhooks | HMAC signature verification |

6. ERROR CODE STANDARDS
   | Code | Meaning | When to Use |
   |------|---------|-------------|
   | 400 | Bad Request | Validation failed |
   | 401 | Unauthorized | Not authenticated |
   | 403 | Forbidden | Authenticated but not authorized |
   | 404 | Not Found | Resource doesn't exist |
   | 409 | Conflict | Duplicate, version conflict |
   | 422 | Unprocessable | Semantic validation error |
   | 429 | Too Many Requests | Rate limited |
   | 500 | Server Error | Unexpected failure |

7. VERSIONING STRATEGIES
   - URL path: /v1/users, /v2/users (recommended for public APIs)
   - Header: Accept: application/vnd.api+json;version=1
   - Query param: /users?version=1 (not recommended)

8. RATE LIMITING HEADERS
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 95
   X-RateLimit-Reset: 1640000000
```

#### 11-INFRASTRUCTURE-PATTERNS.md
**Purpose:** Guide infrastructure and deployment recommendations

**Required Sections:**
```
1. HOSTING BY PROJECT STAGE
   | Stage | Recommendation | Monthly Cost | Notes |
   |-------|----------------|--------------|-------|
   | Prototype | Vercel free + Supabase free | $0 | Limited resources |
   | MVP | Vercel Pro + Supabase Pro | $45-100 | Production-ready |
   | Growth | AWS ECS + RDS | $200-500 | Full control |
   | Scale | Kubernetes (EKS/GKE) | $1000+ | Multi-region |

2. CI/CD PIPELINE PATTERNS
   Standard pipeline:
   1. Lint + Type check
   2. Unit tests
   3. Build
   4. Integration tests
   5. Deploy to staging
   6. E2E tests on staging
   7. Deploy to production (manual gate or auto)

3. ENVIRONMENT STRATEGY
   | Environment | Purpose | Data |
   |-------------|---------|------|
   | Local | Development | Seed/mock data |
   | Preview | PR review | Cloned staging |
   | Staging | Pre-production | Anonymized prod |
   | Production | Live users | Real data |

4. MONITORING STACK
   | Layer | Tool | Purpose |
   |-------|------|---------|
   | Errors | Sentry | Exception tracking |
   | Logs | Datadog/Logtail | Structured logging |
   | Metrics | Datadog/Grafana | System metrics |
   | Uptime | BetterStack | Availability monitoring |
   | APM | Datadog/New Relic | Performance tracing |

5. SECURITY CHECKLIST
   [ ] HTTPS everywhere (TLS 1.3)
   [ ] Environment secrets (not in code)
   [ ] Rate limiting on all endpoints
   [ ] Input validation at boundaries
   [ ] SQL injection prevention (parameterized queries)
   [ ] XSS prevention (CSP headers, output encoding)
   [ ] CSRF tokens for state-changing requests
   [ ] Dependency scanning (Snyk, Dependabot)
   [ ] Security headers (HSTS, X-Frame-Options, etc.)

6. BACKUP & DISASTER RECOVERY
   - Database: Daily automated backups, 30-day retention
   - Point-in-time recovery: Enabled for production
   - Multi-region: For high availability requirements
   - RTO/RPO targets based on business requirements
```

#### 12-CODING-STANDARDS.md
**Purpose:** Guide coding guidelines generation by language/framework

**Required Sections:**
```
1. NAMING CONVENTIONS BY LANGUAGE
   | Language | Variables | Functions | Classes | Constants | Files |
   |----------|-----------|-----------|---------|-----------|-------|
   | TypeScript | camelCase | camelCase | PascalCase | UPPER_SNAKE | kebab-case |
   | Python | snake_case | snake_case | PascalCase | UPPER_SNAKE | snake_case |
   | Go | camelCase | PascalCase (exported) | PascalCase | PascalCase | snake_case |
   | Rust | snake_case | snake_case | PascalCase | UPPER_SNAKE | snake_case |

2. FILE ORGANIZATION PATTERNS
   Feature-based (recommended for large apps):
   /features/auth/components/, /features/auth/hooks/, /features/auth/api/

   Layer-based (simpler apps):
   /components/, /hooks/, /lib/, /api/

3. COMPONENT PATTERNS (React/Vue)
   - Functional components with hooks (not class components)
   - Props interface defined above component
   - One component per file
   - Co-located tests (__tests__/ or .test.tsx)
   - Co-located styles (CSS modules or Tailwind)

4. TESTING REQUIREMENTS
   | Test Type | Scope | Tools |
   |-----------|-------|-------|
   | Unit | Pure functions, utilities | Vitest, Jest |
   | Component | UI components in isolation | Testing Library |
   | Integration | API routes, DB operations | Vitest, Supertest |
   | E2E | Critical user flows | Playwright, Cypress |

5. CODE QUALITY RULES
   - Max function length: 50 lines
   - Max file length: 300 lines
   - Max cyclomatic complexity: 10
   - No any types (TypeScript)
   - No console.log in production code
   - All exports must be typed

6. DOCUMENTATION STANDARDS
   - JSDoc for public APIs and complex functions
   - README.md for each package/module
   - ADRs for architectural decisions
   - Inline comments only for non-obvious logic

7. LINTING & FORMATTING CONFIG
   | Language | Linter | Formatter | Config |
   |----------|--------|-----------|--------|
   | TypeScript | ESLint | Prettier | eslint-config-next |
   | Python | Ruff | Ruff | pyproject.toml |
   | Go | golangci-lint | gofmt | .golangci.yml |

8. GIT CONVENTIONS
   - Branch naming: feature/*, bugfix/*, hotfix/*
   - Commit format: Conventional Commits (feat:, fix:, chore:)
   - PR template with checklist
   - Squash merge to main
```

### Implementation Plan

#### Phase 1: Create Knowledge Banks (P0)

| Task | KB | Effort | Priority |
|------|-----|--------|----------|
| Create 08-DATABASE-SCHEMA-DESIGN.md | 08 | 4h | P0 |
| Create 09-TECH-STACK-SELECTION.md | 09 | 4h | P0 |
| Create 07-ENTITY-DISCOVERY.md | 07 | 3h | P1 |
| Create 10-API-SPECIFICATION-PATTERNS.md | 10 | 3h | P1 |
| Create 11-INFRASTRUCTURE-PATTERNS.md | 11 | 2h | P2 |
| Create 12-CODING-STANDARDS.md | 12 | 2h | P2 |

#### Phase 2: Update Agents to Use Knowledge Banks

| Agent | Updates Required | Effort |
|-------|------------------|--------|
| `schema-extraction-agent.ts` | Load KB 07+08, output full schema with fields/types/constraints | 4h |
| `tech-stack-agent.ts` | Load KB 09, output categories with rationale + alternatives | 4h |
| `api-spec-agent.ts` | Load KB 10, output endpoints with request/response schemas | 3h |
| `infrastructure-agent.ts` | Load KB 11, output hosting + CI/CD + monitoring | 2h |
| `guidelines-agent.ts` | Load KB 12, output language-specific standards | 2h |

#### Phase 3: UI Integration

| Task | Component | Effort |
|------|-----------|--------|
| Enhanced schema viewer with field types | `components/data/schema-viewer.tsx` | 3h |
| Tech stack with expandable rationale | `components/data/tech-stack-viewer.tsx` | 3h |
| Export to SQL/Prisma/Drizzle format | Schema export options | 2h |

### Total Estimated Effort

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 1: Knowledge Banks | 18h | P0-P2 |
| Phase 2: Agent Updates | 15h | P1 |
| Phase 3: UI Integration | 8h | P2 |
| **Total** | **41h** | |

### Success Criteria

- [ ] Database schema output includes: entity names, field names, types, nullable, constraints, relationships
- [ ] Tech stack output includes: 8 categories, primary choice + alternatives, rationale for each
- [ ] Agents load and apply knowledge bank guidance dynamically
- [ ] Output quality matches or exceeds Epic.dev screenshots
- [ ] All 6 new knowledge banks created and integrated

---

## Session Continuity

**Last session:** 2026-01-31
**Active branch:** `main`
**Last commit:** `ef84d05` - chore(16-03): delete legacy /api/chat route (D4)
**Dev server:** Working (`pnpm dev` at localhost:3000) — Next.js 15.5.9 stable
**Deployment:** Pending push to trigger Vercel build

### Completed This Session (2026-01-31)

1. ✅ **Chat Refactor Verified** - 3-column layout with persistent ChatPanel working correctly
2. ✅ **P0 Security Fixes Applied:**
   - CORS: `*` → `process.env.BASE_URL || 'http://localhost:3000'`
   - Rate limiting: 20 req/min per user on chat endpoint
   - LLM timeout: 30s on all 5 ChatAnthropic instances
3. ✅ **Committed and pushed** to `main` (71923e8)
4. ✅ **Vercel deployment triggered** via GitHub integration
5. ✅ **Phase 16-01 Completed:**
   - README updated: OpenAI -> Anthropic Claude (G1)
   - .nvmrc created: Node 20.9.0 (G2)
   - Team API: returns 401 for unauthenticated users (F3)
   - Stripe checkout: validates client_reference_id (F2)
6. ✅ **Phase 16-02 Completed:**
   - Prompt caching: `cacheControl: true` on all 5 LLM instances (A4)
   - Haiku for classification: cheapLLM uses claude-3-5-haiku (A5)
7. ✅ **Phase 16-03 Completed:**
   - Deleted clarification-detector.ts (dead code, exported but never used)
   - Deleted app/api/chat/test/route.ts (OpenAI test route)
   - Deleted app/api/chat/route.ts (legacy, superseded by project-specific route)
   - Migrated ask-question.ts from OpenAI to Anthropic (cheapLLM/Haiku)
   - Removed @langchain/openai from package.json (no more OpenAI dependency)

### Files Changed

```
D app/(dashboard)/projects/[id]/chat/chat-client.tsx    # Old chat page
D app/(dashboard)/projects/[id]/chat/layout.tsx         # Old chat layout
D components/chat/artifacts-sidebar.tsx                 # Old artifacts sidebar
M app/api/chat/projects/[projectId]/route.ts           # +rate limiting
M app/api/mcp/[projectId]/route.ts                     # CORS fix
M lib/langchain/config.ts                              # +timeout, +cacheControl, +Haiku
D lib/langchain/agents/intake/clarification-detector.ts  # Dead code removed (16-03)
D app/api/chat/test/route.ts                             # OpenAI test route removed (16-03)
D app/api/chat/route.ts                                  # Legacy chat route removed (16-03)
M lib/mcp/tools/unique/ask-question.ts                   # OpenAI -> Anthropic (16-03)
M package.json                                           # Removed @langchain/openai (16-03)
```

### Resume Action (Next Session)

1. Verify Vercel deployment succeeded
2. Run smoke tests from STATUS.md
3. Set up system-helper differentiation (product vs systems engineering focus)
4. Start v3 planning (T044, T046, new features)

### Required Vercel Env Vars

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_URL` | Yes | Database connection |
| `AUTH_SECRET` | Yes | 32+ characters for JWT |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `BASE_URL` | Yes | `https://prd.c1v.ai` for CORS |

---

## Prior Work (Complete)

| Phase | Name | Milestone | Status |
|-------|------|-----------|--------|
| 1-3 | Test Stabilization, Security, Mobile Revamp | v1.1 | Complete |
| 9 | Data Model Depth | v2.0 | Complete |
| 10 | Generators & Agents | v2.0 | Complete |
| 11 | MCP Server (17 tools) | v2.0 | Complete |
| 15 | Code Cleanup & Claude Migration | v2.0 | Wave 1 Complete (Paused) |
| 12 | Educational Content (knowledge banks) | v2.0 | All 6 KBs enriched |
| — | **V2 Deploy + Security Hardening** | v2.0 | ✅ Complete (2026-01-31) |

**What exists:**
- 8 intake/extraction agents + 6 generator agents
- LangGraph 7-node state machine
- 13+ database tables with Drizzle ORM
- 17 MCP tools with API key management
- PRD-SPEC 10 hard-gate validation engine
- SSE streaming, JWT auth, teams, PWA
- 6 knowledge bank files (all enriched with systems engineering course material)
- Education UI scaffolding (ThinkingState, TooltipTerm components)
- Playwright E2E test suite (T062-T068)
- **NEW:** 3-column layout with persistent chat panel
- **NEW:** P0 security fixes (CORS, rate limit, timeout)
- **NEW:** Cost optimizations (prompt caching, Haiku for classification)

---

*State updated: 2026-01-31*
