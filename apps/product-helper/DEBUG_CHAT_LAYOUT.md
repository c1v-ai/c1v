# Debug Plan: Chat Box Stuck in Middle of Page

## Problem
Chat input box is positioned in the middle of the page with empty space below it, instead of staying at the bottom of the viewport.

## Hypotheses

### Hypothesis A: Wrong Layout Structure
**Theory:** `StickyToBottomContent` uses `flex flex-col` instead of `grid grid-rows-[1fr,auto]`, breaking `use-stick-to-bottom` library expectations.

**Evidence to collect:**
- Layout type used in StickyToBottomContent (should be grid, currently flex)
- Whether library expects grid structure

### Hypothesis B: scrollRef on Wrong Element
**Theory:** `scrollRef` is attached to an inner div instead of the outer container, preventing the library from managing scroll correctly.

**Evidence to collect:**
- scrollRef element dimensions (scrollHeight, clientHeight, offsetHeight)
- contentRef element dimensions
- Whether scrollRef is on the correct element per library docs

### Hypothesis C: Extra Wrapper Div Breaking Layout
**Theory:** Extra wrapper div with `absolute inset-0` in `ChatLayout` breaks height calculation chain.

**Evidence to collect:**
- ChatLayout wrapper dimensions and position
- Whether absolute positioning is working correctly
- Viewport height vs wrapper height

### Hypothesis D: Parent Container Height Issues
**Theory:** Parent containers lack proper height constraints, so `absolute inset-0` doesn't fill viewport correctly.

**Evidence to collect:**
- Chat area container dimensions
- Computed height values
- Viewport height comparison
- Whether flex containers properly constrain children

### Hypothesis E: StickToBottom Inline Styles Conflict
**Theory:** Inline styles on `StickToBottom` component conflict with library's internal styles.

**Evidence to collect:**
- Whether inline styles override library behavior
- Library's expected props/structure

## Instrumentation Added

1. **StickyToBottomContent** - Logs layout type and ref dimensions
2. **ChatLayout** - Logs wrapper dimensions and positioning
3. **ChatAreaContainer** - Logs container dimensions and computed styles

## Next Steps

1. User reproduces the issue
2. Analyze logs to confirm/reject hypotheses
3. Fix based on evidence
4. Verify fix with logs
