# External Integrations

**Analysis Date:** 2026-02-08

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
  - Prompt caching enabled on all instances for cost savings (`cacheControl: true`)
  - 30-second timeout on all API calls
  - Factory function: `createClaudeAgent(schema, name, options)` for structured output agents

**Payments:**
- Stripe - Subscription billing and payment processing
  - SDK/Client: `stripe` 18.5.0, configured in `lib/payments/stripe.ts`
  - API Version: `2025-08-27.basil`
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Features:
    - Checkout sessions (subscription mode with 14-day trial)
    - Customer portal (subscription update, cancellation, payment method changes)
    - Webhook handling (`customer.subscription.updated`, `customer.subscription.deleted`)
    - Promotion codes support
  - Routes:
    - `app/api/stripe/checkout/route.ts` - Checkout session completion (GET)
    - `app/api/stripe/webhook/route.ts` - Webhook event processing (POST)
  - Server actions: `lib/payments/actions.ts` (checkoutAction, customerPortalAction)
  - Database fields: `teams.stripeCustomerId`, `teams.stripeSubscriptionId`, `teams.stripeProductId`, `teams.planName`, `teams.subscriptionStatus`

**Email:**
- Resend - Transactional email delivery
  - SDK/Client: `resend` 6.7.0, configured in `lib/email/resend.ts`
  - Auth: `RESEND_API_KEY` (optional in dev, required in production)
  - From address: `Product Helper <noreply@c1v.ai>`
  - Email types:
    - Team invitation emails (`lib/email/send-invitation.ts`) - HTML template inline
    - Password reset emails (`lib/email/send-password-reset.ts`) - React Email template
  - Template: `lib/email/templates/password-reset.tsx` (React Email component via `@react-email/components`)

**Observability (Optional):**
- LangSmith - LangChain observability and tracing
  - Auth: `LANGCHAIN_API_KEY` (optional)
  - Config: `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_PROJECT` for project name
  - No code integration needed - picked up automatically by LangChain SDK
  - Referenced in `lib/education/generator-kb.ts` and env examples

## Data Storage

**Databases:**
- PostgreSQL 15 (via Supabase)
  - Connection: `POSTGRES_URL` env var
  - Client: Drizzle ORM (`lib/db/drizzle.ts`) over postgres.js driver
  - Connection pooling: max 10 connections, 20s idle timeout, 10s connect timeout
  - SSL: Required in production (`ssl: 'require'`), disabled in development
  - Local dev: Supabase CLI on port 54322 (`supabase/config.toml`)
  - Schema: `lib/db/schema.ts` - 12 tables:
    - **Auth/Team**: `users`, `teams`, `team_members`, `invitations`, `password_reset_tokens`, `activity_logs`
    - **PRD**: `projects`, `project_data` (JSONB-heavy for actors, use cases, boundaries, entities, schema, tech stack, API spec, infrastructure, guidelines, NFRs, review status, intake state), `artifacts`, `conversations`
    - **Agent state**: `graph_checkpoints` (LangGraph state persistence with serialized IntakeState)
    - **Stories**: `user_stories` (generated user stories with acceptance criteria, priority, effort, labels, ordering)
    - **API**: `api_keys` (MCP API key management with SHA-256 hashing, scopes, expiry, revocation)
  - Migrations: `lib/db/migrations/` (SQL files, run via `drizzle-kit` or `psql`)
  - Extended types: `lib/db/schema/v2-types.ts` (TechStackModel, DatabaseSchemaModel, InfrastructureSpec, CodingGuidelines)
  - Seed script: `lib/db/seed.ts`

**File Storage:**
- None (no file uploads or blob storage)
- Supabase Storage is configured in `supabase/config.toml` (50MiB limit) but not used in application code

**Caching:**
- In-memory rate limiting only (`lib/mcp/rate-limit.ts`) - Map-based with TTL cleanup (5-minute interval)
- No Redis or external cache
- SWR for client-side data caching (9+ components use it)
- Future planned: Upstash Redis (env vars in `.env.example` commented out)

## Authentication & Identity

**Auth Provider:**
- Custom JWT implementation (not NextAuth, Clerk, or Supabase Auth)
  - Implementation: `lib/auth/session.ts`
  - Algorithm: HS256 (HMAC-SHA256 via `jose`)
  - Session duration: 24 hours, auto-refreshed on GET requests only (avoids mutation side effects)
  - Password hashing: bcryptjs with 10 salt rounds
  - Session storage: httpOnly cookie named `session`
  - Cookie settings: secure in production, sameSite: lax
  - Middleware: `middleware.ts` - protects `/dashboard`, `/projects`, `/home`, `/account` routes
  - Security headers set in middleware: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy (camera/microphone/geolocation disabled), X-XSS-Protection

**Auth Middleware Patterns:**
- Route-level: `middleware.ts` for cookie-based session validation (matcher excludes `/api`, `/_next`, static assets)
- API-level: `lib/db/queries.ts` `getUser()` for session verification in route handlers
- MCP API: Separate API key auth (`lib/mcp/auth.ts`) - key format: `ph_{8-digit-projectId}_{24-char-random}`

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
- No workflow files found in app directory (likely at monorepo root `.github/workflows/`)

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

**E2E test-specific vars (`.env.test.example`):**
| Variable | Purpose |
|----------|---------|
| `E2E_TEST_EMAIL` | Test user email |
| `E2E_TEST_PASSWORD` | Test user password |

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
- Protocol: JSON-RPC 2.0 over HTTP (protocol version `2024-11-05`)
- Route: `app/api/mcp/[projectId]/route.ts`
- Auth: API key in `Authorization: Bearer ph_*` header
- Rate limit: 100 requests/minute per key prefix (in-memory, `lib/mcp/rate-limit.ts`)
- Server: `lib/mcp/server.ts` (handles `initialize`, `ping`, `tools/list`, `tools/call`)
- 17 tools organized in 3 categories (registered in `lib/mcp/tools/index.ts`):
  - **Core (7):** get-prd, get-tech-stack, get-database-schema, get-user-stories, get-coding-context, get-project-architecture, get-diagrams
  - **Generators (4):** get-api-specs, get-coding-guidelines, get-infrastructure, update-story-status
  - **Unique (6):** get-cleo-tasks, get-gsd-phases, get-validation-status, invoke-agent, search-context, ask-question
- Export generators for IDE integration:
  - SKILL.md export: `app/api/projects/[id]/exports/skill/route.ts` (via `lib/mcp/skill-generator.ts`)
  - CLAUDE.md export: `app/api/projects/[id]/exports/claude-md/route.ts` (via `lib/mcp/claude-md-generator.ts`)
- CORS: Configured for `BASE_URL` origin in OPTIONS handler
- Key management:
  - Generation: `lib/mcp/auth.ts` `generateApiKey()` using `crypto.randomBytes`
  - Validation: SHA-256 hash comparison against `api_keys` table
  - Format: `ph_{8-digit-projectId}_{24-char-random}` (validated via regex)
  - Routes: `app/api/projects/[id]/keys/route.ts`, `app/api/projects/[id]/keys/[keyId]/route.ts`

## AI Agent Pipeline

**Intake Flow (LangGraph):**
- Graph: `lib/langchain/graphs/intake-graph.ts` (compiled via `@langchain/langgraph` `StateGraph`)
- State annotation: `IntakeStateAnnotation` with custom reducers for messages, artifacts, extraction data
- 6 knowledge bank steps: Context Diagram -> Use Case Diagram -> Scope Tree -> UCBD -> Functional Requirements -> SysML Activity Diagram
- State checkpointing: `lib/langchain/graphs/checkpointer.ts` (serialized to `graph_checkpoints` table, supports pause/resume across HTTP requests)
- Nodes in `lib/langchain/graphs/nodes/`:
  - `analyze-response.ts` - Intent detection from user message
  - `extract-data.ts` - Structured PRD data extraction
  - `compute-next-question.ts` - Question generation based on data gaps
  - `check-prd-spec.ts` - Validation against PRD-SPEC standards
  - `generate-artifact.ts` - Mermaid diagram/table generation
  - `generate-response.ts` - Conversational AI response creation
- Edges: `lib/langchain/graphs/edges.ts` (conditional routing: `routeAfterAnalysis`, `routeAfterExtraction`, `routeAfterValidation`, `routeAfterArtifact`, `shouldForceEnd`)
- Chat endpoint: `app/api/chat/projects/[projectId]/route.ts` (dual-mode: LangGraph vs legacy)
- LangGraph handler: `app/api/chat/projects/[projectId]/langgraph-handler.ts`
- Knowledge bank question generator: `lib/langchain/agents/intake/kb-question-generator.ts`

**Generator Agents (Independent, each with Knowledge Bank injection):**
- `lib/langchain/agents/tech-stack-agent.ts` - Technology recommendations (uses `getTechStackKnowledge()`)
- `lib/langchain/agents/user-stories-agent.ts` - User story generation
- `lib/langchain/agents/schema-extraction-agent.ts` - Database schema extraction (uses `getSchemaKnowledge()`)
- `lib/langchain/agents/api-spec-agent.ts` - OpenAPI specification generation (uses `getAPISpecKnowledge()`)
- `lib/langchain/agents/infrastructure-agent.ts` - Infrastructure recommendations (uses `getInfrastructureKnowledge()`)
- `lib/langchain/agents/guidelines-agent.ts` - Coding guidelines generation (uses `getCodingStandardsKnowledge()`)
- `lib/langchain/agents/extraction-agent.ts` - Structured data extraction from conversations
- `lib/langchain/agents/quick-start-synthesis-agent.ts` - Quick start context expansion from single sentence
- Knowledge bank source: `lib/education/generator-kb.ts` (curated February 2026 industry knowledge)

**Quick Start Orchestrator:**
- `lib/langchain/quick-start/orchestrator.ts`
- Pipeline: Synthesis (sequential) -> Extraction (5 agents in parallel via `Promise.allSettled`) -> Validation -> Artifacts (Mermaid diagrams) -> Persistence
- Parallel agents: extraction, tech-stack, user-stories, db-schema, api-spec
- Route: `app/api/projects/[id]/quick-start/route.ts`
- Progress callback via SSE for real-time UI updates

**Educational Content System:**
- Knowledge bank types: `lib/education/knowledge-bank.ts` (ThinkingMessage, TooltipTerm, ValidationError, KnowledgeBankStep)
- Phase mapping: `lib/education/phase-mapping.ts` (maps intake phases to educational prompts)
- Generator knowledge banks: `lib/education/generator-kb.ts` (6 functions for agent prompt injection: KB 07-12)
- Knowledge bank markdown files: `.planning/phases/12-project-explorer/knowledge-banks/` (6 files)

**Validation System:**
- Validator: `lib/validation/validator.ts` - PRD-SPEC compliance checking
- Types: `lib/validation/types.ts` - `ProjectValidationData`, gate definitions
- Used in Quick Start pipeline and LangGraph `check-prd-spec` node

**Diagram Generation:**
- Generators: `lib/diagrams/generators.ts` - Mermaid diagram generation and syntax cleaning
- Beautification: `lib/diagrams/beautiful-mermaid.ts` - Mermaid rendering enhancement

## Future Integrations (Planned but Not Implemented)

- **Supabase Vector Store** (`SUPABASE_URL`, `SUPABASE_PRIVATE_KEY`) - Semantic search
- **Upstash Redis** (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) - Caching
- **Sentry** (`SENTRY_DSN`, `SENTRY_AUTH_TOKEN`) - Error tracking

---

*Integration audit: 2026-02-08*
