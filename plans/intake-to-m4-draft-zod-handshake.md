---
name: Intake → M4 Draft Recommendation v1 — Full Zod Handshake
date: 2026-05-04
purpose: "Single source of truth for every Zod schema and Drizzle table that data passes through from welcome onboarding → M4 v1 DRAFT decision network + architecture_recommendation v1 DRAFT. Use when wiring any agent that needs to know 'what shape does my input arrive in, what shape must my output emit.'"
companions:
  - plans/HANDOFF-2026-05-04-draft-pipeline-funnel.md
  - plans/draft-pipeline-funnel-project-plan.html
  - plans/methodology-rosetta.md
  - plans/research/math-sources.md
  - apps/product-helper/CLAUDE.md (atlas invariant + Decision Matrix vs Network)
  - c1v-project-admin-main/c1v-marketing/intake-data-map.html
status: REFERENCE — keep in sync with code
---

# Intake → M4 Draft Recommendation v1 — Full Zod Handshake

> Read this when wiring an agent and you need to know: **what shape arrives, what shape must I emit, and where does it land.**

---

## 0. Visual map

```
┌──────── LAYER 0 — INTAKE SURFACES (revised 2026-05-04 — M0a removed) ─────┐
│                                                                            │
│  [Welcome Form]                                                            │
│  scope-mode-toggle.tsx                                                     │
│  project-metadata-selectors.tsx                                            │
│  building-input.tsx                                                        │
│       │                                                                    │
│       ▼                                                                    │
│  app/actions/projects.ts  →  projects table                                │
│                                                                            │
│  📛 M0a webhook (signup-signals · Clearbit + domain) REMOVED 2026-05-04 ─  │
│     no Clerk webhook · no user_signals table writes · no CompanySignals    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────── LAYER 1 — INTAKE PATH (CHOOSE ONE) ───────────────┐
│                                                                            │
│  PATH A — Quick Start                       PATH B — Chat-Intake          │
│  (1-sentence vision)                        (conversational, multi-turn)   │
│                                                                            │
│  QuickStartConfig                           IntakeState                    │
│       │                                          │                         │
│       ▼                                          ▼                         │
│  quick-start-synthesis-agent              extract-data.ts (per turn)       │
│  (2 sequential Sonnet calls)              writes to extractionSchema       │
│       │                                          │                         │
│       ▼                                          ▼                         │
│  SynthesisResult                          extractionSchema                 │
│  { domainAnalysis,                        { actors, useCases,              │
│    useCaseDerivation }                      systemBoundaries, NFRs,        │
│       │                                     ffbd?, decisionMatrix?, ... } │
│       │                                          │                         │
│       │  hands off                               │                         │
│       └─────────────────────────────────────────►│                         │
│                                                  ▼                         │
│                                  Backend agents (parallel, post-intake):   │
│                                  • tech-stack-agent → TechStackModel       │
│                                  • schema-extraction-agent → DBSchemaModel │
│                                  • api-spec-agent → APISpecification       │
│                                  • user-stories-agent → GeneratedStory[]   │
│                                  • infrastructure-agent → InfrastructureSpec│
│                                  • guidelines-agent → CodingGuidelines     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────── LAYER 2 — M0b DISCRIMINATOR GATE ─────────────────────┐
│                                                                            │
│  discriminator-intake-agent (deterministic rule tree, NO LLM)              │
│  Inputs: TierZeroGates + AskedDiscriminators + ProjectEntry                │
│  (CompanySignals input REMOVED 2026-05-04 evening — M0a feature deleted)   │
│  Output: IntakeDiscriminators v1 artifact                                  │
│  { pipeline_route, pruning_set, computed_constants,                        │
│    inference_audit[], tier2_inferred }                                     │
│                                                                            │
│  → persisted to project_entry_states table                                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────── LAYER 3 — ADAPTERS (CURRENTLY MISSING — see §7) ───────────────┐
│                                                                            │
│  Legacy intake schemas (extractionSchema.*, SynthesisResult)               │
│  ──MUST TRANSFORM TO──►                                                    │
│  Crawley schemas (M1, M2, M3, M5, M7.a, M8.a)                              │
│                                                                            │
│  ⚠ No adapters today. This is the wiring gap.                              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────── LAYER 4 — CRAWLEY UPSTREAM ARTIFACTS ─────────────────────┐
│                                                                            │
│  M3 ffbd.v1.json                M7.a n2_matrix.v1.json                     │
│  M8.a fmea_early.v1.json        M2 nfrs.v2.json                            │
│  M2 constants.v2.json           M5.1-5.5 form_function_map.v1.json         │
│                                                                            │
│  → all stored in project_artifacts table (kind='ffbd_v1' etc.)             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ + KB-9 atlas (fires from beginning · all tiers)
                                    + M0b pruning_set
                                    ▼
┌──────────────── LAYER 5 — M4 v1 DRAFT DECISION NETWORK ────────────────────┐
│                                                                            │
│  decision-net-agent (delegates scoring to NFR Engine — pure math)          │
│  Output: DecisionNetworkV1                                                 │
│  { phases: 11-13 vector_scores, 14 decision_nodes,                         │
│    15 dependencies, 16 pareto_frontier, 17b sensitivity,                   │
│    19 empirical_prior_binding (provisional in v1) }                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────── LAYER 6 — ARCHITECTURE_RECOMMENDATION v1 DRAFT KEYSTONE ──────────┐
│                                                                            │
│  T6 synthesis-agent → architecture_recommendation.v1.json                  │
│  { decisions[] with empirical_priors[], chosen_alternative,                │
│    derivation_chain, mermaid_bundle, delta_teaser }                        │
│  kind: 'draft' · provisional: true                                         │
│                                                                            │
│  → project_artifacts.kind = 'recommendation_json' + kind: 'draft'          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Layer 0 — Intake surfaces

### 1.1 Welcome onboarding form

| Component | File | Field | Type | Maps to discriminator |
|---|---|---|---|---|
| `welcome-onboarding.tsx` | `apps/product-helper/components/onboarding/welcome-onboarding.tsx` | (orchestrator) | — | — |
| `scope-mode-toggle.tsx` | `apps/product-helper/components/onboarding/scope-mode-toggle.tsx` | `scopeMode: 'defined' \| 'help'` | currently injected as text prefix into vision | ⚠ should be G1/G2 + greenfield/brownfield router |
| `project-metadata-selectors.tsx` | `apps/product-helper/components/onboarding/project-metadata-selectors.tsx` | `projectType` | enum: `saas \| mobile-app \| marketplace \| api-service \| e-commerce \| internal-tool \| open-source \| other` | **D0 product_archetype** ✅ |
|  |  | `projectStage` | enum: `idea \| prototype \| mvp \| growth \| mature` | ❌ ORPHAN — saved, never read |
|  |  | `userRole` | enum: `founder \| product-manager \| developer \| designer` | ❌ ORPHAN — saved, never read |
|  |  | `budget` | enum: `bootstrap \| seed \| series-a \| enterprise` | ⚠ **D8 budget_band** but WRONG ENUM (T7.4 fixes to dollar bands) |
| `building-input.tsx` | `apps/product-helper/components/onboarding/building-input.tsx` | `inputValue` → `vision` | string (free text) | LLM context — primary input |

### 1.2 createProject action — Drizzle insert

**File:** `apps/product-helper/app/actions/projects.ts`

**Persists to:** `projects` table — schema at `apps/product-helper/lib/db/schema/projects.ts`

| Column | Type | Source | Notes |
|---|---|---|---|
| `id` | uuid | generated | PK |
| `team_id` | bigint | Clerk session | FK → teams |
| `created_by` | bigint | Clerk session | FK → users |
| `name` | text | `firstChars(vision, 50)` or `'New Project'` | display name |
| `vision` | text | scopeMode prefix + user description + modeContext | max 5000 chars · primary LLM input |
| `status` | text | `'intake'` (always on create) | state machine |
| `project_type` | text? | from form (optional) | D0 |
| `project_stage` | text? | from form (optional) | ❌ orphan |
| `user_role` | text? | from form (optional) | ❌ orphan |
| `budget` | text? | from form (optional) | D8 (wrong enum) |
| `validation_score` | int | 0 on create | populated post-intake |
| `created_at` / `updated_at` | timestamp | now() | — |

### 1.3 ~~M0a — signup-signals~~ — 📛 REMOVED 2026-05-04 evening

**Entire feature removed per David's call.** No Clerk webhook firing on signup. No Clearbit/LinkedIn scrape. No `user_signals` table reads anywhere downstream. The `signup-signals-agent.ts` + `user_signals` table + `/api/signup-signals/[userId]` route are left on disk inactive for v2.2.4+ revisit only.

Discriminators going forward are collected via the welcome form (D0 projectType, D8 budget) + chat questions (D4 target DAU, D6 industry, D7 transaction pattern). All references to `CompanySignals` downstream (Layer 1A QS-Synthesizer, Layer 2 M0b, Layer 3 §5.4 adapter) are deleted from the active flow.

---

## 2. Layer 1 — Path A: Quick Start

### 2.1 QuickStartConfig — entry contract

**File:** `apps/product-helper/lib/langchain/quick-start/orchestrator.ts:90`

```ts
interface QuickStartConfig {
  projectId: number;
  teamId: number;
  userId: number;
  userInput: string;             // 10-500 chars
  onProgress?: ProgressCallback; // SSE event emitter
  projectContext?: Partial<KBProjectContext>;
}
```

### 2.2 SynthesisResult — QS synthesis output

**File:** `apps/product-helper/lib/langchain/agents/quick-start-synthesis-agent.ts:103`

```ts
interface SynthesisResult {
  domainAnalysis: DomainAnalysis;        // 1st sequential Sonnet call
  useCaseDerivation: UseCaseDerivation;  // 2nd sequential Sonnet call
  userInput: string;                     // preserved for reference
}

type DomainAnalysis = {
  actors: Array<{ name; role; type: 'human' | 'system' | 'external' }>;  // 3-8
  systemBoundaries: { internal: string[]; external: string[] };
  technicalContext: { platform; scale; architectureStyle };
  projectName: string;
  projectVision: string;  // 2-3 sentence expansion
};

type UseCaseDerivation = {
  useCases: Array<{ id; name; description; actor; trigger; outcome;
                    preconditions[]; postconditions[]; priority }>;  // 6-15
  features: Array<{ name; description; category }>;  // 5-12
  assumptions: string[];  // ≥3
  dataEntities: Array<{ name; attributes[]; relationships[] }>;  // ≥2
};
```

### 2.3 QS-Synthesizer (post-T7.6) — narrow M4-prep mode

**Status:** TO BUILD (T7.6). Replaces the broken `extractProjectData` synthetic-conversation branch.

**Proposed input contract** (locked per funnel plan):
```ts
interface QsM4PrepInput {
  vision: string;
  actors: Actor[];
  projectType?: string;    // D0
  projectId: number;       // tenant isolation in cache key
  // signals from M0a — REMOVED 2026-05-04 evening (M0a feature out of scope)
}
```

**Proposed output contract** — produces M4 v1 inputs WITH ASSUMPTIONS:
```ts
interface QsM4PrepOutput {
  kind: 'draft';
  decisionNetworkInputs: {
    alternatives: Array<{
      id: string;
      app_shape: 'monolith' | 'modular-services' | 'event-driven' | 'serverless' | 'hybrid-deploy';
      ai_pattern: 'none' | 'fm-wrapper' | 'rag-augmented' | 'agentic' | 'hybrid-rag-agents' | 'fine-tuned';
      sketch: string;
      stack_proposal: { frontend; backend; db; infra };
    }>;  // 3-5
    decision_criteria: Array<{
      criterion: 'cost' | 'latency' | 'availability' | 'scalability' | 'time-to-market';
      weight: number;
      rationale: string;
    }>;
    failure_modes_provisional: Array<{ id; description; severity; occurrence; detection }>;
    scoring_matrix: Array<{
      alternative_id; criterion; score;
      bound_to: 'inferred';     // never 'kb-8-atlas' in v1
      provisional: true;
    }>;
    pareto_frontier: string[];
    recommended: string;
  };
  architectureRecommendationDraft: {
    decisions: Array<{
      id; decision; rationale;
      empirical_priors: Array<{ atlas_entry_id: null; citation: 'provisional'; sample_size: 0; provisional: true }>;
    }>;
    chosen_alternative: string;
    derivation_chain_summary: string;
    delta_teaser: string;
  };
}
```

---

## 3. Layer 1 — Path B: Chat-Intake

### 3.1 IntakeState — the state machine

**Defined in:** `apps/product-helper/lib/langchain/agents/intake/state.ts` + `apps/product-helper/lib/langchain/graphs/intake-graph.ts:307` (LangGraph `Annotation.Root`)

```ts
type IntakeState = {
  projectId: number;
  projectVision: string;
  projectType?: string;
  conversationHistory: Message[];
  currentKBStep: KBStep;            // 'context-diagram' | 'use-case-diagram' | ...
  extractedData: ExtractionResult;  // see §3.2
  // + observability fields, heartbeat, etc.
};
```

### 3.2 extractionSchema — the BIG legacy schema

**File:** `apps/product-helper/lib/langchain/schemas.ts:792`

```ts
const extractionSchema = z.object({
  // Core PRD sections
  actors: z.array(actorSchema).default([]),
  useCases: z.array(useCaseSchema).default([]),
  systemBoundaries: systemBoundariesSchema.default({ internal: [], external: [] }),
  dataEntities: z.array(dataEntitySchema).default([]),

  // Epic.dev parity
  problemStatement: problemStatementSchema.default({ summary: '', context: '', impact: '', goals: [] }),
  goalsMetrics: z.array(goalMetricSchema).default([]),
  nonFunctionalRequirements: z.array(nonFunctionalRequirementSchema).default([]),

  // System Design Steps 3-6 (Cornell-flow LEGACY shape — NOT Crawley)
  ffbd: ffbdSchema.optional(),                  // ⚠ legacy — NOT module-3/ffbd-v1
  decisionMatrix: decisionMatrixSchema.optional(),  // ⚠ legacy — NOT module-4
  qfd: qfdSchema.optional(),                    // ⚠ legacy — NOT module-6-hoq
  interfaces: interfacesSchema.optional(),      // ⚠ legacy — NOT module-7-interfaces

  // PROPOSED (T1.5) — adds new namespace key:
  // draftArchitecture: z.object({ archPreview: ... }).optional(),
});

type ExtractionResult = z.infer<typeof extractionSchema>;
```

**Persists to:** `project_data.intake_state` jsonb column — schema at `apps/product-helper/lib/db/schema/project-data.ts`

### 3.3 Per-turn write — extract-data.ts node

**File:** `apps/product-helper/lib/langchain/graphs/nodes/extract-data.ts`

**Input:** `IntakeState` (pre-turn)
**Output:** `Partial<IntakeState>` with merged `extractedData`

**T0 invariant (shipped 2026-05-04):** `emitNfrContractEnvelope` is phase-gated — fires only when `currentKBStep` ∈ {functional-requirements, sysml-activity-diagram, ffbd, decision-matrix, qfd-house-of-quality, interfaces}.

### 3.4 Backend agents (post-intake parallel fan-out)

Each agent has its own Zod schema and runs against the converged `extractionSchema` (or QS handoff data).

| Agent | File | Output Zod schema | Output route |
|---|---|---|---|
| **Tech Stack** | `agents/tech-stack-agent.ts` | `TechStackModel` (categories + recommendations) | `/requirements/tech-stack` |
| **DB Schema** | `agents/schema-extraction-agent.ts` | `DatabaseSchemaModel` (entities + relationships → DBML) | `/backend/schema` |
| **API Spec** | `agents/api-spec-agent.ts` | `APISpecification` (OpenAPI 3.0) | `/backend/api-spec` |
| **User Stories** | `agents/user-stories-agent.ts` | `GeneratedStory[]` (Drizzle `userStories` table) | `/requirements/user-stories` |
| **Infrastructure** | `agents/infrastructure-agent.ts` | `InfrastructureSpec` | (separate) |
| **Coding Guidelines** | `agents/guidelines-agent.ts` | `CodingGuidelines` | `/backend/guidelines` |

**Persists to:** mix of `project_artifacts` (with kind discriminator) + `userStories` table for stories.

---

## 4. Layer 2 — M0b discriminator gate

### 4.1 IntakeDiscriminators — the gate output

**File:** `apps/product-helper/lib/langchain/schemas/module-0/intake-discriminators.ts`

**Agent:** `apps/product-helper/lib/langchain/agents/system-design/discriminator-intake-agent.ts` (deterministic rule tree, NO LLM)

**Input contract** (composite — pulled from multiple sources):

```ts
interface DiscriminatorIntakeInput {
  // Tier-0 gates — asked explicitly in form OR chat
  tierZero: TierZeroGates;
  // Tier-1 — top-5 asked discriminators
  asked: AskedDiscriminators;
  // companySignals field REMOVED 2026-05-04 evening — M0a feature deleted
  // From welcome form (greenfield/brownfield router)
  entryPattern: EntryPattern;
}

type TierZeroGates = {
  G1_decisions_needed: boolean;     // YES → fires M4 decision-network
  G2_prd_needed: boolean;           // YES → fires synthesizer + export
};

type AskedDiscriminators = {
  D0_product_archetype: ProductArchetype;
  D4_dau_band: DauBand;             // '<100' | '100-1K' | '1K-10K' | '10K-100K' | '100K-1M' | '1M+'
  D6_industry: Industry;
  D7_transaction_pattern: TransactionPattern;  // 'read-heavy' | 'write-heavy' | 'mixed-CRUD' | 'real-time' | 'batch'
  D8_budget_band: BudgetBand;       // '<$100' | '$100-1K' | '$1-10K' | '$10-100K' | '$100K+'
};
```

**Output contract:**

```ts
interface IntakeDiscriminators {
  _schema: 'module-0.intake-discriminators.v1';
  produced_at: string;
  tier_zero_gates: TierZeroGates;
  asked_discriminators: AskedDiscriminators;
  tier2_inferred: {
    D1_team_size?: TeamSize;        // from D8 budget band (CompanySignals input REMOVED 2026-05-04)
    D3_project_type?: ProjectTypeD3; // greenfield/brownfield/hybrid from entry_pattern
    D5_business_model?: BusinessModel;  // B2B/B2C/B2B2C from D0+D6
    D9_geo?: string;
    D10_sla_tier?: SlaTier;
    D12_data_sensitivity?: DataSensitivity;
  };
  inference_audit: InferenceAuditRow[];  // every Tier-2 cites concrete sources
  pruning_set: PruningSetEntry[];        // alternatives REMOVED before M4 scoring fires
  computed_constants: ComputedConstants; // pre-computed numeric/string primes
  pipeline_route: PipelineRoute;         // 'full' | 'decisions-only' | 'prd-only' | 'browse-only'
}
```

**Persists to:** `project_entry_states` table — schema at `apps/product-helper/lib/db/schema/project-entry-states.ts`

**Critical property:** **deterministic** — same inputs → same outputs, always. Audit chain reproducibility.

---

## 5. Layer 3 — Adapters (THE GAP)

**Status:** ⚠ **No adapters exist today.** This is the wiring work T8 needs to do.

### 5.1 Required adapter: extractionSchema → Crawley M3 ffbd-v1

**Source shape (legacy):** `extractionSchema.ffbd` — produced by intake-side `ffbd-agent.ts`
**Target shape (Crawley):** `FfbdV1` — defined in `apps/product-helper/lib/langchain/schemas/module-3/ffbd-v1.ts`

**Differences:**
- Legacy intake has flat `functions: string[]` and freeform `subsystems`
- Crawley M3 has `ffbdFunctionSchema` (discriminatedUnion on `kind`), `ffbdArrowSchema`, `ffbdLogicGateSchema`, `ffbdFunctionInputSchema`, plus `_upstream_refs` + `_schema` envelope

**Adapter signature needed:**
```ts
function adaptIntakeFfbdToCrawley(
  intake: ExtractionResult['ffbd'],
  context: { projectId; signals?; usecases }
): FfbdV1;
```

### 5.2 Required adapter: extractionSchema → Crawley M2 NFRs

**Source:** `extractionSchema.nonFunctionalRequirements: NonFunctionalRequirement[]`
**Target:** `nfrs.v2.json` from `apps/product-helper/lib/langchain/schemas/module-2/submodule-2-3-nfrs-constants.ts`

**Difference:** legacy NFRs are single-attribute (name, description, priority); Crawley M2 NFRs include `derivedFrom` discriminated union (fmea-derived | data-flow | fr-derived), priority weights, target values, measurement scales, and the engine.json contract for the NFR Engine Interpreter.

**Adapter signature:**
```ts
function adaptIntakeNfrsToCrawley(
  legacy: NonFunctionalRequirement[],
  fmeaEarly: FmeaEarly,
  dataFlows: DataFlowsV1,
): NfrsV2;
```

### 5.3 Required adapter: SynthesisResult → Crawley M3+M2 (QS path)

**Source:** Quick Start `SynthesisResult` (domainAnalysis + useCaseDerivation)
**Target:** Crawley M3 ffbd-v1 + M2 nfrs-v2 + M7.a n2-matrix-v1 + M8.a fmea-early-v1

**This is the biggest adapter** — QS skips the chat walk, so the adapter must SYNTHESIZE Crawley shapes from minimal seed data (vision + actors + use cases + data entities). All upstream provenance fields (`_upstream_refs`) get marked `provisional: true · synthesized_from: 'qs-shortcut'`.

### 5.4 ~~Required adapter: M0a CompanySignals → M2 NFR priors~~ — 📛 REMOVED 2026-05-04 evening

**Adapter removed.** M0a signup-signals feature is out of scope per David's call — there are no `CompanySignals` to adapt. NFR priors come from chat-collected discriminators (D6 industry / D4 target DAU / D7 transaction pattern) only. Adapter count drops from 5 to 4.

---

## 6. Layer 4 — Crawley upstream artifacts (M4 inputs)

These are what `decision-net-agent.ts` declares in `_upstream_refs`:

### 6.1 M3 FFBD v1

**File:** `apps/product-helper/lib/langchain/schemas/module-3/ffbd-v1.ts`

**Key types:**
- `ffbdFunctionSchema` — discriminated union of function kinds (operate / decide / loop / etc.)
- `ffbdArrowSchema` — directed arcs between functions
- `ffbdLogicGateSchema` — AND / OR / EOR / IF gates
- `ffbdFunctionInputSchema` — function input declarations
- `uncertaintyColorSchema` — green/yellow/red

**Producer:** Crawley M3 ffbd agent (post-Pass-1 walk OR via §5.1 adapter)
**Consumer:** M4 (`_upstream_refs.ffbd`), M5 (`_upstream_refs.ffbd` for function inventory), M7.a (interface decomposition)

### 6.2 M7.a N2 matrix

**File:** `apps/product-helper/lib/langchain/schemas/module-7-interfaces/n2-matrix.ts`

**Shape:** `n2_matrix.v1.json` with rows/cols indexed by FFBD functions, cells carry interface signatures (source × dest × payload).

**Producer:** Pass-1 walk after FFBD
**Consumer:** M4 (`_upstream_refs.n2_matrix`), M8.a (FMEA derives failure modes from interface contracts)

### 6.3 M8.a FMEA early (INSTRUMENTAL)

**File:** `apps/product-helper/lib/langchain/schemas/module-8-risk/fmea-early.ts`

**Key types:**
- `targetRefSchema` — references to FFBD functions or N2 cells
- `candidateMitigationSchema` — proposed mitigation strategies
- `fmeaFailureModeSchema` — RPN-scored failure modes (Severity × Occurrence × Detection)

**Producer:** Pass-1 walk terminal step (per rosetta — fires HERE, not at end)
**Consumer:** M2 NFRs (informs target values + priorities), M5 (redundancy keywords drive form-redundancy phase), M4 (`_upstream_refs.fmea_early` for risk-aware scoring)

### 6.4 M2 NFRs v2 + Constants v2

**File:** `apps/product-helper/lib/langchain/schemas/module-2/submodule-2-3-nfrs-constants.ts`

**Shape:** `nfrs.v2.json` (NFR list with `derivedFrom` discriminated union — fmea-derived / data-flow / fr-derived) + `constants.v2.json` (computed numeric/string primes from NFRs).

**Producer:** Pass-2 walk
**Consumer:** M4 (`_upstream_refs.nfrs` + `constants` — these define the decision criteria), M5 (priority weights, currently unused), M6 QFD, M7.b interface specs

### 6.5 M5 Form-Function Map (skipped in QS path; minimal in chat-intake path for v1)

**File:** `apps/product-helper/lib/langchain/schemas/module-5/index.ts` (14 phase schemas)

**Output shape:** `form_function_map.v1.json` with phases 1-7 (form inventory, function inventory, concept-mapping matrix, solution-neutral concept, concept expansion, alternatives, handoff)

**Producer:** Pass-3 prelude (M5.1-M5.5) — ⚠ **not produced in v1 draft path** — M4 v1 alternatives come from QS-Synthesizer assumptions or from M0b pruning_set, not from a real M5 morphological matrix.

**Consumer:** M4 (`_upstream_refs.ffbd` includes M5 data; alternatives column is normally seeded by M5.4 morphological matrix)

---

## 7. Layer 5 — M4 v1 DRAFT decision network

### 7.1 DecisionNetworkV1 — output shape

**File (agent):** `apps/product-helper/lib/langchain/agents/system-design/decision-net-agent.ts:46`

```ts
interface DecisionNetworkV1 {
  _schema: 'module-4.decision-network.v1';
  _output_path: string;
  _upstream_refs: {
    ffbd: string;          // path to ffbd.v1.json
    n2_matrix: string;     // path to n2_matrix.v1.json
    fmea_early: string;    // path to fmea_early.v1.json
    nfrs: string;          // path to nfrs.v2.json
    constants: string;     // path to constants.v2.json
    kb_8_atlas: string;    // path to atlas manifest (real atlas reads from start — gating revoked 2026-05-04)
  };
  produced_at: string;
  produced_by: string;
  system_name: string;
  phases: {
    phase_14_decision_nodes: Phase14Artifact;
    phase_15_decision_dependencies: Phase15Artifact;
    phase_16_pareto_frontier: Phase16Artifact;
    phase_17b_sensitivity: Phase17bArtifact;
    phase_19_empirical_prior_binding: Phase19Artifact;
    phases_11_13_vector_scores: Phases11to13VectorScoresArtifact;
  };
  decision_audit: DecisionAuditRow[];   // G5 audit log
  selected_architecture_id: string;
}

interface DecisionAuditRow {
  row_id: string;
  decision_node_id: string;
  model_version: string;
  kb_chunk_ids: string[];               // empty in v1 (no atlas)
  engine_rule_id: string;               // which NFR Engine rule fired
  timestamp: string;
  hash_chain_prev: string;
  hash_self: string;
  provisional: boolean;                 // ALWAYS true in v1
}
```

### 7.2 The handshake to math engine

**Critical:** `decision-net-agent.ts` declares (line 88-93):

> "The agent NEVER computes scores itself; it delegates here so every score is audit-logged with kb_chunk_ids + engine_rule_id."

Scoring goes through `apps/product-helper/lib/langchain/engines/nfr-engine-interpreter.ts` — pure arithmetic + predicate matching, zero LLM calls in the hot path.

```ts
interface DecisionNetAgentDeps {
  scoreViaEngine: (args: {
    decisionNodeId: string;
    alternativeId: string;
    criterionId: string;
    kbChunkIds: string[];   // empty in v1
  }) => Promise<{
    raw_value: number;
    normalized_value: number;
    engine_rule_id: string;
  }>;
  appendAuditRow: (row: DecisionAuditRow) => Promise<void>;
  modelVersion: string;
}
```

**v1 draft mode behavior:**
- `kb_chunk_ids: [...]` (real atlas reads from the start — atlas-gating revoked 2026-05-04 evening)
- `provisional: true` on every prior (`sample_size < 10`)
- Scoring uses NFR-engine rules + assumed defaults from M0b `computed_constants`

**Persists to:** `project_artifacts` row with `kind = 'decision_network_v1'` + `kind: 'draft'` discriminator (per T1).

---

## 8. Layer 6 — architecture_recommendation v1 DRAFT keystone

### 8.1 Output shape

**File:** `apps/product-helper/lib/langchain/schemas/synthesis/architecture-recommendation.ts`

**Producer:** `apps/product-helper/lib/langchain/agents/system-design/synthesis-agent.ts` (T6 keystone)

```ts
interface ArchitectureRecommendationV1 {
  _schema: 'synthesis.architecture-recommendation.v1';
  kind: 'draft' | 'refined';      // 'draft' in v1 path
  produced_at: string;
  inputs_hash: string;             // SHA-256 for cache deduplication
  decisions: Array<{
    id: string;                    // 'D-01' | 'D-02' | ...
    decision: string;
    rationale: string;
    chosen_alternative_id: string;
    empirical_priors: Array<{
      atlas_entry_id: string | null;   // null in v1 (no atlas)
      citation: string;                // 'provisional' in v1
      sample_size: number;             // 0 in v1
      provisional: boolean;            // true in v1
    }>;
    delta_teaser?: string;             // v1 only — preview of what atlas would change
  }>;
  pareto_alternatives: Array<{ id; utility_total; on_frontier; choices[] }>;
  recommended_alternative: string;
  derivation_chain: DerivationChainNode[];   // v1: sparse; v2: full back-prop
  mermaid_bundle: MermaidBundle;             // viz output
  fmea_residual_flags?: FmeaResidualFlag[];  // empty in v1 (M8.b is paid-only)
  provisional: boolean;                       // true in v1
}
```

### 8.2 Storage

**Per T1 (kind discriminator) + T4 (viewer fallback):**
- `project_artifacts.kind = 'recommendation_json'`
- `kind:'draft'` discriminator on the artifact
- Viewer at `/requirements/architecture/page.tsx` reads via `getArtifactByKind(projectId, 'recommendation_json')` and renders v1 with amber "Draft" badge OR v2 with green "Refined · Atlas-grounded" badge.

---

## 9. End-to-end data flow — narrative walkthrough

### 9.1 Path A — Quick Start (1-shot ~37s to v1 visible)

1. **t=0** — User signs up. Welcome form captured. (M0a Clerk-webhook background scrape REMOVED 2026-05-04 evening.)
2. **t=0** — User fills welcome form (vision + projectType + budget + greenfield/brownfield).
3. **t=2s** — `createProject` action persists to `projects` table (status=intake).
4. **t=2s** — User clicks Quick Start → `POST /api/projects/[id]/quick-start` → `runQuickStartPipeline`.
5. **t=3s** — QS-Synthesizer (post-T7.6) fires with `QsM4PrepInput`. (M0a signals join REMOVED 2026-05-04 evening.)
6. **t=10s** — SynthesisResult → adapter §5.3 → synthesizes Crawley M3 ffbd-v1, M2 NFRs, M7.a N2, M8.a FMEA-early stubs into project_artifacts with `kind:'draft'`.
7. **t=12s** — M0b discriminator gate fires (deterministic): aggregates form fields + form-derived AskedDiscriminators → emits IntakeDiscriminators v1. Persists to `project_entry_states`. Pruning_set + computed_constants now available. (M0a signals input REMOVED 2026-05-04 evening.)
8. **t=15s** — `decision-net-agent` fires in v1-draft mode. Reads Crawley upstream + pruning_set. Delegates scoring to NFR Engine. **Atlas reads fire from the beginning** (atlas-gating revoked 2026-05-04 evening) — `kb_chunk_ids` populated from real atlas priors via pgvector. Writes `decision_network_v1` to project_artifacts with `kind:'draft'`.
9. **t=35s** — `synthesis-agent` (T6 keystone) reads M4 v1 output → emits `architecture_recommendation.v1.json` with `kind:'draft'`, atlas-grounded, `delta_teaser` populated.
10. **t=37s** — Frontend renders: `/requirements/architecture` shows v1 draft with amber badge + "Refine to full SYN blueprint (1000 credits)" CTA.

### 9.2 Path B — Chat-Intake (multi-turn, ~3-10 min to v1 visible)

1. **t=0** — Same signup + form + createProject as Path A.
2. **t=2s** — User starts chatting. Each turn:
   - `extract-data.ts` runs → updates `extractedData` jsonb in `project_data.intake_state`
   - `kb-question-generator.ts` surfaces next discriminator question (in-chat, "helps me X" framing)
   - Backend agents (tech-stack, db-schema, etc.) fire when KB phase advances
3. **Turns 1-N** — User answers progressively cover D4 / D6 / D7 (the chat-driven discriminators).
4. **When `extractedData` reaches sufficiency** (configurable threshold) — adapters §5.1, §5.2 transform legacy → Crawley shapes.
5. **t=N min** — Same M0b → M4 → SYN sequence as Path A (steps 7-10).

### 9.3 Convergence point

Both paths converge at **step 7 (M0b discriminator gate)**. Above this, paths differ. Below this, both produce identical-shaped Crawley artifacts and v1 draft.

---

## 10. Adapter implementation priority (for T8 work)

| # | Adapter | Effort | Blocks |
|---|---|---|---|
| 1 | ~~`adaptCompanySignalsToM2NFRSeeds` (§5.4)~~ | — | 📛 REMOVED 2026-05-04 — M0a feature deleted |
| 2 | `adaptSynthesisResultToCrawleyM3M2M7aM8a` (§5.3) | ~6-8 hr | QS path's M4 ability to fire |
| 3 | `adaptIntakeFfbdToCrawley` (§5.1) | ~3 hr | Chat-intake's M4 ability to fire |
| 4 | `adaptIntakeNfrsToCrawley` (§5.2) | ~3 hr | Same |
| 5 | M5 form-function shortcut for v1 (synthesize from vision) | ~2 hr | M4 alternatives column when M5 walk skipped |

**Total adapter work: ~14-19 hr** (was ~15-20 hr; L3.4 removed with M0a 2026-05-04 evening). Adapter count drops from 5 to 4. This is the bulk of T8.

---

## 11. Storage map

| Table / column | What lives here | Schema file |
|---|---|---|
| `projects` | createProject output (vision, projectType, budget, status) | `lib/db/schema/projects.ts` |
| ~~`user_signals`~~ | 📛 REMOVED 2026-05-04 — table idle (M0a feature deleted) | `lib/db/schema/user-signals.ts` |
| `project_entry_states` | M0b IntakeDiscriminators v1 | `lib/db/schema/project-entry-states.ts` |
| `project_data.intake_state` jsonb | IntakeState (chat path) including extractionSchema + draftArchitecture (T1.5) | `lib/db/schema/project-data.ts` |
| `project_artifacts` | All Crawley artifacts (ffbd_v1, n2_matrix_v1, fmea_early_v1, nfrs_v2, decision_network_v1, recommendation_json, ...) with `kind:'draft' | 'refined'` per T1 | `lib/db/schema/project-artifacts.ts` |
| `userStories` | Stories agent output | `lib/db/schema/user-stories.ts` |
| `conversations` | Chat messages | `lib/db/schema/conversations.ts` |

---

## 12. The 7-level archetype taxonomy (where it shows up)

For full taxonomy see funnel plan T7 + intake-data-map. In handshake terms:

- **Level 1 (app shape)** + **Level 2 (AI engagement)** are the only levels surfaced in v1 — they come from QS-Synthesizer's `decisionNetworkInputs.alternatives[]` field (each alt is a `(app_shape, ai_pattern)` tuple).
- **Level 3 (inference topology), Level 4 (release), Level 5 (retraining), Level 7 (edge)** are surfaced post-payment in v2 by the full M4 + M8.b + SYN pipeline.
- **Level 6 (platform components)** is deferred to v2.2.4.

---

## 13. Open questions

1. **Adapter ownership** — should §5.1-5.4 adapters live in a new `lib/langchain/adapters/` directory, or alongside the agents that need them?
2. **M5 shortcut policy** — when QS skips M5 form-function walk, should v1 draft alternatives carry an explicit `_synthesis_method: 'm5-skipped' | 'm5-fast-track' | 'm5-full'` field for transparency in the v1→v2 delta?
3. ~~**Atlas stub provenance**~~ — REMOVED 2026-05-04 evening. The "atlas is paid-tier only · v1 emits empty `kb_chunk_ids`" invariant is REVOKED. Atlas reads fire from the beginning across all tiers. The open question about `_atlas_invariant_proof` is moot — there's no invariant to prove anymore.

---

## 14. Cross-references

- **Funnel plan T7** (locked strategy): `plans/draft-pipeline-funnel-project-plan.html#t7`
- **Canonical intake-data-map** (5-layer mess): `c1v-project-admin-main/c1v-marketing/intake-data-map.html`
- **Methodology rosetta** (Pass 1/2/3 mapping): `plans/methodology-rosetta.md`
- **Math sources** (F1-F30 bibliography — DDIA F16-F21 + DMLS F22-F30): `plans/research/math-sources.md`
- **System-design math logic** (430-line strategy doc, workload/QoS/PACELC): `system-design/system-design-math-logic.md`
- **Atlas invariant + canonical sources** (paid-tier only · Crawley/Huyen-AI-Eng/Kleppmann-DDIA on disk): `apps/product-helper/CLAUDE.md` § Invariants + § Canonical Reference Sources

### Canonical book sources on disk (used for math citations + archetype enumeration)

- **Crawley/Cameron/Selva 2015** — `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/2-system-architecture-strategy-product-development/`
- **Huyen 2024 — AI Engineering** — `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/ai-architecture/huyen-book/AI_ENGINEERING_BUILDING_APPLICATIONS_WITH_FOUNDATION_MODELS_BY_C.md` (12,365 lines + 229 artifacts)
- **Kleppmann 2017 — DDIA** (ScyllaDB excerpt) — `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/ai-architecture/ScyllaDB-Designing-Data-Intensive-Applications.md` (Ch 3 Storage and Retrieval · Ch 5 Replication · Ch 8 Trouble with Distributed Systems · 3,483 lines + 58 artifacts). Backs F16-F21 in math-sources.md.
- **Huyen 2022 — DMLS** — `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/ai-architecture/dmls-book/dmls.md` (7,283 lines + 177 artifacts). Targeted chapters: 7 (Deployment + Prediction Service), 8 (Distribution Shifts + Monitoring), 9 (Continual Learning + Test in Production), 10 (MLOps Infrastructure). Drives L3-L7 archetype refinements + F22+ drift-detection math entries.
