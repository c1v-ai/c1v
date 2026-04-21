# Phase N — Schema Gap Audit (Mandatory First Deliverable)

Audit of `apps/product-helper/lib/langchain/schemas.ts:636-781` against the fields the Phase N plan (`plans/pipeline-b-steps36-integration.md`) and its critique (`plans/pipeline-b-steps36-integration.critique.md`) assume Pipeline B generators will consume via Zod-derived projections.

**Verdict: 0 schema extensions required.** Every assumed field is present. Peer-H's `qfd.engineeringCharacteristics.latencyTarget` wording is imprecise — there is no `.latencyTarget` field, but the equivalent (`designTarget + unit + name`) is covered by the existing `engineeringCharSchema`.

---

## Field-by-field status

| # | Assumed path | Status | Source line | Notes |
|---|---|---|---|---|
| 1 | `interfaces.subsystems` | **EXISTS** | `schemas.ts:777` | `z.array(subsystemSchema)`, required |
| 2 | `interfaces.interfaces[].protocol` | **EXISTS** | `schemas.ts:770` | `z.string().optional()` — aligns with degradation contract |
| 3 | `interfaces.interfaces[].frequency` | **EXISTS** | `schemas.ts:771` | `z.string().optional()` |
| 4 | `interfaces.interfaces[].dataPayload` | **EXISTS** | `schemas.ts:769` | `z.string()` — **required** (not optional) on an `InterfaceSpec` |
| 5 | `qfd.engineeringCharacteristics.latencyTarget` (and sibling unit-typed targets) | **SEMANTIC MATCH, NO RENAME NEEDED** | `schemas.ts:708-716` | `engineeringCharSchema` has `name: string`, `unit: string`, `designTarget: string`, `directionOfImprovement: enum`. The plan's `engineeringTargets` projection consumes the whole characteristic — not a named `.latencyTarget` field. Zero extension. |
| 6 | `decisionMatrix.criteria[].minAcceptable` | **EXISTS** | `schemas.ts:676` | `z.string().optional()` |
| 7 | `decisionMatrix.criteria[].targetValue` | **EXISTS** | `schemas.ts:677` | `z.string().optional()` |
| 8 | `decisionMatrix.criteria[].weight` | **EXISTS** | `schemas.ts:675` | `z.number()` — **required** |

### Supporting fields referenced by the Phase N plan (also verified)

| Path | Source line |
|---|---|
| `ffbd.topLevelBlocks` | `schemas.ts:663` |
| `ffbd.decomposedBlocks` | `schemas.ts:664` |
| `ffbd.topLevelBlocks[].isCoreValue` | `schemas.ts:647` |
| `ffbd.topLevelBlocks[].description` | `schemas.ts:648` |
| `decisionMatrix.recommendation` | `schemas.ts:693` |
| `qfd.engineeringCharacteristics[].directionOfImprovement` | `schemas.ts:712` |
| `qfd.engineeringCharacteristics[].designTarget` | `schemas.ts:713` |
| `qfd.engineeringCharacteristics[].technicalDifficulty` | `schemas.ts:714` |
| `qfd.engineeringCharacteristics[].estimatedCost` | `schemas.ts:715` |
| `interfaces.interfaces[].category` | `schemas.ts:772` |
| `interfaces.n2Chart` | `schemas.ts:779` |
| `interfaces.subsystems[].allocatedFunctions` | `schemas.ts:758` |

All four Steps 3-6 blobs (`ffbd`, `decisionMatrix`, `qfd`, `interfaces`) are `.optional()` on `extractionSchema` (`schemas.ts:805-808`), confirming the graceful-degradation contract Peer-H mandated.

---

## Planned `projections.ts` surface (drift-free via `z.infer` + `Pick`)

Location: `apps/product-helper/lib/langchain/schemas/projections.ts` (new file, Phase N commit #2).

```ts
import type { z } from 'zod';
import type {
  ffbdBlockSchema,
  performanceCriterionSchema,
  engineeringCharSchema,
  subsystemSchema,
  interfaceSpecSchema,
} from '../schemas';

// Tech Stack + Infrastructure consume decisionMatrix.criteria
export type DecisionCriterionProjection = Pick<
  z.infer<typeof performanceCriterionSchema>,
  'name' | 'unit' | 'weight' | 'minAcceptable' | 'targetValue'
>;

// Tech Stack + Infrastructure consume qfd.engineeringCharacteristics
export type EngineeringTargetProjection = Pick<
  z.infer<typeof engineeringCharSchema>,
  'name' | 'unit' | 'directionOfImprovement' | 'designTarget' | 'technicalDifficulty' | 'estimatedCost'
>;

// User Stories + Schema consume ffbd.{top,decomposed}Blocks
export type FunctionalBlockProjection = Pick<
  z.infer<typeof ffbdBlockSchema>,
  'id' | 'name' | 'parentId' | 'isCoreValue' | 'description'
>;

// API Spec + Schema + Infrastructure consume interfaces.interfaces
export type InterfaceMatrixRowProjection = Pick<
  z.infer<typeof interfaceSpecSchema>,
  'id' | 'name' | 'source' | 'destination' | 'dataPayload' | 'protocol' | 'frequency' | 'category'
>;

// API Spec + Schema + Infrastructure consume interfaces.subsystems
export type SubsystemProjection = Pick<
  z.infer<typeof subsystemSchema>,
  'id' | 'name' | 'description'
>;
```

Five projection types, all derived from Zod inferred types. When `schemas.ts` evolves (field renamed, enum added), TypeScript fails at compile time. Zero drift risk.

---

## Agent Context types — current line numbers (verified)

| Agent | File | `Context` interface line |
|---|---|---|
| Tech Stack | `lib/langchain/agents/tech-stack-agent.ts` | 32 |
| User Stories | `lib/langchain/agents/user-stories-agent.ts` | 23 |
| Schema | `lib/langchain/agents/schema-extraction-agent.ts` | 120 |
| API Spec (context type imported) | `lib/types/api-specification.ts` | 413 |
| Infrastructure | `lib/langchain/agents/infrastructure-agent.ts` | 43 |
| Guidelines | `lib/langchain/agents/guidelines-agent.ts` | 32 |

These are the 6 files whose Context types receive additive `?:` projections in Phase N commits 3-7. Guidelines stays unchanged per the plan's §6.2 verdict (rewire ROI too low).

---

## Commit plan (pair-wise revertible per agent)

1. **This file** — `plans/pipeline-b-steps36-schema-gap-audit.md` (docs only, no code) ← first commit, now
2. `lib/langchain/schemas/projections.ts` — Zod-derived projection types + unit tests (empty-shape + defined-shape paths)
3. Handler `buildSteps36Projections(extractedData)` + unit tests in `app/api/chat/projects/[projectId]/__tests__/`
4. Tech Stack rewire — context field + prompt section + degradation snapshot
5. User Stories rewire — same shape
6. Schema rewire — same shape
7. API Spec rewire — same shape (Context type lives in `lib/types/api-specification.ts`)
8. Infrastructure rewire — same shape
9. Handler wiring — pass projections into each ctx object; no-op when Steps 3-6 absent

Each of commits 4-8 is independently revertible without touching the others. Commit 9 is the only cross-file integration; it stays small because the projections object is already built in commit 3.

---

## Conclusion

Phase N can proceed to `projections.ts` (commit 2) with **no schema changes**. The critique's drift-prevention concern is addressed by deriving projection types from `z.infer<>` rather than hand-redeclaring shapes.
