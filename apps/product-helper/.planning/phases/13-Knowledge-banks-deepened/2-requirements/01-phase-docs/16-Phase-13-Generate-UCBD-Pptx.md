---
schema: phase-file.v1
phase_slug: phase-13-generate-ucbd-pptx
module: 2
artifact_key: module_2/phase-13-generate-ucbd-pptx
engine_story: m2-requirements
engine_path: apps/product-helper/.planning/engines/m2-requirements.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/2-requirements/01-phase-docs/16-Phase-13-Generate-UCBD-Pptx.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 13: Generate UCBD PowerPoint (Optional Deliverable)

## §1 Decision context

This phase contributes to **m2-requirements** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m2-requirements.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m2-requirements` (`apps/product-helper/.planning/engines/m2-requirements.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-13-generate-ucbd-pptx` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 2, phase: phase-13-generate-ucbd-pptx}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_2/phase-13-generate-ucbd-pptx`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 2, phase: 'phase-13-generate-ucbd-pptx' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Runs AFTER Phase 12. Optional — produces a presentation-ready pptx for stakeholder review or Cornell CESYS522 submission.

## Knowledge

Module 2 normally ends at Phase 12 with JSON artifacts + Mermaid diagrams + xlsx marshalling. Some audiences need a **slide deck** instead:

- Cornell submissions where the course template is pptx-based
- Stakeholder reviews where slides travel better than spreadsheets
- Design reviews where each UCBD deserves a dedicated slide

Phase 13 produces that deck **from the same JSONs** you already have. Zero new content to author. Run the script.

### What the script produces

One `.pptx` file containing:

1. **Title slide** — system name, project, counts (UCBDs, requirements, constants), system description.
2. **One or two slides per UCBD**:
   - **Combined** (single slide): title + metadata strip (Use Case, Primary Actor, Trigger, Start, End) + step table + requirements table — used when the content fits.
   - **Split** (two slides): slide A = flow (title + metadata + steps); slide B = requirements — used when the content is too large to fit on one slide.
   - The script auto-decides by estimating height against a 7.5 in slide.
3. **Summary slide** — per-UCBD requirement counts and the full Constants Table.

### What the script does NOT do

- It does not invent content. Every value on every slide comes from a JSON field.
- It does not modify the JSONs. Read-only.
- It does not render Mermaid diagrams. Those stay as `.mmd` files.
- It does not produce the xlsx deliverables. Use the openpyxl marshaller (separate step) for those.

### Spec-perfect = JSON-perfect

The deck's fidelity is bounded by the JSONs. If a UCBD has a missing `use_case_name` it shows up as "Untitled Use Case" on the slide. If `requirements_table.json` has a row with `abstract_function_name: ""` the slide shows blank. **Before running Phase 13, ensure Phases 0–12 completed cleanly and `module_2_final_review.json` shows zero failures.**

## Input Required

In the project's Module 2 output folder (typically `<project>/module-2-requirements/`):

| File | Required? | Used for |
|------|-----------|----------|
| `system_context_summary.json` | Optional | Title slide name + description |
| `ucbd/UC*.ucbd.json` (≥1) | **Required** | One slide per file |
| `requirements_table.json` | Optional (but strongly recommended) | Per-UCBD requirements list and counts |
| `constants_table.json` | Optional | Summary slide constants list |

Missing files fall back to sensible defaults. The script will NOT fail if optional files are absent, but the deck will be less complete.

## Script

Location: `generate_ucbd_pptx.py` in this KB folder.
Dependency: `python-pptx`.
Helpers: `_ucbd_helpers.py` (generic layout code — do not edit per-project).

## Instructions for the LLM

1. **Verify Phase 12 completed cleanly.** Read `module_2_final_review.json` and confirm `ready_for_module_3 == true` and `checklist_results.total_failed == 0`. If failures exist, stop and tell the user to close them before running Phase 13.
2. **Confirm `python-pptx` is installed.** Run `pip show python-pptx`. If absent, run `pip install python-pptx`.
3. **Run the generator.**
   ```bash
   python generate_ucbd_pptx.py --project <path-to-module-2-requirements>
   ```
   Add `--output <path>` to override the default filename (defaults to `<system>_UCBD.pptx` in the project folder).
4. **Verify the output.** Open the pptx and confirm:
   - Title slide shows the correct system name and counts.
   - Every UCBD has at least one slide.
   - UCBDs with many steps/requirements are split across two slides (expected).
   - Summary slide counts reconcile with `module_2_final_review.json` metrics.
5. **If anything is wrong, fix the JSON, not the script.** This is the rule — the script is frozen generic infrastructure; project content lives in JSON only.

## Output Format

- `<project>/<system_slug>_UCBD.pptx` — the deck.
- Console output listing slide count and totals.

No new JSON artifact — this phase consumes, it doesn't produce.

## Customizing the deck (rare)

Per the "edit JSON, not script" rule, 95% of customization happens in the JSONs:

| Want to change | Edit |
|----------------|------|
| Slide title text | `ucbd.use_case_name` |
| "Primary Actor" / "Trigger" / "Start" / "End" labels shown on slide | Phases 3–4 JSON content (these labels are derived) |
| Which requirements appear on a UCBD slide | `requirements_table[i].source_ucbd` |
| Constants list on summary slide | `constants_table.json` |
| Title slide description | `system_context_summary.system_description` |
| Combined-vs-split decision for a specific UCBD | Reduce step count or split the UCBD into two |

Only when you need to change **layout itself** (fonts, colors, margins, slide dimensions) do you edit `_ucbd_helpers.py`. That file is generic and shared — any change there applies to every project that uses this KB.

## Software-system translation notes

For software projects, the deck is often the audience-facing artifact. Two things to check before presenting:

1. **Constants discipline.** The summary slide shows every constant with its Estimate/Final status. Engineering audiences will latch onto any `Estimate` that should be `Final`. Run a last `grep` over `constants_table.json` for `"estimate_final": "Estimate"` and confirm each is intentional.
2. **Requirement tone.** Slides expose requirements verbatim. Any requirement that passed Phase 7 should read cleanly; if anything looks off in the deck, that's a signal the audit missed it — loop back to Phase 7 rather than patching the slide.

## STOP GAP — Checkpoint 1

Present the pptx output path to the user and ask:

1. "I generated **[N]** slides in **[path]**."
2. "Open the deck and confirm the title slide, each UCBD slide, and the summary slide."
3. "Any issues are fixes in the JSON, not the script — want me to loop back to a specific phase?"
4. "Module 2 is now complete with both data (xlsx) and presentation (pptx) deliverables."

## Output Artifact

`<project>/<system_slug>_UCBD.pptx`.

## Handoff

No downstream handoff — this is a terminal optional phase. Module 3 (FFBD) uses `ffbd-handoff.json` from Phase 12, not the pptx.

---

**End of Module 2 pipeline (with optional pptx).** | **Back:** [Phase 12](15-Phase-12-Final-Review-and-FFBD-Handoff.md) | **Master:** [Requirements Builder Master Prompt](00-Requirements-Builder-Master-Prompt.md)

