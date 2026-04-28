---
schema: phase-file.v1
phase_slug: formatting-rules
module: 3
artifact_key: module_3/formatting-rules
engine_story: m3-ffbd
engine_path: apps/product-helper/.planning/engines/m3-ffbd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/3-ffbd/01-phase-docs/FORMATTING-RULES.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# FFBD Formatting Rules — Quick Reference

## §1 Decision context

This phase contributes to **m3-ffbd** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m3-ffbd.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m3-ffbd` (`apps/product-helper/.planning/engines/m3-ffbd.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `formatting-rules` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 3, phase: formatting-rules}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_3/formatting-rules`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd)

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by `engine-fail-closed` and converted into machine-readable rules registered under the `artifact_key` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is `error` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to `warn`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry `mathDerivationSchema` (or `mathDerivationMatrixSchema` for M5 sites per TC1 `tc1-wave-c-complete`). Each derivation:

- references inputs by `source` (upstream artifact + field path);
- carries `formula` (LaTeX-safe ASCII) + `units` + `computed_value`;
- attaches `base_confidence` + `confidence_modifiers` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into `decision_audit` (`0011b_decision_audit.sql`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter `kb_chunk_refs`:** populated by the embedding pipeline (`engine-pgvector` agent, G8/G9 — `apps/product-helper/lib/langchain/engines/kb-embedder.ts`).
- **Runtime retrieval:** `searchKB(query, top_k, { module: 3, phase: 'formatting-rules' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

A one-page card summarizing every formatting rule across Module 3. Use this during the final polish pass.

---

## Functional Blocks

| Rule | Requirement |
|------|-------------|
| Structure | Two-part: **header box** (top, smaller, contains ID) + **body** (bottom, larger, contains functional name) |
| Corners | **Square only** — rounded corners are reserved for EFFBD data blocks |
| Text alignment | **Centered** in the body |
| Block sizes | Use **2–3 consistent sizes** throughout the diagram (not all identical, not all different) |
| Font | Consistent font and size for all block bodies in a diagram |
| Color | Black on white (color reserved for Red/Yellow/Green uncertainty marking) |
| Block IDs | Unique per diagram, in header box, following hierarchical numbering `F.<N>.<M>` |
| Block names | **Functional** (verb + object), never **structural** (vendor/library name) |
| Numbering order | **Left-to-right, top-to-bottom** within each diagram |

## Arrows

| Rule | Requirement |
|------|-------------|
| Trigger arrow | **Solid** line, filled arrowhead — immediately follows |
| Precedes arrow | **Dashed** line, filled arrowhead — occurs sometime later |
| Line style | **Rectilinear only** (90-degree angles; no curves or diagonals for operational flow) |
| Arrowhead | **Filled** (not open, not hollow) |
| Thickness | Same as block borders, or **one setting thicker** |
| Contact | Must be in **direct contact** with edges of connected blocks (no gaps) |
| Dash visibility | Precedes arrows must be long enough for dashes to be clearly visible |
| Overlaps | **Avoid**; use arrow shortcuts or rearrange blocks |
| Arrow jumps | Acceptable (half-circle bump at intersection) but inferior to clean layout |

## Arrow Labels

| Rule | Requirement |
|------|-------------|
| Position | Typically **above** the arrow (can be broken for readability) |
| Style | **Italicized** |
| Size | Same or **one size smaller** than block body text |
| Multiple labels | Separated by **commas** (or semicolons) |
| Association | Must be **unambiguously** associated with a single arrow |

## Logic Gates (IT, OR, AND)

| Rule | Requirement |
|------|-------------|
| Shape | Circle (with gate letters inside) |
| Pairing | Every gate has a **matching pair** (open + close), like curly brackets `{ }` |
| Size | **All gates same size** throughout the diagram |
| Text | **All caps, bold** inside the circle |
| Font | Same font size for all gates; within **one size** of block body text |
| IT termination | Return arrow must carry an **explicit end condition** (e.g., *Until session ends*) |
| OR labeling | Outgoing paths carry **condition labels**; at most one unlabeled default allowed |
| AND labeling | Usually **unlabeled**; if labeling any (e.g., resource allocation), label **all** |
| Nesting | Gates can be nested; inner pairs must close before outer pairs |

## Decision Diamonds

| Rule | Requirement |
|------|-------------|
| Shape | **Diamond** (◇) |
| Use case | **Runtime evaluation** (if-then-else); not architectural alternatives (use OR for those) |
| Paths | Labeled Yes/No or with explicit conditions |

## Arrow Shortcuts

| Rule | Requirement |
|------|-------------|
| Shape | **Circle** with a capital letter |
| Pairing | Matching letter pairs (one exit, one entry) |
| Labeling | First = A, second = B, third = C, ...; if >26, use AA, BB, etc. (but rethink layout) |
| Scope | **Within a single diagram only**; cross-diagram uses reference blocks |

## Reference Blocks

| Rule | Requirement |
|------|-------------|
| Structure | Same as functional block (header + body), square corners |
| ID | `F.<N> Ref` indicates this is a reference to a function defined in another diagram |
| Name | Matches the referenced block's functional name **exactly** (no drift) |
| Placement | Typically at sub-diagram entry/exit points to show parent context |
| Connection consistency | Connections into/out of a higher-level block should appear as reference blocks in its sub-diagram |

## Data Blocks (EFFBD)

| Rule | Requirement |
|------|-------------|
| Shape | **Rounded-corner rectangle** (or oval) |
| Text | **Noun** (data name), not a verb + object phrase |
| Arrows | Typically drawn **at an angle** to distinguish from operational arrows |
| Use | **Sparingly** — prefer arrow labels for trivial data |
| Quantity | ≤ 3–5 per diagram (or justification required) |

## Diagram-Level

| Rule | Requirement |
|------|-------------|
| Title format | `Function <N[.M.K...]> : <Descriptive Name>` |
| Flow direction | **Left to right** (top to bottom is acceptable for vertical layouts) |
| Color | Black and white only (color reserved for uncertainty marking) |
| Block count | **7–15 blocks** per diagram (decompose into sub-diagrams beyond that) |
| Spacing | Adequate whitespace; no cramped layouts |

## Uncertainty Marking (from Phase 9)

| Color | Meaning |
|-------|---------|
| 🟢 **Green** | Well-understood, standard patterns, low risk |
| 🟡 **Yellow** | Concept is solid but edge cases need resolution |
| 🔴 **Red** | Least defined, open questions remain, highest risk — address first |

---

## Final Pass Checklist

Before declaring an FFBD finished, verify:

- [ ] All blocks: square corners, functional names, unique IDs, consistent sizing
- [ ] All arrows: rectilinear, filled heads, correct type (trigger vs. precedes), touching block edges
- [ ] All gates: matched pairs, correct type (IT/OR/AND vs. decision), termination conditions on IT, condition labels on OR
- [ ] All data blocks: rounded corners, noun labels, angled arrows, used sparingly
- [ ] All sub-diagrams: titled with parent function ID, sub-blocks numbered with parent prefix
- [ ] All reference blocks: named correctly, at sub-diagram boundaries
- [ ] No overlapping arrows; shortcuts used where crossings unavoidable within a diagram
- [ ] Diagram-level: 7–15 blocks, left-to-right flow, black-and-white (plus uncertainty colors)
- [ ] Naming: no structural names anywhere in the FFBD

---

*Formatting rules for Module 3 (FFBD). For the full phase-by-phase workflow, see [00 — Module Overview](00_MODULE-OVERVIEW.md).*

