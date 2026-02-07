# External Integrations

**Analysis Date:** 2026-02-06

## APIs & External Services

**AI / LLM:**
- Anthropic Claude API - Primary AI provider for all agent features
  - SDK/Client: `@langchain/anthropic` (`ChatAnthropic`) configured in `lib/langchain/config.ts`
  - Auth: `ANTHROPIC_API_KEY` (must start with `sk-ant-`)
  - Models used:
    - Claude Sonnet 4 (`claude-sonnet-4-20250514`) - Default for all agents (chat, extraction, structured output)
    - Claude Opus 4 (`claude-opus-4-20250514`) - Available but not default
    - Claude 3.5 Haiku (`claude-3-5-haiku-20241022`) - Cost-effective for classification/validation tasks
  - LLM configurations (5 pre-configured instances in `lib/langchain/config.ts`):
    - `llm` - Conversational intake (temp 0.7, 2000 tokens)
    - `streamingLLM` - Real-time chat with streaming enabled
    - `extractionLLM` - Deterministic extraction (temp 0.2, 4000 tokens)
    - `structuredLLM` - Structured output for agents (temp 0.2, 4000 tokens)
    - `cheapLLM` - Haiku-based for simple tasks (temp 0.7, 1000 tokens)
  - Prompt caching enabled on all instances for cost savings
  - 30-second timeout on all API calls

**Payments:**
- Stripe - Subscription billing and payment processing
  - SDK/Client: `stripe` 18.5.0, configured in `lib/payments/stripe.ts`
  - API Version: `2025-08-27.basil`
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Features:
    - Checkout sessions (subscription mode with 14-day trial)
    - Customer portal (subscription update, cancellation, payment method changes)
    - Webhook handling (subscription.updated, subscription.deleted)
    - Promotion codes support
  - Routes:
    - `app/api/stripe/checkout/route.ts` - Checkout session completion (GET)
    - `app/api/stripe/webhook/route.ts` - Webhook event processing (POST)
  - Server actions: `lib/payments/actions.ts` (checkoutAction, customerPortalAction)

**Email:**
- Resend - Transactional email delivery
  - SDK/Client: `resend` 6.7.0, configured in `lib/email/resend.ts`
  - Auth: `RESEND_API_KEY` (optional in dev, required in production)
  - From address: `Product Helper <noreply@c1v.ai>`
  - Email types:
    - Team invitation emails (`lib/email/send-invitation.ts`) - HTML template inline
    - Password reset emails (`lib/email/send-password-reset.ts`) - React Email template
  - Template: `lib/email/templates/password-reset.tsx` (React Email component)

**Observability (Optional):**
- LangSmith - LangChain observability and tracing
  - Auth: `LANGCHAIN_API_KEY` (optional)
  - Config: `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_PROJECT` for project name
  - No code integration needed - picked up automatically by LangChain SDK

## Data Storage

**Databases:**
- PostgreSQL 15 (via Supabase)
  - Connection: `POSTGRES_URL` env var
  - Client: Drizzle ORM (`lib/db/drizzle.ts`) over postgres.js driver
  - Connection pooling: max 10 connections, 20s idle timeout
  - SSL: Required in production, disabled in development
  - Local dev: Supabase CLI on port 54322 (`supabase/config.toml`)
  - Schema: `lib/db/schema.ts` - 11 tables:
    - **Auth/Team**: `users`, `teams`, `team_members`, `invitations`, `password_reset_tokens`, `activity_logs`
    - **PRD**: `projects`, `project_data` (JSONB-heavy), `artifacts`, `conversations`
    - **Agent state**: `graph_checkpoints` (LangGraph state persistence)
    - **Stories**: `user_stories` (generated user stories with acceptance criteria)
    - **API**: `api_keys` (MCP API key management)
  - Migrations: `lib/db/migrations/` (SQL files, run via `drizzle-kit` or `psql`)
  - Seed script: `lib/db/seed.ts`

**File Storage:**
- None (no file uploads or blob storage)
- Supabase Storage is configured in `supabase/config.toml` (50MiB limit) but not used in application code

**Caching:**
- In-memory rate limiting only (`lib/mcp/rate-limit.ts`) - Map-based with TTL cleanup
- No Redis or external cache
- SWR for client-side data caching (8 components use it)
- Future planned: Upstash Redis (env vars in `.env.example` commented out)

## Authentication & Identity

**Auth Provider:**
- Custom JWT implementation (not NextAuth, Clerk, or Supabase Auth)
  - Implementation: `lib/auth/session.ts`
  - Algorithm: HS256 (HMAC-SHA256 via `jose`)
  - Session duration: 24 hours, auto-refreshed on GET requests
  - Password hashing: bcryptjs with 10 salt rounds
  - Session storage: httpOnly cookie named `session`
  - Cookie settings: secure in production, sameSite: lax
  - Middleware: `middleware.ts` - protects `/dashboard`, `/projects`, `/welcome-test`, `/account` routes
  - Security headers set in middleware: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection

**Auth Middleware Patterns:**
- Route-level: `middleware.ts` for cookie-based session validation
- API-level: `lib/auth/middleware.ts` provides `validatedAction()`, `validatedActionWithUser()`, `withTeam()` wrappers
- MCP API: Separate API key auth (`lib/mcp/auth.ts`) - key format: `ph_{projectId}_{random}`

## Monitoring & Observability

**Error Tracking:**
- None (Sentry DSN placeholder in `.env.example` but not integrated)

**Logs:**
- `console.log` / `console.error` throughout the codebase
- Activity logs table (`activity_logs`) for user actions (sign up, sign in, team operations)
- No structured logging framework

## CI/CD & Deployment

**Hosting:**
- Vercel (implied by Next.js deployment patterns, `BASE_URL` structure)
- No explicit deployment configuration files in this app directory

**CI Pipeline:**
- GitHub Actions (referenced in `playwright.config.ts` via `process.env.CI` checks)
- Playwright configured for CI: 2 retries, 1 worker, HTML + GitHub reporter
- No workflow files found in app directory (likely at monorepo root)

## Environment Configuration

**Required env vars:**
| Variable | Format | Purpose |
|----------|--------|---------|
| `POSTGRES_URL` | PostgreSQL connection string | Database connection |
| `AUTH_SECRET` | 32+ character string | JWT signing key |
| `ANTHROPIC_API_KEY` | `sk-ant-*` | Claude AI API access |
| `STRIPE_SECRET_KEY` | `sk_*` / `sk_test_*` | Stripe payment processing |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` | Stripe webhook verification |
| `BASE_URL` | Valid URL | Application base URL for redirects/CORS |

**Optional env vars:**
| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Email delivery (required in production) |
| `LANGCHAIN_API_KEY` | LangSmith tracing |
| `LANGCHAIN_TRACING_V2` | Enable LangSmith tracing (`true`) |
| `LANGCHAIN_PROJECT` | LangSmith project name |
| `USE_LANGGRAPH` | Feature flag for LangGraph chat workflow |
| `NODE_ENV` | Environment (`development`/`production`/`test`) |

**Secrets location:**
- Development: `.env.local` (gitignored)
- Production: Vercel environment variables (platform-managed)
- Validation: `lib/config/env.ts` runs at startup, app crashes if invalid

## Webhooks & Callbacks

**Incoming:**
- `POST /api/stripe/webhook` - Stripe subscription events
  - Events handled: `customer.subscription.updated`, `customer.subscription.deleted`
  - Signature verification via `stripe.webhooks.constructEvent()`
  - Handler: `lib/payments/stripe.ts` `handleSubscriptionChange()`

**Outgoing:**
- None

## MCP Server (Model Context Protocol)

**Endpoint:** `POST /api/mcp/[projectId]`
- Protocol: JSON-RPC 2.0 over HTTP
- Auth: API key in `Authorization: Bearer ph_*` header
- Rate limit: 100 requests/minute per key prefix (in-memory)
- 17 tools organized in 3 categories:
  - **Core (7):** get-prd, get-tech-stack, get-database-schema, get-user-stories, get-coding-context, get-project-architecture, get-diagrams
  - **Generators (4):** get-api-specs, get-coding-guidelines, get-infrastructure, update-story-status
  - **Unique (6):** get-cleo-tasks, get-gsd-phases, get-validation-status, invoke-agent, search-context, ask-question
- Export generators: SKILL.md and CLAUDE.md for IDE integration
  - `app/api/projects/[id]/exports/skill/route.ts`
  - `app/api/projects/[id]/exports/claude-md/route.ts`
- CORS: Configured for `BASE_URL` origin in OPTIONS handler
- Key management:
  - Generation: `lib/mcp/auth.ts` `generateApiKey()`
  - Validation: SHA-256 hash comparison against `api_keys` table
  - Format: `ph_{8-digit-projectId}_{24-char-random}`
  - Routes: `app/api/projects/[id]/keys/route.ts`, `app/api/projects/[id]/keys/[keyId]/route.ts`

## AI Agent Pipeline

**Intake Flow (LangGraph):**
- Graph: `lib/langchain/graphs/intake-graph.ts`
- 6 knowledge bank steps: Context Diagram -> Use Case Diagram -> Scope Tree -> UCBD -> Requirements -> SysML Activity
- State checkpointing: `lib/langchain/graphs/checkpointer.ts` (persisted to `graph_checkpoints` table)
- Nodes: `lib/langchain/graphs/nodes/` (analyze-response, check-prd-spec, compute-next-question, extract-data, generate-artifact, generate-response)
- Edges: `lib/langchain/graphs/edges.ts` (routing logic between nodes)
- Chat endpoint: `app/api/chat/projects/[projectId]/route.ts`
- Handler: `app/api/chat/projects/[projectId]/langgraph-handler.ts`

**Generator Agents (Independent):**
- `lib/langchain/agents/tech-stack-agent.ts` - Technology recommendations
- `lib/langchain/agents/user-stories-agent.ts` - User story generation
- `lib/langchain/agents/schema-extraction-agent.ts` - Database schema extraction
- `lib/langchain/agents/api-spec-agent.ts` - OpenAPI specification generation
- `lib/langchain/agents/infrastructure-agent.ts` - Infrastructure recommendations
- `lib/langchain/agents/guidelines-agent.ts` - Coding guidelines generation
- `lib/langchain/agents/extraction-agent.ts` - Structured data extraction from conversations
- `lib/langchain/agents/quick-start-synthesis-agent.ts` - Quick start context expansion

**Quick Start Orchestrator:**
- `lib/langchain/quick-start/orchestrator.ts`
- Pipeline: Synthesis (sequential) -> Extraction (parallel via `Promise.allSettled`) -> Validation -> Artifacts -> Persistence
- Route: `app/api/projects/[id]/quick-start/route.ts`

## Future Integrations (Planned but Not Implemented)

- **Supabase Vector Store** (`SUPABASE_URL`, `SUPABASE_PRIVATE_KEY`) - Semantic search
- **Upstash Redis** (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) - Caching
- **Sentry** (`SENTRY_DSN`, `SENTRY_AUTH_TOKEN`) - Error tracking

---

*Integration audit: 2026-02-06*
