---
title: Schema-First KB Rewrite + NFR Math Engine with Confidence-Gated Auto-Fill
date: 2026-04-20
status: DRAFT v1 — awaiting David's review in Cursor
author: Claude (planning for David Ancor)
scope: all 7 module KBs + 13 NFR sub-KBs under apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/
supersedes_implicitly: the "story spine + story beats" sketch from prior conversation (incorporated below)
parent_plan: .claude/plans/system-agent-builder-pivot.md (Phase B / Phase D / Phase E1 ingredient)
---

# Schema-First KB Rewrite + NFR Math Engine

> **Purpose.** The current 7-module KB corpus buries the JSON artifact and option space at the bottom of every phase file. Pedagogical prose leads; the schema trails. This rewrite flips the ordering and folds the 13 NFR "system-design" KBs into **deterministic decision functions with confidence scores** that auto-populate schema fields when confidence ≥ 90%, surfacing decisions to the user only when ambiguity is real.

> **Three merged goals:**
> 1. **Schema-first phase files** — every KB file leads with the JSON artifact + full option space, then the math engine, then the narrative.
> 2. **NFR story continuity** — the 13 NFR sub-KBs are no longer byte-identical duplicates across 5 modules; they become one canonical set that threads M2→M7 with explicit story beats inside each phase.
> 3. **Math-driven NFR auto-fill** — each NFR sub-KB becomes a scoring function. When confidence ≥ configurable threshold (default 90%), the value is auto-written to the JSON artifact. Below threshold, the user sees the computed options with the math shown.

---

## 1. The observation that triggered this rewrite

Every module's phase file follows the same inverted pyramid:

```
┌─ Heavy narrative (40–70% of file)
│    "Context (why this matters)" + "Knowledge" sections + worked examples
├─ Process instructions for the LLM (20–30%)
│    "Instructions for the LLM" numbered steps
└─ JSON artifact (5–15%, buried at bottom)
     "Output Format" with the actual schema + one example
```

Verified across all 7 modules via full read of every unique file (M1: 12 files; M2: 45 files; M3: 24 files; M4: 22 files; M5: 16 files; M6: 17 files; M7: 13 files + 13 NFR sub-KBs × 5 copies = 65 duplicate files).

**Consequences of today's ordering:**
- The LLM (or human) reads 100–300 lines of prose before seeing what they're supposed to *produce*.
- Option space is enumerated only inside narrative sentences, not as a reference list.
- The schema files (`UCBD_Template_and_Sample.schema.json`, `decision-matrix-template.schema.json`, `QFD-Template.schema.json`, `interface-matrix-template.json`, `FMEA-sample.json`, `phase_artifact.schema.json`, `system_scope_summary.schema.json`, `Requirements-table.schema.json`, `Requirement_Constants_Definition_Template.schema.json`) **exist**, but the phase files reference them from the bottom instead of leading with them.
- The 13 NFR sub-KBs (`caching-system-design-kb.md`, `cap_theorem.md`, `observability-kb.md`, `resilliency-patterns-kb.md`, `load-balancing-kb.md`, `message-queues-kb.md`, `Multithreading-vs-Multiprocessing.md`, `data-model-kb.md`, `api-design-sys-design-kb.md`, `cdn-networking-kb.md`, `deployment-release-cicd-kb.md`, `maintainability-kb.md`, `software_architecture_system.md`) end in "Decision Framework" + "Validation Checklist" sections but contain **zero executable math** — they are rubric-shaped teaching artifacts, not scoring functions.
- Duplication: 13 NFR sub-KBs × 5 module directories = 65 files with identical md5 hashes. No place carries the NFR story across modules.

**What the pivot plan needs.** Bet #1 ("deterministic, not suggestive") requires NFRs to drive tech-stack math with visible traceable recommendation chains. Today the math is honest within each module (M4 weighted sum, M5 SUMPRODUCT imputed importance, M7 Sev × Lik) but the thread between modules is prose and the NFR inputs are free-text. Schema-first ordering + auto-fill math closes both gaps.

---

## 2. The three merged goals in detail

### 2.1 Goal A — Schema-first phase file template

Every phase file across M1–M7 is rewritten to this **canonical 6-section shape**:

```markdown
# Phase <N> — <Name>

## 1. ARTIFACT — what this phase produces
(the JSON schema, inline + verbatim, with every field's type/enum/constraint)
(one fully-populated example showing every enum branch covered)
(upstream inputs consumed + downstream artifacts produced)

## 2. OPTION SPACE — every valid choice at this phase
(flat reference list: every enum value, every acceptable value range,
 every pattern, every allowed combination)
(explicit "NOT allowed" list — closes R3-style fail-closed loops)

## 3. MATH ENGINE — how to compute each field
(for each field that is computable:
  - inputs (upstream fields, NFR sub-KB outputs, user answers)
  - function (deterministic formula or scoring rubric)
  - confidence score formula
  - auto-fill threshold (default 90%)
  - on-miss: surface to user with computed options + math)
(for fields that require user input: named user-question, acceptable response shape)

## 4. NFR STORY BEATS — which NFR stories advance here
(1-3 per phase, each with: which story, which decision(s), which sub-KB
 provides the math, which fields get populated)

## 5. FAIL-CLOSED RULES — STOP GAPs + refusal text
(rule IDs, what triggers them, what the refusal message says)

## 6. NARRATIVE — why this phase exists (shortest section)
(pedagogy moved here; 1-2 paragraphs max; link to external deep-dive if needed)
```

**Sections 1–3 are load-bearing.** An LLM executing the phase reads only sections 1–3 plus section 4's named stories. Section 5 triggers only on violation. Section 6 is optional context.

### 2.2 Goal B — Story-spine NFR narrative (carried forward from prior conversation)

The 13 NFR sub-KBs collapse from 65 duplicate files to **13 canonical story spines** under a new `_nfr-stories/` root. Each spine has the 7-section shape covering M1→M7 (detailed template in Appendix A). Renamed to be keyed by the decision they drive, not by the technology they describe:

| Old name (duplicated × 5) | New name (canonical × 1) |
|---|---|
| `cap_theorem.md` | `story-01-consistency-posture.md` |
| `caching-system-design-kb.md` | `story-02-caching-strategy.md` |
| `cdn-networking-kb.md` + SLO parts of `software_architecture_system.md` | `story-03-latency-budget.md` |
| `resilliency-patterns-kb.md` + availability parts of `software_architecture_system.md` | `story-04-availability-posture.md` |
| `load-balancing-kb.md` (currently a raw video transcript — unusable) | `story-05-traffic-distribution.md` (rewrite from scratch) |
| `message-queues-kb.md` | `story-06-messaging-semantics.md` |
| `Multithreading-vs-Multiprocessing.md` | `story-07-concurrency-model.md` |
| `observability-kb.md` | `story-08-observability-posture.md` |
| `data-model-kb.md` | `story-09-data-model.md` |
| `api-design-sys-design-kb.md` | `story-10-api-contract.md` |
| `deployment-release-cicd-kb.md` | `story-11-release-posture.md` |
| `maintainability-kb.md` | `story-12-maintainability-posture.md` |
| Security parts of `software_architecture_system.md` | `story-13-security-posture.md` |

**Phase files reference stories via inline Story Beat blocks, not cross-file links.** Story Beat blocks carry the specific decision(s) that advance in that phase with enough self-contained content that the LLM can act without chasing the spine (the spine is canonical source of truth but not required at decision time).

### 2.3 Goal C — Math engine + confidence-gated auto-fill

Each of the 13 NFR story spines gains an `engine.json` sidecar that encodes the decision rubric as a **deterministic scoring function**. Structure:

```json
{
  "story_id": "story-03-latency-budget",
  "version": "1.0",
  "decisions": [
    {
      "decision_id": "response-budget-ms",
      "target_field": "constants_table.RESPONSE_BUDGET_MS",
      "inputs": [
        {"name": "user_type", "source": "M1.intake.user_class"},
        {"name": "flow_class", "source": "M2.P5.step.criticality"},
        {"name": "regulatory_refs", "source": "M1.hard_constraints"}
      ],
      "function": {
        "type": "decision_tree",
        "rules": [
          {"if": {"user_type": "consumer_app", "flow_class": "user_facing_sync"}, "value": 500, "units": "ms", "base_confidence": 0.88},
          {"if": {"user_type": "consumer_app", "flow_class": "user_facing_sync", "regulatory_refs_contains": "PCI-DSS"}, "value": 500, "units": "ms", "base_confidence": 0.94},
          {"if": {"user_type": "internal_tool"}, "value": 1500, "units": "ms", "base_confidence": 0.82},
          {"if": {"flow_class": "batch"}, "value": 5000, "units": "ms", "base_confidence": 0.78},
          {"default": {"value": 500, "units": "ms", "base_confidence": 0.60}}
        ]
      },
      "confidence_modifiers": [
        {"when": "user_explicitly_stated_value_exists", "delta": +0.10, "cap": 1.00},
        {"when": "upstream_contradicts_rule", "delta": -0.30},
        {"when": "any_input_is_Estimate", "delta": -0.05}
      ],
      "auto_fill_threshold": 0.90,
      "fallback": {"action": "surface_to_user", "question_id": "ask-response-budget"}
    }
  ]
}
```

**Execution flow when the LLM reaches a phase that writes a NFR-controlled field:**

```
For each decision_id in phase.auto_fill_decisions:
  1. Resolve inputs from upstream artifacts (M1 scope, M2 constants, ...).
  2. Evaluate function → {value, units, base_confidence, matched_rule}.
  3. Apply confidence_modifiers.
  4. If final_confidence ≥ auto_fill_threshold:
       Write to target_field.
       Append to audit trail: {decision_id, value, inputs_used, confidence, matched_rule, engine_version}.
       Mark `computed: true, computed_by: <story_id>@<version>`.
     Else:
       Emit `needs_user_input: true`
       Attach the top-3 computed options with their confidences + math trace.
       Block STOP GAP until user resolves.
```

**Why 90%?** Calibration target derived from:
- Below 80%: false-positive auto-fills dominate (projects end up with wrong defaults).
- Above 95%: almost no auto-fills happen (gate is too tight, gains lost).
- 90% is the conservative midpoint. It **must** be configurable per-project and per-decision because consumer-app latency tolerance is forgiving while banking-app latency tolerance is not. See §7 Open Questions.

**The math is visible, always.** Even when confidence ≥ 90% and the field is auto-filled, the audit trail captures every input + rule match + modifier, exposed in the UI as a "why this value?" expander. This is the pivot plan's bet #1 ("math you can see") made literal at the field level.

---

## 3. The canonical phase-file template (Goal A detail)

Every phase file in M1–M7 is rewritten to this exact shape. Below is the full template. A concrete worked example appears in §6.

```markdown
# Phase N — <Name>
> Produces: `<artifact>.v<version>` · Consumes: `<upstream>.v<version>` · Hands off to: `<downstream_phase>`

## 1. ARTIFACT

### 1.1 JSON Schema (authoritative)
(inline: every field, every type, every enum, every constraint)
(if the schema is long, inline the interface in TypeScript-ish shorthand
 and link to the full .schema.json)

### 1.2 Fully populated example
(one example that exercises every enum branch + every optional field)

### 1.3 Upstream inputs
| Field | Source artifact | Shape | Required? |

### 1.4 Downstream consumers
| Consuming module.phase | Fields used | Purpose |

## 2. OPTION SPACE

### 2.1 Field-by-field enum / range catalog
(one section per enumerable/ranged field)

### 2.2 Allowed combinations
(matrix of valid co-occurrences if cross-field constraints exist)

### 2.3 Forbidden combinations
(explicit do-not list — feeds fail-closed rules)

## 3. MATH ENGINE

### 3.1 Auto-fillable fields
| Field | Engine | Inputs | Confidence formula | Threshold | Fallback |

### 3.2 Deterministic formulas (non-NFR)
(e.g., M4 Lesson 09 normalization formulas, M5 SUMPRODUCT, M7 Sev × Lik)

### 3.3 User-input fields (cannot be auto-filled)
| Field | Question to user | Acceptable shape | Escalation |

## 4. NFR STORY BEATS

### 4.1 Stories that advance here
| Story ID | Decision(s) at this phase | Target field(s) | Confidence default |

### 4.2 Story-by-story inline beat
(2-4 paragraphs per story, self-contained enough to decide in-phase)
(every beat closes with: "This decision propagates to <downstream phases>.")

## 5. FAIL-CLOSED RULES

### 5.1 Rule catalog (local + inherited)
| Rule ID | Trigger | Refusal text | STOP GAP? |

### 5.2 STOP GAP checklist (human-readable)
(the final checklist the user confirms before advancing)

## 6. NARRATIVE

(2 paragraphs max. Why this phase exists. The pedagogical content that
 used to live at the top now lives here as optional context.)

---
Next → <downstream phase> · Back → <upstream phase> · Story index → _nfr-stories/00-STORY-INDEX.md
```

---

## 4. The 13 NFR story spines (Goal B detail)

Each spine file at `_nfr-stories/story-NN-<name>.md` uses the 7-section template. Matrix of where each story's beats land in M1-M7:

| Story | M1 | M2 | M3 | M4 | M5 | M6 | M7 |
|---|---|---|---|---|---|---|---|
| 01 consistency-posture | — | P9 Lens 7 | P0A EFFBD constraint | L03, L05 | P3, P9 | Step 8 | P1, P3 |
| 02 caching-strategy | — | P8, P9 Lens 11 | P0A, P9 Yellow | L03, L05, L06 | P3, P4, P9 | Step 3 DFD, Step 8 | P1, P3 |
| 03 latency-budget | — | P5, P8, P9 Lens 5 | P0A, P9 | L03, L05, L09, L12 | P1, P3, P9 | Step 6 seq, Step 8 | P1, P4 |
| 04 availability-posture | `hard_constraints` | P7, P8, P9 Lens 15 | P0A | L03, L05, L12 | P1, P3, P9 | Step 8, Step 11 | P1, P3, P5 |
| 05 traffic-distribution | — | P9 Lens 14 | P0A IT gates | L03, L05 | P3, P9 | Step 4 N², Step 8 | P1, P3 |
| 06 messaging-semantics | — | P8, P9 Lens 8 | P5 OR gates | L03 | P3, P9 | Step 3 DFD async | P1, P3 |
| 07 concurrency-model | — | P9 Lens 6 | P5 AND gates | L03, L18 | P3 | Step 8 | P3 (race) |
| 08 observability-posture | — | P9 Lens 10 | — | L05, L13 | P3, P9 | Step 8 metrics | P7 Detectability |
| 09 data-model | `hard_constraints` | P8, P9 Lens 9 | P0A data blocks | L03, L18 | P3, P9 | Step 3 DFD data | P1 data-loss, P3 |
| 10 api-contract | — | P3 actors, P9 | P0A external actors | L03 | P3 | **canonical: Step 2, 8, 9** | P1 |
| 11 release-posture | — | P9 Lens 15 | — | L03, L04 | P3 | Step 3 | P1 regression, P5 canary |
| 12 maintainability | — | P9 | P1 iter count | L07 subjective | P3, basement diff | Step 10 champion | P5 process |
| 13 security-posture | `regulatory_refs`, `hard_constraints` | P8, P9 Lens 12 | P0A constraint blocks | L03, L12 | P3, P9 | Step 8 auth | P1, P3, Sev 4 anchor |

12 of 13 stories start in M2. 1 (release-posture) starts in M4. Every story terminates in M7 as one or more named failure modes. 10 of 13 stories have an M7 RPN → upstream re-tune loop (story has an `rpn_threshold` field — if exceeded in M7, re-tune target in M5).

---

## 5. The math engine (Goal C detail)

### 5.1 Engine file shape

Every story spine gets a sibling `engine.json` (or `.v<N>.json` for versioning). Structure from §2.3 applies. The engine is **pure data + rules** — no code. An interpreter (in `apps/product-helper/lib/langchain/nfr-engine/`, per-phase agent) evaluates the rules deterministically.

### 5.2 Confidence score composition

```
base_confidence = matched_rule.base_confidence  // from the rule that fires
final_confidence = clamp(
  base_confidence + Σ applicable_modifiers,
  0.0, 1.0
)
```

**Confidence modifiers — standard set applied across all engines:**

| Modifier | Condition | Δ |
|---|---|---|
| `user_explicit` | User directly answered a question that targets this field | +0.10 |
| `upstream_explicit` | An upstream module captured this value verbatim in an approved artifact | +0.07 |
| `regulatory_override` | A regulatory_refs entry (PCI-DSS, HIPAA, SOC2, GDPR, FedRAMP) mandates a tighter value | +0.08 |
| `cross_story_agreement` | A sibling story arrives at the same value independently | +0.05 |
| `upstream_contradicts_rule` | An upstream approved field contradicts this rule's conditions | -0.30 |
| `any_input_is_Estimate` | Any input constant is `estimate_final: Estimate` | -0.05 |
| `input_missing` | A required input was not found upstream | -0.15 |
| `rule_default_branch` | The `default` branch matched (no specific rule fired) | -0.10 |

Final confidence is clamped to `[0.00, 1.00]`. Any decision with final ≥ threshold auto-fills. Threshold defaults to 0.90 but is configurable per-story and per-project.

### 5.3 Auto-fill audit record

Every auto-fill writes an audit row:

```json
{
  "decision_id": "response-budget-ms",
  "target_artifact": "module_2_requirements/constants_table.json",
  "target_field": "constants[0].value",
  "value": 500,
  "units": "ms",
  "story_id": "story-03-latency-budget",
  "engine_version": "1.0",
  "evaluated_at": "2026-04-20T04:30:00Z",
  "matched_rule_id": "consumer-app-user-facing-sync",
  "inputs_used": {
    "user_type": {"value": "consumer_app", "source_artifact": "module_1_scope/intake_summary.json", "source_field": "user_class"},
    "flow_class": {"value": "user_facing_sync", "source_artifact": "module_2_requirements/ucbd/UC01.json", "source_field": "steps[2].criticality"}
  },
  "base_confidence": 0.88,
  "modifiers_applied": [
    {"modifier": "regulatory_override", "delta": +0.08, "reason": "intake.regulatory_refs includes PCI-DSS"},
    {"modifier": "cross_story_agreement", "delta": +0.05, "reason": "story-13-security-posture arrives at 500ms bound for payment flows"}
  ],
  "final_confidence": 1.00,
  "auto_filled": true,
  "user_overrideable": true,
  "override_history": []
}
```

**Audit rows land in `decision_audit.jsonl`** alongside the produced artifact. The UI surfaces them as an expandable "why this value?" panel next to every auto-filled field. Overrides append to `override_history[]` with timestamp, user id, old value, new value, reason.

### 5.4 Below-threshold behavior

When `final_confidence < auto_fill_threshold`, the engine emits a **needs-user-input record** instead of writing the field:

```json
{
  "decision_id": "response-budget-ms",
  "target_field": "constants[0].value",
  "needs_user_input": true,
  "question_id": "ask-response-budget",
  "question_text": "What P95 latency target is acceptable for user-facing sync requests?",
  "computed_options": [
    {"value": 500, "units": "ms", "confidence": 0.74, "rationale": "Consumer-app default"},
    {"value": 1000, "units": "ms", "confidence": 0.68, "rationale": "Internal-tool default"},
    {"value": 200, "units": "ms", "confidence": 0.61, "rationale": "Realtime-expected (chat, trading)"}
  ],
  "math_trace_summary": "Base 0.88 (consumer-app-user-facing-sync rule) -0.15 (flow_class missing) = 0.73 < 0.90 threshold",
  "upstream_gaps": ["module_2_requirements.ucbd.UC01.steps[2].criticality"]
}
```

**STOP GAP blocks** until the user resolves. The resolution writes the user's answer + an entry in `override_history[]` even though it's a first-fill, because the math engine had an opinion and the user either confirmed or overrode it. This keeps the audit honest.

### 5.5 Cross-story conflict resolution

Two stories can target the same field. Example: `story-03-latency-budget` and `story-04-availability-posture` both want to write `TIMEOUT_MS` (latency story: 1.5× response budget; availability story: short enough to fail fast for circuit breaker).

**Resolution rule:** stories declare `target_field_priority` in their engine file. The lowest-numbered story with a fired rule wins. Other stories' computations are recorded as `suppressed_by: <winning_story>` in the audit, preserving the math trace for later re-eval.

Declared priorities (initial):

| Field | Priority order (winner first) |
|---|---|
| `RESPONSE_BUDGET_MS` | story-03 (latency) > story-08 (observability SLO) |
| `TIMEOUT_MS` | story-04 (availability) > story-03 (latency) |
| `CACHE_TTL_SEC` | story-02 (caching) > story-01 (consistency) |
| `CIRCUIT_BREAKER_THRESHOLD` | story-04 (availability) only |
| `MAX_RETRIES` | story-04 (availability) > story-06 (messaging) |
| `RATE_LIMIT_RPM` | story-13 (security) > story-05 (traffic distribution) |

---

## 6. Worked example — one phase file rewritten

Full rewrite of **M2 Phase 8 Constants Table** shown below. This is the phase where the auto-fill math engine does the most work (NFR numeric thresholds land here).

### Before (today — `11-Phase-8-Constants-Table.md`, 225 lines)

Opens with "## Knowledge" section explaining what a constants table is (60 lines). Then "## Common software constants with heuristic starting values" (40 lines of prose). Then "## Input Required" (8 lines). Then "## Instructions for the LLM" (40 lines of prose steps). Then "## Output Format" (schema + example, 55 lines). Then "## Software-system translation notes" (15 lines referencing NFR KBs). Then "## STOP GAP" (7 lines).

### After (rewritten — ~400 lines, 6-section shape)

```markdown
# Phase 8 — Constants Table
> Produces: `constants_table.v1` · Consumes: `requirements_table.v1` (from P7) + `ucbd/*.v1` (from P3-P5) · Hands off to: P9 Delve + M3 FFBD handoff + M5 QFD Design Targets

## 1. ARTIFACT

### 1.1 JSON Schema (authoritative)
```json
{
  "_schema": "Requirement_Constants_Definition_Template.schema.json",
  "_output_path": "<project>/module-2-requirements/constants_table.json",
  "_phase_status": "phase-8-complete",
  "metadata": {
    "project_name": "string",
    "document_id": "string",
    "last_update": "date",
    "author": "string",
    "approvers": "string"
  },
  "constants": [
    {
      "constant": "string (UPPER_SNAKE_CASE, [A-Z][A-Z0-9_]{2,})",
      "value": "number | string",
      "units": "string (SI preferred; ms, s, min, req/s, %, count, USD, days)",
      "estimate_final": "enum: Estimate | Final",
      "date_update": "date",
      "final_date": "date | null",
      "source": "string (KB ref or stakeholder)",
      "owned_by": "string",
      "notes": "string",
      "category": "enum: latency | availability | throughput | capacity | retention | security | observability | cost | resiliency | concurrency | consistency | caching | release | maintainability | interface",
      "story_id": "string (story-NN reference, nullable)",
      "referenced_requirements": "string[] (UCxx.Ryy or CC.Ryy)",
      "computed": "bool",
      "computed_by": "string (story-NN@version, null if user-authored)",
      "confidence": "number 0-1 (null if user-authored)",
      "needs_user_input": "bool"
    }
  ],
  "audit_trail": "jsonl path reference"
}
```

### 1.2 Fully populated example
(omitted here for brevity — would include every category represented)

### 1.3 Upstream inputs
| Field | Source | Shape | Required? |
|---|---|---|---|
| Requirements with numeric thresholds | `requirements_table.v1` P7 output | `requirement` strings with inline literals + named placeholders | Yes |
| UCBD initial/ending conditions | `ucbd/*.v1` P3-P5 | flow state + conditions | Yes |
| M1 hard_constraints | `system_scope_summary.v1` | string[] | Yes |
| M1 regulatory_refs | `system_scope_summary.v1` | string | Yes |

### 1.4 Downstream consumers
| Module.Phase | Fields used | Purpose |
|---|---|---|
| M2.P9 Delve | All constants | Check completeness via 15 lenses |
| M2.P10 SysML | Value+units for activity stereotypes | Mermaid diagram labels |
| M2.P12 Handoff | All constants | Carry to FFBD bundle |
| M3.P0A Ingest | Value+units+estimate_final | Arrow label decoration |
| M4 L03 Identify PC | Constant name | Criterion naming seed |
| M4 L05 Scale anchors | Value | Scale anchor anchors |
| M4 L12 Min/Max | Value | Pass/fail threshold |
| M5 P3 EC | Category | EC derivation |
| M5 P9 Design Targets | Value+units+category | Target row |
| M6 Step 8 | Value+units | Interface matrix cells |
| M7 P1 | Constant name | Failure mode generation |
| M7 P4 | Category | Severity scale anchor |

## 2. OPTION SPACE

### 2.1 Field-by-field enum catalog

**`category` enum** (15 values):
- `latency` — time-to-respond (ms, s)
- `availability` — uptime SLO (%, minutes/month)
- `throughput` — sustained rate (req/s, events/s, MB/s)
- `capacity` — storage/compute size bounds (MB, GB, core-count)
- `retention` — data lifetime (days, months)
- `security` — auth/crypto/rate-limit thresholds
- `observability` — SLO window, alert thresholds
- `cost` — budget ceilings (USD/month, USD/req)
- `resiliency` — retry/timeout/circuit-breaker thresholds
- `concurrency` — thread/worker/process counts
- `consistency` — staleness bounds, replication lag tolerance
- `caching` — TTL, cache-size, invalidation windows
- `release` — deploy cadence, rollback thresholds
- `maintainability` — dep-count ceiling, patch SLA
- `interface` — payload size limits, protocol-level bounds

**`estimate_final` enum**: `Estimate` (default) | `Final` (requires final_date + approver).

**`units`** open string but **SI/common units strongly preferred**. Non-canonical units must include a converter note. Catalog of canonical units per category documented in `_nfr-stories/00-STORY-INDEX.md#units-catalog`.

### 2.2 Allowed combinations
- `estimate_final: Final` → `final_date` required.
- `computed: true` → `computed_by` + `confidence` required.
- `category: latency` + `units ∈ {ms, s, min}` (anything else is a bug).
- `category: availability` + `value ≤ 100` + `units == %`.
- `referenced_requirements[]` non-empty for every constant (orphans forbidden).

### 2.3 Forbidden combinations
- Constant name in non-UPPER_SNAKE_CASE.
- Constant with no `referenced_requirements[]` — orphan constants are rejected.
- Two constants with the same name but different values — merge or rename.
- `estimate_final: Final` with no `final_date`.

## 3. MATH ENGINE

### 3.1 Auto-fillable fields (invoked via story engines)

| Field | Engine | Inputs | Threshold |
|---|---|---|---|
| `RESPONSE_BUDGET_MS` | story-03-latency-budget | intake.user_class, UCBD criticality | 0.90 |
| `TIMEOUT_MS` | story-04-availability-posture | RESPONSE_BUDGET_MS, flow_class | 0.90 |
| `AVAILABILITY_TARGET` | story-04-availability-posture | intake.user_class, regulatory_refs | 0.85 |
| `SLO_WINDOW` | story-08-observability-posture | AVAILABILITY_TARGET | 0.95 |
| `MAX_RETRIES` | story-04-availability-posture | flow_class | 0.90 |
| `CIRCUIT_BREAKER_THRESHOLD` | story-04-availability-posture | (standard industry default) | 0.92 |
| `CACHE_TTL_SEC` | story-02-caching-strategy | content_class, consistency_posture | 0.88 |
| `RATE_LIMIT_RPM` | story-13-security-posture | user_class, tier | 0.85 |
| `RETENTION_DAYS` | story-09-data-model | regulatory_refs, data_class | 0.90 |
| `SESSION_TTL_MIN` | story-13-security-posture | user_class, compliance_level | 0.88 |

(full mapping — 28 common constants — in Appendix B)

### 3.2 Deterministic formulas (non-NFR)
- Constant name extraction: regex `[A-Z][A-Z0-9_]{2,}` scanning all `requirement` strings from P6/P7 output.
- De-duplication: case-sensitive exact match on name.

### 3.3 User-input fields (cannot be auto-filled)
| Field | Question | Shape | Escalation |
|---|---|---|---|
| `owned_by` | "Who is accountable for each constant?" | string (role or person) | Stakeholder list defaults applied; user confirms |
| Constants below threshold | "Please confirm or override computed value" | number + units + rationale | STOP GAP blocks advancement |

## 4. NFR STORY BEATS

### 4.1 Stories that advance here
| Story | Decisions | Fields | Default confidence |
|---|---|---|---|
| story-03-latency-budget | RESPONSE_BUDGET_MS, TIMEOUT_MS, ERROR_VISIBILITY_BUDGET_MS | 3 constants | 0.88 |
| story-04-availability-posture | AVAILABILITY_TARGET, SLO_WINDOW, MAX_RETRIES, CIRCUIT_BREAKER_THRESHOLD, MTTR_TARGET_MIN | 5 constants | 0.85 |
| story-02-caching-strategy | CACHE_TTL_SEC, CACHE_INVALIDATION_WINDOW_SEC | 2 constants | 0.88 |
| story-09-data-model | RETENTION_DAYS, BACKUP_CADENCE_HOURS, RPO_MIN | 3 constants | 0.90 |
| story-13-security-posture | RATE_LIMIT_RPM, SESSION_TTL_MIN, PASSWORD_MIN_LENGTH, ENCRYPTION_CLASS | 4 constants | 0.85 |
| story-08-observability-posture | LOG_LEVEL_PROD, TRACE_SAMPLING_RATE, ALERT_THRESHOLD_CPU_PCT | 3 constants | 0.85 |
| story-06-messaging-semantics | DLQ_MAX_RETRIES, ACK_TIMEOUT_SEC | 2 constants | 0.85 |

### 4.2 Story-by-story inline beat
(each story gets 2-4 paragraphs with the specific constants it owns at this phase,
 the math engine inputs, what default rules apply, and what happens downstream.
 full Story Beat content omitted from this template illustration — see Appendix C)

## 5. FAIL-CLOSED RULES

| Rule ID | Trigger | Refusal text | STOP GAP? |
|---|---|---|---|
| C1 | Orphan constant (no referenced_requirements) | "`<NAME>` has no referencing requirement. Either tie to a UCxx.Ryy or remove from the table." | Yes |
| C2 | Duplicate constant name with different values | "`<NAME>` appears twice with values `<V1>` and `<V2>`. Merge into one or rename." | Yes |
| C3 | Non-conforming name | "`<name>` is not UPPER_SNAKE_CASE. Rename." | Yes |
| C4 | Final without final_date | "`<NAME>` is `estimate_final: Final` but has no `final_date`." | Yes |
| C5 | Category + units mismatch | "`<NAME>` category=`latency` but units=`%`. Correct one." | Yes |
| C6 | Auto-fill with confidence < threshold | "Computed `<NAME>` = `<V>` at confidence `<C>` < threshold. Surfacing for user confirmation." | Soft (needs input) |

### 5.2 STOP GAP checklist
1. Every requirement placeholder has a constant row.
2. Every constant has owner + category + referenced_requirements.
3. Every auto-filled constant has an audit entry.
4. Every below-threshold constant has been resolved by user.
5. Estimates → Final transitions have final_date.
6. No C1-C5 violations remain.

## 6. NARRATIVE

Phase 8 turns the placeholder tokens scattered in Phase-7-audited requirements
(`RESPONSE_BUDGET_MS`, `AVAILABILITY_TARGET`, etc.) into a versioned table with
owners + sources. Historically this was the phase where eCornell's "constants"
lesson lived — where named thresholds replace magic numbers. In the rewritten
corpus, this is also **the load-bearing NFR auto-fill gate**: the math engines
for stories 02/03/04/06/08/09/13 all fire here, because this is the first
phase where the LLM commits a number.

---
Next → Phase 9 (Delve and Fix) · Back → Phase 7 (Rules Audit) · Story index → _nfr-stories/00-STORY-INDEX.md
```

That's the template made real for one phase. Every phase across M1-M7 is rewritten to this shape. Where a phase doesn't need section 3 (math engine) because it has no computable fields (e.g., M1 Phase 0 Project Intake — almost entirely user-input), section 3 shrinks to the user-input table only.

---

## 7. Open questions

- **Q1.** **Default threshold 90%?** Too high? Too low? Recommend making per-story configurable (each story's engine declares its default) and per-project overridable. Calibrate empirically: run on 5 historical projects, count false-positive auto-fills vs. false-negative user prompts.
- **Q2.** **Confidence modifiers catalog** — §5.2 proposes 8 modifiers. Are any missing? Key candidates I didn't include: `project_type_specific_prior` (e.g., if `user_class == banking_app`, shift distributions tighter), `tech_stack_lock_in` (if user already committed to a stack, adjust accordingly).
- **Q3.** **UX for below-threshold prompts.** Where does the user see `computed_options` + `math_trace_summary`? Chat-inline? Dedicated review page per phase? Surfacing them well is half the value of the engine.
- **Q4.** **Override reason requirement.** Should overrides require a text rationale (higher friction, better audit) or be one-click (lower friction, weaker audit)? Recommend one-click for confirmations, mandatory rationale for reversals.
- **Q5.** **Story priority conflicts** — §5.5 sketches a priority order. Should conflicts surface to the user when two stories disagree substantially (e.g., story-03 wants TIMEOUT_MS=750ms, story-04 wants TIMEOUT_MS=250ms — the gap is wider than either story's confidence interval), or silently pick the higher-priority story?
- **Q6.** **Engine versioning + migration.** When a story's engine.json is updated (e.g., eCornell publishes revised industry thresholds), existing projects with auto-filled values need a migration path. Default: keep old `computed_by: story-03@v1.0` values, surface a "re-evaluate with engine v2.0?" diff in the UI.
- **Q7.** **Ownership of the 13 engines.** Who authors and maintains them? Each engine file is ~150-400 lines of rule data; the corpus is ~3,500 lines of engine rules total. Proposal: 1 engineer + 1 domain SME per story, paired with course material + vendor whitepapers as sources; QA via calibration runs on historical projects.

---

## 8. Migration plan

### Phase α — Author the story spines (6 working days)
- 13 story files × ~400 lines average = ~5,200 lines.
- Sources: existing 13 NFR sub-KBs + Cornell course material + vendor docs.
- Each spine pairs with a placeholder `engine.json` (empty rules, ready for phase β).

### Phase β — Author the engine files (7 working days)
- 13 engine files × ~200 lines average = ~2,600 lines of rules + modifiers.
- Calibrate confidence defaults against 5 historical product-helper projects (if available) or against synthesis-generated sample inputs.
- Write the interpreter in `apps/product-helper/lib/langchain/nfr-engine/` (~500 LOC).

### Phase γ — Rewrite the phase files schema-first (8 working days)
- M1: 5 phase files × ~400 lines = ~2,000 lines (mostly section 1+2 content, minimal math).
- M2: 14 phase files × ~450 lines = ~6,300 lines.
- M3: 12 phase files × ~350 lines = ~4,200 lines.
- M4: 18 lesson files × ~350 lines = ~6,300 lines.
- M5: 11 phase files × ~350 lines = ~3,850 lines.
- M6: 12 step files × ~350 lines = ~4,200 lines.
- M7: 8 phase files × ~400 lines = ~3,200 lines.
- **Total: ~30,000 lines of rewritten phase-file content.** ~8 days with one author working on boilerplate sections programmatically (sections 1, 2, 5 have repetitive shape).

### Phase δ — Delete duplication + update schemas (2 working days)
- Delete 65 duplicate NFR sub-KB files across M2/M4/M5/M6/M7.
- Delete broken `software_architecture_system.md` (dissolved into stories 03/04/13).
- Update all 5 JSON schemas in place to add the new fields (`category`, `story_id`, `computed`, `computed_by`, `confidence`, `needs_user_input`).

### Phase ε — Integrate auto-fill into product-helper (4 working days)
- LangGraph node per NFR-writing phase calls the engine interpreter.
- UI surfaces `why this value?` expander + override path.
- Audit trail persists to `decision_audit.jsonl` adjacent to each artifact.

**Total: ~27 working days** (before testing + calibration).

**Compared to the earlier "story spine + story beats only" plan** (~11 days), this version adds 13 engine files + interpreter + audit integration + schema extensions. The incremental cost (~16 days) is the math engine + UI + schema evolution. It is the difference between "cleaner narrative" and "deterministic auto-fill with visible math."

---

## 9. What this plan commits the team to

- **The 5 existing JSON schemas become first-class citizens of every phase file** — no more buried-at-bottom.
- **The 13 NFR sub-KBs become executable decision functions** — no more prose-reference-only.
- **The confidence threshold becomes a tunable product parameter** — exposed in project settings, auditable per decision.
- **Every auto-filled value carries its math trace** — the pivot's bet #1 ("math you can see") made literal, field-by-field.
- **The story spine + story beat structure carries NFR narrative across modules** — ends the 5-way duplication + per-phase re-derivation.

What this plan does NOT commit to:
- An NFR-specific Drizzle column overhaul (that's a separate plan, tracked in `schema-mapping-analysis.md`).
- Rewriting Module 1's R3 refusal discipline (R3 is correct; NFRs belong to M2+).
- Breaking any existing artifact shape — all additions are additive fields on the 5 schemas.

---

## 10. Appendices (stubs)

### Appendix A — Full story-spine template (the 7-section shape referenced in §2.2)
See the "7-section shape" example in the prior conversation or draft on request.

### Appendix B — Full 28-constant auto-fill mapping
Table of every common NFR constant (RESPONSE_BUDGET_MS through DLQ_MAX_RETRIES) with its owning story, default confidence, threshold, and modifier stack. To be drafted in phase α.

### Appendix C — Worked Story Beat for Phase 8
Full per-story beat content for the 7 stories that advance at M2 Phase 8 (stories 02/03/04/06/08/09/13). ~1,500 lines. To be drafted in phase γ.

### Appendix D — Units catalog
Canonical SI + engineering-standard units per category (latency→ms/s/min; throughput→req/s/events/s/MB/s; etc.). Referenced by every phase's section 2.1.

### Appendix E — Engine interpreter pseudocode
The ~500-LOC TypeScript module that evaluates engine.json files against upstream artifact state and emits audit rows.

---

*Plan v1 ready for David's review in Cursor. Nothing will be built until you approve (or edit and approve).*
