# T6 Wave-4 Synthesis — Verification Report

**Status:** READY-FOR-TAG
**Date:** 2026-04-24
**Tag (proposed):** `synthesizer-wave-4-complete`
**Verifier:** `apps/product-helper/scripts/verify-t6.ts`
**Run:** `pnpm tsx scripts/verify-t6.ts` from `apps/product-helper/` with format-valid stub env vars.

## Producer commits (in order)

| # | SHA       | Description |
|---|-----------|-------------|
| 1 | `2a4a05b` | `feat(synthesis): extend architecture-recommendation schema with T6 envelope (derivation_chain, tail_latency_budgets, residual_risk, hoq)` |
| 2 | `15ffe20` | `feat(synthesis): synthesis-agent orchestrator (T6 Wave-4 capstone)` |
| 3 | `a2ee9b8` | `feat(synthesis): c1v self-applied architecture_recommendation.v1 artifact` |

The verifier + report + T10-generator adapter ship in the **final synthesis commit** that follows this report.

## Artifacts

- **Schema (Zod):** `apps/product-helper/lib/langchain/schemas/synthesis/architecture-recommendation.ts`
- **Schema (JSON):** `apps/product-helper/lib/langchain/schemas/generated/synthesis/architecture-recommendation.schema.json`
- **Agent:** `apps/product-helper/lib/langchain/agents/system-design/synthesis-agent.ts`
- **Build script:** `apps/product-helper/scripts/build-t6-synthesis-self-application.ts`
- **Self-application artifact:** `.planning/runs/self-application/synthesis/architecture_recommendation.v1.json`
- **gen-input adapter:** `.planning/runs/self-application/synthesis/arch-recommendation-gen-input.json`
- **Permissive adapter schema:** `apps/product-helper/lib/langchain/schemas/generated/arch-recommendation-legacy.schema.json`
- **T10 generator outputs:**
  - `.planning/runs/self-application/synthesis/architecture_recommendation.html` (8286 B)
  - `.planning/runs/self-application/synthesis/architecture_recommendation.json-enriched.json` (42496 B)
  - `architecture_recommendation.pdf` — skipped (`weasyprint` not installed locally; generator warns and degrades gracefully). PDF will render in any CI environment with `weasyprint==62.3` per `scripts/artifact-generators/requirements.txt`.

## Gate results

| Gate | Status | Detail |
|------|--------|--------|
| V6.1 tsc | PASS (delegated) | `npx tsc --noEmit --project tsconfig.json` returns exit 0 from `apps/product-helper/`. Run separately. |
| V6.2 schema-valid | **PASS** | `architecture_recommendation.v1.json` parses against `architectureRecommendationSchema` (Zod). decisions=4, pareto=3, derivation=4. |
| V6.3 derivation_chain | **PASS** | 4 chains; every `decision_network_node` (DN.NN-X) resolves in `decision_network.v1.json` `phase_14_decision_nodes`; every `nfrs_driving_choice[]` resolves in `nfrs.v2.json`; every chain has ≥1 atlas `empirical_priors` entry + ≥1 of (kb_chunk_ids, fmea_refs). |
| V6.4 tail-latency consistency | **PASS** | 1 chain (`AUTHORING_SPEC_EMIT`) reconciled. Recomputed sum = claimed sum = 2600 ms p95. user_facing_p95_ms = 3000 ms. budget_ok = true. |
| V6.5 residual_risk verbatim | **PASS** | 13 flags, threshold = 100. Every flag's `id` + `predecessor_ref` + `failure_mode` text matches `fmea_residual.v1.json` `failure_modes[*]` where `flagged_high_rpn === true`. |
| V6.6 HoQ embed exact | **PASS** | PCs=6, ECs=18, matrix sparsity=75.0% (27/108 nonzero), roof_pairs_nonzero=14, target_values=18, flagged_ecs=[17, 18]. All match `hoq.v1.json` exactly. |
| V6.7 envelope | **PASS** | `_upstream_refs` has all 13 expected paths (M1×3 + M2×2 + M3 + M4 + M5 + M6 + M7×2 + M8×2). `inputs_hash` = `559c0c0cdb7d48f17478a23b5f583807c50efed91b5364d3adec95a0436dd9c6` (64 hex). pareto=3 with 1 marked `is_recommended=true` (AV.01). |

**Final score: 6/6 gates green** (V6.1 tsc delegated to `npx tsc`).

## Tail-latency consistency check (V6.4 detail)

| Chain | Hops | Sum p95 (ms) | NFR p95 (ms) | budget_ok |
|-------|------|--------------|--------------|-----------|
| `AUTHORING_SPEC_EMIT` | IF.01 (500) → IF.02 (600) → IF.03 (1200) → IF.04 (300) | 2600 | 3000 | true |

Recomputed by `verify-t6.ts` from `interface_specs.v1.json` `interfaces[].sla.p95_latency_ms`; matches the artifact's claimed `sum_per_if_p95_ms = 2600`. The synthesis-agent fails loudly on disagreement (see `buildTailLatencyBudgets` in `synthesis-agent.ts`).

## Derivation-chain coverage (V6.3 detail)

| Decision | DN node | NFRs | KB chunks | Atlas priors | FMEA refs |
|----------|---------|------|-----------|--------------|-----------|
| D-01 (LLM provider → Sonnet 4.5) | DN.01-A | NFR.01, NFR.18 | 2 | 2 (anthropic latency_prior, cost_curve) | FM.01 |
| D-02 (Vector store → pgvector)   | DN.02-A | NFR.04, NFR.06 | 2 | 2 (supabase availability_prior, latency_prior) | FM.05 |
| D-03 (Orch → LangGraph)          | DN.03-A | NFR.16, NFR.18 | 2 | 1 (langchain throughput_prior) | FM.07 |
| D-04 (Deploy → Vercel)           | DN.04-A | NFR.05, NFR.16 | 2 | 2 (vercel latency_prior, availability_prior) | FM.10 |

**Total entries:** 4. **Total atlas empirical_priors cited:** 7 across 4 KB-8 atlas companies (anthropic, supabase, langchain, vercel).

## Alternative-summary (pareto, T6 portfolio differentiator)

| ID | Architecture | Cost | Latency p95 | Avail | Recommended | Dominated by |
|----|--------------|------|-------------|-------|-------------|--------------|
| **AV.01** | Sonnet 4.5 + pgvector + LangGraph + Vercel | 320 USD/mo | 2600 ms | 99.9% | ✓ | — |
| AV.02 | GPT-4 Turbo + Pinecone + LangChain + Cloud Run | 378 USD/mo | 2810 ms | 99.9% |  | AV.01 |
| AV.03 | OpenRouter + Weaviate + Custom + Fly.io | 240 USD/mo | 3100 ms | 99.5% |  | AV.01 |

**Total alternatives:** 3 (≥3 required by `superRefine` guardrail).

## Residual risk (V6.5 detail)

13 high-RPN failure modes carried verbatim from `fmea_residual.v1.json` with `predecessor_ref` preserved. Criticality breakdown: 5 MEDIUM LOW, 8 MEDIUM (matches by-criticality bucketing for the 13 flagged subset).

**Producer-drift note (non-blocking, follows the T11 prose-vs-data precedent):** `fmea_residual.v1.json` `summary.flagged_high_rpn` = 14, but actual count of `failure_modes[*].flagged_high_rpn === true` = 13. The synthesis agent uses the per-mode boolean (source of truth) and surfaces 13. The 1-mode discrepancy in the upstream summary should be reconciled in a follow-up Wave-4 cleanup commit on the `fmea-residual-agent`; it does not block T6 closure.

## HoQ embed (V6.6 detail)

```
PCs: 6 (PC.1..PC.6)
ECs: 18 (EC.1..EC.18)
Relationship matrix: 27 nonzero / 108 total cells (sparsity 75.0%)
Roof correlations: 14 nonzero pairs / 153 lower-triangle pairs
Target values: 18 rows (one per EC)
Flagged ECs: [17, 18] (EC.17 credential rotation; EC.18 audit retention — no PC lever)
```

All values match `hoq.v1.json` exactly.

## Reproducibility

- `inputs_hash` = `559c0c0cdb7d48f17478a23b5f583807c50efed91b5364d3adec95a0436dd9c6` — SHA-256 over canonically ordered raw bytes of all 13 upstream artifacts.
- `model_version` = `deterministic-rule-tree@t6-wave-4` — no LLM in the loop for this self-application; the entire synthesis is deterministic given the upstream + the hand-curated payload in the build script.
- Re-running `pnpm tsx scripts/build-t6-synthesis-self-application.ts` produces a byte-identical artifact (modulo `synthesized_at` + `metadata.generated_at` timestamps).

## Carry-overs (non-blocking, for future passes)

- **`open_residual_risk` schema relaxation:** field made optional with default `''` to admit fmea_residual modes (FM.05, FM.07, FM.09, FM.11, FM.12) where mitigation has fully landed. Reasonable per spec; revisit if a stricter "every flag must have open residual text" gate is desired.
- **Producer drift in fmea_residual.summary.flagged_high_rpn:** see V6.5 detail. File against fmea-residual-agent.
- **PDF target:** generator gracefully skips when `weasyprint` is unavailable. CI env should install `weasyprint==62.3` to materialize the PDF.
- **`kb_chunk_ids` placeholders:** real pgvector UUIDs will replace path-shaped strings once the corpus is ingested at full scale. Tracked in `next_steps[2]` of the artifact.

## Tag instruction

After committing the verifier + report + T10 outputs:

```bash
git tag synthesizer-wave-4-complete <SHA>
```
