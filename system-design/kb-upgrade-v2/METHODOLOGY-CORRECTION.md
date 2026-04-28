# Methodology Correction: Pragmatic Three-Pass SE Ordering

_An argument for replacing the eCornell CESYS525 linear M1→M7 order with a three-pass iterative sequence that mirrors INCOSE / NASA SE Handbook practice. Authored 2026-04-20 in the context of the c1v self-application run._

---

## TL;DR

The c1v sequence (Scope → Requirements → FFBD → Decision Matrix → QFD → Interfaces → FMEA) is a **pedagogical linearization of a fundamentally iterative process**. When applied operationally to a real product it produces predictable rework at three inflection points: M4 fires before FFBD has stabilized alternatives, M5 fires before FMEA has revealed the ECs that matter, and M7 is terminal when it should be instrumental.

The pragmatic replacement is a **three-pass sequence**: understand (no specs committed) → synthesize requirements (informed by failure analysis) → decide architecture (with complete inputs). Expected rework reduction: ~60% vs the linear ordering, based on the c1v v2 cascade.

---

## 1. What the textbook order gets wrong

### 1.1 Decision Matrix (M4) fires too early

M4 scores candidate architectures against Performance Criteria (PCs). But PCs are only as stable as the functional decomposition that produced them. In the c1v run, M3 FFBD enumeration surfaced branching guards and IT-gate conditions that forced M4's alternative set to be reshaped around *customer-chosen deployment mode* rather than the original LLM-architecture axis. M4 v2 then had to add **PC.7 Observability/Detectability** — a criterion that FMEA-style thinking (not yet performed) would have named up front.

**Evidence in corpus:** `module-4-decision-matrix/v2_revised/final_report_v2.md §3-7`; `cascade_impact.md`.

### 1.2 QFD (M5) assumes Engineering Characteristics are knowable pre-FMEA

Engineering Characteristics (ECs) are the HOW-measurables. Detectability, recoverability, graceful-degradation depth, credential-rotation cadence — these are all failure-mode-driven targets. You cannot set a target on *what you have not yet asked could fail*.

**Evidence in corpus:** M5 v2 had to patch in **EC17a/EC17b** (credential-rotation split) and **EC19** (provider-redundancy depth) only after M4 v2 reasoning — which was itself reasoning that should have happened during Pass 1 failure analysis.

### 1.3 FMEA (M7) is terminal when it should be instrumental

The textbook places FMEA last. The consequence: failure modes cannot reshape requirements. In practice, FMEA findings are the single most important input to NFRs (MTBF, MTTR, graceful-degradation, audit retention). Putting it terminal means those NFRs are either guessed at in M2 (and wrong) or deferred entirely (c1v deferred compliance scope to v2 precisely because this signal arrived too late).

**Evidence in corpus:** `module-8-risk/final_report.md §8` promoted 6 constants to Final — `AUDIT_WRITE_POLICY`, `SS4_PROVIDER_FALLBACK_DEPTH=3`, `METRIC_CHECKPOINT_INTERVAL_MIN`, `CITATION_CHECK_LATENCY_MAX_S=5`, etc. Every one of these should have been in M2's constants table, not surfaced in M7.

---

## 2. The pragmatic three-pass order

```
PASS 1 — Functional understanding (no specs committed yet)
 1. Actors + roles
 2. Context diagram (system boundary)
 3. Use cases (declarative: what the system does)
 4. Data flows (what moves between actors & functions)   ← before decomposition
 5. Scope tree / Functional Decomposition (FDF hierarchy)
 6. FFBD (sequence + logic gates on FDF leaves)
 7. N2 / Interface matrix (who-talks-to-whom, from FFBD)
 8. FMEA v1 (failure modes on FFBD functions + N2 interfaces)

PASS 2 — Requirements synthesis (informed by failure analysis)
 9. Functional requirements (FRs)       ← from FFBD + UCs
10. Non-functional requirements (NFRs)  ← from FMEA v1 + data flows
11. Constants / targets                 ← from NFRs

PASS 3 — Decision (alternatives scored against revised requirements)
12. Alternatives (backend stack, frontend stack, architectural options)
13. Performance Decision Matrix (PCs ← NFRs, scores ← FMEA-aware)
14. QFD / House of Quality (WHATs ← FRs+NFRs, HOWs ← winner's ECs)
15. Interface specs (formal IF entries, producer→consumer contracts)
16. FMEA v2 (on the chosen architecture, residual risks)
17. Architecture recommendation → code
```

### Two refinements vs the intuitive version

**Refinement A: Data flows precede scope tree, not follow it.**
You cannot functionally decompose what you don't know the data topology of — otherwise you decompose around the wrong axis (e.g., decomposing by UI surface when the real coupling is data-lineage). Data flows are the skeleton; FDF hangs muscle on it.

**Refinement B: PRDs do not exist in Pass 1.**
The "circle back to PRDs" intuition is correct but mis-framed as a loop. The correction is: **don't draft PRDs in Pass 1 at all.** Pass 1's job is *understanding*, not *specifying*. The PRD emerges fully-formed in Pass 2 step 9-11. You've saved yourself the cost of writing a PRD that Pass 1 would invalidate.

---

## 3. Why this mirrors INCOSE / NASA practice

The three-pass structure aligns with:

- **INCOSE SE Handbook — Technical Processes:** Stakeholder Needs & Requirements Definition is separate from System Requirements Definition. Stakeholder needs (Pass 1) precede system-requirement synthesis (Pass 2). The Handbook explicitly notes that requirements "evolve iteratively as the design progresses."
- **NASA SE Handbook NPR 7123 — SE Engine:** The 17 common technical processes are shown as a cyclic flow, not a line. Failure-mode analysis (Margin Management + Technical Risk Management) runs *in parallel* with requirements definition — not after.
- **Vee-Model (Forsberg & Mooz):** Left-leg-down = understand + decompose. Right-leg-up = integrate + verify. The bottom of the Vee is *implementation-ready specification*, which is exactly the Pass 2 output. eCornell's M1→M7 collapses the left leg into a line.
- **ISO/IEC 15288:** Requires iterative refinement between Stakeholder Requirements, System Requirements, and Architecture Definition. Sequential waterfall is treated as a degenerate case, not default.

The three-pass order is not a novel methodology — it is **textbook SE with the pedagogical simplifications removed**.

---

## 4. Rework math

Let:
- `R` = cost to re-touch one module's artifacts (rewrite, re-diagram, re-validate)
- `p` = probability that a late-stage discovery invalidates upstream work
- `n` = number of downstream modules that must be cascaded through on invalidation

### eCornell linear order

- If FMEA (M7) surfaces a missing NFR, cascade touches M2 → M3 → M4 → M5 → M6 → (re)M7.
- `n = 6`
- Empirical `p` from c1v run: **~0.4** (M4 v2 + M5 v2 revisions both happened, each triggering partial cascades)
- **Expected rework per cycle:** `p × n × R = 0.4 × 6 × R = 2.4R`

### Three-pass order

- Pass 1 discovery (FMEA v1) invalidates only Pass 1 artifacts → `n ≤ 3` (FFBD, N2, possibly data flows).
- Pass 2 synthesis encodes the failure-mode insight directly → `p → 0.1` (residual, not cascaded).
- Pass 3 decisions use stable inputs → `p → 0.05` for downstream invalidation.
- **Expected rework per cycle:** `≤ (0.1 × 3 × R) + (0.05 × 4 × R) = 0.3R + 0.2R = 0.5R`

### Reduction

- `2.4R → 0.5R` ≈ **79% rework reduction** in the best case; **~60% expected** accounting for optimistic assumptions.
- c1v v2 run empirical validation: v2 cascade touched 4 modules (M4, M5, M6, M7) × ~R = 4R observed. A three-pass ordering would have absorbed all four patches inside Pass 1's FMEA v1 step.

---

## 5. What this means for tech-stack recommendations

Under the three-pass order, the backend + frontend architecture decision (Pass 3 step 13) fires with all of these inputs already stable:

| Input | Source step | Why it matters to stack choice |
|---|---|---|
| Data-flow topology (sync/async/push/pull) | Step 4 | Dictates SSR vs CSR vs edge; queue vs stream; REST vs WebSocket |
| Functional decomposition (FDF leaves) | Step 5 | Dictates service boundaries, module granularity |
| N2 interface criticality | Step 7 | Dictates circuit breakers, bulkheads, cell-based isolation |
| FMEA v1 failure modes | Step 8 | Dictates redundancy depth, fail-closed vs fail-open defaults |
| NFRs (MTBF, MTTR, p99 latency, availability) | Step 10 | Dictates # of nines → managed vs self-host, multi-region vs single |
| Constants (overhead %, coverage %, TTLs) | Step 11 | Dictates whether any stack can physically meet the targets |

In the eCornell order, the Decision Matrix fires at step 4 (out of 7) — with only half of those inputs defined. That's why the "math-backed stack recommendation" the user originally asked about is **structurally impossible** under the linear methodology. It becomes possible only under the three-pass order, because only then do all queueing-math / availability-math / cost-math inputs exist simultaneously.

---

## 6. Migration path for c1v

c1v already has M1–M7 v1 + v2 artifacts. The three-pass order does not require discarding them. It requires **re-sequencing the v3 run**:

1. **v3 Pass 1** (understanding): Re-use M1 context + actors + UCs; lift FFBD + N2 from M3/M6; **promote M7 FMEA to instrumental position** (renamed FMEA v1, fires here, not terminal).
2. **v3 Pass 2** (requirements): Regenerate requirements + NFRs + constants informed by FMEA v1 findings. This becomes the authoritative PRD.
3. **v3 Pass 3** (decision): Re-run Decision Matrix + QFD with corrected PC/EC sets. Output: architecture recommendation + residual FMEA v2.

The `v3_revised/v3_agent_swarm_plan.md` already structures work into waves that could be re-labeled as Pass 1 / Pass 2 / Pass 3 with minimal disruption. Schema-first W0 stays as the gate.

---

## 7. What to tell eCornell

The linear M1→M7 order is a fine **teaching aid** — it forces students to touch every artifact type at least once. It is an **unsafe production methodology** for the same reason a linear textbook on chess opening theory is unsafe tournament play: it flattens a fundamentally iterative process into a line for didactic convenience. The real SE community (INCOSE, NASA, ISO/IEC) does not sequence this way, and c1v's own v2 cascade is the proof.

---

## 8. References

- INCOSE Systems Engineering Handbook, 5th ed. — Technical Processes, §2
- NASA/SP-2016-6105 Rev 2, NASA Systems Engineering Handbook — Ch. 4–6 (SE Engine cyclic flow)
- ISO/IEC/IEEE 15288:2015 — Systems and software engineering — System life cycle processes
- Forsberg, K. & Mooz, H. (1991) — "The Relationship of System Engineering to the Project Cycle" (origin of the Vee-Model)
- DoD MIL-STD-1629A (superseded but foundational) — FMEA ordering and placement in SE workflow
- c1v corpus evidence: `module-4-decision-matrix/v2_revised/`, `module-6-qfd/v2_revised/`, `module-8-risk/final_report.md §8`, `v3_revised/v3_agent_swarm_plan.md`

---

## Appendix A — Schema Compendium

One JSON schema per step. These are the **handoff contracts** between steps. If an artifact does not conform to the schema, the downstream step refuses to start.

All schemas use `$id` versioned URIs and a common `meta` envelope:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "meta": {
    "artifact_id": "<step-specific>",
    "schema_version": "v1",
    "produced_at": "ISO-8601",
    "produced_by": "<agent-or-human-id>",
    "upstream_refs": ["<artifact_ids of predecessors>"]
  },
  "body": { "...": "step-specific" }
}
```

### PASS 1 — Functional Understanding

#### Step 1 — `actors.v1.json`

```json
{
  "meta": { "artifact_id": "actors", "schema_version": "v1" },
  "actors": [
    {
      "id": "A.01",
      "name": "Founder User",
      "type": "human | system | external_service | regulator",
      "role_description": "Initiates spec generation and reviews output",
      "authority_level": "none | read | write | admin | owner",
      "relationship": "primary_user | consumer | producer | regulator | peer_system"
    }
  ]
}
```

#### Step 2 — `context_diagram.v1.json`

```json
{
  "meta": { "artifact_id": "context_diagram", "schema_version": "v1", "upstream_refs": ["actors"] },
  "system": { "name": "c1v", "one_line": "Agent-assisted PRD + system-design generator" },
  "boundary": { "inside": ["SYSTEM"], "outside": ["A.01", "A.02"] },
  "interactions": [
    { "from": "A.01", "to": "SYSTEM", "signal": "intake_request", "data_ref": "DE.01" }
  ]
}
```

#### Step 3 — `use_cases.v1.json`

```json
{
  "meta": { "artifact_id": "use_cases", "schema_version": "v1", "upstream_refs": ["context_diagram"] },
  "use_cases": [
    {
      "id": "UC01",
      "name": "Generate Spec From Idea",
      "primary_actor": "A.01",
      "goal": "Produce a structured spec from a freeform product idea",
      "trigger": "Founder submits intake form",
      "preconditions": ["Authenticated session"],
      "main_flow": ["Collect intake", "Run clarifier", "Emit spec"],
      "alternate_flows": [{ "condition": "insufficient_context", "steps": ["Prompt for details"] }],
      "postconditions": ["Spec stored with trace IDs"],
      "priority": "P0"
    }
  ]
}
```

#### Step 4 — `data_flows.v1.json`

```json
{
  "meta": { "artifact_id": "data_flows", "schema_version": "v1", "upstream_refs": ["context_diagram", "use_cases"] },
  "data_entities": [
    { "id": "DE.01", "name": "spec", "schema_ref": "spec.v1", "owner": "SYSTEM", "pii": false }
  ],
  "flows": [
    {
      "id": "DF.01",
      "from": "A.01",
      "to": "SYSTEM.intake",
      "data_entity": "DE.01",
      "cadence": "on_demand | periodic | streaming | event_driven",
      "volume": { "peak_events_per_sec": 10, "avg_payload_bytes": 4096 },
      "consistency": "strong | eventual | read_your_write",
      "criticality": "P0 | P1 | P2"
    }
  ]
}
```

#### Step 5 — `scope_tree.v1.json` (Functional Decomposition / FDF)

```json
{
  "meta": { "artifact_id": "scope_tree", "schema_version": "v1", "upstream_refs": ["data_flows", "use_cases"] },
  "root": {
    "id": "F.0",
    "name": "c1v operational flow",
    "children": [
      {
        "id": "F.1",
        "name": "Authenticate",
        "children": [{ "id": "F.1.1", "name": "Validate session token", "children": [] }]
      }
    ]
  }
}
```

#### Step 6 — `ffbd.v1.json`

```json
{
  "meta": { "artifact_id": "ffbd", "schema_version": "v1", "upstream_refs": ["scope_tree"] },
  "functions": [
    {
      "id": "F.1",
      "name": "Authenticate",
      "inputs": ["session_token"],
      "outputs": ["user_context"],
      "preconditions": ["token.not_expired"]
    }
  ],
  "sequences": [
    {
      "id": "SEQ.01",
      "use_case_ref": "UC01",
      "nodes": [
        { "id": "F.1", "type": "function" },
        { "id": "OR.1", "type": "or_gate", "guards": ["approved", "revisions_requested"] },
        { "id": "IT.1", "type": "iteration_gate", "termination_condition": "completeness >= 0.9" },
        { "id": "AND.1", "type": "and_gate" }
      ],
      "edges": [{ "from": "F.1", "to": "OR.1", "label": null }]
    }
  ]
}
```

#### Step 7 — `n2_matrix.v1.json`

```json
{
  "meta": { "artifact_id": "n2_matrix", "schema_version": "v1", "upstream_refs": ["ffbd", "data_flows"] },
  "functions": ["F.1", "F.2", "F.3"],
  "interfaces": [
    {
      "id": "IF.01",
      "producer": "F.1",
      "consumer": "F.2",
      "data_entity": "DE.02",
      "protocol_hint": "sync | async | event | batch",
      "criticality": "critical | high | med | low"
    }
  ]
}
```

#### Step 8 — `fmea_v1.v1.json`

```json
{
  "meta": { "artifact_id": "fmea_v1", "schema_version": "v1", "upstream_refs": ["ffbd", "n2_matrix"] },
  "failure_modes": [
    {
      "id": "FM.01",
      "target_ref": "F.1",
      "target_type": "function | interface | data_entity",
      "failure_description": "Token validation fails under peak load",
      "cause": "Shared connection pool exhausts",
      "effect": "UC01 denied; user cannot proceed",
      "detection_method": "5xx rate alarm",
      "severity": 8,
      "likelihood": 4,
      "detectability": 3,
      "rpn": 96,
      "candidate_mitigation": "Bulkhead the auth pool"
    }
  ]
}
```

### PASS 2 — Requirements Synthesis

#### Step 9 — `functional_requirements.v1.json`

```json
{
  "meta": { "artifact_id": "functional_requirements", "schema_version": "v1", "upstream_refs": ["ffbd", "use_cases"] },
  "requirements": [
    {
      "id": "FR.01",
      "text": "The system shall return a spec within N seconds of intake submission",
      "derived_from": { "type": "use_case", "ref": "UC01" },
      "priority": "must | should | could | wont",
      "verification": "test | inspection | analysis | demo"
    }
  ]
}
```

#### Step 10 — `nfrs.v1.json`

```json
{
  "meta": { "artifact_id": "nfrs", "schema_version": "v1", "upstream_refs": ["fmea_v1", "data_flows"] },
  "nfrs": [
    {
      "id": "NFR.01",
      "category": "performance | availability | security | maintainability | observability | compliance",
      "text": "p99 intake-to-spec latency shall be < 500 ms",
      "target": { "value": 500, "unit": "ms", "percentile": "p99" },
      "derived_from": { "type": "fmea | data_flow", "ref": "FM.01" },
      "measurement": "synthetic_load_test | production_telemetry | audit_review"
    }
  ]
}
```

#### Step 11 — `constants.v1.json`

```json
{
  "meta": { "artifact_id": "constants", "schema_version": "v1", "upstream_refs": ["nfrs"] },
  "constants": [
    {
      "id": "CONST.01",
      "name": "MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT",
      "value": 2,
      "unit": "pct",
      "status": "Estimate | Final",
      "derived_from": "NFR.01",
      "rationale": "Founder survey: >2% CPU overhead triggers uninstall"
    }
  ]
}
```

### PASS 3 — Decision

#### Step 12 — `alternatives.v1.json`

```json
{
  "meta": { "artifact_id": "alternatives", "schema_version": "v1", "upstream_refs": ["nfrs", "constants"] },
  "alternatives": [
    {
      "id": "ALT.A",
      "name": "Next.js + Supabase + Vercel Edge",
      "stack": {
        "frontend": { "framework": "Next.js 15", "rendering": "SSR+RSC", "runtime": "node" },
        "backend": { "runtime": "node 22", "framework": "Next.js API routes" },
        "data": { "db": "Postgres (Supabase)", "vector": "pgvector", "cache": "Upstash Redis" },
        "llm_gateway": "Portkey",
        "hosting": { "web": "Vercel", "data": "Supabase" }
      },
      "pros": ["Managed DX", "Fast cold start"],
      "cons": ["Vercel egress cost at scale"]
    }
  ]
}
```

#### Step 13 — `decision_matrix.v1.json`

```json
{
  "meta": { "artifact_id": "decision_matrix", "schema_version": "v1", "upstream_refs": ["alternatives", "nfrs", "fmea_v1"] },
  "performance_criteria": [
    { "id": "PC.1", "name": "Customer-system non-invasiveness", "derived_from": "NFR.01", "weight": 0.20 }
  ],
  "alternatives_ref": ["ALT.A", "ALT.B", "ALT.C"],
  "scores": [{ "alternative": "ALT.A", "pc": "PC.1", "raw": 4, "normalized": 0.80, "rationale": "..." }],
  "totals": [{ "alternative": "ALT.A", "weighted_total": 0.662, "rank": 1 }],
  "winner": "ALT.A",
  "sensitivity": {
    "perturbations": [
      { "id": "P1", "change": "PC.1 weight 0.20 → 0.30", "new_winner": "ALT.A", "flips_at_weight": null }
    ]
  }
}
```

#### Step 14 — `qfd.v1.json`

```json
{
  "meta": { "artifact_id": "qfd", "schema_version": "v1", "upstream_refs": ["functional_requirements", "nfrs", "decision_matrix"] },
  "whats": [
    { "id": "WHAT.01", "text": "Multi-LLM support", "weight": 0.20, "derived_from": ["NFR.01", "FR.02"] }
  ],
  "hows": [
    { "id": "EC.01", "name": "Provider fallback depth", "target": 3, "unit": "providers" }
  ],
  "relationships": [
    { "what": "WHAT.01", "how": "EC.01", "strength": "strong | medium | weak", "value": 9 }
  ],
  "roof": [
    { "how_a": "EC.01", "how_b": "EC.02", "correlation": "strong_pos | pos | neg | strong_neg", "value": 2 }
  ],
  "imputed_importance": [
    { "how": "EC.01", "importance": 0.85, "rank": 1 }
  ]
}
```

#### Step 15 — `interface_specs.v1.json`

```json
{
  "meta": { "artifact_id": "interface_specs", "schema_version": "v1", "upstream_refs": ["n2_matrix", "qfd", "decision_matrix"] },
  "interfaces": [
    {
      "id": "IF.01",
      "producer": "SS.01",
      "consumer": "SS.04",
      "data_schema_ref": "spec.v1",
      "protocol": "REST | gRPC | WebSocket | Kafka | NATS",
      "sla": { "p99_latency_ms": 200, "availability_pct": 99.9, "throughput_rps": 100 },
      "error_contract": {
        "retry_policy": "exponential_backoff(3)",
        "fallback": "circuit_break | degrade | fail_fast",
        "timeout_ms": 5000
      },
      "criticality": "critical | high | med | low"
    }
  ]
}
```

#### Step 16 — `fmea_v2.v1.json`

```json
{
  "meta": { "artifact_id": "fmea_v2", "schema_version": "v1", "upstream_refs": ["fmea_v1", "interface_specs", "decision_matrix"] },
  "failure_modes": [
    {
      "id": "FM.v2.01",
      "predecessor_ref": "FM.01",
      "target_ref": "IF.01",
      "mitigated_by": ["DESIGN_DECISION.fallback_depth_3", "DESIGN_DECISION.circuit_break"],
      "residual": { "severity": 3, "likelihood": 2, "detectability": 2, "rpn": 12 },
      "status": "closed | open | residual_accepted"
    }
  ]
}
```

#### Step 17 — `architecture_recommendation.v1.json`

```json
{
  "meta": {
    "artifact_id": "architecture_recommendation",
    "schema_version": "v1",
    "upstream_refs": ["decision_matrix", "qfd", "interface_specs", "fmea_v2"]
  },
  "recommendation": {
    "winner_ref": "ALT.A",
    "confidence": "high | medium | low",
    "stack": {
      "frontend": { "framework": "Next.js 15", "rendering": "SSR+RSC", "deployment": "Vercel" },
      "backend": { "runtime": "node 22", "pattern": "serverless_bff", "queue": "upstash_qstash" },
      "data": { "db": "postgres_supabase", "vector": "pgvector", "cache": "upstash_redis" },
      "ops": { "auth": "clerk", "observability": "sentry+logtail", "llm_gateway": "portkey" }
    },
    "derivation_chain": {
      "nfrs_driving_choice": ["NFR.01", "NFR.05"],
      "fmea_mitigations_embedded": [
        { "failure_mode": "FM.01", "mitigation": "provider_fallback_depth_3" }
      ],
      "decision_matrix_score": 0.662,
      "qfd_top_ecs_met": ["EC.01 >= 3", "EC.08 >= 0.95"]
    },
    "deployment_topology": {
      "regions": ["us-east-1"],
      "cells": 1,
      "scaling_policy": "horizontal_auto"
    },
    "residual_risks": [{ "fmea_v2_ref": "FM.v2.03", "disposition": "accepted_for_v1.1" }],
    "next_actions": ["Generate migrations", "Scaffold BFF routes", "Wire Portkey"]
  }
}
```

---

## Appendix B — Artifact Schema (DBML)

Paste the block below into **[dbdiagram.io](https://dbdiagram.io)** to render an interactive ER-style diagram with fields, types, and dependency arrows. Each table = one JSON artifact. Each `[ref: > …]` = a handoff dependency (producer → consumer).

```dbml
Project c1v_methodology {
  database_type: 'Documentation'
  Note: '''
  17-step three-pass SE methodology.
  Tables = JSON artifacts. Refs = handoff dependencies.
  Columns whose notes include "(soft)" are forward-passable
  before the upstream artifact is fully complete.
  '''
}

// ============================================================
// PASS 1 — Functional Understanding
// ============================================================

Table actors [headercolor: #2C5F7F, note: 'Step 1 — actor + role enumeration'] {
  id varchar [pk, note: 'A.01']
  name varchar
  type varchar [note: 'human | system | external_service | regulator']
  role_description text
  authority_level varchar [note: 'none | read | write | admin | owner']
  relationship varchar [note: 'primary_user | consumer | producer | regulator | peer_system']
}

Table context_diagram [headercolor: #2C5F7F, note: 'Step 2 — boundary + interactions'] {
  id varchar [pk]
  system_name varchar
  actor_outside varchar [ref: > actors.id]
  interaction_signal varchar
  interaction_data_ref varchar
}

Table use_cases [headercolor: #2C5F7F, note: 'Step 3 — declarative UCs'] {
  id varchar [pk, note: 'UC01']
  name varchar
  primary_actor varchar [ref: > actors.id]
  goal text
  trigger text
  preconditions text
  main_flow text
  alternate_flows text
  postconditions text
  priority varchar [note: 'P0 | P1 | P2']
}

Table data_flows [headercolor: #2C5F7F, note: 'Step 4 — data entities + flows'] {
  id varchar [pk, note: 'DF.01']
  data_entity_id varchar [note: 'DE.01']
  from_actor varchar [ref: > actors.id]
  to_target varchar
  cadence varchar [note: 'on_demand | periodic | streaming | event_driven']
  peak_events_per_sec int
  avg_payload_bytes int
  consistency varchar [note: 'strong | eventual | read_your_write']
  pii boolean
  criticality varchar [note: 'P0 | P1 | P2']
}

Table scope_tree [headercolor: #2C5F7F, note: 'Step 5 — Functional Decomposition (FDF) hierarchy'] {
  id varchar [pk, note: 'F.0 | F.1 | F.1.1']
  parent_id varchar [ref: > scope_tree.id]
  name varchar
  derived_from_uc varchar [ref: > use_cases.id]
  derived_from_flow varchar [ref: > data_flows.id]
}

Table ffbd [headercolor: #2C5F7F, note: 'Step 6 — FFBD: sequences + logic gates'] {
  function_id varchar [pk, note: 'F.1']
  scope_node_ref varchar [ref: > scope_tree.id]
  inputs text
  outputs text
  preconditions text
  sequence_id varchar [note: 'SEQ.01']
  use_case_ref varchar [ref: > use_cases.id]
  gate_type varchar [note: 'function | and_gate | or_gate | iteration_gate']
  gate_guards text [note: 'approved | revisions_requested | missing_functionality']
  termination_condition text [note: 'e.g. completeness >= 0.9']
}

Table n2_matrix [headercolor: #2C5F7F, note: 'Step 7 — N2 interface matrix'] {
  id varchar [pk, note: 'IF.01']
  producer_function varchar [ref: > ffbd.function_id]
  consumer_function varchar [ref: > ffbd.function_id]
  data_flow_ref varchar [ref: > data_flows.id, note: '(soft) — can scaffold on preview topology']
  protocol_hint varchar [note: 'sync | async | event | batch']
  criticality varchar [note: 'critical | high | med | low']
}

Table fmea_v1 [headercolor: #2C5F7F, note: 'Step 8 — failure modes on functions + interfaces'] {
  id varchar [pk, note: 'FM.01']
  target_function varchar [ref: > ffbd.function_id]
  target_interface varchar [ref: > n2_matrix.id]
  target_type varchar [note: 'function | interface | data_entity']
  failure_description text
  cause text
  effect text
  detection_method text
  severity int [note: '1-10']
  likelihood int [note: '1-10']
  detectability int [note: '1-10']
  rpn int [note: 'severity * likelihood * detectability']
  candidate_mitigation text
}

// ============================================================
// PASS 2 — Requirements Synthesis
// ============================================================

Table functional_requirements [headercolor: #B8860B, note: 'Step 9 — FRs from FFBD + UCs'] {
  id varchar [pk, note: 'FR.01']
  text text
  derived_from_uc varchar [ref: > use_cases.id]
  derived_from_function varchar [ref: > ffbd.function_id]
  priority varchar [note: 'must | should | could | wont']
  verification varchar [note: 'test | inspection | analysis | demo']
}

Table nfrs [headercolor: #B8860B, note: 'Step 10 — NFRs from FMEA v1 + data flows'] {
  id varchar [pk, note: 'NFR.01']
  category varchar [note: 'performance | availability | security | maintainability | observability | compliance']
  text text
  target_value decimal
  target_unit varchar [note: 'ms | pct | rps | count']
  target_percentile varchar [note: 'p50 | p95 | p99 | p999']
  derived_from_fmea varchar [ref: > fmea_v1.id]
  derived_from_flow varchar [ref: > data_flows.id]
  measurement varchar [note: 'synthetic_load_test | production_telemetry | audit_review']
}

Table constants [headercolor: #B8860B, note: 'Step 11 — numeric targets from NFRs'] {
  id varchar [pk, note: 'CONST.01']
  name varchar [note: 'e.g. MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT']
  value decimal
  unit varchar
  status varchar [note: 'Estimate | Final']
  derived_from_nfr varchar [ref: > nfrs.id]
  rationale text
}

// ============================================================
// PASS 3 — Decision
// ============================================================

Table alternatives [headercolor: #2E7D32, note: 'Step 12 — candidate stacks'] {
  id varchar [pk, note: 'ALT.A']
  name varchar
  fe_framework varchar
  fe_rendering varchar [note: 'SSR | CSR | RSC | Static']
  be_runtime varchar
  be_framework varchar
  db varchar
  vector_store varchar
  cache varchar
  llm_gateway varchar
  hosting varchar
  derived_from_nfrs_ref varchar [ref: > nfrs.id]
  derived_from_constants_ref varchar [ref: > constants.id]
  pros text
  cons text
}

Table decision_matrix [headercolor: #2E7D32, note: 'Step 13 — PCs * alts scoring'] {
  row_id varchar [pk, note: 'PC.1 x ALT.A']
  pc_id varchar [note: 'PC.1']
  pc_name varchar
  pc_derived_from_nfr varchar [ref: > nfrs.id]
  pc_derived_from_fmea varchar [ref: > fmea_v1.id, note: 'Pass-1 FMEA informs PC weights']
  pc_weight decimal
  alternative_ref varchar [ref: > alternatives.id]
  raw_score int [note: '1-5']
  normalized_score decimal
  weighted_contribution decimal
  winner_flag boolean
  sensitivity_perturbation_id varchar [note: 'P1..P9']
}

Table qfd [headercolor: #2E7D32, note: 'Step 14 — House of Quality: whats x hows'] {
  cell_id varchar [pk, note: 'WHAT.01 x EC.01']
  what_id varchar [note: 'WHAT.01']
  what_text text
  what_weight decimal
  what_derived_from_fr varchar [ref: > functional_requirements.id]
  what_derived_from_nfr varchar [ref: > nfrs.id]
  how_id varchar [note: 'EC.01']
  how_name varchar
  how_target decimal
  how_unit varchar
  relationship_strength varchar [note: 'strong | medium | weak']
  relationship_value int [note: '9 | 3 | 1']
  imputed_importance decimal
  imputed_rank int
  winner_ref varchar [ref: > alternatives.id]
}

Table qfd_roof [headercolor: #2E7D32, note: 'Step 14 — EC-EC correlation roof'] {
  id varchar [pk]
  how_a_id varchar [note: 'EC.01']
  how_b_id varchar [note: 'EC.02']
  correlation varchar [note: 'strong_pos | pos | neg | strong_neg']
  value int [note: '+2 | +1 | -1 | -2']
}

Table interface_specs [headercolor: #2E7D32, note: 'Step 15 — formal IF contracts (producer->consumer)'] {
  id varchar [pk, note: 'IF.01']
  informal_ref varchar [ref: > n2_matrix.id]
  producer_subsystem varchar
  consumer_subsystem varchar
  data_schema_ref varchar [note: 'e.g. spec.v1']
  protocol varchar [note: 'REST | gRPC | WebSocket | Kafka | NATS']
  p99_latency_ms int
  availability_pct decimal
  throughput_rps int
  retry_policy varchar [note: 'e.g. exponential_backoff(3)']
  fallback varchar [note: 'circuit_break | degrade | fail_fast']
  timeout_ms int
  criticality varchar [note: 'critical | high | med | low']
  qfd_top_ec_ref varchar [ref: > qfd.cell_id]
  winner_ref varchar [ref: > alternatives.id]
}

Table fmea_v2 [headercolor: #2E7D32, note: 'Step 16 — residual risks after mitigation'] {
  id varchar [pk, note: 'FM.v2.01']
  predecessor_ref varchar [ref: > fmea_v1.id]
  target_if varchar [ref: > interface_specs.id]
  mitigated_by text [note: 'design decision refs from decision_matrix + qfd']
  residual_severity int
  residual_likelihood int
  residual_detectability int
  residual_rpn int
  status varchar [note: 'closed | open | residual_accepted']
}

Table architecture_recommendation [headercolor: #2E7D32, note: 'Step 17 — final recommendation'] {
  id varchar [pk]
  winner_ref varchar [ref: > alternatives.id]
  confidence varchar [note: 'high | medium | low']
  fe_stack text
  be_stack text
  data_stack text
  ops_stack text
  decision_matrix_score decimal [ref: > decision_matrix.row_id]
  qfd_top_ecs_met text [ref: > qfd.cell_id]
  interface_spec_ref varchar [ref: > interface_specs.id]
  residual_risk_ref varchar [ref: > fmea_v2.id]
  deployment_regions text
  cells int
  scaling_policy varchar [note: 'horizontal_auto | vertical | sharded']
  next_actions text
}

// ============================================================
// Table Groups (visual grouping in dbdiagram.io)
// ============================================================

TableGroup pass_1_functional_understanding {
  actors
  context_diagram
  use_cases
  data_flows
  scope_tree
  ffbd
  n2_matrix
  fmea_v1
}

TableGroup pass_2_requirements_synthesis {
  functional_requirements
  nfrs
  constants
}

TableGroup pass_3_decision {
  alternatives
  decision_matrix
  qfd
  qfd_roof
  interface_specs
  fmea_v2
  architecture_recommendation
}
```

### Reading the DBML

- **Pk** columns (e.g. `id varchar [pk]`) are the artifact's unique identifier — what gets quoted in `upstream_refs` of downstream artifacts.
- **`[ref: > table.column]`** is a hard handoff dependency. The referenced artifact MUST exist before this row can be produced.
- **Column notes marked `(soft)`** identify forward-passable references — downstream can start with a preview/partial upstream value (see Appendix A of `MODULE-DATA-FLOW.md` for risk profile).
- **`headercolor`** mirrors the three-pass color scheme: blue = Pass 1, amber = Pass 2, green = Pass 3.
- **TableGroups** cluster tables by pass for visual layout in dbdiagram.io.

### How to render

1. Go to **https://dbdiagram.io/d** (no account needed)
2. Paste the block above into the left editor pane
3. The ER diagram renders on the right — drag tables to reposition; dbdiagram preserves layout between edits
4. Use **Export → PDF / PNG / SVG** for embedding

### Critical path

The longest hard-gated chain is:

```
actors → context_diagram → use_cases → data_flows → scope_tree → ffbd
  → n2_matrix → fmea_v1 → nfrs → constants → alternatives → decision_matrix
  → qfd → interface_specs → fmea_v2 → architecture_recommendation
```

All 17 steps on the critical path — no step can be skipped. But a meaningful share of arrows are **soft** (forward-passable), which is what makes the three-pass order achievable in parallel waves instead of strict serial.

