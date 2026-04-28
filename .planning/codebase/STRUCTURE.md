# c1v Monorepo — File Structure Reference

> Generated 2026-04-28. Lists real on-disk structure only. Aspirational/future paths are noted inline.

---

## Monorepo Root

```
c1v/
├── apps/
│   ├── product-helper/              # Next.js 15 app (PRIMARY — deployed)
│   ├── c1v-identity/                # Python/FastAPI identity CDP (scaffold)
│   └── qa-bot/                      # QA tooling (Next.js)
├── services/
│   └── python-sidecar/              # Cloud Run artifact renderer
├── packages/                        # (aspirational — empty today)
├── scripts/                         # Monorepo-level utility scripts
├── plans/                           # Architecture plans, handoffs, v2 outputs
├── system-design/                   # c1v self-application SD run outputs
├── tooling/                         # Shared tooling config
├── infra/                           # Infrastructure (partial scaffold)
├── docs/                            # Docs (partial)
├── .github/workflows/               # CI workflows
├── turbo.json                       # Turborepo config
├── pnpm-workspace.yaml
├── package.json
├── CLAUDE.md                        # Monorepo-level agent instructions
├── AGENTS.md
├── GEMINI.md
└── STATUS.md
```

---

## apps/product-helper/

```
apps/product-helper/
├── app/                             # Next.js App Router root
│   ├── (marketing)/                 # Public route group
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── (login)/                     # Auth route group
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/                 # Authenticated route group
│   │   ├── layout.tsx
│   │   ├── home/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── test-chat/page.tsx
│   │   ├── account/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── about/methodology/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── general/page.tsx
│   │   │   ├── activity/page.tsx
│   │   │   └── security/page.tsx
│   │   └── projects/
│   │       ├── page.tsx             # Project list
│   │       ├── new/page.tsx         # New project form
│   │       └── [id]/
│   │           ├── page.tsx         # Project overview
│   │           ├── chat/page.tsx
│   │           ├── edit/page.tsx
│   │           ├── generate/page.tsx
│   │           ├── data/page.tsx
│   │           ├── diagrams/page.tsx
│   │           ├── connections/page.tsx
│   │           ├── settings/page.tsx
│   │           ├── synthesis/page.tsx
│   │           ├── requirements/
│   │           │   ├── page.tsx
│   │           │   ├── problem-statement/page.tsx
│   │           │   ├── system-overview/page.tsx
│   │           │   ├── goals-metrics/page.tsx
│   │           │   ├── user-stories/page.tsx
│   │           │   ├── architecture/page.tsx
│   │           │   ├── tech-stack/page.tsx
│   │           │   ├── nfr/page.tsx
│   │           │   ├── data-flows/page.tsx
│   │           │   └── open-questions/page.tsx
│   │           ├── backend/
│   │           │   ├── schema/page.tsx
│   │           │   ├── api-spec/page.tsx
│   │           │   ├── guidelines/page.tsx
│   │           │   └── infrastructure/page.tsx
│   │           └── system-design/
│   │               ├── decision-matrix/page.tsx
│   │               ├── decision-network/page.tsx
│   │               ├── ffbd/page.tsx
│   │               ├── fmea/page.tsx
│   │               ├── form-function-map/page.tsx
│   │               ├── interfaces/page.tsx
│   │               └── qfd/page.tsx
│   ├── api/                         # Route handlers (see ARCHITECTURE.md §3.2)
│   │   ├── chat/projects/[projectId]/route.ts
│   │   ├── mcp/[projectId]/route.ts
│   │   ├── projects/route.ts
│   │   ├── projects/[id]/**/route.ts  (16 route files)
│   │   ├── schemas/module-4/route.ts
│   │   ├── signup-signals/[userId]/route.ts
│   │   ├── stripe/checkout/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   ├── team/route.ts
│   │   └── user/route.ts
│   ├── actions/                     # Next.js server actions
│   ├── layout.tsx                   # Root layout
│   ├── globals.css
│   ├── theme.css
│   ├── manifest.ts
│   ├── not-found.tsx
│   └── offline/
│
├── components/
│   ├── marketing/                   # Landing page (9 components)
│   │   └── hero.tsx, pricing.tsx, etc.
│   ├── chat/                        # Chat UI
│   │   └── window, input, bubble, markdown-renderer
│   ├── project/                     # Project detail components
│   │   ├── overview/
│   │   │   └── artifact-pipeline.tsx  # Synthesis pipeline viewer (semi-frozen)
│   │   ├── chat-panel.tsx
│   │   ├── explorer.tsx
│   │   └── header.tsx
│   ├── projects/                    # Project list components
│   │   └── card, form, prd-overview
│   ├── system-design/               # System-design viewers (FROZEN — UI Freeze active)
│   │   ├── decision-matrix-viewer.tsx  # FROZEN
│   │   ├── ffbd-viewer.tsx             # FROZEN
│   │   ├── qfd-viewer.tsx              # FROZEN
│   │   └── interfaces-viewer.tsx       # FROZEN
│   ├── diagrams/
│   │   └── diagram-viewer.tsx          # FROZEN
│   ├── connections/                 # IDE/GitHub integration setup
│   ├── onboarding/                  # Welcome flow + quick start
│   ├── education/                   # Tooltips, thinking state
│   ├── navigation/                  # Nav components
│   ├── quick-start/                 # Quick-start dialog
│   ├── requirements/                # Requirements section viewers
│   ├── synthesis/                   # Synthesis UI
│   ├── theme/                       # Theme provider/toggle
│   └── ui/                          # shadcn/ui base components
│
├── lib/
│   ├── auth/                        # JWT session management
│   │   └── session.ts, actions.ts, password-reset.ts
│   ├── billing/
│   │   └── synthesis-tier.ts        # Synthesis allowance gate
│   ├── cache/                       # Cache utilities
│   ├── chat/
│   │   ├── system-question-bridge.ts       # Open-question transport
│   │   └── system-question-bridge.types.ts # Zod contract
│   ├── config/
│   │   └── env.ts                   # Strict env validator (required at build time)
│   ├── constants/                   # App-wide constants
│   ├── db/
│   │   ├── drizzle.ts               # DB client
│   │   ├── schema.ts                # Primary Drizzle schema (users, teams, projects, etc.)
│   │   ├── schema/                  # Extended schema files (per-feature tables)
│   │   │   ├── atlas-entries.ts
│   │   │   ├── crawley.ts
│   │   │   ├── decision-audit.ts
│   │   │   ├── index.ts
│   │   │   ├── kb-chunks.ts
│   │   │   ├── project-artifacts.ts  # Synthesis artifact rows
│   │   │   ├── project-entry-states.ts
│   │   │   ├── project-run-state.ts
│   │   │   ├── user-signals.ts
│   │   │   ├── v2-types.ts
│   │   │   └── v2-validators.ts
│   │   ├── queries.ts               # Primary query helpers
│   │   ├── queries/                 # Extended query helpers
│   │   │   ├── decision-audit.ts
│   │   │   └── explorer.ts
│   │   ├── migrations/              # 25 SQL migrations (0000–0025)
│   │   ├── setup.ts
│   │   └── seed.ts
│   ├── diagrams/                    # Mermaid diagram generators
│   ├── education/                   # Reference data (industry, budget, market patterns)
│   ├── email/                       # Resend client + email templates
│   ├── eval/                        # Eval harness
│   │   ├── v2-eval-harness.ts       # LangSmith eval harness (fixture-replay fallback)
│   │   ├── system-question-bridge.ts
│   │   └── datasets/                # 300 graded examples (30/agent × 10 agents)
│   ├── export/                      # Export utilities
│   ├── hooks/                       # React hooks
│   ├── jobs/                        # Background job helpers
│   ├── langchain/
│   │   ├── agents/                  # Domain-specific LangChain agents
│   │   │   ├── intake/              # Conversational intake
│   │   │   │   └── orchestrator.ts
│   │   │   ├── api-spec/            # OpenAPI spec agent
│   │   │   ├── system-design/       # System design agents
│   │   │   ├── extraction-agent.ts
│   │   │   ├── schema-extraction-agent.ts
│   │   │   ├── tech-stack-agent.ts
│   │   │   ├── user-stories-agent.ts
│   │   │   ├── api-spec-agent.ts
│   │   │   ├── api-spec-openapi-export.ts
│   │   │   ├── infrastructure-agent.ts
│   │   │   ├── guidelines-agent.ts
│   │   │   ├── decision-matrix-agent.ts
│   │   │   ├── ffbd-agent.ts
│   │   │   ├── interfaces-agent.ts
│   │   │   ├── qfd-agent.ts
│   │   │   └── quick-start-synthesis-agent.ts
│   │   ├── engines/                 # Low-level stateless engines
│   │   │   ├── index.ts             # Barrel (Wave E API conventions)
│   │   │   ├── nfr-engine-interpreter.ts  # NFR rule engine
│   │   │   ├── wave-e-evaluator.ts  # 2-band wrapper (LOCKED v2.2)
│   │   │   ├── predicate-dsl.ts     # Boolean predicate evaluator
│   │   │   ├── kb-embedder.ts       # Vector embedding
│   │   │   ├── kb-search.ts         # Semantic KB search
│   │   │   ├── model-router.ts      # LLM routing
│   │   │   ├── openrouter-client.ts # OpenRouter API client
│   │   │   ├── audit-writer.ts      # Decision audit logger
│   │   │   ├── context-resolver.ts  # Project context resolver
│   │   │   ├── fail-closed-runner.ts
│   │   │   ├── surface-gap.ts       # Wave E gap-fill emitter
│   │   │   ├── pii-redactor.ts
│   │   │   ├── prompt-injection-detector.ts
│   │   │   ├── artifact-reader.ts
│   │   │   └── engine-loader.ts
│   │   ├── graphs/                  # LangGraph stateful workflows
│   │   │   ├── index.ts
│   │   │   ├── intake-graph.ts      # Main intake LangGraph
│   │   │   ├── channels.ts          # State channel definitions
│   │   │   ├── edges.ts             # Graph edge logic
│   │   │   ├── checkpointer.ts      # LangGraph checkpoint adapter
│   │   │   ├── types.ts
│   │   │   ├── utils.ts
│   │   │   ├── message-utils.ts
│   │   │   ├── nodes/               # ~20 graph node functions
│   │   │   │   ├── index.ts
│   │   │   │   ├── _persist-artifact.ts
│   │   │   │   ├── analyze-response.ts
│   │   │   │   ├── check-prd-spec.ts
│   │   │   │   ├── compute-next-question.ts
│   │   │   │   ├── extract-data.ts
│   │   │   │   ├── generate-artifact.ts
│   │   │   │   ├── generate-data-flows.ts
│   │   │   │   ├── generate-decision-matrix.ts
│   │   │   │   ├── generate-decision-network.ts
│   │   │   │   ├── generate-ffbd.ts
│   │   │   │   ├── generate-fmea-early.ts
│   │   │   │   ├── generate-fmea-residual.ts
│   │   │   │   ├── generate-form-function.ts
│   │   │   │   ├── generate-interfaces.ts
│   │   │   │   ├── generate-n2.ts
│   │   │   │   ├── generate-qfd.ts
│   │   │   │   ├── generate-response.ts
│   │   │   │   └── generate-synthesis.ts
│   │   │   └── contracts/           # Frozen API contracts
│   │   │       ├── inputs-hash.ts
│   │   │       └── nfr-engine-contract-v1.ts
│   │   ├── schemas/                 # Crawley Zod schemas (TC1 Wave C)
│   │   │   ├── index.ts             # CRAWLEY_SCHEMAS + CRAWLEY_MATRIX_KEYSTONE registry
│   │   │   ├── module-2/            # 12 phase schemas (M2 requirements)
│   │   │   ├── module-3/            # 7 schemas (FFBD + decomposition)
│   │   │   ├── module-4/            # 8 schemas (decision matrix)
│   │   │   ├── module-5/            # 8 schemas (form/function map + _matrix.ts keystone)
│   │   │   ├── atlas/               # Atlas schema
│   │   │   ├── build-projections.ts
│   │   │   ├── generate-all.ts      # JSON schema generator
│   │   │   ├── generated/           # Emitted *.schema.json files
│   │   │   ├── projections.ts
│   │   │   ├── synthesis/
│   │   │   └── zod-to-json.ts
│   │   ├── config.ts                # LangChain/LangSmith config
│   │   ├── prompts.ts               # Shared prompt templates
│   │   ├── schemas.ts               # Legacy schema barrel (pre-TC1; shadows new index)
│   │   └── utils.ts
│   ├── mcp/                         # MCP server (17 tools)
│   ├── observability/               # Logging + metrics
│   ├── payments/                    # Stripe client + server actions
│   ├── storage/
│   │   └── supabase-storage.ts      # Signed URL generation (30d TTL)
│   ├── synthesis/
│   │   ├── artifacts-bridge.ts      # TA1↔TA3 indirection layer
│   │   └── kickoff.ts               # LangGraph synthesis kickoff
│   ├── types/                       # Shared TypeScript types
│   ├── utils/                       # Utility functions
│   ├── utils.ts
│   └── validation/                  # PRD validation rules
│
├── scripts/                         # One-off scripts (run via pnpm tsx)
│   ├── artifact-generators/         # Python artifact generators (13 scripts)
│   ├── verify-t3.ts                 # T3 runtime verifier
│   ├── verify-t4a.ts, verify-t4b.ts, etc.
│   ├── verify-tree-pair-consistency.ts
│   └── quarterly-drift-check.ts     # Crawley schema drift monitor
│
├── __tests__/                       # Integration + E2E tests
│   └── build-all-headless.test.ts   # 14-artifact smoke test
│
├── .planning/                       # App-level planning + KBs
│   └── phases/
│       └── 13-Knowledge-banks-deepened/  # L1 KB corpus (6 KBs + _shared/)
│
├── middleware.ts                    # Auth + security headers
├── next.config.ts                   # Turbopack, serverExternalPackages
├── drizzle.config.ts
├── jest.config.ts
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── CLAUDE.md                        # App-level agent instructions
└── DESIGN.md                        # Brand/design tokens source-of-truth
```

---

## services/python-sidecar/

```
services/python-sidecar/
├── orchestrator.py          # Main Cloud Run entry point
├── run-single-artifact.py   # Standalone artifact runner
├── requirements.txt
├── Dockerfile
├── cloud-run.yaml           # GCP Cloud Run deployment manifest
├── warm-up.yaml             # Warm-up request config
├── scripts/                 # Per-artifact render scripts
└── __tests__/               # Sidecar tests
```

---

## apps/c1v-identity/ (scaffold)

```
apps/c1v-identity/
├── app/                     # (scaffold — not deployed)
├── lib/
├── package.json
├── CLAUDE.md
├── API-SPEC.md
└── PRD-v1.md
```

---

## plans/ (Key Files)

```
plans/
├── c1v-MIT-Crawley-Cornell.md           # v1 plan
├── c1v-MIT-Crawley-Cornell.v2.md        # v2 authoritative plan (SHIPPED 2026-04-24)
├── v2-release-notes.md                  # v2 close-out summary
├── post-v2-followups.md                 # Deferred backlog (projects RLS, etc.)
├── HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md
├── HANDOFF-2026-04-25-v2.1-fixup.md
├── v21-outputs/                         # Wave A/B/D outputs
│   ├── ta1/                             # TA1 (LangGraph/Vercel)
│   ├── ta2/                             # TA2 (frontend)
│   └── ta3/                             # TA3 (sidecar + manifest contract)
├── v22-outputs/                         # TC1 Wave C outputs
│   └── tc1/schemas-shipped.md
├── t4a-outputs/, t4b-outputs/, t5-outputs/, t6-outputs/, t7-outputs/, t11-outputs/
│   └── verification-report.md (per team)
├── kb-upgrade-v2/                       # L2 v2 artifacts (JSON + xlsx + pptx)
│   └── module-{1..8}/
├── v3_revised/                          # L3 v3 deltas (Apr 20 foundation reset)
└── research/
    └── crawley-book-findings.md         # Crawley source-of-truth (read; do not rescan)
```

---

## system-design/ (Self-Application SD Run)

```
system-design/
├── kb-upgrade-v2/           # L2 self-application outputs
│   └── METHODOLOGY-CORRECTION.md  # Three-pass correction (CANONICAL)
└── {module outputs}/
```

---

## .github/workflows/

```
.github/workflows/
├── ci-typescript.yml
├── verify-trees.yml         # Tree-pair consistency gate (T8 ship)
└── quarterly-drift-check.yml  # Crawley schema drift (TC1)
```

---

## Notable File Conventions

| Convention | Detail |
|-----------|--------|
| `lib/config/env.ts` | Imported at top of `next.config.ts`. Throws at build time on missing/invalid env vars. Requires `OPENROUTER_API_KEY`. |
| `lib/langchain/schemas.ts` | Legacy barrel — shadows `lib/langchain/schemas/index.ts` for `'../schemas'` imports. Use explicit subpath `@/lib/langchain/schemas/index` for Crawley schemas. |
| `lib/langchain/engines/index.ts` | Wave E barrel convention: `evaluateWaveE` is the public API; `_NFREngineInterpreterCore` (underscore) is bypass-flagged. |
| `__tests__/` directories | Co-located with source files throughout `lib/`. Run via `jest + ts-jest`. |
| `scripts/*.ts` | One-off scripts, run via `pnpm tsx scripts/<name>.ts`. |
| `lib/db/migrations/` | 25 SQL files. `drizzle-kit migrate` is broken (duplicate 0004). Use Supabase SQL Editor or manual SQL for new migrations. |
| Zod `.describe()` | `x-ui-surface=page:/... | section:... | internal:...` convention drives frontend routing from schema metadata via `zod-to-json.ts`. |
