/**
 * Steps 3-6 Projection Builder
 *
 * Pure transform from `ExtractionResult` → `Steps36Projections` — the shape
 * consumed by Pipeline B generator contexts (tech stack / user stories /
 * schema / API spec / infrastructure).
 *
 * Contract:
 *  - If `extracted` is undefined → returns `{}` (graceful no-op).
 *  - If a Steps 3-6 blob is undefined or empty → its projection field is
 *    omitted (not set to `[]` or `null`).
 *  - Generators downstream must tolerate every projection field being
 *    undefined (additive Phase N constraint).
 *
 * This module has zero runtime dependencies beyond the projection types in
 * `./projections.ts` and the `ExtractionResult` type in `../schemas.ts` —
 * kept pure so unit tests don't have to mock db / anthropic / etc.
 *
 * @module lib/langchain/schemas/build-projections
 */

import type { ExtractionResult } from '../schemas';
import type {
  DecisionCriterionProjection,
  EngineeringTargetProjection,
  FunctionalBlockProjection,
  InterfaceMatrixRowProjection,
  SubsystemProjection,
} from './projections';

/**
 * The bundle of Steps 3-6 projections consumed by Pipeline B generators.
 * Every field is optional; absence means "no Steps 3-6 signal for this
 * dimension" and downstream prompts omit (not empty-stub) their sections.
 */
export interface Steps36Projections {
  decisionCriteria?: DecisionCriterionProjection[];
  decisionRecommendation?: string;
  engineeringTargets?: EngineeringTargetProjection[];
  functionalBlocks?: FunctionalBlockProjection[];
  interfaceMatrix?: InterfaceMatrixRowProjection[];
  subsystems?: SubsystemProjection[];
}

/**
 * Build Steps 3-6 projections from an `ExtractionResult`. Safe on undefined,
 * partial, or fully populated inputs.
 *
 * @param extracted The full ExtractionResult (post-parse) or undefined.
 * @returns `Steps36Projections` — an object where each field is either
 *   set or absent based on whether the corresponding source data exists.
 */
export function buildSteps36Projections(
  extracted: ExtractionResult | undefined,
): Steps36Projections {
  if (!extracted) return {};

  const out: Steps36Projections = {};

  // --- Step 4: Decision Matrix → criteria + recommendation ---
  const dm = extracted.decisionMatrix;
  if (dm?.criteria?.length) {
    out.decisionCriteria = dm.criteria.map((c) => ({
      name: c.name,
      unit: c.unit,
      weight: c.weight,
      minAcceptable: c.minAcceptable,
      targetValue: c.targetValue,
    }));
  }
  if (dm?.recommendation) {
    out.decisionRecommendation = dm.recommendation;
  }

  // --- Step 5: QFD → engineering targets ---
  const qfd = extracted.qfd;
  if (qfd?.engineeringCharacteristics?.length) {
    out.engineeringTargets = qfd.engineeringCharacteristics.map((ec) => ({
      name: ec.name,
      unit: ec.unit,
      directionOfImprovement: ec.directionOfImprovement,
      designTarget: ec.designTarget,
      technicalDifficulty: ec.technicalDifficulty,
      estimatedCost: ec.estimatedCost,
    }));
  }

  // --- Step 3: FFBD → flat list of functional blocks (top + decomposed) ---
  const ffbd = extracted.ffbd;
  const top = ffbd?.topLevelBlocks ?? [];
  const dec = ffbd?.decomposedBlocks ?? [];
  if (top.length > 0 || dec.length > 0) {
    out.functionalBlocks = [...top, ...dec].map((b) => ({
      id: b.id,
      name: b.name,
      parentId: b.parentId,
      isCoreValue: b.isCoreValue,
      description: b.description,
    }));
  }

  // --- Step 6: Interfaces → interface matrix + subsystems ---
  const ifaces = extracted.interfaces;
  if (ifaces?.interfaces?.length) {
    out.interfaceMatrix = ifaces.interfaces.map((i) => ({
      id: i.id,
      name: i.name,
      source: i.source,
      destination: i.destination,
      dataPayload: i.dataPayload,
      protocol: i.protocol,
      frequency: i.frequency,
      category: i.category,
    }));
  }
  if (ifaces?.subsystems?.length) {
    out.subsystems = ifaces.subsystems.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));
  }

  return out;
}
