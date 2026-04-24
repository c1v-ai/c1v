<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# Product Helper

AI-native PRD generation tool that teaches systems engineering methodology while guiding users through professional requirements creation.

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

All 4 system-design routes read from `(project as any).projectData?.intakeState?.extractedData?.<module>`. **TODO:** the `any` cast is a type hole — type it properly when extending the shape. Single `extractedData` blob — not separate artifacts per module. Crawley pivot / v2 pipeline must EXTEND this shape (add `extractedData.decisionNetwork`, `.formFunction`, `.fmea`), not replace it.

## Dev Quirks

- Dev server: from `apps/product-helper/` run `pnpm dev` (Turbopack; port 3000). Monorepo-root alternative: `pnpm dev --filter=product-helper`.
- Tests: `jest + ts-jest` (not vitest). Run from `apps/product-helper/` with format-valid stub env vars — `lib/config/env.ts` enforces prefixes + lengths and now requires `OPENROUTER_API_KEY`. Minimum passing recipe: `POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub BASE_URL=http://localhost:3000 npx jest <path>`. The old all-`stub` recipe fails at import time. For scripts that hit the live DB (ingest-kbs, verify-t3), source `.env.local` instead: `set -a; source .env.local; set +a; POSTGRES_URL=... pnpm tsx scripts/<name>.ts`.
- Regenerate JSON schemas: `pnpm tsx lib/langchain/schemas/generate-all.ts` → emits `schemas/generated/{,module-2}/*.schema.json`.
- Module 2 phase Zod lives in `lib/langchain/schemas/module-2/` — each phase extends `phaseEnvelopeSchema` from `_shared.ts`, registers in `module-2/index.ts`.
- Zod `.describe("x-ui-surface=page:/... | section:... | internal:...")` convention drives frontend routing from schema metadata (round-trips through `zod-to-json.ts`).
- Zod `.refine()` + `.extend()` drops the refinement. Unwrap with `.innerType()`, extend, re-apply via `.superRefine()`. Pattern: `applyNumericMathGate` in `schemas/module-2/requirements-table-base.ts`.
- Stale `.next` after dev-server port change → `/manifest.webmanifest` returns 500 ENOENT → `rm -rf .next && pnpm dev`.
- One-off scripts: `scripts/<name>.ts`, run via `pnpm tsx scripts/<name>.ts`.
