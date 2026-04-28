/**
 * Module 0 — Barrel Re-Export + Registry.
 *
 * Single entry point for the 3 Module-0 schemas that sit at the top of
 * the pipeline (before Module 2). Consumed by:
 *   - `lib/langchain/schemas/generate-all.ts` to emit JSON Schemas into
 *     `lib/langchain/schemas/generated/module-0/`.
 *   - the forthcoming `app/api/preload/module-0/route.ts` preload
 *     endpoint (v1 §5.0.4 code-map).
 *   - `lib/langchain/agents/system-design/discriminator-intake-agent.ts`
 *     (validates the intake artifact it emits).
 *
 * Registry shape matches `Module2PhaseEntry` intentionally so
 * `generate-all.ts` can iterate every module registry with the same
 * loop. `phaseNumber` is pinned at 0 for all three entries — Module 0
 * is a gate, not a multi-phase submodule.
 *
 * @module lib/langchain/schemas/module-0
 */

import type { z } from 'zod';

import { userProfileSchema } from './user-profile';
import { projectEntrySchema } from './project-entry';
import { intakeDiscriminatorsSchema } from './intake-discriminators';

export * from './user-profile';
export * from './project-entry';
export * from './intake-discriminators';

export interface Module0PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number;
  zodSchema: z.ZodType;
}

export const MODULE_0_PHASE_SCHEMAS: readonly Module0PhaseEntry[] = [
  {
    slug: 'user-profile',
    name: 'UserProfile',
    phaseNumber: 0,
    zodSchema: userProfileSchema,
  },
  {
    slug: 'project-entry',
    name: 'ProjectEntry',
    phaseNumber: 0,
    zodSchema: projectEntrySchema,
  },
  {
    slug: 'intake-discriminators',
    name: 'IntakeDiscriminators',
    phaseNumber: 0,
    zodSchema: intakeDiscriminatorsSchema,
  },
] as const;
