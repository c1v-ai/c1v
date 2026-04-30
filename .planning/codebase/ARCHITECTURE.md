# c1v Monorepo — Architecture

> Generated 2026-04-28. Source-of-truth is the live codebase; refresh on major wave completions.

---

## 1. System Overview

c1v is a polyglot monorepo managed with **Turborepo + pnpm workspaces**. The primary shipped product is `apps/product-helper` — an AI-native PRD + system-design generation tool deployed at `prd.c1v.ai`. A Python sidecar (`services/python-sidecar`) handles per-artifact rendering and is deployed separately on Google Cloud Run.

```
Browser / IDE
     │
     ▼
┌─────────────────────────────────────────┐
│  apps/product-helper  (Vercel)          │
│  Next.js 15 App Router + LangGraph      │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  RSC pages  │  │  /api route      │  │
│  │  (dashboard)│  │  handlers        │  │
│  └─────────────┘  └──────────────────┘  │
│         │                │              │
│  LangGraph agents        │ MCP server   │
│  (lib/langchain/)        │ (lib/mcp/)   │
└─────────────────────────────────────────┘
     │                         │
     ▼                         ▼
┌──────────────┐       ┌─────────────────┐
│  Supabase    │       │  Cloud Run      │
│  PostgreSQL  │       │  python-sidecar │
│  + RLS       │       │  (artifacts)    │
└──────────────┘       └─────────────────┘
```

---

## 2. Monorepo Layout

```
c1v/
├── apps/
│   ├── product-helper/          # Primary Next.js 15 app (LIVE)
│   ├── c1v-identity/            # Python/FastAPI identity CDP (scaffold)
│   └── qa-bot/                  # QA tooling app
├── services/
│   └── python-sidecar/          # Cloud Run artifact renderer (Python)
├── packages/                    # (aspirational — not yet populated)
├── scripts/                     # Monorepo-level scripts
├── plans/                       # Architecture plans + handoff docs
├── system-design/               # Self-application SD run outputs
├── turbo.json                   # Turborepo task graph
└── pnpm-workspace.yaml
```

**Reality note:** `packages/*`, `services/` (except python-sidecar), `apps/web`, and `apps/admin` do not exist yet. The monorepo structure above reflects the aspirational vision in `CLAUDE.md`; only the entries listed above are real today.

---

## 3. apps/product-helper — Internal Architecture

### 3.1 Route Groups (Next.js App Router)

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| `(marketing)` | `/` | public | Landing page, pricing, how-it-works |
| `(login)` | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | public | Auth flows |
| `(dashboard)` | `/home`, `/projects/*`, `/dashboard/*`, `/account`, `/chat` | protected | Authenticated product surface |

Protected routes are enforced in `middleware.ts` via JWT cookie verification (`lib/auth/session.ts`). Session cookie is refreshed on GET requests only. Security headers (OWASP) are applied to all responses.

### 3.2 API Route Map

```
/api/
├── chat/projects/[projectId]/          POST  Streaming chat (SSE)
│   └── save/                           POST  Persist chat state
├── mcp/[projectId]/                    POST  MCP JSON-RPC 2.0 server (17 tools)
├── projects/                           GET/POST  List / create projects
│   └── [id]/
│       ├── (GET/PATCH/DELETE)               Project CRUD
│       ├── synthesize/                 POST  Fire synthesis pipeline (202)
│       │   └── status/                 GET   Per-artifact poll
│       ├── artifacts/manifest/         GET   Merged artifact manifest (v1)
│       ├── artifacts/[kind]/retry/     POST  Re-trigger single artifact
│       ├── api-spec/                   GET/POST  OpenAPI spec generation
│       ├── explorer/                   GET   Project data explorer
│       ├── export/                     GET   Export bundle
│       │   └── bundle/                 GET   ZIP bundle
│       ├── exports/claude-md/          GET   Export CLAUDE.md
│       ├── exports/skill/              GET   Export SKILL.md
│       ├── guidelines/                 GET/POST  Coding guidelines
│       ├── infrastructure/             GET/POST  Infra spec
│       ├── keys/                       GET/POST  API keys
│       │   └── [keyId]/               DELETE  Revoke key
│       ├── quick-start/               POST  SSE quick-start pipeline
│       ├── review-status/             GET/PATCH  Section review state
│       ├── sections/status/           GET   Section completion
│       ├── stories/                   GET/POST  User stories
│       │   └── [storyId]/            PATCH/DELETE  Story CRUD
│       ├── synthesize/                POST  (same as above)
│       ├── tech-stack/               GET/POST  Tech stack agent
│       └── validate/                  POST  PRD validation
├── schemas/module-4/                  GET   M4 JSON schemas
├── signup-signals/[userId]/           GET/POST  User intent signals (M0)
├── stripe/
│   ├── checkout/                      POST  Create checkout session
│   └── webhook/                       POST  Stripe event handler
├── team/                              GET/POST  Team management
└── user/                              GET/PATCH  User profile
```

### 3.3 LangGraph Agent System (`lib/langchain/`)

The agent system is organized into three layers:

**Engines (`lib/langchain/engines/`)** — low-level, stateless, reusable:
- `nfr-engine-interpreter.ts` — rule engine for NFR evaluation (Wave-E core)
- `wave-e-evaluator.ts` — 2-band confidence wrapper (v2.2 contract pin, LOCKED)
- `predicate-dsl.ts` — boolean predicate evaluator for engine rules
- `kb-embedder.ts` / `kb-search.ts` — KB vector embedding + semantic search
- `model-router.ts` — LLM routing (Anthropic primary / OpenRouter fallback)
- `openrouter-client.ts` — OpenRouter API client
- `audit-writer.ts` — decision audit log writer
- `context-resolver.ts` — project context resolver for agent prompts
- `fail-closed-runner.ts` — safe agent runner with failure semantics
- `surface-gap.ts` — Wave E gap-fill engine (open-question emitter)
- `pii-redactor.ts` / `prompt-injection-detector.ts` — safety filters
- `artifact-reader.ts` / `engine-loader.ts` — artifact + engine loading

**Agents (`lib/langchain/agents/`)** — domain-specific LangChain runnables:
- `intake/` — conversational intake flow
- `extraction-agent.ts` — structured data extraction from chat
- `schema-extraction-agent.ts` — DB schema generation
- `tech-stack-agent.ts` — technology recommendations
- `user-stories-agent.ts` — user story generation from use cases
- `api-spec-agent.ts` / `api-spec-openapi-export.ts` — OpenAPI spec
- `infrastructure-agent.ts` — infrastructure spec generation
- `guidelines-agent.ts` — coding conventions generation
- `decision-matrix-agent.ts` — M4 decision matrix
- `ffbd-agent.ts` — M3 FFBD functional breakdown
- `interfaces-agent.ts` — M7 interface specs
- `qfd-agent.ts` — M6 Quality Function Deployment
- `quick-start-synthesis-agent.ts` — fast PRD from single sentence
- `system-design/` — system design specialist agents

**Graphs (`lib/langchain/graphs/`)** — LangGraph stateful workflows:
- `intake-graph.ts` — main conversational intake LangGraph
- `nodes/` — 20+ graph nodes (extract-data, generate-*, analyze-response, etc.)
- `contracts/` — frozen API contracts (NFR engine v1, inputs-hash)
- `channels.ts` / `edges.ts` / `checkpointer.ts` — graph wiring

**Schemas (`lib/langchain/schemas/`)** — Crawley-discipline Zod schemas (TC1 Wave C):
- `module-2/` — 12 phase schemas (phase-0-ingest through phase-12)
- `module-3/` — 7 schemas (decomposition, FFBD, submodule flows)
- `module-4/` — 8 schemas (decision matrix, optimization, criterion weights)
- `module-5/` — 8 schemas (form/function inventory/taxonomy, concept mapping + `_matrix.ts` keystone)
- Registry: `CRAWLEY_SCHEMAS` (10 phase artifacts) + `CRAWLEY_MATRIX_KEYSTONE` exported from `index.ts`

### 3.4 Synthesis Pipeline (v2.1 — Wave A)

Boundary: **Vercel hosts LangGraph orchestration + all LLM calls; Cloud Run renders per-artifact only** (D-V21.24).

```
POST /api/projects/[id]/synthesize
  → deducts 1000 credits
  → pre-creates 7 project_artifacts rows (status='pending')
  → fires kickoff via Next.js after()
  → returns 202 {synthesis_id, expected_artifacts, status_url}

GET /api/projects/[id]/synthesize/status
  → per-artifact poll, signed URLs for ready rows (<100ms p95 target)

GET /api/projects/[id]/artifacts/manifest
  → merges filesystem manifest.jsonl + db project_artifacts rows
  → manifest_contract_version: 'v1' (FROZEN)
```

Key helpers:
- `lib/synthesis/kickoff.ts` — fire-and-forget LangGraph entry
- `lib/synthesis/artifacts-bridge.ts` — TA1↔TA3 indirection layer
- `lib/storage/supabase-storage.ts` — signed URL generation (30d TTL)
- `lib/billing/synthesis-tier.ts` — synthesis allowance gate

### 3.5 MCP Server (`lib/mcp/`)

JSON-RPC 2.0 server at `POST /api/mcp/[projectId]`. 17 tools: 7 core, 4 generator, 6 unique. API-key auth with rate limiting (100 req/min). Exports CLAUDE.md and SKILL.md for IDE integration.

### 3.6 Open-Question Chat Bridge (`lib/chat/system-question-bridge.ts`)

Transport for system-generated questions into the user chat thread. Producers: M2 NFR emitter (confidence < 0.90), HoQ emitter (conflicting signals), FMEA-residual emitter, Wave E `surface-gap.ts`. Bridge contract validated against Zod schemas in `system-question-bridge.types.ts`. Ledger at `extractedData.openQuestions.{requirements | qfdResolved | riskResolved}`.

---

## 4. Database Architecture

**Provider:** Supabase (PostgreSQL 16). ORM: Drizzle (`drizzle-orm`). Migrations: 25 SQL files in `lib/db/migrations/`.

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Auth users (email/password JWT) |
| `teams` | Multi-user workspaces + Stripe subscription |
| `team_members` | User↔team membership + roles |
| `activity_logs` | Audit trail for team actions |
| `invitations` | Team invite flow |
| `password_reset_tokens` | Secure reset tokens |
| `projects` | PRD projects (name, vision, type, stage, status) |
| `project_data` | JSON blobs per project (actors, use-cases, NFR, intake state) |
| `artifacts` | Mermaid diagram artifacts |
| `conversations` | Chat messages (supports `kind='pending_answer'` for open questions) |
| `graph_checkpoints` | LangGraph state persistence |
| `user_stories` | Generated user stories with acceptance criteria |
| `api_keys` | Per-project API keys for MCP auth |

### Extended Schema Tables (Drizzle schema files in `lib/db/schema/`)

| File | Table(s) | Purpose |
|------|----------|---------|
| `project-artifacts.ts` | `project_artifacts` | Per-artifact synthesis rows (M3–M8 + keystone). Tenant-scoped RLS. |
| `kb-chunks.ts` | `kb_chunks` | Knowledge-bank vector chunks (pgvector) |
| `atlas-entries.ts` | `atlas_entries` | KB-9 public company stack observations |
| `crawley.ts` | Crawley schema tables | Phase artifact rows from Crawley SD modules |
| `decision-audit.ts` | `decision_audit` | Engine decision audit log |
| `project-run-state.ts` | `project_run_state` | Synthesis run state (Wave 4) |
| `project-entry-states.ts` | `project_entry_states` | M0 project entry state machine |
| `user-signals.ts` | `user_signals` | M0 signup intent signals |
| `v2-types.ts` / `v2-validators.ts` | (types only) | v2 artifact shape + Zod validators |

### RLS Policy Summary

- `project_artifacts`: tenant-scoped via `project_id → projects.organization_id`. Reads are RLS-gated; writes are service-role only (python-sidecar).
- `projects`: RLS enabled but zero tenant policies as of v2 close — gap logged in `plans/post-v2-followups.md` (P3 security pass).
- `project_run_state`: 5 RLS policies (Wave 4 / T6).

---

## 5. Auth Architecture

Custom JWT via `jose` + `bcryptjs`. No NextAuth / Clerk.

- Session cookie (`HttpOnly`, rolling expiry on GET requests)
- `lib/auth/session.ts` — `signToken` / `verifyToken`
- `middleware.ts` — route protection on `/dashboard`, `/projects`, `/home`, `/account`
- `lib/auth/` — login actions, password reset, team invite flows

---

## 6. Credit + Billing System

- **Provider:** Stripe
- **Tiers:** Free (2,500 credits), Base, Plus (999,999 credits = effectively unlimited)
- **Atomic deduction:** `checkAndDeductCredits(teamId, amount)` — race-safe WHERE clause
- **Synthesis cost:** 1,000 credits per synthesis run (D-V21.10)
- **Quick Start cost:** 1,250 credits
- **Chat:** 5 credits/message
- **Regenerate:** 100 credits
- **402 handling:** upgrade prompt in Quick Start dialog + chat toast

---

## 7. services/python-sidecar (Cloud Run)

Separate deployment. Handles per-artifact rendering for the synthesis pipeline. Key files:
- `orchestrator.py` — main entry; receives render jobs, calls LLM if needed, writes to Supabase Storage + updates `project_artifacts` row via service-role
- `run-single-artifact.py` — standalone artifact runner
- `scripts/` — artifact-specific render scripts
- `cloud-run.yaml` / `warm-up.yaml` — GCP deployment manifests

Failure contract: always returns HTTP 200; per-artifact `ok: false` for failures. The 5xx surface is reserved for malformed requests only.

---

## 8. CI / Build System

- **Turborepo** task graph: `build → lint → test`. All LangChain packages are `serverExternalPackages` (Node.js native ESM required).
- **GitHub Actions** (`.github/workflows/`): CI TypeScript, verify-tree-pair-consistency, quarterly-drift-check (Crawley schema drift).
- **Vercel** deployment for `apps/product-helper`. Any new build-time env var must be declared in BOTH Vercel settings AND `turbo.json`'s `env[]` array.

---

## 9. Key Architectural Decisions (Locked)

| ID | Decision |
|----|----------|
| D-V21.24 | Vercel boundary: LangGraph + all LLM calls stay on Vercel; Cloud Run is per-artifact rendering only |
| D-V21.10 | Synthesis costs 1,000 credits per run |
| D-V21.08 | Signed URL TTL = 30 days; per-request cache mandatory (no module-scoped cache — tenant leak risk) |
| Wave-E LOCKED | Two-band confidence thresholds: 0.90 = ready, 0.60–0.90 + llm_assist = refine, <0.60 = needs_user_input |
| TC1 LOCKED | NFR engine contract version = `'v1'` (frozen; bumping requires ADR) |
| Option Y | `mathDerivationMatrixSchema` stays M5-local until 3rd non-M5 consumer emerges |

---

## 10. Deployment Targets

| Service | Platform | URL |
|---------|----------|-----|
| `apps/product-helper` | Vercel | `prd.c1v.ai` |
| `services/python-sidecar` | Google Cloud Run | (internal) |
| PostgreSQL | Supabase | project `yxginqyxtysjdkeymnon` |
| Local dev DB | Docker Supabase | `localhost:54322` |
