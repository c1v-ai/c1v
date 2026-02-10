# Knowledge Bank: Tech Stack Selection (Decision Matrices & Rationale)

**Step:** 2.3 - Tech Stack Selection
**Purpose:** Guide technology recommendations with rationale, alternatives, and trade-off analysis
**Core Question:** "What technologies should this project use, and why?"
**Feeds Into:** Tech stack agent (`tech-stack-agent.ts`)
**Last Updated:** February 2026

---

## WHY THIS STEP MATTERS

Tech stack selection is one of the highest-leverage decisions in a project. The wrong choice adds friction for years. The right choice lets a small team ship like a big one.

This KB provides decision matrices grounded in the **current state of the art** (February 2026) — not generic recommendations, but what top engineers and influencers are actually using and recommending right now.

---

## DECISION FRAMEWORK

For every technology recommendation, evaluate:

1. **Project type** — SaaS, marketplace, mobile, API platform, AI product, e-commerce
2. **Team size & expertise** — Solo dev, small team (2-5), medium (5-20), enterprise
3. **Scale requirements** — Users, data volume, requests/sec, geographic distribution
4. **Budget** — Bootstrap/indie, seed-funded startup, growth stage, enterprise
5. **Time to market** — MVP (weeks), v1 (months), enterprise (quarters)
6. **Compliance** — HIPAA, SOC2, GDPR, PCI-DSS

---

## FRONTEND FRAMEWORK SELECTION (February 2026)

| Requirement | Primary | Why | Runner-Up | Consider If |
|-------------|---------|-----|-----------|-------------|
| **SaaS / B2B dashboard** | Next.js 16 | RSC, React Compiler (no manual memoization), battle-tested, largest ecosystem | TanStack Start v1 | You want 30-35% smaller bundles + Vite tooling |
| **Marketing / content site** | Astro 5 | Islands architecture, 95% less JS, 2x faster than Next.js for static | SvelteKit 5 | You want full-stack capabilities too |
| **Complex SPA** | React 19 + Vite | React Compiler, mature ecosystem, AI tools generate React natively | Vue 3 + Nuxt 4 | Team prefers Vue; Nuxt 4 is excellent |
| **Performance-critical** | SvelteKit 5 (Runes) | Compiles away the framework, 50% smaller bundles, 90/100 Lighthouse | Solid.js | You need even more granular reactivity |
| **Mobile + Web** | React Native + Expo | 50%+ RN projects use Expo; file-based routing; OTA updates | Flutter | Visual polish and animation are top priority |
| **Desktop + Mobile** | Tauri 2.0 | Under 10MB apps (vs 100MB+ Electron), 30-40MB memory, iOS/Android support | Electron | You need full Node.js API access |

**Who recommends what:**
- **Lee Robinson** (ex-Vercel VP, now Cursor): Next.js 16 for production React apps
- **Tanner Linsley** (TanStack creator): TanStack Start for type-safe, Vite-based full-stack
- **Rich Harris** (Svelte creator, Vercel): SvelteKit 5 as "Rails/Laravel for JavaScript"
- **Kent C. Dodds** (Epic Web Dev): React Router v7 (Remix) for web-standards-first apps
- **Theo Browne** (T3 Stack): Next.js + tRPC + Tailwind for SaaS
- **Builder.io**: Next.js or TanStack Start + Tailwind + Zustand + React Hook Form

---

## BACKEND FRAMEWORK SELECTION (February 2026)

| Requirement | Primary | Why | Runner-Up | Consider If |
|-------------|---------|-----|-----------|-------------|
| **Edge/serverless API** | Hono 4 | <12kB, zero deps, runs everywhere (Workers, Deno, Bun, Node, Lambda) | Elysia (Bun-native) | You're committed to Bun runtime |
| **TypeScript internal API** | tRPC v11 | End-to-end type safety, built-in caching/mutations, T3 stack standard | Server Actions (Next.js) | API is tightly coupled to frontend |
| **Node.js server** | Fastify | Meaningful perf over Express, mature plugins, enterprise-ready | NestJS | You want Angular-style dependency injection |
| **High concurrency** | Go (Gin/Echo) | Goroutines, compile-time safety, cloud-native standard | Rust (Axum) | You need maximum performance + memory safety |
| **ML/data pipeline** | Python (FastAPI) | ML ecosystem, async, type hints, auto-generated docs | Django REST | You need admin panel + ORM + full framework |
| **Rapid prototyping** | Hono or Express | Simple setup, fast iteration, minimal boilerplate | Fastify | You need schema validation built-in |

**Key 2026 trend:** Multi-protocol approach is standard. Use tRPC for internal type-safe APIs, REST for public APIs, WebSockets for real-time. Hono's rise signals the "edge-first" shift — APIs deployed to Cloudflare Workers with <12kB overhead.

---

## DATABASE SELECTION (February 2026)

| Requirement | Primary | Why | Runner-Up | Consider If |
|-------------|---------|-----|-----------|-------------|
| **General purpose** | PostgreSQL 18 | 55.6% dev adoption, ACID, jsonb, pgvector, async I/O (3x perf) | MySQL 8 | Legacy team or WordPress ecosystem |
| **Full-stack platform** | Supabase | PG + Auth + Realtime + Edge Functions + AI Assistant + Storage | Firebase | Google ecosystem or real-time-first |
| **Serverless** | Neon | Git-like branching, scale-to-zero, <1s cold starts | Turso (edge SQLite) | You need data at the edge globally |
| **High performance** | PlanetScale Metal | NVMe-based, unlimited I/O, now supports PostgreSQL | CockroachDB | You need global ACID distribution |
| **Edge/offline** | Turso (libSQL) | Embedded replicas, zero-latency local reads, concurrent writes | Cloudflare D1 | You're in the Cloudflare ecosystem |
| **Vector/AI** | pgvector (PostgreSQL) | Same DB for relational + vectors; 471 QPS at 99% recall on 50M vectors | Pinecone (managed) | You exceed 100M vectors or want zero-ops |
| **Document store** | MongoDB Atlas | Schema flexibility, horizontal scaling | DynamoDB | AWS-native, key-value access patterns |
| **Caching** | Redis / Valkey | In-memory, data structures, pub/sub | Dragonfly | You need Redis API with better performance |
| **Search** | Meilisearch | Typo-tolerant, instant, easy setup | Elasticsearch | You need analytics + complex aggregations |

---

## ORM SELECTION (February 2026)

| Requirement | Primary | Why | Runner-Up |
|-------------|---------|-----|-----------|
| **Serverless/edge** | Drizzle ORM | 7.4kB bundle, pure TS inference, SQL-like API | Kysely |
| **Rapid development** | Prisma | Intuitive schema DSL, auto-generated client, broad DB support | Drizzle |
| **SQL control** | Drizzle ORM | "If you know SQL, you know Drizzle" | Raw SQL with type helpers |

**2026 status:** Drizzle and Prisma are converging — Prisma removed Rust engine, Drizzle added relational queries. Both production-ready. Pick based on preference.

---

## AUTHENTICATION SELECTION (February 2026)

| Requirement | Primary | Why | Runner-Up | Consider If |
|-------------|---------|-----|-----------|-------------|
| **Self-hosted, data ownership** | Better Auth | Framework-agnostic, data in YOUR DB, MIT licensed, 15k+ GitHub stars, YC W25 | Auth.js | You want more community maturity |
| **Managed, enterprise compliance** | Clerk | Pre-built UI, SOC2/HIPAA, 10M+ users authenticated, org management | Auth0 | You need SAML/SSO enterprise features |
| **Supabase ecosystem** | Supabase Auth | Integrated with DB, RLS, Edge Functions | Better Auth | You want framework-agnostic + self-hosted |
| **Open-source, budget** | Auth.js (NextAuth v5) | Free, multiple providers, framework-agnostic | Better Auth | You want more features + plugin ecosystem |
| **Full control** | Custom JWT + bcrypt | No vendor lock-in, total control | Passport.js | You want pre-built OAuth strategies |

**Key 2026 shift:** Better Auth is the breakout authentication library — 150k+ weekly downloads, framework-agnostic, all data in your own database. Biggest threat to Clerk for cost-conscious teams.

---

## CSS / STYLING (February 2026)

| Requirement | Primary | Why | Runner-Up |
|-------------|---------|-----|-----------|
| **General purpose** | Tailwind CSS v4 | Industry standard, Oxide engine (faster builds), AI tools generate it natively | UnoCSS |
| **Design system** | Tailwind + shadcn/ui | Copy-paste components, Radix primitives, fully customizable | Panda CSS |
| **Minimal JS** | Native CSS (nesting + container queries) | Zero deps, well-supported in 2026 | Tailwind |
| **Type-safe tokens** | Panda CSS | Build-time CSS-in-JS, zero runtime, type-safe tokens | Vanilla Extract |

---

## DEPLOYMENT / INFRASTRUCTURE (February 2026)

| Scale | Primary | Why | Runner-Up | Consider If |
|-------|---------|-----|-----------|-------------|
| **MVP / indie** | Vercel Free + Supabase Free | Zero config, generous free tiers, best Next.js DX | Railway | You want container-based pricing |
| **Growth, cost-conscious** | Coolify (self-hosted) | Vercel-like DX at 10-20% the cost on Hetzner VPS | Railway | You don't want to manage servers |
| **Edge-first** | Cloudflare Workers + D1 + R2 | Global network, unlimited bandwidth, edge compute | Deno Deploy | You want Deno runtime |
| **AWS committed** | SST (OpenNext) | Abstracts AWS complexity, self-host Next.js on AWS | AWS CDK | You want lower-level control |
| **Enterprise** | Kubernetes (EKS/GKE) | Multi-region, orchestration, compliance | Nomad | You want simpler orchestration |

**Key 2026 shift:** Self-hosting is back. Coolify's rise means developers can get Vercel-like git-push deploys, preview URLs, and auto-SSL on a $20/month Hetzner VPS.

---

## AI / LLM INTEGRATION (February 2026)

| Use Case | Primary | Why | Runner-Up |
|----------|---------|-----|-----------|
| **Chat UI / streaming** | Vercel AI SDK | React hooks (useChat, useCompletion), 25+ providers, edge-native | Anthropic SDK direct |
| **Complex agents** | LangChain + LangGraph | Most comprehensive agent framework, stateful workflows, tool use | CrewAI |
| **IDE / tool integration** | Model Context Protocol (MCP) | Open standard (Anthropic), adopted by ChatGPT, Claude, VS Code | Custom tool APIs |
| **AI coding assistance** | Cursor / Claude Code | 92% of US devs use AI daily; 41% of code is AI-generated | Windsurf ($15/seat) |

---

## CI/CD & DEVELOPER TOOLS (February 2026)

| Category | Primary | Why | Runner-Up |
|----------|---------|-----|-----------|
| **CI/CD** | GitHub Actions | Native GitHub integration, marketplace | GitLab CI |
| **Linting + formatting** | Biome v2.3 | Replaces ESLint + Prettier, 423 rules, type-aware linting, GritQL plugins | ESLint 9 + Prettier |
| **Testing** | Vitest + Playwright | Vitest for unit/integration, Playwright for E2E (multi-browser) | Jest + Cypress |
| **Monorepo** | Turborepo | Fast builds, remote caching, Vercel integration | Nx |
| **Package manager** | pnpm | Disk-efficient, strict deps, workspace support | Bun |
| **State management** | Zustand | Simple, hook-based, minimal boilerplate | Jotai |
| **Forms** | React Hook Form + Zod | Performant (minimal re-renders), type-safe validation | Conform |
| **Email** | Resend + React Email | Developer-first, React components for email templates | SendGrid |
| **Payments** | Stripe | Industry standard, comprehensive API | Lemon Squeezy (MoR) |
| **Analytics** | PostHog | Open-source, product analytics + feature flags + session replay | Mixpanel |
| **Error tracking** | Sentry | Industry standard, source maps, replay | BetterStack |
| **Monitoring** | BetterStack (Logtail) | Unified logs + uptime + incidents | Datadog |

---

## RECOMMENDED STACKS BY PROJECT TYPE (February 2026)

### B2B SaaS
```
Framework:    Next.js 16
Backend:      tRPC v11 + Server Actions
Database:     PostgreSQL 18 on Supabase (RLS for multi-tenancy)
ORM:          Drizzle ORM
Auth:         Clerk (managed) or Better Auth (self-hosted)
Payments:     Stripe
Styling:      Tailwind v4 + shadcn/ui
Deploy:       Vercel (start) → Coolify (scale)
```

### Marketplace / Platform
```
Framework:    Next.js 16
Backend:      Hono (API) + Next.js (frontend)
Database:     PostgreSQL 18 on Neon (branching for staging)
ORM:          Prisma (complex relationships)
Auth:         Clerk (org management)
Payments:     Stripe Connect (multi-party)
Search:       Meilisearch
Deploy:       Railway or Vercel
```

### Mobile App
```
Framework:    React Native + Expo (Expo Router)
Backend:      Hono on Cloudflare Workers
Database:     Turso (embedded replicas for offline) or Supabase (real-time)
Auth:         Supabase Auth or Better Auth
Push:         Expo Notifications
Deploy:       EAS Build (Expo) + Cloudflare Workers
```

### API-First Product
```
Framework:    Hono 4 (OpenAPI integration)
Database:     PostgreSQL 18 on PlanetScale Metal or Neon
ORM:          Drizzle ORM
Auth:         API keys + OAuth 2.0
Docs:         Scalar (OpenAPI 3.2 viewer)
Rate Limit:   Redis-backed sliding window
Deploy:       Cloudflare Workers or Railway
```

### AI / LLM Product
```
Framework:    Next.js 16
AI:           Vercel AI SDK (chat UI) + LangChain/LangGraph (agents)
Database:     PostgreSQL 18 + pgvector on Supabase
ORM:          Drizzle ORM
Auth:         Better Auth or Clerk
Vector:       pgvector (< 100M vectors) → Qdrant (scale)
Deploy:       Vercel + separate agent service on Railway
```

### E-Commerce
```
Framework:    Next.js 16 or SvelteKit 5
Backend:      Next.js API routes or Hono
Database:     PostgreSQL 18 on Supabase (JSONB for product attributes)
ORM:          Drizzle ORM
Auth:         Better Auth or Clerk
Payments:     Stripe
Search:       Meilisearch (product search with facets)
Deploy:       Vercel or Coolify
```

---

## INDUSTRY-SPECIFIC TECH STACK GUIDANCE

### Healthcare
```
Framework:    Next.js 16 (HIPAA-compliant hosting required)
Backend:      Hono or Fastify (not serverless — need persistent audit logging)
Database:     PostgreSQL 18 on AWS RDS (BAA available) or Supabase (signs BAA)
ORM:          Drizzle ORM or Prisma
Auth:         Clerk Enterprise (HIPAA/SOC2) or custom with MFA mandatory
Interop:      FHIR R4 API (HL7 standard — use @medplum/core or HAPI FHIR)
Compliance:   AES-256 at rest, TLS 1.3 in transit, PHI audit logging
Deploy:       AWS (GovCloud for federal) or Azure (HITRUST certified)
Monitoring:   Sentry + BetterStack (BAA-compliant logging)
```
**Why not Vercel:** Most HIPAA workloads need BAA from hosting provider. Vercel doesn't sign BAAs. Use AWS ECS/Fargate or Railway (signs BAAs).
**Key lib:** `@medplum/core` for FHIR resource handling; Medplum is the leading open-source FHIR platform (2026).

### Fintech
```
Framework:    Next.js 16 or SvelteKit 5
Backend:      Fastify (transaction-heavy, need connection pooling) or Go (high-throughput)
Database:     PostgreSQL 18 on AWS RDS (encrypted, multi-AZ) or Neon Enterprise
ORM:          Drizzle ORM (SQL transparency critical for financial queries)
Auth:         Custom with MFA mandatory + device fingerprinting
Payments:     Stripe (PCI-compliant) — NEVER handle raw card data yourself
Ledger:       Double-entry bookkeeping (custom or Modern Treasury API)
Compliance:   PCI-DSS (via Stripe), SOC2 Type II, AML/KYC (Plaid Identity, Jumio)
Deploy:       AWS (ECS + RDS + ElastiCache) — regulated infra
Monitoring:   Datadog APM + Sentry + custom fraud dashboards
```
**Critical:** Use `DECIMAL(18,4)` for all monetary values. Never `float`. All financial mutations need idempotency keys. Every transaction produces exactly 2 ledger entries (debit + credit).

### Education / EdTech
```
Framework:    Next.js 16 (SSR for SEO on public courses)
Backend:      tRPC (internal) + REST (LTI integration)
Database:     PostgreSQL 18 on Supabase (Realtime for live collaboration)
ORM:          Drizzle ORM
Auth:         Clerk (org management for schools/districts) or Better Auth
Video:        Mux (adaptive streaming, DRM) or Cloudflare Stream
LMS Interop:  LTI 1.3 (Learning Tools Interoperability — connects to Canvas, Blackboard, Moodle)
Compliance:   FERPA (student data), COPPA (under-13 users)
Deploy:       Vercel + Railway (video processing workers)
```
**Key pattern:** LTI 1.3 integration is MANDATORY for EdTech selling to schools/universities. It allows your tool to embed in Canvas/Blackboard/Moodle. Use `ltijs` npm package.

### Automotive / Dealer Management
```
Framework:    Next.js 16 (mobile-responsive for lot use)
Backend:      Fastify or Hono (high API volume from inventory feeds)
Database:     PostgreSQL 18 on Supabase or Neon
ORM:          Drizzle ORM
Auth:         Clerk (role-based: salesperson, finance manager, service advisor, admin)
Integrations: vAuto/Provision (inventory), RouteOne/DealerTrack (F&I), CDK/Reynolds (DMS)
VIN Decode:   NHTSA API (free) or DataOne Software (paid, more complete)
Deploy:       Vercel or Coolify (dealers are cost-sensitive)
```
**Key pattern:** Automotive inventory syncs via standardized feeds (ADF/XML for leads, STAR/XML for inventory). VIN is the universal join key across all systems.

### Logistics / Supply Chain
```
Framework:    Next.js 16 (dashboard-heavy) or React + Vite (SPA for warehouse ops)
Backend:      Go (high-throughput event processing) or Fastify (TypeScript teams)
Database:     PostgreSQL 18 + TimescaleDB (time-series for tracking events)
ORM:          Drizzle ORM
Auth:         Custom API keys (system-to-system) + Clerk (dashboard users)
Mapping:      Mapbox or Google Maps Platform (route visualization, geocoding)
Barcode:      `zxing-js` (scanner) or Zebra SDK (label printing)
EDI:          AS2/SFTP for EDI 204/210/214/856 (carrier/shipper interchange)
Deploy:       AWS (ECS for workers, Lambda for webhooks) or Railway
```
**Key lib:** `@turf/turf` for geospatial calculations (distance, ETA, geofencing). TimescaleDB for high-volume tracking event storage (millions of GPS pings/day).

### Insurance / Insurtech
```
Framework:    Next.js 16 (agent portal + policyholder portal)
Backend:      Fastify or NestJS (complex business rules, DDD architecture suits insurance)
Database:     PostgreSQL 18 on AWS RDS (regulatory data retention requirements)
ORM:          Drizzle ORM or Prisma
Auth:         Clerk Enterprise or custom with MFA (SOC2 required)
Integrations: Verisk (risk data), LexisNexis (claims history), Plaid (proof of income)
Rating:       Custom rating engine or Duck Creek / Guidewire (enterprise)
Compliance:   State DOI regulations, NAIC standards, SOC2
Deploy:       AWS (regulated) or Azure
```
**Key pattern:** Insurance rating engines evaluate risk factors to calculate premiums. Start with a custom rule-based engine (JSONB rules in DB); graduate to Guidewire/Duck Creek at enterprise scale.

### Legal / LegalTech
```
Framework:    Next.js 16
Backend:      tRPC (internal) + REST (e-billing integration)
Database:     PostgreSQL 18 on Supabase or AWS RDS
ORM:          Drizzle ORM
Auth:         Custom with MFA (bar association compliance)
E-billing:    LEDES 1998B/2000 format (Legal Electronic Data Exchange Standard)
Document:     Tiptap or ProseMirror (rich text editing for legal documents)
PDF:          `@react-pdf/renderer` (document generation) + pdf-lib (manipulation)
Compliance:   ABA Model Rules (client confidentiality), IOLTA (trust accounting)
Deploy:       AWS or Vercel + Railway
```
**Key pattern:** Legal billing uses UTBMS activity codes and LEDES format for electronic billing. Trust accounting (IOLTA) requires physically separate accounts from operating funds.

### Hospitality / Travel
```
Framework:    Next.js 16 (SEO-critical for property listings)
Backend:      Hono (API) + Next.js (frontend SSR)
Database:     PostgreSQL 18 + PostGIS (geospatial queries) on Supabase
ORM:          Drizzle ORM
Auth:         Better Auth or Clerk (host vs guest roles)
Payments:     Stripe Connect (host payouts, split payments, security deposits)
Mapping:      Mapbox GL JS (interactive maps, clustering)
Calendar:     `date-fns` + custom availability calendar (NOT FullCalendar — too heavy)
Search:       Meilisearch (faceted search: location, price, dates, amenities)
Deploy:       Vercel (edge caching for listing pages) + Railway (booking workers)
```
**Key pattern:** Availability is calendar-based (one row per room per date), not quantity-based. Use `SELECT ... FOR UPDATE` to prevent double-bookings during concurrent reservation attempts.

---

## RATIONALE TEMPLATES

**Primary choice:**
> "We recommend **{technology}** because {primary_reason}. It provides {benefit_1}, {benefit_2}, and {benefit_3}. Used by {notable_users} in production."

**Alternative:**
> "Consider **{alternative}** if you need {specific_requirement}. Trade-off: {what_you_give_up}."

**Why-not:**
> "**{rejected}** was considered but not recommended because {reason}. Choose it only if {exception_case}."

---

## WHEN NOT TO USE (Counter-Arguments)

Every technology has trade-offs. A balanced recommendation includes reasons NOT to choose something.

### Next.js
**Don't use if:** Simple static site (use Astro), heavy SPA with no SSR needs (use Vite + React), backend-heavy with minimal frontend (use Hono), 100% edge deployment needed (use Cloudflare Workers + SvelteKit)
**Common complaint:** Build times slow for large apps, vendor lock-in with Vercel, complex caching behavior in App Router

### PostgreSQL
**Don't use if:** Pure key-value access patterns (use Redis/DynamoDB), graph-heavy data (use Neo4j), document store with flexible schema needed at massive scale (use MongoDB), real-time global distribution required (use CockroachDB)
**Common complaint:** Connection limits on serverless (mitigate with PgBouncer/Supavisor), no native horizontal write scaling

### Supabase
**Don't use if:** You need full server control, custom auth flows beyond what Supabase Auth supports, self-hosted is a priority (Supabase self-host is complex), or you need databases other than PostgreSQL
**Common complaint:** Dashboard UX for complex queries, RLS debugging can be difficult, vendor lock-in on Edge Functions

### Tailwind CSS
**Don't use if:** Design system requires runtime theming (use CSS custom properties + Panda CSS), team strongly prefers CSS-in-JS colocation, very small project where utility classes add overhead
**Common complaint:** HTML gets verbose, learning curve for utility-first thinking

### Stripe
**Don't use if:** You need a Merchant of Record (use Lemon Squeezy or Paddle), crypto payments, or regions Stripe doesn't cover. Stripe's 2.9% + 30¢ fee is expensive for microtransactions.
**Consider:** Lemon Squeezy (handles sales tax/VAT globally), Paddle (B2B SaaS billing)

---

## BUDGET-STAGE MATRIX (Detailed)

| Budget × Stage | Monthly Cost | Stack Summary |
|----------------|-------------|---------------|
| **Bootstrap / Idea** | $0 | Vercel Free + Supabase Free + Supabase Auth + Tailwind |
| **Bootstrap / MVP** | $45-100 | Vercel Pro + Supabase Pro + Better Auth + Stripe + Sentry Free |
| **Bootstrap / Growth** | $20-60 | Coolify on Hetzner + Supabase Pro + Cloudflare CDN |
| **Seed / MVP** | $100-300 | Railway or Vercel Pro + Neon Pro + Clerk + Resend + Sentry Team |
| **Seed / Growth** | $300-800 | Railway + Vercel + Supabase Pro + Upstash Redis + PostHog + Inngest |
| **Series A / Growth** | $1K-5K | AWS ECS + RDS PostgreSQL + ElastiCache Redis + Datadog + Cloudflare Pro |
| **Enterprise / Mature** | $5K-50K+ | Kubernetes (EKS/GKE) + Aurora PostgreSQL + Custom SSO + Datadog APM + PagerDuty |

### Key Transition Points
- **$200/mo Vercel → Coolify**: Self-host for 80-90% savings
- **$500/mo total → Redis layer**: Add caching to reduce DB and LLM costs
- **100K MAU → Read replicas**: Add PgBouncer + read replicas
- **SOC2 needed → Managed infra**: Switch from self-hosted to AWS/GCP managed services

---

## 2026 ARCHITECTURE TRENDS

### The Convergence Stack
The TypeScript ecosystem has converged on a surprisingly consistent "best practice" stack:
```
Frontend:     Next.js 16 (React Compiler) or TanStack Start
Backend:      tRPC (internal) + Hono (public API)
Database:     PostgreSQL 18 (Supabase or Neon)
ORM:          Drizzle ORM
Auth:         Better Auth (self-hosted) or Clerk (managed)
Styling:      Tailwind v4 + shadcn/ui
Testing:      Vitest + Playwright
Linting:      Biome v2.3
Payments:     Stripe
Monitoring:   Sentry + PostHog
```

### Emerging Patterns
1. **Edge-first APIs**: Hono + Cloudflare Workers replacing traditional Node.js servers
2. **AI-native development**: 41% of code AI-generated; Cursor/Claude Code standard tooling
3. **Self-hosting revival**: Coolify + Hetzner as Vercel alternative for cost-conscious teams
4. **React Compiler**: Eliminates manual memoization (useMemo/useCallback no longer needed)
5. **Better Auth > Clerk**: Self-hosted auth gaining ground (150K+ weekly downloads)
6. **Biome > ESLint**: 10-100x faster, single tool replaces ESLint + Prettier
7. **pgvector mainstreaming**: "Just use Postgres" for vectors too (up to 100M)
8. **MCP (Model Context Protocol)**: Open standard for AI tool integration (Anthropic, adopted by ChatGPT)

---

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vendor lock-in (Vercel, Supabase) | High | Abstract behind interfaces; Coolify as escape hatch |
| Cost at scale (cloud services) | Medium | Monitor usage, set billing alerts, self-host when justified |
| Team learning curve | Medium | Start with familiar tools, adopt new ones incrementally |
| Framework churn | Low | Stick to stable releases (not canary/RC) |
| AI tool dependency | Medium | Keep manual coding skills; don't depend on AI for architecture |

---

## KEY INFLUENCERS & SOURCES

| Person | Platform | Focus |
|--------|----------|-------|
| Theo Browne (@t3dotgg) | YouTube, Twitter | T3 Stack, Next.js ecosystem, SaaS |
| Lee Robinson | Blog (leerob.io) | Next.js, React, deployment |
| Kent C. Dodds | epicweb.dev | Testing, React patterns, Remix |
| Tanner Linsley | TanStack | TanStack Start, React Query |
| Rich Harris | Svelte blog | SvelteKit, compiler-driven frameworks |
| Wes Bos & Scott Tolinski | syntax.fm podcast | Full-stack trends, tooling |
| Builder.io | Blog | React + AI stack annual guide |
| Fireship (Jeff Delaney) | YouTube | Framework comparisons, quick takes |
| Aaron Francis | YouTube, blog | Database education, PostgreSQL |
| Paul Copplestone | Supabase blog | PostgreSQL, full-stack platform |
