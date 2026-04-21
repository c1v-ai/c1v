/**
 * Module 3 — Barrel Re-Export + Registry
 *
 * Single entry point for Module 3 phase schemas. Gate B ships 3 priority
 * phases (0A ingest, 6 shortcuts+cache, 11 FFBD→DM bridge) per plan §8
 * Step 2; Gate C fills the remaining 8 phases (1, 2, 3, 4, 5, 7, 8, 9, 10).
 *
 * Shared primitives from M2 `_shared.ts` are re-exported so M3 consumers
 * have one import surface (plan §8 S2.a). **M2 is read-only** — M3 never
 * edits `module-2/` files; it only imports.
 *
 * @module lib/langchain/schemas/module-3
 */

import type { z } from 'zod';
import { phase0aSchema } from './phase-0a-ingest-m2-handoff';
import { phase6Schema } from './phase-6-shortcuts-reference-blocks';
import { phase11Schema } from './phase-11-ffbd-to-decision-matrix';

// Re-export M2 shared primitives (plan §8 S2.a — single import surface)
export * from '../module-2/_shared';

// Phase exports (Gate B — 3 priority phases)
export {
  phase0aSchema,
  type Phase0aArtifact,
  externalActorSchema,
  type ExternalActor,
  functionCandidateSchema,
  type FunctionCandidate,
  useCaseFlowSchema,
  type UseCaseFlow,
  carriedConstantSchema,
  type CarriedConstant,
  crossCuttingConcernSchema,
  type CrossCuttingConcern,
} from './phase-0a-ingest-m2-handoff';

export {
  phase6Schema,
  type Phase6Artifact,
  arrowShortcutSchema,
  type ArrowShortcut,
  referenceBlockSchema,
  type ReferenceBlock,
} from './phase-6-shortcuts-reference-blocks';

export {
  phase11Schema,
  type Phase11Artifact,
  flatFunctionSchema,
  type FlatFunction,
  candidateCriterionSchema,
  type CandidateCriterion,
  candidateDimensionSchema,
  type CandidateDimension,
  alternativeSchema,
  type Alternative,
} from './phase-11-ffbd-to-decision-matrix';

/**
 * Canonical registry consumed by `generate-all.ts` + future preload bundle.
 * Each entry owns:
 *   - `slug`        — stable identifier used in filenames + URLs
 *   - `name`        — TitleCase name emitted into the JSON Schema title
 *   - `phaseNumber` — methodology phase (string for "0a" prefix)
 *   - `zodSchema`   — source of truth (drift-gated by CI)
 */
export interface Module3PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number | string;
  zodSchema: z.ZodType;
}

export const MODULE_3_PHASE_SCHEMAS: readonly Module3PhaseEntry[] = [
  {
    slug: 'phase-0a-ingest-m2-handoff',
    name: 'Phase0aIngestM2Handoff',
    phaseNumber: '0a',
    zodSchema: phase0aSchema,
  },
  {
    slug: 'phase-6-shortcuts-reference-blocks',
    name: 'Phase6ShortcutsReferenceBlocks',
    phaseNumber: 6,
    zodSchema: phase6Schema,
  },
  {
    slug: 'phase-11-ffbd-to-decision-matrix',
    name: 'Phase11FfbdToDecisionMatrix',
    phaseNumber: 11,
    zodSchema: phase11Schema,
  },
] as const;
