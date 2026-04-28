# Module 2 — Open Questions (awaiting David's review)

> Source: `open_questions.json` (JSON — this `.md` is a readable mirror for Obsidian)
> Phase status: `phase-12-complete`
> Upstream: `{'decision_audit': 'system-design/module-2-requirements/decision_audit.jsonl', 'constants_table': 'system-design/module-2-requirements/constants_table.json'}`

## Summary

- **total_items**: 25
- **constants_below_threshold**: 25
- **non_constant_decisions**: 3
- **threshold**: 0.9
- **note**: Below-threshold constants were auto-filled with Estimate status per schema-first policy. Every item carries math trace + suggested value + alternatives. Your review resolves them to Final at Phase 8 STOP GAP or later in Module 4.

## Non-constant decisions (3)

### D1. UC-PRIORITY-01

**id:** UC-PRIORITY-01

**question:** Confirm the top 6 UCBDs are UC01, UC03, UC04, UC06, UC08, UC11. Change the set?

**recommended:** Keep the 6 as proposed — covers both M1 hard-constraint anchors plus every distinct human actor. 

Comment - good 

**alternatives:**
- Swap in UC02 (codebase ingestion) for UC03 (review) if team-workflow is out of v1 scope.
- Add UC14 (auth via IdP) as a 7th first-pass UCBD if identity is high-risk in the FMEA.

**blocks:**
- Phase 11 expansion planning

---

### D2. SEMANTICS-V1-WRITEBACK

**id:** SEMANTICS-V1-WRITEBACK

**question:** Confirm v1 is read-only (suggest-only) for customer-system recommendations.

**recommended:** v1 = read-only. UC06.R16 and the UC11 notes already lock this in. Flip to write-through (suggest-and-apply) in v1.1+ only.

**alternatives:**
- v1 = write-through (would require UCBD step-flow changes on UC06 and UC11).

**blocks:**
- Module 3 FFBD branching on UC06
ANSWER: coorect 
---

### D3. COMPLIANCE-V1-SCOPE

**id:** COMPLIANCE-V1-SCOPE

**question:** Confirm all four regulatory frameworks (SOC2, HIPAA, GDPR, PCI-DSS) are v1 scope, or narrow.

**recommended:** All four in v1 — matches M1 regulatory_refs. Tightens AUDIT_RETENTION_DAYS and ENCRYPTION_CLASS.

**alternatives:**
- SOC2 + HIPAA only (reduces retention to 2190 days, narrows EVIDENCE_EXPORT_FORMATS).

**blocks:**
- Module 4 Decision Matrix compliance-vs-cost scoring

ANSWER: compliance is v2 scope
---

## Constants surfaced (23)

Each below-threshold constant with its computed options + math trace. Respond inline or in a review pass.

### C1. `FOUNDER_INTAKE_RESPONSE_BUDGET_MS`

**computed_value:** 2000

**units:** ms

**confidence:** 0.82

**top_alternatives:**
- `value`: 1000; `rationale`: tight sync-UI p95
- `value`: 3000; `rationale`: looser agent-orchestration p95

**math_trace:** base 0.85 (llm-backed-chat-p95) -0.05 (any input Estimate) +0.02 (cross-story agreement) = 0.82

ANSWER:  - no clue what you mean but 2000 ms for an answer - maybe - founders dont have patients
---

### C2. `INTAKE_COMPLETENESS_THRESHOLD`

**computed_value:** 0.85

**units:** ratio

**confidence:** 0.78

**top_alternatives:**
- `value`: 0.75; `rationale`: looser intake exit
- `value`: 0.9; `rationale`: tighter; more questions

**math_trace:** base 0.78 (production-completion-detector-heuristic) — no modifiers

That's fine

---

### C3. `SPEC_GENERATION_TIMEOUT_SEC`

**computed_value:** 300

**units:** sec

**confidence:** 0.8

**top_alternatives:**
- `value`: 180; `rationale`: aggressive 3-minute SLO
- `value`: 600; `rationale`: lenient 10-minute ceiling

**math_trace:** base 0.80 (multi-agent-llm-pipeline-ceiling) — no modifiers

---

### C4. `REVIEW_QUEUE_LOAD_BUDGET_MS`

**computed_value:** 800

**units:** ms

**confidence:** 0.88

**top_alternatives:**
- `value`: 500; `rationale`: tight dashboard p95
- `value`: 1200; `rationale`: lenient for paginated listing

**math_trace:** base 0.88 (dashboard-list-p95) — no modifiers

---

### C5. `SPEC_RENDER_BUDGET_MS`

**computed_value:** 1500

**units:** ms

**confidence:** 0.85

**top_alternatives:**
- `value`: 1000; `rationale`: faster perceived feel
- `value`: 2500; `rationale`: allows heavy-diagram spec bundles

**math_trace:** base 0.85 (rich-content-render-p95) — no modifiers

ANSWER: show Mermaid right away - keep PDF excel, MD for later
---

### C6. `CLI_EMISSION_TIMEOUT_SEC`

**computed_value:** 60

**units:** sec

**confidence:** 0.82

**top_alternatives:**
- `value`: 30; `rationale`: tighter IDE SLA
- `value`: 180; `rationale`: allows large MCP-tool-count specs

**math_trace:** base 0.82 (artifact-generation-ceiling) — no modifiers


ANSWER: Keep it for once everything is completed.

---

### C7. `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT`

**computed_value:** 2

**units:** %

**confidence:** 0.82

**top_alternatives:**
- `value`: 1; `rationale`: stricter non-invasive posture
- `value`: 3; `rationale`: industry-max monitoring-agent budget

**math_trace:** base 0.75 (non-invasive-agentless-collector) +0.07 (M1 hard-constraint anchor) = 0.82

ANSWER: sure I don't know what you mean 

---

### C8. `AGGREGATION_WINDOW_MIN`

**computed_value:** 60

**units:** min

**confidence:** 0.8

**top_alternatives:**
- `value`: 15; `rationale`: tighter near-real-time
- `value`: 240; `rationale`: 4-hour smoothing window

**math_trace:** base 0.80 (slo-rolling-window-default) — no modifiers

---

### C9. `RECOMMENDATION_CADENCE_MIN`

**computed_value:** 60

**units:** min

**confidence:** 0.78

**top_alternatives:**
- `value`: 15; `rationale`: aggressive recommendation pace
- `value`: 1440; `rationale`: daily digest

**math_trace:** base 0.78 (sre-alerting-cadence-default) — no modifiers

---

### C10. `DEVIATION_SUPPRESSION_THRESHOLD`

**computed_value:** 0.1

**units:** ratio

**confidence:** 0.72

**top_alternatives:**
- `value`: 0.05; `rationale`: lower noise floor
- `value`: 0.2; `rationale`: aggressive suppression

**math_trace:** base 0.72 (noise-suppression-heuristic) — no modifiers

---

### C11. `RECOMMENDATION_LATENCY_SEC`

**computed_value:** 120

**units:** sec

**confidence:** 0.78

**top_alternatives:**
- `value`: 60; `rationale`: tighter batch SLO
- `value`: 300; `rationale`: looser for LLM-heavy cycle

**math_trace:** base 0.78 (batch-latency-slo) — no modifiers

---

### C12. `MAX_RECOMMENDATIONS_PER_CYCLE`

**computed_value:** 10

**units:** count

**confidence:** 0.8

**top_alternatives:**
- `value`: 5; `rationale`: focus cap
- `value`: 25; `rationale`: broader surface area

**math_trace:** base 0.80 (list-pagination-ceiling) — no modifiers

---

### C13. `TRACEBACK_LATENCY_SEC`

**computed_value:** 5

**units:** sec

**confidence:** 0.8

**top_alternatives:**
- `value`: 2; `rationale`: tight per-item enrichment
- `value`: 10; `rationale`: looser for deep citation search

**math_trace:** base 0.80 (per-item-enrichment-slo) — no modifiers

---

### C14. `ENCRYPTED_CREDENTIAL_EXPIRY_DAYS`

**computed_value:** 90

**units:** days

**confidence:** 0.85

**top_alternatives:**
- `value`: 30; `rationale`: aggressive rotation
- `value`: 180; `rationale`: vendor-default lax rotation

**math_trace:** base 0.80 (oauth-rotation-default) +0.05 (SOC2 regulatory_override) = 0.85

---

### C15. `BASELINE_PROBE_WINDOW_SEC`

**computed_value:** 300

**units:** sec

**confidence:** 0.82

**top_alternatives:**
- `value`: 120; `rationale`: faster onboarding
- `value`: 600; `rationale`: more stable baseline

**math_trace:** base 0.82 (baseline-probe-window) — no modifiers

---

### C16. `CONNECTION_REAUTH_DAYS`

**computed_value:** 30

**units:** days

**confidence:** 0.78

**top_alternatives:**
- `value`: 7; `rationale`: weekly reauth
- `value`: 90; `rationale`: quarterly reauth

**math_trace:** base 0.78 (oauth-refresh-cadence) — no modifiers

---

### C17. `CONNECTION_ESTABLISHMENT_BUDGET_SEC`

**computed_value:** 120

**units:** sec

**confidence:** 0.8

**top_alternatives:**
- `value`: 60; `rationale`: quick-onboarding SLO
- `value`: 300; `rationale`: allows multi-handshake external flows

**math_trace:** base 0.80 (onboarding-flow-slo) — no modifiers

---

### C18. `SESSION_TTL_MIN`

**computed_value:** 60

**units:** min

**confidence:** 0.85

**top_alternatives:**
- `value`: 30; `rationale`: tighter session rotation
- `value`: 480; `rationale`: workday session

**math_trace:** base 0.85 (jwt-session-default) — no modifiers

---

### C19. `AUDIT_RETENTION_DAYS`

**computed_value:** 2555

**units:** days

**confidence:** 0.82

**top_alternatives:**
- `value`: 2190; `rationale`: 6y HIPAA-only
- `value`: 3650; `rationale`: 10y maximalist

**math_trace:** base 0.75 (regulatory-refs-union) +0.07 (HIPAA regulatory_override) = 0.82

---

### C20. `RATE_LIMIT_RPM`

**computed_value:** 100

**units:** req/min

**confidence:** 0.8

**top_alternatives:**
- `value`: 60; `rationale`: tight DoS posture
- `value`: 300; `rationale`: high-throughput dev-tool baseline

**math_trace:** base 0.80 (per-actor-rate-limit-default) — no modifiers

---

### C21. `LLM_PROVIDER_TIMEOUT_SEC`

**computed_value:** 30

**units:** sec

**confidence:** 0.88

**top_alternatives:**
- `value`: 15; `rationale`: aggressive fallback cadence
- `value`: 60; `rationale`: lenient for long-completions

**math_trace:** base 0.88 (external-service-timeout-default) — no modifiers

---

### C22. `TRACE_SAMPLING_RATE`

**computed_value:** 0.1

**units:** ratio

**confidence:** 0.85

**top_alternatives:**
- `value`: 0.05; `rationale`: reduced storage cost
- `value`: 0.25; `rationale`: more debugging fidelity

**math_trace:** base 0.85 (distributed-trace-sampling-default) — no modifiers

---

### C23. `EVIDENCE_EXPORT_FORMATS`

**computed_value:** SOC2; HIPAA; GDPR; PCI-DSS

**units:** enum-set

**confidence:** 0.78

**top_alternatives:**
- `value`: SOC2; HIPAA; `rationale`: narrower v1 compliance scope
- `value`: SOC2 only; `rationale`: launch-minimum

**math_trace:** base 0.78 (regulatory-refs-verbatim) — no modifiers

ANSWER: move to v2 

---
