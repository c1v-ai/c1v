# External Integrations

**Analysis Date:** 2026-04-28
**App:** `apps/product-helper` at prd.c1v.ai

## APIs & External Services

**AI / LLM:**
- **Anthropic Claude** (Sonnet 4.5) — `@langchain/anthropic` 0.3.14
  - SDK/Client: wrapped in `lib/langchain/config.ts` (`createClaudeAgent`, `streamingLLM`)
  - Auth: `ANTHROPIC_API_KEY` (validated to start with `sk-ant-` in `lib/config/env.ts`)
  - Used by: all 10 agents (`lib/langchain/agents/*.ts`, `lib/langchain/agents/intake/`) and all graph nodes (`lib/langchain/graphs/nodes/*.ts`)

- **LangSmith** (tracing) — env-driven, no SDK import
  - Auth: `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`, `LANGCHAIN_TRACING_V2`
  - Activated via env vars only; picked up by `@langchain/core` automatically

**Payments:**
- **Stripe** — `stripe` 18.5.0
  - Client: `lib/payments/stripe.ts` (`getStripePrices`, `getStripeProducts`, `handleSubscriptionChange`)
  - Actions: `lib/payments/actions.ts` (`checkoutAction`)
  - Webhook: `app/api/stripe/webhook/route.ts` — verifies signature, handles `customer.subscription.{created,updated,deleted}` via `handleSubscriptionChange`
  - Checkout: `app/api/stripe/checkout/route.ts`
  - Auth: `STRIPE_SECRET_KEY` (`sk_`), `STRIPE_WEBHOOK_SECRET` (`whsec_`)
  - Plans: "Base" and "Plus" products (see `app/(dashboard)/pricing/page.tsx`, `components/marketing/pricing-section.tsx`)

**Email:**
- **Resend** — `resend` 6.7.0
  - Client: `lib/email/resend.ts` (`new Resend(process.env.RESEND_API_KEY)`)
  - Templates: `lib/email/templates/` (React Email components)
  - Senders: `lib/email/send-invitation.ts`, `lib/email/send-password-reset.ts`
  - Auth: `RESEND_API_KEY` (optional in dev per env schema)

## Data Storage

**Database:**
- **PostgreSQL** via Supabase
  - Local: Docker on port 54322 (`supabase/config.toml`, project_id `product-helper-local`)
  - Production: Supabase project `yxginqyxtysjdkeymnon` (CLAUDE.md-level memory; project URL not committed)
  - Connection: `POSTGRES_URL`
  - Client: `lib/db/drizzle.ts` (postgres-js + drizzle-orm)
  - ORM: Drizzle — schemas in `lib/db/schema.ts` (546 lines, 13 tables) + split types in `lib/db/schema/` (atlas-entries, decision-audit, kb-chunks, traceback, v2-types, v2-validators)

**Vector store:**
- **pgvector** inside the same Supabase Postgres — enabled via `lib/db/migrations/0008_enable_pgvector.sql`
  - Used by: `lib/db/schema/traceback.ts` (`tracebackCitations`, `EMBEDDING_DIMENSIONS`, SS7 traceback)
  - Used by: `lib/db/schema/kb-chunks.ts` (Module 8 Atlas KB chunks for `lib/langchain/engines/kb-embedder.ts` + `kb-search.ts`)
  - No separate Pinecone/Weaviate

**Caching:**
- None at the app layer. SWR client-side in `app/layout.tsx` (`/api/user`, `/api/team` fallbacks).
- Stripe prices cached via Next.js `revalidate = 3600` in `app/(dashboard)/pricing/page.tsx`.
- Module 4 schema preload route caches 24h SWR: `app/api/schemas/module-4/route.ts`.

**File storage:**
- None. No S3/Supabase Storage wiring. Artifact markdown exports stream from API routes (`app/api/projects/[id]/exports/{skill,claude-md}/route.ts`).

## Authentication & Identity

**Auth provider:** Custom — no third party.
- JWT: `lib/auth/session.ts` (`signToken`, `verifyToken` via `jose`)
- Password hash: `bcryptjs`
- Session cookie: `session` (httpOnly, secure in prod, sameSite=lax, 1-day rolling refresh on GET) — `middleware.ts`
- Protected prefixes: `/dashboard`, `/projects`, `/home`, `/account` (redirected to `/sign-in` if no cookie)
- API key auth (separate): `lib/mcp/auth.ts` + `api_keys` table, keys prefixed `ph_`

**Auth routes:** `app/(login)/{sign-in,sign-up,forgot-password,reset-password}/` — all server-action based (`app/(login)/actions.ts`).

**Password reset:** `password_reset_tokens` table (migration 0005?), bcrypt-hashed tokens, 1-hour expiry, linked by `userId` index.

## Monitoring & Observability

**Error tracking:** None wired (no Sentry/Rollbar/Datadog import anywhere).

**LLM tracing:** LangSmith env-var opt-in (see above).

**Logs:** `console.error`/`console.log` only — no structured logger.

**Audit:**
- `activity_logs` table (Drizzle) — auth-event audit
- `decisionAudit` table (`lib/db/schema/decision-audit.ts`) + `lib/langchain/engines/audit-writer.ts` — engine decision provenance

## CI/CD & Deployment

**Hosting:**
- **Vercel** for the Next.js app (root `apps/product-helper`, branch `main`, per `CURRENT-STATUS.md` 2026-01-25).
- No Dockerfile in `apps/product-helper/`.

**CI pipeline:**
- No `.github/workflows/` within `apps/product-helper/`. (Root repo may host them; out of scope.)
- Playwright reports to `playwright-report/` and `test-results/` locally.

**Public URL:** prd.c1v.ai (stated by user; not hardcoded in repo — derived from `BASE_URL`).

## Environment Configuration

**Required env vars (validated at import in `lib/config/env.ts`):**
- `POSTGRES_URL`
- `AUTH_SECRET` (≥32 chars)
- `ANTHROPIC_API_KEY` (`sk-ant-` prefix)
- `STRIPE_SECRET_KEY` (`sk_` prefix)
- `STRIPE_WEBHOOK_SECRET` (`whsec_` prefix)
- `BASE_URL` (valid URL)

**Optional:**
- `RESEND_API_KEY` (required in prod for email flows)
- `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`, `LANGCHAIN_TRACING_V2` (LangSmith)
- `USE_LANGGRAPH` (toggles LangGraph orchestration in `app/api/chat/projects/[projectId]/route.ts`)

**Secrets location:** `.env.local` (local), Vercel env (prod). `.env*` files gitignored.

## Webhooks & Callbacks

**Incoming:**
- `POST /api/stripe/webhook` — Stripe subscription lifecycle.

**Outgoing:**
- None. No analytics pings, no Slack/Discord, no third-party SaaS callbacks.

## MCP Server (outgoing-facing integration surface)

- Endpoint: `app/api/mcp/[projectId]/route.ts` (JSON-RPC 2.0 over HTTP POST).
- Auth: per-project API key (`Authorization: Bearer ph_...`), validated in `lib/mcp/auth.ts` against `api_keys` table.
- Rate limit: in-memory window via `lib/mcp/rate-limit.ts`.
- 17 tools registered via `lib/mcp/tools/index.ts` (`registerAllTools()` at module load):
  - **Core (7):** `get_prd`, `get_database_schema`, `get_tech_stack`, `get_user_stories`, `get_coding_context`, `get_project_architecture`, `get_diagrams`
  - **Generators (4):** `get_api_specs`, `get_infrastructure`, `get_coding_guidelines`, `update_user_story_status`
  - **Unique (6):** `get_validation_status`, `get_gsd_phases`, `get_cleo_tasks`, `invoke_agent`, `ask_project_question`, `search_project_context`
- Export helpers: `lib/mcp/claude-md-generator.ts`, `lib/mcp/skill-generator.ts` — power `/api/projects/[id]/exports/{claude-md,skill}` downloadable files used in Connections page.

---

*Integration audit: 2026-04-28*
