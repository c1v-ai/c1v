# Product Helper - Current Status

**Last Updated:** 2026-01-18 (Evening)
**Branch:** feature/password-reset-flow

---

## What Was Implemented

### 1. LangGraph Intake System (Complete)
Replaced the simple prompt-driven chat with a stateful, multi-agent LangGraph state machine.

**Files Created:**
- `lib/langchain/graphs/types.ts` - IntakeState, ArtifactPhase, UserIntent types
- `lib/langchain/graphs/channels.ts` - State reducers and channel configuration
- `lib/langchain/graphs/utils.ts` - Message formatting, token estimation utilities
- `lib/langchain/graphs/edges.ts` - Routing functions between nodes
- `lib/langchain/graphs/checkpointer.ts` - State persistence to database
- `lib/langchain/graphs/intake-graph.ts` - Main graph assembly with 6 nodes

**Graph Nodes (`lib/langchain/graphs/nodes/`):**
- `analyze-response.ts` - Intent detection (PROVIDE_INFO, STOP_TRIGGER, CONFIRM, etc.)
- `extract-data.ts` - Structured data extraction from conversation
- `compute-next-question.ts` - Question generation based on data gaps
- `check-sr-cornell.ts` - SR-CORNELL validation for artifact readiness
- `generate-artifact.ts` - Mermaid diagram generation
- `generate-response.ts` - Conversational response generation

**Database:**
- Added `graphCheckpoints` table for LangGraph state persistence
- Added `intakeState` jsonb column to `projectData` table
- Migration: `lib/db/migrations/0003_gorgeous_lila_cheney.sql` (applied)

---

### 2. Chat Artifacts Sidebar (Complete - This Session)
Implemented a collapsible sidebar showing real-time extracted data and diagrams while chatting.

**New Files Created:**
| File | Purpose |
|------|---------|
| `hooks/use-media-query.ts` | Responsive breakpoint hooks (useIsDesktop, useIsMobile, useIsTablet) |
| `app/(dashboard)/projects/[id]/chat/layout.tsx` | Full-width layout override for chat route (removes max-w-5xl constraint) |
| `components/chat/collapsible-section.tsx` | Animated collapsible sections using @radix-ui/react-collapsible |
| `components/chat/artifacts-sidebar.tsx` | Main sidebar with completeness bar, Actors, Use Cases, Data Entities, Diagrams sections |
| `lib/db/type-guards.ts` | Type-safe JSONB parsing utilities (parseActors, parseUseCases, parseProjectData, etc.) |
| `components/ui/sheet.tsx` | Shadcn Sheet component for mobile drawer |

**Files Modified:**
| File | Changes |
|------|---------|
| `app/(dashboard)/projects/[id]/chat/page.tsx` | Pass `projectData` and `artifacts` to client component |
| `app/(dashboard)/projects/[id]/chat/chat-client.tsx` | Integrated sidebar, SWR for real-time updates, mobile sheet, diagram popup state |
| `app/globals.css` | Added collapsible animation keyframes (`animate-collapsible-down`, `animate-collapsible-up`) |
| `components/chat/index.ts` | Export new components (ArtifactsSidebar, CollapsibleSection) |
| `package.json` | Added `@radix-ui/react-collapsible` dependency |

**Features Implemented:**
- **Desktop (≥1024px):** 288px collapsible sidebar with expand/collapse toggle button
- **Mobile (<768px):** Floating FAB button opens Sheet drawer from left
- **Real-time updates:** SWR with 3-second delayed refetch after message save (allows extraction to complete)
- **Type safety:** Zod-validated parsers for JSONB fields
- **Sections:** Completeness progress bar, Actors, Use Cases, Data Entities, Diagrams
- **Diagram popup:** Click diagram in sidebar to view full-screen via DiagramPopup component
- **Empty state:** Shows encouragement message when no data extracted yet

---

## Current State

### Working
- LangGraph system functional with feature flag `USE_LANGGRAPH="true"`
- **Sidebar displays** extracted data and diagrams in real-time
- Questions are contextual and follow SR-CORNELL priority order
- Sequence diagrams render correctly (invalid syntax auto-cleaned)
- Database migration applied

### Known Issues
- **Tests:** 15 failing (pre-existing) - class diagram relationship parsing, priority scorer, completion detector
- **Sidebar text clipping:** "Completeness" label may be slightly clipped on left edge (minor CSS fix applied)
- **Cache issues:** If routes return 404, clear `.next` cache and restart dev server

---

## To Pick Up

### Immediate Next Steps
1. **Restart Claude Code** to load `frontend-design` plugin (just installed)
2. **Test sidebar thoroughly** - Verify all sections expand/collapse, diagrams open correctly
3. **Fix sidebar text clipping** - May need additional left padding adjustments
4. **Fix remaining tests** - Priority scorer and completion detector tests

### Installed Plugin
```
frontend-design - For high-quality UI/UX implementation
```

### Feature Flag
```env
USE_LANGGRAPH="true"  # Enable LangGraph system
```

### Run Commands
```bash
# Start dev server
cd /Users/davidancor/Documents/MDR/c1v/apps/product-helper && pnpm dev

# Run tests
pnpm test

# TypeScript check
npx tsc --noEmit

# Clear cache if 404 errors
rm -rf .next && pnpm dev
```

---

## Architecture Overview

### Chat with Sidebar Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Product Helper    [Dashboard] [Projects] [Chat]           [U]  │
├─────────────────────────────────────────────────────────────────┤
│  ← Back to Projects                                             │
│  biznosss  [intake]                                             │
│  [Overview] [Chat*] [Data] [Diagrams] [Settings]               │
├──────────────────┬──────────────────────────────────────────────┤
│  COMPLETENESS    │                                              │
│  ████████░░ 73%  │     CHAT MESSAGES                           │
│                  │                                              │
│  👥 Actors    6  │     [View Sequence Diagram]                 │
│  📄 Use Cases 3  │     → Click to open diagram viewer          │
│  🗄 Entities  3  │                                              │
│  📊 Diagrams  1  │     Would you like me to refine...          │
│    [Sequence]    │                                              │
│                  │     ┌──────────────────────────────────────┐ │
│  [<] Collapse    │     │ Share your thoughts...        [Send] │ │
└──────────────────┴─────┴──────────────────────────────────────┴─┘
```

### Data Flow
```
Server Component (page.tsx)
    ↓
getProjectById() → { project, projectData, artifacts }
    ↓
ProjectChatClient (client component)
    ├── useSWR('/api/projects/{id}') → Real-time updates
    ├── useChat() → Streaming messages
    ├── ArtifactsSidebar → Shows extracted data
    └── onFinish → saveAssistantMessage() → setTimeout(mutate, 3000)
```

---

## Files Structure (Sidebar Feature)

```
apps/product-helper/
├── hooks/
│   └── use-media-query.ts          # NEW: Responsive hooks
├── components/
│   ├── chat/
│   │   ├── artifacts-sidebar.tsx   # NEW: Main sidebar component
│   │   ├── collapsible-section.tsx # NEW: Expandable sections
│   │   ├── chat-client.tsx         # MODIFIED: Added sidebar integration
│   │   ├── diagram-popup.tsx       # Existing: Used for sidebar clicks
│   │   └── index.ts                # MODIFIED: Export new components
│   └── ui/
│       └── sheet.tsx               # NEW: Shadcn mobile drawer
├── lib/
│   └── db/
│       └── type-guards.ts          # NEW: JSONB parsing utilities
└── app/
    └── (dashboard)/
        └── projects/
            └── [id]/
                └── chat/
                    ├── layout.tsx  # NEW: Full-width layout
                    ├── page.tsx    # MODIFIED: Pass data to client
                    └── chat-client.tsx  # MODIFIED: Sidebar + SWR
```

---

## Plan Files (Reference)
- `PLAN_API_INTEGRATION.md` - API integration details
- `PLAN_INTAKE_AGENT.md` - Intake agent design
- `PLAN_LANGGRAPH_STATE_MACHINE.md` - State machine architecture

---

## Dependencies Added This Session
```json
{
  "@radix-ui/react-collapsible": "^1.1.12"
}
```
Sheet component installed via: `npx shadcn@latest add sheet`

---

## Test Results
```
Test Suites: 3 failed, 4 passed, 7 total
Tests:       15 failed, 257 passed, 272 total
```
Failing tests are pre-existing issues in:
- `lib/diagrams/__tests__/generators.test.ts` - Class diagram parsing
- `lib/langchain/graphs/__tests__/priority-scorer.test.ts` - Gate scoring
- `lib/langchain/graphs/__tests__/completion-detector.test.ts` - Stop phrases
