/**
 * Module 3 — Decomposition Plane Supplement (Crawley Ch 13).
 *
 * @module lib/langchain/schemas/module-3/decomposition-plane
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/2-requirements/05-crawley/crawley-ch13-decomposition-heuristics.md
 * @since 2026-04-26
 * @evidenceTier curated
 *
 * SUPPLEMENT shape (REQUIREMENTS-crawley §3) — does NOT extend phaseEnvelopeSchema.
 * Lighter envelope: { _schema, _phase_status, ...phase-local }. Promote to a
 * full phase later by extending phaseEnvelopeSchema if needed.
 */

import { z } from 'zod';
import { sourceRefSchema, mathDerivationSchema } from '../module-2/_shared';

export const decompositionPlaneSchema = z
  .enum([
    'delivered_function_emergence',
    'form_structure',
    'design_latitude',
    'changeability_evolution',
    'integration_transparency',
    'suppliers',
    'openness',
    'legacy_components',
    'clockspeed_technology',
    'marketing_sales',
    'operations_interoperability',
    'timing_of_investment',
    'organization_conway',
  ])
  .describe(
    'x-ui-surface=section:Decomposition > Plane — Crawley Box 13.8 thirteen decomposition planes.',
  );
export type DecompositionPlane = z.infer<typeof decompositionPlaneSchema>;

export const complexityKindSchema = z
  .enum(['apparent', 'actual', 'essential'])
  .describe(
    'x-ui-surface=section:Decomposition > Complexity — Crawley §13.2 three kinds.',
  );
export type ComplexityKind = z.infer<typeof complexityKindSchema>;

export const complexityMeasuresSchema = z
  .object({
    N1: z.number().int().nonnegative().describe(
      'x-ui-surface=section:Decomposition > Complexity — number of things.',
    ),
    N2: z.number().int().nonnegative().describe(
      'x-ui-surface=section:Decomposition > Complexity — types of things.',
    ),
    N3: z.number().int().nonnegative().describe(
      'x-ui-surface=section:Decomposition > Complexity — number of interfaces.',
    ),
    N4: z.number().int().nonnegative().describe(
      'x-ui-surface=section:Decomposition > Complexity — types of interfaces.',
    ),
    C_crawley: z.number().nonnegative().describe(
      'x-ui-surface=section:Decomposition > Complexity — C = N1+N2+N3+N4.',
    ),
    C_boothroyd_dewhurst: z.number().nonnegative().describe(
      'x-ui-surface=section:Decomposition > Complexity — (N1*N2*N3)^(1/3).',
    ),
    complexity_source: z.enum(['crawley', 'boothroyd_dewhurst']),
  })
  .describe(
    'x-ui-surface=section:Decomposition > Complexity — Crawley Box 13.1.',
  );
export type ComplexityMeasures = z.infer<typeof complexityMeasuresSchema>;

export const level1ClusterSchema = z
  .object({
    cluster_id: z.string(),
    name: z.string(),
    entities: z.array(z.string()).min(1),
    internal_coupling_score: z.number().min(0).max(1),
    external_coupling_score: z.number().min(0).max(1),
    level_2_detail_populated: z.boolean(),
    level_2_relationship_evidence: z.string(),
    needs_subdivision: z.boolean().default(false),
    consider_merging_level: z.boolean().default(false),
  })
  .describe(
    'x-ui-surface=section:Decomposition > Level 1 — one Level-1 cluster with required 2-Down-1-Up evidence.',
  );
export type Level1Cluster = z.infer<typeof level1ClusterSchema>;

export const conwayLawAlignmentSchema = z
  .object({
    target_organizational_structure: z.string().nullable(),
    aligned: z.boolean().nullable(),
    misalignment_notes: z.string().nullable(),
  })
  .describe(
    "x-ui-surface=section:Decomposition > Conway's Law — Box 13.8 plane 13.",
  );
export type ConwayLawAlignment = z.infer<typeof conwayLawAlignmentSchema>;

export const decompositionPlaneArtifactSchema = z
  .object({
    _schema: z.literal('module-3.decomposition-plane.v1'),
    _phase_status: z.enum(['planned', 'in_progress', 'complete', 'needs_revision']),
    decomposition_plane: decompositionPlaneSchema,
    plane_alignment_score: z.number().min(0).max(1),
    plane_rationale: z.string(),
    complexity_measures: complexityMeasuresSchema,
    complexity_derivations: z
      .object({
        crawley: mathDerivationSchema,
        boothroyd_dewhurst: mathDerivationSchema.optional(),
      })
      .describe(
        'x-ui-surface=section:Decomposition > Complexity — scalar mathDerivation records.',
      ),
    essential_complexity: z.number().int().nonnegative(),
    delta_above_essential: z.number().int(),
    gratuitous_complexity_flag: z.boolean(),
    level_1_clusters: z.array(level1ClusterSchema).min(1),
    conway_law_alignment: conwayLawAlignmentSchema.optional(),
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M3 Decomposition Plane supplement per Crawley Ch 13.',
  )
  .superRefine((val, ctx) => {
    // 2-Down-1-Up gate (Box 13.6) on complete.
    if (val._phase_status === 'complete') {
      const missingL2 = val.level_1_clusters.filter((c) => !c.level_2_detail_populated);
      if (missingL2.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['level_1_clusters'],
          message: `Crawley Box 13.6 "2 Down, 1 Up": ${missingL2.length} cluster(s) lack Level-2 detail.`,
        });
      }
    }
    // 7±2 hard cap.
    for (const cluster of val.level_1_clusters) {
      if (cluster.entities.length > 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['level_1_clusters'],
          message: `Crawley line 6245: cluster "${cluster.name}" has ${cluster.entities.length} entities (>9). Subdivide.`,
        });
      }
    }
    // Elegance advisory (Box 13.7).
    if (val._phase_status === 'complete' && val.plane_alignment_score < 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plane_alignment_score'],
        message: `Crawley Box 13.7: plane_alignment_score=${val.plane_alignment_score} < 0.5. Space Station Freedom anti-pattern.`,
      });
    }
  });
export type DecompositionPlaneArtifact = z.infer<typeof decompositionPlaneArtifactSchema>;
