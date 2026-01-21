# Product Helper - Current Project State

**Date:** 2026-01-19
**Branch:** `feature/roadmap-improvements-phase8-9` (PR pending)
**Last Commit:** `a19e5bd` - feat(roadmap): Add Phase 8 (Web/Mobile Revamp) and Phase 9 (Planning Agents Upgrade)

---

## Current Work: Roadmap Improvements (PR Ready)

**Status:** Branch pushed, PR needs to be created/merged

**PR URL:** https://github.com/c1v-ai/c1v/pull/new/feature/roadmap-improvements-phase8-9

### What Was Done
1. **ROADMAP-1.1.md updated** with:
   - Phase 8: Complete Web-App & Mobile Revamp (PWA, mobile-first design)
   - Phase 9: Planning Agents & Codebase Upgrade (skills library)

2. **Skills Library created** (`.claude/skills/`):
   - `nextjs-best-practices.md`
   - `langchain-patterns.md`
   - `testing-strategies.md`
   - `database-patterns.md`
   - `api-design.md`
   - `README.md` (index)
   - `__tests__/skills.test.ts` (45 tests, all passing)

3. **gsd-planner.md updated** with `<skills_library>` section

### To Resume
```bash
cd apps/product-helper
git checkout feature/roadmap-improvements-phase8-9
# Create PR at: https://github.com/c1v-ai/c1v/pull/new/feature/roadmap-improvements-phase8-9
# Or merge directly if approved
```

### Note
- 15 pre-existing test failures (documented in roadmap Phase 1) are unrelated to this work
- All 45 new skills tests pass

---

## Previous Work (Completed)

### 1. LangGraph Integration Fixed
- **Issue:** Chatbot wasn't using LangGraph updates on production
- **Root Cause:** `USE_LANGGRAPH` environment variable was not set in Vercel
- **Fix:** Added `USE_LANGGRAPH=true` to Vercel environment variables and redeployed

### 2. Chat Layout Fixed
- **Issue:** Chat input was floating in the middle of the page with empty space below
- **Root Cause:** `use-stick-to-bottom` library wasn't getting proper height constraints through the component hierarchy
- **Fix:** Completely replaced the library with simple flex layout

**Files Modified:**
- `app/(dashboard)/layout.tsx` - Changed `min-h-screen` to `h-screen`, wrapped children in `flex-1` container
- `app/(dashboard)/projects/[id]/chat/page.tsx` - Removed hardcoded `calc(100vh - 236px)` height
- `components/chat/chat-window.tsx` - Replaced `use-stick-to-bottom` with simple flex layout

**New ChatLayout Structure:**
```tsx
<div className="flex flex-col h-full">
  {/* Scrollable messages area */}
  <div className="flex-1 overflow-y-auto py-4 px-4">
    {content}
  </div>

  {/* Fixed footer with input */}
  <div className="flex-shrink-0 px-4 pb-8 pt-2 border-t">
    {footer}
  </div>
</div>
```

---

## Previous Work (Still Active)

### LangGraph Intake Agent
- Full state machine implementation for conversational PRD collection
- Located in: `lib/langchain/graphs/`
- Nodes: analyze-response, extract-data, generate-artifact, generate-response, check-sr-cornell, compute-next-question
- Checkpointer for conversation persistence
- Integration with chat API route

### Artifacts Sidebar
- Component: `components/chat/artifacts-sidebar.tsx`
- Shows: Actors, Use Cases, Data Entities, Diagrams
- Desktop: persistent sidebar
- Mobile: sheet overlay with trigger button
- Real-time updates via SWR

---

## File Structure (Key Files)

```
apps/product-helper/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout (h-screen + flex-1 wrapper)
│   │   └── projects/[id]/chat/
│   │       ├── page.tsx            # Chat page (no hardcoded height)
│   │       ├── layout.tsx          # Chat-specific layout
│   │       └── chat-client.tsx     # Main chat client component
│   └── api/chat/projects/[projectId]/
│       ├── route.ts                # Chat API endpoint
│       └── langgraph-handler.ts    # LangGraph integration
├── components/chat/
│   ├── chat-window.tsx             # ChatLayout with simple flex (FIXED)
│   ├── chat-input.tsx              # Auto-expanding textarea
│   ├── artifacts-sidebar.tsx       # Sidebar component
│   └── collapsible-section.tsx     # Reusable collapsible
├── lib/
│   ├── langchain/graphs/           # LangGraph implementation
│   └── db/type-guards.ts           # Type safety for project data
└── hooks/
    └── use-media-query.ts          # Responsive hooks
```

---

## Environment Variables (Vercel)

Make sure these are set in Vercel dashboard:
- `USE_LANGGRAPH=true` - Enables LangGraph state machine for chat
- `OPENAI_API_KEY` - For LLM calls
- `DATABASE_URL` - PostgreSQL connection
- Other standard Next.js/auth variables

---

## How to Resume

1. **Start dev server:**
   ```bash
   cd apps/product-helper
   pnpm dev
   ```

2. **Test the chat page:**
   - Navigate to http://localhost:3000/projects/[id]/chat
   - Input should be at bottom with proper padding
   - Messages should scroll independently

3. **Deploy to Vercel:**
   - Push changes to main branch
   - Vercel will auto-deploy

---

## Tech Stack

- Node.js with pnpm
- Next.js 15 App Router
- Drizzle ORM with PostgreSQL
- LangChain.js / LangGraph
- Vercel AI SDK for chat streaming
- Tailwind CSS + shadcn/ui

---

## Session: 2026-01-19 - Enterprise Skills & Agent Updates

### What Was Done

1. **New Enterprise Skills Created:**
   - `.claude/skills/security-patterns.md` - OWASP Top 10, JWT, XSS, CSRF, injection prevention
   - `.claude/skills/code-quality.md` - Naming conventions, function design, type safety

2. **MCP Tools Documentation:**
   - `.claude/get-shit-done/references/mcp-tools.md` - MCPSearch patterns
   - `.claude/get-shit-done/references/agent-skill-matrix.md` - Agent→skill mapping

3. **Skills README Updated** with plugin mapping, enterprise quality standards

4. **GSD Agents Updated:**
   - `gsd-planner.md` - Added security-patterns, code-quality, enterprise enforcement
   - `gsd-executor.md` - Added `<enterprise_quality>` section
   - `gsd-verifier.md` - Added `<enterprise_quality_checks>` section
   - `gsd-debugger.md` - Added MCP loading pattern, skill references
   - `gsd-codebase-mapper.md` - Added skill references
   - `gsd-phase-researcher.md` - Added MCPSearch requirement
   - `gsd-project-researcher.md` - Added MCPSearch requirement

### Installed Plugins (Need Restart)

| Plugin | Command | Purpose |
|--------|---------|---------|
| feature-dev | `/feature-dev` | Guided feature development |
| security-guidance | `/security-guidance` | Security vulnerability analysis |
| code-simplifier | `/code-simplifier` | Code complexity analysis |
| agent-sdk-dev | `/agent-sdk-dev:new-sdk-app` | Agent SDK apps |
| atlassian | `/atlassian:*` | Jira/Confluence integration |
| serena | - | (Verify after restart) |

### MCP Tools Available

| MCP Server | Purpose |
|------------|---------|
| Context7 | Library documentation |
| Supabase | Database operations |
| Playwright | Browser automation |
| Memory | Knowledge graph |

**CRITICAL:** Use MCPSearch before invoking MCP tools:
```
MCPSearch: "select:mcp__plugin_context7_context7__resolve-library-id"
```

### Enterprise Quality Standards (Now Enforced by Agents)

**Security (BLOCKER):** Input validation, no injection, auth on protected routes, secrets in env vars

**Code Quality (WARNING):** No `any` types, functions < 30 lines, descriptive names

**Performance (INFO):** Server components, no async waterfalls, dynamic imports

### New Files Created

```
.claude/skills/security-patterns.md
.claude/skills/code-quality.md
.claude/get-shit-done/references/mcp-tools.md
.claude/get-shit-done/references/agent-skill-matrix.md
```

### To Resume

1. Restart Claude Code to load new plugins
2. Verify with `/feature-dev --help`
3. MCP tools require MCPSearch first - see `references/mcp-tools.md`
