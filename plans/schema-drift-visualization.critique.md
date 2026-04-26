# Schema-First KB Rewrite + NFR Math Engine — Critique

> Keywords: filename mismatch, schema-first phase template, 13 NFR story spines, confidence-gated auto-fill, decision-tree engine, cross-story conflict resolution, clarification-detector precedent, Phase B/D/E1 scope creep
> Iteration: 1
> Target: `.claude/plans/schema-drift-visualization.md`
> Parent plan: `.claude/plans/schema-mapping-analysis.md` (→ `system-agent-builder-pivot.md`)
> Date: 2026-04-20

---

## Summary

- **Filename lies.** The file at `.claude/plans/schema-drift-visualization.md` contains a plan titled "Schema-First KB Rewrite + NFR Math Engine." The `schema-drift-visualization` slug that David asked me to expand into a plan (Mermaid pair + drift-annotation table) is gone — this file overwrote that stub (or was saved to the wrong path). A future grep for the drift-visualization work lands on an unrelated plan. Rename this to `schema-first-kb-rewrite-and-nfr-engine.md` or split into two files.
- **The clarification-detector precedent halves implementation risk — but not calibration risk.** David is right that `apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts` is the architectural template for the NFR engine. The heuristic-first → LLM-fallback → confidence-gate triad is production-tested. What it doesn't solve is the 13 engines' *rule content* or the calibration dataset — those are the real unknowns, and the plan budgets them lightly.
- **Scope exceeds the parent pivot's Phase B/D/E1 ingredient claim.** The front-matter says "Phase B / Phase D / Phase E1 ingredient." Reality: this plan adds a new runtime (interpreter + audit writer + conflict resolver), a new UI surface ("why this value?" expander + override path), 13 engine rule authorings, 5 schema extensions, hot-deletes 65 files, and rewrites ~30k lines of KB content. That is phase B+D+E1+F+G scale, not a Phase-B ingredient.
- **Load-bearing calibration data doesn't exist.** §2.3 sets threshold = 0.90 based on "Below 80%: false-positives dominate; Above 95%: gate too tight." No dataset cited. §7 Q1 says "calibrate empirically: run on 5 historical projects." Where do 5 historical projects with *labeled correct NFRs* come from? The parent critique V1 already flagged the historical JSONL fixture as unverifiable.
- **Existing-project migration again missing.** Parent critique C7 ("kbStepData trap") and C3 ("`nonFunctionalRequirements` column abandoned") are not acknowledged. Adding `category`, `computed`, `computed_by`, `confidence`, `needs_user_input` fields to every constant row is "additive at schema layer" (§9) but not additive in Postgres JSONB — strict Zod will reject existing rows. No backfill/passthrough spec.
- **Factual spot-checks pass with two corrections.** `11-Phase-8-Constants-Table.md` exists at the cited path. 5 × `cap_theorem.md` copies confirmed across M2/M4/M5/M6/M7 (5 dirs; the 13 × 5 = 65 total needs `md5sum` confirmation before any delete). 7 of 9 schema files verified (`phase_artifact`, `system_scope_summary`, `QFD-Template`, `decision-matrix-template`, `Requirement_Constants_Definition_Template`, `UCBD_Template_and_Sample`, `Requirements-table` — all `.schema.json`). Two are `.json` not `.schema.json`: `FMEA-sample.json` and `interface-matrix-template.json`. Fix the list in §1.

---

## Table of findings

**Structural:**

1. **S1** — Filename/content mismatch. See Summary bullet 1. Rename or split.
2. **S2** — Title ("Schema-First KB Rewrite + NFR Math Engine") merges three goals (§2.1 phase-file template, §2.2 story spines, §2.3 math engine) that have different dependency graphs. S2 is the same double-counting pattern the parent critique flagged: schema-first phase rewrite (Goal A) can ship without the math engine (Goal C); story spines (Goal B) are a prerequisite to the engine but not to the template. The 27-day estimate bundles all three.
3. **S3** — `_nfr-stories/` root (§2.2) is a new planning-level directory introduced without a home. Does it live under `New-knowledge-banks/`? A sibling? The physical layout decision is deferred; it should be stated, because all phase files reference `_nfr-stories/00-STORY-INDEX.md` and link rot is cheap to prevent now.
4. **S4** — Goal B's rename table (§2.2) collapses `software_architecture_system.md` into stories 03/04/13 by dissolution. That content-splitting is a 1–2 day task by itself (per-section routing + de-duplication) but is budgeted inside §8 Phase δ's 2-day "delete duplication."

**Sequencing / dependency:**

5. **Q1** — Phase α (6 days, spines) and Phase β (7 days, engines) are serial in §8 but §2.2 says each spine "pairs with a placeholder `engine.json`." The placeholder either is empty (in which case α doesn't unblock anything) or has rule stubs (in which case α and β overlap and the serial estimate is wrong). Pick one.
6. **Q2** — Phase γ (8 days, rewrite 30,000 lines across M1–M7 phase files) is treated as independent of α/β. But every phase file's §4 "NFR Story Beats" references stories by ID — it depends on Phase α being complete for IDs to stabilize. Draw the dep.
7. **Q3** — Phase ε (4 days, integrate auto-fill into product-helper) assumes a LangGraph node exists at every NFR-writing phase. §5 Tier-A schemas and §5 bridge nodes from the parent critique are prerequisites — not mentioned here.
8. **Q4** — Phase δ deletes 65 files + edits 5 schemas in 2 days. No mention of `.git`-history preservation (stash-first / revert-able commit), no test-suite run between edits and deletes, no rollback plan. High-blast-radius operation on a short leash.

**Scope / completeness:**

9. **C1** — **Confidence calibration has no data.** §2.3's 0.90 justification is rhetorical. §7 Q1's "5 historical projects" doesn't exist per parent critique V1. Either (a) build 10–20 hand-labeled `{inputs, expected_output}` golden tests per story as part of Phase β (recommendation — see §11 below), or (b) state that 0.90 is a placeholder to be re-calibrated after first production run.
10. **C2** — **Confidence modifier arithmetic exceeds 1.00 then clamps.** §5.3 audit example: base 0.88 + 0.08 (regulatory) + 0.05 (cross-story) = 1.01 → `final_confidence: 1.00`. Clamping at the ceiling destroys monotonicity and ties. Either (a) enforce `Σ modifiers ≤ 1 - base_confidence`, or (b) switch to log-odds / multiplicative modifiers so the space is bounded by construction.
11. **C3** — **Per-field thresholds contradict "0.90 midpoint."** §3.1 uses 0.85 (4 fields), 0.88 (2), 0.90 (5), 0.92 (1), 0.95 (1). §2.3 says 90% is the conservative midpoint. Either justify each variance (why SLO_WINDOW needs 0.95 but RATE_LIMIT_RPM is OK at 0.85) or collapse to one default + per-story override pattern.
12. **C4** — **Rule-volume estimate is optimistic.** §8 Phase β: "13 engine files × ~200 lines = ~2,600 lines." A realistic `story-03-latency-budget` branches on user_class (5 values) × flow_class (4) × regulatory (5) × data_sensitivity (3) = 300 cells before modifiers. 200 lines per story = very coarse tree. Either budget is too low or coverage is too sparse. Pick.
13. **C5** — **"Additive fields" is only true at schema layer.** §9 claims "all additions are additive fields on the 5 schemas. Breaking any existing artifact shape: NO." Adding `category`/`computed`/`computed_by`/`confidence`/`needs_user_input` to every constants row breaks strict-mode Zod parsing on existing rows stored in `project_data.intake_state.kbStepData.*`. Either mark fields optional everywhere (weakens the contract) or specify a backfill script (absent).
14. **C6** — **Drizzle not addressed.** Parent plan is `schema-mapping-analysis` — Drizzle↔Zod drift. This plan adds fields to JSON schemas; those artifacts live in Postgres JSONB columns. §9 disclaims: "NFR-specific Drizzle column overhaul — separate plan." But the same migration question (where do auto-filled values write? column or JSONB?) determines whether the engine even has a write target.
15. **C7** — **Audit-trail storage model unspecified.** §5.3 example writes `"target_artifact": "module_2_requirements/constants_table.json"` — a filesystem path. Product-helper persists artifacts in Postgres. Where does `decision_audit.jsonl` live? Side-car table? S3 object? New JSONB column? Unspecified.
16. **C8** — **M7 RPN re-tune loop is hand-waved.** §4 intro: "10 of 13 stories have an M7 RPN → upstream re-tune loop." §2.2 mentions `rpn_threshold`. Nothing specifies what "re-tune target in M5" means: mutate QFD numeric targets? Re-run the phase agent? Raise a STOP GAP back in M5? This is a load-bearing closed-loop control claim.
17. **C9** — **Cross-story priority (§5.5) asserted without rationale.** Six priority rules appear as a table. Why story-03 beats story-08 for `RESPONSE_BUDGET_MS`? Why does story-04 own `MAX_RETRIES` over story-06? Either add a one-line rationale per row or down-rank this to "initial proposal, subject to calibration."

**Fidelity / verification:**

18. **V1** — §1 says 9 schema files exist. Verified 7 of 9; two use `.json` not `.schema.json` (`FMEA-sample.json`, `interface-matrix-template.json`). Correct the list in §1 and note the inconsistent extension.
19. **V2** — §1 claim "13 NFR sub-KBs × 5 module directories = 65 files with identical md5 hashes." Spot-verified 5 copies of `cap_theorem.md` across M2/M4/M5/M6/M7. Full `md5sum` audit of all 65 pairs has not been done here — before Phase δ deletes, run `md5sum` and commit the digest list as evidence.
20. **V3** — §6 worked example uses artifact path `<project>/module-2-requirements/constants_table.json` (kebab), but §5.3 audit example uses `module_2_requirements/constants_table.json` (snake). Corpus convention is snake_case (verified at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/2-dev-sys-reqs-for-kb-llm-software/`). Fix §6.
21. **V4** — §2.2's "canonical `story-10-api-contract` at M6 Steps 2, 8, 9" claim should be spot-checked against M6 step files. The analogous M7 terminus for story-10 is "P1 only" — no P4 (actor-based failure modes) tie. If actors without contracts generate failure modes, story-10 has a real M7 tie missing.
22. **V5** — §8 Phase γ: "M2: 14 phase files × ~450 lines = ~6,300 lines." Spot-check the current M2 phase file count before committing to ~450 lines/file. Undercounting phase files → estimate slips.

**Missing / under-specified:**

23. **M1** — **Acceptance criteria per phase undefined.** "Done" for Phase α = 13 spines written? 13 spines + 13 engine.json stubs pass JSON-schema validation? 13 spines + golden tests? No criterion stated.
24. **M2** — **Appendix A ("full story-spine template") is a stub** but is referenced by §2.2 as the place the 7-section shape lives. The template is load-bearing: it determines what Phase α produces. Draft before Phase α starts.
25. **M3** — **Appendix B ("28-constant auto-fill mapping") is a stub** but §3.1 references it as the authoritative table. The 28-constant list *is* the Phase α + β scope surface.
26. **M4** — **Appendix E ("engine interpreter pseudocode") is a stub**. This is the single highest-leverage gap and the one where the clarification-detector.ts precedent resolves the unknown (see §11 below).
27. **M5** — **§7 Q1 is self-answering** — per-story + per-project configurable is already stated in §2.3. Promote to stated answer.
28. **M6** — **§7 Q3 ("UX for below-threshold prompts") duplicates parent critique C5** ("dual-view UI no spec"). Inherited gap, unflagged.
29. **M7** — **§7 Q7 ownership is team-scale** ("1 engineer + 1 domain SME per story" × 13 = 14–26 person-slots) but David works solo + subagents. Reconcile as "subagent-authored drafts, David reviews" or name real humans.
30. **M8** — **Override semantics under-specified.** §5.3 audit schema has `user_overrideable: true` and `override_history: []`. What happens when the user overrides, then Phase N+1 re-evaluates with different upstream inputs — does the override survive, or does the engine re-fire and surface a new proposal? Stale-override policy missing.

**Parent-plan alignment:**

31. **P1** — Parent critique **C5** (no UI spec for dual-view page) is not mentioned as inherited; this plan's §7 Q3 is the same question.
32. **P2** — Parent critique **C7** (kbStepData migration trap) is not mentioned as inherited; this plan's §9 punts to "separate plan" without citing C7.
33. **P3** — Parent critique **V3** ("dataEntitySchema vs databaseEntitySchema are intentional, not drift") is silent; relevant because §6 worked example writes to `constants_table` which is adjacent to the dataEntitySchema hierarchy.
34. **P4** — Parent pivot critique **R6** ("M→recommender seam is load-bearing") — this plan *is* the seam for NFR auto-fill into Decision Matrix / QFD targets. Claim it or disown it.

---

## Section-by-section

### §1 — Observation that triggered the rewrite

Strong opening. The inverted-pyramid diagnosis is correct and falsifiable. Two small corrections:
- List the schema-file extensions consistently (7 are `.schema.json`, 2 are `.json`). See V1.
- "65 duplicate files with identical md5 hashes" needs the digest audit before Phase δ lands. See V2.

### §2.1 — Goal A (schema-first template)

Good. The 6-section canonical shape is clear and the 1–3-load-bearing / 4-sometimes / 5-on-violation / 6-optional hierarchy is the right read-ordering for an agent. Suggest: make section 1.1's "interface in TypeScript-ish shorthand" rule *always fall back to Zod shorthand* since the rest of the codebase is Zod, not JSON-Schema.

### §2.2 — Goal B (story spines)

The rename table is load-bearing and correctly reframes sub-KBs by the decision they drive, not the technology they describe. But:
- The `_nfr-stories/` root has no filesystem home (S3).
- "Story Beat blocks are self-contained enough that the LLM can act without chasing the spine" is a strong claim. In practice the beat is ~2–4 paragraphs; most real decisions need the full spine's scoring rubric. Expect beat-inlining to grow or the "self-contained" claim to break. Set an explicit rule: beats must include the full rule catalog for decisions that fire in that phase; narrative paragraphs stay in the spine.

### §2.3 — Goal C (math engine)

This is the load-bearing section. Issues in order of severity:
- C1 (calibration data).
- C2 (modifier arithmetic can exceed 1.0).
- C3 (per-field thresholds don't match "0.90 midpoint" prose).
- **New issue:** The example rule table uses `"regulatory_refs_contains": "PCI-DSS"` as a predicate shorthand. Is this a DSL? A JSON-path extension? The interpreter has to understand `_contains` suffix semantics. Spec the predicate language.

### §3 — Canonical phase-file template

Fine. Worked example below matches. One nit: section 4.2's "self-contained enough to decide in-phase" contradicts §2.2's spine-as-canonical-source. Reconcile per §2.2 note above.

### §4 — NFR story matrix

The matrix is useful as-is. Claim to verify (V4): story-10's M7 terminus. Claim to spec (C8): what "re-tune target in M5" does when an M7 RPN exceeds threshold.

### §5 — Math engine detail

Covered in C1–C9 above. Highest-value additions:
- §5.2 modifier table: add a "combined cap" rule (C2).
- §5.5 priority table: add rationale per row (C9) or mark as provisional.
- New §5.6 needed: "Predicate language and evaluator." Spec the DSL that `"regulatory_refs_contains"` / `"if": {...}` uses.

### §6 — Worked example

Strong and grounded. Fix snake/kebab path (V3). Inline `.schema.json` shorthand reflects the Goal-A pattern — good.

### §7 — Open questions

Two are self-answering (M5), one is inherited (M6), one is team-scale (M7). Trim to the three genuinely-open ones: Q2 (missing modifier candidates), Q5 (surface substantial cross-story disagreements?), Q6 (engine versioning + migration).

### §8 — Migration plan

Main issue: estimates. Phase γ at 3,750 lines/day and Phase β at 2,600 lines of rule data in 7 days are both optimistic if done by hand; defensible only with a specific LLM-pipeline spec. Either:
- Add a "Phase γ pipeline" sub-section naming the subagents + token budget + review cadence (makes the number defensible), or
- Re-budget γ to ~15 days.

Phase δ rollback plan missing (Q4).

### §9 — Commitments

Last bullet of "What this plan does NOT commit to" — "Breaking any existing artifact shape — all additions are additive fields" — is wrong in the runtime sense (C5). Either soften to "additive at schema definition layer" or add backfill commitment.

---

## §11 — Leverage path: clarification-detector.ts as the NFR engine template

David's precedent table is correct. What follows formalizes it into a plan-level change.

### Verified file location

Canonical file: `apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts` (273 lines). User's paste header cited `apps/system-helper/...` — that path does not exist. The closing paragraph's `apps/product-helper/...` path is the real one. The NFR engine (per plan §8 Phase ε) also lives in `apps/product-helper`, so no cross-app boundary is crossed. Good.

### Type-shape mapping

| `ClarificationAnalysisSchema` field | NFR engine output equivalent |
|---|---|
| `isVague: boolean` | `needs_user_input: boolean` |
| `confidence: number [0,1]` | `final_confidence: number [0,1]` |
| `reason: string` | `matched_rule_id: string` + `modifiers_applied[]` summary |
| `suggestedFollowUp?: string` | `computed_options[0].value` + question hook |
| `extractedInfo: string[]` | `inputs_used: Record<string, {value, source_artifact, source_field}>` |

New fields the NFR engine adds (not in clarification-detector): `target_artifact`, `target_field`, `value`, `units`, `story_id`, `engine_version`, `override_history[]`, `suppressed_by?`.

### Runtime-shape mapping

Clarification-detector shape: `analyze(question, answer) → heuristicCheck(question, answer)` first; if `confidence >= 0.9` return early; else `llmAnalysis(question, answer)`.

NFR engine generalization:

```ts
async evaluate(decision: DecisionRef, context: ResolvedContext): Promise<EngineOutput> {
  const ruleResult = this.ruleTreeCheck(decision, context);   // deterministic
  if (ruleResult.final_confidence >= decision.auto_fill_threshold) return ruleResult;
  if (!decision.llm_assist) return ruleResult;                 // surface-to-user path
  return this.llmRefine(decision, context, ruleResult);        // optional LLM second-opinion
}
```

Same three-stage shape. Same `cheapLLM` tier. Same Zod-validated output schema. Same threshold-gate pattern.

### Threshold defaults — adopt the two proven anchors

Clarification-detector has two live thresholds:
- **0.90** — heuristic-confident-enough-to-skip-LLM gate (line 105).
- **0.75** — minimum-confidence-to-request-clarification (`shouldRequestClarification`, line 274).

Adopt directly in NFR engine:
- **0.90** = `auto_fill_threshold` default (matches plan §2.3).
- **0.75** = `surface_threshold` — below this, don't even offer computed options; ask the user blind with no pre-filled rationale. Resolves §7 Q1 partially by grounding the floor.

### Phase β re-budget (7 days → same 7 days, different weights)

Plan §8 Phase β = 7 days for "13 engine files × ~200 lines + interpreter ~500 LOC." With the precedent in place, realistic split:

| Sub-task | Days | Notes |
|---|---|---|
| Extract generic `HeuristicThenLLM<TInput, TOutput>` base class from clarification-detector | 0.5 | Parameterize over input/output types, confidence thresholds, rule-tree evaluator |
| `ContextResolver` — walks upstream artifacts, extracts typed inputs per rule declaration | 1 | New capability; no precedent |
| `AuditWriter` — appends to `decision_audit.jsonl` (or Postgres equivalent per C7) | 0.5 | Shape matches clarification-detector output + new fields |
| `ConflictResolver` — applies §5.5 priority table | 0.5 | Small addition |
| Predicate-language evaluator (`_contains`, `_in`, range predicates) | 0.5 | Covers new §5.6 spec |
| 13 `engine.json` rule authoring | 3 | Real unknown; actual rule-coverage depth sets this |
| Golden-test calibration dataset (10 labeled inputs × 13 stories = ~130 tests) | 1 | Resolves C1 calibration-data gap |

**Total: 7 days — same budget; 4 days now on infrastructure (down from implied 1–2), 4 days on rule authoring + calibration.** Infrastructure risk drops; authoring risk surfaces.

### Plan changes to make

1. **Rename Appendix E** from "Engine interpreter pseudocode (~500-LOC TypeScript module)" to "Engine interpreter — generalization of `apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts`." Include the type-shape table and runtime-shape diagram above.
2. **Add §5.6 "Predicate language."** Spec the DSL that `"if": {...}` rule bodies use.
3. **Add §5.7 "Golden-test calibration dataset."** State: 10 labeled `{inputs, expected_output}` per story = 130 tests, hand-written during Phase β, lives under `apps/product-helper/tests/nfr-engine/fixtures/`, runs on every engine.json change.
4. **Resolve §7 Q1** partially: 0.90 default adopted from clarification-detector precedent; 0.75 surface-floor added; remaining calibration deferred to golden-test run on v0.
5. **Add a new "Related implementations" section** to §1 so the precedent is surfaced before §2.3 introduces the engine. Readers see "we already run this pattern in production" before they see the scoring-function proposal.

### What the precedent does NOT solve

- Rule content for the 13 decisions. Still requires domain work per story.
- Calibration dataset construction. Golden tests have to be hand-labeled.
- Cross-story conflict resolution. Not in clarification-detector's scope.
- Audit storage model. C7 gap is independent of the precedent.
- UI for "why this value?" and override path. §7 Q3 gap is independent.

So: halve the infrastructure risk. Don't touch the calibration or UX risk.

---

## Recommendation ordering

In order of impact × ease (highest first):

1. **Rename the file** (S1). 10 seconds. Stops future confusion.
2. **Fold the clarification-detector precedent into Appendix E + §5 + §1** (this §11). ~1 hour. Sets realistic engineering risk for reviewers.
3. **Draft Appendix A (story-spine template) before Phase α starts** (M2). ~2 hours. Unblocks Phase α.
4. **Draft Appendix B (28-constant auto-fill mapping)** (M3). ~3 hours. Pins Phase α scope.
5. **Write §5.6 predicate-language spec** (C9/§5 note). ~1 hour. Prerequisite for Phase β.
6. **Resolve or re-rank §7 questions** — trim Q1/Q3/Q7, sharpen Q2/Q5/Q6. ~30 min.
7. **Confidence arithmetic fix** (C2) — pick a bounded composition rule. ~30 min.
8. **Per-field threshold consolidation** (C3). ~30 min.
9. **Phase γ pipeline spec or re-budget** (§8 / Q2). ~1 hour either way.
10. **Migration/rollback plan for Phase δ** (Q4 / C7). ~1 hour.

Items 1–2 are blocking for David's review credibility. Items 3–5 are blocking for Phase α/β start. Items 6–10 can land during phase review gates.

---

*Critique v1. No code or plan edits made. Awaiting David's call on which recommendations to adopt before revising the target plan.*
