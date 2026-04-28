---
schema: phase-file.v1
phase_slug: from-ffbd-to-decision-matrix
module: 3
artifact_key: module_3/from-ffbd-to-decision-matrix
engine_story: m3-ffbd
engine_path: apps/product-helper/.planning/engines/m3-ffbd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/3-ffbd/01-phase-docs/11_FROM-FFBD-TO-DECISION-MATRIX.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 11: From FFBD to Decision Matrix (Bridge to Module 4)

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `from-ffbd-to-decision-matrix` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 3, phase: from-ffbd-to-decision-matrix}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_3/from-ffbd-to-decision-matrix`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 3, phase: 'from-ffbd-to-decision-matrix' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites
- [ ] You have completed [Phase 10 — Validation and Common Mistakes](10_VALIDATION-AND-COMMON-MISTAKES.md)
- [ ] You have a validated, team-signed-off hierarchical FFBD set
- [ ] You are ready to begin Module 4 (Assessing Your System's Performance and Value)

## Context (Why This Matters)

The FFBD is not an end in itself. It is the **operational foundation** on which every downstream design artifact is built. Module 4 (Decision Matrix) is the first to depend on the FFBD directly — and the quality of your FFBD determines the quality of your performance criteria.

If you produce vague, structural, or incomplete FFBDs, your Decision Matrix will have vague criteria, your QFD (Module 5) will have the wrong engineering characteristics, your Interface Matrix (Module 6) will miss interfaces, and your FMEA (Module 7) will miss failure modes. Every module downstream inherits the FFBD's strengths and weaknesses.

This bridge file explains **how the FFBD feeds Module 4** so that the handoff is deliberate, not implicit.

## What Module 4 Needs from Your FFBD

Module 4 builds a **Decision Matrix** that scores alternative system solutions against weighted **performance criteria**. To do that, Module 4 needs:

### 1. A complete list of functions the system must perform

Module 4 uses the FFBD's functional blocks to identify **what the system needs to do well**. Each function becomes a candidate for performance-criterion derivation.

From our e-commerce platform FFBD:
| FFBD Function | Candidate Performance Criterion |
|---------------|--------------------------------|
| F.3 Serve Shopper Session | Page Load Speed, Peak Traffic Capacity |
| F.4 Process Order | Transaction Reliability, Payment Security |
| F.5 Fulfill Order | Fulfillment Latency, Inventory Accuracy |
| F.6 Monitor & Operate | Observability, Mean Time to Detection |

### 2. The operational priorities implied by the flow

The FFBD shows which functions are **core** (on the main operational path) vs. **supporting** (peripheral). Module 4 uses this to weight performance criteria.

- **Core functions** (e.g., F.3, F.4, F.5 on the main loop) → high-weight criteria
- **Supporting functions** (e.g., F.7 reporting on a precedes arrow) → lower-weight criteria
- **Parallel functions** (inside AND gates) → criteria around concurrency and synchronization

### 3. The loops and their termination conditions

IT gates identify **continuously-running workloads**. These directly drive criteria around:

- Throughput (how many iterations per unit time)
- Durability (how long can the loop run without failure)
- Resource cost (cost per iteration)

### 4. The alternatives revealed by OR gates

OR gates expose **architectural choices** already implicit in the system. Module 4's Decision Matrix often compares these alternatives head-to-head. If your FFBD shows an OR between "Serve from CDN Cache" and "Query Origin Server," Module 4 should have a criterion around cache hit rate that distinguishes implementations.

### 5. The uncertainties you flagged

Red-marked functions from Phase 9 identify **what Module 4 cannot answer yet**. The Decision Matrix may need to either:

- Weight criteria around those functions higher (because the choice is high-risk)
- Defer the criterion until the red function is resolved

## Derivation Workflow

Follow this workflow to translate your FFBD into Module 4 inputs:

### Step 1: List every unique function

Pull every functional block from every diagram (top-level + all sub-diagrams) into a flat list.

For the e-commerce platform: ~30 functions across F.1-F.7 and their sub-diagrams.

### Step 2: For each function, ask the performance questions

| Dimension | Question |
|-----------|----------|
| **Speed** | How fast must this function complete? |
| **Reliability** | How often can this function fail without breaking the system? |
| **Accuracy** | How correct must the output be? |
| **Cost** | What's the cost-per-execution ceiling? |
| **Capacity** | How many concurrent executions? |
| **Security** | What's the confidentiality/integrity requirement? |
| **Observability** | Do we need to measure this function in production? |

Not every function produces a criterion on every dimension. Pick the dimensions that **actually matter for this function**.

### Step 3: Consolidate into 6-10 performance criteria

Module 4's Decision Matrix works best with **6-10 criteria**. If you derived 30 candidate criteria from 30 functions, consolidate.

Typical consolidation patterns:
- Multiple functions touching the same dimension → one criterion (e.g., all "speed" criteria → Page Load Speed)
- Cross-cutting concerns (security, observability) → one criterion each
- Critical-path functions (core value) → dedicated criterion

For the e-commerce platform, the 8 criteria we land on in Module 4:

| # | Criterion | Driven By Which FFBD Functions |
|---|-----------|-------------------------------|
| 1 | Reliability | F.3, F.4, F.5 (main operational path) |
| 2 | Page Load Speed | F.3.2 Render Storefront, F.3.4 Render Results |
| 3 | Cost | F.1 Provision, F.6 Monitor (infrastructure cost) |
| 4 | Peak Traffic Capacity | F.3 IT loop (concurrent shopper sessions) |
| 5 | Launch Speed | F.1, F.2 (time to first merchant live) |
| 6 | Scalability | F.3, F.4 (handling growth in shoppers and orders) |
| 7 | Maintenance Effort | All functions (total operational burden) |
| 8 | Security | F.4.2 Authorize Payment, F.4.3 Score Fraud, data blocks (Compliance Policy) |

### Step 4: Identify alternatives to compare

Module 4 compares ≥2 alternative solutions. The FFBD helps scope the comparison by showing what alternatives need to fulfill the same functional flow.

For the e-commerce platform, Module 4 compares:
- Option A: Shopify Plus (managed SaaS)
- Option B: Custom-built platform (full in-house)
- Option C: Open-source platform with SaaS add-ons ← selected, carried into Mod 5-7

Each option must satisfy the FFBD — but each will satisfy it differently (and at different scores on each criterion).

### Step 5: Flag high-uncertainty areas

Red-marked functions from Phase 9 may require:
- **Placeholder weights** in Module 4 (with notes to revisit after red items resolve)
- **Sensitivity analysis** in Module 4 (does the Decision Matrix outcome change if we assume different weights for the red-area criteria?)

## What Module 5 (QFD) Will Do with This Later

Just so you can see the thread continuing beyond Module 4:

- **Module 5 Engineering Characteristics** will derive from your functional blocks (e.g., "Server Response Time," "Database Query Latency," "Cache Hit Rate")
- **Module 5 Performance Criteria** will be the 6-10 criteria from Module 4
- **Module 5 Design Targets** will emerge from the QFD relationships
- **Module 6 Interfaces** will correspond to arrows between functional blocks in your FFBD (especially cross-subsystem arrows)
- **Module 7 FMEA** will take each function and ask "how could this fail, and what's the effect?"

**The FFBD is upstream of everything.** Quality in Phase 11 pays dividends for the next 4 modules.

## Handoff Package for Module 4

Prepare this package to hand off to Module 4. Module 4's refined software-focused KB ([4-assess-software-performance-kb](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/4-assess-software-performance-kb/)) begins at [03 — Identifying Performance Criteria](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/4-assess-software-performance-kb/03%20-%20Identifying%20Performance%20Criteria.md) — the package below is what that phase expects as input.

| Artifact | Purpose |
|----------|---------|
| **Hierarchical FFBD set** (top-level + all sub-diagrams, PDF or PPTX) | Visual reference |
| **Flat function list** (CSV or JSON) with IDs, names, levels, uncertainty colors | Input to criteria derivation |
| **Candidate performance criteria list** (6-10 items) with driving functions | Starting point for Module 4's Step 03 |
| **Alternatives list** (2-3 options) that must satisfy the FFBD | Column headers for Module 4's matrix |
| **Red-item list** (uncertainties) | Sensitivity analysis inputs for Module 4 Step 13 |
| **Key interfaces list** (cross-subsystem arrows) | Preview input for Module 6 |
| **`decision-matrix-handoff.json`** | Formal structured handoff that Module 4's orchestrator can ingest |

### `decision_matrix_handoff.v1` Schema

Emit this JSON file at `<project>/module-3-ffbd/decision-matrix-handoff.json`:

```json
{
  "_schema": "decision_matrix_handoff.v1",
  "_output_path": "<project>/module-3-ffbd/decision-matrix-handoff.json",
  "_produced_by": "Module 3 — Functional Flow Block Diagram",
  "_for_consumption_by": "Module 4 — Assessing Your System's Performance and Value",
  "_produced_date": "YYYY-MM-DD",

  "system_name": "<System Name>",
  "system_description": "<One-sentence description>",

  "upstream_artifacts": {
    "module_2_handoff": "<project>/module-2-requirements/ffbd-handoff.json",
    "ffbd_pptx": "<project>/module-3-ffbd/<System>_FFBD.pptx",
    "ingestion_report": "<project>/module-3-ffbd/ingestion_report.json"
  },

  "functions_flat_list": [
    {
      "block_id": "F.4.2",
      "name": "Authorize Payment",
      "abstract_name": "authorize_payment",
      "level": "leaf",
      "parent_diagram": "Function 4 : Process Order",
      "uncertainty": "green | yellow | red",
      "driving_requirements": ["UC01.R03"],
      "notes": "<optional>"
    }
  ],

  "candidate_performance_criteria": [
    {
      "criterion": "Customer Page Load Speed",
      "dimension": "speed",
      "driving_functions": ["F.3.2", "F.3.4"],
      "solution_independent": true,
      "suggested_kb_reference": "caching-system-design-kb.md",
      "why_this_matters": "Core-loop user-facing function — directly drives conversion"
    },
    {
      "criterion": "Reliability (Uptime)",
      "dimension": "reliability",
      "driving_functions": ["F.3", "F.4", "F.5"],
      "solution_independent": true,
      "suggested_kb_reference": "resilliency-patterns-kb.md",
      "why_this_matters": "Every function on the main path depends on this"
    }
  ],

  "alternatives_to_compare": [
    {
      "option_id": "A",
      "name": "<e.g., Commercial Platform (Shopify Plus)>",
      "summary": "<one line>"
    },
    {
      "option_id": "B",
      "name": "<e.g., Custom Build>",
      "summary": "<one line>"
    },
    {
      "option_id": "C",
      "name": "<e.g., Open-Source + Contractor Customization>",
      "summary": "<one line>"
    }
  ],

  "uncertainty_flagged_functions": [
    {
      "block_id": "F.4.3",
      "name": "Score Fraud Risk",
      "color": "red",
      "open_questions": [
        "Confidence threshold for auto-decline vs. manual review",
        "Fallback if third-party fraud API is unavailable"
      ]
    }
  ],

  "key_interfaces_preview": [
    {
      "id": "I-01",
      "from_block": "F.3 Serve Shopper Session",
      "to_block": "F.4 Process Order",
      "nature": "synchronous REST API",
      "payload_hint": "cart_id, shopper_id, totals"
    }
  ],

  "performance_budgets_inherited_from_module_2": [
    {
      "constant_name": "RESPONSE_BUDGET_MS",
      "value": 500,
      "units": "ms",
      "affects_blocks": ["F.3.2", "F.3.4", "F.4.1"],
      "estimate_final": "Estimate"
    }
  ],

  "summary": {
    "total_functions": 30,
    "total_candidate_criteria": 8,
    "total_alternatives": 3,
    "red_functions": 2,
    "yellow_functions": 5,
    "green_functions": 23
  },

  "ready_for_module_4": true
}
```

## Validation Checklist (STOP-GAP)
- [ ] Every functional block from every diagram has been pulled into a flat function list
- [ ] For each function, performance dimensions have been considered (speed/reliability/accuracy/cost/capacity/security/observability)
- [ ] Candidate performance criteria have been consolidated into 6-10 distinct items
- [ ] Each criterion traces back to specific FFBD functions (documented)
- [ ] Alternatives to compare in Module 4 have been named (≥2)
- [ ] Red-marked uncertainties have been flagged with specific follow-ups
- [ ] Cross-subsystem arrows have been noted for Module 6 preview
- [ ] Handoff package is assembled and ready to hand to Module 4

> **STOP: Module 3 is complete when every check passes.**
> You now have an operational foundation for the rest of the System Design course.

## Output Artifact

A **handoff package** bridging Module 3 to Module 4 — hierarchical FFBD set, function list, candidate criteria, alternatives, and uncertainty list.

## Handoff to Next Module

**You have completed Module 3.** The functional flow is mapped, validated, and ready.

**Module 4** — [Assessing Your System's Performance and Value](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/4-assess-software-performance-kb/) (refined software-focused KB) — will take your handoff JSON and:
1. Convert candidate criteria into solution-independent performance criteria (Step 03)
2. Score alternative solutions against those criteria (Steps 05–09)
3. Weight criteria and interpret the matrix (Steps 10–13)
4. Select the best solution for downstream modules (Step 14 + bridge to QFD at Step 17)

**Start Module 4 at:** [03 — Identifying Performance Criteria](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/4-assess-software-performance-kb/03%20-%20Identifying%20Performance%20Criteria.md) — Module 4's Phases 01 and 02 are framing/vocabulary; your handoff JSON already supplies the inputs Phase 03 needs.

---

**You are done →** Begin [Module 4 — Decision Matrix](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/4-assess-software-performance-kb/00%20-%20Module%20Overview.md) | **Back:** [10 — Validation and Common Mistakes](10_VALIDATION-AND-COMMON-MISTAKES.md)

