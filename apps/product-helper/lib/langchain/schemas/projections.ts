/**
 * Steps 3-6 Projection Types
 *
 * Narrow subsets of the Steps 3-6 Zod schemas (`schemas.ts:636-781`) consumed
 * by Pipeline B's post-intake generators (tech stack / user stories / schema /
 * API spec / infrastructure). Derived via `Pick<z.infer<typeof X>, ...>` so
 * any rename or removal in the source Zod schemas fails at compile time
 * rather than drifting silently.
 *
 * Every projection type is a *subset* of an existing schema's inferred type.
 * No new field names are introduced here — only selection.
 *
 * Usage pattern (handler — Phase N commit #3):
 *
 *   const extracted = result.extractedData;            // ExtractionResult
 *   const criteria: DecisionCriterionProjection[] =
 *     (extracted.decisionMatrix?.criteria ?? []).map(c => ({
 *       name: c.name, unit: c.unit, weight: c.weight,
 *       minAcceptable: c.minAcceptable, targetValue: c.targetValue,
 *     }));
 *
 * @module lib/langchain/schemas/projections
 */

import type { z } from 'zod';
import type {
  ffbdBlockSchema,
  performanceCriterionSchema,
  engineeringCharSchema,
  subsystemSchema,
  interfaceSpecSchema,
} from '../schemas';

// ─────────────────────────────────────────────────────────────────────────
// Decision Matrix — consumed by Tech Stack + Infrastructure
// ─────────────────────────────────────────────────────────────────────────

/**
 * Weighted performance criterion row from a Decision Matrix. Used by the
 * Tech Stack prompt to surface trade-off guardrails and by Infrastructure
 * to rank cost-vs-latency picks.
 *
 * Source: `performanceCriterionSchema` (`schemas.ts:671-679`).
 */
export type DecisionCriterionProjection = Pick<
  z.infer<typeof performanceCriterionSchema>,
  'name' | 'unit' | 'weight' | 'minAcceptable' | 'targetValue'
>;

// ─────────────────────────────────────────────────────────────────────────
// QFD — consumed by Tech Stack + Infrastructure
// ─────────────────────────────────────────────────────────────────────────

/**
 * Engineering characteristic (measurable target) from the QFD House of
 * Quality roof. Used by Tech Stack + Infrastructure prompts to convert
 * qualitative quality attributes into numeric targets.
 *
 * Source: `engineeringCharSchema` (`schemas.ts:708-716`).
 */
export type EngineeringTargetProjection = Pick<
  z.infer<typeof engineeringCharSchema>,
  | 'name'
  | 'unit'
  | 'directionOfImprovement'
  | 'designTarget'
  | 'technicalDifficulty'
  | 'estimatedCost'
>;

// ─────────────────────────────────────────────────────────────────────────
// FFBD — consumed by User Stories + Schema
// ─────────────────────────────────────────────────────────────────────────

/**
 * Functional block in the FFBD (top-level or decomposed). Used by User
 * Stories to anchor epic boundaries via `isCoreValue` and by Schema to
 * surface verb-phrase names that imply tables (e.g., "Store Audit Record"
 * → audit_event).
 *
 * Source: `ffbdBlockSchema` (`schemas.ts:641-650`).
 */
export type FunctionalBlockProjection = Pick<
  z.infer<typeof ffbdBlockSchema>,
  'id' | 'name' | 'parentId' | 'isCoreValue' | 'description'
>;

// ─────────────────────────────────────────────────────────────────────────
// Interfaces (Step 6) — consumed by API Spec + Schema + Infrastructure
// ─────────────────────────────────────────────────────────────────────────

/**
 * Interface matrix row. Used by API Spec to emit REST endpoints per
 * `category: 'auth' | 'audit' | 'critical'` and skip WebSocket/Event
 * entries; by Schema to surface hidden entities via `dataPayload`; by
 * Infrastructure to decide WebSocket vs REST runtime.
 *
 * Source: `interfaceSpecSchema` (`schemas.ts:764-773`).
 */
export type InterfaceMatrixRowProjection = Pick<
  z.infer<typeof interfaceSpecSchema>,
  | 'id'
  | 'name'
  | 'source'
  | 'destination'
  | 'dataPayload'
  | 'protocol'
  | 'frequency'
  | 'category'
>;

/**
 * Subsystem summary. Used by API Spec to group endpoints by subsystem
 * resource/tag and by Infrastructure to drive one deploy pipeline per
 * subsystem.
 *
 * Source: `subsystemSchema` (`schemas.ts:754-759`). `allocatedFunctions`
 * is intentionally omitted — the FFBD linkage isn't needed by Pipeline B
 * generators.
 */
export type SubsystemProjection = Pick<
  z.infer<typeof subsystemSchema>,
  'id' | 'name' | 'description'
>;
