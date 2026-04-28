# Phase 7: Hierarchical FFBDs

## Prerequisites
- [ ] You have completed [Phase 6 — Shortcuts and Reference Blocks](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md)
- [ ] Your top-level FFBD has 7-15 blocks and is becoming difficult to elaborate further
- [ ] At least one block clearly hides significant internal complexity

## Context (Why This Matters)

A single FFBD can hold **7–15 blocks** comfortably. Beyond that, readability collapses. But real systems easily have 50, 100, or 500 distinct functions.

The solution is **hierarchical decomposition**: take a single complex block and expand it into its own lower-level FFBD. This is exactly like **extracting a function** in code — the top-level call stays simple while the detail lives in its own scope.

Hierarchy does three things simultaneously:
1. **Manages complexity** — no single diagram becomes unreadable.
2. **Enables incremental detail** — high-level diagrams work even when lower-level ones are still vague.
3. **Preserves traceability** — every block ID maps back through the hierarchy to the top.

## Instructions

### Step 7.1: Identify Which Blocks to Decompose

Not every block needs a sub-diagram. Decompose a block when:

- It hides **significant internal complexity** (more than 3–4 sub-steps)
- Different **teams** need to collaborate inside it (decomposition surfaces the interfaces)
- It has **logic gates** buried inside (AND/OR/IT flows hidden within one block)
- Its runtime is **disproportionate** to other blocks — it "looks like one block but takes 90% of the time"
- **Team discussion** keeps circling back to "wait, what happens inside there?"

Leave a block as a single block when:
- Its internals are simple, implicit, or already well-understood by the team
- It represents a single atomic operation
- Decomposing it would not produce meaningful new insight

### Step 7.2: Title the Sub-Diagram

The sub-diagram's title is the **function ID + name** of the block being decomposed.

**Examples:**

| Top-Level Block | Sub-Diagram Title |
|-----------------|-------------------|
| `F.3 Serve Shopper Session` | **Function 3 : Serve Shopper Session** |
| `F.1.3 Configure Storefront` (second-level block) | **Function 1.3 : Configure Storefront** |
| `F.2.5.3 Resolve Address` (third-level block) | **Function 2.5.3 : Resolve Address** |

**Format:** `Function <N[.M.K...]> : <Descriptive Name>`

### Step 7.3: Number Sub-Blocks Using the Hierarchy

Sub-blocks take their parent's function number as a prefix and add a sequential suffix:

| Parent FFBD | Sub-Block IDs |
|-------------|---------------|
| Function 3 : Serve Shopper Session | `F.3.1`, `F.3.2`, `F.3.3`, ..., `F.3.8` |
| Function 3.4 : Search Products | `F.3.4.1`, `F.3.4.2`, `F.3.4.3`, ... |
| Function 3.4.2 : Apply Filters | `F.3.4.2.1`, `F.3.4.2.2`, ... |

There is **no depth limit** — the numbering scheme extends indefinitely. `F.2.5.3.9.7.12` is a valid ID.

**Each segment traces back up the chain:**
- `F.2` — Function 2 FFBD
- `F.2.5` — Block 5 within Function 2
- `F.2.5.3` — Block 3 within the Function 2.5 FFBD
- `F.2.5.3.9` — Block 9 within the Function 2.5.3 FFBD
- ... and so on

**The key benefit:** any block ID can be traced back up the chain to see exactly where it fits in the bigger picture.

### Step 7.4: Maintain Connection Consistency

Connections at the higher-level block should be **visible** in its lower-level FFBD — typically as reference blocks at the entry/exit points.

If the top-level diagram shows:
```
F.2 ──► F.3 ──► F.4
```

Then the "Function 3" sub-diagram should show:
```
[F.2 Ref] ──► F.3.1 ──► F.3.2 ──► ... ──► F.3.N ──► [F.4 Ref]
```

This lets a reader pick up the sub-diagram cold and understand its context.

This is a **best practice** in FFBDs and a **requirement** in related standards (IDEF0).

### Step 7.5: Choose Between Reference Blocks and Hierarchical Decomposition

Revisiting the distinction from Phase 6:

| Situation | Use |
|-----------|-----|
| A block's internals are a **sub-function** of the parent | **Hierarchical FFBD** (title matches the parent block) |
| A separate concern that happens to connect (e.g., error handler, maintenance flow) | **Reference block** (pointer to a peer diagram) |

**When in doubt, hierarchical decomposition is usually the right choice** for decomposing complexity. Reference blocks shine for specialized flows (error handling, initialization, shutdown) that exist alongside the main operation.

### Step 7.6: Handle Repeating Functional Blocks

It is valid to repeat functional blocks in the same FFBD, but the approach depends on the situation:

| Situation | Approach |
|-----------|----------|
| Same function, **same I/O** — you're sending the same output to multiple consumers | Use an **arrow shortcut** (don't duplicate) |
| Same function, **different I/O** — the function is identical but inputs/outputs differ | **Repeat** the block (it's genuinely used in multiple places) |
| Similar name, **different internal behavior** | **Rename** with suffixes (A/B) to distinguish — "Confirm Sensor Node Contact A" vs. "Confirm Sensor Node Contact B" |

**Why this matters:** if two blocks share a name but the internal behavior is actually different, they are misrepresented as identical. Differentiate with suffixes.

## Worked Example: Decomposing F.3 Serve Shopper Session

The top-level FFBD from Phase 5 has `F.3 Serve Shopper Session` as one block. But inside F.3 is the heart of the platform — browsing, searching, cart management, checkout initiation. This is the clearest candidate for decomposition.

### Sub-diagram: Function 3 : Serve Shopper Session

```
[F.2 Ref] ──► F.3.1 Authenticate Shopper ──► F.3.2 Render Storefront ──►
  Onboard
  Merchant      (IT) ──► F.3.3 Browse / Search ──► F.3.4 Render Results ──►
                         F.3.5 Add to Cart ──► F.3.6 Update Cart State ──►
                         (OR) ──► F.3.7a Continue Shopping (default) ──► (IT)
                              ──► F.3.7b Initiate Checkout (if shopper clicks checkout)
                         ▲
                         └───── Until shopper checks out or abandons ─────┘
                                                                                │
                                                                                ▼
                                                                           [F.4 Ref]
                                                                           Process
                                                                            Order
```

**Decomposition analysis:**

| Sub-block | Level | Notes |
|-----------|-------|-------|
| F.3.1 Authenticate Shopper | High | Could be decomposed further (SSO, guest checkout, social login) — defer for now |
| F.3.2 Render Storefront | Medium | Invokes CDN, page assembly — handled via the [CDN & Networking KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/cdn-networking-kb.md) downstream |
| F.3.3 Browse / Search | High | Could itself decompose into F.3.3.1 Query Cache → F.3.3.2 Query Index → F.3.3.3 Rank Results |
| F.3.4–F.3.6 | Medium | Sequential cart-interaction steps |
| (IT) wrapping F.3.3–F.3.7 | — | Inner loop: shopper iterates between browsing and cart until checkout or abandonment |
| (OR) at F.3.7 | — | Architectural alternative: continue shopping *or* initiate checkout |

### What a reader sees

**Reading the top-level FFBD:** 7 blocks, 1 IT loop, 1 AND fork. Understandable in 30 seconds.

**Reading the Function 3 sub-diagram:** 7 sub-blocks, 1 inner IT loop, 1 OR branch, reference blocks to Functions 2 and 4 at entry/exit. Still understandable at a glance.

**If F.3.3 proves complex:** decompose into *Function 3.3 : Browse / Search* with sub-blocks F.3.3.1 through F.3.3.N. The IDs trace all the way back: F.3.3.2 is unambiguously the second sub-block of Function 3.3, which is the third sub-block of Function 3, which is the third function of the top-level system.

## Common Mistakes

### Mistake 1: Over-Decomposing
**Symptom:** Every block has its own sub-diagram, even trivial ones.
**Why it breaks:** You generate 40 sub-diagrams nobody reads.
**Fix:** Only decompose blocks with genuine internal complexity (3+ sub-steps, multiple teams, hidden gates).

### Mistake 2: Under-Decomposing
**Symptom:** A single top-level diagram has 30 blocks.
**Why it breaks:** Unreadable; loses the purpose of a high-level view.
**Fix:** Pick the 3–5 most complex blocks and give each its own sub-diagram.

### Mistake 3: Broken Hierarchy Numbering
**Symptom:** Sub-diagram titled "Function 3" has sub-blocks labeled F.1.1, F.1.2.
**Why it breaks:** Readers cannot trace IDs through the hierarchy.
**Fix:** Sub-block IDs must use the parent function number as prefix — `F.3.1`, `F.3.2`, ...

### Mistake 4: Missing Connection References
**Symptom:** A sub-diagram starts and ends with no reference blocks — a reader has no idea where it fits.
**Fix:** Add `F.<N-1> Ref` at the entry and `F.<N+1> Ref` at the exit (or wherever flow comes in/goes out).

### Mistake 5: Naming Drift Across Levels
**Symptom:** Top-level block is "F.3 Serve Shopper Session" but the sub-diagram is titled "Function 3 : Shopper Flow."
**Why it breaks:** Name drift breaks traceability.
**Fix:** Sub-diagram title must match the parent block's functional name exactly.

## Validation Checklist (STOP-GAP)
- [ ] Every decomposed block has a sub-diagram titled with the parent's function ID and name
- [ ] Sub-block IDs use the parent function number as prefix
- [ ] Numbering within each sub-diagram is left-to-right, top-to-bottom
- [ ] Entry/exit connections are represented as reference blocks at sub-diagram boundaries
- [ ] Complex blocks (3+ internal steps) are decomposed; trivial blocks are not
- [ ] Names match across levels — no drift between top-level block name and sub-diagram title
- [ ] Repeated blocks: use shortcuts for same-I/O duplicates; rename with suffixes when internal behavior differs
- [ ] No single diagram exceeds ~15 blocks — if it does, further decompose

> **STOP: Do not proceed to Phase 8 until all checks pass.**

## Output Artifact

A hierarchical set of FFBDs: top-level + one or more sub-diagrams for complex blocks. Every block ID traces back through the hierarchy.

For our e-commerce platform: top-level FFBD + Function 3 (Serve Shopper Session) + Function 4 (Process Order) + Function 5 (Fulfill Order) as candidate decompositions.

## Handoff to Next Phase

Functional blocks capture what the system does. But systems depend on **external inputs** — things the system consumes but does not produce (credentials, policies, sensor data, regulations). Phase 8 introduces **EFFBD data blocks** to represent these inputs cleanly.

---

**Next →** [08 — EFFBD Data Blocks](08_EFFBD-DATA-BLOCKS.md) | **Back:** [06 — Shortcuts and Reference Blocks](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md)
