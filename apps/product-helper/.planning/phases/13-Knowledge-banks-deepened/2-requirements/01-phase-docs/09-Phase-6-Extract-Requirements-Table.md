---
schema: phase-file.v1
phase_slug: phase-6-extract-requirements-table
module: 2
artifact_key: module_2/phase-6-extract-requirements-table
engine_story: m2-requirements
engine_path: apps/product-helper/.planning/engines/m2-requirements.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/2-requirements/01-phase-docs/09-Phase-6-Extract-Requirements-Table.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 6: Extract Requirements Table

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-6-extract-requirements-table` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 2, phase: phase-6-extract-requirements-table}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_2/phase-6-extract-requirements-table`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 2, phase: 'phase-6-extract-requirements-table' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to the "Setting Up Requirements Tables" lesson and the transition from UCBDs to a formal requirements table.

## Knowledge

At this point you have N UCBDs (from repeated Phases 3–5). Each has a column of `The system shall…` statements. Phase 6's job: pull every one of them into a single flat **Requirements Table**, assign stable IDs, and name each with an **abstract function name** (which becomes the Module 3 FFBD seed list).

### What goes into the table

Only column-B cells that start with **"The system shall"**.

**Excluded:**
- Actor statements (columns A, C, D) — those describe observed behavior of external actors, not system requirements.
- Notes — context, not requirements.
- Initial/ending conditions — state descriptions, not requirements.

### Stable indexing

Format: `UC<two-digit use case>.R<two-digit sequence>`.

- `UC01.R01`, `UC01.R02`, ..., `UC01.R11`
- `UC02.R01`, `UC02.R02`, ...

**Indexes are stable primary keys.** Once assigned, never reuse. If you delete `UC01.R05` later, `UC01.R05` is retired — don't reassign it to another requirement. New requirements get new sequential numbers within that use case (`UC01.R12` if R01–R11 are taken).

**Why stable:** the index is referenced by:
- The Constants Table (which requirements use which constants)
- The SysML Activity Diagram (`<<requirement>> Id: 'UC01.R03'`)
- Module 3 FFBD (traces functions back to their source requirement)
- Module 7 FMEA (traces failure modes back to the failed requirement)
- External tickets / compliance matrices

Renumbering breaks all these downstream references.

### Abstract Function Name

A concise `snake_case` verb-object naming the *function* the requirement implements. 2–4 words. This column is the Module 3 FFBD seed list.

| Requirement | Good function name | Bad function name |
|-------------|---------------------|-------------------|
| "The system shall display the checkout summary..." | `display_checkout_summary` | `do_checkout` (too vague) |
| "The system shall submit a payment authorization request..." | `authorize_payment` | `call_payment_gateway_api` (structural) |
| "The system shall persist the order record..." | `persist_order` | `save_order_to_db` (structural) |
| "The system shall emit an order-fulfillment event..." | `emit_fulfillment_event` | `push_to_queue` (structural) |
| "The system shall retrieve the customer's cart..." | `retrieve_cart` | `query_cart_table` (structural) |

**Rules for function names:**
1. Verb-object form. Action + target.
2. `snake_case`.
3. No technology names (no `postgres`, `kafka`, `redis`).
4. No method names from a specific framework.
5. Aim for function names that would appear in a domain model, not a codebase.

### Shared requirements across use cases

If UC01 has "The system shall authenticate the customer's session token" and UC02 has "The system shall authenticate the customer's session token" (identical), they become **the same requirement** with one index. Use the lowest-UC's index, and cross-reference:

```json
{
  "index": "UC01.R01",
  "requirement": "The system shall authenticate the customer's session token before displaying personal data.",
  "abstract_function_name": "authenticate_session",
  "also_appears_in": ["UC02", "UC03", "UC05"]
}
```

The `also_appears_in` field is metadata (not a column in the xlsx schema) — keep it in the JSON for Phase 11's deduplication and Module 3's function-flow analysis. The marshaller will drop it.

### De-duplication timing

In Phase 6, you extract every statement from every UCBD and **provisionally assign** an index. Near-duplicates are common (e.g., "The system shall authenticate" appearing in 4 UCBDs). You can:

- **Option A (eager dedup):** merge as you extract, and cross-reference with `also_appears_in`. Fewer requirements; cleaner table.
- **Option B (lazy dedup):** extract every one as a fresh row, then merge in a second pass. Safer if uncertain whether two statements truly mean the same.

Recommend Option A if statements match verbatim (or near-verbatim with same function name); Option B if there's semantic doubt.

## Input Required

- All `UCxx-<slug>.ucbd.json` files from Phases 3–5 (one per selected use case)
- `system_context_summary.json` (for metadata header re-use)

## Instructions for the LLM

1. **Enumerate all UCBDs.** List them in UC-index order.
2. **For each UCBD, walk the `actor_steps_table`.** For each row where `the_system` is non-empty AND starts with "The system shall", extract the sentence.
3. **Assign an index.** Within each UCBD, sequential `UC<xx>.R<yy>` starting from R01.
4. **Assign an abstract function name.** Apply the verb-object, snake_case, no-tech rule.
5. **Check for duplicates across UCBDs.** If the sentence (or its semantic twin) already exists in an earlier UC, use the earlier index and add the current UC to `also_appears_in`.
6. **Sort the final table** by index (UC, then R).
7. **Emit `requirements_table.json`.**

## Output Format

```json
{
  "_schema": "Requirements-table.schema.json",
  "_output_path": "<project>/module-2-requirements/requirements_table.json",
  "_phase_status": "phase-6-complete",

  "metadata": {
    "project_name": "C1V",
    "document_id": "C1V-REQS",
    "document_type": "Requirements Table",
    "status": "Draft",
    "last_update": "2026-04-19",
    "target_release": "v1.0",
    "confidentiality": "Internal",
    "created_date": "2026-04-19",
    "target_release_2": "v1.0",
    "author": "David Ancor",
    "approvers": "Product Lead; Engineering Lead",
    "stakeholders": "Engineering; Product; Support",
    "supersedes": "",
    "linked_ticket": "",
    "parent_okr": "FY26-Q2 Launch",
    "regulatory_refs": "SOC2 Type II"
  },

  "requirements_table": [
    {
      "index": "UC01.R01",
      "requirement": "The system shall display the checkout summary showing all cart items, subtotal, and estimated total within 500 ms of initiation.",
      "abstract_function_name": "display_checkout_summary",
      "source_ucbd": "UC01",
      "also_appears_in": []
    },
    {
      "index": "UC01.R02",
      "requirement": "The system shall calculate shipping cost based on the confirmed address.",
      "abstract_function_name": "calculate_shipping_cost",
      "source_ucbd": "UC01",
      "also_appears_in": []
    },
    {
      "index": "UC01.R03",
      "requirement": "The system shall submit a payment authorization request to the Payment Gateway.",
      "abstract_function_name": "authorize_payment",
      "source_ucbd": "UC01",
      "also_appears_in": []
    },
    {
      "index": "UC01.R04",
      "requirement": "The system shall persist the order record with a unique Order ID upon successful authorization.",
      "abstract_function_name": "persist_order",
      "source_ucbd": "UC01",
      "also_appears_in": []
    },
    {
      "index": "UC01.R05",
      "requirement": "The system shall emit an order-fulfillment event to the fulfillment pipeline.",
      "abstract_function_name": "emit_fulfillment_event",
      "source_ucbd": "UC01",
      "also_appears_in": []
    },
    {
      "index": "UC01.R06",
      "requirement": "The system shall display an on-screen confirmation with the Order ID.",
      "abstract_function_name": "display_order_confirmation",
      "source_ucbd": "UC01",
      "also_appears_in": []
    },
    {
      "index": "UC01.R07",
      "requirement": "The system shall dispatch an order-confirmation message to the customer's registered contact.",
      "abstract_function_name": "dispatch_confirmation_message",
      "source_ucbd": "UC01",
      "also_appears_in": ["UC04"]
    }
  ],

  "extraction_summary": {
    "ucbds_processed": ["UC01", "UC02", "UC03", "UC04", "UC05"],
    "total_raw_statements_found": 52,
    "total_unique_requirements": 41,
    "duplicates_merged": 11
  }
}
```

> The marshaller writes only `index`, `requirement`, `abstract_function_name` to the xlsx. `source_ucbd`, `also_appears_in`, and `extraction_summary` stay in the JSON for downstream phases / modules.

## Software-system translation notes

When naming abstract functions for software requirements, prefer **domain verbs** over **technical verbs**:

| Avoid (technical) | Prefer (domain) |
|-------------------|------------------|
| `insert_row` | `persist_<entity>` |
| `select_row` | `retrieve_<entity>` |
| `update_row` | `update_<entity>` |
| `delete_row` | `remove_<entity>` / `retire_<entity>` |
| `call_api` | `authorize_<action>` / `request_<outcome>` |
| `push_message` | `emit_<event>` |
| `consume_message` | `process_<event>` |
| `read_cache` | `retrieve_<entity>` (caching is how, not what) |
| `write_log` | `record_<observation>` / `audit_<action>` |

The abstract function name is *the* artifact Module 3 consumes. If it reads like a DB method name, the FFBD will model storage mechanics instead of system functions — wrong altitude.

## STOP GAP — Checkpoint 1

Present `requirements_table.json` and ask:

1. "I extracted **[N]** unique requirements from **[M]** UCBDs, merging **[K]** duplicates."
2. "Review the abstract function names — flag any that sound structural (name a technology) or too vague (generic like `do_action`)."
3. "Review the de-duplication — any requirements I merged that you consider distinct? Any I left separate that should be merged?"
4. "Proceed to Phase 7 (Rules Audit)?"

> **STOP:** Do not proceed until the user confirms. Indexes become stable after this checkpoint.

## Output Artifact

`requirements_table.json` — ready for Phase 7's rules audit.

## Handoff to Next Phase

Phase 7 runs every requirement through the "Writing Good Requirements" rules: shall, atomic, clear, unambiguous, objective, verifiable. Anything that fails gets rewritten.

---

**Next →** [Phase 7: Requirements Rules Audit](10-Phase-7-Requirements-Rules-Audit.md) | **Back:** [Phase 5](08-Phase-5-UCBD-Step-Flow.md)

