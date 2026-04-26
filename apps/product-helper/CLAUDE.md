<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# Product Helper

AI-native PRD generation tool that teaches systems engineering methodology while guiding users through professional requirements creation.

> **Design contract:** [`DESIGN.md`](./DESIGN.md) is the source-of-truth for design tokens (colors, typography, spacing, radius) and component patterns. Extracted from the live deploy at prd.c1v.ai. Match exactly when writing UI — no liberties with CSS, no interpretation. If a token in DESIGN.md disagrees with code, the discrepancy is a finding to surface, not silently reconcile.

## Tech Stack

- **Framework:** Next.js 15 (App Router, RSC, Turbopack)
- **AI/Agents:** LangChain.js + LangGraph + `@langchain/anthropic` (Claude Sonnet 4.5)
- **Database:** PostgreSQL via Drizzle ORM, hosted on Supabase
- **Auth:** Custom JWT (jose) + bcryptjs, middleware in `middleware.ts`
- **UI:** Tailwind CSS 4 + Radix UI + shadcn/ui + Lucide icons
- **Diagrams:** Mermaid.js for context/use-case/architecture diagrams
- **Testing:** Jest (456 unit tests) + Playwright (E2E)
- **Payments:** Stripe integration + credit-based usage gating
- **MCP:** JSON-RPC 2.0 server with 17 tools for IDE integration

## Architecture

### Agent System (`lib/langchain/agents/`)
- `intake/` - Conversational intake flow (chat-based PRD creation)
- `extraction-agent.ts` - Extracts structured data from conversations
- `schema-extraction-agent.ts` - Database schema generation
- `tech-stack-agent.ts` - Technology recommendations
- `user-stories-agent.ts` - User story generation
- `api-spec-agent.ts` - OpenAPI spec generation
- `infrastructure-agent.ts` - Infrastructure recommendations
- `guidelines-agent.ts` - Coding guidelines generation

### MCP Server (`lib/mcp/`)
- 17 tools: 7 core + 4 generator + 6 unique
- API key auth with rate limiting (100 req/min)
- Endpoint: `app/api/mcp/[projectId]/route.ts`
- Export generators: SKILL.md and CLAUDE.md for IDE integration

### Educational Content System (Phase 12 - Active)
- **Knowledge Banks:** `.planning/phases/12-project-explorer/knowledge-banks/` (6 files)
- **Components:** `components/education/` (thinking-state, tooltips)
- **Data/Types:** `lib/education/knowledge-bank.ts`
- **Methodology:** 6-step PRD flow: Context Diagram -> Use Case Diagram -> Scope Tree -> UCBD -> Functional Requirements -> SysML Activity Diagram

### Project Artifacts Table (`lib/db/schema/project-artifacts.ts`)

Per-tenant artifact persistence for synthesis outputs. Replaces the previous "single `extractedData` blob" pattern for synthesis-stage artifacts (legacy M0–M2 intake data still lives in `extractedData`; M3–M8 + synthesis live here).

- **Shape:** one row per `(project_id, artifact_kind)`. Columns include `synthesis_status` (`pending` | `running` | `succeeded` | `failed` | `needs_user_input`), `sha256` (content hash for idempotency), `storage_url` (signed URL to Supabase Storage), `inputs_hash` (deterministic re-run key), `created_at`, `updated_at`.
- **RLS:** tenant-scoped via `project_id` → `projects.organization_id` → session role. Read access is RLS-gated; write access is service-role only (sidecar writer).
- **Sidecar writer pattern:** TA3's Cloud Run Python sidecar (`services/python-sidecar/orchestrator.py`) owns writes — it renders the artifact, uploads to Storage, and updates the row via service-role. TA1 owns the table schema + RLS + read-side queries (`getLatestSynthesis`, `getProjectArtifacts`).
- **Query helpers:** `apps/product-helper/lib/db/queries.ts` exports `getLatestSynthesis(projectId)` and `getProjectArtifacts(projectId)` — both honor RLS.

### Open-Question Chat Bridge (`lib/chat/system-question-bridge.ts`)

Transport for system-generated open questions (M2 NFR clarifications, QFD disambiguations, FMEA risk follow-ups) into the user-facing chat thread.

- **Producers (v2.1):** M2 NFR emitter (when `final_confidence < 0.90`), HoQ emitter (M6, on conflicting customer-engineering signals), FMEA-residual emitter (M8.b, on unresolved risk).
- **Producers (v2.2):** Wave E `surface-gap.ts` (engine-driven gap-fill).
- **Bridge contract:** `emitOpenQuestion(input)` validates against `system-question-bridge.types.ts` Zod, persists into the chat thread (assistant message), and updates the open-questions ledger.
- **Ledger keys:** `extractedData.openQuestions.{requirements | qfdResolved | riskResolved}`. Each entry: `{ id, question, source, status: 'open' | 'resolved' | 'deferred', resolvedBy?, resolvedAt? }`.
- **Latency target:** p95 < 2s end-to-end (emit → chat row visible). Anchored by EC-V21-A.4.
- **Wave A ↔ Wave E handshake:** the bridge is the SHARED transport. Wave A producers ship in v2.1; Wave E `surface-gap.ts` producer ships in v2.2. See `plans/v21-outputs/ta1/handshake-spec.md` for the full contract.

### Key Directories
```
app/
  (marketing)/          # Public landing page (shipped Feb 22, 2026)
  (dashboard)/          # Authenticated pages (home, projects, connections, chat)
  (login)/              # Auth pages (sign-in, sign-up, forgot/reset password)
  api/                  # Route handlers (chat, mcp, projects, stripe, team, user)
components/
  marketing/            # Landing page (9 components: hero, pricing, etc.)
  chat/                 # Chat UI (window, input, bubble, markdown)
  project/              # Project detail (chat panel, explorer, header)
  projects/             # Project list (card, form, prd-overview)
  connections/          # IDE/GitHub integration setup
  onboarding/           # Welcome flow + quick start
  education/            # Tooltips, thinking state
  diagrams/             # Mermaid diagram viewer
  ui/                   # shadcn/ui base components
lib/
  auth/                 # JWT session management
  db/                   # Drizzle schema, migrations, queries
  langchain/            # Agents, graphs, quick-start orchestrator
  mcp/                  # MCP server, tools, auth, rate limiting
  education/            # Reference data (industry, budget, market patterns)
  diagrams/             # Mermaid diagram generators
  payments/             # Stripe client + server actions
  validation/           # PRD validation rules
  email/                # Resend email client + templates
```

### Credit System (`lib/db/queries.ts`)
- `checkAndDeductCredits(teamId, amount)` — atomic check-and-deduct with race-safe WHERE clause
- Free tier: 2,500 credits (Quick Start=1250, chat=5, regen=100)
- Paid tier: 999,999 credits (effectively unlimited)
- Credits reset on subscription change (active→0/999999, canceled→0/2500)
- 402 responses handled in Quick Start dialog (upgrade prompt) and chat (toast with upgrade link)
- Credits display: User dropdown shows usage bar (free) or plan name (paid); Account settings page shows Usage & Plan card with progress bar and upgrade/manage CTA

### Synthesis Pipeline (v2.1 — Wave A shipped Apr 25, 2026)

Vercel-side kickoff + status surface for the Cloud Run sidecar (`services/python-sidecar/`). Boundary locked by **D-V21.24**: Vercel hosts LangGraph orchestration and all LLM calls; the sidecar is per-artifact rendering only.

- **Routes:**
  - `POST /api/projects/[id]/synthesize` — deducts 1000 credits (D-V21.10), idempotent within a 5-min window, pre-creates 7 `synthesis_status='pending'` rows, fires the LangGraph kickoff via Next.js `after()`. Returns 202 with `{synthesis_id, expected_artifacts, status_url}`.
  - `GET /api/projects/[id]/synthesize/status` — per-artifact poll with signed URLs for ready rows. Target < 100ms p95.
  - `GET /api/projects/[id]/artifacts/manifest` — merges legacy filesystem manifest with v2.1 `dbArtifacts`. Versioned via `manifest_contract_version: 'v1'` (canonical contract: `plans/v21-outputs/ta3/manifest-contract.md`).
- **Helpers:**
  - `lib/billing/synthesis-tier.ts` — `checkSynthesisAllowance(teamId)`; Wave-A pre-stub. Env var `SYNTHESIS_FREE_TIER_GATE` = `log_only` (default) | `enabled` | `disabled`. TB1 ships the real DB-backed implementation and flips the default to `enabled`.
  - `lib/storage/supabase-storage.ts` — `getSignedUrl(storagePath, ttl?, cache?)`. 30-day TTL per D-V21.08. Per-request cache is mandatory; module-scoped caches would leak signed URLs across tenants.
  - `lib/synthesis/artifacts-bridge.ts` — TA1 ↔ TA3 indirection over `project_artifacts`. Single-edit point: when TA1's Drizzle queries land, this file collapses to a re-export. `EXPECTED_ARTIFACT_KINDS` is the canonical list (7 kinds; sidecar may emit optional extras).
  - `lib/synthesis/kickoff.ts` — fire-and-forget LangGraph entry. TA1's `langgraph-wirer` owns per-node `POST /run-render` calls.

**Failure semantics:** the sidecar always returns HTTP 200 (per-artifact `ok: false` for failures). The 5xx surface is reserved for malformed requests. Status route degrades gracefully when TA1's queries module is missing — empty `dbArtifacts` rather than a 500.

**Manifest contract version:** if you change the `/artifacts/manifest` response shape, follow the bump rules in `plans/v21-outputs/ta3/manifest-contract.md` §2 — TA2's download dropdown pins to `v1` and breaks loudly on a `v2` shape change.

## Conventions

- **API routes:** `app/api/[domain]/[id]/route.ts` pattern
- **Components:** Domain-grouped in `components/[domain]/`
- **Database:** Drizzle ORM with `lib/db/schema/` for types, validators, migrations
- **Env validation:** `lib/config/env.ts` - requires `POSTGRES_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`
- **Tests:** Co-located `__tests__/` directories next to source files
- **LLM provider:** Anthropic Claude via `@langchain/anthropic` (not OpenAI)
- **Route groups:** `(marketing)` = public, `(dashboard)` = authenticated, `(login)` = auth flows

## Deployed Features

- **Marketing Landing Page** (Feb 22, 2026) — 9 components, framer-motion animations, public at `/`
- **Credit System** (Feb 19, 2026) — atomic check-and-deduct, 3 tiers (Free/Base/Plus), 10% grace
- **Connections Page** (Feb 18, 2026) — IDE setup wizard, API key management, project file downloads
- **MCP Server** — 17 tools for IDE integration (CLAUDE.md + SKILL.md export)
- **Quick Start Pipeline** — SSE-streamed 5-step PRD generation from one sentence
- **Stripe Billing** — checkout, webhooks, plan management (Free/Base/Plus tiers)
- **System-Design Viewers** — 5 routes at `/projects/[id]/system-design/{decision-matrix,ffbd,qfd,interfaces}/page.tsx` + `/diagrams` (Mermaid). Data source: `project.projectData.intakeState.extractedData.{decisionMatrix,ffbd,qfd,interfaces}`. Viewer components in `components/system-design/` + `components/diagrams/diagram-viewer.tsx`.
- **Requirements & Backend Section Viewers** — 7 routes at `/projects/[id]/requirements/{problem-statement,system-overview,goals-metrics,user-stories,architecture,tech-stack,nfr}/` + 4 backend routes at `/projects/[id]/backend/{schema,api-spec,guidelines,infrastructure}/`. 13 section components in `components/projects/sections/`.
- **Artifact Pipeline component** — `components/project/overview/artifact-pipeline.tsx`. v2 plan extends this to read `artifacts.manifest.jsonl` download links (manifest-read only).
- **Synthesis Pipeline kickoff** (Wave A — Apr 25, 2026) — `POST /api/projects/[id]/synthesize` + `GET /synthesize/status` + extended `GET /artifacts/manifest`. Boundary D-V21.24: Vercel orchestrates, Cloud Run renders. Helpers in `lib/billing/synthesis-tier.ts`, `lib/storage/supabase-storage.ts`, `lib/synthesis/{artifacts-bridge,kickoff}.ts`. Sidecar at `services/python-sidecar/` (separate README). Manifest contract v1 frozen at `plans/v21-outputs/ta3/manifest-contract.md`.

## UI Freeze

Active for v2 cycle. See `plans/c1v-MIT-Crawley-Cornell.md` §9 + v2 §15.5.

| Status | Path | Notes |
|---|---|---|
| 🔒 Frozen | `components/system-design/decision-matrix-viewer.tsx` | No edits without explicit unfreeze |
| 🔒 Frozen | `components/system-design/ffbd-viewer.tsx` | " |
| 🔒 Frozen | `components/system-design/qfd-viewer.tsx` | " |
| 🔒 Frozen | `components/system-design/interfaces-viewer.tsx` | " |
| 🔒 Frozen | `components/diagrams/diagram-viewer.tsx` | " |
| 🔒 Frozen | `app/(dashboard)/projects/[id]/system-design/**/page.tsx` | All 4 pages |
| 🟡 Semi | `components/project/overview/artifact-pipeline.tsx` | Manifest-read extension only |

## System-Design Data Path

**Pre-Wave-A (legacy):** all 4 system-design routes read from `(project as any).projectData?.intakeState?.extractedData?.<module>`. Single `extractedData` blob — not separate artifacts per module.

**Post-Wave-A (v2.1):** synthesis artifacts (M3–M8 + architecture-recommendation keystone) now live in the `project_artifacts` table (see `### Project Artifacts Table` above). Routes read via `getLatestSynthesis(projectId)` / `getProjectArtifacts(projectId)` from `lib/db/queries.ts`. Legacy M0–M2 intake data continues to live in `extractedData` (open-questions ledger, NFR scratch, intake state) — those reads are unchanged.

**TODO:** the `any` cast on `extractedData` is a type hole — type it properly when extending the shape. Crawley pivot / v2 pipeline EXTENDS the legacy shape (added `extractedData.openQuestions.{requirements | qfdResolved | riskResolved}` for the chat-bridge ledger); synthesis-stage shapes live on `project_artifacts` instead.

## Dev Quirks

- Dev server: from `apps/product-helper/` run `pnpm dev` (Turbopack; port 3000). Monorepo-root alternative: `pnpm dev --filter=product-helper`.
- Tests: `jest + ts-jest` (not vitest). Run from `apps/product-helper/` with format-valid stub env vars — `lib/config/env.ts` enforces prefixes + lengths and now requires `OPENROUTER_API_KEY`. Minimum passing recipe: `POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub BASE_URL=http://localhost:3000 npx jest <path>`. The old all-`stub` recipe fails at import time. For scripts that hit the live DB (ingest-kbs, verify-t3), source `.env.local` instead: `set -a; source .env.local; set +a; POSTGRES_URL=... pnpm tsx scripts/<name>.ts`.
- Regenerate JSON schemas: `pnpm tsx lib/langchain/schemas/generate-all.ts` → emits `schemas/generated/{,module-2}/*.schema.json`.
- Module 2 phase Zod lives in `lib/langchain/schemas/module-2/` — each phase extends `phaseEnvelopeSchema` from `_shared.ts`, registers in `module-2/index.ts`.
- Zod `.describe("x-ui-surface=page:/... | section:... | internal:...")` convention drives frontend routing from schema metadata (round-trips through `zod-to-json.ts`).
- Zod `.refine()` + `.extend()` drops the refinement. Unwrap with `.innerType()`, extend, re-apply via `.superRefine()`. Pattern: `applyNumericMathGate` in `schemas/module-2/requirements-table-base.ts`.
- Stale `.next` after dev-server port change → `/manifest.webmanifest` returns 500 ENOENT → `rm -rf .next && pnpm dev`.
- One-off scripts: `scripts/<name>.ts`, run via `pnpm tsx scripts/<name>.ts`.
