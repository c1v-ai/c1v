# Context Handoff

**Date:** 2026-02-08
**Branch:** main
**Last Commit:** `6e67cf7` - refactor: consolidate /projects and / routes to /home

---

## Current State

### Milestone: V2 -- Epic.dev Feature Parity

**Completed Phases:** 1, 2, 3, 4, 5, 7, 8, 15, 16, 17, 18
**Phase 6 (Content Section Views + UX Polish):** 5 of 6 plans complete. Only 06-07 (Quick PRD Mode) remains.
**Generator Quality:** KBs 07-12 created + 5 agents wired (uncommitted)

### What Just Happened (Feb 7-8)

1. **Phase 6-05** (`7f8f858`) — Plain language prompts, educational loading states, node-aware thinking, completion toasts
2. **Phase 6-04** (`0067f86`) — Overview redesign (QuickInstructions + ArtifactPipeline), vision metadata leak fix, spinning loaders
3. **Extraction fix** (`43630d3`) — Token limit 3K→20K, Zod defaults, nav items, duplicate message fix
4. **Route consolidation** (`900afe5`, `6e67cf7`) — /welcome-test → /home, /projects → /home
5. **KBs 07-12 created** — 6 decision-guidance Knowledge Banks (entity discovery, schema design, tech stack selection, API patterns, infrastructure patterns, coding standards)
6. **Generator agents wired** — 5 agents now load KB content for richer output
7. **Codebase map refreshed** — All 7 `.planning/codebase/` documents updated

### Uncommitted Work

| File | Change |
|------|--------|
| `lib/education/generator-kb.ts` | NEW: KB loading utility for generator agents |
| `lib/langchain/agents/schema-extraction-agent.ts` | KB 07+08 injection |
| `lib/langchain/agents/tech-stack-agent.ts` | KB 09 injection |
| `lib/langchain/agents/api-spec-agent.ts` | KB 10 injection |
| `lib/langchain/agents/infrastructure-agent.ts` | KB 11 injection |
| `lib/langchain/agents/guidelines-agent.ts` | KB 12 injection |
| `lib/langchain/quick-start/orchestrator.ts` | Generator KB import |
| `.planning/codebase/*.md` | 7 refreshed codebase map documents |
| `.planning/STATE.md` | Updated to reflect current state |
| `.planning/ROADMAP.md` | Phase status updates |
| `.planning/REQUIREMENTS.md` | Checkbox updates |

---

## Next Steps

1. **Commit KB + Agent Work** — Stage and commit all uncommitted changes
2. **Execute Phase 6-07: Quick PRD Mode** — Plan: `.planning/phases/06-content-section-views-ux-polish/06-07-PLAN.md`. 5 tasks: ambiguity scorer → wire into chat → delete regex entities → extract enriched-context util → progress streaming
3. **Push to Main** — Multiple commits pending push
4. **Phase 9 (Inline Editing) or Phase 10 (Mobile Redesign)** — After Phase 6 completes

---

## Key Files

- **State:** `.planning/STATE.md`
- **Requirements:** `.planning/REQUIREMENTS.md`
- **Roadmap:** `.planning/ROADMAP.md`
- **Knowledge Banks:** `.planning/phases/12-project-explorer/knowledge-banks/` (01-12, all created)
- **Generator KB Utility:** `lib/education/generator-kb.ts`
- **Generator Agents:** `lib/langchain/agents/` (schema-extraction, tech-stack, api-spec, infrastructure, guidelines, user-stories)
- **Intake Pipeline:** `lib/langchain/agents/intake/` (LangGraph flow)
- **Quick Start Orchestrator:** `lib/langchain/quick-start/orchestrator.ts`
- **06-07 Plan:** `.planning/phases/06-content-section-views-ux-polish/06-07-PLAN.md`
- **06-07 Context:** `.planning/phases/06-content-section-views-ux-polish/06-07-CONTEXT.md`
- **Codebase Map:** `.planning/codebase/` (7 documents, refreshed 2026-02-08)

---

## Tech Stack

- **LLM:** Anthropic Claude Sonnet 4.5 via `@langchain/anthropic`
- **Framework:** Next.js 15 (App Router, RSC, Turbopack)
- **Agent Orchestration:** LangChain.js + LangGraph
- **Database:** PostgreSQL via Drizzle ORM (Supabase-hosted, local at localhost:54322)
- **UI:** Tailwind CSS 4 + Radix UI + shadcn/ui
- **Auth:** Custom JWT (jose) + bcryptjs

---

## Commands to Resume

```bash
# Check current state
git log --oneline -10
git status

# Start local Supabase
pnpm db:start

# Start dev server (port 3000)
pnpm dev

# Run tests
pnpm test

# Sign in: test@test.com / admin123
```
