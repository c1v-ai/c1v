# Project State: Product Helper V2

**Project:** Product Helper
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications
**Updated:** 2026-01-26

---

## Current Position

**Milestone:** V2 -- Epic.dev Feature Parity
**Planning System:** CLEO (GSD roadmap retained for reference only)
**Last Completed:** T021 -- Explorer Tree Sidebar (Wave 0) ✓
**Active Wave:** Wave 1 tasks now unblocked (T025-T028)

```
CLEO Progress: [###-------] 8 of 26 tasks done (31%)
Wave 0: ✓ Complete (T021, T034-T036)
Wave 1: Ready (T025-T028 unblocked)
Wave 2-3: Blocked on Wave 1
Independent: T023, T033, T048, T056 (can run anytime)
```

---

## CLEO Wave Structure

| Wave | Status | Tasks | What |
|------|--------|-------|------|
| 0 | ✓ Done | T021, T034-T036 | Explorer tree sidebar, types, route pages, layout integration |
| 1 | Ready | T025, T026, T027, T028 | Content views, stories table, diagram viewer, progress cards |
| 2 | Blocked | T038-T041 | Problem statement, personas, goals/metrics, NFRs, review workflow |
| 3 | Blocked | T044-T046 | Agent role selector, add buttons/progress, inline editing |
| Independent | Ready | T023, T033, T048, T056 | Staged gates, KB integration, onboarding, redirect fix |

### GSD Phase Overview (Reference Only)

| Phase | Name | Status | Requirements |
|-------|------|--------|--------------|
| 1 | Onboarding & First Impressions | Pending | ONBD-01..05 |
| ~~2~~ | ~~Quick Start Pipeline~~ | ✓ Complete | ~~PIPE-08..10, CHAT-04~~ |
| 3 | PRD Extraction Agents | Pending | PIPE-01..04 |
| 4 | Pipeline Orchestration & Quality | Pending | PIPE-05..07, CHAT-01 |
| ~~5~~ | ~~Explorer Shell & Layout~~ | ✓ Complete | ~~EXPL-01, 02, 13, 14~~ |
| 6 | Content Section Views | Pending | EXPL-03..07 |
| 7 | Rich Data Views | Pending | EXPL-08..12 |
| 8 | Chat Enhancements | Pending | CHAT-02, 03 |
| 9 | Inline Section Editing | Pending | EXPL-15 |

---

## Active Workstreams

### 1. Quick Start Mode (T022) -- COMPLETE ✓

**Branch:** `feature/T022-quick-start-mode`
**Architecture:** Direct API orchestration (not LangGraph) -- batch pipeline, not conversation
**Files (5):** synthesis-agent, orchestrator, SSE route, progress-cards, quick-start-button
**All subtasks done:** T029 (synthesis), T030 (orchestrator), T031 (SSE route), T032 (UI)

### 2. KB <-> Agent Integration (T033) -- COMPLETE ✓

**Branch:** `feature/phase12-ui-scaffolding`
**Commit:** `b7ba9fa`
**All 6/6 subtasks done:**
- Backend (3): phase-mapping.ts, prompts.ts educationBlock, route.ts X-Current-Phase header
- Frontend (3): ThinkingState in chat-window.tsx, tooltip processing in markdown-renderer.tsx, phase passthrough in chat-message-bubble.tsx

### 3. Explorer UI (T021/T034-T036) -- COMPLETE ✓

**Branch:** `feature/T022-quick-start-mode`
**Status:** Code complete, uncommitted on disk
**Files:**
- 6 modified files (layout.tsx, chat components, extraction-agent.ts)
- `components/projects/explorer/` — 8 components (tree, sidebar, header, search, progress, mobile)
- `components/projects/sections/` — 6 section views (API spec, architecture, infrastructure, schema, system overview, tech stack)
- `app/(dashboard)/projects/[id]/backend/` — 3 route pages
- `app/(dashboard)/projects/[id]/requirements/` — 4 route pages
- `lib/db/queries/explorer.ts` — DB query for explorer data

### 4. Dev Server Fix -- COMPLETE ✓

- Removed experimental canary-only flags (ppr, clientSegmentCache) from next.config.ts
- Downgraded Next.js from broken canary (15.6.0-canary.59) to stable (15.5.9)
- Added turbopack.root for monorepo support
- Dev server: `pnpm dev` (not `npx next dev`)

---

## Prior Work (Complete)

The following phases from the previous milestone are complete and form the foundation:

| Phase | Name | Milestone | Status |
|-------|------|-----------|--------|
| 1-3 | Test Stabilization, Security, Mobile Revamp | v1.1 | Complete |
| 9 | Data Model Depth | v2.0 | Complete |
| 10 | Generators & Agents | v2.0 | Complete |
| 11 | MCP Server (17 tools) | v2.0 | Complete |
| 15 | Code Cleanup & Claude Migration | v2.0 | Wave 1 Complete (Paused) |
| 12 | Educational Content (knowledge banks) | v2.0 | All 6 KBs enriched ✓ |

**What exists:**
- 7 intake agents + 6 generator agents
- LangGraph 7-node state machine
- 13 database tables with Drizzle ORM
- 17 MCP tools with API key management
- PRD-SPEC 10 hard-gate validation engine
- SSE streaming, JWT auth, teams, PWA
- 6 knowledge bank files (all 6 enriched with systems engineering course material)
- Education UI scaffolding (ThinkingState, TooltipTerm components)

---

## Performance Metrics

- **Tests:** 456/456 passing (100%)
- **Type Check:** Passing (9 pre-existing test file issues)
- **Feature Parity:** 52% built (80/155 Epic.dev features) — [full inventory](.planning/phases/12-project-explorer/EPIC-DEV-PARITY.md)
- **Backend Completion:** ~80%
- **Frontend Completion:** ~25% (up from ~20% after Explorer work)

---

## Accumulated Context

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| CLEO over GSD for task management | GSD's phase system too rigid; CLEO's wave-based hierarchy fits better |
| Two parallel tracks (pipeline + UI) | Independent until convergence; maximizes throughput |
| Explorer tree as primary navigation | Epic.dev's strongest UX pattern |
| Chat as persistent right panel | Chat is PH's differentiator; must stay visible |
| Epic.dev export as pipeline training data | Their export IS the target output format |
| Additive pipeline changes only | Existing agents work; extend, don't replace |
| Dual-format output (.md + machine-parseable) | Developers need JSON/OpenAPI; PMs need markdown |
| Next.js stable over canary | Canary versions break in monorepo; no experimental features needed |

### Known Issues

- Post-login redirect goes to Team Settings instead of /projects (ONBD-05)
- ~6,500 lines of duplicate code (~15-20% of codebase) -- refactoring paused (Phase 15)
- 2 remaining security items (env validation, `any` types)
- **Dual sidebar bug:** Chat page shows both explorer sidebar (left) AND ArtifactsSidebar (middle panel with Actors/Use Cases/Data Entities tree). The old ArtifactsSidebar in `chat-client.tsx` should likely be removed or hidden now that ExplorerSidebar exists in the layout
- **Duplicate chat messages:** AI responses appear twice in chat history — needs investigation (may be double-save or message ID collision)
- **Localhost 500 error:** Dev server returns Internal Server Error — needs investigation (likely DB connection or component import issue)

### SDLC & Environment Issues (Action Required)

| Issue | Severity | Current State | Fix |
|-------|----------|---------------|-----|
| **Live Stripe keys in dev** | High | `.env.local` uses `sk_live_` keys | Switch to `sk_test_` keys for local development |
| **Shared production DB** | High | `.env.local` points to production Supabase | Create separate Supabase project for dev |
| **Wrong BASE_URL** | Medium | Set to Vercel production URL | Set to `http://localhost:3000` in `.env.local` |
| **No CI pipeline** | Medium | No GitHub Actions workflows | Add basic workflow: build + test on PRs |
| **No branch protection** | Low | `main` unprotected | Require PRs, prevent direct pushes |

**Priority order:**
1. Separate dev database (prevents accidental production data corruption)
2. Stripe test keys (prevents accidental real charges)
3. Fix BASE_URL for local dev
4. CI pipeline (catch build failures before deploy)
5. Branch protection on main

### Educational Content Context

**Knowledge Banks (6 files):**

| # | File | Step | Status |
|---|------|------|--------|
| 1 | `01-CONTEXT-DIAGRAM.md` | 1.1 | Enriched |
| 2 | `02-USE-CASE-DIAGRAM.md` | 1.2 | Enriched |
| 3 | `03-SCOPE-TREE.md` | 1.3 | Enriched |
| 4 | `04-UCBD.md` | 2.1 | Enriched |
| 5 | `05-FUNCTIONAL-REQUIREMENTS.md` | 2.2 | Enriched |
| 6 | `06-SYSML-ACTIVITY-DIAGRAM.md` | 2.3 | Enriched |

Key concepts: "The System" naming, Delving Technique, Functional vs Structural, 10 Properties of Good Requirements, Requirement Constants, Contractor Test, AND Test

### Phase 15 (Code Cleanup) -- Paused

Wave 1 complete (Claude 4.5 migration, rate limit fix, middleware fix, duplicate hook deletion).
Waves 2-4 pending (security, refactoring, cleanup).

### TODOs

- ~~Wire ThinkingState into chat-window.tsx~~ ✓ (T033)
- ~~Auto-enrich AI responses with TooltipTerm in markdown-renderer.tsx~~ ✓ (T033)
- ~~Enrich remaining knowledge banks (03-06) with course material~~ ✓ (b7ba9fa)
- Fix dual sidebar bug on chat page (remove ArtifactsSidebar from chat-client.tsx)
- Fix duplicate chat messages bug
- Commit uncommitted Explorer work to git

---

## Session Continuity

**Last session:** 2026-01-26
**Active branch:** `feature/T022-quick-start-mode`
**Dev server:** Working (`pnpm dev` at localhost:3000) — Next.js 15.5.9 stable
**Stopped at:** Fixed 500 error (Next.js downgrade), updated STATE.md
**Resume action:**
1. Fix dual sidebar bug (remove ArtifactsSidebar from chat-client.tsx)
2. Fix duplicate chat messages bug
3. Commit all uncommitted work to git + push
4. Pick next task: Wave 1 (T025-T028) or independent tasks (T023, T048, T056)

### Required Vercel Env Vars

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_URL` | Yes | Database connection |
| `AUTH_SECRET` | Yes | 32+ characters for JWT |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |

---

## Completed Phases (Archived Details)

Detailed file listings and commit hashes for completed phases (9, 10, 11) are available in:
- `.planning/phases/10-generators/10-0[1-4]-SUMMARY.md`
- `.planning/phases/11-mcp-server/` (6 plan files)
- Git history on `main` branch

### Phase 9 Summary
Enhanced use cases schema, schema extraction agent, tech stack agent, user stories agent. Migration applied via Supabase MCP.

### Phase 10 Summary
4 generator agents: API spec, infrastructure, coding guidelines, system architecture diagram.

### Phase 11 Summary
MCP JSON-RPC 2.0 server with 17 tools. API key management, rate limiting, connections UI, SKILL.md/CLAUDE.md export generators. Integration cards for Claude Code, Cursor, VS Code, Windsurf.

---

*State updated: 2026-01-26*
