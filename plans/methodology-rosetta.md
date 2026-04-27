---
name: Methodology Rosetta — Cornell ↔ Three-Pass ↔ Crawley
purpose: "Single-page translation between the four vocabularies in c1v: eCornell linear flow, three-pass canonical SE order, Crawley schema layer, and module-number folder layout on disk. Use this when the docs feel disjointed."
companion_to:
  - "system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md (canonical three-pass argument)"
  - "plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md (Crawley schema curation)"
  - "plans/c1v-MIT-Crawley-Cornell.v2.2.md (current execution plan)"
  - "plans/public-company-stacks-atlas.md (KB-9 Atlas plan + tier policy + research pipeline)"
  - "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/01-phase-docs/PIPELINE.md (scraper → curator handoff)"
author: "Bond"
created: "2026-04-27"
---

# Methodology Rosetta

> **Why this doc exists.** c1v carries four vocabularies in parallel: the eCornell linear sequence (what customers learned), the three-pass canonical SE order (what the methodology-correction doc argues for), the Crawley textbook schema layer (what REQUIREMENTS-crawley.md curates), and the M1–M8 folder/module numbers on disk (what the code references). They describe **the same pipeline** but with different labels. This is the translation table.

---

## 1. The four vocabularies, side by side

> The first 4 columns are method/sequence vocabularies (Cornell linear / three-pass / Crawley / disk-module). The 5th column — **Empirical-prior anchor (KB-9 Atlas)** — is **orthogonal**: a vertical evidence substrate consumed at multiple Pass-3 phases. See §9 for the full provenance-plane explanation; the column entries here just point at the binding sites.

| Step | eCornell linear (customer-facing) | Three-pass canonical (`METHODOLOGY-CORRECTION.md` §2) | Crawley schema (`REQUIREMENTS-crawley.md` §1) | Module on disk | Empirical-prior anchor (KB-9 Atlas) |
|---|---|---|---|---|---|
| 1 | Actors & Roles | **P1.1** Actors + roles | — | M1 phase-1 | — |
| 2 | Context Diagram | **P1.2** Context diagram | — | M1 phase-2 | — |
| 3 | Use Cases | **P1.3** Use cases | — | M1 phase-3 | — |
| 4 | — | **P1.4** Data flows (BEFORE decomposition) | — | M1 phase-2.5 (T4a `data_flows.v1.json`) | (downstream consumer — chain-budget priors at step 15 read latencies seeded from this artifact) |
| 5 | Functional Decomposition | **P1.5** Scope tree / FDF | — | M1 phase-3 / M3 setup | — |
| 6 | **FFBD** | **P1.6** FFBD on FDF leaves | (Crawley supplement: `module-3.decomposition-plane.v1`) | M3 phase-6 | — |
| 7 | N2 / Interfaces | **P1.7** N2 matrix | — | M7.a phase-N2 (T4a `n2_matrix.v1.json`) | — |
| 8 | — (Cornell put FMEA terminal at M8) | **P1.8** FMEA v1 (instrumental — fires HERE, not at the end) | — | M8.a `fmea_early.v1.json` | — |
| 9 | Functional Requirements | **P2.9** FRs from FFBD + UCs | — | M2 phase-FR | — |
| 10 | NFRs | **P2.10** NFRs from FMEA v1 + data flows | `module-2.requirements-crawley-extension.v1` (4-stakeholder, 6-need, Kano, value-loop, 5-criteria-goals) | M2 phase-NFR (T11 v2.1 resynth) | — |
| 11 | Constants / Targets | **P2.11** Constants from NFRs | (subset of M2 extension) | M2 phase-constants | — |
| **NEW** | — | (folded into P3) | **5 Crawley M5 phases — the form-function bridge:**<br/>1. `module-5.phase-1-form-taxonomy.v1`<br/>2. `module-5.phase-2-function-taxonomy.v1` (PO array)<br/>3. `module-5.phase-3-form-function-concept.v1` (9-block DSM)<br/>4. `module-5.phase-4-solution-neutral-concept.v1` (morphological matrix)<br/>5. `module-5.phase-5-concept-expansion.v1` (Level-1/2 expansions, clustering) | M5 (NEW module — didn't exist in Cornell) | — |
| 12 | (implicit in "Decision Matrix") | **P3.12** Alternatives | (M5 phase-4 morphological matrix supplies the alternative space) | M4 phase-1 inputs | — |
| 13 | **Decision Matrix** (1 step in Cornell) | **P3.13** Performance Decision Matrix | **3 Crawley phases replace the 1-step matrix:**<br/>• `module-4.decision-network-foundations.v1` (decisions / constraints / metrics / decision_dsm / topology)<br/>• `module-4.tradespace-pareto-sensitivity.v1` (Pareto, fuzzy-Pareto, sensitivity, 4-quadrant organization)<br/>• `module-4.optimization-patterns.v1` (6 patterns, NEOSS composition, solver kinds, value function) | M4 (3 phases) | **`module-4.phase-19-empirical-prior-binding`** — every score in M4 phase-14 must appear here with `bound_to.source ∈ {kb-8-atlas, kb-shared, nfr, fmea, inferred}`. `provisional: true` if Atlas corpus < 7 entries for archetype (per v1 R2 ruling 2026-04-23). Code: [`schemas/module-4/phase-19-empirical-prior-binding.ts`](../apps/product-helper/lib/langchain/schemas/module-4/phase-19-empirical-prior-binding.ts). |
| 14 | QFD / HoQ | **P3.14** QFD / HoQ (WHATs ← FRs+NFRs, HOWs ← winner's ECs) | — | M6 (HoQ) | `module-6-hoq.phase-6-competitive-benchmarks` reads peer entries by `archetype_tag`. Code: [`schemas/module-6-hoq/phase-6-competitive-benchmarks.ts`](../apps/product-helper/lib/langchain/schemas/module-6-hoq/phase-6-competitive-benchmarks.ts); agent comment at `hoq-agent.ts:12` ("KB-8 archetypes for competitive bench"). |
| 15 | **Interfaces** | **P3.15** Interface specs (producer→consumer contracts) | — | M7.b `interface_specs.v1.json` | `interface_specs.chain_budgets[].p95_ms` cite `latencyPriorSchema` (scalar `result_shape`); per-vendor IF availabilities cite `availabilityPriorSchema`. Code: [`schemas/atlas/priors.ts`](../apps/product-helper/lib/langchain/schemas/atlas/priors.ts). |
| 16 | (Cornell M8 — terminal FMEA) | **P3.16** FMEA v2 (residual, on chosen architecture) | — | M8.b `fmea_residual.v1.json` | — |
| 17 | — (Cornell stops at "interfaces") | **P3.17** Architecture recommendation → code | — | T6 synthesizer keystone (`architecture_recommendation.v1.json`) | `decisions[].empirical_priors.atlas_entry_id` carries provenance into the keystone. **Live evidence:** [`architecture_recommendation.v1.json`](../apps/product-helper/.planning/runs/self-application/synthesis/architecture_recommendation.v1.json) D-01 cites *"KB-8 atlas anthropic#latency-prior p95=1100ms"*; D-02 cites *"KB-8 atlas supabase#availability-prior 99.99"*. Code: [`agents/system-design/synthesis-agent.ts:108`](../apps/product-helper/lib/langchain/agents/system-design/synthesis-agent.ts#L108). |

---

## 2. The mental shift in one sentence

> **Cornell's linear M1→M7 collapses the SE Vee's left leg into a line. Three-pass restores the leg. Crawley adds a form-function bridge (M5) that Cornell never had, and explodes Cornell's 1-step "Decision Matrix" into a 3-phase decision network with Pareto + optimization patterns.**

That's the whole reason the docs ("system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md (canonical three-pass argument)" AND "plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md (Crawley schema curation)") feel disjointed: M5 has no Cornell precedent, and M4 changed shape under the same name.

---

## 3. Unified flow diagram

```mermaid
flowchart TD
  subgraph P1["PASS 1 — Functional understanding"]
    A1[M1 Actors/Context/UCs]
    A2[M1 Data Flows]
    A3[M1/M3 Scope Tree + FDF]
    A4[M3 FFBD]
    A5[M7.a N2 Matrix]
    A6[M8.a FMEA v1 — INSTRUMENTAL]
    A1 --> A2 --> A3 --> A4 --> A5 --> A6
  end

  subgraph P2["PASS 2 — Requirements synthesis"]
    B1[M2 FRs from FFBD+UCs]
    B2[M2 NFRs from FMEA v1 + Data Flows<br/>+ Crawley M2-extension: 4-stakeholder/Kano/goals]
    B3[M2 Constants from NFRs]
    B1 --> B2 --> B3
  end

  subgraph P3["PASS 3 — Decision"]
    C0[M5.1 Form Taxonomy]
    C1[M5.2 Function Taxonomy + PO Array]
    C2[M5.3 Form-Function Concept + 9-block DSM]
    C3[M5.4 Solution-Neutral Concept + Morphological Matrix]
    C4[M5.5 Concept Expansion + Clustering]
    D1[M4.1 Decision Network Foundations]
    D2[M4.2 Tradespace + Pareto + Sensitivity]
    D3[M4.3 Optimization Patterns + NEOSS + Solver]
    E1[M6 QFD / HoQ]
    E2[M7.b Interface Specs]
    E3[M8.b FMEA v2 — RESIDUAL]
    E4[T6 Architecture Recommendation]
    C0 --> C1 --> C2 --> C3 --> C4
    C4 --> D1 --> D2 --> D3
    D3 -.->|Pass-3-to-Pass-2 feedback loop| C4
    D3 --> E1 --> E2 --> E3 --> E4
  end

  A6 --> B1
  A2 -.-> B2
  A6 -.-> B2
  B3 --> C0
  C3 -.->|alternatives| D1
  C2 -.->|DSM seed| D1
  C4 -.->|clusters| D1

  subgraph ATLAS["KB-9 Atlas — provenance plane (orthogonal substrate, NOT a phase)"]
    KB9[15 companies × 4 prior types<br/>latency / availability / throughput / cost-curve]
    P19[M4 phase-19 binding manifest<br/>bound_to: kb-8-atlas / kb-shared / nfr / fmea / inferred]
    KB9 --> P19
  end

  D1 -. score citations .-> P19
  E1 -. competitive benchmarks .-> KB9
  E2 -. chain-budget priors .-> KB9
  E4 -. empirical_priors[] .-> P19

  classDef p1 fill:#cfe2ff,stroke:#0066cc;
  classDef p2 fill:#fff3cd,stroke:#cc9900;
  classDef p3 fill:#d4edda,stroke:#28a745;
  classDef atlas fill:#f8d7da,stroke:#a02030;
  class A1,A2,A3,A4,A5,A6 p1
  class B1,B2,B3 p2
  class C0,C1,C2,C3,C4,D1,D2,D3,E1,E2,E3,E4 p3
  class KB9,P19 atlas
```

---

## 4. The two structural changes that broke Cornell linearity

### 4.1. M5 is a NEW module Cornell didn't have

Cornell jumped from FFBD (M3) directly to Decision Matrix (M4). Crawley inserts 5 phases between them. The reason: Cornell's "Decision Matrix" assumed alternatives drop from the sky. They don't. Crawley's M5 generates alternatives by:

1. Cataloguing physical forms (Phase 1 Form Taxonomy)
2. Cataloguing functions including the PO array (Phase 2 Function Taxonomy)
3. Mapping form↔function with the 9-block DSM (Phase 3)
4. Synthesizing solution-neutral concepts via morphological matrix (Phase 4) ← **THIS is where alternatives come from**
5. Expanding the chosen concept to Level 1 + Level 2 (Phase 5)

Without M5, "Decision Matrix" can't fire — it has no alternatives column.

### 4.2. M4 grew from 1 step to 3 phases

Cornell: "score 3-5 alternatives on 5-7 criteria, pick the winner." 1 spreadsheet.
Crawley: "decisions / constraints / metrics / DSM / Pareto frontier / sensitivity / 4-quadrant decision-organization / Pattern selection / NEOSS composition / solver choice / value function". 3 phases of structured analysis.

Why: portfolio-grade architecture math (queueing latency, availability calculus, cost optimization) requires the structured network. The 1-step matrix can't carry it.

---

## 5. Customer-facing sequence (what the c1v product UI shows)

When a customer submits an app idea, this is what they experience — Cornell linear-feeling, three-pass under the hood:

1. **"Tell us about your system"** → Pass 1.1–1.5 (M1 actors / context / UCs / data flows / scope tree)
2. **"Here's your function block diagram"** → Pass 1.6 (M3 FFBD)
3. **"Here's how your components talk"** → Pass 1.7 (M7.a N2 matrix)
4. **"Here's what could go wrong"** → Pass 1.8 (M8.a FMEA v1 — instrumental, surfaces failure modes BEFORE NFRs are written)
5. **"Here are your requirements"** → Pass 2.9–2.11 (M2 FRs / NFRs / constants — informed by FMEA v1)
6. **"Here are your form-function alternatives"** → Pass 3, M5.1–5.5 (form-function bridge — the morphological matrix in M5.4 generates the alternative space)
7. **"Here's the architecture decision network"** → M4.1–4.3 (decision network → Pareto+sensitivity → optimization patterns)
8. **"Here's the priority matrix"** → M6 (HoQ)
9. **"Here are the interface contracts"** → M7.b (interface specs)
10. **"Here's residual risk on the chosen architecture"** → M8.b (FMEA v2)
11. **"Here's the recommendation with derivation chain"** → T6 synthesizer (architecture_recommendation.v1.json)

Customer sees a linear journey. Engine runs three-pass with Crawley's structural layer.

---

## 6. When you read what doc

| If you're reading… | …treat it as the source for… | …translate other vocabularies via |
|---|---|---|
| `c1v-MIT-Crawley-Cornell.v2.1.md` (master plan) | What's in v2.1 ship gate; ECs; cost model; locked decisions | this doc §1 |
| `c1v-MIT-Crawley-Cornell.v2.2.md` (current stub) | Wave C + Wave E scope, day-0 inventory, ship gate | this doc §1 |
| `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` | Why three-pass beats linear; INCOSE/NASA alignment; rework calculus | this doc §3 + §4 |
| `plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md` | Zod schema shapes for the 10 Crawley schemas; extension-point matrix; mathDerivationMatrixSchema (Option Y) | this doc §1 (rows where "Crawley schema" column is non-empty) |
| `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/` | KB content the runtime retrieves | folder numbers map to disk-module column in §1 |
| `plans/v2-release-notes.md` | What shipped in Wave 1–4 (v2) | this doc §1 (rows where "Module on disk" column has a v2 artifact) |
| `plans/public-company-stacks-atlas.md` | KB-9 Atlas plan — citation tier policy (§6.3), 4-step research pipeline (§6.1), corpus-size thresholds | this doc §1 col 5 + §9 |
| `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/01-phase-docs/PIPELINE.md` | Scraper → curator handoff (per-company), `raw/` namespace ownership, Docling normalization | this doc §9.5 |

---

## 7. What this doc is NOT

- **Not a substitute for the source docs.** This is a routing index, not a methodology defense. For *why* three-pass, read METHODOLOGY-CORRECTION. For *what shape* a Crawley schema has, read REQUIREMENTS-crawley.
- **Not pinned to v2.1 or v2.2.** It's a vocabulary translation; both versions of the master plan use the same four vocabularies. If a future v2.3+ adds a 5th vocabulary, append a column. (KB-9 Atlas is **not** treated as a 5th sequence vocabulary — it's an evidence substrate; see §9 for why.)
- **Not the ship contract.** The ship contracts live in v2.1 / v2.2 ECs. This doc only helps you navigate them.

---

## 8. Open question (deferred to v2.2 owner or later)

The customer-facing UI sequence in §5 implicitly chooses **"linear feeling, three-pass engine."** That's a UX decision, not a methodology decision. An alternative — **"three-pass UI that exposes the iteration"** — would make the FMEA-v1-informs-NFR loop legible to the user. v2.2 honors §5 as the default; if user testing shows "I don't get why my requirements changed after I saw the failure modes," revisit.

---

## 9. The provenance plane (KB-9 Atlas — the third structural addition Cornell didn't have)

§4 named two structural additions Crawley made on top of Cornell (M5 form-function bridge; M4 1-step → 3-phase decision network). KB-9 Atlas is **the third**, but it is not a phase — it's an **evidence substrate** consumed at multiple Pass-3 phases. That's why it doesn't get its own row in §1 and why §1 col 5 ("Empirical-prior anchor") points *into* the substrate from the phases that consume it.

### 9.1. What the Atlas is

15 companies under [`apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/04-filled-examples/companies/`](../apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/04-filled-examples/companies/) (anthropic, supabase, vercel, langchain, stripe, netflix, …), each conforming to:

- **`companyAtlasEntrySchema`** ([`schemas/atlas/entry.ts`](../apps/product-helper/lib/langchain/schemas/atlas/entry.ts)) — `ai_stack` + `backend_stack` + `data_stack` + `infra_stack` + `frontend_stack` + `scale_metric` + `cost_band` + `verification_status` + `archetype_tag`.
- **4 prior types** ([`schemas/atlas/priors.ts`](../apps/product-helper/lib/langchain/schemas/atlas/priors.ts)) — `latencyPriorSchema`, `availabilityPriorSchema`, `throughputPriorSchema`, `costCurveSchema`. Each carries a `citation` (kb_source + url + source_tier + publish_date + SHA-256 of fetched bytes).
- **5 result-shape variants** — `scalar | vector | matrix | graph | piecewise` (discriminated union). Every prior declares which shape it carries so M4 math derivations consume it directly.
- **Tier-gated citations** — `PRIOR_ACCEPTABLE_TIERS = [A_sec_filing, B_official_blog, E_conference, G_model_card]`. C/D rejected for priors even with corroboration; H always flagged-only.

### 9.2. Who consumes it (live in the runtime today)

| Consumer | What it pulls | Where it lands |
|---|---|---|
| [`decision-net-agent.ts`](../apps/product-helper/lib/langchain/agents/system-design/decision-net-agent.ts) | Per-archetype prior values for each `decision_node.scores[].alternative` | M4 phase-14 `decision_nodes` |
| [`schemas/module-4/phase-19-empirical-prior-binding.ts`](../apps/product-helper/lib/langchain/schemas/module-4/phase-19-empirical-prior-binding.ts) | Aggregates citations across all phase-14 scores; chains audit rows via `hash_chain_prev` | M4 phase-19 binding manifest (provenance manifest, one row per score) |
| [`hoq-agent.ts:12`](../apps/product-helper/lib/langchain/agents/system-design/hoq-agent.ts#L12) | "KB-8 archetypes for competitive bench" — peer entries by `archetype_tag` | M6 phase-6 competitive-benchmarks |
| [`interface-specs-agent.ts`](../apps/product-helper/lib/langchain/agents/system-design/interface-specs-agent.ts) | Vendor-IF latency/availability priors (Anthropic 99.95, Supabase 99.99, Vercel 99.99) | M7.b `interface_specs.chain_budgets[].p95_ms` + per-IF availability |
| [`synthesis-agent.ts:108`](../apps/product-helper/lib/langchain/agents/system-design/synthesis-agent.ts#L108) | `decisions[].empirical_priors[]` (atlas_entry_id + citation + sample_size + provisional flag) | T6 keystone `architecture_recommendation.v1.json` |

**Live evidence.** [`architecture_recommendation.v1.json`](../apps/product-helper/.planning/runs/self-application/synthesis/architecture_recommendation.v1.json) D-01 rationale cites *"KB-8 atlas anthropic#latency-prior p95=1100ms"*; D-02 cites *"KB-8 atlas supabase#availability-prior 99.99"*. The Atlas → keystone wiring is end-to-end on disk.

### 9.3. The provisional escape hatch

Per **v1 R2 ruling (2026-04-23)**: if KB-9 returns < 7 valid entries for a decision's archetype, the binding row sets `provisional: true` + `sample_size: <n>` and the pipeline **does not block**. This is the methodology's answer to the cold-start problem — the schema enforces "you must cite something OR mark it provisional"; it does not enforce "you must always have ≥ 7 entries."

Surface today: `provisional` boolean on `priorBindingSchema`; `kb_8_entries_consulted: string[]` on `phase19Schema` so an audit reader sees the total candidate set.

### 9.4. Wave-E "why this value?" surface (LOCKED contract — NOT yet shipped)

The contract for surfacing Atlas-grounded numbers in the chat panel is already locked — it ships in v2.2 Wave E. This subsection documents the locked types so §9 stays valid before and after Wave E lands; no §9 re-edit needed.

- **Audit sink.** `decision_audit` table (already migrated at [`0011_decision_audit.sql`](../apps/product-helper/lib/db/migrations/0011_decision_audit.sql)) receives one row per engine evaluation. Per v2.2 D-V21.19.
- **Chain integrity.** `hash_chain_prev` on every `priorBindingSchema` row (regex `/^[a-f0-9]{8,64}$|^GENESIS$/`) chains evaluations into an immutable audit ledger.
- **UI bridge.** [`lib/chat/system-question-bridge.ts`](../apps/product-helper/lib/chat/system-question-bridge.ts) (shipped in v2.1 Wave A) routes `{ status: 'needs_user_input', computed_options, math_trace }` to the same chat panel that asks intake questions.
- **What the user sees, when Wave E lands:**
  ```
  Availability 99.9% derived from:
    • Anthropic 99.95% [B_official_blog · 2026-Q3 status page]
    • Supabase   99.99% [B_official_blog · 2026-Q1 SLA doc]
    • Vercel     99.99% [B_official_blog · 2026-Q1 SLA doc]
  Product = 99.93% → conservative round to 99.9%
  ```
- **Wave A ↔ Wave E handshake.** `nfr_engine_contract_version: 'v1'` is the stable interface; Wave E swaps internals behind `GENERATE_nfr` / `GENERATE_constants` graph nodes without breaking Wave A. See [v2.2 §"Wave A ↔ Wave E handshake"](c1v-MIT-Crawley-Cornell.v2.2.md).

### 9.5. Upstream (raw research → Atlas entry)

The Atlas isn't hand-curated; it's pipelined. From [`9-stacks-atlas/01-phase-docs/PIPELINE.md`](../apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/01-phase-docs/PIPELINE.md):

- **Scraper** owns `raw/{slug}/` (10-K from SEC EDGAR + blog/conference/model-card per allowlist + Docling normalization to `.md` with YAML provenance header + SHA-256 of original bytes).
- **Architect** owns `entry.ts` Zod shape + tier refinements.
- **Curator** owns `companies/{slug}.md` (extraction from `raw/`), `rejected/{slug}.md`, `SOURCES.md`, `indexes/*.json`.

Signal order: `architect → scraper: schema_ready` (gates fetches) → `scraper → curator: per-company manifest` (gates extraction) → `curator → architect: schema violations` (mid-batch tweak loop).

### 9.6. Why the Atlas isn't a row in §1

A row in §1 implies "this happens at this point in the sequence." The Atlas doesn't happen *at* a point — it's **read from** at four points (M4 / M6 / M7.b / T6). Treating it as a row would either (a) duplicate it across four rows or (b) imply a single anchor phase that doesn't exist. The §3 mermaid handles this correctly with dotted edges from a separate `ATLAS` subgraph; §1 col 5 cells point *into* the substrate from the phases that consume it.

If a future methodology revision adds a second substrate (say, a "regulatory-prior plane" for compliance constants), it gets the same treatment: separate subgraph in §3, dedicated explanation section, no §1 row. §1 stays the SE-sequence index; §9-style sections handle substrates.
