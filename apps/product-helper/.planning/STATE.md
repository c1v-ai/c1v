# Project State: Product Helper V2

**Project:** Product Helper
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications
**Updated:** 2026-02-08

---

## Production Hotfix (2026-02-05)

**Issue:** All LLM calls failing with `TypeError: bL.Od.isInstance is not a function`
**Impact:** Chat completely broken, recursion limit errors, fallback questions repeating
**Root Cause:** LangChain version drift — `^` versions allowed auto-updates that broke `@langchain/core` compatibility

### Symptoms
- Vercel logs: `isInstance is not a function` on every LLM invoke
- `GraphRecursionError: Recursion limit of 20 reached`
- Chat stuck asking "Can you tell me more about what elements should be in the Context Diagram?"

### Fix Applied (5 commits)

| Commit | Description |
|--------|-------------|
| `c5586bb` | Pin LangChain versions: `@langchain/core` 0.3.40, `@langchain/anthropic` 0.3.14, `@langchain/langgraph` 0.2.60, `langchain` 0.3.26 |
| `29079ec` | Exclude test files from tsconfig (pre-existing TS errors in tests) |
| `6ddfbbb` | Regenerate lockfile with workspace-level `pnpm.overrides` |
| `aa4ef42` | Remove orphaned `apps/system-helper` (347 files) — was causing lockfile mismatch |

### Files Changed
- `package.json` (root) — added `pnpm.overrides` for `@langchain/core`
- `apps/product-helper/package.json` — pinned all LangChain versions (removed `^`)
- `apps/product-helper/tsconfig.json` — excluded `**/__tests__/**` from type checking
- `pnpm-lock.yaml` — regenerated

### Prevention (TODO)
- [ ] Pin ALL dependency versions (remove remaining `^`)
- [ ] Set up Renovate for controlled updates
- [ ] Add CI check: `pnpm install --frozen-lockfile && pnpm build`

### Supabase RLS Warnings (Separate Issue)
13 tables have RLS disabled — security concern but not blocking. Tables affected:
- `password_reset_tokens`, `teams`, `activity_logs`, `users`, `invitations`
- `team_members`, `project_data`, `projects`, `artifacts`

---

## Current Position

**Milestone:** V2 -- Epic.dev Feature Parity
**Planning System:** GSD
**Last Completed:** Phase 6-05 + route consolidation + extraction fix (2026-02-07), Knowledge Banks 07-12 created + generator agent wiring (2026-02-08)
**Active Work:** Phase 6-07 — Quick PRD Mode (plan written, ready to execute). KB + agent changes uncommitted.
**Next:** Commit KB + agent work, execute 06-07, push to main
**Status:** ✅ V2 DEPLOYED | ✅ PHASE 15 COMPLETE | ✅ PHASE 16 COMPLETE | ✅ PHASE 17 COMPLETE | ✅ PHASE 3 COMPLETE | ✅ PHASE 18 COMPLETE | ✅ PHASE 4 COMPLETE | ✅ PHASE 5 COMPLETE | ✅ PHASE 6-01 COMPLETE | ✅ PHASE 6-02 COMPLETE | ✅ PHASE 6-03 COMPLETE | ✅ PHASE 6-04 COMPLETE | ✅ PHASE 6-05 COMPLETE | ✅ PHASE 6-06 COMPLETE | ✅ KBs 07-12 CREATED

```
CLEO Progress: [##########] 36 of 36 tasks done (100%)
Wave 0: ✓ Complete (T021, T034-T036)
Wave 1: ✓ Complete (T025-T028)
Wave 2: ✓ Complete (T038-T041)
Wave 3: ✓ Complete (T042, T045; T044/T046 deferred to v3)
Independent: ✓ Complete (T023, T033, T048, T056, T060)
Testing: ✓ Complete (T061-T068)
```

### Route Consolidation (2026-02-07)

**Commits:** `900afe5`, `6e67cf7`

1. **Rename /welcome-test to /home** — Updated route, middleware, auth redirects, nav links, E2E tests
2. **Consolidate /projects and / to /home** — All /projects links now point to /home, root / redirects authenticated users to /home. Updated nav, sidebar, headers, back buttons, E2E tests.

**Files Changed:** middleware.ts, actions.ts, layout.tsx, page.tsx, nav links, E2E page objects

### Extraction Token Limit Fix (2026-02-07)

**Commit:** `43630d3`

1. **Extraction agent maxTokens**: 3000 → 20000 to prevent truncated output that silently discards actors and use cases
2. **Zod defaults**: Added `.default([])` on `systemBoundaries`, `actors`, `useCases` in extractionSchema so partial LLM output doesn't throw
3. **Nav config**: Added Problem Statement, Goals & Metrics, NFR to sidebar nav and artifact pipeline
4. **Duplicate chat messages**: Replaced `append()` with `addNotification()` to prevent duplicate messages (append triggers API calls)

### Phase 6-05 Completed (2026-02-07)

**Plain Language Prompts & Educational Loading States (UX-06, UX-07):**

**Commit:** `7f8f858`

1. Plain language communication guidelines and glossary added to system prompt
2. `generalThinkingMessages` (10 golden nuggets) and `nodeThinkingMessages` added to knowledge bank
3. Stream status markers injected in LangGraph handler for node-aware progress
4. Markers parsed in `ProjectChatProvider`, stripped from displayed messages
5. Differentiated `ThinkingState`: node-specific in `ProgressCard`, general in `ChatMessages`
6. Replaced inaccurate time estimate with elapsed timer + "may take 3-5 min" hint
7. Fixed Tech Stack "Unknown" sections (TechStackModel format with categories array)
8. Added completion toast notifications with section location (e.g., "Find it under Backend")
9. Stripped vision metadata from first user message display

**Files Changed:** langgraph-handler.ts, chat-message-bubble.tsx, chat-window.tsx, explorer-sidebar.tsx, generation-progress-card.tsx, project-chat-provider.tsx, tech-stack-section.tsx, knowledge-bank.ts, generate-response.ts

### Phase 6-04 Completed (2026-02-07)

**Overview Redesign, Vision Leak Fix, UX Improvements (UX-02, UX-03, UX-04, UX-05):**

**Commit:** `0067f86`

1. Fixed vision metadata leak caused by `\r\n` line endings in DB (regex now handles `\r?\n`)
2. Removed empty state placeholder — always show `QuickInstructions` + `ArtifactPipeline`
3. Removed `ProjectContextCard` and `ValidationReport` from overview
4. Removed IDE connector badges, link to Connectors page instead
5. Replaced generic "Generating Response..." with descriptive stage labels
6. Replaced toast notifications with persistent chat messages for artifact completion
7. Added spinning loader icons on pending artifacts in sidebar and pipeline during generation
8. Stripped vision metadata from initial messages in `layout.tsx`

**Files Added:** `overview/artifact-pipeline.tsx` (+152), `overview/quick-instructions.tsx` (+80)
**Files Changed:** layout.tsx, page.tsx, explorer-sidebar.tsx, generation-progress-card.tsx, project-chat-provider.tsx, vision.ts

### Phase 6-03 Completed (2026-02-06)

**Explorer Status API Endpoint (UX-04):**

**Commit:** `850bc55`

- Added explorer status API endpoint for real-time section completion indicators
- **Summary:** `.planning/phases/06-content-section-views-ux-polish/06-03-SUMMARY.md`

### Knowledge Banks 07-12 Created (2026-02-08)

**6 new decision-guidance Knowledge Banks for generator agents (GEN-01):**

| KB | File | Size | Purpose |
|----|------|------|---------|
| 07 | `07-ENTITY-DISCOVERY.md` | 9 KB | Entity recognition, relationship inference, domain patterns |
| 08 | `08-DATABASE-SCHEMA-DESIGN.md` | 15 KB | Field types, constraints, indexes, schema patterns |
| 09 | `09-TECH-STACK-SELECTION.md` | 15 KB | Decision framework, selection matrices, rationale templates |
| 10 | `10-API-SPECIFICATION-PATTERNS.md` | 11 KB | REST/GraphQL, endpoints, auth, error codes |
| 11 | `11-INFRASTRUCTURE-PATTERNS.md` | 12 KB | Hosting by stage, CI/CD, monitoring, security checklist |
| 12 | `12-CODING-STANDARDS.md` | 16 KB | Naming, file org, testing, git conventions |

**Also created:** `lib/education/generator-kb.ts` (20 KB) — KB loading utility for generator agents

### Generator Agent KB Wiring (2026-02-08, uncommitted)

**5 generator agents modified to load KB content:**

| Agent | File | Changes |
|-------|------|---------|
| Schema | `schema-extraction-agent.ts` | Loads KB 07+08, outputs full fields/types/constraints |
| Tech Stack | `tech-stack-agent.ts` | Loads KB 09, outputs categories with rationale + alternatives |
| API Spec | `api-spec-agent.ts` | Loads KB 10, outputs complete endpoint definitions |
| Infrastructure | `infrastructure-agent.ts` | Loads KB 11, outputs deployment architecture |
| Guidelines | `guidelines-agent.ts` | Loads KB 12, outputs language-specific standards |

**Also modified:** `quick-start/orchestrator.ts` — imports generator KB utility

### Codebase Map Refreshed (2026-02-08)

All 7 `.planning/codebase/` documents refreshed via 4 parallel mapper agents:
- STACK.md (183 lines), INTEGRATIONS.md (252), ARCHITECTURE.md (272), STRUCTURE.md (583), CONVENTIONS.md (441), TESTING.md (700), CONCERNS.md (316)

**Notable findings:** 93 `as any` assertions, 30 duplicate `getUser()` calls, 180+ lines legacy dead code, no `error.tsx` boundaries, 251 console.logs

### Phase 6-02 Completed (2026-02-06)

**Content Section View Verification:**

- Verified all 5 content views: PRD Overview, System Overview, Tech Stack, Infrastructure, Architecture
- Verified all 9 nav-config hrefs match actual route file paths
- Verified data shape compatibility between DB JSONB fields and component props
- TypeScript compilation: PASS (zero errors)
- **Bug found:** `getProjectById` missing `userStories` relation -- User Stories section always showed empty state
- **Fix:** Added `userStories: true` to Drizzle `with` clause in `getProjectById`
- Commit: `9a19281` -- `fix(06-02): include userStories relation in getProjectById query`
- **Summary:** `.planning/phases/06-content-section-views-ux-polish/06-02-SUMMARY.md`

### Phase 6-01 Completed (2026-02-06)

**Quick UX Fixes (4 items):**

1. **UX-01: Post-Login Redirect** (`3c5aa1b`)
   - Changed returning user redirect from `/projects` to `/welcome-test`
   - File: `app/(login)/actions.ts` line 105

2. **UX-02: Vision Metadata Stripping Utility** (`3c5aa1b`)
   - Created `lib/utils/vision.ts` with `stripVisionMetadata()` function
   - Strips `[Mode: ...]` prefix and `---\n<context>` from vision strings
   - Utility created but NOT applied to page.tsx (deferred to 06-04)
   - Chat auto-send confirmed to already strip metadata

3. **UX-08: Validation Report Dev-Only** (`fda4aa2`)
   - Wrapped `<ValidationReport>` in `process.env.NODE_ENV === 'development'` check
   - File: `app/(dashboard)/projects/[id]/page.tsx`

4. **UX-09: Green Hover Removal** (`fda4aa2`)
   - Removed `hover:bg-muted/50` from actor table rows and entity cards
   - File: `components/projects/sections/system-overview-section.tsx`
   - Cleaned up unused `cn` import

**Summary:** `.planning/phases/06-content-section-views-ux-polish/06-01-SUMMARY.md`

### Epic.dev Schema Alignment (2026-02-01)

**Status:** Schema update complete, propagation in progress

Updated `lib/langchain/schemas.ts` from ~440 to ~917 lines to match Epic.dev output format:
- Full persona fields (demographics, technicalProficiency, usageContext)
- Complete database schema types (fields, types, constraints, FKs, indexes)
- Full tech stack types with rationale and alternatives
- User story types with epic grouping
- Architecture diagram and system overview schemas

**Impact Map:** See `.planning/SCHEMA-UPDATE-IMPACT.md` for full propagation checklist.

**Blocking Issues:**
- TypeScript errors in `lib/diagrams/__tests__/generators.test.ts` (6 errors) - old TechStackModel shape
- Pre-existing test issues in guidelines and infrastructure route tests (signal type)

### Roadmap Evolution
- **Phase 16 added (2026-01-31):** Chat/LLM Quality Improvements
  - Categories: A (Chat UX), B (Extraction), C (Knowledge Bank), D (Dead Code), E (Architecture), F (Security), G (Environment/DX), H (Over-Engineering)
  - 40+ items identified from comprehensive code review
  - Execution split: Security items (F1-F3, G1-G2) NOW, rest during/after LangChain refactor
- **16-01 completed (2026-01-31):** Security and DX Quick Fixes (F2, F3, G1, G2)
- **16-02 completed (2026-01-31):** Cost Optimization - Prompt Caching and Haiku (A4, A5)
- **16-03 completed (2026-01-31):** Dead Code and OpenAI Cleanup (D1, D2, D4)
- **16-04 completed (2026-01-31):** Dead Code Cleanup and Tooltip Activation (D3, C3)
- **16-05 completed (2026-01-31):** Mermaid Validation Before Save (B4)
- **16-06 completed (2026-01-31):** Incremental Extraction with Message Index (B2)
- **16-07 completed (2026-01-31):** Remove Modulo-5 Extraction Gate (B1)
- **Phase 17 added (2026-01-31):** Infrastructure & Diagrams
  - Docker compose for local QA (isolated from production DB)
  - Beautiful Mermaid for professional diagram rendering
  - CLEO task cleanup (stale tasks from Phase 16)
- **17-03 completed (2026-01-31):** CLEO Task Cleanup
  - Closed T084 (legacy chat route removal - done in 16-03)
  - Documented T085/T086 as unblocked actionable tasks
  - Updated T080 progress (4/6 children done)
  - Enhanced T087 description with specific QA improvements
- **17-01 completed (2026-01-31):** Supabase Local Development Setup
  - Initialized Supabase project with `supabase init`
  - Local PostgreSQL, Auth, and Studio available via `supabase start`
- **17-02 completed (2026-01-31):** Beautiful Mermaid Integration
  - Installed beautiful-mermaid@0.1.3 for professional diagram styling
  - Created wrapper module with SVG and ASCII rendering functions
  - Updated DiagramViewer with theme-aware rendering (github-light/github-dark)
  - Added ASCII format option to MCP get_diagrams tool for CLI usage
- **15-04 completed (2026-02-01):** Constants Extraction & TODO Cleanup
  - Created centralized constants module (`lib/constants/index.ts`)
  - Extracted 7 constant groups: TIME, LLM_DEFAULTS, RATE_LIMIT, etc.
  - Tracked 3 TODOs with CLEO tasks (T088-T090)
  - Updated 3 files to use constants instead of magic numbers
- **15-05 completed (2026-02-01):** Any Type Elimination in Chat API Routes
  - Eliminated 22 `any` types from save/route.ts (18) and route.ts (4)
  - Used indexed types: `ExtractionResult['actors']` pattern
  - Used double-cast pattern: `unknown -> Drizzle type` for JSONB
  - Added generic parseJsonField<T> function
  - Closes Gap 1 from 15-VERIFICATION.md
- **15-06 completed (2026-02-01):** withProjectAuth Middleware Adoption
  - Refactored 11 routes to use withProjectAuth middleware
  - 16 of 17 project routes now use middleware (94% adoption)
  - projects/route.ts correctly excluded (collection operations)
  - ~600 lines of duplicated auth boilerplate removed
  - Nested params (keyId, storyId) extracted from URL path
  - Closes Gap 2 from 15-VERIFICATION.md
- **03-01 completed (2026-02-01):** Aggressive PRD Field Extraction
  - Actor goals/painPoints: Changed from INFER to MUST include, added CRITICAL block
  - Problem statement: Marked as (REQUIRED), added inference rules and JSON example
  - Goals/metrics: Marked as (REQUIRED - minimum 3), added dimension coverage
  - All sections now have "Do NOT return empty" enforcement
  - 3 atomic commits for each task
- **03-02 completed (2026-02-01):** NFR Project-Type Inference (PIPE-04)
  - NFRs: Marked as (REQUIRED - minimum 3 categories)
  - Added PROJECT-TYPE INFERENCE RULES for 6 project types
  - SaaS, E-commerce, Mobile, Data Platform, API Platform, Multi-user
  - Added MANDATORY EXTRACTION RULES section at prompt end
  - Covers: problemStatement, actor goals/painPoints, goalsMetrics, NFRs
  - Security and Performance always required as baseline
- **03-03 completed (2026-02-01):** Extraction Quality Validation
  - Added validateExtractionQuality() logging for observability
  - Updated completeness scoring: Actors 15%, Actor depth 5%, Use cases 20%, Boundaries 15%, Entities 10%, Problem statement 10%, Goals 15%, NFRs 10%
  - Created 13 unit tests for calculateCompleteness and mergeExtractionData
  - PIPE-01 through PIPE-04 all implemented
- **Phase 4-01 completed (2026-02-02):** Epic.dev Navigation Pattern
  - Refactored explorer sidebar from data display to pure navigation
  - NavItem interface updated with children support for nested tree
  - Product Requirements: links to /requirements + 4 children (Architecture, Tech Stack, User Stories, System Overview)
  - Backend: expand-only (no href) + 4 children (Schema, API Spec, Infrastructure, Guidelines)
  - Removed data collapsibles (Actors, Use Cases, Entities, Diagrams lists) from sidebar
  - Mobile explorer sheet updated with same navigation pattern
  - Completeness bar retained at bottom of sidebar
  - 3 atomic commits: nav-config, explorer-sidebar, mobile-explorer-sheet
- **Phase 5-02 completed (2026-02-04):** Layout Dimension Adjustments
  - Chat panel width: 380px -> 400px (to match EXPL-13 spec)
  - Explorer sidebar width: 240px (w-60) -> 256px (w-64)
  - Collapsed states unchanged: w-12 for chat, w-14 for explorer
  - TypeScript compilation verified
  - 2 atomic commits

---

## What Was Built (V2 Sprint Summary)

### Wave 0 — Explorer Shell & Layout
- Explorer tree sidebar with 11 navigable sections
- Route pages for all requirements + backend sections
- Layout integration with project pages
- Mobile drawer support

### Wave 1 — Content Views
- T025: Coding guidelines section view
- T026: Content section views (system overview, architecture, tech stack, API spec, infrastructure, schema)
- T027: User stories table with filtering
- T028: Diagram viewer with Mermaid rendering

### Wave 2 — Extraction & Workflow
- T038: Problem statement extraction (new extraction prompt section, persistence, explorer query)
- T039: Enhanced actor personas (goals/painPoints), goals & metrics extraction, completeness scoring redistribution
- T040: Non-functional requirements end-to-end (Zod schemas, DB column, extraction prompt, merge logic, save route, NFR section component, route page, explorer tree entry)
- T041: Per-section review/approval workflow (draft → awaiting-review → approved, API route, status badge + actions components, explorer dot indicators)

### Wave 3 — Explorer Polish
- T045: Explorer progress bar updated with NFR section (11 journey segments)
- T044: Agent role selector — **deferred to v3**
- T046: Inline section editing — **deferred to v3**

### Independent Tasks
- T023: Staged validation gates
- T033: Knowledge bank ↔ agent integration (ThinkingState, TooltipTerm, phase mapping)
- T048: Project onboarding metadata (type, stage, role, budget selectors with chip grid UI, DB migration, server action + API validation)
- T056: Post-login redirect fix
- T060: Context diagram Mermaid syntax fix

### Testing (T061)
- T062-T068: Playwright E2E test suite (auth flows, project CRUD, chat/intake, 3-column layout, content views, accessibility)

---

## DB Migrations Applied

All v2 migrations applied directly via Supabase MCP (drizzle-kit migrate has a pre-existing conflict on `api_keys` table):

| Migration | Table | Columns Added |
|-----------|-------|---------------|
| 0007 | `projects` | `project_type`, `project_stage`, `user_role`, `budget` |
| manual | `project_data` | `problem_statement`, `goals_metrics`, `non_functional_requirements`, `review_status` |

---

## Bug Fixes Applied (This Session)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| "Failed to create project" on localhost | Migration 0007 not applied; metadata columns missing from DB | Applied via Supabase MCP |
| `useActionState` called outside transition | `formAction(formData)` called imperatively without `startTransition` | Wrapped in `startTransition()` in `welcome-onboarding.tsx` |
| Metadata INSERT fragility | `undefined` metadata values still included as keys in INSERT object | Changed to conditional spread `...(data.projectType ? {...} : {})` in `projects.ts` |

---

## Known Issues

- **drizzle-kit migrate broken:** Fails on pre-existing `api_keys` table conflict. Migrations must be applied manually via Supabase MCP or psql.
- ~~**Dual sidebar bug:**~~ ✅ FIXED - Removed old chat-client.tsx, layout.tsx, artifacts-sidebar.tsx. Chat is now persistent panel in 3-column layout.
- ~~**Duplicate chat messages:**~~ ✅ FIXED - Chat refactor eliminated duplicate message issue.
- ~6,500 lines duplicate code (~15-20%) — refactoring paused (Phase 15)
- ~~2 remaining security items~~ ✅ FIXED - P0 security fixes applied (CORS, rate limit, timeout)
- Live Stripe keys in `.env.local` (should be test keys)
- ~~Shared production DB for local dev~~ ✅ FIXED - Supabase CLI provides isolated local DB at localhost:54322

---

## SDLC & Environment Issues (Action Required)

**Tracking:** T087 (QA Testing Process Improvements)

| Issue | Severity | Fix |
|-------|----------|-----|
| **Live Stripe keys in dev** | High | Switch to `sk_test_` keys in `.env.local` |
| ~~**Shared production DB**~~ | ~~High~~ | ✅ FIXED: `pnpm db:start` (Supabase local at 54322) |
| **Wrong BASE_URL** | Medium | Set to `http://localhost:3000` in `.env.local` |
| **No CI pipeline** | Medium | Add GitHub Actions: build + test on PRs |
| **No branch protection** | Low | Require PRs, prevent direct pushes to main |
| **drizzle-kit migrate broken** | Medium | Fix `api_keys` conflict or reset migration journal |
| **No pre-push verification** | Medium | Add `pnpm tsc && pnpm build` before push |
| **Migration tracking gap** | Medium | Document migration status per environment |

### Phase 16 Lessons Learned (2026-01-31)

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| TypeScript build error on Vercel | `timeout` placed outside `clientOptions` | Pre-push build check |
| DB column missing in production | Migration not applied to Supabase | Migration tracking protocol |
| 14 unpushed commits | Work accumulated locally | Push after each plan completion |

---

## Security & Scalability Audit (2026-01-31)

**Audit Status:** P0 FIXED | **Risk Level:** 🟡 MEDIUM (post-fixes)

### P0 — Critical ✅ FIXED (2026-01-31)

| # | Issue | Status | Fix Applied |
|---|-------|--------|-------------|
| 1 | CORS allows `*` origin | ✅ FIXED | Changed to `process.env.BASE_URL \|\| 'http://localhost:3000'` |
| 2 | No rate limit on LLM chat | ✅ FIXED | Added 20 req/min per user via `checkRateLimit()` |
| 3 | No CSRF protection | ⏳ P1 | Deferred - auth cookies are httpOnly |
| 4 | No LLM API retry logic | ⏳ P1 | Deferred - timeout prevents hanging |
| 5 | In-memory rate limiter | ⏳ P1 | Works for MVP, upgrade to Redis later |
| 6 | Stripe webhook no idempotency | ⏳ P1 | Deferred |
| 7 | No LLM call timeout | ✅ FIXED | Added 30s timeout to all 5 ChatAnthropic instances |

### P1 — High (Fix Short-Term)

| Issue | File | Impact | Status |
|-------|------|--------|--------|
| Missing CSP header | `middleware.ts:18` | XSS injection risk | Pending |
| Session not rotated after password change | `app/(login)/actions.ts:290` | Compromised session persists | Pending |
| Mermaid diagrams not sandboxed | `app/api/chat/.../route.ts:333` | XSS via diagram injection | Pending |
| ~~No LLM call timeout~~ | ~~`lib/langchain/config.ts:17`~~ | ~~Requests hang indefinitely~~ | ✅ FIXED |
| Stripe webhook error handling | `app/api/stripe/webhook/route.ts:33` | Silent failures, infinite retries | Pending |

### P2 — Medium (Production Hardening)

| Issue | Recommendation |
|-------|----------------|
| DB pool size 10 (may be too small) | Increase to 20-30 in `lib/db/drizzle.ts` |
| No structured logging | Add Pino or Winston + Sentry |
| No APM monitoring | Add Datadog or New Relic |
| No LLM cost tracking | Track token usage per user/project |
| No background job queue | Consider Inngest or Trigger.dev |

### Quick Fixes (Copy-Paste)

**1. CORS Fix** (`app/api/mcp/[projectId]/route.ts:110`):
```typescript
'Access-Control-Allow-Origin': process.env.BASE_URL || 'http://localhost:3000',
```

**2. LLM Timeout** (`lib/langchain/config.ts`):
```typescript
export const streamingLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  timeout: 30000, // 30 second timeout
  // ...existing config
});
```

**3. Rate Limit Chat** (`app/api/chat/projects/[projectId]/route.ts` top of POST):
```typescript
import { checkRateLimit } from '@/lib/mcp/rate-limit';
const { allowed } = checkRateLimit(`chat-${params.projectId}`, 20, 60000);
if (!allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
```

### Estimated Effort

| Priority | Hours | Risk After |
|----------|-------|------------|
| P0 fixes | 6-8h | 🟡 Medium |
| P0 + P1 | 30-40h | 🟢 Low-Medium |
| Full hardening | 60-90h | 🟢 Low |

---

## Architecture Overview

### Agent System (8 agents)
- 1 intake agent (conversational PRD creation via LangGraph)
- 1 extraction agent (structured data from conversations)
- 6 specialist agents: schema, tech stack, user stories, API spec, infrastructure, guidelines

### Explorer Sidebar (11 sections)
```
Product Requirements
  ├── Problem Statement
  ├── Goals & Metrics
  ├── System Overview
  ├── Architecture
  ├── Tech Stack
  ├── User Stories
  └── Non-Functional Reqs
Backend
  ├── Database Schema
  ├── API Specification
  ├── Infrastructure
  └── Coding Guidelines
```

### Review Workflow
Per-section status: `draft` → `awaiting-review` → `approved`
Stored in `project_data.review_status` JSONB column.
Visual indicators: amber dot (awaiting review), green dot (approved) in explorer tree.

### Onboarding Metadata
4 optional fields on project creation: project type (8 options), stage (5), role (5), budget range (5).
Collapsible chip grid with icons. Stored as varchar(30) columns on `projects` table.

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| CLEO over GSD for task management | GSD's phase system too rigid; CLEO's wave-based hierarchy fits better |
| Explorer tree as primary navigation | Epic.dev's strongest UX pattern |
| Chat as persistent right panel | Chat is PH's differentiator; must stay visible |
| Additive pipeline changes only | Existing agents work; extend, don't replace |
| Migrations via Supabase MCP | drizzle-kit migrate broken; direct SQL with IF NOT EXISTS is safer |
| Conditional metadata spread | Defensive coding so missing DB columns don't break INSERT |
| Next.js stable over canary | Canary versions break in monorepo |

---

## V3 Backlog

Deferred from v2:
- **T044:** Agent role selector (H09) — select which agent personality guides the conversation
- **T046:** Inline section editing (B12-B13) — edit extracted data directly in section views

---

## V3 Feature: Backend Schema & Tech Stack Generation (Epic.dev Parity)

**Analysis Date:** 2026-01-30
**Goal:** Match Epic.dev's ability to generate complete backend schemas and tech stacks with rationale
**Status:** Gap analysis complete, implementation not started

### Current State vs Epic.dev

#### What Product Helper Has

**Knowledge Banks (6 files — methodology-focused):**

| KB | File | Focus |
|----|------|-------|
| 01 | `01-CONTEXT-DIAGRAM.md` | Mapping system scope/boundaries |
| 02 | `02-USE-CASE-DIAGRAM.md` | Use case discovery |
| 03 | `03-SCOPE-TREE.md` | Scope decomposition |
| 04 | `04-UCBD.md` | Extracting functional requirements via delving |
| 05 | `05-FUNCTIONAL-REQUIREMENTS.md` | Formalizing SHALL statements |
| 06 | `06-SYSML-ACTIVITY-DIAGRAM.md` | Visual behavior modeling |

**Generator Agents (6 files — exist but lack decision guidance):**

| Agent | File | Current Output |
|-------|------|----------------|
| Schema | `schema-extraction-agent.ts` | Entity names only |
| Tech Stack | `tech-stack-agent.ts` | Basic recommendations |
| API Spec | `api-spec-agent.ts` | Basic endpoints |
| Infrastructure | `infrastructure-agent.ts` | Basic hosting |
| Guidelines | `guidelines-agent.ts` | Basic conventions |
| User Stories | `user-stories-agent.ts` | Stories from use cases |

#### What Epic.dev Produces

**Backend Schema (18+ entities with full definitions):**
```
• Table names with descriptions
• Field names, types (uuid, varchar, timestamp, jsonb, boolean, integer)
• Nullable vs required markings
• Primary keys, foreign keys, constraints
• Relationships: one-to-one, one-to-many, many-to-many
• Index recommendations
• 8-15 fields per entity with types and constraints
```

**Tech Stack (8 categories with full rationale):**
```
• Categories: Backend, Frontend, Database, Infrastructure, CI/CD, Third Party, Dev Tools
• Primary choice + 2-3 alternatives per category
• Rationale for each primary choice
• "Why not" explanations for each alternative
• Justification section with overall architecture reasoning
• Risks & Mitigations section with mitigation strategies
```

### Gap Analysis

| Category | Product Helper Current | Epic.dev Output | Gap |
|----------|------------------------|-----------------|-----|
| **Knowledge Banks** | 6 (methodology-focused) | N/A | +6 technical decision KBs needed |
| **Schema Output** | Entity names only | Full fields/types/constraints | Major upgrade required |
| **Tech Stack Output** | Basic recommendations | Categories + rationale + alternatives | Major upgrade required |
| **Agent Integration** | Agents exist | Agents need KB-driven decision logic | Wiring needed |

### Required Knowledge Banks (6 New Files)

#### 07-ENTITY-DISCOVERY.md
**Purpose:** Guide extraction of data entities from requirements and use cases

**Required Sections:**
```
1. Entity Recognition Patterns
   - Noun analysis technique (subjects, objects from SHALL statements)
   - The "data persistence" test (does it need to be stored?)
   - Entity vs attribute distinction rules

2. Entity Naming Conventions
   - Singular nouns, PascalCase
   - Domain-specific naming patterns

3. Relationship Inference from Use Cases
   - One-to-many indicators in requirements
   - Many-to-many junction table patterns
   - Ownership vs reference relationships

4. Common Entity Patterns by Domain
   - SaaS: User, Organization, Subscription, ApiKey, AuditLog
   - E-commerce: User, Product, Order, OrderItem, Payment, Address
   - Social: User, Post, Comment, Like, Follow, Notification
   - Content: User, Article, Tag, Category, Media, Comment
```

#### 08-DATABASE-SCHEMA-DESIGN.md
**Purpose:** Guide generation of complete database schemas with fields, types, constraints

**Required Sections:**
```
1. FIELD TYPE SELECTION RULES
   | Data Type | When to Use | Example |
   |-----------|-------------|---------|
   | uuid | Primary keys, external references | id, userId |
   | text | Variable-length strings, no max needed | description, content |
   | varchar(N) | Constrained strings | email (255), code (50) |
   | integer | Counts, quantities, small numbers | quantity, order |
   | bigint | Large IDs, timestamps as numbers | externalId |
   | boolean | True/false flags | isActive, isDeleted |
   | timestamp | Date/time with timezone | createdAt, updatedAt |
   | timestamptz | Date/time with timezone (Postgres) | scheduledFor |
   | jsonb | Flexible/nested data, metadata | preferences, settings |
   | decimal(P,S) | Money, precise calculations | price, amount |
   | enum | Fixed set of values | status, role |

2. NULLABLE VS REQUIRED DECISION LOGIC
   - Required if: part of entity identity, needed for business logic, FK relationship
   - Nullable if: optional data, backward compatibility, external data source
   - Default values: createdAt (now()), isActive (true), role ('user')

3. CONSTRAINT PATTERNS
   | Constraint | When to Use |
   |------------|-------------|
   | PRIMARY KEY | Always on id column |
   | FOREIGN KEY | Reference to another table |
   | UNIQUE | Email, username, slug, API keys |
   | NOT NULL | Required fields |
   | CHECK | Value validation (status IN (...)) |
   | DEFAULT | Auto-populated values |

4. RELATIONSHIP IMPLEMENTATION PATTERNS
   | Relationship | Implementation |
   |--------------|----------------|
   | 1:1 | FK with UNIQUE constraint on child |
   | 1:N | FK on "many" side referencing "one" |
   | M:N | Junction table with composite PK or separate id |
   | Self-referential | FK to same table (parentId → id) |

5. INDEX RECOMMENDATIONS
   - Always index: foreign keys, unique columns, frequently filtered columns
   - Composite indexes: for common multi-column WHERE clauses
   - Partial indexes: for filtered queries (WHERE isActive = true)
   - GIN indexes: for JSONB columns with queries

6. COMMON SCHEMA PATTERNS BY PROJECT TYPE
   [Detailed patterns for SaaS, E-commerce, Social, Content, API Platform]

7. SOFT DELETE VS HARD DELETE
   - Soft delete: isDeleted boolean + deletedAt timestamp
   - Hard delete: CASCADE or SET NULL on FK
   - Audit requirements driving the choice
```

#### 09-TECH-STACK-SELECTION.md
**Purpose:** Guide technology recommendations with rationale and alternatives

**Required Sections:**
```
1. DECISION FRAMEWORK
   For each technology choice, consider:
   - Project type (web app, mobile, API, SaaS, e-commerce)
   - Team expertise (user-provided during intake)
   - Scale requirements (users, data volume, requests/sec)
   - Budget constraints (startup vs enterprise)
   - Time to market (MVP vs long-term)
   - Compliance requirements (HIPAA, SOC2, GDPR)

2. FRONTEND FRAMEWORK SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Web app, SEO important | Next.js | SSR, React ecosystem | Nuxt.js (Vue), Remix |
   | Mobile + web | React Native + Next.js | Code sharing, single team | Flutter (Dart), Expo |
   | Admin dashboard | React + Tailwind | Fast iteration, component libs | Vue + Vuetify |
   | Simple landing/marketing | Astro | Static, fast, islands | Next.js static, 11ty |
   | Complex SPA | React + Vite | Fast dev, mature ecosystem | Vue 3, Svelte |

3. BACKEND FRAMEWORK SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Real-time, websockets | Node.js (NestJS) | Event loop, TypeScript | Elixir/Phoenix |
   | ML/data processing | Python (FastAPI) | ML ecosystem, async | Django REST |
   | High concurrency API | Go (Gin/Echo) | Goroutines, performance | Rust (Axum) |
   | Enterprise, Java team | Spring Boot | Team familiarity, ecosystem | Quarkus |
   | Rapid prototyping | Node.js (Express) | Simple, fast setup | Fastify, Hono |

4. DATABASE SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Relational + JSON | PostgreSQL | ACID, jsonb, extensions | MySQL 8 |
   | Document-heavy | MongoDB | Schema flexibility | DynamoDB |
   | Time-series data | TimescaleDB | PostgreSQL + time partitioning | InfluxDB |
   | Graph relationships | Neo4j | Native graph queries | PostgreSQL + recursive CTEs |
   | Caching layer | Redis | In-memory, data structures | Memcached, Valkey |
   | Search | Elasticsearch | Full-text, analytics | Meilisearch, Typesense |

5. AUTHENTICATION SELECTION MATRIX
   | Requirement | Recommendation | Rationale | Alternatives |
   |-------------|----------------|-----------|--------------|
   | Enterprise SSO/SAML | Auth0 | Comprehensive, enterprise | Okta, Azure AD |
   | Quick setup, modern | Clerk | DX, React components | Supabase Auth |
   | Full control | Custom JWT + bcrypt | No vendor lock-in | Passport.js |
   | Social login only | NextAuth.js | Simple OAuth setup | Supabase Auth |

6. INFRASTRUCTURE SELECTION MATRIX
   | Scale | Recommendation | Rationale | Alternatives |
   |-------|----------------|-----------|--------------|
   | MVP/startup | Vercel + Supabase | Free tier, managed | Netlify + PlanetScale |
   | Growth stage | AWS (ECS + RDS) | Scalable, full control | GCP Cloud Run |
   | Enterprise | Kubernetes (EKS/GKE) | Orchestration, multi-region | Nomad |
   | Serverless | AWS Lambda + Aurora Serverless | Pay-per-use | Cloudflare Workers |

7. CI/CD SELECTION
   | Platform | Recommendation |
   |----------|----------------|
   | GitHub repos | GitHub Actions |
   | GitLab repos | GitLab CI |
   | Complex pipelines | CircleCI, Buildkite |
   | Vercel/Netlify apps | Built-in CI/CD |

8. THIRD-PARTY SERVICES
   | Category | Recommendation | Alternatives |
   |----------|----------------|--------------|
   | Email (transactional) | Resend, SendGrid | Postmark, AWS SES |
   | Email (marketing) | Loops, Customer.io | Mailchimp, ConvertKit |
   | Payments | Stripe | Paddle (SaaS), Square |
   | Analytics | PostHog, Mixpanel | Amplitude, Plausible |
   | Error tracking | Sentry | Bugsnag, Rollbar |
   | Monitoring | Datadog | New Relic, Grafana Cloud |
   | Feature flags | LaunchDarkly | PostHog, Flagsmith |
   | File storage | AWS S3, Cloudflare R2 | GCS, Supabase Storage |

9. RATIONALE TEMPLATE
   Primary choice format:
   "We recommend {technology} because {primary_reason}.
    It provides {benefit_1}, {benefit_2}, and {benefit_3}."

   Alternative format:
   "Consider {alternative} if you need {specific_requirement}.
    We didn't choose it as the primary because {tradeoff}."

   Why-not format:
   "{rejected_option} was considered but not recommended because {reason}.
    Choose it only if {exception_case}."

10. RISKS & MITIGATIONS TEMPLATE
    | Risk | Impact | Mitigation |
    |------|--------|------------|
    | Vendor lock-in | High | Abstract behind interfaces |
    | Cost at scale | Medium | Monitor usage, set alerts |
    | Team learning curve | Medium | Start with familiar alternatives |
```

#### 10-API-SPECIFICATION-PATTERNS.md
**Purpose:** Guide REST/GraphQL API design and documentation

**Required Sections:**
```
1. REST VS GRAPHQL DECISION
   | Scenario | Recommendation | Rationale |
   |----------|----------------|-----------|
   | Simple CRUD, public API | REST | Wide adoption, caching |
   | Complex queries, mobile | GraphQL | Flexible queries, bandwidth |
   | Real-time + queries | GraphQL + subscriptions | Single protocol |
   | Microservices internal | gRPC | Performance, contracts |

2. REST ENDPOINT NAMING CONVENTIONS
   - Resources: plural nouns (/users, /projects, /orders)
   - Nested resources: /users/{userId}/projects
   - Actions on resources: POST /orders/{id}/cancel (verb as sub-resource)
   - Query filters: /users?role=admin&status=active
   - Pagination: /users?page=1&limit=20 or /users?cursor=abc123

3. HTTP METHOD SEMANTICS
   | Method | Purpose | Idempotent | Request Body |
   |--------|---------|------------|--------------|
   | GET | Retrieve resource(s) | Yes | No |
   | POST | Create new resource | No | Yes |
   | PUT | Replace entire resource | Yes | Yes |
   | PATCH | Partial update | Yes | Yes |
   | DELETE | Remove resource | Yes | No |

4. REQUEST/RESPONSE PATTERNS
   Success response:
   { "data": {...}, "meta": { "requestId": "..." } }

   List response:
   { "data": [...], "pagination": { "page": 1, "limit": 20, "total": 100 } }

   Error response:
   { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }

5. AUTHENTICATION PATTERNS
   | Context | Pattern |
   |---------|---------|
   | API-to-API | API key in header (X-API-Key) |
   | User sessions | JWT Bearer token |
   | Web apps | HTTP-only cookies |
   | Webhooks | HMAC signature verification |

6. ERROR CODE STANDARDS
   | Code | Meaning | When to Use |
   |------|---------|-------------|
   | 400 | Bad Request | Validation failed |
   | 401 | Unauthorized | Not authenticated |
   | 403 | Forbidden | Authenticated but not authorized |
   | 404 | Not Found | Resource doesn't exist |
   | 409 | Conflict | Duplicate, version conflict |
   | 422 | Unprocessable | Semantic validation error |
   | 429 | Too Many Requests | Rate limited |
   | 500 | Server Error | Unexpected failure |

7. VERSIONING STRATEGIES
   - URL path: /v1/users, /v2/users (recommended for public APIs)
   - Header: Accept: application/vnd.api+json;version=1
   - Query param: /users?version=1 (not recommended)

8. RATE LIMITING HEADERS
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 95
   X-RateLimit-Reset: 1640000000
```

#### 11-INFRASTRUCTURE-PATTERNS.md
**Purpose:** Guide infrastructure and deployment recommendations

**Required Sections:**
```
1. HOSTING BY PROJECT STAGE
   | Stage | Recommendation | Monthly Cost | Notes |
   |-------|----------------|--------------|-------|
   | Prototype | Vercel free + Supabase free | $0 | Limited resources |
   | MVP | Vercel Pro + Supabase Pro | $45-100 | Production-ready |
   | Growth | AWS ECS + RDS | $200-500 | Full control |
   | Scale | Kubernetes (EKS/GKE) | $1000+ | Multi-region |

2. CI/CD PIPELINE PATTERNS
   Standard pipeline:
   1. Lint + Type check
   2. Unit tests
   3. Build
   4. Integration tests
   5. Deploy to staging
   6. E2E tests on staging
   7. Deploy to production (manual gate or auto)

3. ENVIRONMENT STRATEGY
   | Environment | Purpose | Data |
   |-------------|---------|------|
   | Local | Development | Seed/mock data |
   | Preview | PR review | Cloned staging |
   | Staging | Pre-production | Anonymized prod |
   | Production | Live users | Real data |

4. MONITORING STACK
   | Layer | Tool | Purpose |
   |-------|------|---------|
   | Errors | Sentry | Exception tracking |
   | Logs | Datadog/Logtail | Structured logging |
   | Metrics | Datadog/Grafana | System metrics |
   | Uptime | BetterStack | Availability monitoring |
   | APM | Datadog/New Relic | Performance tracing |

5. SECURITY CHECKLIST
   [ ] HTTPS everywhere (TLS 1.3)
   [ ] Environment secrets (not in code)
   [ ] Rate limiting on all endpoints
   [ ] Input validation at boundaries
   [ ] SQL injection prevention (parameterized queries)
   [ ] XSS prevention (CSP headers, output encoding)
   [ ] CSRF tokens for state-changing requests
   [ ] Dependency scanning (Snyk, Dependabot)
   [ ] Security headers (HSTS, X-Frame-Options, etc.)

6. BACKUP & DISASTER RECOVERY
   - Database: Daily automated backups, 30-day retention
   - Point-in-time recovery: Enabled for production
   - Multi-region: For high availability requirements
   - RTO/RPO targets based on business requirements
```

#### 12-CODING-STANDARDS.md
**Purpose:** Guide coding guidelines generation by language/framework

**Required Sections:**
```
1. NAMING CONVENTIONS BY LANGUAGE
   | Language | Variables | Functions | Classes | Constants | Files |
   |----------|-----------|-----------|---------|-----------|-------|
   | TypeScript | camelCase | camelCase | PascalCase | UPPER_SNAKE | kebab-case |
   | Python | snake_case | snake_case | PascalCase | UPPER_SNAKE | snake_case |
   | Go | camelCase | PascalCase (exported) | PascalCase | PascalCase | snake_case |
   | Rust | snake_case | snake_case | PascalCase | UPPER_SNAKE | snake_case |

2. FILE ORGANIZATION PATTERNS
   Feature-based (recommended for large apps):
   /features/auth/components/, /features/auth/hooks/, /features/auth/api/

   Layer-based (simpler apps):
   /components/, /hooks/, /lib/, /api/

3. COMPONENT PATTERNS (React/Vue)
   - Functional components with hooks (not class components)
   - Props interface defined above component
   - One component per file
   - Co-located tests (__tests__/ or .test.tsx)
   - Co-located styles (CSS modules or Tailwind)

4. TESTING REQUIREMENTS
   | Test Type | Scope | Tools |
   |-----------|-------|-------|
   | Unit | Pure functions, utilities | Vitest, Jest |
   | Component | UI components in isolation | Testing Library |
   | Integration | API routes, DB operations | Vitest, Supertest |
   | E2E | Critical user flows | Playwright, Cypress |

5. CODE QUALITY RULES
   - Max function length: 50 lines
   - Max file length: 300 lines
   - Max cyclomatic complexity: 10
   - No any types (TypeScript)
   - No console.log in production code
   - All exports must be typed

6. DOCUMENTATION STANDARDS
   - JSDoc for public APIs and complex functions
   - README.md for each package/module
   - ADRs for architectural decisions
   - Inline comments only for non-obvious logic

7. LINTING & FORMATTING CONFIG
   | Language | Linter | Formatter | Config |
   |----------|--------|-----------|--------|
   | TypeScript | ESLint | Prettier | eslint-config-next |
   | Python | Ruff | Ruff | pyproject.toml |
   | Go | golangci-lint | gofmt | .golangci.yml |

8. GIT CONVENTIONS
   - Branch naming: feature/*, bugfix/*, hotfix/*
   - Commit format: Conventional Commits (feat:, fix:, chore:)
   - PR template with checklist
   - Squash merge to main
```

### Implementation Plan

#### Phase 1: Create Knowledge Banks (P0)

| Task | KB | Effort | Priority |
|------|-----|--------|----------|
| Create 08-DATABASE-SCHEMA-DESIGN.md | 08 | 4h | P0 |
| Create 09-TECH-STACK-SELECTION.md | 09 | 4h | P0 |
| Create 07-ENTITY-DISCOVERY.md | 07 | 3h | P1 |
| Create 10-API-SPECIFICATION-PATTERNS.md | 10 | 3h | P1 |
| Create 11-INFRASTRUCTURE-PATTERNS.md | 11 | 2h | P2 |
| Create 12-CODING-STANDARDS.md | 12 | 2h | P2 |

#### Phase 2: Update Agents to Use Knowledge Banks

| Agent | Updates Required | Effort |
|-------|------------------|--------|
| `schema-extraction-agent.ts` | Load KB 07+08, output full schema with fields/types/constraints | 4h |
| `tech-stack-agent.ts` | Load KB 09, output categories with rationale + alternatives | 4h |
| `api-spec-agent.ts` | Load KB 10, output endpoints with request/response schemas | 3h |
| `infrastructure-agent.ts` | Load KB 11, output hosting + CI/CD + monitoring | 2h |
| `guidelines-agent.ts` | Load KB 12, output language-specific standards | 2h |

#### Phase 3: UI Integration

| Task | Component | Effort |
|------|-----------|--------|
| Enhanced schema viewer with field types | `components/data/schema-viewer.tsx` | 3h |
| Tech stack with expandable rationale | `components/data/tech-stack-viewer.tsx` | 3h |
| Export to SQL/Prisma/Drizzle format | Schema export options | 2h |

### Total Estimated Effort

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 1: Knowledge Banks | 18h | P0-P2 |
| Phase 2: Agent Updates | 15h | P1 |
| Phase 3: UI Integration | 8h | P2 |
| **Total** | **41h** | |

### Success Criteria

- [ ] Database schema output includes: entity names, field names, types, nullable, constraints, relationships
- [ ] Tech stack output includes: 8 categories, primary choice + alternatives, rationale for each
- [ ] Agents load and apply knowledge bank guidance dynamically
- [ ] Output quality matches or exceeds Epic.dev screenshots
- [ ] All 6 new knowledge banks created and integrated

---

## Session Continuity

**Last session:** 2026-02-08
**Active branch:** `main`
**Last commit:** `6e67cf7` - refactor: consolidate /projects and / routes to /home
**Dev server:** Working (`pnpm dev` at localhost:3000) — Next.js 15.5.9 stable
**Supabase local:** localhost:54322 (DB), 54323 (Studio)
**Deployment:** Pending push (multiple commits since last push)
**Last plan:** Phase 6-07 Quick PRD Mode (planned, not executed)
**Active work:** KB 07-12 created, generator agents wired (all uncommitted). 06-07 plan ready.
**Next up:** Commit KB + agent work, execute 06-07, push to main

### Uncommitted Changes
```
M  .planning/STATE.md                    — This update
M  .planning/ROADMAP.md                  — Phase status updates
M  .planning/REQUIREMENTS.md             — Checkbox updates
M  .planning/CONTEXT-HANDOFF.md          — Full rewrite
M  .planning/codebase/*.md               — 7 refreshed codebase map documents
M  lib/langchain/agents/api-spec-agent.ts         — KB 10 injection
M  lib/langchain/agents/guidelines-agent.ts       — KB 12 injection
M  lib/langchain/agents/infrastructure-agent.ts   — KB 11 injection
M  lib/langchain/agents/schema-extraction-agent.ts — KB 07+08 injection
M  lib/langchain/agents/tech-stack-agent.ts       — KB 09 injection
M  lib/langchain/quick-start/orchestrator.ts      — Generator KB import
?? lib/education/generator-kb.ts                  — NEW: KB loading utility for generators
```

### Phase 6 Execution Status (2026-02-06)

**Wave 1: COMPLETE**
- 06-01 ✅ Quick UX fixes (3c5aa1b, fda4aa2)
- 06-02 ✅ Content view verification (9a19281, a646dd2)

**Pipeline Fixes (between waves): COMPLETE**
- 5e9fdce ✅ Fix intake loop (stop trigger char limit, allCoreComplete check)
- 06-06 ✅ Auto-trigger generators after intake — `triggerPostIntakeGeneration()` implemented
  - Parallel generation: tech stack, user stories, schema, API spec, infrastructure + sequential guidelines
  - Enriched context building from extracted data (actors, use cases, boundaries, NFRs, goals)
  - `Promise.allSettled()` for graceful partial failures
  - DB persistence to project_data + user_stories tables

**Bugs found during testing (06-06):**
1. Streaming checkpoint not saving accumulated state → FIXED (accumulatedState pattern)
2. Completion message lied about generated artifacts → FIXED (buildCompletionMessage checks DB)
3. Guidelines agent PromptTemplate curly-brace issues → FIXED (template literal)
4. API Spec and Database Schema generators failing silently → Root cause: agents lack decision-guidance KBs (V2 voice note insight). Output is thin/empty. Fix is 06-07.

**06-07: Quick PRD Mode — PLANNED, NOT EXECUTED**
- Plan: `.planning/phases/06-content-section-views-ux-polish/06-07-PLAN.md`
- Research: Complete (Quick Start orchestrator pattern, intake graph topology, KB structure, extraction types)
- 5 tasks: ambiguity scorer → wire into chat → delete regex entities → extract enriched-context util → progress streaming
- Key insight: Quick Start orchestrator already does single-prompt → full PRD via separate API. 06-07 wires this into the chat flow with an ambiguity gate.

**Wave 2: COMPLETE**
- 06-03 ✅ Explorer status indicators + pulse animation (`850bc55`)
- 06-04 ✅ Overview redesign, vision leak fix, UX improvements (`0067f86`)
- 06-05 ✅ Plain language prompts, educational loading states (`7f8f858`)

**Post-Wave 2 Fixes (2026-02-07):**
- `43630d3` ✅ Extraction token limit 3K→20K, Zod defaults, nav items, duplicate message fix
- `900afe5` ✅ Rename /welcome-test to /home
- `6e67cf7` ✅ Consolidate /projects and / routes to /home

### Local Environment Setup (2026-02-06)

- Docker running, Supabase local started
- All migrations applied (0000-0007 + manual columns)
- `last_extracted_message_index` column added manually
- Seed data: test@test.com / admin123, Test Team
- Dev server on port 3000 (not 3001 as previously documented)

### Resume Action (Next Session)

**Priority 1: Commit KB + Agent Work**
KB 07-12 files, `generator-kb.ts`, and 5 agent modifications are uncommitted. Commit and push.

**Priority 2: Execute Phase 6-07 — Quick PRD Mode**
Plan written: `.planning/phases/06-content-section-views-ux-polish/06-07-PLAN.md`
Context: `.planning/phases/06-content-section-views-ux-polish/06-07-CONTEXT.md`
5 tasks: ambiguity scorer → wire into chat → delete regex entities → extract enriched-context util → progress streaming
With KBs loaded, Quick PRD output quality will match conversational path.

**Priority 3: Push to Main**
Multiple commits pending push (06-03 through route consolidation + KB/agent work).

**Priority 4: Phase 9 (Inline Section Editing) or Phase 10 (Mobile Redesign)**
Phase 6 will be fully complete after 06-07. Next milestone phases are 9 or 10.

### Milestone Progress Update (2026-02-08)

**Completed since last STATE.md update (2026-02-06):**
- Phase 6-03 ✅ Explorer status indicators (`850bc55`)
- Phase 6-04 ✅ Overview redesign + vision leak fix (`0067f86`)
- Phase 6-05 ✅ Plain language prompts + educational loading (`7f8f858`)
- Extraction token limit fix (`43630d3`)
- Route consolidation: /welcome-test → /home, /projects → /home (`900afe5`, `6e67cf7`)
- Knowledge Banks 07-12 created (6 files, uncommitted)
- Generator agent KB wiring (5 agents + orchestrator, uncommitted)
- `generator-kb.ts` utility created (uncommitted)
- Codebase map refreshed (7 documents, uncommitted)

**Phase 6 status: 5 of 6 plans complete. Only 06-07 (Quick PRD Mode) remains.**
**Phase 7 (Rich Data Views):** Complete (verified 2026-02-06)
**Phase 8 (Chat Enhancements):** CHAT-03 complete via 06-05, CHAT-02 deferred to V3

### Blocking TypeScript Errors (8 total)
- `lib/diagrams/__tests__/generators.test.ts` (6 errors) — old TechStackModel shape
- `app/api/projects/[id]/guidelines/__tests__/route.test.ts` — signal type (pre-existing)
- `app/api/projects/[id]/infrastructure/__tests__/route.test.ts` — signal type (pre-existing)

### Phase 17 UAT Results (2026-02-01)

**Status:** 4/6 tests passed, 2 skipped (no test data)

**Issues Fixed During UAT:**
1. Cookie `secure: true` breaks localhost → fixed to check NODE_ENV
2. Migrations not applied → added `db:migrate:sql` script
3. Missing `last_extracted_message_index` column → manually added
4. Test user needs team → documented in setup process

**Files Changed:**
- `lib/auth/session.ts` - secure flag respects NODE_ENV
- `middleware.ts` - secure flag respects NODE_ENV
- `package.json` - added db:migrate:sql script
- `README.md` - updated local setup instructions

### Completed This Session (2026-01-31)

1. ✅ **Chat Refactor Verified** - 3-column layout with persistent ChatPanel working correctly
2. ✅ **P0 Security Fixes Applied:**
   - CORS: `*` → `process.env.BASE_URL || 'http://localhost:3000'`
   - Rate limiting: 20 req/min per user on chat endpoint
   - LLM timeout: 30s on all 5 ChatAnthropic instances
3. ✅ **Committed and pushed** to `main` (71923e8)
4. ✅ **Vercel deployment triggered** via GitHub integration
5. ✅ **Phase 16-01 Completed:**
   - README updated: OpenAI -> Anthropic Claude (G1)
   - .nvmrc created: Node 20.9.0 (G2)
   - Team API: returns 401 for unauthenticated users (F3)
   - Stripe checkout: validates client_reference_id (F2)
6. ✅ **Phase 16-02 Completed:**
   - Prompt caching: `cacheControl: true` on all 5 LLM instances (A4)
   - Haiku for classification: cheapLLM uses claude-3-5-haiku (A5)
7. ✅ **Phase 16-03 Completed:**
   - Deleted clarification-detector.ts (dead code, exported but never used)
   - Deleted app/api/chat/test/route.ts (OpenAI test route)
   - Deleted app/api/chat/route.ts (legacy, superseded by project-specific route)
   - Migrated ask-question.ts from OpenAI to Anthropic (cheapLLM/Haiku)
   - Removed @langchain/openai from package.json (no more OpenAI dependency)

### Phase 5-02 Completed (2026-02-04)

**Layout Dimension Adjustments (EXPL-13):**

1. **Chat Panel Width** (`25ec303`)
   - Changed from `w-[380px]` to `w-[400px]`
   - File: `components/project/chat-panel.tsx`
   - Collapsed state (w-12) unchanged

2. **Explorer Sidebar Width** (`8b4d714`)
   - Changed from `w-60` (240px) to `w-64` (256px)
   - File: `components/project/explorer-sidebar.tsx`
   - Collapsed state (w-14) unchanged

**Layout Math:**
| Viewport | Explorer | Chat | Canvas |
|----------|----------|------|--------|
| 1024px (lg) | 256px | 400px | 368px |
| 768px (md) | hidden | 400px | 368px |
| <768px | hidden | hidden | 100% |

**Summary:** `.planning/phases/05-explorer-shell-layout/05-02-SUMMARY.md`

### Phase 5-01 Completed (2026-02-04)

**Clean Overview Page (Epic.dev Pattern):**

1. **Remove Quick Actions and Statistics Cards** (`92f6753`)
   - Removed Quick Actions card (5 buttons duplicating sidebar navigation)
   - Removed Project Statistics card (redundant metrics)
   - Kept Vision Statement card and Validation Report
   - Cleaned unused imports: MessageSquare, Database, GitBranch, FileDown, Plug, ExportButton
   - File: `app/(dashboard)/projects/[id]/page.tsx`
   - Lines removed: 138

2. **Add Empty State for New Projects** (`d98f4df`)
   - Created `OverviewEmptyState` component with Sparkles icon
   - Shows "Start Building Your PRD" message for new projects
   - "Start Conversation" CTA links to chat page
   - Conditional logic: `status === 'intake' && completeness === 0`
   - Existing projects continue to show Vision Statement card

**Before/After:**
| Before | After |
|--------|-------|
| Vision Statement Card | Empty State (new) OR Vision Statement Card |
| Quick Actions Card (5 buttons) | - |
| Statistics Card (4 metrics) | - |
| Validation Report | Validation Report |

**Summary:** `.planning/phases/05-explorer-shell-layout/05-01-SUMMARY.md`

### Phase 5-03 Completed (2026-02-04)

**Empty State Pattern Audit:**

- Audited all 13 section components for consistent empty state messaging
- Reference pattern documented from problem-statement-section.tsx
- All 13 sections already follow the 8-element pattern:
  1. Card wrapper with CardContent pt-6
  2. Centered container with py-16
  3. Relevant Lucide icon (h-16 w-16, muted color, 0.4 opacity)
  4. h3 heading with section-specific title
  5. Context-aware message (intake vs other)
  6. CTA Button with accent styling
  7. Chat Link to /projects/{projectId}/chat
  8. MessageSquare and ArrowRight icons
- **Result:** No fixes needed - all components already consistent
- **Summary:** `.planning/phases/05-explorer-shell-layout/05-03-SUMMARY.md`

### Phase 5 Complete (2026-02-05)

**Explorer Shell & Layout** — All 3 plans executed, verified, pushed to main

| Plan | What it did | Commits |
|------|-------------|---------|
| 05-01 | Clean Overview page (remove Quick Actions/Statistics, add empty state) | `92f6753`, `d98f4df` |
| 05-02 | Layout dimensions (Chat 400px, Explorer 256px) | `25ec303`, `8b4d714` |
| 05-03 | Empty state audit (13 sections verified consistent) | Documentation only |

**Requirements completed:** EXPL-13, EXPL-14
**Verification:** 6/6 must-haves passed
**Next:** Phase 6 (Content Section Views)

### Phase 4-02 Completed (2026-02-02)

**PRD Overview Page with Accordions:**

1. **Accordion UI Component** (`50dc94c`)
   - Installed @radix-ui/react-accordion
   - Created components/ui/accordion.tsx
   - Added accordion animations to globals.css

2. **ActorsSection Component** (`6debf63`)
   - Created components/projects/sections/actors-section.tsx
   - Displays actor cards with goals and pain points
   - Support compact prop for accordion view

3. **ScopeSection Component** (`b675b1b`)
   - Created components/projects/sections/scope-section.tsx
   - Displays use cases grouped by MoSCoW priority
   - Shows system boundaries (in-scope/out-of-scope)

4. **PRDOverview Component** (`ccccb1b`)
   - Created components/projects/prd-overview.tsx
   - 5 accordion sections: Problem, Users, Goals, Scope, NFRs
   - Status badges and completeness display

5. **Requirements Route Page** (`e12f313`)
   - Created app/(dashboard)/projects/[id]/requirements/page.tsx
   - Server component with Suspense loading

**Files Added:**
- `components/ui/accordion.tsx` (+55 lines)
- `components/projects/sections/actors-section.tsx` (+255 lines)
- `components/projects/sections/scope-section.tsx` (+347 lines)
- `components/projects/prd-overview.tsx` (+296 lines)
- `app/(dashboard)/projects/[id]/requirements/page.tsx` (+95 lines)
- `app/globals.css` (+22 lines for animations)

**Summary:** `.planning/phases/04-pipeline-orchestration/04-02-SUMMARY.md`

### Files Changed (Phase 4-01)

```
M components/project/nav-config.ts           # Nested NavItem structure (+32 lines)
M components/project/explorer-sidebar.tsx    # Navigation-only refactor (-56 lines)
M components/project/mobile-explorer-sheet.tsx  # Mobile navigation update (+28 lines)
```

### Phase 3 Completed (2026-02-01)

**03-01:** Aggressive PRD Field Extraction
- Actor goals/painPoints mandatory extraction (`3e54248`)
- Problem statement mandatory extraction (`c4e2bd5`)
- Goals/metrics minimum 3 requirement (`08c3da8`)

**03-02:** NFR Project-Type Inference
- PROJECT-TYPE INFERENCE RULES for 6 project types (`91a73f3`)

**03-03:** Extraction Quality Validation
- validateExtractionQuality() logging (`fe45e62`)
- Updated completeness scoring (`dc8eb66`)
- Unit tests for extraction agent (`ea63920`)

**Summaries:**
- `.planning/phases/03-prd-extraction-agents/03-01-SUMMARY.md`
- `.planning/phases/03-prd-extraction-agents/03-02-SUMMARY.md`
- `.planning/phases/03-prd-extraction-agents/03-03-SUMMARY.md`

### Phase 18-01 Completed (2026-02-01)

**Diagnostic Logging for Chat Flow Debug:**
- KB question generator: 10 `[KB_DEBUG]` statements (`51f97f9`)
- Extraction node: 10 `[EXTRACT_DEBUG]` statements (`26ab0b8`)
- LangGraph handler: 14 `[STATE_DEBUG]` statements (`0db26e1`)

**Files Changed:**
- `lib/langchain/agents/intake/kb-question-generator.ts`
- `lib/langchain/graphs/nodes/extract-data.ts`
- `app/api/chat/projects/[projectId]/langgraph-handler.ts`

**Summary:** `.planning/phases/18-chat-flow-debug/18-01-SUMMARY.md`

### Phase 18-02 Completed (2026-02-01)

**Fallback Loop Fix:**
- `buildFallbackResult()` now tracks rounds via `stepCompletionStatus.roundsAsked`
- 4 varied response messages prevent identical repetition
- `shouldProposeGeneration` triggers after 4 rounds OR 60% confidence
- Commit: `3796d6e`

**Files Changed:**
- `lib/langchain/agents/intake/kb-question-generator.ts` (+55/-18 lines)

**Summary:** `.planning/phases/18-chat-flow-debug/18-02-SUMMARY.md`

### Phase 18-04 Completed (2026-02-01)

**Two Issues Fix:**

1. **Extraction Schema Validation Error:**
   - Added `.default([])` to `dataEntities` in extraction schema
   - Prevents Zod validation failure when LLM omits the field
   - Commit: `d0debab`

2. **Chat Scrolling - Can't Scroll Up:**
   - Fixed useEffect that had no dependency array (ran every render)
   - Added `messageCount` prop to track new messages
   - Auto-scroll only when new messages added AND user near bottom
   - Commit: `0f6a409`

**Files Changed:**
- `lib/langchain/schemas.ts` - dataEntities default
- `components/chat/chat-window.tsx` - auto-scroll fix

**Summary:** `.planning/phases/18-chat-flow-debug/18-04-SUMMARY.md`

**Manual UAT:** ✅ Verified (2026-02-02) - Chat progresses, extraction works, scroll behavior fixed.

### Phase 4-01 Completed (2026-02-02)

**Epic.dev Navigation Pattern:**

1. **nav-config.ts - Nested NavItem Structure:**
   - NavItem interface with optional href and children support
   - Product Requirements: href `/requirements` + 4 children
   - Backend: no href (expand-only) + 4 children
   - Commit: `fde8675`

2. **explorer-sidebar.tsx - Navigation-Only Refactor:**
   - Removed ItemRow, DiagramRow, data collapsibles
   - Added NavItemComponent for recursive tree navigation
   - Kept CompletenessBar at bottom
   - Commit: `e5290f4`

3. **mobile-explorer-sheet.tsx - Mobile Navigation Update:**
   - Same navigation pattern as desktop
   - Sheet closes on navigation via onNavigate callback
   - Commit: `c579b3b`

**Files Changed:**
- `components/project/nav-config.ts`
- `components/project/explorer-sidebar.tsx`
- `components/project/mobile-explorer-sheet.tsx`

**Summary:** `.planning/phases/04-pipeline-orchestration/04-01-SUMMARY.md`

### Resume Action (Next Session)

**Phase 5 Complete (2026-02-05)** — Pushed to main, Vercel deployment triggered

**Priority 1: Start Phase 6 (Content Section Views)**
```bash
/gsd:discuss-phase 6   # Clarify requirements
/gsd:plan-phase 6      # Or skip discussion, plan directly
```

Phase 6 requirements (EXPL-03 to EXPL-07):
- User can view PRD content in formatted section view
- User can view System Overview section
- User can view Tech Stack section
- User can view Infrastructure & Deployment section
- User can view Architecture Diagram section

**Priority 2: Manual UAT for Phase 5**
1. Start dev server: `pnpm dev` (port 3001)
2. Sign in at http://localhost:3001
3. Create a new project (intake status, 0% completeness)
4. Verify Overview shows empty state with "Start Conversation" CTA
5. Verify existing project shows Vision Statement (no Quick Actions/Statistics)
6. Verify chat panel is 400px wide
7. Verify explorer sidebar is 256px wide when expanded

**Priority 3: Fix TypeScript Errors (pre-existing)**
- `lib/diagrams/__tests__/generators.test.ts` — old TechStackModel shape
- `app/api/projects/[id]/guidelines/__tests__/route.test.ts` — signal type
- `app/api/projects/[id]/infrastructure/__tests__/route.test.ts` — signal type

### Required Vercel Env Vars

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_URL` | Yes | Database connection |
| `AUTH_SECRET` | Yes | 32+ characters for JWT |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `BASE_URL` | Yes | `https://prd.c1v.ai` for CORS |

---

## Prior Work (Complete)

| Phase | Name | Milestone | Status |
|-------|------|-----------|--------|
| 1-3 | Test Stabilization, Security, Mobile Revamp | v1.1 | Complete |
| 9 | Data Model Depth | v2.0 | Complete |
| 10 | Generators & Agents | v2.0 | Complete |
| 11 | MCP Server (17 tools) | v2.0 | Complete |
| 15 | Code Cleanup & Claude Migration | v2.0 | Complete (4/4 plans) |
| 12 | Educational Content (knowledge banks) | v2.0 | All 6 KBs enriched |
| — | **V2 Deploy + Security Hardening** | v2.0 | ✅ Complete (2026-01-31) |

**What exists:**
- 8 intake/extraction agents + 6 generator agents
- LangGraph 7-node state machine
- 13+ database tables with Drizzle ORM
- 17 MCP tools with API key management
- PRD-SPEC 10 hard-gate validation engine
- SSE streaming, JWT auth, teams, PWA
- 6 knowledge bank files (all enriched with systems engineering course material)
- Education UI scaffolding (ThinkingState, TooltipTerm components)
- Playwright E2E test suite (T062-T068)
- 3-column layout with persistent chat panel
- P0 security fixes (CORS, rate limit, timeout)
- Cost optimizations (prompt caching, Haiku for classification)
- **NEW:** Beautiful Mermaid for professional diagram styling (light/dark themes)
- **NEW:** ASCII diagram output for MCP tools (CLI/terminal usage)
- **NEW:** Supabase local development environment
- **NEW:** withProjectAuth middleware for API routes (35% code reduction)
- **NEW:** Centralized constants module (`lib/constants/index.ts`)

---

## Key Decisions (Recent)

| Decision | Rationale |
|----------|-----------|
| Quick PRD as default first-message behavior | Users want single prompt → everything. Ambiguity gate handles edge cases. No separate mode toggle. |
| Reuse Quick Start synthesis, not rebuild | `synthesizeProjectContext()` is battle-tested. Wire into chat, don't duplicate. |
| Delete regex entity derivation | 150 lines of brittle keyword matching. LLM synthesis already produces entities. |
| Honest completion messages | Check DB for actual artifacts, don't assume. `buildCompletionMessage()` queries project_data. |
| withProjectAuth HOF for API auth | Eliminates ~35% of duplicated auth boilerplate, type-safe via overloads |
| Support both 'id' and 'projectId' params | Different routes use different naming conventions |
| Centralized constants module | Single source of truth for config values improves maintainability |
| CLEO tasks for deferred TODOs | Proper tech debt tracking instead of orphan comments |
| Completeness scoring redistribution | New fields (PS, NFRs, actor depth) must be reflected in completeness calculation |
| Quality validation as logging (not blocking) | Observability without breaking existing extractions |

---

*State updated: 2026-02-08 (06-03/04/05 complete, KBs 07-12 created, agents wired, 06-07 next)*
