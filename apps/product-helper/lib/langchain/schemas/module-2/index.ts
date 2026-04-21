/**
 * Module 2 — Barrel Re-Export + Registry
 *
 * Single entry point for all Module 2 phase schemas. Used by
 *   - `lib/langchain/schemas/generate-all.ts` to emit JSON Schemas
 *     into `lib/langchain/schemas/generated/module-2/`
 *   - the preload-bundle endpoint (plan §4 end-state, forthcoming)
 *   - agent contexts (via named re-exports)
 *
 * The `MODULE_2_PHASE_SCHEMAS` registry is the canonical source list;
 * adding a phase is a 2-line edit here plus one new phase file.
 *
 * @module lib/langchain/schemas/module-2
 */

import type { z } from 'zod';
import { phase0Schema } from './phase-0-ingest';
import { phase1Schema } from './phase-1-use-case-priority';
import { phase2Schema } from './phase-2-thinking-functionally';
import { phase3Schema } from './phase-3-ucbd-setup';
import { phase4Schema } from './phase-4-start-end-conditions';
import { phase5Schema } from './phase-5-ucbd-step-flow';
import { phase6Schema } from './phase-6-requirements-table';
import { phase7Schema } from './phase-7-rules-audit';
import { phase8Schema } from './phase-8-constants-table';
import { phase9Schema } from './phase-9-delve-and-fix';
import { phase10Schema } from './phase-10-sysml-activity';
import { phase11Schema } from './phase-11-multi-uc-expansion';
import { phase12HandoffSchema } from './phase-12-ffbd-handoff';
import { phase12FinalReviewSchema } from './phase-12-final-review';

// Shared primitives
export * from './_shared';
export * from './requirements-table-base';

// Phase exports (schemas + types)
export { phase0Schema, type Phase0Artifact } from './phase-0-ingest';
export { phase1Schema, type Phase1Artifact } from './phase-1-use-case-priority';
export { phase2Schema, type Phase2Artifact } from './phase-2-thinking-functionally';
export { phase3Schema, type Phase3Artifact } from './phase-3-ucbd-setup';
export { phase4Schema, type Phase4Artifact } from './phase-4-start-end-conditions';
export { phase5Schema, type Phase5Artifact } from './phase-5-ucbd-step-flow';
export { phase6Schema, type Phase6Artifact } from './phase-6-requirements-table';
export { phase7Schema, type Phase7Artifact } from './phase-7-rules-audit';
export { phase8Schema, type Phase8Artifact } from './phase-8-constants-table';
export { phase9Schema, type Phase9Artifact } from './phase-9-delve-and-fix';
export { phase10Schema, type Phase10Artifact } from './phase-10-sysml-activity';
export { phase11Schema, type Phase11Artifact } from './phase-11-multi-uc-expansion';
export {
  phase12HandoffSchema,
  type Phase12HandoffArtifact,
} from './phase-12-ffbd-handoff';
export {
  phase12FinalReviewSchema,
  type Phase12FinalReviewArtifact,
} from './phase-12-final-review';

/**
 * Canonical registry consumed by `generate-all.ts` + the preload bundle.
 * Each entry owns:
 *   - `slug`      — stable identifier used in filenames + URLs
 *   - `name`      — TitleCase name emitted into the JSON Schema title
 *   - `zodSchema` — the source of truth (drift-gated by CI)
 */
export interface Module2PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number;
  zodSchema: z.ZodType;
}

export const MODULE_2_PHASE_SCHEMAS: readonly Module2PhaseEntry[] = [
  { slug: 'phase-0-ingest', name: 'Phase0Ingest', phaseNumber: 0, zodSchema: phase0Schema },
  { slug: 'phase-1-use-case-priority', name: 'Phase1UseCasePriority', phaseNumber: 1, zodSchema: phase1Schema },
  { slug: 'phase-2-thinking-functionally', name: 'Phase2ThinkingFunctionally', phaseNumber: 2, zodSchema: phase2Schema },
  { slug: 'phase-3-ucbd-setup', name: 'Phase3UcbdSetup', phaseNumber: 3, zodSchema: phase3Schema },
  { slug: 'phase-4-start-end-conditions', name: 'Phase4StartEndConditions', phaseNumber: 4, zodSchema: phase4Schema },
  { slug: 'phase-5-ucbd-step-flow', name: 'Phase5UcbdStepFlow', phaseNumber: 5, zodSchema: phase5Schema },
  { slug: 'phase-6-requirements-table', name: 'Phase6RequirementsTable', phaseNumber: 6, zodSchema: phase6Schema },
  { slug: 'phase-7-rules-audit', name: 'Phase7RulesAudit', phaseNumber: 7, zodSchema: phase7Schema },
  { slug: 'phase-8-constants-table', name: 'Phase8ConstantsTable', phaseNumber: 8, zodSchema: phase8Schema },
  { slug: 'phase-9-delve-and-fix', name: 'Phase9DelveAndFix', phaseNumber: 9, zodSchema: phase9Schema },
  { slug: 'phase-10-sysml-activity', name: 'Phase10SysmlActivity', phaseNumber: 10, zodSchema: phase10Schema },
  { slug: 'phase-11-multi-uc-expansion', name: 'Phase11MultiUcExpansion', phaseNumber: 11, zodSchema: phase11Schema },
  { slug: 'phase-12-ffbd-handoff', name: 'Phase12FfbdHandoff', phaseNumber: 12, zodSchema: phase12HandoffSchema },
  { slug: 'phase-12-final-review', name: 'Phase12FinalReview', phaseNumber: 12, zodSchema: phase12FinalReviewSchema },
] as const;
