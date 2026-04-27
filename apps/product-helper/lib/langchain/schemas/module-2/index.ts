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
 * **Layout (post `plans/reorg-mapping.md` §2 reorg):** phase schemas are
 * grouped under 3 submodule files + 1 handoff file:
 *   - `submodule-2-1-intake.ts`          — phases 0,1,2,3,4,5,10,11
 *   - `submodule-2-2-functional-reqs.ts` — phase 6 + requirements-table-base
 *   - `submodule-2-3-nfrs-constants.ts`  — phases 7,8,9
 *   - `submodule-2-handoff.ts`           — phase-12-ffbd-handoff + phase-12-final-review
 *
 * Registry slugs are preserved verbatim — only the TS source path moved.
 *
 * @module lib/langchain/schemas/module-2
 */

import type { z } from 'zod';
import {
  phase0Schema,
  phase1Schema,
  phase2Schema,
  phase3Schema,
  phase4Schema,
  phase5Schema,
  phase10Schema,
  phase11Schema,
} from './submodule-2-1-intake';
import { phase6Schema } from './submodule-2-2-functional-reqs';
import {
  phase7Schema,
  phase8Schema,
  phase9Schema,
} from './submodule-2-3-nfrs-constants';
import {
  phase12HandoffSchema,
  phase12FinalReviewSchema,
} from './submodule-2-handoff';
import { requirementsCrawleyExtensionSchema } from './requirements-crawley-extension';

// Shared primitives + phase schemas (re-exported via submodule barrels)
export * from './_shared';
export * from './submodule-2-1-intake';
export * from './submodule-2-2-functional-reqs';
export * from './submodule-2-3-nfrs-constants';
export * from './submodule-2-handoff';
export * from './requirements-crawley-extension';

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
  phaseNumber: number | string;
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
  // Crawley pack (TC1 — REQUIREMENTS-crawley §1 row 10)
  { slug: 'requirements-crawley-extension', name: 'RequirementsCrawleyExtension', phaseNumber: 'crawley-extension', zodSchema: requirementsCrawleyExtensionSchema },
] as const;
