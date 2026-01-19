# UI/UX Fixes Implementation Plan

**Date:** 2026-01-18
**Branch:** feature/password-reset-flow

---

## Issues Identified

### Issue 1: Dashboard Navigation Confusion
- **Current:** Header "Dashboard" link goes to `/dashboard` which shows Team Settings
- **Expected:** "Dashboard" should go to Projects page (the main working area)
- **Files:** `app/(dashboard)/layout.tsx`

### Issue 2: Chat Input Box Issues
- **Current:** Single-line `<input type="text">` that doesn't expand with text
- **Expected:** Auto-expanding textarea that grows with content, wraps text
- **Files:** `components/chat/chat-input.tsx`

### Issue 3: Sidebar Default States
- **Current:** Actors section opens when it has items, hiding Diagrams below
- **Expected:** All sections collapsed by default EXCEPT Diagrams (most important)
- **Files:** `components/chat/artifacts-sidebar.tsx`

### Issue 4: Chat Box Visibility
- **Current:** Chat input is too low, requires scrolling to see
- **Expected:** Chat input always visible at bottom of viewport
- **Files:** `app/(dashboard)/projects/[id]/chat/page.tsx`

### Issue 5: Chat Content Not Filling Width
- **Current:** Chat conversation is stuck in the middle of the browser window with excessive horizontal padding/margins
- **Expected:** Chat content should fill the available width of the chat area, using the full content space
- **Files:** `app/(dashboard)/projects/[id]/chat/page.tsx`, `app/(dashboard)/projects/[id]/chat/chat-client.tsx`

### Issue 6: AI Should Summarize Extracted Data
- **Current:** After processing user's vision, AI just shows a diagram and asks "Would you like me to refine this?"
- **Expected:** AI should explicitly summarize what it extracted and created:
  - "Based on your vision, I've identified:"
  - **N Actors:** List actor names with their types (Primary User, Secondary User, External System)
  - **N Use Cases:** List use case names
  - **N Data Entities:** List entity names
  - **N Diagrams:** List diagram types generated
  - Brief explanation of system boundary, primary vs secondary actors, external systems
- **Files:** `lib/langchain/graphs/nodes/generate-artifact.ts` (modify AIMessage response)

---

## Agent Delegation

| Agent | Task | Files |
|-------|------|-------|
| ui-ux-engineer | Fix navigation links | `layout.tsx` |
| chat-engineer | Fix chat input textarea | `chat-input.tsx` |
| ui-ux-engineer | Fix sidebar defaults | `artifacts-sidebar.tsx` |
| ui-ux-engineer | Fix chat height | `page.tsx` |
| ui-ux-engineer | Fix chat width/centering | `page.tsx`, `chat-client.tsx` |
| chat-engineer | Add extraction summary to AI response | `generate-artifact.ts` |

---

## Implementation Details

### Fix 1: Navigation Links
```diff
# layout.tsx - Header nav
- <Link href="/dashboard" ...>Dashboard</Link>
+ <Link href="/projects" ...>Home</Link>

# User dropdown menu
- <Link href="/dashboard" ...>Dashboard</Link>
+ <Link href="/projects" ...>Home</Link>
```

### Fix 2: Chat Input Auto-expand
```diff
# chat-input.tsx
- <input type="text" ... />
+ <textarea
+   value={value}
+   onChange={onChange}
+   onKeyDown={handleKeyDown}
+   rows={1}
+   style={{ minHeight: '24px', maxHeight: '200px', resize: 'none' }}
+   ref={textareaRef}
+ />

+ // Auto-resize on input
+ useEffect(() => {
+   if (textareaRef.current) {
+     textareaRef.current.style.height = 'auto';
+     textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
+   }
+ }, [value]);
```

### Fix 3: Sidebar Default States
```diff
# artifacts-sidebar.tsx
- defaultOpen={actors.length > 0}
+ defaultOpen={false}

- defaultOpen={useCases.length > 0}
+ defaultOpen={false}

- defaultOpen={dataEntities.length > 0}
+ defaultOpen={false}

- defaultOpen={artifacts.length > 0}
+ defaultOpen={true}  // Diagrams always open
```

### Fix 4: Chat Height
```diff
# page.tsx
- <section className="flex-1 flex flex-col h-[calc(100vh-12rem)]">
+ <section className="flex-1 flex flex-col min-h-0">
```

---

## QA Testing Plan

### Pre-deployment Checklist
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Dev server starts without errors
- [ ] No console errors in browser

### End-to-End Tests

#### Test 1: Navigation
1. Click "Dashboard" in header nav
2. **Expected:** Redirects to `/projects` page
3. Click user avatar > "Home" dropdown item
4. **Expected:** Redirects to `/projects` page

#### Test 2: Chat Input
1. Navigate to any project chat
2. Type a long message (> 100 characters)
3. **Expected:** Textarea expands vertically, text wraps
4. Press Enter
5. **Expected:** Message sends (not new line)
6. Press Shift+Enter
7. **Expected:** New line inserted

#### Test 3: Sidebar States
1. Open project chat with extracted data
2. **Expected:** Actors, Use Cases, Data Entities sections are COLLAPSED
3. **Expected:** Diagrams section is OPEN
4. Click to expand Actors
5. **Expected:** Section expands with animation

#### Test 4: Chat Visibility
1. Navigate to project chat
2. **Expected:** Chat input visible at bottom without scrolling
3. Send several messages
4. **Expected:** Chat input remains visible
5. Resize browser window
6. **Expected:** Chat input stays at bottom

#### Test 5: Chat Width
1. Open project chat in browser (full width)
2. **Expected:** Chat messages use full available width (not centered with excessive margins)
3. Resize browser window wider
4. **Expected:** Chat content expands with window, uses available space

#### Test 6: Extraction Summary
1. Start new project, enter a vision statement
2. Let AI process and generate artifacts
3. **Expected:** AI message includes summary of extracted data:
   - Actor count and names with types
   - Use case count and names
   - Data entity count
   - Diagram types generated
4. **Expected:** AI explains what system boundary means, primary vs secondary actors

### Browser Testing
- Chrome (latest)
- Safari (latest)
- Mobile responsive (375px width)

---

## Rollback Plan
If issues arise, revert individual file changes:
```bash
git checkout HEAD -- apps/product-helper/app/\(dashboard\)/layout.tsx
git checkout HEAD -- apps/product-helper/components/chat/chat-input.tsx
git checkout HEAD -- apps/product-helper/components/chat/artifacts-sidebar.tsx
git checkout HEAD -- apps/product-helper/app/\(dashboard\)/projects/\[id\]/chat/page.tsx
git checkout HEAD -- apps/product-helper/app/\(dashboard\)/projects/\[id\]/chat/chat-client.tsx
git checkout HEAD -- apps/product-helper/lib/langchain/graphs/nodes/generate-artifact.ts
```
