# Team Spawn Prompts — v2 Amendment (c1v MIT-Crawley-Cornell)

> **Purpose:** Copy-paste-ready `TeamCreate` + `Agent` invocations for teams added/modified in v2.
> **Companion files:** v2.md inline has full prompts for T4a (§0.3.5), T9 (§0.2.5), T10 (§15.7), T11 (§0.3.6). [`team-spawn-prompts.md`](team-spawn-prompts.md) (v1) has FULL prompts only for T1 and T2 — T3, T7, T8 are roster-only drafts there and MUST be promoted before dispatch (see §Dispatch blockers).
> **Master plan:** [`c1v-MIT-Crawley-Cornell.v2.md`](c1v-MIT-Crawley-Cornell.v2.md)
> **Critique (iteration 1):** [`c1v-MIT-Crawley-Cornell.v2-CRITIQUE.md`](c1v-MIT-Crawley-Cornell.v2-CRITIQUE.md)
> **Handoff context:** [`HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md`](HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md)
> **Created:** 2026-04-24 03:20 EDT
> **Status:** T4b, T5, T6 NEW per this document. T4a, T9, T10, T11 see v2.md inline. T1, T2, T3, T8 see v1 team-spawn-prompts.md.
> **Wave 1 + Wave 3 closure (2026-04-24):**
> - **Wave 1:** ✅ T1, T2 done; ✅ T3 (`t3-wave-1-complete` @ `3641e97`); ✅ T9 (`t9-wave-1-complete`); ✅ T10 (`t10-wave-1-complete`); 🟡 T8 ~40% (tag exists but unverified).
> - **Wave 3:** ✅ T4b (`t4b-wave-3-complete` @ `4ecfe3f`); ✅ T5 (`t5-wave-3-complete` @ `a30d9c6`). Plan: [`t4b-t5-completion.md`](t4b-t5-completion.md).
> - **Pending:** Wave 2-early (T4a, T7), Wave 2-mid (T11), Wave 4 (T6 — unblocked by Wave 3 close).

---

## Team inventory — v2 12-team roster

| # | Team slug | Wave | Agents | Spawn prompt location |
|---|---|---|---|---|
| T1 | `c1v-crawley-kb` | 1 | 4 | [`team-spawn-prompts.md`](team-spawn-prompts.md) §T1 — ✅ **COMPLETE 2026-04-24** |
| T2 | `c1v-kb8-atlas` | 1 | 3 | [`team-spawn-prompts.md`](team-spawn-prompts.md) §T2 — ✅ **COMPLETE 2026-04-24** |
| T3 | `c1v-runtime-prereqs` | 1 | 5 | [`team-spawn-prompts.md`](team-spawn-prompts.md) §T3 — ✅ **COMPLETE 2026-04-24** (`t3-wave-1-complete` @ `3641e97`) |
| T4a | `c1v-m3-ffbd-n2-fmea-early` (folds M1 phase 2.5 Data Flows) | 2-early | 4 | v2.md §0.3.5 |
| T4b | `c1v-m4-decision-net` (folds M7.b) | 3 | 4 | **This doc §T4b** — ✅ **COMPLETE 2026-04-24** (`t4b-wave-3-complete` @ `4ecfe3f`) |
| T5 | `c1v-m5-formfunction` (M5 only — M6 HoQ moved to T6) | 3 | 3 | **This doc §T5** — ✅ **COMPLETE 2026-04-24** (`t5-wave-3-complete` @ `a30d9c6`) |
| T6 | `c1v-synthesis` (folds M6 HoQ + M8.b FMEA-residual) | 4 | 6 | **This doc §T6** |
| T7 | `c1v-module0-be` | 2-early | 4 | ⚠️ [`team-spawn-prompts.md`](team-spawn-prompts.md) §T7 is **roster-only**; full spawn prompt needs promotion before dispatch |
| T8 | `c1v-reorg` | 1 | 4 | [`team-spawn-prompts.md`](team-spawn-prompts.md) §T8 — 🟡 ~40% peer-owned (tag `t8-wave-1-complete` exists, legitimacy unverified) |
| T9 | `c1v-kb-hygiene` | 1 | 4 | v2.md §0.2.5 — ✅ **COMPLETE 2026-04-24** (`t9-wave-1-complete`) |
| T10 | `c1v-artifact-centralization` | 1 | 4 | v2.md §15.7 — ✅ **COMPLETE 2026-04-24** (`t10-wave-1-complete`) |
| T11 | `c1v-m2-nfr-resynth` | 2-mid | 3 | v2.md §0.3.6 |

---

## Dispatch rules

1. `TeamCreate` fires first; `Agent` calls in the immediately-following message. Both TeamCreate and all Agents for a given wave fire in a **single coordinator message** to maximize parallelism.
2. One `Agent` call per teammate → parallel spawn.
3. Teammates reference each other by `name`, never by agentId.
4. Permissions must exist in `.claude/settings.json` before dispatch.
5. **Skill attachment mechanism:** `inline_skills: [...]` fields in spawn prompts below are *documentation* for humans reviewing the plan. At actual dispatch time, Bond translates each `inline_skills: ["X", "Y"]` entry into literal `Skill("X")` / `Skill("Y")` invocation instructions in the agent's `prompt:` body text. Example translation: `inline_skills: ["langchain-patterns"]` → prompt prepended with "Before writing any LangChain code, invoke `Skill('langchain-patterns')`." This matches v1 §T1 convention.
6. **HARD-DEP tags:** Any agent with `HARD-DEP on <tag>` in its guardrails blocks at dispatch if the tag is absent from `origin/main`. Bond verifies via `git tag --list` before issuing the Agent call.

---

## T4b — c1v-m4-decision-net (Wave 3)

**Scope:** M4 decision-net rework per v1 §5.1 (utility vectors, Pareto frontier, sensitivity, empirical-prior binding) + M7.b formal interface specs (SLAs, retry, timeout, circuit-breaker) folded in per v2 §0.3.4 ownership decision.

**Dependencies:** Blocks on Wave 2-mid (T11 NFR resynth). Consumes: `fmea_early.v1.json`, `n2_matrix.v1.json`, `ffbd.v1.json`, `nfrs.v2.json`, `constants.v2.json`, KB-8 atlas, `_shared/` cross-cutting KBs.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-m4-decision-net",
  agent_type: "tech-lead",
  description: "Rework flat M4 Decision Matrix → MIT/Crawley Decision Network (directed graph of decisions + Pareto frontier + sensitivity σ² + empirical-prior binding to KB-8). Also produce M7.b formal interface specs for the chosen architecture.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.md §5.1 (decision-net) + plans/c1v-MIT-Crawley-Cornell.v2.md §0.3.2 (M7.b split)",
    upstream_artifacts: [
      ".planning/runs/self-application/module-3/ffbd.v1.json",
      ".planning/runs/self-application/module-7/n2_matrix.v1.json",
      ".planning/runs/self-application/module-8/fmea_early.v1.json",
      ".planning/runs/self-application/module-2/nfrs.v2.json",
      ".planning/runs/self-application/module-2/constants.v2.json",
      ".planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/ (KB-8 grounded priors)",
      ".planning/phases/13-Knowledge-banks-deepened/_shared/ (caching, CAP, data-model, resiliency, load-balancing KBs)"
    ],
    runtime_contract: "All scoring MUST route through NFREngineInterpreter (kb-runtime G1 per v1 §0 Prerequisites). Do NOT create a standalone DecisionNetworkEngine class. Utility vectors, Pareto dominance, sensitivity = NFREngineInterpreter rules consuming kb_chunks via RAG.",
    downstream_consumers: [
      "T5 c1v-m5-formfunction — consumes decision_network.v1.json to scope form inventory",
      "T6 c1v-synthesis — consumes decision_network.v1.json + interface_specs.v1.json for architecture_recommendation"
    ]
  },
  commit_policy: "one-commit-per-agent-per-deliverable; atomic schema commits precede agent commits",
  wave: 3,
  blocks: ["wave-4-synthesis"]
})
```

### Step 2: Spawn 4 teammates (parallel)

```
Agent({
  name: "decision-net-schemas",
  subagent_type: "langchain-engineer",
  team: "c1v-m4-decision-net",
  goal: "Rework M4 Zod schemas to graph shape. Kept phases 1,3-10,18; reworked 11-13 (vector scores); new phases 14 (decision-nodes), 15 (decision-dependencies), 16 (pareto-frontier), 17 (sensitivity-analysis), 19 (empirical-prior-binding).",
  inline_skills: ["langchain-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/phase-14-decision-nodes.ts",
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/phase-15-decision-dependencies.ts",
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/phase-16-pareto-frontier.ts",
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/phase-17-sensitivity-analysis.ts",
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/phase-19-empirical-prior-binding.ts",
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/phases-11-13-vector-scores.ts (reworked)",
    "apps/product-helper/lib/langchain/schemas/module-4-decision-net/index.ts barrel",
    "Extension to _shared.ts mathDerivationV2 for result_shape: 'vector'|'graph' — if not already present from T-prereq"
  ],
  guardrails: [
    "HARD-DEP on `t8-wave-1-complete` tag — T8 creates/renames `module-4-decision-net/` dir in Wave 1. Halt with actionable error if tag absent at dispatch.",
    "Every decision node MUST carry alternatives[] AND local criteria[] AND dependency_edges[] (DAG, no cycles — validate at parse time via refine()).",
    "Utility schema: U(a) = Σ w_c · score(a,c). Score entries MUST have empirical_priors.citations[] pointing to KB-8 atlas entries OR explicit source: 'inferred' with rationale.",
    "Sensitivity σ² output: one entry per decision node, sortable, re-computable.",
    "Pareto frontier: array of architecture vectors, dominance edges, frontier flag per vector.",
    "Dual-emit decision_matrix.v1 during transition (per v1 §11 R4) — ship both schemas until T6 confirms switchover.",
    "One commit per phase file: 'feat(m4): phase-NN <slug> zod schema'"
  ],
  blocks: ["decision-net-agent", "interface-specs-agent", "verifier"]
})

Agent({
  name: "decision-net-agent",
  subagent_type: "langchain-engineer",
  team: "c1v-m4-decision-net",
  goal: "Rewrite decision-matrix-agent.ts to produce decision_network.v1.json graph artifact. Agent orchestrates phase 1→19 chain, routes all scoring through NFREngineInterpreter, binds every score to KB-8 empirical priors (provisional: true when sample_size < 10 per v1 R2 ruling).",
  inline_skills: ["langchain-patterns", "claude-api"],
  deliverables: [
    "apps/product-helper/lib/langchain/agents/system-design/decision-net-agent.ts",
    "apps/product-helper/lib/langchain/agents/system-design/decision-net-agent.test.ts (integration with mock KB-8 fixture)",
    ".planning/runs/self-application/module-4/decision_network.v1.json — c1v-self-applied instance",
    "Artifact emissions via scripts/artifact-generators/gen-decision-net.py (T10): xlsx matrix, svg DAG, svg Pareto scatter, svg sensitivity heatmap, svg utility-vector bar chart"
  ],
  guardrails: [
    "Depend on decision-net-schemas. Block on index.ts barrel existence.",
    "Every decision node's scoring MUST invoke NFREngineInterpreter.evaluate() with kb_chunk_ids captured in decision_audit row.",
    "If KB-8 corpus returns < 7 valid entries for a decision's archetype (per v1 R2 resolution 2026-04-23), mark priors provisional: true + sample_size metadata; do NOT block pipeline.",
    "Emit decision_audit rows per Phase to audit-db (G5 table from kb-runtime Prereqs) with model_version + kb_chunk_ids + hash_chain_prev.",
    "One commit per logical layer: agent scaffold, NFR-interpreter wire, KB-8 binding, artifact-gen wire, self-application run."
  ]
})

Agent({
  name: "interface-specs-agent",
  subagent_type: "langchain-engineer",
  team: "c1v-m4-decision-net",
  goal: "Produce M7.b formal interface specs from decision-net winner + M7.a N2 matrix + NFRs. Per interface (IF.NN in n2_matrix): SLA (p95 latency, availability %, throughput ceiling), retry policy, timeout, circuit-breaker threshold, auth mode, error-handling contract.",
  inline_skills: ["langchain-patterns", "api-design"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-7-interfaces/formal-specs.ts — Zod schema for interface_specs.v1",
    "apps/product-helper/lib/langchain/agents/system-design/interface-specs-agent.ts — agent",
    ".planning/runs/self-application/module-7/interface_specs.v1.json — c1v-self-applied instance",
    "Artifact emissions via scripts/artifact-generators/gen-interfaces.py (T10) with options.variant='formal-specs': xlsx with per-interface SLA row",
    "Artifact emissions via scripts/artifact-generators/gen-latency-chain.py (T10): svg stacked-bar tail-latency budget per chain hop"
  ],
  guardrails: [
    "HARD-DEP on `t8-wave-1-complete` tag — T8 creates `module-7-interfaces/` schema dir (needed for formal-specs.ts write). Halt if tag absent.",
    "Depend on decision-net-agent. Block on decision_network.v1.json (needs winner before speccing).",
    "Every IF.NN in interface_specs MUST resolve to a row in n2_matrix.v1.json — no orphan specs.",
    "SLA values MUST cite derivation: either NFR.NN target, empirical KB-8 prior, or FMEA-early detectability requirement.",
    "Tail-latency chain budget: Σ p95_i across chain ≤ user-facing p95 NFR target. If over, flag for decision-net-agent to revisit.",
    "One commit per logical layer: schema, agent, self-application run, artifact-wire."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-m4-decision-net",
  goal: "Verify T4b exit criteria: decision_network.v1 schema-valid, interface_specs.v1 schema-valid, all scoring routes through NFREngineInterpreter, every score has empirical_priors citation or inferred-flag, Pareto frontier non-empty, sensitivity rankings deterministic re-run.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "scripts/verify-t4b.ts — T4b-specific verifier (reusable in CI)",
    "plans/t4b-outputs/verification-report.md — per EC PASS/FAIL + evidence",
    "Integration test: feed c1v's own ffbd.v1 + fmea_early.v1 + nfrs.v2 → assert decision_network.v1 + interface_specs.v1 emit + artifacts land in manifest",
    "git tag 't4b-wave-3-complete' only if all ECs green — ✅ ISSUED 2026-04-24 @ commit 4ecfe3f (12/12 gates green per plans/t4b-t5-completion.md)"
  ],
  guardrails: [
    "Depend on decision-net-schemas + decision-net-agent + interface-specs-agent.",
    "Non-fix verifier: log failures, return, do NOT auto-fix.",
    "Check: no standalone DecisionNetworkEngine class exists (grep for `class DecisionNetworkEngine` must return 0 hits).",
    "Check: decision_audit rows emitted — query Drizzle table, assert non-zero count post-run.",
    "Tag only on full green."
  ]
})
```

---

## T5 — c1v-m5-formfunction (Wave 3)

**Scope:** Crawley form-function mapping (M5 NEW per v1 §5.2) ONLY. 7 M5 phases: form-inventory, function-inventory, concept-mapping-matrix, concept-quality-scoring, operand-process-catalog, concept-alternatives, form-function-handoff. **M6 HoQ moved to T6 (Wave 4)** per critique iter 1 — avoids intra-Wave-3 cross-team dep on T4b decision_network output.

**Dependencies:** Blocks on Wave 2-mid (T11 NFR resynth) AND `t8-wave-1-complete` tag (schema dirs renamed). Consumes: `ffbd.v1.json` (function inventory source), `fmea_early.v1.json` (redundancy/failure-mode signals for form inventory), `nfrs.v2.json` (priorities drive Q weights). Concept quality math cited to Stevens/Myers/Constantine + Bass, **NOT Crawley directly** (per v1 research ruling).

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-m5-formfunction",
  agent_type: "tech-lead",
  description: "Build M5 Form-Function Mapping (Crawley Concept stage) ONLY. Form inventory, function inventory, concept mapping matrix with quality Q(f,g)=s·(1-k), concept alternatives, form-function handoff. M6 HoQ owned by T6.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.md §5.2 (M5) + plans/c1v-MIT-Crawley-Cornell.v2.md §0.3.4",
    math_attribution: "plans/research/math-sources.md — Q(f,g) cites Stevens/Myers/Constantine 1974 (specificity) + Bass et al. 2012 (coupling). NOT Crawley directly.",
    crawley_content: ".planning/phases/13-Knowledge-banks-deepened/5-form-function/05-crawley/ (patched by T9 with Ch 3, 4, 5)",
    upstream_artifacts: [
      ".planning/runs/self-application/module-3/ffbd.v1.json",
      ".planning/runs/self-application/module-8/fmea_early.v1.json",
      ".planning/runs/self-application/module-2/nfrs.v2.json",
      ".planning/runs/self-application/module-2/constants.v2.json"
    ],
    hard_dep: ["`t8-wave-1-complete` tag (schema dir `module-5-form-function/` created by T8)", "`t9-wave-1-complete` tag (Crawley content patched under `13-Knowledge-banks-deepened/5-form-function/05-crawley/`)"],
    downstream_consumers: [
      "T6 c1v-synthesis — consumes form_function_map.v1.json to derive HoQ customer-requirements and build architecture_recommendation"
    ]
  },
  commit_policy: "one-commit-per-agent-per-deliverable",
  wave: 3,
  blocks: ["wave-4-synthesis"]
})
```

### Step 2: Spawn 3 teammates (parallel)

```
Agent({
  name: "m5-schemas",
  subagent_type: "langchain-engineer",
  team: "c1v-m5-formfunction",
  goal: "Build 7 M5 Zod phase schemas per v1 §5.2: form-inventory, function-inventory, concept-mapping-matrix, concept-quality-scoring, operand-process-catalog, concept-alternatives, form-function-handoff. Emit form_function_map.v1 top-level schema.",
  inline_skills: ["langchain-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-1-form-inventory.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-2-function-inventory.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-3-concept-mapping-matrix.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-4-concept-quality-scoring.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-5-operand-process-catalog.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-6-concept-alternatives.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/phase-7-form-function-handoff.ts",
    "apps/product-helper/lib/langchain/schemas/module-5-form-function/index.ts barrel + MODULE_5_PHASE_SCHEMAS registry for generate-all.ts"
  ],
  guardrails: [
    "HARD-DEP on `t8-wave-1-complete` tag — T8 creates `module-5-form-function/` schema dir. Halt if tag absent.",
    "HARD-DEP on `t9-wave-1-complete` tag — T9 patches Crawley Ch 3, 4, 5 into `13-Knowledge-banks-deepened/5-form-function/05-crawley/`. Halt if tag absent.",
    "Q(f,g) = s·(1-k) — schema field concept_quality carries (specificity, coupling, Q) triplet with math_derivation_v2.citations[] pointing to Stevens/Myers + Bass, NOT Crawley.",
    "Function inventory MUST be derived from ffbd.v1 functions — every F.NN resolves.",
    "Form inventory MUST cover ≥ all functions (surjective) — schema refine() enforces.",
    "Concept alternatives: ≥ 2 per decomposition; each carries dominance rationale.",
    "One commit per phase file."
  ],
  blocks: ["m5-agent", "verifier"]
})

Agent({
  name: "m5-agent",
  subagent_type: "langchain-engineer",
  team: "c1v-m5-formfunction",
  goal: "Build form-function-agent.ts — orchestrates M5 phases 1-7, produces form_function_map.v1.json. Consumes ffbd.v1 + fmea_early.v1 + nfrs.v2. FMEA consumption rationale: failure modes flagged 'redundancy-required' drive duplicate form elements in inventory.",
  inline_skills: ["langchain-patterns", "claude-api"],
  deliverables: [
    "apps/product-helper/lib/langchain/agents/system-design/form-function-agent.ts",
    "apps/product-helper/lib/langchain/agents/system-design/form-function-agent.test.ts",
    ".planning/runs/self-application/module-5/form_function_map.v1.json — c1v-self-applied",
    "Artifact emissions via scripts/artifact-generators/gen-form-function.py (T10): xlsx matrix, svg bipartite graph, mmd concept-expansion tree"
  ],
  guardrails: [
    "Depend on m5-schemas.",
    "FMEA dependency is SOFT — when fmea_early.v1 flags redundancy-required failure modes, form inventory MUST include ≥2 redundant forms for affected functions. Otherwise proceed without expansion.",
    "Concept-quality scoring routes through NFREngineInterpreter (kb-runtime G1) — NO standalone math helpers.",
    "Emit audit rows with kb_chunk_ids citing Stevens/Bass references.",
    "One commit per logical layer."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-m5-formfunction",
  goal: "Verify T5 exit criteria: form_function_map.v1 schema-valid, all math attributions correct (Stevens/Bass cited, not Crawley), FMEA redundancy flags respected.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "scripts/verify-t5.ts",
    "plans/t5-outputs/verification-report.md",
    "Attribution grep test: no source: 'Crawley' attached to Q(f,g) scoring anywhere under module-5-form-function/",
    "git tag 't5-wave-3-complete' on green — ✅ ISSUED 2026-04-24 @ commit a30d9c6 (V5.1-V5.4 + jest 8/8 + global gates per plans/t4b-t5-completion.md)"
  ],
  guardrails: [
    "Depend on m5-schemas + m5-agent.",
    "Non-fix.",
    "Tag only on green."
  ]
})
```

---

## T6 — c1v-synthesis (Wave 4)

**Scope:** Architecture-recommendation synthesizer per v1 §12 + M8.b FMEA-residual folded in per v2 §0.3.4. Final terminal wave. Combines decision_network winner + form_function_map + hoq + interface_specs + nfrs + fmea_early into single `architecture_recommendation.v1.json`. FMEA-residual assesses residual risk on the chosen architecture (not the FFBD+N2 of Wave 2-early).

**Dependencies:** Blocks on Wave 3 complete (T4b + T5 + all their artifacts). Consumes every module's final artifact.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-synthesis",
  agent_type: "tech-lead",
  description: "Terminal synthesis wave. Produce architecture_recommendation.v1.json + hoq.v1.json + fmea_residual.v1.json. Combine every module's output into single derivation-chain artifact with provenance per decision. M6 HoQ lives here (not T5) because HoQ engineering-characteristics derive from decision_network winner (T4b output).",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.md §4 End State + §12 Exit Criteria + plans/c1v-MIT-Crawley-Cornell.v2.md §0.3.4 (M6 HoQ + M8.b fold)",
    upstream_artifacts: [
      ".planning/runs/self-application/module-1/scope_tree.json",
      ".planning/runs/self-application/module-1/context_diagram.json",
      ".planning/runs/self-application/module-1/data_flows.v1.json",
      ".planning/runs/self-application/module-2/nfrs.v2.json",
      ".planning/runs/self-application/module-2/constants.v2.json",
      ".planning/runs/self-application/module-3/ffbd.v1.json",
      ".planning/runs/self-application/module-4/decision_network.v1.json",
      ".planning/runs/self-application/module-5/form_function_map.v1.json",
      ".planning/runs/self-application/module-7/n2_matrix.v1.json",
      ".planning/runs/self-application/module-7/interface_specs.v1.json",
      ".planning/runs/self-application/module-8/fmea_early.v1.json"
    ],
    hard_dep: ["`t4b-wave-3-complete` tag (needs decision_network winner for HoQ ECs + architecture_recommendation)", "`t5-wave-3-complete` tag (needs form_function_map for synthesis)", "`t8-wave-1-complete` tag (schema dir `module-6-hoq/` created by T8)"],
    downstream_consumers: ["Portfolio artifact — LinkedIn hero demo"],
    launch_context: "plans/launch-v1-demo.md §6 — this is the artifact that ships"
  },
  commit_policy: "one-commit-per-agent-per-deliverable; synthesizer commit is the tagged 'v2-complete' commit",
  wave: 4,
  blocks: []
})
```

### Step 2: Spawn 6 teammates (hoq-agent + fmea-residual-agent + drizzle-runstate + build-all-headless fire in parallel; synthesizer blocks on hoq-agent + fmea-residual-agent; plan-updater blocks on all others)

```
Agent({
  name: "hoq-agent",
  subagent_type: "langchain-engineer",
  team: "c1v-synthesis",
  goal: "Build M6 HoQ (House of Quality / QFD). Customer requirements ← nfrs.v2 (prioritized). Engineering characteristics ← derived from decision_network.v1 winner's measurable properties (NOW AVAILABLE — T4b Wave 3 complete). Relationship matrix, roof correlations, target values from constants.v2.",
  inline_skills: ["langchain-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-1-customer-requirements.ts",
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-2-engineering-characteristics.ts",
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-3-relationship-matrix.ts",
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-4-roof-correlations.ts",
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-5-target-values.ts",
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-6-competitive-benchmarks.ts",
    "apps/product-helper/lib/langchain/schemas/module-6-hoq/index.ts barrel + MODULE_6_PHASE_SCHEMAS",
    "apps/product-helper/lib/langchain/agents/system-design/hoq-agent.ts",
    ".planning/runs/self-application/module-6/hoq.v1.json",
    "Artifact via scripts/artifact-generators/gen-qfd.py (T10): xlsx HoQ"
  ],
  guardrails: [
    "HARD-DEP on T4b: decision_network.v1.json must exist (no fallback, no soft-dep — T6 is Wave 4, T4b is Wave 3, so T4b is always complete first).",
    "Customer requirements MUST trace to NFR.NN; engineering characteristics MUST trace to either a decision node's measurable property OR a constants.v2 entry.",
    "Roof correlations: symmetric matrix, diagonal null, entries ∈ {++, +, 0, -, --}.",
    "Competitive benchmarks: ≥ 2 competitors from KB-8 if analogous archetype exists.",
    "One commit per phase + agent + self-applied instance + artifact."
  ],
  blocks: ["synthesizer"]
})

Agent({
  name: "synthesizer",
  subagent_type: "langchain-engineer",
  team: "c1v-synthesis",
  goal: "Build architecture-recommendation agent + schema. Combines all 11 upstream artifacts into architecture_recommendation.v1.json with derivation_chain, provenance per decision, and alternative-summary.",
  inline_skills: ["langchain-patterns", "claude-api"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/synthesis/architecture-recommendation.ts — Zod schema",
    "apps/product-helper/lib/langchain/agents/system-design/synthesis-agent.ts — orchestrator",
    ".planning/runs/self-application/synthesis/architecture_recommendation.v1.json — c1v-self-applied",
    "Artifact via scripts/artifact-generators/gen-arch-recommendation.py (T10): html standalone, pdf, json-enriched"
  ],
  guardrails: [
    "HARD-DEP on hoq-agent + fmea-residual-agent (both must complete before synthesizer runs — enforced via blocks field).",
    "Every top-level decision in architecture_recommendation MUST have derivation_chain entry citing: (a) decision_network.v1.json node id, (b) nfrs_driving_choice[] list, (c) kb_chunk_ids[] RAG evidence, (d) empirical_priors citations from KB-8.",
    "Alternative summary: top-3 Pareto alternatives + why rejected, NOT just the winner.",
    "Tail-latency budget: must match interface_specs.v1 chain-level math — synthesizer verifies consistency.",
    "Residual-risk section: embed fmea_residual.v1.json flags[] verbatim.",
    "HoQ section: embed hoq.v1.json target-values table + relationship-matrix summary.",
    "One commit: 'feat(synthesis): architecture_recommendation.v1 — c1v self-applied'"
  ]
})

Agent({
  name: "fmea-residual-agent",
  subagent_type: "langchain-engineer",
  team: "c1v-synthesis",
  goal: "Produce M8.b FMEA-residual: residual-risk assessment on the chosen architecture (decision_network winner from T4b + form_function_map from T5 + interface_specs from T4b). Consumes fmea_early.v1 as predecessor_ref; adds new failure modes that only emerge from the chosen architecture (e.g., cascade failures in chosen queue topology).",
  inline_skills: ["langchain-patterns"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-8-risk/fmea-residual.ts — Zod schema",
    "apps/product-helper/lib/langchain/agents/system-design/fmea-residual-agent.ts",
    ".planning/runs/self-application/module-8/fmea_residual.v1.json — c1v-self-applied",
    "Artifact via scripts/artifact-generators/gen-fmea.py (T10) options.variant='residual': xlsx with stoplight sheet"
  ],
  guardrails: [
    "HARD-DEP on T4b `t4b-wave-3-complete` tag + T5 `t5-wave-3-complete` tag (decision_network + interface_specs + form_function_map must exist). Does NOT depend on synthesizer.",
    "Every residual FM.NN MUST have predecessor_ref (either 'new' or fmea_early FM.NN that survived mitigation).",
    "Detectability + recoverability ratings re-scored on the CHOSEN architecture (scales per rating_scales.json).",
    "Flag any FM where severity × likelihood × (1/detectability) exceeds threshold — synthesizer embeds flags in architecture_recommendation.",
    "Single commit."
  ],
  blocks: ["synthesizer"]
})

Agent({
  name: "drizzle-runstate",
  subagent_type: "database-engineer",
  team: "c1v-synthesis",
  goal: "Ship project_run_state.v1 Drizzle migration + RLS per v1 §8.2. Tracks start-phase + loop-iteration + per-module revisions across pipeline runs. Required for Exit Criterion §12-bullet-5.",
  inline_skills: ["database-patterns", "security-patterns"],
  deliverables: [
    "apps/product-helper/lib/db/schema/project-run-state.ts — Drizzle table",
    "apps/product-helper/lib/db/migrations/NNNN_project-run-state.sql — with RLS policies scoped to project owner + org",
    "apps/product-helper/lib/db/schema/index.ts — export",
    "Smoke test: insert + select via RLS context produces expected row"
  ],
  guardrails: [
    "RLS policy: user can read/write only run_states for projects they own (user_id match) OR org they belong to (org_id match).",
    "Schema fields per v1 §8.2: project_id, started_from_phase, current_phase, loop_iteration, module_revisions (JSONB), stub_upstream (string[]), revision_log (JSONB[]).",
    "Migration name-sequence check — drizzle-kit broken (memory note) so write SQL manually; verify against local Supabase (port 54322) before PR.",
    "Commit: 'feat(db): project_run_state table + RLS'"
  ]
})

Agent({
  name: "build-all-headless",
  subagent_type: "qa-engineer",
  team: "c1v-synthesis",
  goal: "Build scripts/build-all-headless.ts — end-to-end smoke pipeline that runs M1→synthesis against a stub project and verifies every artifact emits + preload endpoint serves every module's schema. Required for Exit Criterion §12-bullet-7.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/build-all-headless.ts — runs full pipeline on fixture project",
    "apps/product-helper/scripts/fixtures/stub-project.json — minimal input",
    "apps/product-helper/__tests__/build-all-headless.test.ts — CI test",
    "plans/t6-outputs/smoke-report.md — per-module artifact emission verification"
  ],
  guardrails: [
    "Stub project MUST be minimal — not c1v itself. Test is about pipeline integrity, not self-application.",
    "Every module's schema MUST serve from /api/preload/module-N/route.ts without 5xx.",
    "Test runs in < 120s (mock LLM calls).",
    "Commit: 'feat(qa): E2E build-all-headless smoke'"
  ]
})

Agent({
  name: "plan-updater",
  subagent_type: "technical-program-manager",
  team: "c1v-synthesis",
  goal: "Update plan docs to reflect final shipped state. Close R1/R6 carried from v1, close open rulings from v2 that got resolved during execution, update MEMORY.md entries, write release notes.",
  inline_skills: [],
  deliverables: [
    "plans/c1v-MIT-Crawley-Cornell.md — mark §11 risks R1, R6 resolved; update §12 Exit Criteria status",
    "plans/c1v-MIT-Crawley-Cornell.v2.md — close all open rulings, strike § sections superseded by execution reality",
    "plans/v2-release-notes.md — NEW — end-to-end summary of what shipped, what artifacts emit, what KB hygiene landed",
    "~/.claude/projects/-Users-davidancor-Projects-c1v/memory/project_c1v_system_design_self_application.md — update status with concrete artifact paths"
  ],
  guardrails: [
    "Depend on hoq-agent + synthesizer + fmea-residual-agent + drizzle-runstate + build-all-headless.",
    "CLAUDE.md edits require explicit David authorization per file-safety rule — skip unless authorized; plan-updater does not need to touch CLAUDE.md to ship release notes.",
    "Release notes: factual, no marketing fluff. What shipped, what was deferred (frozen UI viewers), what the portfolio artifact is.",
    "One commit: 'docs(v2): release notes + plan closeout'"
  ]
})
```

---

## Wave gate procedure (git-tag mechanism)

Per v2 §14.3 (revised per critique iter 1 — no ghost slash commands, tags-only):

1. **Team verifier tags.** Each team's final verifier agent creates a git tag `t<N>-wave-<K>-complete` on the commit where all team ECs pass. No tag = team not done.
2. **Wave-gate condition.** Bond advances from Wave K to Wave K+1 iff ALL required tags for Wave K are present on `origin/main`. Required tags per wave:
   - Wave 1: `t1-wave-1-complete`, `t2-wave-1-complete`, `t3-wave-1-complete`, `t8-wave-1-complete`, `t9-wave-1-complete`, `t10-wave-1-complete`
   - Wave 2-early: `t7-wave-2-early-complete`, `t4a-wave-2-early-complete`
   - Wave 2-mid: `t11-wave-2-mid-complete`
   - Wave 3: `t4b-wave-3-complete`, `t5-wave-3-complete`
   - Wave 4: `t6-wave-4-complete` (terminal — no advance)
3. **Consistency verifier.** `scripts/verify-tree-pair-consistency.ts` runs at Wave 1 gate (blocks Wave 2-early on schema/KB tree mismatch). Exit 0 required.
4. **Verifier-tag consumer.** Bond polls `git fetch --tags && git tag --list 't*-wave-<K>-complete'` every 300 seconds via `ScheduleWakeup`. When all required tags present AND consistency verifier green, Bond dispatches next wave in a single coordinator message. If 60 min elapsed without all tags, Bond surfaces "Wave K stuck — missing tags: X, Y" to David.
5. **Optional human gate.** If David sets tag `wave-<K>-approved` manually (via `git tag wave-K-approved <sha> && git push --tags`), Bond blocks on its presence in addition to verifier tags. If David does not set it, verifier-tag-only path auto-advances. No slash commands required.
6. **Rollback.** Each wave's teams carry snapshot tags (`t<N>-pre-wave-<K>-snapshot`) created by the first agent that modifies state. Rollback = `git checkout <tag> -- <scoped-path>`.

---

## Dispatch order (canonical, copy-paste sequence)

**Mechanism:** All TeamCreate + Agent calls for a single wave fire in ONE coordinator message to maximize parallelism. The prior "wait 2 min" stagger is dropped — Claude Code session has no in-message sleep primitive, and Anthropic rate limits at the subscription tier ("Max +20x") are not the binding constraint. If rate-limited, retry with exponential backoff.

### Wave 1 (6 teams, 23 agents — single message, full parallel)

```
# One coordinator message contains:
TeamCreate(c1v-crawley-kb)        + 4× Agent
TeamCreate(c1v-kb8-atlas)         + 3× Agent
TeamCreate(c1v-runtime-prereqs)   + 5× Agent
TeamCreate(c1v-reorg)             + 4× Agent (resumes from ~40%)
TeamCreate(c1v-kb-hygiene)        + 4× Agent
TeamCreate(c1v-artifact-centralization) + 4× Agent
```

### Wave 2-early (after Wave 1 gate — 2 teams, 8 agents)

```
TeamCreate(c1v-module0-be)            + 4× Agent
TeamCreate(c1v-m3-ffbd-n2-fmea-early) + 4× Agent (m1-data-flows + ffbd-closer + n2-builder + fmea-early-producer)
```

(M1 phase 2.5 Data Flows folded into T4a as `m1-data-flows` agent — no separate team. Runs FIRST in T4a's DAG; blocks ffbd-closer + n2-builder.)

### Wave 2-mid (after Wave 2-early gate — 1 team, 3 agents)

```
TeamCreate(c1v-m2-nfr-resynth) + 3× Agent (schema-extender FIRST; nfr-resynthesizer + constants-resynthesizer then parallel)
```

### Wave 3 (after Wave 2-mid gate — 2 teams, 7 agents)

```
TeamCreate(c1v-m4-decision-net)  + 4× Agent
TeamCreate(c1v-m5-formfunction)  + 3× Agent (M6 HoQ moved to T6)
```

### Wave 4 (after Wave 3 gate — 1 team, 6 agents)

```
TeamCreate(c1v-synthesis) + 6× Agent (hoq-agent + fmea-residual-agent + drizzle-runstate + build-all-headless in parallel; synthesizer blocks on hoq + fmea-residual; plan-updater blocks on all)
```

**Total: 12 teams, 47 agents, 4 wave gates, estimated 14–20hr wall-clock (12–16hr agent + 2–4hr optional human gate latency).**

---

## Dispatch blockers (must resolve before Wave 1 starts)

### Resolved (critique iter 1 + iter 2)

1. ✅ Atlas source path corrected in v2.md §0.2.1 Defect 3 + EC-0.2.3 + §0.4.3.
2. ✅ METHODOLOGY-CORRECTION references pointing to `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (not root).
3. ✅ T4b, T5, T6 spawn prompts defined (this doc).
4. ✅ Team count 12 (v2.md §14.5).
5. ✅ T11 schema-extender agent added (v2.md §0.3.6).
6. ✅ FMEA rename (`v1`→`early`, `v2`→`residual`) applied.
7. ✅ R-v2.5 struck from Open Rulings.
8. ✅ M1 phase 2.5 Data Flows folded into T4a as `m1-data-flows` agent (v2.md §0.3.5, 4 agents).
9. ✅ M6 HoQ moved from T5 to T6 Wave 4 (avoids intra-Wave-3 cross-team dep on T4b decision_network).
10. ✅ HARD-DEP guardrails added to T4b/T5 schema-writing agents (block on `t8-wave-1-complete` tag).
11. ✅ Wave gate mechanism spec'd as git-tag-only (no ghost `/approve-wave` slash command).
12. ✅ Stagger dropped — all Wave 1 TeamCreates fire in single coordinator message.
13. ✅ Skill-attachment mechanism clarified: `inline_skills: [...]` is documentation; Bond translates to `Skill()` calls in prompt body at dispatch.
14. ✅ T6 plan-updater CLAUDE.md misattribution fixed (file-safety rule, not plan-before-action).
15. ✅ Synthesizer ↔ fmea-residual-agent circular dep broken (residual depends on T4b/T5 tags, not synthesizer).

### Still open

**David rulings:**
- R-v2.1 Crawley findings completeness — recommend: add pre-flight to T1 parser-agent that verifies every chapter in v2 §0.2.4 patch matrix exists in `plans/research/crawley-book-findings.md`. If gaps, T1 extracts from source PDF before T9 patcher runs. Eliminates MISSING.md-stub fallback.
- R-v2.2 4-wave vs 3-wave collapse — recommend: **keep 4-wave strict**. Collapsing saves ~30min but risks partial-state bugs at T4b↔T11 boundary.
- R-v2.3 UI freeze strict — recommend: **strict**. FMEA viewer post-v2.

**Plan work before dispatch:**
- [ ] Promote T3 `c1v-runtime-prereqs` from roster-only to full spawn prompt (currently draft in v1 team-spawn-prompts.md).
- [x] Promote T7 `c1v-module0-be` from roster-only to full spawn prompt. **See §T7 below.**
- [x] Promote T8 `c1v-reorg` from roster-only to full spawn prompt. **See §T8 below.**
- [ ] Update handoff doc D5 row to reflect FMEA label rename (`early`/`residual` not `v1`/`v2`). (Low priority — doesn't block dispatch.)

**David rulings recorded 2026-04-24 03:40 EDT:**
- R-v2.1: ✅ YES — T1 parser-agent pre-checks `crawley-book-findings.md` chapter coverage before T9 patcher runs.
- R-v2.2: ✅ YES — keep 4-wave strict.
- R-v2.3: ❌ NO (flipped) — FMEA viewer IS in scope for v2. T10 runtime-wirer owns new `fmea-viewer.tsx` component + `/projects/[id]/system-design/fmea/page.tsx` route. See v2.md §15.5.

**Dispatch unblocked.** Wave 1 ready to fire.

---

## T3 — c1v-runtime-prereqs (Wave 1) — PROMOTED FROM DRAFT

**Scope:** kb-runtime G1–G11 per v1 §0 Prerequisites + `plans/kb-runtime-architecture.md`. NFREngineInterpreter + rule-tree loader + predicate DSL + ArtifactReader + `decision_audit` Drizzle + fail-closed guards + PII scrub + `pickModel()` router + pgvector + `kb_chunks` + embedding pipeline.

**Dependencies:** Wave 1 parallel — no inter-team deps. Produces the runtime surface that T4b/T5/T6 Wave-3+ agents invoke.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-runtime-prereqs",
  agent_type: "tech-lead",
  description: "Build the deterministic math-routing runtime (NFREngineInterpreter + RAG + audit-db + guards) that every Wave 2+ scoring agent depends on. NO standalone engine classes — all Crawley math expresses as NFREngineInterpreter rules consuming kb_chunks via pgvector.",
  context: {
    authoritative_spec: "plans/kb-runtime-architecture.md §3 (G1-G11) + plans/c1v-MIT-Crawley-Cornell.md §0 (Prerequisites)",
    downstream_consumers: [
      "T4b c1v-m4-decision-net — routes every utility/Pareto/sensitivity calc through NFREngineInterpreter",
      "T5 c1v-m5-formfunction — routes Q(f,g) scoring through NFREngineInterpreter",
      "T6 c1v-synthesis — reads decision_audit rows for provenance chain"
    ]
  },
  commit_policy: "one-commit-per-agent-per-deliverable",
  wave: 1,
  blocks: ["wave-2-early", "wave-3-decision", "wave-4-synthesis"]
})
```

### Step 2: Spawn 5 teammates (parallel)

```
Agent({
  name: "runtime",
  subagent_type: "backend-architect",
  team: "c1v-runtime-prereqs",
  goal: "Build G1 NFREngineInterpreter class + G3 predicate DSL. Interpreter evaluates rule trees loaded from engine.json (G2 separately owned) against ContextResolver outputs. Predicate DSL supports: scalar compare (lt/gt/eq), vector ops (dot, norm), graph ops (dominates, frontier-check), probabilistic (expected_value, variance).",
  inline_skills: ["langchain-patterns", "security-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/runtime/nfr-engine-interpreter.ts — core class, .evaluate(rule, context) API",
    "apps/product-helper/lib/runtime/predicate-dsl.ts — G3 DSL parser+evaluator",
    "apps/product-helper/lib/runtime/__tests__/nfr-engine-interpreter.test.ts — unit + fixture integration",
    "apps/product-helper/lib/runtime/types.ts — shared types"
  ],
  guardrails: [
    "NO standalone DecisionNetworkEngine class anywhere. Grep must return zero hits post-commit.",
    "Every .evaluate() call MUST emit audit row with {model_version, kb_chunk_ids[], inputs_hash, output_hash, hash_chain_prev}.",
    "DSL parser hardened against injection: treat rule source as data, use a whitelisted AST walker, never dynamic code execution.",
    "Commits: 'feat(runtime): G1 NFREngineInterpreter' + 'feat(runtime): G3 predicate DSL'"
  ],
  blocks: ["verifier"]
})

Agent({
  name: "resolver",
  subagent_type: "backend-architect",
  team: "c1v-runtime-prereqs",
  goal: "Build G2 engine.json rule-tree loader + G4 ArtifactReader (upstream-phase artifact reader). Loader validates engine.json against Zod schema; reader resolves `upstream_ref` paths like '.planning/runs/<project>/module-3/ffbd.v1.json' with RLS-scoped access.",
  inline_skills: ["api-design", "security-patterns"],
  deliverables: [
    "apps/product-helper/lib/runtime/engine-json-loader.ts",
    "apps/product-helper/lib/runtime/artifact-reader.ts",
    "apps/product-helper/lib/runtime/__tests__/artifact-reader.test.ts — verifies path traversal attacks rejected"
  ],
  guardrails: [
    "engine.json loader rejects rule files > 1MB (prevents DoS).",
    "ArtifactReader path resolution MUST reject `..` sequences and absolute paths outside project-owned runs dir.",
    "Cache reads by (project_id, artifact_path) tuple — invalidate on write.",
    "Commit: 'feat(runtime): G2+G4 rule-tree loader + artifact reader'"
  ],
  blocks: ["verifier"]
})

Agent({
  name: "audit-db",
  subagent_type: "database-engineer",
  team: "c1v-runtime-prereqs",
  goal: "Build G5 `decision_audit` Drizzle table with hash chaining. Every NFREngineInterpreter evaluation appends a row; rows form an append-only audit log with hash_chain_prev linking each to its predecessor per project_id.",
  inline_skills: ["database-patterns", "security-patterns"],
  deliverables: [
    "apps/product-helper/lib/db/schema/decision-audit.ts — Drizzle table definition",
    "apps/product-helper/lib/db/migrations/NNNN_decision-audit.sql — with RLS (read: project owner + org; write: only service-role)",
    "apps/product-helper/lib/db/schema/index.ts — export",
    "Smoke test: insert row → fetch via RLS context → verify hash_chain_prev links"
  ],
  guardrails: [
    "Columns: id uuid PK, project_id uuid FK, agent_name text, rule_id text, model_version text, inputs_hash text, output_hash text, kb_chunk_ids text[], hash_chain_prev text, created_at timestamp.",
    "RLS: SELECT allowed for project.user_id match OR project.org membership; INSERT only via service role (agents use service key).",
    "Index on (project_id, created_at) for provenance-chain queries.",
    "drizzle-kit broken — write SQL manually, verify via local Supabase (port 54322) before PR.",
    "Commit: 'feat(db): G5 decision_audit with hash-chain RLS'"
  ],
  blocks: ["verifier"]
})

Agent({
  name: "guards",
  subagent_type: "devops-engineer",
  team: "c1v-runtime-prereqs",
  goal: "Build G6 fail-closed defaults + G10 PII scrub + G11 `pickModel()` router + **OpenRouter client (NEW — David ruling 2026-04-24 03:55 EDT)**. Every LLM call in the production pipeline routes through `lib/runtime/openrouter-client.ts`. pickModel() maps task complexity → OpenRouter model id (route Haiku-tier via `anthropic/claude-haiku-4-5`, Sonnet-tier via `anthropic/claude-sonnet-4-6`, Opus-tier via `anthropic/claude-opus-4-7`, optionally non-Claude tiers via `google/gemini-2.5-flash` / `meta-llama/llama-3.3-70b-instruct` / etc. for cost optimization).",
  inline_skills: ["security-patterns", "code-quality", "claude-api"],
  deliverables: [
    "apps/product-helper/lib/runtime/openrouter-client.ts — wraps Anthropic SDK with OpenRouter base URL + key; exports `chat(model, messages, opts)` API. Reads OPENROUTER_API_KEY from env (validated via Zod env schema). Supports streaming + non-streaming. Implements automatic retry with exponential backoff on 429/5xx.",
    "apps/product-helper/lib/runtime/pick-model.ts — complexity heuristic → OpenRouter model id. Config table: {classify: 'anthropic/claude-haiku-4-5', extract: 'anthropic/claude-sonnet-4-6', synthesize: 'anthropic/claude-opus-4-7', cheap_classify: 'google/gemini-2.5-flash'}.",
    "apps/product-helper/lib/runtime/fail-closed.ts — wrapper: any evaluation error → structured error, no silent fallback",
    "apps/product-helper/lib/runtime/pii-scrub.ts — regex sweep (email, phone, SSN, credit-card) + LLM-based classifier fallback (routed via openrouter-client)",
    "apps/product-helper/lib/runtime/__tests__/guards.test.ts",
    "apps/product-helper/lib/runtime/__tests__/openrouter-client.test.ts — integration test with mocked OpenRouter endpoint (msw)",
    "apps/product-helper/.env.example — add OPENROUTER_API_KEY + OPENROUTER_BASE_URL (default https://openrouter.ai/api/v1)",
    "apps/product-helper/lib/env.ts — extend Zod env schema with OPENROUTER_API_KEY (required in production)"
  ],
  guardrails: [
    "OpenRouter is the ONLY LLM gateway. Do NOT instantiate `new Anthropic()` or `new OpenAI()` directly anywhere — all clients route through openrouter-client.ts.",
    "Use HTTP headers: `HTTP-Referer: https://prd.c1v.ai` + `X-Title: c1v-MIT-Crawley-Cornell` (OpenRouter requires for billing attribution).",
    "Prompt caching: use OpenRouter's `extra_body.cache_control` pass-through for Anthropic models (system + KB-chunk context blocks get cache breakpoints to cut token cost ~10x on repeated queries).",
    "Cost observability: every call emits `{model, prompt_tokens, completion_tokens, cost_usd}` to observability stream — consumed by T6 plan-updater release-notes.",
    "Fail-closed MUST log errors to audit with error.phase='evaluate' + error.stack.",
    "PII scrub MUST run BEFORE any kb_chunks insert — regex pass + flag for human review if > 3 hits.",
    "pickModel() default: anthropic/claude-sonnet-4-6. Opus only when heuristic returns 'synthesize' task. Haiku only when 'classify' task. Non-Claude tiers enabled only when `CHEAP_MODE=true` env flag set (dev/testing).",
    "Commit: 'feat(runtime): G6 fail-closed + G10 PII scrub + G11 pickModel() + OpenRouter client'"
  ],
  blocks: ["verifier"]
})

Agent({
  name: "rag",
  subagent_type: "vector-store-engineer",
  team: "c1v-runtime-prereqs",
  goal: "Build G8 pgvector setup + G9 `kb_chunks` table + embedding pipeline. Ingests markdown from `13-Knowledge-banks-deepened/` (post-T9 hygiene) into pgvector. Chunks by semantic boundary (H2 sections), embeds via OpenAI text-embedding-3-small (1536 dim), stores with metadata (kb_folder, chapter, heading, source_hash).",
  inline_skills: ["database-patterns"],
  deliverables: [
    "apps/product-helper/lib/db/migrations/NNNN_pgvector-extension.sql — CREATE EXTENSION IF NOT EXISTS vector",
    "apps/product-helper/lib/db/schema/kb-chunks.ts — Drizzle table with vector(1536) column + HNSW index",
    "apps/product-helper/scripts/ingest-kb-chunks.ts — batch ingest script (idempotent by source_hash)",
    "apps/product-helper/lib/runtime/kb-retrieval.ts — similarity-search API: retrieve(query, k=5, filter={kb_folder})",
    "apps/product-helper/lib/runtime/__tests__/kb-retrieval.test.ts"
  ],
  guardrails: [
    "HNSW index params: m=16, ef_construction=64.",
    "Chunk size target: 300-800 tokens. Overlap: 50 tokens. Dedup by realpath (symlinked cross-cutting KBs embedded ONCE per realpath — critical per T9 §0.2 symlink strategy).",
    "Ingest is idempotent: source_hash dedup skips unchanged files.",
    "Retrieval MUST return kb_chunk_ids array — consumed by NFREngineInterpreter audit rows.",
    "Commit: 'feat(runtime): G8+G9 pgvector + kb_chunks + ingest pipeline'"
  ],
  blocks: ["verifier"]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-runtime-prereqs",
  goal: "Verify G1-G11 exit criteria. Integration test: feed a synthetic Crawley math rule → NFREngineInterpreter evaluates via RAG-retrieved kb_chunks → decision_audit row emitted with hash chain → query runs against RLS context.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "scripts/verify-t3.ts",
    "plans/t3-outputs/verification-report.md",
    "E2E test: .planning/phases/13-Knowledge-banks-deepened/_shared/caching-system-design-kb.md → ingest → retrieve → evaluate dummy rule → audit row",
    "git tag 't3-wave-1-complete' on green"
  ],
  guardrails: [
    "Depend on runtime + resolver + audit-db + guards + rag.",
    "Grep check: zero hits for 'class DecisionNetworkEngine' anywhere under apps/product-helper/lib/.",
    "Non-fix verifier.",
    "Tag only on green."
  ]
})
```

---

## T7 — c1v-module0-be (Wave 2-early) — PROMOTED FROM DRAFT

**Scope:** Module 0 backend per v1 §5.0 — 3 Zod schemas, 2 Drizzle tables, 2 agents. Frontend components OUT OF SCOPE (UI freeze holds for Module 0; FMEA viewer exception is ONLY for FMEA).

**Dependencies:** Blocks on Wave 1 (needs T8 module-0 schema dir + T9 hygiene complete). Produces intake artifacts that M1 extension consumes.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-module0-be",
  agent_type: "tech-lead",
  description: "Build Module 0 schema layer + Drizzle tables + intake agents. Backend only. Frontend (3-card entry, Tier 0/1/2 forms) post-v2 per UI freeze.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.md §5.0 (Module 0 onboarding + project-entry + discriminator intake)",
    hard_dep: ["`t8-wave-1-complete` tag (module-0/ schema dir created)", "`t9-wave-1-complete` tag (KB hygiene complete)"],
    downstream_consumers: ["M1 extension consumes intake_discriminators.v1 for scope_tree derivation"]
  },
  commit_policy: "one-commit-per-agent-per-deliverable",
  wave: "2-early",
  blocks: ["wave-2-mid-nfr-resynth"]
})
```

### Step 2: Spawn 4 teammates (parallel)

```
Agent({
  name: "schemas",
  subagent_type: "langchain-engineer",
  team: "c1v-module0-be",
  goal: "Build 3 Zod schemas in module-0/: user-profile.ts, project-entry.ts, intake-discriminators.ts. Per v1 §5.0.1/§5.0.2/§5.0.3 specs.",
  inline_skills: ["langchain-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-0/user-profile.ts",
    "apps/product-helper/lib/langchain/schemas/module-0/project-entry.ts",
    "apps/product-helper/lib/langchain/schemas/module-0/intake-discriminators.ts",
    "apps/product-helper/lib/langchain/schemas/module-0/index.ts barrel + MODULE_0_PHASE_SCHEMAS registry",
    "generate-all.ts registration added"
  ],
  guardrails: [
    "HARD-DEP on t8-wave-1-complete.",
    "project_entry.entry_pattern ∈ {'new', 'existing', 'exploring'} — drives pipeline routing.",
    "intake_discriminators MUST carry inference_audit[] + pruning_set[] + computed_constants per v1 §5.0.3.",
    "Commits: one per schema file."
  ]
})

Agent({
  name: "drizzle",
  subagent_type: "database-engineer",
  team: "c1v-module0-be",
  goal: "Build user_signals + project_entry_states Drizzle tables with RLS. user_signals caches Clearbit/LinkedIn company enrichment per-user (keyed by user_id). project_entry_states tracks entry_pattern + pipeline_start_submodule per project.",
  inline_skills: ["database-patterns", "security-patterns"],
  deliverables: [
    "apps/product-helper/lib/db/schema/user-signals.ts — cache table, TTL column",
    "apps/product-helper/lib/db/schema/project-entry-states.ts",
    "apps/product-helper/lib/db/migrations/NNNN_module-0-tables.sql — with RLS (user_signals: user_id match; project_entry_states: project owner + org)",
    "Smoke test: insert + fetch via RLS"
  ],
  guardrails: [
    "RLS policies required; no public read/write.",
    "user_signals.ttl: 30 days default — stale rows rescraped on next read.",
    "Manual SQL per broken drizzle-kit; verify local Supabase.",
    "Commit: 'feat(db/m0): user_signals + project_entry_states + RLS'"
  ]
})

Agent({
  name: "intake-agent",
  subagent_type: "langchain-engineer",
  team: "c1v-module0-be",
  goal: "Build discriminator-intake-agent.ts. Drives top-5 Tier-1 Q&A (D0/D4/D6/D7/D8) + inference synthesis (Tier-2: D1/D3/D5/D9/D10/D12) + pruning-set computation per v1 §5.0.3.",
  inline_skills: ["langchain-patterns", "claude-api"],
  deliverables: [
    "apps/product-helper/lib/langchain/agents/system-design/discriminator-intake-agent.ts",
    "apps/product-helper/lib/langchain/agents/system-design/__tests__/discriminator-intake-agent.test.ts",
    "Tier-0 gate handling: G1 (decisions?) + G2 (PRD docs?) → route to {full, decisions-only, PRD-only, browse-only}"
  ],
  guardrails: [
    "Every Tier-1 Q has skippable fallback → inference with confidence badge.",
    "Target intake time < 2 minutes total.",
    "pruning_set must list decision_id + removed_alternatives + rationale.",
    "Commit: 'feat(m0): discriminator-intake-agent'"
  ]
})

Agent({
  name: "scraper",
  subagent_type: "general-purpose",
  team: "c1v-module0-be",
  goal: "Build signup-signals-agent.ts. Background job triggered post-signup for workplace-email users. Enriches company domain → industry, employee band, funding stage, website tech stack, compliance badges via Clearbit + LinkedIn + public-web fetch.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/lib/langchain/agents/system-design/signup-signals-agent.ts",
    "apps/product-helper/app/api/signup-signals/[userId]/route.ts — POST endpoint triggered by Clerk webhook",
    "Caches results in user_signals table per drizzle agent's schema"
  ],
  guardrails: [
    "Non-blocking: failure to enrich MUST NOT block user signup flow.",
    "Respect consumer-email allow-list (gmail, icloud, proton, etc.) — do not scrape for those.",
    "Rate-limit: 1 req/5s per domain to avoid Clearbit bans.",
    "Commit: 'feat(m0): signup-signals-agent + webhook route'"
  ]
})
```

---

## T8 — c1v-reorg (Wave 1, RESUMING ~40% DONE) — PROMOTED FROM DRAFT

**Scope:** Collapse granular M2/M3/M4 phase files into 3×8 submodule structure (3 submodules × 8 KBs = 24 target files) per v1 §5 + `plans/reorg-mapping.md`. Also owns atomic cross-tree renumber per v2 §0.4 (both schema dir + KB dir rename in one merge).

**Resume state:** Mapper agent already shipped `plans/reorg-mapping.md` + 3 az-sweep files + pre-reorg snapshot at `apps/product-helper/tmp/pre-reorg-snapshots/`. Three agents remain: refactorer, agent-rewirer, verifier. ALSO: the cross-tree renumber (§0.4) adds scope beyond v1 T8 — requires `scripts/verify-tree-pair-consistency.ts`.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-reorg",
  agent_type: "tech-lead",
  description: "RESUME from 40% — mapper done. Apply 3×8 reorg per plans/reorg-mapping.md + atomic cross-tree renumber (schema dir + KB dir) per v2 §0.4. Ship cross-tree consistency verifier.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.md §5 (3×8 reorg) + plans/c1v-MIT-Crawley-Cornell.v2.md §0.4 (atomic renumber)",
    authoritative_mapping: "plans/reorg-mapping.md (274 lines — mapper output, is source of truth for old→new file moves)",
    pre_reorg_snapshot: "apps/product-helper/tmp/pre-reorg-snapshots/ (rollback baseline)",
    coordination: "T9 (KB hygiene) owns parallel KB-dir renames per §0.4.3. T8 owns schema-dir renames per §0.4.2. BOTH converge on single atomic merge commit.",
    downstream_consumers: ["Every Wave 2+ agent that writes to module-N-<slug>/ paths depends on `t8-wave-1-complete` tag"]
  },
  commit_policy: "one-commit-per-agent-per-deliverable; atomic merge with T9 at Wave-1 close",
  wave: 1,
  blocks: ["wave-2-early", "wave-3-decision"]
})
```

### Step 2: Spawn 4 teammates (parallel — mapper skipped, already done)

```
Agent({
  name: "refactorer",
  subagent_type: "langchain-engineer",
  team: "c1v-reorg",
  goal: "Apply 3×8 reorg: collapse granular M2/M3/M4 phase files into 3-submodule-per-KB structure per plans/reorg-mapping.md. Use git mv (preserve history). Commit per KB.",
  inline_skills: ["langchain-patterns", "code-quality"],
  deliverables: [
    "All moves per plans/reorg-mapping.md executed via git mv",
    "plans/t8-outputs/refactor-diff.md — human-readable summary of all moves",
    "No file content edits — structural only"
  ],
  guardrails: [
    "git mv only. No plain mv, no copy-then-delete.",
    "Do NOT edit content — reorg is structural.",
    "Abort + surface if a file in reorg-mapping.md target path already exists (conflict).",
    "One commit per KB (M2, M3, M4): 'refactor(t8): reorg M<N> to 3-submodule structure'"
  ],
  blocks: ["agent-rewirer", "verifier"]
})

Agent({
  name: "agent-rewirer",
  subagent_type: "langchain-engineer",
  team: "c1v-reorg",
  goal: "Update every import + generate-all.ts registration that references moved paths. Run `grep -r 'module-4/'` etc. post-refactorer and rewire to new paths. Also apply cross-tree renumber per v2 §0.4.2: rename module-4/ → module-4-decision-net/, create module-5-form-function/, module-6-hoq/, module-7-interfaces/, module-8-risk/, module-9-stacks-atlas/.",
  inline_skills: ["langchain-patterns", "code-quality"],
  deliverables: [
    "Every import updated (grep-based sweep)",
    "generate-all.ts MODULE_*_PHASE_SCHEMAS entries rewired to new paths",
    "Cross-tree renumber per v2 §0.4.2 applied (module-4 → module-4-decision-net + stubs for 5/6/7/8/9)",
    "plans/t8-outputs/rewire-report.md — grep + diff summary"
  ],
  guardrails: [
    "Depend on refactorer.",
    "After rewire, `pnpm tsc --noEmit` MUST pass (no broken imports).",
    "generate-all.ts output MUST still produce valid JSON Schemas (sanity check: run it).",
    "One commit per logical layer: renumber + import-sweep + generate-all registration."
  ],
  blocks: ["verifier"]
})

Agent({
  name: "tree-consistency-verifier-script",
  subagent_type: "backend-architect",
  team: "c1v-reorg",
  goal: "Ship scripts/verify-tree-pair-consistency.ts per v2 §0.4.4. 5 exit codes. Runs in CI. Blocks PR merge on any inconsistency.",
  inline_skills: ["api-design", "code-quality"],
  deliverables: [
    "scripts/verify-tree-pair-consistency.ts — exit codes 0-5 per v2 §0.4.4",
    "scripts/__tests__/verify-tree-pair-consistency.test.ts — fixture-based tests for each exit code",
    ".github/workflows/verify-trees.yml — CI wiring"
  ],
  guardrails: [
    "Script MUST be fast (< 5s) — reads directory listings + parses v2 artifact _upstream_refs.",
    "Non-destructive: read-only, exit code only.",
    "Exit codes: 0=consistent, 1=schema/KB tree mismatch, 2=slug mismatch, 3=_upstream_ref broken, 4=generate-all ref broken, 5=MCP ref broken.",
    "Commit: 'feat(t8): cross-tree consistency verifier'"
  ],
  blocks: ["verifier"]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-reorg",
  goal: "Verify T8 exit criteria. Run tree-consistency verifier. Verify generate-all.ts still produces semantically-equivalent output to pre-reorg baseline (per v2 EC-0.2.7). Tag on green.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "scripts/verify-t8.ts — orchestrates tree-consistency + generate-all round-trip",
    "plans/t8-outputs/verification-report.md",
    "scripts/compare-schema-output.ts (shared with T9) — canonical-sort JSON diff via fast-deep-equal",
    "git tag 't8-wave-1-complete' on green"
  ],
  guardrails: [
    "Depend on refactorer + agent-rewirer + tree-consistency-verifier-script.",
    "Coordinate with T9 verifier via SendMessage — atomic merge requires BOTH green simultaneously.",
    "Non-fix.",
    "Tag only on green."
  ]
})
```
