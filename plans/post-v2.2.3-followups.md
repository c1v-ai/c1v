---
name: Post-v2.2.3 Follow-ups
date: 2026-05-04
status: tracking — items captured during v2.2.3 funnel planning
---

# Post-v2.2.3 Follow-ups

Non-blocking work captured during v2.2.3 (Draft Pipeline Funnel) planning. Revisit when there's bandwidth.

---

## Product / Architecture

- ~~**Early-atlas binding**~~ — **REMOVED 2026-05-04 evening: David reversed the prior decision. Atlas now fires from the beginning across all tiers (free + paid), not deferred. The "atlas is paid-tier only" framing is REVOKED across all docs.** The implementation work is now in v2.2.3 scope (early-atlas wiring at intake / draft / preview), not a follow-up.

## UI / Transparency

- **Display thinking tokens in chat UI** — surface Claude's extended-thinking blocks (Opus 4.7 thinking output) alongside the visible answer so users can see the model's reasoning. Especially valuable for big decisions (M4 Decision Network archetype selection, SYN derivation chain). Considerations: (a) streaming UI needs a collapsible "Reasoning" panel pattern, (b) requires `thinking` block enabled in API request + token-budget knob, (c) cost surfaces — thinking tokens are billed; need observability before exposing. Logged 2026-05-04 — add into v2.2.3 if scope allows, otherwise post-funnel.

## Engine / Schema

- **EC-V21-E.14 / Path B closure (canonical name — corrected 2026-05-04 · MAJOR STATUS REVISION 2026-05-04 evening)** — what earlier drafts of this entry called "Wave D agent-emitter rewrite" is actually **EC-V21-E.14 closure inside Wave E**, named in [`plans/c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md) line 111 and chartered as Path B in [`plans/HANDOFF-2026-04-27-v2.2-fixup.md`](HANDOFF-2026-04-27-v2.2-fixup.md) R-V22.A + R-V22.B. There is NO Wave D in v2.2 master plan; the phrase "v2.2 Wave D" referenced in CLAUDE.md is a phantom name. Two distinct Wave Ds exist in the canonical chain: v2.1 Wave D (`td1-wave-d-complete @ bb1f443`, ✅ shipped 2026-04-26, iter-3 API-spec refactor) is **unrelated** to this work.

  **🚨 STATUS CORRECTION (2026-05-04 evening audit):** Earlier versions of this entry claimed "Wave E shipped 3 of 7; 4 remain" and totalled ~20-27 hr remaining. **Both claims were stale.** Disk state + [`plans/v22-outputs/te1/p10-closure-evidence.md`](v22-outputs/te1/p10-closure-evidence.md) + [`plans/v22-outputs/te1/verification-report.md`](v22-outputs/te1/verification-report.md) confirm: **all 7 P10 nodes are substrate-read greenfield refactored** (tag `te1-greenfield-refactor-complete`, EC-V21-E.14 = PASS at the 2026-04-27 TE1 verifier run). The "4 remaining nodes" framing was carried forward from a pre-Wave-E draft and never reconciled. What ACTUALLY remains is the matrix-derivation field emissions + dead-file decommission only — see corrected table + execution plan below.

  **Canonical authority chain:**
  - **EC-V21-E.14** verbatim from v2.2 master plan line 111: *"P10 closure: live-project click-through produces 11-of-11 `project_artifacts` rows in `ready` within the 30s circuit-breaker per artifact. The 7 NEW v2.1 LangGraph nodes (`generate_data_flows`, `generate_form_function`, `generate_decision_network`, `generate_n2`, `generate_fmea_early`, `generate_fmea_residual`, `generate_synthesis`) refactored from re-validators (consume stub) to greenfield generators (read intake + upstream artifacts directly)."*
  - **Path B charter** (R-V22.B): *"Each agent reads FROM the substrate the way M4's decision network reads from M5's morphological matrix. One node, one job, owns its derivation chain end-to-end."*
  - **Owner:** NEW `agent-greenfield-refactor` agent per HANDOFF-2026-04-27 §"Edit 1.4."

  **Canonical 7-node EC-V21-E.14 list (corrected 2026-05-04 evening against `p10-closure-evidence.md`):**
  | # | Node | Module | Path B status | Refactor commit |
  |---|---|---|---|---|
  | 1 | `generate_data_flows` | M1 | ✅ Wave E shipped — calls `evaluateEngineStory('m1-data-flows')` | `4c3c6ff` |
  | 2 | `generate_form_function` | M5 | ✅ Wave E shipped — calls `evaluateEngineStory('m5-form-function')` | `7dfcc36` |
  | 3 | `generate_decision_network` | M4 | ✅ Wave E shipped — calls `evaluateEngineStory('m4-decision-network')` | `acbd9ff` |
  | 4 | `generate_n2` | M7.a | ✅ Wave E shipped — calls `evaluateEngineStory('m7-n2')` | `fac0c00` |
  | 5 | `generate_fmea_early` | M8.a | ✅ Wave E shipped — calls `evaluateEngineStory('m8-fmea-early')` | `1622b20` |
  | 6 | `generate_fmea_residual` | M8.b | ✅ Wave E shipped — calls `evaluateEngineStory('m8-fmea-residual')` | `0f93d65` |
  | 7 | `generate_synthesis` | T6 SYN | ✅ Wave E shipped — calls `evaluateEngineStory('m4-synthesis-keystone')` | `3ecc53a` |

  All 7 nodes follow the substrate-read pattern via shared `_engine-substrate.ts` helper (250 LOC). E2E verified by `intake-graph.live-project.test.ts` 2/2 green. Per-node success-path tests at `apps/product-helper/__tests__/langchain/graphs/nodes/`.

  **Crawley matrix-derivation sites still unpopulated (10 total):**
  - `module-5/phase-2-function-taxonomy.ts` → `po_array_derivation` (1 × `mathDerivationMatrixSchema`)
  - `module-5/phase-3-form-function-concept.ts` → `full_dsm_block_derivations` (9 × `mathDerivationMatrixSchema`)

  **EC-V21-E.14 closure execution plan (revised after 2026-05-04 audit):**
  1. ~~**Refactor 4 remaining nodes** to greenfield generators~~ — **✅ ALREADY COMPLETE per Wave E** (`te1-greenfield-refactor-complete` tag · all 7 nodes refactored, not 3). 0 hr remaining.
  2. **Extend `evaluateEngineStory()` for M5 stories** to emit Crawley-shaped `po_array_derivation` + `full_dsm_block_derivations` alongside the existing `form_function_map.runtime-envelope.v1` — closes the 10 matrix-derivation sites flagged PASS-with-WARN by TC1 EC-V21-C.2 — **~6-8 hr**
  3. **Decommission 3 dead transitional agent files** Wave E left as safety nets — annotate `form-function-agent.ts`, `fmea-early-agent.ts`, `fmea-residual-agent.ts` with `@deprecated do not import`; route test fixtures through the substrate — **~2-3 hr**
  4. **(Optional) Carve narrow narrative agents** for prose-generation slots the substrate can't do — derivation-chain summary + delta_teaser text — **~3-4 hr each, only if UX needs them**

  **Total EC-V21-E.14 closure remaining: ~8-11 hr** (was inflated to ~20-27 hr before the 2026-05-04 audit; Step 1's ~12-16 hr is already done). Plan file should be created at `plans/v2.2-wave-e-ec14-closure.md` (does NOT exist — name it for the canonical EC, NOT "wave-d"). Ship gate per master plan line 110-111: all 11 of 11 `project_artifacts` rows hit `ready` on live-project click-through within 30s circuit-breaker (**already met** per `intake-graph.live-project.test.ts` 2/2 green); all 10 matrix-derivation sites populate from production runs; `tsx scripts/build-all.ts` emits Crawley-valid artifacts end-to-end without Zod parse errors.

  **Default lean (per HANDOFF-2026-04-27 R-V22.A + R-V22.B):** extend the engine substrate (preserves deterministic-math-first invariant per F11/F12 + Rosetta §9.6 substrate-vs-feeder pattern). All 7 already-shipped Wave E refactors are working templates for the matrix-derivation extension — copy any of `generate-data-flows.ts`, `generate-form-function.ts`, etc. and add the new emit fields. Logged 2026-05-04 (revised same day after audit) — does NOT block v2.2.3 funnel ship; v1 draft uses provisional priors and v2 atlas grounding runs alongside **all 7 shipped Path B refactors**.

  **Downstream dependency — Python sidecar adapter chain:** EC-V21-E.14's "extend engine substrate to emit Crawley shapes" change cascades to `services/python-sidecar/orchestrator.py`. The sidecar is the Cloud Run rendering half of D-V21.24 split-platform synthesis: Vercel orchestrates + LLMs; sidecar receives `POST /run-render` per artifact and renders bytes (HTML/PDF/PPTX/XLSX/SVG/MMD) via Python generators at `scripts/artifact-generators/gen-*.py`. The sidecar has **its own legacy adapter functions** (`_adapt_decision_network`, `_adapt_form_function`, `_adapt_hoq` at orchestrator.py:172/260/318) that translate canonical artifact JSON → generator-input shape. The Python generators predate the Crawley schemas; their input shape is frozen. So when Step 2 updates the engine substrate to emit Crawley-shaped matrix-derivation fields, the sidecar's `_adapt_*` helpers must ALSO be updated to either: (a) strip the new fields back out before passing to legacy generators, or (b) extend the generators themselves to consume the matrix-derivation fields and surface them in PDF/PPTX exports as derivation-chain transparency. Option (b) is higher value (paying users see the math provenance + F-citations in their downloads — investor-legible per Build → Show proof → Raise GTM frame) but adds ~6-8 hr to scope — bringing total to **~14-19 hr** (down from the pre-audit ~26-35 hr — Step 1 P10 refactor is already done). Affected generators: `gen-arch-recommendation.py` (PDF/PPTX derivation-chain page), `gen-form-function.py` (XLSX derivation-matrix sheet), `gen-decision-net.py` (XLSX scoring-trace columns). Other sidecar artifacts (FMEA, HoQ, N2) don't carry matrix-derivation fields today and are unaffected by either path.

- **Pre-Crawley legacy agent cleanup (NOT EC-V21-E.14 scope · separate v2.2.4+ concern)** — `decision-matrix-agent.ts` and `interfaces-agent.ts` are wired with live LLM but use pre-Crawley schemas (`decisionMatrixSchema` and the legacy `extractionSchema.interfaces` blob respectively). They serve different graph nodes than the 7 EC-V21-E.14 nodes (decision-matrix-agent serves `generate_decision_matrix` for the FREE go/no-go Scope tile; interfaces-agent serves the legacy `extractInterfaces` path). Refactoring these to engine substrate is a separate "pre-Crawley legacy migration" concern — should NOT be bundled with EC-V21-E.14 closure (different problem: legacy schema migration vs P10 stub-consumer refactor). Estimated ~3-4 hr × 2 = ~6-8 hr. Logged 2026-05-04.
