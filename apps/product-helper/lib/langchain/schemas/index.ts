/**
 * Crawley schemas — root barrel + registry.
 *
 * @module lib/langchain/schemas
 *
 * Registers the 11 Crawley-derived Zod schemas + the M5-local matrix keystone
 * (`mathDerivationMatrixSchema`, REQUIREMENTS-crawley §5 Option Y).
 *
 * NOTE: Node resolution prefers `lib/langchain/schemas.ts` (the legacy file)
 * over this directory's `index.ts` for `'../schemas'` imports. This file is
 * the explicit-path entry point: `import {...} from '@/lib/langchain/schemas/index'`
 * or via subpath `import {...} from '@/lib/langchain/schemas/module-4/...'`.
 *
 * Module-level registries (`MODULE_2_PHASE_SCHEMAS`, `MODULE_3_PHASE_SCHEMAS`,
 * `MODULE_4_PHASE_SCHEMAS`, `MODULE_5_PHASE_SCHEMAS`) remain the canonical
 * source for `generate-all.ts` + preload bundles. This file aggregates the
 * 11 Crawley schemas ONLY for cross-module discovery / verifier / docs.
 */

import type { z } from 'zod';

// ── Matrix keystone (Option Y) ─────────────────────────────────────────────
export {
  mathDerivationMatrixSchema,
  type MathDerivationMatrix,
} from './module-5/_matrix';

// ── 8 Crawley schemas already shipped on this branch ───────────────────────
export {
  phase1FormTaxonomySchema,
  type Phase1FormTaxonomy,
} from './module-5/phase-1-form-taxonomy';

export {
  phase2FunctionTaxonomySchema,
  type Phase2FunctionTaxonomy,
} from './module-5/phase-2-function-taxonomy';

export {
  phase3FormFunctionConceptSchema,
  type Phase3FormFunctionConcept,
} from './module-5/phase-3-form-function-concept';

export {
  phase4SolutionNeutralConceptSchema,
  type Phase4SolutionNeutralConcept,
} from './module-5/phase-4-solution-neutral-concept';

export {
  phase5ConceptExpansionSchema,
  type Phase5ConceptExpansion,
} from './module-5/phase-5-concept-expansion';

export {
  decompositionPlaneArtifactSchema,
  type DecompositionPlaneArtifact,
} from './module-3/decomposition-plane';

export {
  decisionNetworkFoundationsSchema,
  type DecisionNetworkFoundations,
} from './module-4/decision-network-foundations';

// ── 3 NEW Crawley schemas this commit ─────────────────────────────────────
export {
  tradespaceParetoSensitivitySchema,
  type TradespaceParetoSensitivity,
} from './module-4/tradespace-pareto-sensitivity';

export {
  optimizationPatternsSchema,
  type OptimizationPatterns,
} from './module-4/optimization-patterns';

export {
  requirementsCrawleyExtensionSchema,
  type RequirementsCrawleyExtension,
} from './module-2/requirements-crawley-extension';

// Imports for the registry below.
import { phase1FormTaxonomySchema } from './module-5/phase-1-form-taxonomy';
import { phase2FunctionTaxonomySchema } from './module-5/phase-2-function-taxonomy';
import { phase3FormFunctionConceptSchema } from './module-5/phase-3-form-function-concept';
import { phase4SolutionNeutralConceptSchema } from './module-5/phase-4-solution-neutral-concept';
import { phase5ConceptExpansionSchema } from './module-5/phase-5-concept-expansion';
import { decompositionPlaneArtifactSchema } from './module-3/decomposition-plane';
import { decisionNetworkFoundationsSchema } from './module-4/decision-network-foundations';
import { tradespaceParetoSensitivitySchema } from './module-4/tradespace-pareto-sensitivity';
import { optimizationPatternsSchema } from './module-4/optimization-patterns';
import { requirementsCrawleyExtensionSchema } from './module-2/requirements-crawley-extension';
import { mathDerivationMatrixSchema } from './module-5/_matrix';

export interface CrawleySchemaEntry {
  /** Stable schema id (e.g., `module-5.phase-1-form-taxonomy.v1`). */
  schemaId: string;
  /** Source file under apps/product-helper/lib/langchain/schemas/. */
  sourcePath: string;
  /** Owning module — convenient for Drizzle migration cross-ref. */
  module: 'module-2' | 'module-3' | 'module-4' | 'module-5';
  /** Crawley chapter ref. */
  crawleyChapter: string;
  /** The Zod schema itself. */
  zodSchema: z.ZodType;
}

/**
 * Canonical Crawley registry — REQUIREMENTS-crawley §1 + §5.
 * 11 schemas + 1 keystone. Order matches REQUIREMENTS-crawley §1 table.
 */
export const CRAWLEY_SCHEMAS: readonly CrawleySchemaEntry[] = [
  {
    schemaId: 'module-5.phase-1-form-taxonomy.v1',
    sourcePath: 'lib/langchain/schemas/module-5/phase-1-form-taxonomy.ts',
    module: 'module-5',
    crawleyChapter: 'Ch 4',
    zodSchema: phase1FormTaxonomySchema,
  },
  {
    schemaId: 'module-5.phase-2-function-taxonomy.v1',
    sourcePath: 'lib/langchain/schemas/module-5/phase-2-function-taxonomy.ts',
    module: 'module-5',
    crawleyChapter: 'Ch 5',
    zodSchema: phase2FunctionTaxonomySchema,
  },
  {
    schemaId: 'module-5.phase-3-form-function-concept.v1',
    sourcePath: 'lib/langchain/schemas/module-5/phase-3-form-function-concept.ts',
    module: 'module-5',
    crawleyChapter: 'Ch 6',
    zodSchema: phase3FormFunctionConceptSchema,
  },
  {
    schemaId: 'module-5.phase-4-solution-neutral-concept.v1',
    sourcePath: 'lib/langchain/schemas/module-5/phase-4-solution-neutral-concept.ts',
    module: 'module-5',
    crawleyChapter: 'Ch 7',
    zodSchema: phase4SolutionNeutralConceptSchema,
  },
  {
    schemaId: 'module-5.phase-5-concept-expansion.v1',
    sourcePath: 'lib/langchain/schemas/module-5/phase-5-concept-expansion.ts',
    module: 'module-5',
    crawleyChapter: 'Ch 8',
    zodSchema: phase5ConceptExpansionSchema,
  },
  {
    schemaId: 'module-3.decomposition-plane.v1',
    sourcePath: 'lib/langchain/schemas/module-3/decomposition-plane.ts',
    module: 'module-3',
    crawleyChapter: 'Ch 13',
    zodSchema: decompositionPlaneArtifactSchema,
  },
  {
    schemaId: 'module-4.decision-network-foundations.v1',
    sourcePath: 'lib/langchain/schemas/module-4/decision-network-foundations.ts',
    module: 'module-4',
    crawleyChapter: 'Ch 14',
    zodSchema: decisionNetworkFoundationsSchema,
  },
  {
    schemaId: 'module-4.tradespace-pareto-sensitivity.v1',
    sourcePath: 'lib/langchain/schemas/module-4/tradespace-pareto-sensitivity.ts',
    module: 'module-4',
    crawleyChapter: 'Ch 15',
    zodSchema: tradespaceParetoSensitivitySchema,
  },
  {
    schemaId: 'module-4.optimization-patterns.v1',
    sourcePath: 'lib/langchain/schemas/module-4/optimization-patterns.ts',
    module: 'module-4',
    crawleyChapter: 'Ch 16',
    zodSchema: optimizationPatternsSchema,
  },
  {
    schemaId: 'module-2.requirements-crawley-extension.v1',
    sourcePath: 'lib/langchain/schemas/module-2/requirements-crawley-extension.ts',
    module: 'module-2',
    crawleyChapter: 'Ch 11',
    zodSchema: requirementsCrawleyExtensionSchema,
  },
] as const;

/**
 * Sentinel separate from `CRAWLEY_SCHEMAS` since this is a primitive used by
 * `module-5.phase-2` + `module-5.phase-3` consumers, not a top-level artifact.
 */
export const CRAWLEY_MATRIX_KEYSTONE = {
  schemaId: 'module-5._matrix.mathDerivationMatrix',
  sourcePath: 'lib/langchain/schemas/module-5/_matrix.ts',
  module: 'module-5' as const,
  crawleyChapter: 'Option Y (REQUIREMENTS-crawley §5)',
  zodSchema: mathDerivationMatrixSchema,
};
