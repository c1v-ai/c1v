# Roadmap: Product Helper V2

**Created:** 2026-01-26
**Depth:** Comprehensive
**Phases:** 9
**Coverage:** 34/34 v1 requirements mapped

---

## Overview

Product Helper V2 closes the competitive gap with Epic.dev across two parallel tracks: training the agent pipeline to produce Epic-quality output (extraction agents, Quick Start, dual-format artifacts) and building the Project Explorer UI to display that output (tree navigation, content views, user stories, diagrams). The nine phases below are derived from natural delivery boundaries -- onboarding fixes, Quick Start completion, extraction agents, pipeline orchestration, explorer shell, content views, rich data views, chat enhancements, and inline editing -- ordered by dependencies and designed for parallel execution where tracks are independent.

---

## Phase 1: Onboarding & First Impressions

**Goal:** New users land in the right place with context that improves pipeline output quality

**Dependencies:** None (can start immediately)

**Requirements:** ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05

**Success Criteria:**
1. User who just signed in lands on /projects (not Team Settings)
2. User can select project type (SaaS, mobile, marketplace, etc.) during project setup
3. User can select project stage (idea, prototype, MVP, growth) during project setup
4. User can provide budget range during project setup
5. User can select their role (founder, PM, developer, designer) during project setup

---

## Phase 2: Quick Start Pipeline ✓

**Goal:** Users can generate a complete PRD from a single brief input in under 60 seconds

**Dependencies:** None (independent of other phases)

**Requirements:** PIPE-08, PIPE-09, PIPE-10, CHAT-04

**Status:** Complete. All 4 subtasks done (T029-T032). Synthesis agent, orchestrator, SSE route, and progress cards UI shipped.

**Success Criteria:**
1. ✓ User can click "Quick Start" and provide a one-sentence product description
2. ✓ System expands brief input into full project context via 2-call synthesis (domain analysis + use case derivation)
3. ✓ User sees real-time progress cards ("Creating PRD... Done", "Creating API Spec... Done") as each artifact generates
4. ✓ All standard artifacts (PRD, tech stack, schema, API spec, user stories, diagrams) generate from the Quick Start flow
5. ✓ SSE stream delivers generation progress to the client in real time

---

## Phase 3: PRD Extraction Agents ✓

**Goal:** Pipeline produces Epic-quality PRD sections that were previously missing from output

**Dependencies:** None (parallel with Phase 1, 2)

**Requirements:** PIPE-01, PIPE-02, PIPE-03, PIPE-04

**Status:** Complete (2026-02-01). All 3 plans executed across 2 waves.

**Plans:** 3 plans in 2 waves — all complete

Plans:
- [x] 03-01-PLAN.md — Enhance extraction prompt for actors and problem statement (PIPE-01, PIPE-02, PIPE-03)
- [x] 03-02-PLAN.md — Enhance NFR extraction with project-type inference (PIPE-04)
- [x] 03-03-PLAN.md — Add extraction quality validation and update completeness scoring

**Post-Phase Work (Schema Propagation):**
- Update generator agents to output new schema formats (tech-stack, database-schema)
- Update UI components to display new fields
- Full impact map: `.planning/SCHEMA-UPDATE-IMPACT.md`

**Success Criteria:**
1. ✓ Generated PRD contains a structured problem/opportunity statement section extracted from conversation
2. ✓ Generated PRD contains full personas with names, goals, pain points, and behaviors (not just actor names)
3. ✓ Generated PRD contains a goals and success metrics table with measurable outcomes
4. ✓ Generated PRD contains non-functional requirements (performance, security, scalability) as a distinct section

---

## Phase 4: Epic.dev Navigation Pattern (Reframed)

**Goal:** Transform sidebar from data display to pure navigation following Epic.dev pattern

**Dependencies:** None (UI refactor, existing routes)

**Requirements:** EXPL-01, EXPL-02 (moved from Phase 5 - navigation tree is the core of explorer shell)

**Note:** Original PIPE-05/06/07/CHAT-01 requirements deferred to Phase 19. Research revealed these were over-engineered for current state. The real pain point is sidebar redundancy and missing navigation structure.

**Plans:** 1 plan

Plans:
- [ ] 04-01-PLAN.md — Refactor explorer sidebar to Epic.dev navigation pattern

**Success Criteria:**
1. Sidebar shows expandable navigation tree with "Product Requirements" and "Backend" as parent items
2. Clicking any nav item navigates to the corresponding route page (routes already exist)
3. Completeness bar remains visible in sidebar
4. Data collapsibles removed (Actors, Use Cases, Entities, Diagrams lists)
5. Collapsed sidebar shows top-level icons only (no data counts)

---

## Phase 5: Explorer Shell & Layout

**Goal:** Users navigate their project through a tree sidebar with persistent chat panel and guided empty states

**Dependencies:** None for UI shell (data already exists from phases 9-11). Logically Track B starts here.

**Requirements:** EXPL-13, EXPL-14 (EXPL-01, EXPL-02 moved to Phase 4)

**Note:** After Phase 4 completes, Phase 5 focuses on empty states and chat panel positioning refinements.

**Success Criteria:**
1. ~~User sees a tree sidebar (left panel, ~256px) listing all project sections with expand/collapse behavior~~ (Done in Phase 4)
2. ~~Explorer tree shows generated sections with item counts and completion indicators~~ (Done in Phase 4 via nav tree)
3. Chat panel is persistently visible as a right panel (~400px) alongside the content area
4. When a section has no generated content, user sees an empty state with a call-to-action that focuses the chat on that topic

---

## Phase 6: Content Section Views

**Goal:** Users can view all generated PRD and technical specification content in formatted, section-specific views

**Dependencies:** Phase 5 (explorer shell must exist to host content views)

**Requirements:** EXPL-03, EXPL-04, EXPL-05, EXPL-06, EXPL-07

**Success Criteria:**
1. User can select "Product Requirements" in the tree and view the full PRD content in a formatted markdown view
2. User can view System Overview section with project summary, actors, and system boundaries
3. User can view Tech Stack section showing recommended technologies with rationale and alternatives
4. User can view Infrastructure & Deployment section showing hosting, CI/CD, monitoring, and environments
5. User can view Architecture Diagram section with the rendered system architecture Mermaid diagram

---

## Phase 7: Rich Data Views (Stories, Schema, API, Diagrams)

**Goal:** Users can interact with structured data views -- user stories table, database schema, API spec, and enhanced diagram controls

**Dependencies:** Phase 5 (explorer shell). Phase 6 recommended but not blocking.

**Requirements:** EXPL-08, EXPL-09, EXPL-10, EXPL-11, EXPL-12

**Success Criteria:**
1. User can view User Stories in a table grouped by feature/epic with columns for ID, title, status, and priority
2. User Stories display priority badges (color-coded), status indicators, completion counters ("0/32 completed"), and time estimates ("~17.5 days estimated")
3. User can view Database Schema section showing entities with fields, types, constraints, and relationships
4. User can view API Specification section showing endpoints with methods, request/response schemas, and auth requirements
5. Diagram viewer supports zoom (+/- with percentage), pan (drag), copy Mermaid source, and fullscreen mode

---

## Phase 8: Chat Enhancements

**Goal:** Chat panel provides agent specialization and clear feedback during AI processing

**Dependencies:** Phase 5 (chat panel must be positioned in explorer layout)

**Requirements:** CHAT-02, CHAT-03

**Success Criteria:**
1. User can select an agent role (e.g., "Architect", "Product Manager") from a dropdown in the chat panel header
2. Loading states show clear, contextual progress indicators during AI processing (not just a generic spinner)

---

## Phase 9: Inline Section Editing

**Goal:** Users can edit generated PRD content directly within the explorer without switching to a separate editing mode

**Dependencies:** Phase 6 (content views must exist to enable inline editing)

**Requirements:** EXPL-15

**Success Criteria:**
1. User can click on a PRD section within the explorer view and edit the content inline
2. Edits persist and are reflected when the section is next viewed

---

## Phase 15: Code Cleanup & Technical Debt

**Goal:** Eliminate duplicate code, fix security vulnerabilities, improve type safety, and create reusable patterns

**Status:** ✓ Complete (2026-02-01)

**Dependencies:** None (maintenance work)

**Requirements:** DEBT-01 through DEBT-10

**Plans:** 6 plans in 3 waves — all complete

Plans:
- [x] 15-01 — Quick Wins (duplicate hook, rate limit fix, middleware fix) - DONE via Phase 16
- [x] 15-02 — Security & Type Safety (env validation, any types, SQL injection) - DONE 2026-02-01
- [x] 15-03 — API Auth Middleware (withProjectAuth HOF, refactor 5 routes) - DONE 2026-02-01
- [x] 15-04 — Constants & TODOs (magic numbers, TODO tracking) - DONE 2026-02-01
- [x] 15-05 — Fix any types in chat routes (gap closure) - DONE 2026-02-01
- [x] 15-06 — Complete auth middleware adoption (gap closure) - DONE 2026-02-01

**Success Criteria:**
1. Environment variables validated at startup with clear error messages
2. No `any` types in API routes
3. SQL queries use parameterized statements
4. Shared auth middleware reduces route boilerplate by ~60%
5. Magic numbers extracted to constants module
6. TODOs tracked as CLEO tasks or resolved

---

## Phase 16: Chat/LLM Quality Improvements ✓

**Goal:** Fix critical chat/LLM issues, optimize costs, clean up dead code, improve chat UX

**Status:** Complete (2026-01-31)

**Dependencies:** None (can start immediately, cleanup work)

**Requirements:** LLM-01 through LLM-20

**Plans:** 7 plans in 3 waves — all complete

Plans:
- [x] 16-01-PLAN.md — Security & DX quick fixes (G1, G2, F2, F3)
- [x] 16-02-PLAN.md — Prompt caching and Haiku for classification (A4, A5)
- [x] 16-03-PLAN.md — Dead code and OpenAI cleanup (D1, D2, D4)
- [x] 16-04-PLAN.md — Clean prompts.ts and activate tooltips (D3, C3)
- [x] 16-05-PLAN.md — Mermaid validation before save (B4)
- [x] 16-06-PLAN.md — Incremental extraction (B2)
- [x] 16-07-PLAN.md — Extract on every message (B1)

**Deferred to separate phase:** A2 (structured streaming), C1 (pgvector RAG), E1 (graphs/ reorg), H1-H5 (over-engineering)

---

### Priority Stack (Revised 2026-01-31)

| # | Item | Effort | Category | Files |
|---|------|--------|----------|-------|
| 1 | **A4: Prompt caching** | Low | Cost | `config.ts` - add `cacheControl` to all 5 LLM instances |
| 2 | **A5: Haiku for classification** | Low | Cost | `config.ts` - point `cheapLLM` to Haiku, use for analyze-response |
| 3 | **DELETE: clarification-detector.ts** | Trivial | Debt | Dead code, never called, flawed keyword heuristics |
| 4 | **D1: OpenAI cleanup** | Low | Debt | Delete `test/route.ts`, remove `@langchain/openai` from package.json |
| 5 | **C3: Tooltip terms activation** | Low | KB | `knowledge-bank.ts:729-738` - dead code, wire to `buildResponsePrompt()` |
| 6 | **B4: Mermaid validation** | Low | Extraction | Add `mermaid.parse()` before saving in `langgraph-handler.ts` |
| 7 | **Clean prompts.ts** | Low | Debt | Delete 8 dead exports (82% unused), move `extractionPrompt` inline |
| 8 | **Delete legacy /api/chat/route.ts** | Low | Debt | Outdated route superseded by `/api/chat/projects/[projectId]/` |
| 9 | **B2: Incremental extraction** | Medium | Extraction | Add `lastExtractedMessageIndex`, don't re-process full history |
| 10 | **B1: Extract more frequently** | Medium | Extraction | Remove modulo-5 gate at `conversations.ts:94-102` (AFTER B2) |
| 11 | **A3+C4: Combined warm-start** | Medium | UX | Use KB content for first message, inject vision analysis |
| 12 | **B3: Extraction feedback** | Medium | Extraction | Expose deltas from `hasNewData()` in `extract-data.ts` |
| 13 | **A2: Structured metadata streaming** | High | UX | Change `streamMode: 'text'` → `'stream-data'` (full pipeline rework) |
| 14 | **C1: pgvector RAG** | High | KB | Consider conditional KB injection first as intermediate step |
| 15 | **Reorganize graphs/** | Medium | Architecture | Split `types.ts` (720 lines) into `config/` and `state/` modules |

---

### Category A: Chat Experience

**A1: KB Question Generator Bypass** — Test current quality first; may not need fixing. The `pendingQuestion` short-circuit at `generate-response.ts:56-63` skips response LLM but question is already crafted by KB generator (an LLM call). Adding second LLM pass adds latency for marginal improvement.

**A2: Structured Metadata Streaming** — `streamMode: 'text'` confirmed at `project-chat-provider.tsx:145`. Most architecturally significant item. Migration to `streamMode: 'stream-data'` requires reworking entire streaming pipeline from `langgraph-handler.ts` through `route.ts` to frontend. High effort.

**A3: Warm-Start First Message** — Auto-send at `project-chat-provider.tsx:186-219` fires vision text cold. Consider better system prompt vs. extra LLM call.

**A4: Prompt Caching** — No `cacheControl` on any of 5 LLM instances in `config.ts`. **Highest-ROI change**. Single-line change per instance with immediate cost savings.

**A5: Model Routing to Haiku** — All 5 instances use Sonnet. `cheapLLM` exists but also uses Sonnet (misnamed). Point to Haiku for classification tasks. 60-70% cost savings on those nodes.

---

### Category B: Extraction Enhancements

**B1: Extract Every Message** — Modulo-5 gate at `conversations.ts:94-102` confirmed. BUT extracting 5x more often without B2 increases costs significantly. **B2 must come first.**

**B2: Incremental Extraction** — `extractProjectData()` re-processes full conversation each time. Add `lastExtractedMessageIndex` to only extract new messages. **Prerequisite for B1.**

**B3: Extraction Feedback Loop** — Note: Doc incorrectly references "PriorityScorer" — doesn't exist. Actual code uses `calculateStepConfidence()` in `compute-next-question.ts`. Fix: expose deltas from `hasNewData()` in `extract-data.ts`.

**B4: Mermaid Validation** — `saveMermaidDiagrams()` runs `cleanSequenceDiagramSyntax()` but no semantic validation. Add `mermaid.parse()` call before saving. Low effort, high value.

---

### Category C: Knowledge Bank Integration

**C1: pgvector RAG** — No pgvector/embedding exists. Current token overhead ~1,080 tokens/turn across 3 injection points. RAG adds latency for marginal relevance improvement. **Intermediate step:** conditional KB injection based on current step.

**C2: Validation Error Pattern Matching** — Validation errors injected via `buildPromptEducationBlock()`. Don't add regex matching to `analyze-response.ts` (slows it down). Let `generate-response.ts` handle this — it already receives validation errors.

**C3: Tooltip Terms Activation** — `findTooltipByTerm()` at `knowledge-bank.ts:729-738` is **dead code** (zero callers). Frontend `markdown-renderer.tsx` already supports tooltips. Add tooltip terms to `buildResponsePrompt()`. Low effort/high value.

**C4: Phase-Aware Welcome Messages** — Overlaps with A3. Combine into single warm-start item.

---

### Category D: Dead Code Cleanup

**D1: OpenAI Files** — `app/api/chat/test/route.ts` and `lib/mcp/tools/unique/ask-question.ts` import ChatOpenAI. Test endpoint likely dead code — verify before migrating, may just delete.

**D2: clarification-detector.ts** — **DEAD CODE**. Exported but never instantiated. Even if used, fundamentally flawed:
- Arbitrary 15-char threshold flags "Admin, User" as vague
- Keyword regex can't handle "finance team, CEO, auditors"
- 0.9 confidence short-circuit means LLM fallback never runs
- **Recommendation: DELETE**

**D3: prompts.ts** — 9 of 11 exports are dead (82%). Only `extractionPrompt` used (by `extraction-agent.ts`). Duplicates constants in `graphs/types.ts`. Move `extractionPrompt` inline, delete file.

**D4: Legacy /api/chat/route.ts** — Comment says "Phase 8 will add project context" — that phase passed. Real chat is `/api/chat/projects/[projectId]/route.ts`. Delete or redirect.

---

### Category E: Architecture Improvements

**E1: Reorganize graphs/** — `types.ts` (720 lines) mixes 4 concerns: types, constants, factory functions, helpers. Split into:
```
graphs/
├── config/           # phases.ts, thresholds.ts, triggers.ts
├── state/            # types.ts (pure), factory.ts, computed.ts, channels.ts
├── nodes/            # UNCHANGED
├── edges.ts          # UNCHANGED
├── checkpointer.ts   # UNCHANGED
└── intake-graph.ts   # UNCHANGED
```

---

### Category F: Security Hardening

**F1: API Key Rotation** — CRITICAL. Live production secrets in `.env.local`:
- `STRIPE_SECRET_KEY` (sk_live_...) — Can charge cards, access customer data
- `STRIPE_WEBHOOK_SECRET` (whsec_...) — Can forge webhook events
- `ANTHROPIC_API_KEY` (sk-ant-...) — Can run up bill
- `OPENAI_API_KEY` (sk-proj-...) — Can run up bill
- `LANGCHAIN_API_KEY` (lsv2_pt_...) — Can access traces
- `RESEND_API_KEY` (re_...) — Can send emails as you

**Rotation Steps:**
1. Stripe: https://dashboard.stripe.com/apikeys → Roll key (24hr grace period)
2. Anthropic: https://console.anthropic.com/settings/keys → Create new, delete old
3. OpenAI: https://platform.openai.com/api-keys → Create new, delete old
4. LangSmith: https://smith.langchain.com/settings → Create new, delete old
5. Resend: https://resend.com/api-keys → Create new, delete old
6. Update Vercel env vars + redeploy
7. Update `.env.local`

**F2: Stripe Checkout Bypass** — HIGH. `checkout/route.ts` - `client_reference_id` not validated against session user. Attacker can create checkout for another user's account.

**F3: Team API Auth Leak** — HIGH. `/api/team/route.ts` returns `null` instead of 401 when unauthenticated. Should return proper 401 Unauthorized.

**F4: Unvalidated Message Objects** — MEDIUM. Chat route accepts any message shape without validation. Add Zod schema for message input.

**F5: Error Stack Traces Leaked** — MEDIUM. Multiple endpoints return `error.message` which may include stack traces in production. Strip in production.

**F6: API Key in Response Body** — MEDIUM. `/api/projects/[id]/keys/route.ts` returns full API key in JSON. Should only show on creation, then mask.

**F7: No DB Transaction on Subscription** — MEDIUM. `queries.ts` subscription updates have race conditions. Wrap in transaction.

---

### Category G: Environment & DX

**G1: README OpenAI → Anthropic** — P0. README says OpenAI, code uses Anthropic. Devs waste 30min getting wrong API key.

**G2: Missing .nvmrc** — P0. Create `.nvmrc` with `20.9.0` to prevent Node version drift.

**G3: docker-compose.local.yml** — P1. Add app-specific compose with Postgres + Redis for local dev.

**G4: Minimal Setup Path** — P1. Document 3-env-var path for chat-only testing (skip Stripe).

**G5: --skip-stripe Flag** — P2. Add to `db:setup` script for devs who just want to test chat.

**G6: Document Test Credentials** — P2. `test@test.com / admin123` only in `seed.ts`, not documented.

---

### Category H: Over-Engineering to Address

**H1: v2-types.ts + v2-validators.ts Duplication** — 1,529 lines. TypeScript interfaces AND Zod schemas for same data. Pick one source of truth.

**H2: graphs/checkpointer.ts Dead Code** — 579 lines. Thread IDs, metadata, migration functions all unused.

**H3: graphs/channels.ts Generic Reducers** — 520 lines. Trivial reducers like `replaceReducer(a, b) => b ?? a`.

**H4: graphs/edges.ts Dead Code** — 429 lines. `needsErrorRecovery()` is just `state.error !== null`.

**H5: type-guards.ts Parallel Validation** — 219 lines. Duplicates `validator.ts`.

**Root Cause:** LangGraph infrastructure (~2,250 lines) for what's essentially: User message → Extract data → Complete? Generate : Ask next question.

---

### Key Corrections from Analysis

1. **B3 references "PriorityScorer"** — doesn't exist. Actual code uses KB-driven confidence with `calculateStepConfidence()`.
2. **B1 without B2 is counterproductive** — Extracting 5x more often while still sending full history increases costs.
3. **A3 and C4 overlap** — both address first-message quality. Combined.
4. **A4 should be #1** — lower effort than D1 and higher impact.
5. **cheapLLM exists** in `config.ts` but points to Sonnet. A5 can reuse it.
6. **Security issues live OUTSIDE LangChain code** — F1-F7 can be done before/during refactor.
7. **Over-engineering (H1-H5) IS the refactor** — Don't fix these separately, they'll be replaced.

---

### Execution Order Recommendation

**DO NOW (before LangChain refactor):**
- F1: API Key Rotation (1hr, zero code changes)
- F2: Stripe checkout validation (30min, outside refactor scope)
- F3: Team API 401 fix (15min, outside refactor scope)
- G1: README fix (30min)
- G2: .nvmrc (1min)

**DO DURING/AFTER REFACTOR:**
- A1-A5: Chat experience (depends on new architecture)
- B1-B4: Extraction (depends on new pipeline)
- C1-C3: Knowledge bank (depends on new prompts)
- D1-D4: Dead code (some will be deleted by refactor anyway)
- E1: Architecture reorg (part of refactor)
- H1-H5: Over-engineering (IS the refactor)

**DO AFTER REFACTOR:**
- F4-F7: Remaining security items
- G3-G6: DX improvements

---

## Phase 19: Deferred Pipeline Features (Future)

**Goal:** Original Phase 4 requirements that were deferred after research

**Dependencies:** Phase 4 complete, Phase 18 complete

**Requirements:** PIPE-05, PIPE-06, PIPE-07, CHAT-01

**Status:** Not started (deferred)

**Note:** These requirements were analyzed in Phase 4 research and found to be over-engineered for current state:
- PIPE-05 (staged approval gates): Per-section review status already exists from Wave 3
- PIPE-06 (dual-format output): Useful for MCP export but not urgent
- PIPE-07 (improved knowledge graphs): 6 KB files exist, "improved" is vague
- CHAT-01 (better chat responses): Addressed by Phase 18 fixes

**Success Criteria:**
1. System enforces staged approval gates: user must approve PRD before Tech Specs generate
2. Each artifact outputs in dual format: markdown + machine-parseable
3. Knowledge graphs produce more accurate scope definitions
4. Chat responses demonstrate improved requirements-building capability

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Onboarding & First Impressions | ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05 | ✓ Complete |
| 2 | Quick Start Pipeline | PIPE-08, PIPE-09, PIPE-10, CHAT-04 | ✓ Complete |
| 3 | PRD Extraction Agents | PIPE-01, PIPE-02, PIPE-03, PIPE-04 | ✓ Complete |
| 4 | Epic.dev Navigation Pattern | EXPL-01, EXPL-02 | **Planned** |
| 5 | Explorer Shell & Layout | EXPL-13, EXPL-14 | Pending |
| 6 | Content Section Views | EXPL-03, EXPL-04, EXPL-05, EXPL-06, EXPL-07 | Pending |
| 7 | Rich Data Views | EXPL-08, EXPL-09, EXPL-10, EXPL-11, EXPL-12 | Pending |
| 8 | Chat Enhancements | CHAT-02, CHAT-03 | Pending |
| 9 | Inline Section Editing | EXPL-15 | Pending |
| 15 | Code Cleanup & Technical Debt | DEBT-01 to DEBT-10 | ✓ Complete |
| 16 | Chat/LLM Quality Improvements | LLM-01 to LLM-06 | ✓ Complete |
| 17 | Infrastructure & Diagrams | INFRA-01, INFRA-02, INFRA-03 | ✓ Complete |
| 18 | Chat Flow Debug | CHAT-FIX-01 | ✓ Complete |
| 19 | Deferred Pipeline Features | PIPE-05, PIPE-06, PIPE-07, CHAT-01 | Deferred |

---

## Phase 18: Chat Flow Debug

**Goal:** Fix chat loop issue where conversation repeats the same question, and ensure extraction runs after messages

**Dependencies:** None (blocker fix, urgent)

**Requirements:** CHAT-FIX-01

**Context:** During Phase 3 UAT, discovered chat is stuck in a loop repeating "I'm working on the Context Diagram step. Can you tell me more about what elements should be in the Context Diagram?" No extraction data exists in any project (all actors/use_cases arrays are empty).

**Status:** Complete (2026-02-02)

**Plans:** 4 plans in 3 waves — all complete

Plans:
- [x] 18-01-PLAN.md — Add diagnostic logging to identify root cause
- [x] 18-02-PLAN.md — Fix fallback loop and verify extraction runs
- [x] 18-03-PLAN.md — Fix LLM calls failing with isInstance error (gap closure)
- [x] 18-04-PLAN.md — Fix dataEntities schema + chat scroll behavior (gap closure)

**Success Criteria:**
1. Chat conversation progresses through multiple exchanges without repeating
2. Extraction runs after messages and populates project_data
3. Phase 3 extraction prompts can be tested in practice

---

## Phase 17: Infrastructure & Diagrams

**Goal:** Local QA environment with Docker, better diagram rendering with Beautiful Mermaid, clean up stale tasks

**Dependencies:** None (can start immediately)

**Requirements:** INFRA-01, INFRA-02, INFRA-03

**Plans:** 3 plans in 1 wave

Plans:
- [x] 17-01-PLAN.md — Supabase CLI local dev setup (G3)
- [x] 17-02-PLAN.md — Beautiful Mermaid integration with ASCII output
- [x] 17-03-PLAN.md — CLEO task cleanup (T080, T084-T087)

**Success Criteria:**
1. Docker compose enables local development with isolated Postgres/Redis (not shared production DB)
2. Beautiful Mermaid replaces standard mermaid.js for professional diagram styling
3. MCP tools can output ASCII diagrams for terminal/CLI usage
4. Stale CLEO tasks marked complete or updated with clear status

---

## Parallel Execution Map

Track A (Pipeline) and Track B (Explorer UI) are independent until convergence (when UI renders pipeline output).

```
Track A (Pipeline):                 Track B (Explorer UI):

Phase 1: Onboarding --------+
                             |
Phase 2: Quick Start -----+ |      Phase 4: Nav Pattern ----------+
(COMPLETE)                 | |      (NEXT)                         |
                           | |                                     |
Phase 3: Extraction -------+-+      Phase 5: Explorer Shell -------+
(COMPLETE)                 |                                       |
                           |        Phase 6: Content Views --------+---> CONVERGENCE
Phase 19: Deferred --------+                                       |     (UI renders
(FUTURE)                            Phase 7: Rich Data Views ------+      pipeline output)
                                                                   |
                                    Phase 8: Chat Enhancements ----+
                                                                   |
                                    Phase 9: Inline Editing -------+
```

**Phase 1** can run in parallel with everything (no dependencies).
**Phases 2, 3** can run in parallel with each other and with Phase 4/5.
**Phase 4** unlocks Phase 5 (navigation tree is foundation for explorer shell).
**Phases 6, 7, 8** depend on Phase 5 but can run in parallel with each other.
**Phase 9** depends on Phase 6.
**Phase 19** is deferred indefinitely.

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 3 | Complete |
| PIPE-02 | Phase 3 | Complete |
| PIPE-03 | Phase 3 | Complete |
| PIPE-04 | Phase 3 | Complete |
| PIPE-05 | Phase 19 | Deferred |
| PIPE-06 | Phase 19 | Deferred |
| PIPE-07 | Phase 19 | Deferred |
| PIPE-08 | Phase 2 | Complete |
| PIPE-09 | Phase 2 | Complete |
| PIPE-10 | Phase 2 | Complete |
| EXPL-01 | Phase 4 | **Planned** |
| EXPL-02 | Phase 4 | **Planned** |
| EXPL-03 | Phase 6 | Pending |
| EXPL-04 | Phase 6 | Pending |
| EXPL-05 | Phase 6 | Pending |
| EXPL-06 | Phase 6 | Pending |
| EXPL-07 | Phase 6 | Pending |
| EXPL-08 | Phase 7 | Pending |
| EXPL-09 | Phase 7 | Pending |
| EXPL-10 | Phase 7 | Pending |
| EXPL-11 | Phase 7 | Pending |
| EXPL-12 | Phase 7 | Pending |
| EXPL-13 | Phase 5 | Pending |
| EXPL-14 | Phase 5 | Pending |
| EXPL-15 | Phase 9 | Pending |
| CHAT-01 | Phase 19 | Deferred |
| CHAT-02 | Phase 8 | Pending |
| CHAT-03 | Phase 8 | Pending |
| CHAT-04 | Phase 2 | Complete |
| ONBD-01 | Phase 1 | Complete |
| ONBD-02 | Phase 1 | Complete |
| ONBD-03 | Phase 1 | Complete |
| ONBD-04 | Phase 1 | Complete |
| ONBD-05 | Phase 1 | Complete |

**Mapped: 34/34** -- all v1 requirements covered, no orphans.

---

*Roadmap created: 2026-01-26*
*Derived from 34 requirements across 4 categories*
*Phase 17 plans created: 2026-01-31*
*Phase 15 plans created: 2026-02-01*
*Phase 15 gap closure plans added: 2026-02-01*
*Phase 3 plans created: 2026-02-01*
*Phase 18 plans created: 2026-02-01*
*Phase 4 reframed: 2026-02-02 (Epic.dev navigation pattern focus)*
