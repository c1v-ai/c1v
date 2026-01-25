# Project State

**Project:** Product Helper
**Version:** 2.0 (In Progress)
**Updated:** 2026-01-25

---

## Current Focus

**Active Milestone:** v2.0 - Competitive Catch-Up (Epic.dev Parity)
**Current Phase:** Phase 12 - Educational Content Integration [ACTIVE]
**Last Activity:** 6 Deepened Knowledge Banks created 2026-01-25

### Phase 12 Educational Content Work (IN PROGRESS)

**Goal:** Add educational content throughout PRD creation to teach users requirements engineering methodology while they work.

**Core Vision:**
- Surface education during AI "thinking" states (when model is processing)
- Tooltips on key terms (actor, stakeholder, shall statement, etc.)
- Chat intros when entering new steps
- Validation feedback explaining WHY, not just WHAT

**Knowledge Banks Created (6 files):**

| # | File | Step | Content |
|---|------|------|---------|
| 1 | `knowledge-banks/01-CONTEXT-DIAGRAM.md` | 1.1 | Defining scope, system boundary, interactions |
| 2 | `knowledge-banks/02-USE-CASE-DIAGRAM.md` | 1.2 | Stakeholder scenarios, relationships |
| 3 | `knowledge-banks/03-SCOPE-TREE.md` | 1.3 | Deliverable breakdown, scope boundaries |
| 4 | `knowledge-banks/04-UCBD.md` | 2.1 | Delving technique, step-by-step flows |
| 5 | `knowledge-banks/05-FUNCTIONAL-REQUIREMENTS.md` | 2.2 | 10 properties, AND test, constants |
| 6 | `knowledge-banks/06-SYSML-ACTIVITY-DIAGRAM.md` | 2.3 | Visual workflow, requirement links |

**Each Knowledge Bank Contains:**
- Ideal PH-User interaction flow (conversation patterns)
- Thinking state messages (educational snippets during processing)
- Tooltips (15-word definitions for key terms)
- Common mistakes to catch (with PH responses)
- Validation errors (with WHY and HOW TO FIX)
- Completion celebrations (value reinforcement)
- Real examples (vehicle, toy catapult, robotic arm)

**Other Planning Files:**
- `.planning/phases/12-project-explorer/KNOWLEDGE-BANK-COMPLETE.md` - Original 3-box pattern
- `.planning/phases/12-project-explorer/KNOWLEDGE-BANK-DEEPENED.md` - Deepened version (consolidated)
- `.planning/phases/12-project-explorer/EDUCATIONAL-INTEGRATION-PLAN.md` - UI component specs

**Key Educational Concepts:**
1. **"The System" naming** - Don't name early to keep solution space open
2. **Delving Technique** - "If it has to do this, what else must it do?"
3. **Functional vs Structural** - WHAT not HOW
4. **10 Properties of Good Requirements** - Shall, clear, verifiable, etc.
5. **Requirement Constants** - Placeholders for unknown values
6. **The Contractor Test** - Would a contractor build exactly what you need?
7. **The AND Test** - Split compound requirements

**Next Steps:**
1. ✅ Deepen knowledge bank with ideal PH-user interactions — DONE
2. ⬜ Create ThinkingState component for AI processing states
3. ⬜ Create Tooltip component for key terms
4. ⬜ Implement educational content surfacing in chat flow
5. ⬜ Create `lib/education/knowledge-bank.ts` with TypeScript types

### Phase 15 Progress (PAUSED - Wave 1 Complete)

Code review identified **~6,500 lines of duplicate code** (~15-20% of codebase) and security issues.

**Plan file:** `.planning/phases/15-code-cleanup/PLAN.md`
**Status:** Paused after Wave 1 to focus on Phase 12 Educational Content

#### Wave 1: Quick Wins ✅ COMPLETE

| Task | Description | Status |
|------|-------------|--------|
| 15.0 | Migrate to Claude 4.5 (Anthropic) | ✅ Done |
| 15.1.1 | Fix rate limit double-counting bug | ✅ Done |
| 15.1.2 | Fix middleware session validation | ✅ Done |
| 15.2 | Delete duplicate `hooks/use-media-query.ts` | ✅ Done |

**Files Changed:**
- `lib/langchain/config.ts` - Now uses `@langchain/anthropic` with Claude Sonnet 4.5
- `app/api/mcp/[projectId]/route.ts` - Uses `getRateLimitStatus()` instead of double `checkRateLimit()`
- `middleware.ts` - Session expiration checked for ALL HTTP methods
- `lib/hooks/use-media-query.ts` - Added SSR safety check
- `app/(dashboard)/projects/[id]/chat/chat-client.tsx` - Updated import path
- `hooks/use-media-query.ts` - **DELETED** (duplicate)

#### Wave 2: Security (Next)

| Task | Description | Status |
|------|-------------|--------|
| 15.5 | Add comprehensive env validation | Pending |
| 15.8 | Replace `any` types in validation route | Pending |

#### Wave 3: Major Refactoring (Later)

| Task | Description | Status |
|------|-------------|--------|
| 15.3 | Create API auth middleware | Pending |
| 15.4 | Create base agent factory | Pending |

#### Wave 4: Cleanup (Later)

| Task | Description | Status |
|------|-------------|--------|
| 15.9 | Address TODOs | Pending |
| 15.10 | Extract magic numbers | Pending |

### Phase 11 Progress ✅ COMPLETE

| Batch | Plans | Status | Tasks |
|-------|-------|--------|-------|
| Batch 1 | 11-01 + 11-02 | ✅ COMPLETE | T043-T053 (8 commits) |
| Batch 2 | 11-03 | ✅ COMPLETE | T054-T063 (9 commits) |
| Batch 3 | 11-04 + 11-05 | ✅ COMPLETE | T064-T074 (3 commits) |
| Batch 4 | 11-06 | ✅ COMPLETE | Connections UI & Exports |

### Phase 11 Summary
- **17 MCP Tools:** All registered and functional
- **Connections UI:** `/projects/[id]/connections` page complete
- **Export Generators:** SKILL.md and CLAUDE.md working
- **API Key Management:** Full CRUD in UI
- **Integration Cards:** Claude Code, Cursor, VS Code, Windsurf

### Phase 9 Completion Status ✅ COMPLETE

| Sub-Phase | Component | Status | Notes |
|-----------|-----------|--------|-------|
| 9.1 | Enhanced Use Cases Schema | ✅ DONE | `lib/langchain/schemas.ts` updated |
| 9.2 | Schema Extraction Agent | ✅ DONE | `lib/langchain/agents/schema-extraction-agent.ts` |
| 9.3 | Tech Stack Agent | ✅ DONE | `lib/langchain/agents/tech-stack-agent.ts` |
| 9.4 | User Stories Agent | ✅ DONE | `lib/langchain/agents/user-stories-agent.ts` |
| DB | Schema + Migrations | ✅ DONE | Migration applied via Supabase MCP |
| API | Stories Routes | ✅ DONE | `app/api/projects/[id]/stories/*` |
| API | Tech Stack Route | ✅ DONE | `app/api/projects/[id]/tech-stack/route.ts` |
| Tests | Type Check & Tests | ✅ DONE | 317/317 tests passing |

### Fixes Applied This Session

1. **Migration Applied** - Used Supabase MCP `apply_migration` (drizzle-kit push had a bug)
2. **yaml package installed** - `pnpm add yaml` for OpenAPI export
3. **teamsRelations duplicate fixed** - Merged into single relation with projects
4. **sendInvitationEmail created** - `lib/email/send-invitation.ts` + fixed actions.ts
5. **api-spec-agent.ts type fix** - Cast through `unknown` for LLM output flexibility
6. **priority-scorer.test.ts fix** - Changed test to use valid ArtifactPhase

---

## Milestone Progress

### v1.1 - Stabilization (COMPLETE)

| Phase | Name | Status |
|-------|------|--------|
| 1 | Test Stabilization | ✓ Complete |
| 2 | Critical Security Fixes | ✓ Complete |
| 3 | Mobile-First & Web Revamp | ✓ Complete |

### v2.0 - Competitive Catch-Up (IN PROGRESS)

| Phase | Name | Status | Priority |
|-------|------|--------|----------|
| 9 | Data Model Depth | ✅ COMPLETE | P1 |
| 10 | Generators & Agents | ✅ COMPLETE | P1 |
| 11 | MCP Server | ✅ COMPLETE | P0 |
| 15 | Code Cleanup & Claude Migration | Wave 1 ✅ (Paused) | P1 INSERTED |
| **12** | **Project Explorer + Educational Content** | **← ACTIVE** | **P1 HIGH** |
| 13 | Data Views & Diagrams | Pending | P2 |
| 14 | Polish & Validation | Pending | P2 |

---

## Quick Stats

- **Tests:** 456/456 passing (100%)
- **Type Check:** Passing (9 pre-existing test file issues)
- **Critical Issues:** 2 remaining (env validation, any types)
- **Duplicate Code:** ~6,500 lines (~15-20% of codebase) - refactoring pending
- **Phase 9 Progress:** 100% COMPLETE
- **Phase 10 Progress:** 100% COMPLETE (all 4 plans done)
- **Phase 11 Progress:** 100% COMPLETE (all 4 batches done, 22 commits)
- **Phase 15 Progress:** 25% - Wave 1 COMPLETE (paused)
- **Phase 12 Progress:** Educational content - Knowledge bank created, needs deepening

---

## Phase 10 Plan

Per the plan in `~/.claude/plans/kind-enchanting-lightning.md`:

### 10.1 API Specification Route - COMPLETE
- **Status:** COMPLETE
- **Files Created:**
  - `app/api/projects/[id]/api-spec/route.ts` (306 lines)
  - `app/api/projects/[id]/api-spec/__tests__/route.test.ts` (392 lines)
- **Tests:** 17 passing
- **Commits:** `492c4e9`, `2d99d38`
- **Summary:** `.planning/phases/10-generators/10-01-SUMMARY.md`

### 10.2 Infrastructure Specification Generator - COMPLETE
- **Status:** COMPLETE
- **Files Created:**
  - `lib/langchain/agents/infrastructure-agent.ts` (535 lines)
  - `app/api/projects/[id]/infrastructure/route.ts` (242 lines)
- **Commits:** `052487c`, `7e9fce7`
- **Summary:** `.planning/phases/10-generators/10-02-SUMMARY.md`

### 10.3 Coding Guidelines Generator - COMPLETE
- **Status:** COMPLETE
- **Files Created:**
  - `lib/langchain/agents/guidelines-agent.ts` (477 lines)
  - `app/api/projects/[id]/guidelines/route.ts` (259 lines)
  - Zod validators added to `lib/db/schema/v2-validators.ts`
- **Commits:** `891e042`, `c8eb4bb`, `c9c8c1a`
- **Summary:** `.planning/phases/10-generators/10-03-SUMMARY.md`

### 10.4 System Architecture Diagram Generator - COMPLETE
- **Status:** COMPLETE
- **Files Modified:**
  - `lib/diagrams/generators.ts` (+562 lines)
  - `lib/diagrams/__tests__/generators.test.ts` (+241 lines)
- **Commits:** `cf5407d`, `79fdc94`
- **Summary:** `.planning/phases/10-generators/10-04-SUMMARY.md`

---

## Session Continuity

**Last session:** 2026-01-25
**Stopped at:** Welcome onboarding page `/welcome-test` - initial implementation done, needs more work
**Resume action:** Continue building `/welcome-test` page to match Epic.dev design:

### /welcome-test Session Work (2026-01-25)

**Files Created:**
- `components/onboarding/welcome-onboarding.tsx` - Two-path toggle ("I have a defined scope" | "Help me scope")
- `app/(dashboard)/welcome-test/page.tsx` - Test route
- `components/ui/select.tsx` + `components/ui/collapsible.tsx` - shadcn components installed

**Files Modified:**
- `app/(login)/actions.ts` - Sign-in/sign-up redirects now go to `/welcome-test`
- `app/(dashboard)/page.tsx` - "New Project" links go to `/welcome-test`
- `app/(dashboard)/projects/page.tsx` - "New Project" links go to `/welcome-test`

**Current State:** Basic toggle + "Let's get building" CTA working. Creates project and redirects to chat.

**Still TODO for /welcome-test:**
- Add sidebar with "MY PROJECTS" list (like Epic.dev)
- Add "What are you building?" text input with placeholder
- Add quick-start chips (SaaS backend, Public API, etc.)
- Add "What Product Helper will generate" value props section
- Add DB columns for project metadata (user confirmed: yes)
- Rename to production route

**Reference:** Epic.dev design in `/upgrade v2/epic.dev - project admin page/first-window-after-sign-in.png`

---

**Previous Resume Action:** Deepen the educational knowledge bank:
1. Extract more detailed examples from source guides (toy catapult, robotic arm, vehicle)
2. Add all the nuanced explanations (why lines are rectilinear, why no color, etc.)
3. Include common mistakes and how to avoid them
4. Add the complete 11 requirement rules with examples

**Files to Resume With:**
- `.planning/phases/12-project-explorer/KNOWLEDGE-BANK-COMPLETE.md` - Needs enrichment
- `.planning/phases/12-project-explorer/EDUCATIONAL-INTEGRATION-PLAN.md` - UI integration specs
- Source docs in `prd-doc-product-helper/converted/markdown/` - Deep educational content

**Key Source Files for Deepening:**
- `how to define scope .md` - Full course with video transcripts
- `How to build project requirements.md` - Full course with delving technique
- `ContextDiagramExample copy.md` - Step-by-step diagram building
- `ScopeTree_BuildingTheDeliverableTree.md` - Detailed tree building process

**API Key Status:** `@langchain/anthropic` installed, needs `ANTHROPIC_API_KEY` in `.env.local`

---

## Phase 11 Plan (MCP Server) ✅ COMPLETE

**Priority:** P0 CRITICAL - Competitive differentiator
**Goal:** Export project as MCP server for Claude Code/Cursor/VS Code
**Plans:** 6 plans across 3 waves
**Plan files:** `.planning/phases/11-mcp-server/`

### Wave 1 (parallel - 3 agents) - COMPLETE ✅
| Plan | Name | Agent | Status |
|------|------|-------|--------|
| 11-01 | MCP Server Framework | backend-architect | ✅ COMPLETE |
| 11-02 | API Key Management | devops-engineer | ✅ COMPLETE |
| 11-03 | Core MCP Tools (7) | backend-architect | ✅ COMPLETE |

### Wave 2 (parallel - 2 agents) - COMPLETE ✅
| Plan | Name | Agent | Status |
|------|------|-------|--------|
| 11-04 | Generator-Based Tools (4) | backend-architect | ✅ COMPLETE |
| 11-05 | Unique Tools (6) | langchain-engineer | ✅ COMPLETE |

### Wave 3 - COMPLETE ✅
| Plan | Name | Agent | Status |
|------|------|-------|--------|
| 11-06 | Connections UI & Exports | ui-ux-engineer | ✅ COMPLETE |

### MCP Tool Summary (17 tools) ✅ ALL IMPLEMENTED
- **7 Core:** PRD, database schema, tech stack, user stories, coding context, architecture, diagrams
- **4 Generator:** API specs, infrastructure, guidelines, story status update
- **6 Unique:** Validation status, GSD phases, CLEO tasks, invoke agent, Q&A, search

### Phase 11 Deliverables
- MCP JSON-RPC 2.0 server with 17 tools
- API key management (create, list, revoke)
- Rate limiting (100 req/min per key)
- Connections UI page (`/projects/[id]/connections`)
- Integration cards (Claude Code, Cursor, VS Code, Windsurf)
- SKILL.md and CLAUDE.md export generators

---

## Phase 11.5 Plan (First Impression Polish) - PRE-REQUISITE

**Priority:** HIGH - Must complete before Phase 12
**Goal:** Fix first impressions before explorer is seen

| Task | Name | Agent | Status |
|------|------|-------|--------|
| #25 | Fix post-login redirect to /projects | devops-engineer | Pending |
| #26 | First-time user onboarding flow | ui-ux-engineer | Pending |
| #27 | Enhanced project creation modal | ui-ux-engineer | Pending |

---

## Phase 12 Plan (Project Explorer UI) - REVISED

**Priority:** P2
**Goal:** Chat-centric project explorer with journey tracking
**Key Insight:** Chat is THE differentiator - must be prominent
**Tasks:** 27 total (3 in 11.5 + 24 in Phase 12)
**Plan file:** `.planning/phases/12-project-explorer/PLAN.md`

### UX Principles
1. **Chat prominent** - Persistent panel or primary section
2. **Empty states guide to chat** - Every empty section CTAs to chat
3. **Journey progress visible** - Discovery → Requirements → Technical → Validation → Export
4. **First-run experience** - New projects get welcoming guidance
5. **Mobile-first** - Specific patterns for chat+explorer

### Revised Explorer Tree
```
├── 💬 Chat & Discovery     ← PRIMARY (differentiator)
├── 📊 Overview (score, stats, next steps)
├── 📋 Product Requirements
├── 🔧 Technical Specs
├── 📐 Architecture
├── 📝 User Stories
├── ✅ Validation (SR-CORNELL)
├── 📖 Coding Guidelines
└── 🔗 Connections (MCP)
```

### Wave 0: UX Foundation (5 tasks) - Design First
| Task | Name | Priority | Status |
|------|------|----------|--------|
| #20 | Chat panel integration design | HIGH | Pending |
| #21 | Empty state designs | HIGH | Pending |
| #22 | Journey progress bar | MEDIUM | Pending |
| #23 | First-run experience | HIGH | Pending |
| #24 | Mobile chat+explorer patterns | MEDIUM | Pending |

### Wave 1: Core Components (4 tasks)
| Task | Name | Status |
|------|------|--------|
| #5 | Define explorer tree structure data | Pending |
| #3 | Create ExplorerTreeItem component | Pending |
| #4 | Create ExplorerSection component | Pending |
| #2 | Create ProjectExplorer component shell | Pending |

### Wave 2: Section Content Views (8 tasks, parallel)
| Task | Name | Status |
|------|------|--------|
| #6 | Overview section | Pending |
| #7 | Product Requirements sections | Pending |
| #8 | Technical Specifications sections | Pending |
| #9 | Architecture section | Pending |
| #10 | User Stories section | Pending |
| #11 | Validation section (SR-CORNELL) | Pending |
| #12 | Coding Guidelines section | Pending |
| #13 | Connections section (MCP) | Pending |

### Wave 3: Integration (6 tasks)
| Task | Name | Status |
|------|------|--------|
| #14 | Integrate into project layout | Pending |
| #15 | URL-based section navigation | Pending |
| #16 | Data fetching and loading states | Pending |
| #17 | Section completion indicators | Pending |
| #18 | Inline editing capability | Pending |
| #19 | Unit tests for explorer | Pending |

### Execution Order

```
1. Phase 11.5 (#25-#27) - First Impression Polish
2. Phase 12 Wave 0 (#20-#24) - UX Design Specs
3. Phase 12 Wave 1 (#2-#5) - Core Components
4. Phase 12 Wave 2 (#6-#13) - Section Views (parallel)
5. Phase 12 Wave 3 (#14-#19) - Integration
```

---

## Files Reference

### Phase 9 (Complete)
- `lib/langchain/agents/schema-extraction-agent.ts`
- `lib/langchain/agents/user-stories-agent.ts`
- `lib/langchain/agents/tech-stack-agent.ts`
- `lib/db/schema/v2-types.ts`
- `lib/db/schema/v2-validators.ts`
- `lib/db/migrations/0004_v2_data_model_depth.sql` ✅ Applied

### Phase 10 (Complete)

**All Complete:**
- `lib/langchain/agents/api-spec-agent.ts` (10-01)
- `app/api/projects/[id]/api-spec/route.ts` (10-01)
- `lib/langchain/agents/infrastructure-agent.ts` (10-02)
- `app/api/projects/[id]/infrastructure/route.ts` (10-02)
- `lib/langchain/agents/guidelines-agent.ts` (10-03)
- `app/api/projects/[id]/guidelines/route.ts` (10-03)
- Zod validators in `lib/db/schema/v2-validators.ts`
- `lib/diagrams/generators.ts` - System Architecture Diagram (10-04)

### Phase 11 (Complete) ✅

**Batch 1 Complete (11-01 + 11-02):**
- `lib/mcp/types.ts` - MCP protocol types ✅
- `lib/mcp/server.ts` - JSON-RPC handler ✅
- `lib/mcp/tool-registry.ts` - Tool registration ✅
- `lib/mcp/auth.ts` - API key utilities ✅
- `lib/mcp/rate-limit.ts` - Rate limiting ✅
- `app/api/mcp/[projectId]/route.ts` - Main MCP endpoint ✅
- `app/api/projects/[id]/keys/route.ts` - Key management ✅
- `app/api/projects/[id]/keys/[keyId]/route.ts` - Key revocation ✅
- `lib/mcp/__tests__/*.test.ts` - Server, auth, rate limit tests ✅

**Batch 2 Complete (11-03 Core Tools - 7 tools):**
- `lib/mcp/tools/core/get-prd.ts` ✅
- `lib/mcp/tools/core/get-database-schema.ts` ✅
- `lib/mcp/tools/core/get-tech-stack.ts` ✅
- `lib/mcp/tools/core/get-user-stories.ts` ✅
- `lib/mcp/tools/core/get-coding-context.ts` ✅
- `lib/mcp/tools/core/get-project-architecture.ts` ✅
- `lib/mcp/tools/core/get-diagrams.ts` ✅

**Batch 3 Complete (11-04 + 11-05 - 10 tools):**
- `lib/mcp/tools/generators/get-api-specs.ts` ✅
- `lib/mcp/tools/generators/get-infrastructure.ts` ✅
- `lib/mcp/tools/generators/get-coding-guidelines.ts` ✅
- `lib/mcp/tools/generators/update-story-status.ts` ✅
- `lib/mcp/tools/unique/get-validation-status.ts` ✅
- `lib/mcp/tools/unique/get-gsd-phases.ts` ✅
- `lib/mcp/tools/unique/get-cleo-tasks.ts` ✅
- `lib/mcp/tools/unique/invoke-agent.ts` ✅
- `lib/mcp/tools/unique/ask-question.ts` ✅
- `lib/mcp/tools/unique/search-context.ts` ✅

**Batch 4 Complete (11-06 UI & Exports):**
- `app/(dashboard)/projects/[id]/connections/page.tsx` - Connections UI ✅
- `components/connections/integration-cards.tsx` - IDE integration cards ✅
- `components/connections/api-key-management.tsx` - API key CRUD UI ✅
- `components/connections/connection-status.tsx` - Status indicator ✅
- `components/connections/export-section.tsx` - Download section ✅
- `lib/mcp/skill-generator.ts` - SKILL.md export ✅
- `lib/mcp/claude-md-generator.ts` - CLAUDE.md export ✅
- `app/api/projects/[id]/exports/skill/route.ts` - SKILL.md download ✅
- `app/api/projects/[id]/exports/claude-md/route.ts` - CLAUDE.md download ✅
