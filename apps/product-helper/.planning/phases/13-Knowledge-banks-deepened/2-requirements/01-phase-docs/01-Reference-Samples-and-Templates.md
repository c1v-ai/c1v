---
schema: phase-file.v1
phase_slug: reference-samples-and-templates
module: 2
artifact_key: module_2/reference-samples-and-templates
engine_story: m2-requirements
engine_path: apps/product-helper/.planning/engines/m2-requirements.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/2-requirements/01-phase-docs/01-Reference-Samples-and-Templates.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Reference Samples and Templates

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `reference-samples-and-templates` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 2, phase: reference-samples-and-templates}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_2/reference-samples-and-templates`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 2, phase: 'reference-samples-and-templates' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

This file is the map of every non-markdown asset in this folder. Consult it any time you need to write a JSON instance or check your output against a calibration target.

## The Three JSON Schemas

These files describe the structure of the corresponding `.xlsx` templates. You author JSON instances against them; a marshalling script converts to `.xlsx`.

| Schema File | Describes | You Produce |
|-------------|-----------|-------------|
| `UCBD_Template_and_Sample.schema.json` | Use Case Behavioral Diagram (one per use case) | `UCxx-<slug>.ucbd.json` |
| `Requirements-table.schema.json` | Master requirements table (all use cases) | `requirements_table.json` |
| `Requirement_Constants_Definition_Template.schema.json` | Named-constants table | `constants_table.json` |

**See `02-JSON-Instance-Write-Protocol.md` for the exact authoring contract and worked examples.**

## The Three xlsx Templates (blank)

These are the originals. Never modify them directly — load them in openpyxl, write JSON values into the cells specified by the schema, and save to a new path.

| Template File | Purpose |
|---------------|---------|
| `UCBD_Template_and_Sample.xlsx` | Blank UCBD — one sheet, sheet name `UCBD Template` |
| `Requirements-table.xlsx` | Blank Requirements Table — sheet `Sheet1` |
| `Requirement_Constants_Definition_Template.xlsx` | Blank Constants Table — sheet `Req Constant Def Template` |

## The Three `_FILLED_TEST` Samples (calibration)

These are **worked examples** filled with test data. Use them to calibrate your JSON output — if you ran your JSON through the marshaller, the result should look like the FILLED_TEST samples (structurally, not with the same data).

| Sample File | Use For |
|-------------|---------|
| `UCBD_FILLED_TEST.xlsx` | Shape check: where does metadata live, where does the step table start/end, how many initial/ending conditions, note format |
| `Requirements-table_FILLED_TEST.xlsx` | Shape check: index format, requirement phrasing, abstract_function_name naming |
| `Requirement_Constants_Definition_FILLED_TEST.xlsx` | Shape check: constant naming, Estimate/Final values, Date/Source/Owner columns |

**When in doubt:** ask the user to open the FILLED_TEST and describe the row/column that puzzles you, or read the schema's `static_text` and `fields` sections.

## The Course Material (Markdown)

These are the source-of-truth for the **method** (not the templates). When the user asks "why are we doing this step?" or "what does the course say about X?", cite these.

| File | Contains | Use When |
|------|----------|----------|
| `How to build project requirements.md` | Full course transcript (1,242 lines) — every lesson, video transcript, and activity | Deep reference on any methodological question; quote from this to justify decisions |
| `Defining_Your_System_Checklist.md` | The official Cornell CESYS522 defining-your-system checklist (271 lines) | Phase 12 final review; per-step validation during UCBD build |
| `Steps_to_Complete_UCBD.md` | The 10-step UCBD build checklist (45 lines) — concise version of the lecture | Quick reference during Phase 3–6; cite step numbers to the user |
| `SysML_Activity_Diagram_Template_and_Sample.md` | SysML Activity Diagram notation + `<<requirement>>` stereotype examples | Phase 10 — converting UCBD to Mermaid activity diagram |

Each markdown has an accompanying `_artifacts/` folder with extracted images from the original PDF — you can reference these in your explanations to the user (`![alt](./X_artifacts/image_000N_<hash>.png)`).

## Known Template Quirks (do NOT "fix")

All three schemas inherit the same known issues from the original course templates. Your JSON must preserve them exactly:

1. **Duplicate `Target Release` label** — row 7 (`target_release`) and row 10 (`target_release_2`) both say "Target Release". Output both cells. Do not try to merge or rename.
2. **Typo "Aprovers"** — row 12 label is misspelled. Keep it. The JSON field is `approvers` but the cell label written to `A12` is literally `"Aprovers"`.
3. **Truncated "Parent OKR / strategic initiativ"** — row 16 label is truncated in the template. Keep as-is.

If you "correct" these labels the cell map breaks and downstream consumers (grading rubrics, future marshallers) reject the file.

## Metadata Header (rows 2–17) — Same in All 3 Templates

All three templates share the same 16-field metadata header. You will populate it with the **same values** across UCBD, Requirements Table, and Constants Table for a given project. Don't re-type — compute once in Phase 0 and re-use:

| Row | Field Name (JSON) | Label on Sheet | Source |
|-----|-------------------|----------------|--------|
| 2 | `project_name` | Project Name | Module 1 scope |
| 3 | `document_id` | Document ID | Assigned per doc (e.g., `C1V-UCBD-UC01`) |
| 4 | `document_type` | Document Type | `UCBD` / `Requirements Table` / `Constants Table` |
| 5 | `status` | Status | `Draft` / `In Review` / `Approved` |
| 6 | `last_update` | Last Update | ISO date |
| 7 | `target_release` | Target Release | Module 1 or user |
| 8 | `confidentiality` | Confidentiality | `Internal` / `Confidential` / `Public` |
| 9 | `created_date` | Created date | ISO date |
| 10 | `target_release_2` | Target Release (dup) | Same as row 7 |
| 11 | `author` | Author | User |
| 12 | `approvers` | Aprovers (sic) | Module 1 stakeholders |
| 13 | `stakeholders` | Stakeholders | Module 1 stakeholders |
| 14 | `supersedes` | Supersedes / replaces | Optional |
| 15 | `linked_ticket` | Linked epic/ticket | User-provided |
| 16 | `parent_okr` | Parent OKR / strategic initiativ (sic) | Module 1 or user |
| 17 | `regulatory_refs` | Regulatory refs | Module 1 constraints |

---

**Next →** [02 — JSON Instance Write Protocol](02-JSON-Instance-Write-Protocol.md)

