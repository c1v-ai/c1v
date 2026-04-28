/**
 * Drizzle schemas for the 10 Wave-C Crawley artifact tables.
 *
 * Persists envelope-validated outputs from the Crawley schema layer
 * (REQUIREMENTS-crawley §6). Each table follows the same shape:
 *
 *   id              serial PK
 *   project_id      integer FK → projects.id, ON DELETE CASCADE, UNIQUE
 *   phase_status    text  ∈ {planned,in_progress,complete,needs_revision}
 *   schema_id       text  (frozen literal of the Zod schema id)
 *   payload         jsonb (full envelope-validated body)
 *   created_at      timestamptz
 *   updated_at      timestamptz (trigger-maintained)
 *
 * M3 decomposition-plane additionally hoists `decomposition_plane` (1 of 13
 * Crawley planes) out of payload for index access — drives filterable
 * cross-project comparisons against Box 13.8.
 *
 * RLS is enforced at the database layer (see migrations 0016–0025); the
 * Drizzle layer is purely typed bindings. Reads honor `app.current_role`
 * + `app.current_team_id` set by the request-scoped session helper.
 *
 * Migration set:
 *   0016_m5_phase_1_form_taxonomy
 *   0017_m5_phase_2_function_taxonomy
 *   0018_m5_phase_3_form_function_concept
 *   0019_m5_phase_4_solution_neutral_concept
 *   0020_m5_phase_5_concept_expansion
 *   0021_m3_decomposition_plane
 *   0022_m4_decision_network_foundations
 *   0023_m4_tradespace_pareto_sensitivity
 *   0024_m4_optimization_patterns
 *   0025_m2_requirements_crawley_extension
 *
 * @module lib/db/schema/crawley
 */

import {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { projects } from '../schema';

/**
 * Crawley artifact phase lifecycle (matches phaseEnvelopeSchema in
 * `lib/langchain/schemas/module-2/_shared.ts`).
 */
export const CRAWLEY_PHASE_STATUSES = [
  'planned',
  'in_progress',
  'complete',
  'needs_revision',
] as const;
export type CrawleyPhaseStatus = (typeof CRAWLEY_PHASE_STATUSES)[number];

// ──────────────────────────────────────────────────────────────────────
// M5 — Form / Function tower (Crawley Ch 4–8)
// ──────────────────────────────────────────────────────────────────────

export const m5Phase1FormTaxonomy = pgTable(
  'm5_phase_1_form_taxonomy',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-5.phase-1-form-taxonomy.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex('m5_phase_1_form_taxonomy_project_id_unique').on(
      t.projectId,
    ),
    phaseStatusIdx: index('m5_phase_1_form_taxonomy_phase_status_idx').on(
      t.phaseStatus,
    ),
  }),
);

export const m5Phase2FunctionTaxonomy = pgTable(
  'm5_phase_2_function_taxonomy',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-5.phase-2-function-taxonomy.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex('m5_phase_2_function_taxonomy_project_id_unique').on(
      t.projectId,
    ),
    phaseStatusIdx: index('m5_phase_2_function_taxonomy_phase_status_idx').on(
      t.phaseStatus,
    ),
  }),
);

export const m5Phase3FormFunctionConcept = pgTable(
  'm5_phase_3_form_function_concept',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-5.phase-3-form-function-concept.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm5_phase_3_form_function_concept_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index('m5_phase_3_form_function_concept_phase_status_idx').on(
      t.phaseStatus,
    ),
  }),
);

export const m5Phase4SolutionNeutralConcept = pgTable(
  'm5_phase_4_solution_neutral_concept',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-5.phase-4-solution-neutral-concept.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm5_phase_4_solution_neutral_concept_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index(
      'm5_phase_4_solution_neutral_concept_phase_status_idx',
    ).on(t.phaseStatus),
  }),
);

export const m5Phase5ConceptExpansion = pgTable(
  'm5_phase_5_concept_expansion',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-5.phase-5-concept-expansion.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm5_phase_5_concept_expansion_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index('m5_phase_5_concept_expansion_phase_status_idx').on(
      t.phaseStatus,
    ),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// M3 — Decomposition plane supplement (Crawley Ch 13)
// ──────────────────────────────────────────────────────────────────────

/** Crawley Box 13.8 — 13 decomposition planes. */
export const DECOMPOSITION_PLANES = [
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
] as const;
export type DecompositionPlane = (typeof DECOMPOSITION_PLANES)[number];

export const m3DecompositionPlane = pgTable(
  'm3_decomposition_plane',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-3.decomposition-plane.v1'),
    /** Hoisted out of payload for cross-project index access (Box 13.8). */
    decompositionPlane: text('decomposition_plane')
      .$type<DecompositionPlane>()
      .notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex('m3_decomposition_plane_project_id_unique').on(
      t.projectId,
    ),
    phaseStatusIdx: index('m3_decomposition_plane_phase_status_idx').on(
      t.phaseStatus,
    ),
    planeIdx: index('m3_decomposition_plane_plane_idx').on(t.decompositionPlane),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// M4 — Decision network / tradespace / optimization (Crawley Ch 14–16)
// ──────────────────────────────────────────────────────────────────────

export const m4DecisionNetworkFoundations = pgTable(
  'm4_decision_network_foundations',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-4.decision-network-foundations.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm4_decision_network_foundations_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index(
      'm4_decision_network_foundations_phase_status_idx',
    ).on(t.phaseStatus),
  }),
);

export const m4TradespaceParetoSensitivity = pgTable(
  'm4_tradespace_pareto_sensitivity',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-4.tradespace-pareto-sensitivity.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm4_tradespace_pareto_sensitivity_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index(
      'm4_tradespace_pareto_sensitivity_phase_status_idx',
    ).on(t.phaseStatus),
  }),
);

export const m4OptimizationPatterns = pgTable(
  'm4_optimization_patterns',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-4.optimization-patterns.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm4_optimization_patterns_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index('m4_optimization_patterns_phase_status_idx').on(
      t.phaseStatus,
    ),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// M2 — Requirements Crawley extension (Crawley Ch 11)
// ──────────────────────────────────────────────────────────────────────

export const m2RequirementsCrawleyExtension = pgTable(
  'm2_requirements_crawley_extension',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseStatus: text('phase_status')
      .$type<CrawleyPhaseStatus>()
      .notNull()
      .default('planned'),
    schemaId: text('schema_id')
      .notNull()
      .default('module-2.requirements-crawley-extension.v1'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdUnique: uniqueIndex(
      'm2_requirements_crawley_extension_project_id_unique',
    ).on(t.projectId),
    phaseStatusIdx: index(
      'm2_requirements_crawley_extension_phase_status_idx',
    ).on(t.phaseStatus),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// Type exports
// ──────────────────────────────────────────────────────────────────────

export type M5Phase1FormTaxonomyRow = typeof m5Phase1FormTaxonomy.$inferSelect;
export type NewM5Phase1FormTaxonomyRow =
  typeof m5Phase1FormTaxonomy.$inferInsert;

export type M5Phase2FunctionTaxonomyRow =
  typeof m5Phase2FunctionTaxonomy.$inferSelect;
export type NewM5Phase2FunctionTaxonomyRow =
  typeof m5Phase2FunctionTaxonomy.$inferInsert;

export type M5Phase3FormFunctionConceptRow =
  typeof m5Phase3FormFunctionConcept.$inferSelect;
export type NewM5Phase3FormFunctionConceptRow =
  typeof m5Phase3FormFunctionConcept.$inferInsert;

export type M5Phase4SolutionNeutralConceptRow =
  typeof m5Phase4SolutionNeutralConcept.$inferSelect;
export type NewM5Phase4SolutionNeutralConceptRow =
  typeof m5Phase4SolutionNeutralConcept.$inferInsert;

export type M5Phase5ConceptExpansionRow =
  typeof m5Phase5ConceptExpansion.$inferSelect;
export type NewM5Phase5ConceptExpansionRow =
  typeof m5Phase5ConceptExpansion.$inferInsert;

export type M3DecompositionPlaneRow = typeof m3DecompositionPlane.$inferSelect;
export type NewM3DecompositionPlaneRow =
  typeof m3DecompositionPlane.$inferInsert;

export type M4DecisionNetworkFoundationsRow =
  typeof m4DecisionNetworkFoundations.$inferSelect;
export type NewM4DecisionNetworkFoundationsRow =
  typeof m4DecisionNetworkFoundations.$inferInsert;

export type M4TradespaceParetoSensitivityRow =
  typeof m4TradespaceParetoSensitivity.$inferSelect;
export type NewM4TradespaceParetoSensitivityRow =
  typeof m4TradespaceParetoSensitivity.$inferInsert;

export type M4OptimizationPatternsRow =
  typeof m4OptimizationPatterns.$inferSelect;
export type NewM4OptimizationPatternsRow =
  typeof m4OptimizationPatterns.$inferInsert;

export type M2RequirementsCrawleyExtensionRow =
  typeof m2RequirementsCrawleyExtension.$inferSelect;
export type NewM2RequirementsCrawleyExtensionRow =
  typeof m2RequirementsCrawleyExtension.$inferInsert;

/** All Crawley artifact tables, indexed by short module/phase key. */
export const CRAWLEY_TABLES = {
  'm5.phase-1': m5Phase1FormTaxonomy,
  'm5.phase-2': m5Phase2FunctionTaxonomy,
  'm5.phase-3': m5Phase3FormFunctionConcept,
  'm5.phase-4': m5Phase4SolutionNeutralConcept,
  'm5.phase-5': m5Phase5ConceptExpansion,
  'm3.decomposition-plane': m3DecompositionPlane,
  'm4.decision-network': m4DecisionNetworkFoundations,
  'm4.tradespace': m4TradespaceParetoSensitivity,
  'm4.optimization': m4OptimizationPatterns,
  'm2.crawley-extension': m2RequirementsCrawleyExtension,
} as const;
