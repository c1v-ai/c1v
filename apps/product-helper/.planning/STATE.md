# Project State: Product Helper V2

**Project:** Product Helper
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications
**Updated:** 2026-01-26

---

## Current Position

**Milestone:** V2 -- Epic.dev Feature Parity
**Current Phase:** Phases 1, 3, 5 ready to plan (can run in parallel)
**Last Completed:** Phase 2 -- Quick Start Pipeline ✓
**Plan:** Not yet planned (awaiting `/gsd:plan-phase`)

```
Progress: [##--------] 1 of 9 phases complete
```

---

## Phase Overview

| Phase | Name | Status | Requirements |
|-------|------|--------|--------------|
| 1 | Onboarding & First Impressions | Pending | ONBD-01..05 |
| ~~2~~ | ~~Quick Start Pipeline~~ | ✓ Complete | ~~PIPE-08..10, CHAT-04~~ |
| 3 | PRD Extraction Agents | Pending | PIPE-01..04 |
| 4 | Pipeline Orchestration & Quality | Pending | PIPE-05..07, CHAT-01 |
| 5 | Explorer Shell & Layout | Pending | EXPL-01, 02, 13, 14 |
| 6 | Content Section Views | Pending | EXPL-03..07 |
| 7 | Rich Data Views | Pending | EXPL-08..12 |
| 8 | Chat Enhancements | Pending | CHAT-02, 03 |
| 9 | Inline Section Editing | Pending | EXPL-15 |

---

## Parallel Tracks

**Track A (Pipeline):** Phases 1, 2, 3, 4 -- agent training, extraction, orchestration
**Track B (Explorer UI):** Phases 5, 6, 7, 8, 9 -- tree nav, content views, data views, chat, editing
**Convergence:** When explorer UI renders pipeline-generated output

Phases 1, 2, 3, and 5 can all run in parallel (no dependencies between them).

---

## Active Workstreams

### 1. Quick Start Mode (T022) -- COMPLETE ✓

**Branch:** `feature/T022-quick-start-mode`
**Architecture:** Direct API orchestration (not LangGraph) -- batch pipeline, not conversation
**Files (5):** synthesis-agent, orchestrator, SSE route, progress-cards, quick-start-button
**All subtasks done:** T029 (synthesis), T030 (orchestrator), T031 (SSE route), T032 (UI)

### 2. KB <-> Agent Integration (T033) -- PAUSED

**Branch:** `feature/phase12-ui-scaffolding`
**Priority:** High
**Status:** Backend done (3/6), frontend pending (3/6)

**Done:** phase-mapping.ts, prompts.ts educationBlock, route.ts X-Current-Phase header
**Remaining:** chat-window.tsx (ThinkingState), markdown-renderer.tsx (tooltips), chat-message-bubble.tsx (phase passthrough)
**No conflicts with T022** -- zero file overlap, can resume independently

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
| 12 | Educational Content (knowledge banks) | v2.0 | Enrichment in progress |

**What exists:**
- 7 intake agents + 6 generator agents
- LangGraph 7-node state machine
- 13 database tables with Drizzle ORM
- 17 MCP tools with API key management
- PRD-SPEC 10 hard-gate validation engine
- SSE streaming, JWT auth, teams, PWA
- 6 knowledge bank files (2 enriched from systems engineering course)
- Education UI scaffolding (ThinkingState, TooltipTerm components)

---

## Performance Metrics

- **Tests:** 456/456 passing (100%)
- **Type Check:** Passing (9 pre-existing test file issues)
- **Feature Parity:** 47% built (73/155 Epic.dev features)
- **Backend Completion:** ~80%
- **Frontend Completion:** ~20%

---

## Accumulated Context

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Two parallel tracks (pipeline + UI) | Independent until convergence; maximizes throughput |
| Explorer tree as primary navigation | Epic.dev's strongest UX pattern |
| Chat as persistent right panel | Chat is PH's differentiator; must stay visible |
| Epic.dev export as pipeline training data | Their export IS the target output format |
| Additive pipeline changes only | Existing agents work; extend, don't replace |
| Dual-format output (.md + machine-parseable) | Developers need JSON/OpenAPI; PMs need markdown |

### Known Issues

- Post-login redirect goes to Team Settings instead of /projects (ONBD-05)
- ~6,500 lines of duplicate code (~15-20% of codebase) -- refactoring paused (Phase 15)
- 2 remaining security items (env validation, `any` types)

### Educational Content Context

**Knowledge Banks (6 files):**

| # | File | Step | Status |
|---|------|------|--------|
| 1 | `01-CONTEXT-DIAGRAM.md` | 1.1 | Enriched |
| 2 | `02-USE-CASE-DIAGRAM.md` | 1.2 | Enriched |
| 3 | `03-SCOPE-TREE.md` | 1.3 | Initial |
| 4 | `04-UCBD.md` | 2.1 | Initial |
| 5 | `05-FUNCTIONAL-REQUIREMENTS.md` | 2.2 | Initial |
| 6 | `06-SYSML-ACTIVITY-DIAGRAM.md` | 2.3 | Initial |

Key concepts: "The System" naming, Delving Technique, Functional vs Structural, 10 Properties of Good Requirements, Requirement Constants, Contractor Test, AND Test

### Phase 15 (Code Cleanup) -- Paused

Wave 1 complete (Claude 4.5 migration, rate limit fix, middleware fix, duplicate hook deletion).
Waves 2-4 pending (security, refactoring, cleanup).

### TODOs

- Wire ThinkingState into chat-window.tsx
- Auto-enrich AI responses with TooltipTerm in markdown-renderer.tsx
- Enrich remaining knowledge banks (03-06) with course material

---

## Session Continuity

**Last session:** 2026-01-26
**Active branch:** `feature/T022-quick-start-mode`
**Stopped at:** Phase 2 complete, project initialized
**Resume action:** Run `/gsd:plan-phase 1` for Onboarding, `/gsd:plan-phase 3` for PRD Extraction Agents, or `/gsd:plan-phase 5` for Explorer Shell (all can run in parallel)

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
