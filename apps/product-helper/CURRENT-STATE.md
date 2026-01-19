# Product Helper - Current Project State

**Date:** 2026-01-18
**Branch:** main (just deployed from feature/password-reset-flow)
**Last Commit:** `8c59c27` - feat: Add LangGraph intake agent, UI/UX improvements, and artifacts sidebar

---

## What Was Completed

### 1. LangGraph Intake Agent
- Full state machine implementation for conversational PRD collection
- Located in: `lib/langchain/graphs/`
- Nodes: analyze-response, extract-data, generate-artifact, generate-response, check-sr-cornell, compute-next-question
- Checkpointer for conversation persistence
- Integration with chat API route

### 2. Artifacts Sidebar
- New component: `components/chat/artifacts-sidebar.tsx`
- Shows: Actors, Use Cases, Data Entities, Diagrams
- Collapsible sections with counts
- Desktop: persistent sidebar
- Mobile: sheet overlay with trigger button
- Real-time updates via SWR

### 3. UI/UX Fixes (Partially Complete)
| Fix | Status | Notes |
|-----|--------|-------|
| Navigation links (Dashboard → Home/Projects) | ✅ Done | `layout.tsx` updated |
| Chat input auto-expand (textarea) | ✅ Done | `chat-input.tsx` updated |
| Sidebar default states | ✅ Done | Collapsed except Diagrams |
| Chat layout height/positioning | ⚠️ IN PROGRESS | Input not anchored to bottom |

### 4. Other Changes
- Type guards for project data: `lib/db/type-guards.ts`
- Media query hooks: `hooks/use-media-query.ts`
- Sheet component: `components/ui/sheet.tsx`
- Database migration: `0003_gorgeous_lila_cheney.sql`
- Diagram generation improvements: `lib/diagrams/generators.ts`

---

## Known Issue: Chat Layout

**Problem:** The chat input box is in the middle of the page with empty space below it. It should be anchored to the bottom of the viewport.

**Root Cause:** The `use-stick-to-bottom` library and flex/grid layout aren't properly constraining height. The `absolute inset-0` positioning requires proper height propagation through the component hierarchy.

**Files Involved:**
- `components/chat/chat-window.tsx` - ChatLayout, StickyToBottomContent
- `app/(dashboard)/projects/[id]/chat/chat-client.tsx` - Parent container
- `app/(dashboard)/projects/[id]/chat/page.tsx` - Page wrapper
- `app/(dashboard)/projects/[id]/chat/layout.tsx` - Route layout

**Debug Code Added:**
The `chat-window.tsx` file has debug logging code (agent log regions) that sends dimension data to a local endpoint. This can be removed once the layout is fixed.

**Attempted Solutions:**
1. `absolute inset-0` with grid layout - didn't work
2. Flex layout with `h-full` - didn't work
3. Inline styles on StickToBottom - didn't work
4. Various combinations of `min-h-0`, `overflow-hidden` - partial success

**Next Steps to Fix:**
1. Check if StickToBottom accepts/passes className or style props
2. Try removing StickToBottom temporarily to verify flex layout works
3. Consider using CSS `position: fixed` for the footer instead
4. Or restructure to put footer outside the scrollable area entirely

---

## File Structure (Key Files)

```
apps/product-helper/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Main dashboard layout (nav fixed)
│   │   └── projects/[id]/chat/
│   │       ├── page.tsx            # Chat page wrapper
│   │       ├── layout.tsx          # Chat-specific layout
│   │       └── chat-client.tsx     # Main chat client component
│   └── api/chat/projects/[projectId]/
│       ├── route.ts                # Chat API endpoint
│       └── langgraph-handler.ts    # LangGraph integration
├── components/chat/
│   ├── chat-window.tsx             # ChatLayout, ChatMessages (NEEDS FIX)
│   ├── chat-input.tsx              # Auto-expanding textarea (DONE)
│   ├── artifacts-sidebar.tsx       # Sidebar component (DONE)
│   └── collapsible-section.tsx     # Reusable collapsible (DONE)
├── lib/
│   ├── langchain/graphs/           # LangGraph implementation
│   └── db/type-guards.ts           # Type safety for project data
└── hooks/
    └── use-media-query.ts          # Responsive hooks
```

---

## How to Resume

1. **Start dev server:**
   ```bash
   cd apps/product-helper
   pnpm dev
   ```

2. **Test the chat page:**
   - Navigate to http://localhost:3000/projects/[id]/chat
   - Check if input is at bottom of viewport

3. **Fix the layout issue:**
   - Focus on `chat-window.tsx` - the ChatLayout and StickyToBottomContent components
   - The goal: messages scroll, input stays fixed at bottom

4. **Remove debug code:**
   - Search for `#region agent log` in chat-window.tsx
   - Remove the useEffect blocks with fetch calls to 127.0.0.1:7246

---

## Environment

- Node.js with pnpm
- Next.js 15 App Router
- Drizzle ORM with PostgreSQL
- LangChain.js / LangGraph
- Vercel AI SDK for chat streaming
- Tailwind CSS + shadcn/ui
