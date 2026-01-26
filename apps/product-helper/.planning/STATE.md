# Project State: Product Helper V2

**Project:** Product Helper
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications
**Updated:** 2026-01-26

---

## Current Position

**Milestone:** V2 -- Epic.dev Feature Parity
**Planning System:** CLEO (GSD roadmap retained for reference only)
**Last Completed:** All v2 waves (0-3) + independent tasks
**Status:** V2 implementation complete; pending deploy + testing

```
CLEO Progress: [##########] 36 of 36 tasks done (100%)
Wave 0: ✓ Complete (T021, T034-T036)
Wave 1: ✓ Complete (T025-T028)
Wave 2: ✓ Complete (T038-T041)
Wave 3: ✓ Complete (T042, T045; T044/T046 deferred to v3)
Independent: ✓ Complete (T023, T033, T048, T056, T060)
Testing: ✓ Complete (T061-T068)
```

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
- **Dual sidebar bug:** Chat page shows both explorer sidebar (left) AND ArtifactsSidebar (middle). Old ArtifactsSidebar should be removed.
- **Duplicate chat messages:** AI responses appear twice in chat history.
- ~6,500 lines duplicate code (~15-20%) — refactoring paused (Phase 15)
- 2 remaining security items (env validation, `any` types)
- Live Stripe keys in `.env.local` (should be test keys)
- Shared production DB for local dev (should be separate)

---

## SDLC & Environment Issues (Action Required)

| Issue | Severity | Fix |
|-------|----------|-----|
| **Live Stripe keys in dev** | High | Switch to `sk_test_` keys in `.env.local` |
| **Shared production DB** | High | Create separate Supabase project for dev |
| **Wrong BASE_URL** | Medium | Set to `http://localhost:3000` in `.env.local` |
| **No CI pipeline** | Medium | Add GitHub Actions: build + test on PRs |
| **No branch protection** | Low | Require PRs, prevent direct pushes to main |
| **drizzle-kit migrate broken** | Medium | Fix `api_keys` conflict or reset migration journal |

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

## Session Continuity

**Last session:** 2026-01-26
**Active branch:** `feature/T022-quick-start-mode`
**Dev server:** Working (`pnpm dev` at localhost:3000) — Next.js 15.5.9 stable
**Stopped at:** Fixed project creation bug (migration + startTransition), updated STATE.md
**Resume action:**
1. Commit all uncommitted v2 work to git + push
2. Deploy to prd.c1v.ai (Vercel)
3. Fix dual sidebar bug (remove ArtifactsSidebar from chat-client.tsx)
4. Fix duplicate chat messages bug
5. Start v3 planning (T044, T046, new features)

### Required Vercel Env Vars

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_URL` | Yes | Database connection |
| `AUTH_SECRET` | Yes | 32+ characters for JWT |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |

---

## Prior Work (Complete)

| Phase | Name | Milestone | Status |
|-------|------|-----------|--------|
| 1-3 | Test Stabilization, Security, Mobile Revamp | v1.1 | Complete |
| 9 | Data Model Depth | v2.0 | Complete |
| 10 | Generators & Agents | v2.0 | Complete |
| 11 | MCP Server (17 tools) | v2.0 | Complete |
| 15 | Code Cleanup & Claude Migration | v2.0 | Wave 1 Complete (Paused) |
| 12 | Educational Content (knowledge banks) | v2.0 | All 6 KBs enriched |

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

---

*State updated: 2026-01-26*
