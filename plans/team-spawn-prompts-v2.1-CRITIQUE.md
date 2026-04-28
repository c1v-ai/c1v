# Team Spawn Prompts — v2.1 Amendment (c1v MIT-Crawley-Cornell)
> Keywords: c1v, v2.1, team-spawn, langgraph, runtime-wiring, cloud-run-sidecar, synthesis-ui, hardening, api-spec-iter3, qa, docs
Iteration: 1

## Summary

- The plan is structurally sound: 5 teams / 25 agents / 2 dispatch waves with mandated qa-engineer + documentation-engineer per team is the right shape, and the wave-gate / tag mechanism cleanly inherits from v2.
- Internal contracts are well-specified: TA1 ↔ TA2 ↔ TA3 cross-team coordination is named, the Wave-A ↔ Wave-E `nfr_engine_contract_version: 'v1'` envelope is the right level of pin, and HARD-DEP semantics are precise.
- However, several factual claims about the codebase are wrong and will mis-route the audit and wiring agents on day 0.
- The single largest concrete defect: TA1.langgraph-wirer's premise — "extend with 7 NEW graph nodes" — collides with reality (4 of the 7 nodes are already wired in [intake-graph.ts:388-391](../../apps/product-helper/lib/langchain/graphs/intake-graph.ts#L388-L391)).
- The METHODOLOGY-CORRECTION canonical-path question (R-v2.1.E) cites a path that does not exist; the actual collision is a different pair.
- TA1's scope is over-loaded for one team in 5-7 days; recommend either splitting or downgrading the timeline guarantee.
- Several agent-location and line-number references inside spawn prompts are incorrect; left unfixed they will trigger 5-15 min reconciliation per agent on dispatch.
- Open R-rulings R-v2.1.A and R-v2.1.D both warrant David input before dispatch — the cost-ceiling math is contradictory between this doc, the master plan, and the AV.01 portfolio artifact.

---

## Table of Contents (issues found)

1. **TA1 §`canonical_paths_to_verify` — METHODOLOGY-CORRECTION duplicate claim is factually wrong** (line 86)
2. **TA1.migrations-and-agent-audit — CLAUDE.md path-rewrite target is wrong** (line 119)
3. **TA1.langgraph-wirer — "7 new GENERATE_* nodes" overstates the delta; 4 already exist** (line 165)
4. **TA1.langgraph-wirer — `GENERATE_decision_network` vs existing `generate_decision_matrix` coexistence not specified** (line 165)
5. **TA1.langgraph-wirer — fs-side-effects refactor scope creep risk** (line 167)
6. **TA1.open-questions-emitter — M2 NFR agent location handwaved despite being known** (line 197)
7. **TA1 scope vs timeline mismatch (R-v2.1.A)** (lines 58-62 + 925)
8. **TA2 §`ui_freeze_v2_carryover` — fmea-viewer.tsx FROZEN status ambiguous** (line 279)
9. **TA2.architecture-and-database — DBML transpiler dependency choice is unbounded** (line 360)
10. **TA2 verifier — brand-token regex sweep semantics are muddled** (line 420)
11. **TA3.python-sidecar — sidecar-vs-Vercel LangGraph boundary is "pick one inside the prompt"** (line 492)
12. **TA3.synthesis-api-routes — free-tier check pre-stub split-decision deferred to agent** (line 532)
13. **TA3 §authoritative_spec — manifest_contract_version pins inside the team but no v2 baseline cited** (line 571)
14. **TB1 §`coordination` — cost-ceiling math is internally inconsistent ($500 vs $644 vs $320)** (lines 588-600 + 949)
15. **TB1.cache-and-lazy-gen — inputs_hash ALREADY exists in synthesis-agent / architecture-recommendation-agent; not acknowledged** (line 630)
16. **TB1.tier-and-circuit-breaker — feature-flag default for tier check at Wave-A handoff is contradictory** (line 532 + 654)
17. **TD1 §diagnosis — line-71 / line-353 references are inconsistent within the doc** (lines 763, 794, 820)
18. **TD1.preflight-and-stage1-schema — fixture-only preflight may mask the real bug** (line 797)
19. **Wave-gate procedure — 300s polling cadence is the documented worst-case for prompt-cache amortization** (line 885)
20. **Dispatch-blockers §"Still open" — R-v2.1.E premise is wrong; actual decision is different** (line 950)
21. **Cross-cutting — additional system-design agents not addressed (n2-agent, data-flows-agent, nfr-resynth-agent, synthesis-agent)** (multi-section)
22. **Cross-cutting — `inline_skills` translation contract is informal; risk of agent-prompt drift** (line 49)

---

## TA1 — c1v-runtime-wiring (Wave A)

### 1. `canonical_paths_to_verify` claims a non-existent METHODOLOGY-CORRECTION location

Description:
Line 86 asserts the file exists at BOTH `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` AND `system-design/METHODOLOGY-CORRECTION.md`. Verified on disk: only `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` and `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` exist. There is no `system-design/METHODOLOGY-CORRECTION.md`. The actual duplication is between `.claude/plans/kb-upgrade-v2/` and `plans/kb-upgrade-v2/`. R-v2.1.E (line 950) inherits the same wrong premise.

Suggested Solution:
Replace the right-hand path. Update line 86 + line 950 to read:

```
Pick ONE canonical home — currently exists at BOTH
`.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` AND
`plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`. Bond default:
`plans/kb-upgrade-v2/` (full module-1..8 lives there; .claude/plans/
copy only carries module-1..6 + drift-prone).
```

Note: `plans/kb-upgrade-v2/` has modules 1-8 on disk; `.claude/plans/kb-upgrade-v2/` only has 1-6. Picking `.claude/plans/` would orphan module-7 + module-8.

---

### 2. TA1.migrations-and-agent-audit — CLAUDE.md rewrite target is wrong

Description:
Line 119 instructs the audit agent to rewrite `apps/product-helper/CLAUDE.md` from `system-design/kb-upgrade-v2/module-{1..7}/` to `.claude/plans/kb-upgrade-v2/module-{1..8}/`. Verified: `apps/product-helper/CLAUDE.md:550` cites `system-design/kb-upgrade-v2/module-{1..7}/` (correct read) BUT the rewrite target is wrong — `.claude/plans/kb-upgrade-v2/` only contains modules 1-6 on disk. The full v2 self-app artifacts (modules 1-8) live at `plans/kb-upgrade-v2/`.

Suggested Solution:
Change line 119 destination to `plans/kb-upgrade-v2/module-{1..8}/` (no `.claude/` prefix). The deliverable becomes:

```
Edit apps/product-helper/CLAUDE.md path-claim row:
  `system-design/kb-upgrade-v2/module-{1..7}/`
→ `plans/kb-upgrade-v2/module-{1..8}/`
(P10 close — and resolves the canonical-home decision in the SAME commit
since the only-`plans/`-has-modules-7-8 fact picks the canonical home for us).
```

This also collapses R-v2.1.E to a non-decision: `plans/kb-upgrade-v2/` is the only path that contains all modules.

---

### 3. TA1.langgraph-wirer — "7 new GENERATE_* nodes" overstates the delta

Description:
Line 165 reads "extend with 7 new graph nodes downstream of existing extractData → FFBD → DecisionMatrix → Interfaces → QFD chain: GENERATE_form_function, GENERATE_decision_network, GENERATE_interfaces, GENERATE_fmea_early, GENERATE_fmea_residual, GENERATE_hoq, GENERATE_synthesis".

Verified at [intake-graph.ts:388-391](../../apps/product-helper/lib/langchain/graphs/intake-graph.ts#L388-L391):

```ts
.addNode('generate_ffbd', generateFFBD)
.addNode('generate_decision_matrix', generateDecisionMatrix)
.addNode('generate_qfd', generateQFD)
.addNode('generate_interfaces', generateInterfaces)
```

Of the plan's 7 "new" nodes:
- `GENERATE_interfaces` — already wired
- `GENERATE_hoq` — already wired as `generate_qfd` (HoQ ≡ QFD)
- `GENERATE_decision_network` — ambiguous vs existing `generate_decision_matrix`
- `GENERATE_form_function`, `GENERATE_fmea_early`, `GENERATE_fmea_residual`, `GENERATE_synthesis` — net-new

Plan does not specify whether the new wiring REPLACES the existing nodes' agent invocations (the existing nodes invoke earlier-vintage agents; T4b/T5/T6 ship newer ones), or RUNS PARALLEL.

Suggested Solution:
Re-scope this deliverable to:

```
- AUGMENT 3 existing graph nodes to invoke the v2-shipped T4b/T5/T6 agents:
  - generate_decision_matrix → invoke decision-net-agent.ts (or rename to
    generate_decision_network if Decision Matrix retires; coordinate with
    TA2 nav-config decision)
  - generate_qfd → invoke hoq-agent.ts
  - generate_interfaces → invoke interface-specs-agent.ts
- ADD 4 NEW graph nodes:
  - generate_form_function → invokes form-function-agent.ts
  - generate_fmea_early → invokes fmea-early-agent.ts
  - generate_fmea_residual → invokes fmea-residual-agent.ts
- REPLACE generate_artifact OR add generate_synthesis (keystone) →
  invokes architecture-recommendation-agent.ts (lib/langchain/agents/
  architecture-recommendation-agent.ts — confirmed 644 LOC).
```

Document agent ↔ node mapping in a table inside the deliverables block so the langchain-engineer doesn't re-derive at dispatch time.

---

### 4. TA1.langgraph-wirer — Decision Matrix vs Decision Network coexistence underspecified

Description:
TA2.nav-and-pages line 341 explicitly forbids renaming Decision Matrix to Decision Network and requires the two coexist as siblings. TA1.langgraph-wirer line 165 wants a `GENERATE_decision_network` graph node. The plan does not clarify whether two separate graph nodes coexist (one driving the legacy Decision Matrix viewer, one driving the new Decision Network viewer), or whether a single node feeds both viewers.

Suggested Solution:
Pick one and pin in the deliverables:

```
Option A (recommended, matches "show your work" pillar):
  Two graph nodes coexist:
  - generate_decision_matrix (existing, unchanged) → drives FROZEN decision-matrix-viewer.tsx
  - generate_decision_network (new, invokes decision-net-agent) → drives new components/synthesis/decision-network-viewer (TA2 ships)
  Both write to project_artifacts with kind='decision_matrix_v1' / 'decision_network_v1'.

Option B:
  Single generate_decision_network node retires generate_decision_matrix.
  Decision Matrix nav entry reads the new decision_network artifact and
  displays a degraded/legacy view. Higher migration risk.
```

Add the decision to D-V21.NN section of the master plan or to the langgraph-wirer guardrails.

---

### 5. TA1.langgraph-wirer — fs-side-effects refactor scope creep risk

Description:
Line 167 instructs langgraph-wirer to "Apply fs-side-effects refactor per `migrations-and-agent-audit` findings — any fs.writeFile/fs.readFile calls move to graph-node-driven persistence." The audit (lines 117) is read-only by design. Findings of "non-trivial refactor (>200 LOC)" are surfaced to David as a finding (line 127), not silently fixed. But langgraph-wirer's guardrails do not say what happens when David has not yet decided. The risk: langgraph-wirer either blocks indefinitely on "awaiting David" or pulls the >200 LOC into its own commit chain on top of 7-node wiring + contract pin + tests.

Suggested Solution:
Make the policy explicit in langgraph-wirer guardrails:

```
- If audit surfaces an agent with > 200 LOC fs-side-effects refactor needed,
  langgraph-wirer ships a graph-node-adapter wrapper for that agent (not a
  refactor); records the deferred refactor as a TODO in the agent file +
  appends an entry to plans/post-v2.1-followups.md. Wave-A does NOT block
  on the >200-LOC refactor decision.
- The adapter pattern: graph-node receives agent's existing fs-emit output
  via stdout capture + parses; persistence happens at the graph-node layer.
  Documented JSDoc on the adapter pattern.
```

This caps TA1.langgraph-wirer scope and lets the >200-LOC question land as a clean follow-up.

---

### 6. TA1.open-questions-emitter — M2 NFR agent location handwaved despite being known

Description:
Line 197 reads "Existing M2 NFR agent (location TBD by `migrations-and-agent-audit` audit; likely lib/langchain/agents/extraction-agent.ts or similar) — extend per same pattern". Verified: the M2 NFR agent is `apps/product-helper/lib/langchain/agents/system-design/nfr-resynth-agent.ts` (sibling to the other system-design agents). No audit needed.

Suggested Solution:
Replace line 197 with:

```
apps/product-helper/lib/langchain/agents/system-design/nfr-resynth-agent.ts
— extend per same pattern as hoq/fmea-residual: when an NFR re-synth
  decision hits ambiguity (e.g. p95 latency target conflicts between two
  upstream constraints), emit OpenQuestion via the bridge with
  source: 'm2_nfr', computed_options carrying the candidate target values,
  math_trace showing the constraint computation.
```

Saves the audit a sub-task; reduces preflight wall-clock.

---

### 7. TA1 scope vs 5-7 day timeline (R-v2.1.A)

Description:
TA1's 6-agent scope spans: (a) 0011 migration reconciliation + agent-fs audit + canonical-path resolution + CLAUDE.md edit (preflight, blocking), (b) project_artifacts Drizzle table + RLS + queries + tests, (c) augmenting 3 graph nodes + adding 4 + agent-signature adapter + contract pin + 5 commits worth of tests, (d) chat-bridge transport + 3 emitter extensions + atlas re-ingest + RLS test, (e) verification across 8 ECs, (f) docs + JSDoc + handshake-spec + runbook.

Conservative estimate: 8-12 days realistic, 5-7 days only achievable if the audit finds zero non-trivial refactors AND the atlas re-ingest dedup-bug is benign AND langgraph-wirer's fs-side-effects work is < 50 LOC across all 7 agents.

Suggested Solution:
Three options:

```
A. Confirm 8-12 days as the WAVE-A timeline (drop 5-7 to "stretch goal"
   only). Update lines 925, 946. Wave-B start slips proportionally.

B. Split TA1 into TA1a (preflight + table + RLS + chat-bridge) and TA1b
   (langgraph-wirer + emitter extensions + atlas re-ingest). TA1b
   HARD-DEPs on TA1a's ta1a-preflight-complete tag. Adds one wave-gate
   poll cycle but caps each team's scope.

C. Keep 5-7 day target; explicitly note the SKIP-with-fail-forward
   semantic from EC-V21-A.8 also applies to fs-side-effects refactors
   > 200 LOC (deferred to v2.2 day 0).

Bond default: C with explicit fail-forward written into TA1.langgraph-wirer
guardrails (per Issue 5 above).
```

---

## TA2 — c1v-synthesis-ui (Wave A)

### 8. fmea-viewer.tsx FROZEN status ambiguous

Description:
Line 279 lists FROZEN viewers as "decision-matrix-viewer, ffbd-viewer, qfd-viewer, interfaces-viewer (+ diagram-viewer)". Verified: `apps/product-helper/components/system-design/fmea-viewer.tsx` exists. TA2.nav-and-pages line 336 says "EDIT existing orphaned page to read from project_artifacts ... for fmea_early + fmea_residual artifacts." It is unclear whether the page edit modifies fmea-viewer.tsx (which would violate FROZEN convention if extended) or only modifies the `page.tsx` host that consumes it.

Suggested Solution:
Pin the FROZEN list explicitly in TA2 context. Either:

```
A. Add fmea-viewer.tsx to FROZEN list: TA2 wraps in a new sibling
   component (e.g. fmea-empty-state.tsx) and the page conditionally
   renders empty-state OR the FROZEN viewer.

B. Mark fmea-viewer.tsx as MODIFIABLE-IN-V21 explicitly — it was added
   by T10/T6 in v2 and may not have hardened to the same FROZEN bar
   as the other 4. Document in apps/product-helper/CLAUDE.md UI Freeze
   table the date each component entered FROZEN status.
```

TA2 verifier (line 419) auto-FAILs on FROZEN diff; ambiguity = wasted reconciliation cycle on dispatch.

---

### 9. TA2.architecture-and-database — DBML transpiler dependency choice unbounded

Description:
Line 360 reads "NO external dependency unless absolutely necessary; if a npm DBML lib exists with reasonable license, prefer that over hand-rolled (cite in JSDoc)." This leaves the choice open at agent-dispatch time. The agent will either (a) hand-roll a transpiler (likely 200-400 LOC + edge cases the JSDoc must enumerate), or (b) pick a library without seeing the round-trip fixture set first. Either path adds dispatch-time risk.

Suggested Solution:
Pre-resolve the choice. Recommended: pick `@dbml/core` (NPM; MIT-licensed) or its programmatic API; cite in the spawn prompt with the version + the fixture set. If hand-roll preferred for portfolio-quality control, lock the supported subset upfront:

```
Supported DBML output subset (locked):
- Tables with primary keys, foreign keys (single-column only)
- Composite PKs
- Enum types
- Unique indexes
- Optional FK relationships
NOT SUPPORTED in v2.1: views, stored procedures, partitions, complex
indexes (functional, partial). Any unsupported construct → emit a
DBML comment with the source SQL inline.
```

---

### 10. TA2 verifier — brand-token regex sweep semantics muddled

Description:
Line 420 reads "regex sweep for hex values `#[0-9A-Fa-f]{6}` across diff — every hit MUST resolve to a CSS-var reference or be in a JSDoc comment. Inline hex in component code = FAIL." But a regex sweep cannot "resolve to a CSS-var reference" — that's a semantic check, not a regex. The actual rule appears to be: hex values are allowed only inside `app/theme.css`, `app/globals.css`, JSDoc comments, or test fixture strings; FAIL on any hex elsewhere.

Suggested Solution:
Restate as a positive allowlist:

```
Brand-token compliance regex check:
  Run: rg -n '#[0-9A-Fa-f]{6}' --type ts --type tsx <diff-paths>
  ALLOWED hits: file ∈ {app/theme.css, app/globals.css}, OR enclosed
    in /* */ or // comment, OR in a *.test.{ts,tsx} fixture string.
  FAIL on any hit outside the allowlist.
```

This is mechanically checkable; the current wording is not.

---

## TA3 — c1v-cloudrun-sidecar (Wave A)

### 11. python-sidecar — sidecar-vs-Vercel LangGraph boundary deferred to agent

Description:
Line 492 reads "runs LangGraph chain (or invokes the Vercel-side LangGraph and just renders results — pick: recommend Vercel-side LangGraph for graph-node consistency, sidecar handles ONLY rendering)". This is a load-bearing architectural decision (cost, latency, retry semantics, observability boundaries) and the spawn prompt punts it to the devops-engineer at dispatch time. TA1.langgraph-wirer is simultaneously building the Vercel-side graph; if TA3 picks the alternate path, TA1's graph-node persistence pattern doesn't run.

Suggested Solution:
Lock the boundary in master plan v2.1 (as a D-V21.NN decision) BEFORE dispatch. Recommended:

```
D-V21.NN — Synthesis pipeline split:
  Vercel hosts the LangGraph orchestration (TA1.langgraph-wirer's nodes
  fire from Vercel runtime). Cloud Run sidecar receives per-artifact
  rendering jobs (POST /run-render with {project_id, artifact_kind,
  agent_output_payload}); renders via canonical Python generators;
  writes project_artifacts row.

  Rationale: keeps graph-node consistency with the rest of the
  intake-graph; sidecar is pure rendering (PDF/PPTX/xlsx); cold-start
  budget applies only to render path; LLM cost stays on Vercel-side
  Anthropic SDK metering for unified Sentry instrumentation (TB1).
```

Removes ambiguity at dispatch.

---

### 12. synthesis-api-routes — free-tier check pre-stub split-decision deferred to agent

Description:
Line 532 reads "Free-tier 1/mo cap (D-V21.10 + EC-V21-B.3) is Wave B; v2.1 Wave A pre-stubs the check (returns 402 with a 'TB1: tier-gating not active yet' header) OR defers entirely — pick: recommend pre-stub returning 402 only when Wave-B config flag is enabled; default flag off in v2.1 Wave A." TB1.tier-and-circuit-breaker line 654 then EDITs the same route — but if Wave-A defers entirely, TB1 is adding the check from scratch; if Wave-A pre-stubs, TB1 is enabling a flag. The agents need to agree at dispatch.

Suggested Solution:
Pin the contract:

```
TA3.synthesis-api-routes (Wave A): Pre-stub the tier check.
  - Add checkSynthesisAllowance import + invocation in
    /api/projects/[id]/synthesize/route.ts.
  - Implementation in Wave A: stub returning {allowed: true} (no DB call).
  - Wave B (TB1.tier-and-circuit-breaker): replace the stub with the
    real DB-backed implementation in lib/billing/synthesis-tier.ts.

Net effect: zero route-shape change between Wave A and Wave B; only
the stub body changes. Avoids "deferred entirely" branch.
```

---

### 13. TA3.docs — manifest_contract_version pins inside the team but no v2 baseline cited

Description:
Line 571 instructs the docs agent to JSDoc `manifest_contract_version: 'v2.1.1'` on the manifest route. The current v2 ship of the manifest endpoint already exists at `apps/product-helper/app/api/projects/[id]/artifacts/manifest/route.ts` (verified: directory exists). v2 did not version the manifest contract. Bumping to `v2.1.1` (semver-style) implies prior versions exist; in fact only v2.1 is the FIRST versioned release.

Suggested Solution:
Use a v0 → v1 bump convention:

```
Pin to manifest_contract_version: 'v1' on the v2.1 ship.
  - First versioned manifest contract.
  - v2.2 (Waves C + E) bumps to 'v2' if the response shape changes
    (e.g. surface-gap.ts adds new artifact kinds).
  - Document the version-bump rule in plans/v21-outputs/ta3/manifest-contract.md:
    "Bump major version on response-shape break; bump minor on
    additive optional fields."
```

Aligns with the Wave-A ↔ Wave-E `nfr_engine_contract_version: 'v1'` envelope convention.

---

## TB1 — c1v-hardening (Wave B)

### 14. Cost-ceiling math is internally inconsistent

Description:
Three cost figures appear:
- Line 588: "Cost ceiling: ≤ $500/mo at 100 DAU baseline (down from Wave-A unoptimized $924/mo)."
- Line 600: "monthly burn from ~$924/mo (Wave-A unoptimized) to ≤ $500/mo at 100 DAU baseline."
- Line 949 (R-v2.1.D): "Wave A lands at ~$921/mo; Wave B brings it to ~$644/mo. AV.01 budget is $320/mo."

$924 ≈ $921 (rounding ok). But Wave-B target is stated as both `≤$500/mo` (line 588) AND `~$644/mo` (line 949). And the AV.01 portfolio-keystone cost is $320/mo (per memory: `architecture_recommendation.v1.json` AV.01 = $320/mo). The plan's ≤$500/mo target overshoots AV.01 by 56%; if R-v2.1.D's $644/mo is correct, overshoot is 100%.

Suggested Solution:
Reconcile and pick one number. Recommended path:

```
1. Replace line 600 + line 949 with a single number derived from the
   load-test-tb1.ts script (TB1.verifier line 710). Until the script
   exists, mark the target as "TBD post-load-test" and forbid
   tag-on-green until the projection is captured.

2. Acknowledge AV.01 portfolio cost ($320/mo) as the ASPIRATIONAL
   target for v2.2 (Wave E + further KB-runtime optimization). v2.1's
   $500/mo is the v2.1 ship gate; AV.01 alignment is v2.2 work.

3. Make EC-V21-B.6 explicit:
   "Operating cost ≤ $500/mo at 100 DAU as PROJECTED by load-test-tb1.ts.
    AV.01 alignment ($320/mo per portfolio keystone) carried as
    post-v2.1 followup."

4. R-v2.1.D David question: keep "is $500/mo Wave-B target acceptable
   given AV.01 = $320/mo?" — but resolve the internal $500 vs $644
   first.
```

---

### 15. TB1.cache-and-lazy-gen — inputs_hash already exists; not acknowledged

Description:
Line 630-634 specifies building `synthesis-cache.ts` keyed on `inputs_hash`. Verified: `inputs_hash` is already implemented and shipped in v2:
- `apps/product-helper/lib/langchain/agents/architecture-recommendation-agent.ts:605` — `inputs_hash: inputsHash(mods)`
- `apps/product-helper/lib/langchain/agents/system-design/synthesis-agent.ts:420`
- `apps/product-helper/lib/langchain/schemas/synthesis/architecture-recommendation.ts:745` — Zod regex `^[0-9a-f]{64}$/u`

The cache should READ this existing field, not re-derive. TA1.project-artifacts-table already requires the `inputs_hash` column on the table. TB1 cache logic just needs to query.

Suggested Solution:
Replace the implementation block with:

```
synthesis-cache.ts:
  - Compute the new project's inputs_hash via the existing
    inputsHash(mods) helper (sha256 of canonical intake payload +
    upstream module shas).
  - SELECT * FROM project_artifacts WHERE inputs_hash = $1 AND
    synthesis_status = 'ready' LIMIT 1.
  - If hit: COPY the cached storage_path into the new project's row
    (no blob duplication); mark synthesis_status='ready' on the new row.
  - If miss: fall through to normal generation.

References:
  - lib/langchain/agents/architecture-recommendation-agent.ts:605
    (existing inputsHash helper)
  - lib/langchain/schemas/synthesis/architecture-recommendation.ts:745
    (Zod hash shape — sha256 hex)
```

Reduces guessing; saves 1-2 hours of cache-engineer onboarding.

---

### 16. TB1.tier-and-circuit-breaker — feature-flag default contradicts TA3 stub

Description:
Per Issue 12, TA3 should pre-stub the tier check (Wave A returns `{allowed: true}`). TB1 then replaces with real implementation. Line 654 line 663 says "Free hard-cap is enforced server-side in /synthesize route — UI may pre-warn, but the gate lives on the server." But TA3 line 532 instructs the route to return 402 ONLY when "Wave-B config flag is enabled; default flag off in v2.1 Wave A." So TA3 ships flag-off (no enforcement) → TB1 ships flag-on (enforcement). The flag itself is unspecified (env var? DB row? feature-flag service?).

Suggested Solution:
Either:

```
A. Drop the flag entirely. TA3 ships pre-stub returning {allowed: true}.
   TB1 replaces with real check (no flag — default ON in Wave B).
   Risk: cannot disable Free-tier check post-Wave-B ship without a
   redeploy. Mitigation: emergency disable via env var is acceptable
   if the team plan column has a dev-mode bypass.

B. Specify the flag mechanism + default. E.g. env var
   SYNTHESIS_FREE_TIER_GATE = 'enabled' | 'disabled' | 'log_only'.
   TA3 ships with default = 'log_only' (records the would-be 402 in
   Sentry without blocking). TB1 flips default to 'enabled' as part of
   tb1-wave-b-complete tag.
```

Bond default: B (log_only mode is observable + reversible).

---

## TD1 — c1v-apispec-iter3 (Wave D)

### 17. line-71 / line-353 references inconsistent

Description:
- Line 763 (diagnosis): "api-spec-agent.ts:71-127 embeds jsonSchemaSchema at three sites (requestBody.schema:84, endpoint.responseBody:103, errorHandling.format:123)."
- Line 794 (preflight guardrail): "DO NOT remove apps/product-helper/lib/langchain/agents/api-spec-agent.ts:71 apiSpecificationSchema yet — preserved for output validation per D-4."
- Line 820 (stage2 guardrail): "DO NOT remove apiSpecificationSchema (line 71) — preserved for output validation per D-4."

Verified: line 71 is the START of `jsonSchemaSchema` (embedded type), not `apiSpecificationSchema`. `const apiSpecificationSchema = z.object({` is at line 127 of api-spec-agent.ts. Lines 794 + 820 cite the wrong line number.

Suggested Solution:
Replace `:71` with `:127` in lines 794 + 820. Keep line 763's `:71-127` (it correctly describes the embedded jsonSchemaSchema range that bloats the model output).

---

### 18. TD1.preflight — fixture-only run may mask the real bug

Description:
Line 797 reads "DO NOT couple preflight to live production — use a fixture replay (project=33 input cached locally). Live re-run only if fixture replay can't reproduce." But the iter-3 regression is reportedly stop_reason-dependent + observed in production. Fixture replay against the same model ID + temperature + maxTokens SHOULD reproduce, but model nondeterminism + prompt-cache state + Anthropic-side throttling can subtly differ. If fixture replay produces stop_reason='end_turn' but production produces 'max_tokens', the branch decision (line 764) lands on the wrong path.

Suggested Solution:
Capture both:

```
preflight steps (in this order):
  1. Fixture replay locally — capture stop_reason + usage. Commit to
     plans/v21-outputs/td1/preflight-log-fixture.md.
  2. ALSO run against live Anthropic API (production model ID +
     temperature + maxTokens) — capture stop_reason + usage. Commit
     to preflight-log-live.md.
  3. If fixture and live diverge on stop_reason: pick the LIVE branch
     decision (production matches reality); document the divergence
     in preflight-log.md as a known fixture-vs-live drift.
  4. If they agree: proceed with shared branch decision.

Cost: ~$0.05-0.20 in Anthropic usage for one live re-run; trivial
relative to the cost of mis-branching.
```

---

## Wave gate procedure

### 19. 300s polling cadence is the documented worst-case for prompt-cache amortization

Description:
Line 885: "Polling. `git fetch --tags && git tag --list 't*-wave-*-complete'` every 300 seconds via `ScheduleWakeup`."

300s sits exactly on the Anthropic prompt-cache 5-min TTL boundary. Per system instruction guidance, 300s is the worst-of-both: misses cache without amortizing the miss. Recommended cadences are < 270s (cache stays warm) or > 1200s (one cache miss buys 20+ minutes).

Suggested Solution:
Either:

```
A. Drop poll interval to 270s. Cache warm; 12 polls/hour.
B. Bump poll interval to 600s or 900s. One cache miss per poll;
   4-6 polls/hour; lower coordinator-side cost.

Recommended: 270s during active wave dispatch (poll-heavy expected
window), back off to 1200s if no tag observed for 30min.
```

This is a pure cost optimization; not a correctness blocker.

---

## Dispatch blockers (still open)

### 20. R-v2.1.E premise is wrong

Description:
Line 950 asks "Methodology-correction canonical path — currently exists at BOTH `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` AND `system-design/METHODOLOGY-CORRECTION.md`." Per Issue 1, the right-hand path does not exist. Asking David for a ruling on a wrong premise wastes a David-turn.

Suggested Solution:
Per Issue 2 fix, R-v2.1.E collapses to non-decision. Replace line 950 with:

```
~~R-v2.1.E~~ — RESOLVED (no decision needed).
The methodology-correction canonical home is `plans/kb-upgrade-v2/`
because only that path contains the full module-1..8 set on disk.
TA1.migrations-and-agent-audit converts `.claude/plans/kb-upgrade-v2/
METHODOLOGY-CORRECTION.md` to a one-line redirect stub. CLAUDE.md
path-claim row updated in the same commit.
```

Also remove the open-question from line 944 list (5 → 4 R-rulings).

---

## Cross-cutting observations

### 21. Additional system-design agents not addressed

Description:
The following agents exist on disk under `apps/product-helper/lib/langchain/agents/system-design/` but are not assigned to any GENERATE_* graph node in TA1:
- `data-flows-agent.ts` — emits M1 phase-2.5 data_flows.v1.json (TA2.nav-and-pages reads but no producer node)
- `nfr-resynth-agent.ts` — M2 NFR re-synthesis (TA1.open-questions-emitter touches but doesn't wire to a node)
- `n2-agent.ts` — emits M7.a n2_matrix.v1.json (TA2.interfaces-and-archive-pages reads but no producer node)
- `synthesis-agent.ts` — sibling to `architecture-recommendation-agent.ts`; unclear which one TA1 wires
- `discriminator-intake-agent.ts`, `signup-signals-agent.ts` — M0 (T7); orthogonal to v2.1, but plan should explicitly mark out-of-scope

Suggested Solution:
Add an explicit table to TA1.langgraph-wirer deliverables enumerating all 13 system-design agents and their disposition:

```
Agent ↔ Graph-node disposition table (TA1 spawn prompt):
  | agent file | disposition | graph node |
  |---|---|---|
  | data-flows-agent.ts | WIRE (NEW) | generate_data_flows |
  | extraction / NFR (nfr-resynth-agent.ts) | RE-WIRE existing extract_data → AUGMENT | (existing) |
  | ffbd-agent.ts | already wired | generate_ffbd |
  | form-function-agent.ts | WIRE (NEW) | generate_form_function |
  | decision-net-agent.ts | WIRE (NEW or RENAME of generate_decision_matrix) | generate_decision_network |
  | n2-agent.ts | WIRE (NEW) | generate_n2 |
  | interface-specs-agent.ts | RE-WIRE (replaces generate_interfaces internals) | generate_interfaces |
  | hoq-agent.ts | RE-WIRE (replaces generate_qfd internals) | generate_qfd |
  | fmea-early-agent.ts | WIRE (NEW) | generate_fmea_early |
  | fmea-residual-agent.ts | WIRE (NEW) | generate_fmea_residual |
  | synthesis-agent.ts | OUT-OF-SCOPE (sibling of architecture-recommendation-agent; pick ONE) | n/a |
  | architecture-recommendation-agent.ts | WIRE (NEW keystone) | generate_synthesis |
  | discriminator-intake-agent.ts, signup-signals-agent.ts | M0 — OUT-OF-SCOPE for v2.1 | n/a |
```

This is the clearest possible contract.

---

### 22. `inline_skills` translation contract is informal

Description:
Line 49 reads "`inline_skills: [...]` fields ... are documentation for humans reviewing the plan. At actual dispatch time, Bond translates each `inline_skills: ["X", "Y"]` entry into literal `Skill("X")` / `Skill("Y")` invocation instructions in the agent's prompt body."

Risk: at dispatch, Bond hand-edits each agent prompt to inject "Before writing any LangChain code, invoke `Skill('langchain-patterns')`." A copy-paste error or inconsistent phrasing across 25 agents will produce drift (some agents skip the skill, others run it once vs every code-write).

Suggested Solution:
Pin the exact text + pin a single coordinator helper to construct the prompt. Example template:

```
Skill-injection block (prepended to every Agent({prompt: ...}) at dispatch):

  "MANDATORY — Before writing any code, invoke each of the following
  skills via the Skill tool (in order):
    Skill('skill-1')
    Skill('skill-2')
    Skill('skill-3')

  Each skill must be invoked at least once before its first relevant
  action. If multiple agents in your team need the same skill,
  invoke it independently — skills do not propagate across agents."

Mechanism: Bond runs scripts/dispatch-helper.ts (NEW; ship in this
plan as a scoped deliverable on the TPM/coordinator side) which takes
inline_skills array + agent prompt body and emits the final string.
Verifier checks each spawned Agent's prompt for the canonical block.
```

This is process hygiene; not a Wave-1 blocker but worth landing before dispatch to avoid a repeated audit per agent.

---

## Recommended action before Dispatch Wave 1

```
1. Apply Issues 1, 2, 6, 17, 20 (factual corrections — 30 min edit pass).
2. Resolve Issue 11 in master plan v2.1 as a new D-V21.NN decision
   (sidecar-vs-Vercel LangGraph boundary).
3. Resolve Issues 14, 16 with concrete numbers (ask David for R-v2.1.D
   resolution; pin tier-flag mechanism).
4. Pick one of Issue 7's three options (timeline reality).
5. Apply Issue 21's agent-disposition table to TA1.langgraph-wirer.
6. Optional: apply Issue 22's dispatch-helper before fanning out 25 agents.

Estimated total edit time: 2-3 hours. Net effect: reduces dispatch-time
reconciliation across 25 agents from ~8-12 person-hours to ~0.
```
