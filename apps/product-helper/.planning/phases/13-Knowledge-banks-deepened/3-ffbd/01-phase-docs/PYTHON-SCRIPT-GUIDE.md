---
schema: phase-file.v1
phase_slug: python-script-guide
module: 3
artifact_key: module_3/python-script-guide
engine_story: m3-ffbd
engine_path: apps/product-helper/.planning/engines/m3-ffbd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/3-ffbd/01-phase-docs/PYTHON-SCRIPT-GUIDE.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Python Script Guide — Pixel-Perfect FFBD Slide Generation

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `python-script-guide` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 3, phase: python-script-guide}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_3/python-script-guide`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 3, phase: 'python-script-guide' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Everything you need to adapt [`create_ffbd_thg_v3.py`](create_ffbd_thg_v3.py) and [`generate_ffbd_fixes.py`](generate_ffbd_fixes.py) to produce pixel-perfect CESYS523-compliant PowerPoint slides for a new system. Written so an LLM agent (or you) can regenerate the scripts for any project without re-deriving the constants.

---

## Why These Scripts Exist

Manual PowerPoint drafting cannot reliably hit the CESYS523 formatting spec:

- Font sizes off by 2pt across blocks
- Arrow weights inconsistent
- Block sizes drift as you duplicate
- Reference blocks drawn as normal rectangles instead of the bracket style
- Decision diamonds used where OR gates are correct
- Arrows missing filled triangle arrowheads
- Titles right-aligned or centered instead of left-aligned

These scripts **encode the spec as code**, so every element is pixel-perfect and identical across slides. They are the single source of truth for what a professional FFBD looks like on paper.

---

## Part 1 — The CESYS523 Engineering Excellence Spec (Encoded in Constants)

Copy these exactly into any adapted script. They are the spec.

### Slide Canvas

| Dimension | Value | Why |
|-----------|-------|-----|
| Slide width | **30 inches** | Wide-canvas layout for horizontal FFBD flow |
| Slide height | **20 inches** | Accommodates IT return loops and multi-row layouts |

Set via the master template (`FFBD_Template - MASTER.pptx`) rather than code — the script opens the template and inherits its dimensions.

### Typography

| Element | Size (pt) | Style | Why |
|---------|-----------|-------|-----|
| **Title** | **28** | Bold, left-aligned | CESYS523 guideline: titles left-aligned, upper-left corner |
| **Block body text** | **24** | Regular, centered | Primary readability target |
| **Block header (ID)** | **20** | Regular, centered | One size smaller than body |
| **Gate text** | **22** | **All caps, bold**, centered | Within one size of body, bold+caps for gate emphasis |
| **Arrow/edge labels** | **20** | **Italic**, same size as header | Italicized to distinguish from block text |
| **Subtitle** | **20** | Italic, gray (RGB 80,80,80) | Optional context line under title |

**In code:**
```python
FS_TITLE = 28
FB = 24     # Body text
FH = 20     # Header (block ID)
FG = 22     # Gate text (IT, OR, AND)
FL = 20     # Label text (italic)
```

### Line Weights

| Element | Weight | Why |
|---------|--------|-----|
| **Block borders** | **2.0 pt** | Baseline weight |
| **Arrows** | **2.5 pt** | *One setting thicker* than borders (per CESYS523) |

**In code:**
```python
LINE_W = Pt(2.5)     # Arrows
BORDER_W = Pt(2.0)   # Block + gate borders
```

### Block Dimensions (Inches)

| Element | Constant | Value | Notes |
|---------|----------|-------|-------|
| Functional block width | `BW` | **2.8** | Fits 2-3 lines of 24pt text |
| Functional block body height | `BBH` | **1.4** | |
| Functional block header height | `BHH` | **0.50** | Smaller than body |
| Gate diameter | `GD` | **1.1** | Oval shape; same size across all gates |
| Reference block width | `RW` | **2.8** | Same as functional block per CESYS523 |
| Reference block height | `RH` | **1.9** | Total height = BBH + BHH |

**In code:**
```python
BW = 2.8;   BBH = 1.4;  BHH = 0.50
GD = 1.1
RW = 2.8;   RH = 1.9
```

### Colors

| Purpose | RGB | Hex |
|---------|-----|-----|
| Primary border, text | `(0, 0, 0)` | `#000000` — pure black |
| Default fill | `(255, 255, 255)` | `#FFFFFF` — pure white |
| Core-value highlight (one block per top-level flow) | `(255, 235, 235)` | `#FFEBEB` — light pink |
| Red uncertainty | `(239, 68, 68)` | `#EF4444` — optional for uncertainty coloring |
| Yellow uncertainty | `(250, 204, 21)` | `#FACC15` |
| Green uncertainty | `(34, 197, 94)` | `#22C55E` |

### Arrow Style

| Property | Value |
|----------|-------|
| Line | Rectilinear (90° only) |
| Arrowhead | Filled triangle, medium width, medium length |
| Dash style for precedes arrows | `cxn.line.dash_style = 2` |

Arrowhead XML (because python-pptx doesn't expose this directly):
```python
def _set_arrowhead(connector):
    spPr = connector._element.find(qn('p:spPr'))
    if spPr is None: return
    ln = spPr.find(qn('a:ln'))
    if ln is None:
        ln = etree.SubElement(spPr, qn('a:ln'))
    tail = etree.SubElement(ln, qn('a:tailEnd'))
    tail.set('type', 'triangle')
    tail.set('w', 'med')
    tail.set('len', 'med')
```

### Reference Block Style

Per CESYS523 the reference block is **bracket-style**: two vertical bracket lines with ticks at top and bottom, text between them.

```python
def add_ref_block(slide, cx, cy, ref_id, ref_name):
    w, h = RW, RH
    x, y = cx - w/2, cy - h/2
    bk_w = 0.25  # bracket tick width
    # Left bracket: vertical + top/bottom ticks
    add_line_seg(slide, x, y, x, y + h, border=True)
    add_line_seg(slide, x, y, x + bk_w, y, border=True)
    add_line_seg(slide, x, y + h, x + bk_w, y + h, border=True)
    # Right bracket: mirror
    add_line_seg(slide, x + w, y, x + w, y + h, border=True)
    add_line_seg(slide, x + w, y, x + w - bk_w, y, border=True)
    add_line_seg(slide, x + w, y + h, x + w - bk_w, y + h, border=True)
    # Text: ID bold above, name below
```

### Gate Style (IT / OR / AND)

- Shape: **OVAL** (circle)
- Diameter: `GD = 1.1` inches
- Fill: white, border: black 2.0pt
- Text: **all caps, bold**, 22pt, centered
- Text content: `"IT"`, `"OR"`, or `"AND"` (never `"AND gate"`, etc.)

### Title Placement

- Upper-left corner, left-aligned
- Position: `Inches(0.5), Inches(0.5)` with width `Inches(28)`
- Subtitle below at `Inches(0.5), Inches(1.4)` with italic gray text

---

## Part 2 — Helper Function API

These are the composable primitives. Every FFBD script built on this spec should expose this API (function signatures, not implementations):

### Drawing Primitives

| Function | Purpose |
|----------|---------|
| `add_func_block(slide, cx, cy, fid, fname, fill=WHITE)` | Two-part functional block at center (cx, cy) |
| `add_ref_block(slide, cx, cy, ref_id, ref_name)` | Bracket-style reference block |
| `add_gate(slide, cx, cy, text)` | OVAL gate with bold-caps label (`"IT"`, `"OR"`, `"AND"`) |
| `add_line_seg(slide, x1, y1, x2, y2, arrowhead=False, dashed=False, border=False)` | Single rectilinear line |
| `add_arrow(slide, points, dashed=False)` | Multi-segment rectilinear arrow with filled head (2-pt = elbow, 3+ = chained) |
| `add_line(slide, points)` | Multi-segment rectilinear line (no arrowhead) — used for path segments before a final arrow |
| `add_label(slide, x, y, text, width=4.0, italic=True, fs=FL)` | Italic label above/beside an arrow |
| `add_title(slide, text, subtitle=None)` | Upper-left title with optional italic subtitle |

### Edge Helpers

Used to compute connection points without doing math inline:

| Helper | Returns |
|--------|---------|
| `blk_l(cx)` | Left edge of functional block at center `cx` (= `cx - BW/2`) |
| `blk_r(cx)` | Right edge |
| `blk_t(cy)` | Top edge |
| `blk_b(cy)` | Bottom edge |
| `gate_l(cx) / gate_r(cx) / gate_t(cy) / gate_b(cy)` | Gate edges (= cx ± GD/2) |
| `ref_l(cx) / ref_r(cx)` | Reference block edges |

**Why this matters:** using `blk_r(xs[0])` instead of `xs[0] + 1.4` makes the script refactor-safe. Change `BW` once and every connection updates.

### Orchestration

| Function | Purpose |
|----------|---------|
| `delete_all_slides(prs)` | Clear template slides so script starts fresh |
| `set_anchor_mid(shape)` | Center-anchor text vertically in a shape (python-pptx default is top) |

---

## Part 3 — Adapting the Script for a New System

Use this workflow to produce a new `create_ffbd_<system>_v1.py` from the THG v3 reference:

### Step 1: Copy the Reference Script

```bash
cp create_ffbd_thg_v3.py create_ffbd_<system>.py
```

### Step 2: Update File Paths

At the top of the script:

```python
TEMPLATE = "<absolute path to FFBD_Template - MASTER.pptx>"
OUTPUT   = "<absolute path to output .pptx>"
```

### Step 3: Keep All Constants Unchanged

Do **not** modify:
- `LINE_W`, `BORDER_W`, `BW`, `BBH`, `BHH`, `GD`, `RW`, `RH`
- `FB`, `FH`, `FG`, `FL`, `FS_TITLE`
- Color constants (except to add new uncertainty colors)

These **are** the engineering-excellence spec. Drifting from them defeats the purpose of the script.

### Step 4: Plan Slides From Your FFBD

For each slide you need, list:

1. **Title** (exact text) — e.g., `"E-Commerce Platform — Top-Level FFBD"`
2. **Subtitle** (optional) — e.g., `"F.1 Provision → F.7 Generate Reports"`
3. **Blocks** — list of `(cx, cy, fid, fname)` tuples in drawing order
4. **Gates** — list of `(cx, cy, type)` tuples where type is `"IT"`, `"OR"`, or `"AND"`
5. **Reference blocks** — list of `(cx, cy, ref_id, ref_name)` tuples at diagram boundaries
6. **Arrows** — list of point-chains `[(x1,y1), (x2,y2), ...]` with dashed flag for precedes arrows
7. **Labels** — list of `(x, y, text)` tuples for arrow labels

### Step 5: Lay Out the Canvas

**Coordinate system:** x=0 at left, y=0 at top, all in inches, slide is 30×20.

**Main flow Y:** use `YM = 9.5` to keep the flow vertically centered with room for IT return rows below.

**Main flow X positions:** space blocks and gates with at least **2.5 inches between centers** to avoid crowding. Typical gap: 3.0-4.0 inches.

**IT return rows:** `YR1 = 13.5`, `YR2 = 15.0`, `YR3 = 16.5` — drop 1.5 inches per additional IT loop so return arrows don't overlap.

**Branch rows (for OR gates):** `YU = 6.5` (upper), `YL = 12.5` (lower) relative to `YM = 9.5`.

### Step 6: Write the Slide Code

Pattern per slide:

```python
s = prs.slides.add_slide(blank)
add_title(s, "<Slide Title>", "<Optional Subtitle>")

YM = 9.5
xs = [2.5, 6.0, 9.5, 13.0, 16.5, 20.0, 23.5]  # block center X positions

# Blocks (left to right)
add_func_block(s, xs[0], YM, "F.1", "First\nFunction")
add_func_block(s, xs[1], YM, "F.2", "Second\nFunction")
# ... highlight the core-value block with fill=CORE_FILL

# Gates (IT / OR / AND)
IT_O = 8.0; IT_C = 11.0
add_gate(s, IT_O, YM, "IT"); add_gate(s, IT_C, YM, "IT")

# Arrows (2-point = elbow; 3+-point = chained rectilinear)
add_arrow(s, [(blk_r(xs[0]), YM), (blk_l(xs[1]), YM)])
# IT return loop
add_arrow(s, [(IT_C, gate_b(YM)), (IT_C, YR1), (IT_O, YR1), (IT_O, gate_b(YM))])

# Labels
add_label(s, IT_O - 0.5, YR1 - 0.7, "Until session ends", width=6.0)
```

### Step 7: Handle OR-Gate Branching

For an OR gate that splits into upper/lower branches:

```python
X_OR_O = 5.5; JX_O = 6.3  # OR open + branch junction X
X_OR_C = 11.0; MX_C = 10.2  # OR close + merge junction X
YU = 6.5; YM = 9.5; YL = 12.5

add_gate(s, X_OR_O, YM, "OR")
add_gate(s, X_OR_C, YM, "OR")

# OR open → branch junction
add_line(s, [(gate_r(X_OR_O), YM), (JX_O, YM)])
# Junction → upper branch
add_arrow(s, [(JX_O, YM), (JX_O, YU), (blk_l(X_UPPER), YU)])
# Junction → lower branch
add_arrow(s, [(JX_O, YM), (JX_O, YL), (blk_l(X_LOWER), YL)])
# Upper → merge junction (line, not arrow — the arrow hits OR close)
add_line(s, [(blk_r(X_UPPER), YU), (MX_C, YU), (MX_C, YM)])
# Lower → merge
add_line(s, [(blk_r(X_LOWER), YL), (MX_C, YL), (MX_C, YM)])
# Merge → OR close
add_arrow(s, [(MX_C, YM), (gate_l(X_OR_C), YM)])
```

### Step 8: Handle AND-Gate Parallelism

Same pattern as OR, but label the outgoing branches only if showing resource allocation — otherwise leave unlabeled. The gate text is `"AND"`.

### Step 9: Handle Precedes Arrows

Pass `dashed=True` to `add_arrow()`:

```python
add_arrow(s, [(blk_r(xs[5]), YM), (blk_l(xs[6]), YM)], dashed=True)
add_label(s, (xs[5] + xs[6]) / 2 - 0.6, YM - 0.4, "Daily / weekly", italic=True)
```

### Step 10: Add Reference Blocks at Sub-Diagram Boundaries

For a sub-diagram, start with a reference block to the parent function and end with one pointing forward:

```python
add_ref_block(s, 2.5, YM, "F.2 Ref", "Onboard Merchant")
# ... sub-blocks F.3.1, F.3.2, ... ...
add_ref_block(s, 27.5, YM, "F.4 Ref", "Process Order")
```

### Step 11: Run the Script

```bash
pip install python-pptx lxml
python3 create_ffbd_<system>.py
```

### Step 12: Open the Output in PowerPoint and Visually Verify

The script produces pixel-perfect geometry, but you must check:

- [ ] No overlapping arrows (add shortcuts or reroute if any)
- [ ] All blocks fit their text (increase `BW` or wrap differently if truncated)
- [ ] IT return arrows don't cross block rows
- [ ] Gate pairs visually match (same size, same vertical alignment)
- [ ] Precedes arrows show dashes clearly (lengthen if they look solid)

---

## Part 4 — The Fixes Script Pattern

[`generate_ffbd_fixes.py`](generate_ffbd_fixes.py) shows the **surgical-fix** pattern — when you discover a specific slide has a bug after iteration, generate a replacement slide and swap it in manually.

### When to Use a Fixes Script vs. Re-run the Main Script

| Situation | Approach |
|-----------|----------|
| Adding a new slide, changing many slides | Re-run main `create_ffbd_<system>.py` |
| Fixing 1-2 slides with specific bugs | Write a `generate_ffbd_fixes.py` that produces ONLY those replacement slides |
| You've manually annotated other slides and don't want to lose edits | Fixes script — preserves manual changes elsewhere |

### Fixes-Script Structure

```python
# 1. Reuse helper functions (copy from main script — DO NOT drift from the spec)
# 2. Create a NEW Presentation (not the final output file)
prs = Presentation(TEMPLATE)
delete_all_slides(prs)
blank = prs.slide_layouts[6]

# 3. Build ONLY the slides needing replacement
s = prs.slides.add_slide(blank)
# ... corrected layout ...

# 4. Save to a _fixes.pptx file (not overwriting the main output)
prs.save("THG_FFBD_fixes.pptx")

# 5. User opens both .pptx files, copies the fix slides into the main deck
```

### Common Fixes

From [`generate_ffbd_fixes.py`](generate_ffbd_fixes.py) docstring:

- **Remove duplicate connector** (accidentally drawn twice in the main script)
- **Bridge a missing connection** (F.5.9 → F.5.10 gap)
- **Reroute a path** (F.5.7g → F.5.10 via a different waypoint)

### Do NOT Modify Constants in a Fixes Script

The fixes script must use the **same** `BW`, `BBH`, `LINE_W`, `FB`, etc. as the main script. Copy the constants block verbatim. Any drift and the replacement slide won't match the rest of the deck.

---

## Part 5 — Common Pitfalls

### Pitfall 1: python-pptx Anchors Text at Top by Default

**Symptom:** Block body text sits at the top of the body rectangle, not centered vertically.
**Fix:** Call `set_anchor_mid(shape)` after adding text to every block/gate.

### Pitfall 2: Connectors Don't Have Arrowheads by Default

**Symptom:** Lines without triangle arrowheads at the destination.
**Fix:** Call `_set_arrowhead(cxn)` on every connector that should be an arrow. `add_arrow()` handles this; `add_line_seg(arrowhead=True)` handles it; plain `add_line_seg()` does not.

### Pitfall 3: Precedes Dashes Invisible at Short Distances

**Symptom:** A dashed arrow looks solid.
**Fix:** Ensure the arrow length is > 1.5 inches. If the connection is genuinely short, rearrange blocks.

### Pitfall 4: Overlapping IT Return Arrows

**Symptom:** Two IT loops' return paths overlap at the same Y.
**Fix:** Assign each IT loop a distinct return Y (`YR1`, `YR2`, `YR3`) — drop 1.5 inches per additional loop.

### Pitfall 5: Block Text Truncated

**Symptom:** Long function names spill out of the block body.
**Fix:** Either (a) insert `\n` to wrap manually, (b) increase `BW` globally, or (c) rename to shorter functional phrase.

### Pitfall 6: Gate-Body Vertical Alignment Drift

**Symptom:** A gate sits slightly higher or lower than the blocks it connects.
**Fix:** Always pass the SAME `YM` to both `add_gate()` and `add_func_block()` on the main flow. Never hand-code offsets.

### Pitfall 7: Arrow Endpoints Float

**Symptom:** Arrow tail is 2-3mm short of the block edge.
**Fix:** Use `blk_l(xs[i])` / `blk_r(xs[i])` helpers — never hand-compute edges.

---

## Part 6 — The One-Page Pre-Run Checklist

Before running any FFBD script, verify:

### Spec Compliance
- [ ] Constants match the CESYS523 spec (sizes, weights, fonts)
- [ ] Title is upper-left, left-aligned, 28pt bold
- [ ] All gates use the oval shape, 1.1 in diameter, all-caps bold text
- [ ] All functional blocks have square corners (not rounded)
- [ ] Reference blocks use bracket style (no rectangle fill)
- [ ] Data blocks (if any) use rounded-corner rectangles (Phase 8)

### Layout
- [ ] Main flow Y is consistent across all blocks on a slide
- [ ] Gates align vertically with blocks on the main flow
- [ ] IT return arrows use distinct YR rows
- [ ] OR / AND branches use consistent YU / YL rows
- [ ] Block X positions have ≥ 2.5 inches between centers

### Content
- [ ] Every block has a unique ID following `F.<N>.<M>` convention
- [ ] All block names are functional (no vendor/library names)
- [ ] Every gate has a matching pair (opening + closing)
- [ ] Every IT gate has a termination label
- [ ] Every OR gate outgoing path has a condition label (one unlabeled default OK)
- [ ] Every precedes arrow (`dashed=True`) has a justification for the time gap

### Arrows
- [ ] All arrows use `add_arrow()` (gets filled triangle arrowhead)
- [ ] All non-arrow path segments use `add_line()` (no head)
- [ ] No arrow endpoints floating (always use `blk_l/blk_r/gate_l/gate_r/ref_l/ref_r` helpers)
- [ ] Precedes arrows are long enough for dashes to render (> 1.5 in)

### Output
- [ ] Output filename uses the project's last-name convention (e.g., `<System>_FFBD_<LastName>.pptx`)
- [ ] Output path is absolute, not relative
- [ ] Template path points to `FFBD_Template - MASTER.pptx`

Run the script, open in PowerPoint, and do one final visual walkthrough before submission.

---

## Part 7 — Regenerating From Scratch via LLM

If you are an LLM agent adapting this for a new system, follow this prompt pattern:

```
Using create_ffbd_thg_v3.py as the reference implementation and
PYTHON-SCRIPT-GUIDE.md as the spec, generate create_ffbd_<system>.py that:

1. Copies constants VERBATIM (LINE_W, BORDER_W, BW, BBH, BHH, GD, RW, RH, FB, FH, FG, FL, FS_TITLE)
2. Copies helper functions VERBATIM (add_func_block, add_ref_block, add_gate,
   add_line_seg, add_arrow, add_line, add_label, add_title,
   set_anchor_mid, _set_arrowhead, delete_all_slides, edge helpers)
3. Replaces the // BUILD // section with slides for <system>:
   - Slide 1: Top-level FFBD (F.1 - F.<N>)
   - Slide 2+: Sub-diagrams for decomposed blocks (Function <N> : <Name>)
4. Uses the e-commerce platform (or whatever system) layout plan from
   the Module 3 FFBD KB phase files
5. Preserves TEMPLATE and OUTPUT paths updated to new project
6. Saves to <path>/<System>_FFBD.pptx

Validate against the Pre-Run Checklist in PYTHON-SCRIPT-GUIDE.md before declaring done.
```

---

**See also:**
[DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md) · [FORMATTING-RULES.md](FORMATTING-RULES.md) · [00 — Module Overview](00_MODULE-OVERVIEW.md)

