# Pipeline B — Wiring Steps 3-6 Outputs into the 6 Post-Intake Generators

Research-only. No implementation. All field names verified against
`apps/product-helper/lib/langchain/schemas.ts` (Steps 3-6 schemas at
lines 636-781) and the six generator agent files.

---

## Executive Summary

Today, `triggerPostIntakeGeneration` (handler lines 782-1200) builds six
generator contexts using only `actors / useCases / dataEntities /
problemStatement / goalsMetrics / nonFunctionalRequirements /
systemBoundaries`. The four Steps 3-6 blobs
(`extractedData.ffbd / decisionMatrix / qfd / interfaces`) are produced
by Pipeline A, persisted to `intake_state.extractedData`, but are never
read on this code path. They are read elsewhere (handler lines 683-686
for UI surfacing).

### Ranked payoff (high → low)

1. **API Spec (HIGH)** — `interfaces.interfaces` is literally an
   interface matrix with source/destination/payload/protocol/frequency/
   category. This is the single biggest quality lift in the set: it
   turns "CRUD-from-entities" into a real system-to-system contract.
2. **Infrastructure (HIGH)** — `interfaces.subsystems` tell you what to
   deploy, `interfaces.interfaces[].protocol/frequency` tell you what
   runtime surface (REST vs WebSocket vs queue) the platform needs, and
   `qfd.engineeringCharacteristics` (latency/uptime targets with units)
   drive region, scaling, and cache choices.
3. **Tech Stack (HIGH)** — `decisionMatrix.criteria` (weighted quality
   attributes) + `decisionMatrix.recommendation` is a pre-made set of
   trade-off guardrails; `qfd.engineeringCharacteristics` converts
   "scalable" into a measurable cost/latency number that changes the
   category picks (e.g., Upstash vs self-hosted Redis).
4. **User Stories (MEDIUM)** — `ffbd.topLevelBlocks` give natural epic
   boundaries (F.1..F.N); `ffbd.decomposedBlocks` give story-sized
   sub-functions. Material but the stories today are already use-case
   derived, so this is incremental, not transformational.
5. **Schema / Database (MEDIUM)** — `interfaces.interfaces[].dataPayload`
   reveals entities and fields missed by use-case extraction, and the
   FFBD decomposition hints at audit/session/event tables. Medium
   because schema-extraction already has an aggressive derivation
   fallback (handler 835-985).
6. **Coding Guidelines (LOW)** — Steps 3-6 are methodology artifacts,
   not team/tooling signals. Maybe wire
   `qfd.engineeringCharacteristics[].technicalDifficulty/estimatedCost`
   into the "test coverage" / "strictness" heuristics. Otherwise skip.

### Rewire verdict

- **Definitely rewire:** API Spec, Infrastructure, Tech Stack.
- **Should rewire:** User Stories, Schema.
- **Skip for now:** Coding Guidelines (ROI too low; revisit later).

Total estimated delta across all six agents + handler: **~180-230 LOC**
(see per-generator numbers below). The biggest single change is the
handler context-builder (~60-90 LOC for summarizers).

---

## 1. Tech Stack Agent (HIGH)

**File:** `apps/product-helper/lib/langchain/agents/tech-stack-agent.ts`
**Context type:** `TechStackContext` (lines 32-40)

### 1.1 Which Steps 3-6 fields materially improve output

- `decisionMatrix.criteria[].name` + `.unit` + `.weight` — the weighted
  quality attribute list (cost vs latency vs reliability) is exactly
  what a tech stack recommender needs to balance picks.
- `decisionMatrix.criteria[].minAcceptable` + `.targetValue` — lets the
  agent reject categories (e.g., reject serverless if p95 target is
  tight + cold-starts are unacceptable).
- `decisionMatrix.recommendation` — a human-written rationale the agent
  can align against instead of fighting.
- `qfd.engineeringCharacteristics[].name` + `.unit` +
  `.directionOfImprovement` + `.designTarget` — hard numbers per
  characteristic ("≤ 500ms", "≥ 99.9%"). Changes cost tier and database
  choice (e.g., Neon vs RDS, Upstash vs Memcached).
- `qfd.engineeringCharacteristics[].technicalDifficulty` +
  `.estimatedCost` — calibrates how aggressive to be with exotic picks.

### 1.2 Benefit: HIGH

The agent's current prompt (lines 59-119) is generic. Adding real target
numbers and weighted criteria removes the "it depends" guesswork and
makes the `rationale` field traceable.

### 1.3 Context type delta

```ts
export interface TechStackContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{ name: string; description: string }>;
  dataEntities: Array<{ name: string }>;
  constraints?: string[];
  preferences?: string[];
  projectContext?: Partial<KBProjectContext>;

  // NEW — Steps 3-6
  decisionCriteria?: Array<{
    name: string;
    unit: string;
    weight: number;
    minAcceptable?: string;
    targetValue?: string;
  }>;
  decisionRecommendation?: string;
  engineeringTargets?: Array<{
    name: string;
    unit: string;
    directionOfImprovement: 'higher' | 'lower' | 'target';
    designTarget: string;
    technicalDifficulty?: number;
    estimatedCost?: number;
  }>;
}
```

### 1.4 Prompt-level change

In `buildTechStackPrompt` (line 59), add a new section
`## Trade-off Criteria (from Decision Matrix)` between `## Preferences`
(line 78) and `## Instructions` (line 81). Inject
`decisionCriteria` as a weighted bullet list and `engineeringTargets`
as a table of "name — direction — target (unit) — diff/cost". In the
Instructions block, add a sentence: "When multiple options meet the
functional need, prefer the one that best satisfies the weighted
criteria and meets every `minAcceptable` threshold."

### 1.5 LOC delta

Context type: ~18 lines. Prompt builder: ~25 lines (two formatters +
prompt section). Graceful-degradation check (skip sections when
undefined): ~6 lines. **Total: ~49 LOC.**

---

## 2. User Stories Agent (MEDIUM)

**File:** `apps/product-helper/lib/langchain/agents/user-stories-agent.ts`
**Context type:** `UserStoriesContext` (lines 23-43)

### 2.1 Which Steps 3-6 fields materially improve output

- `ffbd.topLevelBlocks[].name` + `.id` + `.isCoreValue` — natural epic
  boundaries with a "core value" flag for priority mapping.
- `ffbd.decomposedBlocks[].name` + `.parentId` + `.description` —
  story-sized sub-functions that already have verb-phrase names
  (exactly the story granularity the agent targets).
- `ffbd.topLevelBlocks[].description` — epic description (today the
  agent invents `epic` per story).

### 2.2 Benefit: MEDIUM

The current prompt already generates 1-3 stories per use case and
groups into an `epic` field. FFBD gives principled epic assignment
(F.1 → epic 1) and a measurable core-value signal that can map to
`priority: 'critical'`. Not transformational — the stories themselves
are still derived from use cases — but it stops the agent from
inventing inconsistent epic names.

### 2.3 Context type delta

```ts
export interface UserStoriesContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{ /* unchanged */ }>;
  actors: Array<{ name: string; role: string; description?: string }>;
  projectContext?: Partial<KBProjectContext>;

  // NEW — Steps 3-6
  functionalBlocks?: Array<{
    id: string;           // "F.1", "F.1.1"
    name: string;         // verb phrase
    parentId?: string;    // set on sub-functions
    isCoreValue?: boolean;
    description?: string;
  }>;
}
```

### 2.4 Prompt-level change

In the prompt string (lines 113-156), add a new section
`## Functional Decomposition (FFBD)` after `## Use Cases to Transform`
(line 125). Provide the top-level F.1..F.N blocks as "epics" and the
decomposed F.x.y as sub-functions. Add an Instruction:
"When an F.x.y sub-function maps cleanly onto a use case step, generate
the story under the parent F.x as its epic. When `isCoreValue: true`,
lift priority one notch (medium→high, high→critical)."

### 2.5 LOC delta

Context type: ~9 lines. Prompt formatter + section: ~15 lines.
Priority-lift helper (pure TS): ~6 lines. **Total: ~30 LOC.**

---

## 3. Schema Extraction Agent (MEDIUM)

**File:** `apps/product-helper/lib/langchain/agents/schema-extraction-agent.ts`
**Context type:** `SchemaExtractionContext` (lines 120-133)

### 3.1 Which Steps 3-6 fields materially improve output

- `interfaces.interfaces[].dataPayload` — payload descriptions
  ("activity, clothing, profile ID") frequently name fields/entities
  not in `dataEntities`.
- `interfaces.subsystems[].name` + `.description` — reveals tables
  like `session`, `audit_event`, `job`, `prediction_result` that the
  conversation hinted at but extraction missed.
- `ffbd.decomposedBlocks[].name` — verb phrases like "Store Audit
  Record", "Emit Prediction Event" are strong signals for missing
  tables.

### 3.2 Benefit: MEDIUM

The agent already has aggressive fallback derivation in the handler
(lines 835-985) that invents Token/Session/AuditEvent tables from
regex'd use-case text. Using interface payloads is a cleaner,
non-regex signal. Incremental but real.

### 3.3 Context type delta

```ts
export interface SchemaExtractionContext {
  projectName: string;
  projectVision: string;
  dataEntities: Array<{ /* unchanged */ }>;
  useCases?: Array<{ name: string; description: string }>;
  projectContext?: Partial<KBProjectContext>;

  // NEW — Steps 3-6
  interfacePayloads?: Array<{
    id: string;               // "IF-01"
    name: string;
    source: string;           // subsystem ID
    destination: string;      // subsystem ID
    dataPayload: string;      // the free-text payload description
    category?: 'system-flow' | 'critical' | 'auth' | 'audit';
  }>;
  subsystems?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}
```

### 3.4 Prompt-level change

After `## Use Cases (for additional context)` (line 181), add
`## System Interfaces & Subsystems`. Render interfaces as a one-line
each list with `source → destination: payload`. Add Instruction:
"If a payload mentions a noun that isn't already in the entities list,
create a supporting entity (e.g., `audit_event`, `session`,
`notification`). Interfaces with category `audit` strongly imply an
audit-log table."

### 3.5 LOC delta

Context type: ~14 lines. Prompt formatter + section: ~18 lines.
Degradation check (omit section if `undefined`): ~4 lines.
**Total: ~36 LOC.**

---

## 4. API Spec Agent (HIGH — biggest payoff)

**File:** `apps/product-helper/lib/langchain/agents/api-spec-agent.ts`
**Context type:** `APISpecGenerationContext`
(`lib/types/api-specification.ts` lines 413-435)

### 4.1 Which Steps 3-6 fields materially improve output

- `interfaces.interfaces[]` — this IS the interface matrix. Every
  entry maps to 1:1:
  - `.name` → endpoint purpose
  - `.source` + `.destination` → auth tier (internal subsystem ↔
    internal = service-to-service; external subsystem → internal =
    public API)
  - `.dataPayload` → request body schema
  - `.protocol` (`"REST API"`, `"WebSocket"`, `"Event"`, `"gRPC"`) →
    whether to generate a REST endpoint at all vs a WS route / event
    contract
  - `.frequency` ("Per prediction", "Real-time stream") → rate-limit
    bucket + caching policy
  - `.category` ("auth" → OAuth endpoints; "audit" → append-only log
    endpoints; "critical" → stricter SLAs)
- `interfaces.subsystems[].name` → resource/tag grouping (replaces
  the agent's current entity-based tag inference).
- `interfaces.n2Chart` → cross-subsystem payload map, useful for
  generating batch / aggregation endpoints.

### 4.2 Benefit: HIGH

Today the API Spec agent does "CRUD per entity + one endpoint per use
case" (prompt lines 140-148). With the interface matrix it produces a
spec that matches the actual system decomposition — which is the
whole point of Step 6. This is the single highest-leverage rewire in
the set.

### 4.3 Context type delta

```ts
export interface APISpecGenerationContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{ /* unchanged */ }>;
  dataEntities: Array<{ /* unchanged */ }>;
  techStack?: { backend?: string; database?: string; auth?: string };
  projectContext?: import('../education/reference-data/types').KBProjectContext;

  // NEW — Steps 3-6
  interfaceMatrix?: Array<{
    id: string;
    name: string;
    source: string;
    destination: string;
    dataPayload: string;
    protocol?: string;     // REST / WebSocket / Event / gRPC
    frequency?: string;
    category?: 'system-flow' | 'critical' | 'auth' | 'audit';
  }>;
  subsystems?: Array<{ id: string; name: string; description: string }>;
}
```

### 4.4 Prompt-level change

In `buildAPISpecPrompt` (line 116), insert
`## System Interface Matrix (Step 6)` between `## Tech Stack Context`
(line 131) and `## Instructions` (line 134). Render each interface as
`IF-01 | SS1→SS2 | REST | Per prediction | critical | payload:
<...>`. Revise the Instructions "Coverage Requirements" section (line
140) to add: "Each `IF-xx` with `protocol: REST API` MUST become one
or more endpoints. Skip interfaces with `protocol: WebSocket`,
`Event`, `gRPC`, or `Message Queue` — they are not REST. For
interfaces with `category: auth`, emit auth/token endpoints; for
`category: audit`, emit append-only log endpoints; for `category:
critical`, add explicit rate-limit and SLA notes in the description."

### 4.5 LOC delta

Context type (in `lib/types/api-specification.ts`): ~16 lines. Prompt
builder change in agent: ~25 lines (formatter + section + instruction
delta). Category→endpoint helper: ~8 lines. **Total: ~49 LOC.**

---

## 5. Infrastructure Agent (HIGH)

**File:** `apps/product-helper/lib/langchain/agents/infrastructure-agent.ts`
**Context type:** `InfrastructureContext` (lines 43-51)

### 5.1 Which Steps 3-6 fields materially improve output

- `qfd.engineeringCharacteristics[].name` + `.unit` + `.designTarget`
  + `.directionOfImprovement` — converts "performant" to "p95 latency
  ≤ 500ms". Changes region count, autoscaling floor, and caching
  decision.
- `qfd.engineeringCharacteristics[].technicalDifficulty` +
  `.estimatedCost` — calibrates managed vs self-hosted.
- `decisionMatrix.criteria` — weighted priorities (if cost weight is
  highest, pick Neon over RDS; if reliability weight is highest,
  multi-region active-active).
- `interfaces.interfaces[].protocol` + `.frequency` — reveals whether
  to provision a message queue / event bus / WebSocket gateway /
  stream-processing runtime. Today the infra prompt (lines 103-159)
  never asks this.
- `interfaces.subsystems[].name` — each subsystem typically maps to
  one deployable service (Vercel function vs Cloud Run vs Container).
  Drives autoscaling count and the CI/CD matrix.

### 5.2 Benefit: HIGH

Infrastructure is where engineering characteristics hit reality. The
agent currently takes free-text `scaleRequirements`; the QFD gives it
structured targets in proper units.

### 5.3 Context type delta

```ts
export interface InfrastructureContext {
  projectName: string;
  projectDescription: string;
  techStack?: TechStackModel;
  scaleRequirements?: ScaleRequirements;
  complianceRequirements?: string[];
  budgetConstraints?: string;
  projectContext?: Partial<KBProjectContext>;

  // NEW — Steps 3-6
  engineeringTargets?: Array<{
    name: string;
    unit: string;
    directionOfImprovement: 'higher' | 'lower' | 'target';
    designTarget: string;
    technicalDifficulty?: number;
    estimatedCost?: number;
  }>;
  weightedCriteria?: Array<{ name: string; weight: number; unit: string }>;
  subsystems?: Array<{ id: string; name: string; description: string }>;
  interfaceProtocols?: Array<{
    name: string;
    protocol?: string;
    frequency?: string;
    category?: 'system-flow' | 'critical' | 'auth' | 'audit';
  }>;
}
```

### 5.4 Prompt-level change

In `buildInfrastructurePrompt` (line 81), add
`## Engineering Targets (from QFD)` and
`## Subsystem Topology & Interface Protocols (from Step 6)` between
`## Compliance Requirements` (line 97) and `## Budget Constraints`
(line 100). In Instructions, add a bullet under section 1 ("Hosting"):
"If any engineering target with `directionOfImprovement: lower` on a
latency unit (`ms`, `s`) has `designTarget ≤ 200ms`, require multi-
region or edge compute." Under section 3 ("Caching"): "If any
interface has `frequency: Real-time stream` or
`protocol: WebSocket`, include a persistent connection tier (e.g.,
Cloudflare Durable Objects, Fly.io)." Under section 4 ("CI/CD"): "One
deploy pipeline per subsystem."

### 5.5 LOC delta

Context type: ~22 lines. Prompt builder: ~30 lines (three formatters
+ two sections). Instructions deltas: ~6 lines. Degradation checks:
~6 lines. **Total: ~64 LOC.** Largest of the six.

---

## 6. Coding Guidelines Agent (LOW / skip)

**File:** `apps/product-helper/lib/langchain/agents/guidelines-agent.ts`
**Context type:** `GuidelinesContext` (lines 32-45)

### 6.1 Which Steps 3-6 fields materially improve output

- Marginally: `qfd.engineeringCharacteristics[].technicalDifficulty`
  aggregated to a "project complexity" score could nudge
  `preferences.strictness` and `testCoverage`.
- Marginally: `interfaces.interfaces[].category === 'audit'` count
  could hint at "logging style: structured" and "ADR required."
- `ffbd` / `decisionMatrix` / `qfd.customerNeeds` — no direct
  mapping. Coding conventions are team/tooling properties, not
  system-decomposition properties.

### 6.2 Benefit: LOW / ZERO

The prompt (lines 74-170) is already covering naming/linting/testing/
docs in ~170 lines. Injecting system-design data would be noise and
risk overfitting stylistic rules to a numeric target.

### 6.3 Context type delta

Optional, only if we want the complexity heuristic:

```ts
export interface GuidelinesContext {
  // ...existing fields unchanged...

  // OPTIONAL — Steps 3-6 (low-value, defer)
  projectComplexityHint?: {
    avgTechnicalDifficulty?: number;   // 1-5, avg across QFD chars
    auditInterfaceCount?: number;      // # of category='audit' ifaces
    subsystemCount?: number;
  };
}
```

### 6.4 Prompt-level change

If implemented: one sentence in the factor list (lines 165-170):
"When `projectComplexityHint.avgTechnicalDifficulty ≥ 4` or
`subsystemCount ≥ 6`, default to `strictness: 'strict'` and
`testCoverage: ≥80`." Recommendation: do NOT wire this in v1 — noise
risk > signal.

### 6.5 LOC delta

If wired: ~12 LOC. Recommendation: **0 LOC (skip).**

---

## Handler-Side Delta (langgraph-handler.ts)

The real integration cost is populating the new context fields from
`extractedData` in `triggerPostIntakeGeneration` (current ctx-building
at lines 1070-1135).

Add between the `enrichedUseCaseDescriptions` block (line 1068) and
the first `const techStackCtx` (line 1071):

- Extract `extractedData.ffbd`, `.decisionMatrix`, `.qfd`,
  `.interfaces` (each optional).
- Build five projections:
  - `decisionCriteria` / `decisionRecommendation` (from
    `decisionMatrix.criteria`, `.recommendation`)
  - `engineeringTargets` (from `qfd.engineeringCharacteristics`)
  - `functionalBlocks` (concat of
    `ffbd.topLevelBlocks` + `ffbd.decomposedBlocks`)
  - `interfaceMatrix` / `subsystems` (from
    `interfaces.interfaces`, `.subsystems`)
  - `interfaceProtocols` (subset of `interfaceMatrix` for infra)
- Pass them into the corresponding ctx objects (all optional, so no
  type break if Pipeline A didn't run).

**Handler LOC delta: ~60-90 lines.**

---

## Totals

| Agent | Rewire? | LOC delta |
|---|---|---|
| Tech Stack | Yes (HIGH) | ~49 |
| User Stories | Yes (MED) | ~30 |
| Schema | Yes (MED) | ~36 |
| API Spec | Yes (HIGH) | ~49 |
| Infrastructure | Yes (HIGH) | ~64 |
| Guidelines | No (LOW) | 0 |
| **Agents subtotal** | | **~228** |
| Handler ctx wiring | Yes | ~60-90 |
| **Total** | | **~288-318 LOC** |

---

## Appendix — Verbatim Steps 3-6 Field Shapes

From `lib/langchain/schemas.ts`. Anyone implementing this should
treat these as the source of truth — `extractedData.{ffbd,
decisionMatrix, qfd, interfaces}` are `.optional()` on
`extractionSchema` (line 805-808) and may be `undefined`.

### FFBD — `extractedData.ffbd` (schemas.ts lines 662-667)

```ts
ffbd: {
  topLevelBlocks: FfbdBlock[];      // F.1 through F.N
  decomposedBlocks: FfbdBlock[];    // F.1.1 through F.N.M (default [])
  connections: FfbdConnection[];    // default []
}
```

`FfbdBlock` (lines 641-650):

```ts
{
  id: string;               // "F.1", "F.1.1"
  name: string;             // verb phrase, e.g. "Onboard Organization"
  parentId?: string;        // "F.1" for F.1.1
  gateType?: 'none' | 'AND' | 'OR' | 'IT';
  gateCondition?: string;
  isCoreValue?: boolean;
  description?: string;
}
```

`FfbdConnection` (lines 654-660):

```ts
{
  from: string;             // source block id
  to: string;               // target block id
  gateType?: 'sequence' | 'AND' | 'OR' | 'IT';
  condition?: string;
}
```

### Decision Matrix — `extractedData.decisionMatrix` (lines 690-695)

```ts
decisionMatrix: {
  criteria: PerformanceCriterion[];
  alternatives: DesignAlternative[];
  recommendation?: string;
}
```

`PerformanceCriterion` (lines 671-679):

```ts
{
  id: string;                   // "PC-01"
  name: string;                 // "Core Temperature Prediction Accuracy"
  unit: string;                 // "degrees C (MAE)", "ms", "%"
  weight: number;               // 0.0-1.0, sum to 1.0
  minAcceptable?: string;
  targetValue?: string;
  measurementMethod?: string;
}
```

`DesignAlternative` (lines 682-687):

```ts
{
  id: string;                   // "ALT-01"
  name: string;
  scores: Record<string, number>;  // criterion ID → 0.0-1.0
  weightedTotal?: number;
}
```

### QFD — `extractedData.qfd` (lines 743-749)

```ts
qfd: {
  customerNeeds: CustomerNeed[];
  engineeringCharacteristics: EngineeringChar[];
  relationships: QfdRelationship[];   // default []
  roof: QfdRoofEntry[];               // default []
  competitors: QfdCompetitor[];       // default []
}
```

`CustomerNeed` (lines 699-703):

```ts
{ id: string; name: string; relativeImportance: number }
```

`EngineeringChar` (lines 708-716):

```ts
{
  id: string;                                              // "EC-01"
  name: string;
  unit: string;                                            // "°C", "sec", "%", "count"
  directionOfImprovement: 'higher' | 'lower' | 'target';
  designTarget: string;                                    // "≤ 0.3", "≥ 99.9%"
  technicalDifficulty?: number;                            // 1-5
  estimatedCost?: number;                                  // 1-5
}
```

`QfdRelationship` (lines 721-725):

```ts
{
  needId: string;
  charId: string;
  strength: 'strong' | 'moderate' | 'weak';   // 9 / 3 / 1
}
```

`QfdRoofEntry` (lines 730-734):

```ts
{
  charId1: string;
  charId2: string;
  correlation: 'strong-positive' | 'positive' | 'negative' | 'strong-negative';
}
```

`QfdCompetitor` (lines 737-740):

```ts
{ name: string; scores: Record<string, number> /* needId → 1-5 */ }
```

### Interfaces — `extractedData.interfaces` (lines 776-780)

```ts
interfaces: {
  subsystems: Subsystem[];
  interfaces: InterfaceSpec[];
  n2Chart: Record<string, Record<string, string>>;   // default {}
}
```

`Subsystem` (lines 754-759):

```ts
{
  id: string;                          // "SS1"
  name: string;                        // "Prediction Engine"
  description: string;
  allocatedFunctions: string[];        // default [] — FFBD block IDs
}
```

`InterfaceSpec` (lines 764-773):

```ts
{
  id: string;                                                  // "IF-01"
  name: string;                                                // "Worker Prediction Request"
  source: string;                                              // subsystem ID
  destination: string;                                         // subsystem ID
  dataPayload: string;                                         // "activity, clothing, profile ID"
  protocol?: string;                                           // "REST API", "WebSocket", "Event"
  frequency?: string;                                          // "Per prediction", "On change"
  category?: 'system-flow' | 'critical' | 'auth' | 'audit';
}
```

---

## Implementation Note (Non-Binding)

When this research is turned into tasks, three patterns will matter:

1. **Optional everywhere.** `extractedData.{ffbd, decisionMatrix, qfd,
   interfaces}` are all `.optional()` on `extractionSchema`. Every new
   Context field must be `?:` and every prompt section must be omitted
   (not empty-stubbed) when the source data is missing.
2. **Graceful degradation test.** Each generator must pass its
   existing test suite with `undefined` for all new fields —
   equivalent to pre-rewire behaviour.
3. **One summarizer per dimension, not per agent.** The handler
   should build the five projections once (`decisionCriteria`,
   `engineeringTargets`, `functionalBlocks`, `interfaceMatrix`,
   `subsystems`) and reuse them across contexts rather than
   re-transforming per agent.
