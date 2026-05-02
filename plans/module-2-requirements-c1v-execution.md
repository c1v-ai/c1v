---
title: Module 2 Execution — Build c1v Requirements from Module 1 Scope
date: 2026-04-20
status: DRAFT v1 — awaiting David's approval in Cursor
author: Bond (Claude Opus 4.7 1M, instance 7e6ap5nn)
peer_input: Module 1 deliverable produced by du6r2sbu (same-name Bond instance, earlier today)
scope: execute phases 0–13 of the "2-dev-sys-reqs-for-kb-llm-software" KB against the c1v project Module 1 scoped
parent_plan: .claude/plans/schema-first-kb-rewrite-and-nfr-engine.md (philosophy only; KB rewrite itself is NOT in scope here)
supersedes: none
---

# Module 2 Execution Plan — c1v Requirements Build

## 1. Vision

Produce a Cornell CESYS525 engineering-grade Module 2 bundle for **c1v**, built on the Module 1 scope your peer instance just delivered, ready to hand off to Module 3 (FFBD). End deliverable: a self-contained `system-design/module-2-requirements/` directory with every artifact the rubric asks for, every numeric threshold traced to a named constant, every use case's step flow rendered as a SysML activity diagram, and a pptx deck stakeholders can open without Claude present.

## 2. Problem

Module 1 delivered the scope (15 use cases, 6 stakeholders, 15 external actors, 5 hard constraints, regulatory refs) — but scope is not a contract. Engineering teams cannot ship against "generate spec from one-sentence idea." They need:
- **Atomic `shall`-statement functional requirements** with stable IDs, abstract function names, and verifiable test implications.
- **Named constants** replacing every inline numeric literal, with Estimate/Final status and owners.
- **Per-UCBD step flows** anchored to a single system column, initial/ending conditions, and cross-links to Requirements Table rows.
- **SysML Activity Diagrams** linking process flow to `<<requirement>>` stereotypes, so Module 3 can lift FFBD function ordering directly.
- **A stakeholder-ready pptx deck** for the UCBDs — not Mermaid for engineers, but slides for review meetings.

Without M2, every downstream module (FFBD, Decision Matrix, QFD, Interfaces, FMEA) lacks the functional backbone it attaches criteria to.

## 3. Current state

### 3.1 What Module 1 produced (inputs)
Located at `system-design/module-1-defining-scope/`:
- `intake_summary.json` — need statement, provisional stakeholders, 5 hard constraints, deferred-to-M4 NFRs (latency, availability, throughput, auditability grade, non-invasiveness grade)
- `stakeholder_list.json` — 6 stakeholders (3 primary, 3 secondary)
- `system_scope_summary.json` — `c1v` system boundary, 15 external actors (4 human, 4 data source, 4 external system, 3 downstream consumer), regulatory_refs ("SOC 2 Type II; HIPAA; GDPR; PCI-DSS (scope tbd)")
- `use_case_inventory.json` — 15 use cases with priority hints, includes/extends relationships
- `context_diagram.{json,mmd}`, `use_case_diagram.{json,mmd}`, `scope_tree.{json,mmd}`
- `diagrams/` — 3 pptx decks already generated (Context, Use Case, Scope Tree)
- 8 open questions flagged for downstream resolution

### 3.2 What the KB gives us (authoring toolchain)
Located at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/2-dev-sys-reqs-for-kb-llm-software/`:
- 17 phase prompt files (`00-Requirements-Builder-Master-Prompt.md` through `16-Phase-13-Generate-UCBD-Pptx.md`)
- 5 JSON schemas (`UCBD_Template_and_Sample.schema.json`, `Requirements-table.schema.json`, `Requirement_Constants_Definition_Template.schema.json`, plus xlsx marshalling templates)
- 13 NFR sub-KBs (caching, CAP, CDN, resiliency, load-balancing, messaging, concurrency, observability, data-model, API, release, maintainability, sys-arch)
- `generate_ucbd_pptx.py` (416 LOC) + `_ucbd_helpers.py` (252 LOC) — pptx marshalling script; consumes `ucbd/*.json`
- Filled test bundle (`*_FILLED_TEST.xlsx` files) as calibration targets
- Glossary, reference samples, JSON-instance write protocol

### 3.3 Philosophy we're applying
Per the pending-review `.claude/plans/schema-first-kb-rewrite-and-nfr-engine.md`:
- **Schema is load-bearing.** JSON artifact is the deliverable; narrative is optional context.
- **Audit fields on every numeric constant** — `computed`, `computed_by`, `confidence`, `estimate_final`, `source`, `owned_by`.
- **Math-visible defaults** — when I fill a value (e.g., `AVAILABILITY_TARGET`) I show the rule, the confidence, and the upstream source. Below 0.90 confidence → surface to you for confirmation, don't commit.
- **We are NOT rewriting the 17 KB phase files, NOT building the NFR interpreter, NOT drafting 13 story spines.** Those are separate plans awaiting separate approval. We execute the methodology using the existing KB as-written and only adopt the schema-first output shape on the produced artifacts.

## 4. End state (file manifest + quality bar)

### 4.1 Directory layout
```
system-design/
├── module-1-defining-scope/          (exists — your peer's output)
└── module-2-requirements/            (← this plan produces)
    ├── system_context_summary.json   (Phase 0 — ingested from M1, not re-derived)
    ├── use_case_priority.json        (Phase 1 — scored ranking of all 15 UCs)
    ├── ucbd/
    │   ├── UC01-generate-spec-from-idea.ucbd.json
    │   ├── UC04-emit-cli-commands.ucbd.json
    │   ├── UC06-recommend-design-improvements.ucbd.json
    │   ├── UC08-trace-tech-stack-to-metric.ucbd.json
    │   ├── UC03-review-spec.ucbd.json
    │   └── UC11-connect-existing-system.ucbd.json
    │                                   (6 first-pass UCBDs — see §5.2 for why these 6)
    ├── requirements_table.json       (Phase 6/7/9 — all `shall` statements, stable IDs, abstract_function_name)
    ├── constants_table.json          (Phase 8 — every numeric threshold named + owned)
    ├── sysml/
    │   ├── UC01-generate-spec-from-idea.activity.mmd
    │   ├── UC04-emit-cli-commands.activity.mmd
    │   ├── UC06-recommend-design-improvements.activity.mmd
    │   ├── UC08-trace-tech-stack-to-metric.activity.mmd
    │   ├── UC03-review-spec.activity.mmd
    │   └── UC11-connect-existing-system.activity.mmd
    ├── ffbd-handoff.json             (Phase 12 — seed function list + ordering hints for Module 3)
    ├── decision_audit.jsonl          (per schema-first: every auto-filled constant logs value + confidence + inputs + rule)
    ├── open_questions.json           (items surfaced for user decision, grouped by which phase they block)
    └── diagrams/
        └── c1v_UCBDs.pptx            (Phase 13 — stakeholder deck, one slide per UCBD, Overview + Details layouts)
```

### 4.2 Engineering-grade quality bar (explicit acceptance criteria)
Every artifact must pass ALL of these:
1. **Conforms to schema.** Validates against `*.schema.json` (jsonschema CLI or equivalent).
2. **No orphan constants.** Every row in `constants_table.json` has ≥1 entry in `referenced_requirements[]`.
3. **No unparameterized literals.** Every numeric threshold in `requirements_table.json` uses `UPPER_SNAKE_CASE` placeholder resolving to a `constants_table.json` row.
4. **Atomicity enforced.** No `and` / `or` joining two behaviors in a `shall` statement.
5. **Functional, not structural.** No implementation choices baked in (no "The system shall use Postgres…"), except the 5 M1 hard constraints which ARE constraints.
6. **Verifiable.** Every `shall` has a pass/fail test implied (measurable verb + bounded object).
7. **One system column per UCBD.** Never split into subsystems — M2 discipline.
8. **Every UCBD step ties back.** Steps in `actor_steps_table` reference requirements by ID in the `notes` field.
9. **Pptx matches JSON.** The deck is generated deterministically from `ucbd/*.json` by `generate_ucbd_pptx.py` — no hand-edits.
10. **Audit trail complete.** Every auto-filled constant (see §5.6) has a row in `decision_audit.jsonl` with inputs, rule, confidence, and source.

### 4.3 Quality bar on the pptx specifically ("engineering GRADE presentations")
- One title slide per UCBD with system name, UC id+name, primary actor, initial→ending condition arrow.
- One detail slide per UCBD with the step flow table in a single-column layout (system column never split).
- Consistent font, color, and header treatment with M1's 3 pptx decks (`c1v_Context_Diagram.pptx`, `c1v_Use_Case_Diagram.pptx`, `c1v_Scope_Tree.pptx`) — same visual system.
- Cover slide + ToC slide + closing/handoff slide.
- Every diagram legible at 1920×1080 without zooming.

## 5. Execution plan

### 5.1 Phase sequencing (follows KB's 14-phase order, with my annotations)

| # | KB Phase | My action | Auto-fillable? | STOP GAP I'll honor |
|---|---|---|---|---|
| 0 | Ingest M1 Scope | Copy M1 artifacts verbatim into M2 dir, produce `system_context_summary.json` as shim | Yes (mechanical) | 1 — show you the ingested bundle |
| 1 | Prioritize Use Cases | Score all 15 on (Business × Frequency × Uniqueness), select top 6 per §5.2 reasoning | Partial — I propose scores; you confirm | 1 — ranking for your sign-off |
| 2 | Thinking Functionally | Knowledge phase (no artifact); I internalize the functional-vs-structural rule before writing system statements | N/A | none |
| 3 | UCBD Setup (×6) | Per selected UC: create UCBD JSON with metadata header + swimlane columns | Yes | 1 per UCBD — 6 stops |
| 4 | Start/End Conditions (×6) | Fill `initial_conditions` + `ending_conditions` lists per UCBD | Yes (from M1 UC inventory) | 1 per UCBD |
| 5 | UCBD Step Flow (×6) | Fill `actor_steps_table` rows — this is the heaviest authoring step | Partial — I draft, you confirm | 1 per UCBD |
| 6 | Extract Requirements Table | Lift every `The system shall…` from all 6 UCBDs into `requirements_table.json` with stable IDs + `abstract_function_name` | Yes (deterministic) | 1 |
| 7 | Requirements Rules Audit | Run atomicity/shall/verifiability/objectivity/ambiguity audits; rewrite failures | Partial | 1 — show audit report + rewrites |
| 8 | Constants Table | Extract every UPPER_SNAKE_CASE placeholder, assign value+units+category+owner, auto-fill the 15–20 NFR constants using 13 sub-KB heuristics | **Yes (heaviest auto-fill) — see §5.6** | 1 — constants for your confirm/override |
| 9 | Delve and Fix | Apply the 9 delving questions per UC; add missed requirements; re-audit | Partial | 1 — additions + final requirements table |
| 10 | SysML Activity Diagram (×6) | Mermaid diagram per UCBD with `<<requirement>>` stereotype links | Yes | 1 per diagram |
| 11 | Multi-UseCase Expansion | Repeat 3–10 for the 9 deferred UCs — **DEFERRED per §5.3** | N/A | N/A |
| 12 | Final Review + FFBD Handoff | Emit `ffbd-handoff.json` with seed function list + sequencing hints + shared-requirement dedup map | Yes | 1 — handoff bundle for approval |
| 13 | Generate UCBD Pptx | Run `generate_ucbd_pptx.py` on all 6 UCBD JSONs → `c1v_UCBDs.pptx` | Yes | 1 — deck review |

Total STOP GAPs I will honor: **~22** (1 + 1 + 6 + 6 + 6 + 1 + 1 + 1 + 1 + 6 + 1 + 1 = 31 if every UCBD's 4 stops counted; I'll batch same-phase-across-UCBDs into 1 consolidated stop per phase unless you say otherwise → **14 actual stops**).

### 5.2 Why these 6 UCBDs for first pass (not 5, not 15)

Top 6 ranked by my proposed (Business × Frequency × Uniqueness) scoring, tuned for **functional coverage** per the KB's guidance:

| # | UC | Primary actor | Why first-pass |
|---|---|---|---|
| 1 | UC01 — Generate Spec from One-Sentence Idea | Founders | Headline use case; covers conversational intake + LLM orchestration + metric-traceback `<<include>>`. |
| 2 | UC04 — Emit CLI Commands from Spec | Engineering Teams | Only UC exercising SKILL.md/CLAUDE.md/MCP export path. Distinct write surface. |
| 3 | UC06 — Recommend Design Improvements | Engineering Teams | Headline feedback-loop use case; covers metric ingestion `<<include>>` + recommendation ranking. |
| 4 | UC08 — Trace Tech-Stack Recommendation to Metric | Engineering Teams | **Hard constraint anchor** — M1 says every tech-stack rec must trace. This UC makes the constraint executable. |
| 5 | UC03 — Review Generated Spec | Product Managers | Only UC exercising approval/rejection/revision state machine; auth `<<include>>` covers UC14. |
| 6 | UC11 — Connect Existing Customer System | Engineering Teams | Only UC exercising non-invasive read-first connection surface — the *other* M1 hard constraint anchor. |

**Deferred to Phase 11 (or next iteration):** UC02, UC05, UC07, UC09, UC10, UC12, UC13, UC14, UC15 — mostly overlap existing UCs functionally or are secondary flows. The 6-UC first pass gives us coverage of **both** headline M1 hard constraints (metric traceback + non-invasive integration) plus every distinct human actor.

**Alternative you may prefer:** pick top 5 (drop UC11 or UC03). Or expand to 7 (add UC02 codebase ingestion as counterpart to UC01). I recommend 6 — covers both hard-constraint anchors without bloating first pass.

### 5.3 What I am NOT doing in this plan
- **NOT running Phase 11 multi-UC expansion** (the remaining 9 UCs). That's a second pass; you confirm after first-pass completes.
- **NOT rewriting the 17 KB phase files schema-first.** That's the `schema-first-kb-rewrite-and-nfr-engine.md` plan; still DRAFT v1.
- **NOT building the NFR math engine interpreter** (~500 LOC + 13 engine.json sidecars). I'll hand-heuristic the ~15–20 NFR constants using the 13 existing sub-KBs as lookup tables, emit one `decision_audit.jsonl` row per auto-filled constant, and surface below-threshold constants for you to decide — same contract, lower implementation cost.
- **NOT touching any code in `apps/product-helper/`.** M2 is pure deliverable authoring. No product changes.
- **NOT answering the 8 M1 open questions myself.** Where they drive a constant (e.g., latency budget), I auto-fill with an industry default + confidence score + audit entry; you confirm or override at the Phase 8 STOP GAP.

### 5.4 Risk register
1. **Priority scoring is subjective.** Mitigation: I'll show all 15 UC scores + rationale + uniqueness factor for each; you approve before I advance past Phase 1.
2. **15 M1 external actors ≠ 15 UCBD actor rows.** The UCBD swimlane has 1 primary actor + ≤3 secondaries per the schema. Secondary data-sources like "LIVE PERFORMANCE METRICS" collapse into the event that triggers the step, not their own swimlane. Mitigation: I'll call these out explicitly in each UCBD STOP GAP.
3. **Numeric thresholds are fragile.** "99.9% availability" could be wrong for a B2B dev tool (maybe 99.5 is fine, maybe 99.99 is table stakes). Mitigation: every NFR constant is `Estimate` status with computed confidence; Module 4 tightens them. If any constant hits confidence < 0.75, I refuse to auto-fill and surface.
4. **Pptx visual consistency with M1 decks.** Your peer generated M1 decks with 3 separate scripts. The M2 `generate_ucbd_pptx.py` script is separate. Mitigation: before generating, I'll diff style constants (colors, fonts, margins) against `diagrams/generate_context_diagram_pptx.py` and align before running.
5. **The KB's `software_architecture_system.md` file is implicated in schema-first plan as being dissolved.** For this M2 execution I treat it as source truth (per KB's mapping table) but will NOT split across sub-KBs. That dissolution is deferred to the rewrite plan.
6. **My peer instance (du6r2sbu) may touch M1 files.** Low risk; M1 is already `status: approved`. I'll treat M1 artifacts as read-only source truth. If I find a bug in M1 I open a separate comment, don't edit.

### 5.5 Timing estimate (working hours, one Claude session)
| Phase | Time |
|---|---|
| 0 Ingest | 5 min (mechanical copy) |
| 1 Prioritize | 20 min (score 15 UCs + rationale) + STOP |
| 2 Functional thinking | 0 min (knowledge only) |
| 3–5 UCBDs ×6 | 90 min (15 min/UCBD × 6) + 6 STOPs |
| 6 Extract Req Table | 25 min + STOP |
| 7 Rules Audit | 30 min + STOP |
| 8 Constants Table | 45 min (heaviest — NFR auto-fill) + STOP |
| 9 Delve and Fix | 30 min + STOP |
| 10 SysML ×6 | 30 min (5 min/diagram × 6) + 6 STOPs |
| 12 FFBD Handoff | 20 min + STOP |
| 13 Pptx | 15 min + STOP |

**Active authoring time: ~5 hours.** Wall-clock depends on STOP-GAP turnaround. If you batch approvals, likely 1 working day end-to-end.

### 5.6 How the Phase 8 Constants Table auto-fill actually works
Since this is the highest-leverage auto-fill step, making it explicit:

Sources I consult (in priority order):
1. **Regulatory refs from M1** — `SOC 2 Type II; HIPAA; GDPR; PCI-DSS`. These modify default confidences (+0.08 per schema-first modifier table).
2. **Hard constraints from M1** — 5 constraints. Non-invasive → CPU/memory overhead constants. Metric-traceback → traceback coverage %.
3. **13 NFR sub-KBs in the same folder** — each is a rubric for a decision. I'll use them as lookup tables:
   - `software_architecture_system.md` → AVAILABILITY_TARGET, SLO_WINDOW
   - `caching-system-design-kb.md` → CACHE_TTL_SEC
   - `resilliency-patterns-kb.md` → MAX_RETRIES, CIRCUIT_BREAKER_THRESHOLD, TIMEOUT_MS
   - `cdn-networking-kb.md` → CDN_CACHE_TTL
   - `observability-kb.md` → LOG_LEVEL_PROD, TRACE_SAMPLING_RATE, SLO_WINDOW
   - `api-design-sys-design-kb.md` → RATE_LIMIT_RPM, MAX_PAYLOAD_KB
   - `data-model-kb.md` → RETENTION_DAYS
   - `message-queues-kb.md` → DLQ_MAX_RETRIES, ACK_TIMEOUT_SEC
   - `deployment-release-cicd-kb.md` → DEPLOY_CADENCE_PER_WEEK
4. **8 M1 open questions** — where an open question drives a constant, I auto-fill with the industry median for `user_class=developer_tool` and flag it with confidence < 0.80 for your review.

Expected constants (projected ~18–22 total):
- **Latency / Throughput**: RESPONSE_BUDGET_MS, P95_LATENCY_MS, SPEC_GENERATION_TIMEOUT_SEC, TRACEBACK_COVERAGE_PCT (per M1 hard constraint)
- **Availability / Resilience**: AVAILABILITY_TARGET, SLO_WINDOW, MAX_RETRIES, CIRCUIT_BREAKER_THRESHOLD, MTTR_TARGET_MIN
- **Security**: SESSION_TTL_MIN, RATE_LIMIT_RPM, API_KEY_ROTATION_DAYS, ENCRYPTION_CLASS
- **Compliance**: AUDIT_RETENTION_DAYS (driven by SOC2/HIPAA/GDPR/PCI-DSS), EVIDENCE_EXPORT_FORMATS (enum)
- **Observability**: TRACE_SAMPLING_RATE, LOG_LEVEL_PROD, ALERT_THRESHOLD_ERROR_RATE_PCT
- **Cost / Capacity**: MAX_MONTHLY_LLM_SPEND_USD, MAX_CONCURRENT_AGENT_RUNS
- **Non-invasiveness (M1 hard constraint)**: MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT

Per-constant audit row written to `decision_audit.jsonl` (shape exactly as §5.3 of the schema-first plan). Below-threshold constants land in `open_questions.json` with math-trace summary for your decision.

## 6. Open questions (must decide before I execute Phase 1)

1. **First-pass UCBD count.** 5 / 6 (my recommendation) / 7 / all 15? If you want all 15, I'd estimate 11 hours active authoring and suggest batching across two sessions.
2. **Should I honor every UCBD STOP GAP (14 stops), or batch into 4 consolidated review checkpoints?** (Post-Phase-1, post-UCBD-set, post-Phase-9, final.) My recommendation: 4 consolidated stops — faster wall-clock, same rigor.
3. **Auto-fill threshold.** Default 0.90 per schema-first plan. Do you want that tighter (0.95 — almost nothing auto-fills, you confirm everything), or looser (0.85 — faster, more defaults to review)? I recommend 0.90.
4. **Compliance scope decision (M1 open question #9).** This directly drives AUDIT_RETENTION_DAYS, EVIDENCE_EXPORT_FORMATS, and 3–4 constants. Do you want all 4 frameworks in v1 scope, or just SOC 2 + HIPAA? I can auto-fill "all 4" with confidence 0.78 (below 0.90 threshold → I'll surface for you) — or you can decide now and I skip the surfacing.
5. **Non-invasiveness overhead target (M1 open question #10).** Drives `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT`. Industry defaults for monitoring agents: 1–3% CPU. I'd auto-fill 2% as `Estimate` / confidence 0.82. Confirm now or surface at P8.
6. **Latency budget for "real-time feedback loop" (M1 open question #6).** Drives `FEEDBACK_LOOP_LATENCY_SEC`. The word "real-time" is underspecified: 1s (sync UI), 60s (reactive dashboard), 1h (batch report)? Recommend 60s with confidence 0.75 (below threshold → surface). Confirm now or P8.
7. **Write-back semantics (M1 open question #7).** Drives several UCBD step flows. v1 = read-only (suggest-only), v1.1+ = write-through (suggest-and-apply). Need answer before drafting UC06 and UC11 steps (Phase 5).
8. **Where does `system-design/` belong in the repo?** M1 placed it at repo root. I'll mirror (`system-design/module-2-requirements/`). Confirm or redirect to `apps/product-helper/...`.

## 7. What commits if you approve

- I execute phases 0→13 in order against the c1v scope from M1.
- I produce the file manifest in §4.1, honoring the quality bar in §4.2–4.3.
- I honor STOP GAPs per §5.1 (you confirm whether 14 or 4 per open question #2).
- I write `decision_audit.jsonl` for every auto-filled constant — math-visible, overrideable.
- I touch ZERO files in `apps/`. This is pure deliverable authoring under `system-design/module-2-requirements/`.
- I will NOT proceed past any STOP GAP without your explicit confirmation.

## 8. What you do next

- **Approve, approve-with-edits, or reject.** If edits, mark them inline and I'll integrate before starting.
- **Answer the 8 open questions in §6.** (#1–#3 are pure meta; #4–#8 are content decisions. #4–#8 can also be deferred to Phase 8 STOP GAP if you want me to show you math first.)
- **Say "go"** → I start with Phase 0 (ingest) and produce the first STOP GAP artifact for your review.

---

*Plan v1 ready for David's review in Cursor. Nothing will be built until you approve (or edit and approve).*
