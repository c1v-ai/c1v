# External Integrations

**Analysis Date:** 2025-01-25

## APIs & External Services

**AI/LLM:**
- OpenAI - Primary LLM provider for conversational intake and data extraction
  - SDK/Client: `@langchain/openai` via `lib/langchain/config.ts`
  - Auth: `OPENAI_API_KEY` (required, must start with `sk-`)
  - Models used:
    - `gpt-4o` (temperature 0.7) - Conversational intake, general tasks
    - `gpt-4o` (temperature 0, streaming) - Real-time chat responses
    - `gpt-4o` (temperature 0) - Deterministic data extraction
    - `gpt-3.5-turbo` - Cost-effective simple tasks

**LangChain Observability (Optional):**
- LangSmith - Tracing and debugging for LangChain/LangGraph workflows
  - SDK/Client: Built into LangChain
  - Auth: `LANGCHAIN_API_KEY`
  - Config: `LANGCHAIN_PROJECT`, `LANGCHAIN_TRACING_V2`

**Email:**
- Resend - Transactional email delivery
  - SDK/Client: `resend` package via `lib/email/resend.ts`
  - Auth: `RESEND_API_KEY` (required, starts with `re_`)
  - From address: `Product Helper <noreply@c1v.ai>`
  - Usage: Password reset emails (`lib/email/send-password-reset.ts`)

**Payments:**
- Stripe - Subscription billing and payment processing
  - SDK/Client: `stripe` package via `lib/payments/stripe.ts`
  - Auth: `STRIPE_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
  - Webhook Secret: `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
  - API Version: `2025-08-27.basil`
  - Features: Checkout sessions, customer portal, subscription management
  - Trial: 14-day trial period on subscriptions

## Data Storage

**Databases:**
- PostgreSQL (via Supabase or self-hosted)
  - Connection: `POSTGRES_URL` (connection string)
  - Client: Drizzle ORM (`lib/db/drizzle.ts`)
  - Schema: `lib/db/schema.ts`
  - Migrations: `lib/db/migrations/`
  - SSL: Required in production, optional in development
  - Pooling: Max 10 connections, 20s idle timeout, 10s connect timeout

**Database Tables:**
- Core: `users`, `teams`, `team_members`, `activity_logs`, `invitations`, `password_reset_tokens`
- PRD: `projects`, `project_data`, `artifacts`, `conversations`
- LangGraph: `graph_checkpoints` (state persistence for intake workflow)

**File Storage:**
- Local filesystem only (no cloud storage integration)
- Artifacts stored as JSONB in database

**Caching:**
- None currently integrated
- Future: Upstash Redis planned (`UPSTASH_REDIS_REST_*` env vars reserved)

## Authentication & Identity

**Auth Provider:**
- Custom JWT implementation (no external auth provider)
  - Implementation: `lib/auth/session.ts`
  - Algorithm: HS256
  - Token expiry: 24 hours (1 day)
  - Session storage: HTTP-only secure cookie named `session`
  - Password hashing: bcryptjs with 10 salt rounds

**Middleware:**
- `middleware.ts` - Route protection and session refresh
  - Protected routes: `/dashboard/*`
  - Session auto-refresh on GET requests

## Monitoring & Observability

**Error Tracking:**
- None currently integrated
- Future: Sentry planned (`SENTRY_DSN`, `SENTRY_AUTH_TOKEN` env vars reserved)

**Logs:**
- Console logging only (console.log/console.error)
- No structured logging or log aggregation

**Tracing:**
- LangSmith (optional) for LangChain/LangGraph workflow tracing

## CI/CD & Deployment

**Hosting:**
- Vercel (Next.js optimized platform)
- Turbopack enabled for development builds

**CI Pipeline:**
- Not detected (no `.github/workflows/` in this app directory)
- Monorepo-level CI may exist at root

## Environment Configuration

**Required env vars:**
- `POSTGRES_URL` - PostgreSQL connection string
- `AUTH_SECRET` - JWT signing key (minimum 32 characters)
- `OPENAI_API_KEY` - OpenAI API key (starts with `sk-`)

**Optional env vars:**
- `STRIPE_SECRET_KEY` - Stripe API key for payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `RESEND_API_KEY` - Resend API key for emails
- `LANGCHAIN_API_KEY` - LangSmith tracing
- `LANGCHAIN_PROJECT` - LangSmith project name
- `LANGCHAIN_TRACING_V2` - Enable tracing (`true`/`false`)
- `USE_LANGGRAPH` - Feature flag for new LangGraph workflow
- `BASE_URL` - Application base URL (default: `http://localhost:3000`)
- `NODE_ENV` - Environment (`development`/`production`/`test`)

**Secrets location:**
- `.env` and `.env.local` files (gitignored)
- `.env.example` provides template

## Webhooks & Callbacks

**Incoming:**
- `/api/stripe/webhook` - Stripe subscription events
  - Events handled: `customer.subscription.updated`, `customer.subscription.deleted`
  - Verification: Stripe signature validation

**Outgoing:**
- None detected

## API Routes

**Project Management:**
- `POST /api/projects` - Create project
- `GET/PATCH/DELETE /api/projects/[id]` - Project CRUD
- `POST /api/projects/[id]/validate` - SR-CORNELL validation
- `GET /api/projects/[id]/export` - Export project

**Chat/AI:**
- `POST /api/chat` - Basic authenticated chat
- `POST /api/chat/projects/[projectId]` - Project-scoped chat with LangGraph
- `POST /api/chat/projects/[projectId]/save` - Save conversation

**Authentication:**
- `/api/team` - Team management
- `/api/user` - User profile

**Payments:**
- `/api/stripe/checkout` - Checkout session callback
- `/api/stripe/webhook` - Webhook handler

## Future Integrations (Reserved)

**Vector Database:**
- Supabase pgvector planned (`SUPABASE_URL`, `SUPABASE_PRIVATE_KEY`)

**Caching:**
- Upstash Redis planned (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)

**Error Tracking:**
- Sentry planned (`SENTRY_DSN`, `SENTRY_AUTH_TOKEN`)

---

*Integration audit: 2025-01-25*
