/**
 * Typed query helpers for the 10 Wave-C Crawley artifact tables.
 *
 * Each table follows the same upsert-by-project_id pattern (UNIQUE on
 * project_id; one row per project mutated in place by the M-phase agent).
 * The helpers below honor RLS — they assume the caller has already set
 * `app.current_role` + `app.current_team_id` via the request-scoped
 * session helper. Service-role writers (sidecar / orchestrator) bypass
 * the EXISTS gate via `<table>_service_all` policies.
 *
 * Spec: REQUIREMENTS-crawley §6 + Wave-C migrations 0016–0025.
 *
 * @module lib/db/crawley-queries
 */

import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import {
  m5Phase1FormTaxonomy,
  m5Phase2FunctionTaxonomy,
  m5Phase3FormFunctionConcept,
  m5Phase4SolutionNeutralConcept,
  m5Phase5ConceptExpansion,
  m3DecompositionPlane,
  m4DecisionNetworkFoundations,
  m4TradespaceParetoSensitivity,
  m4OptimizationPatterns,
  m2RequirementsCrawleyExtension,
  type CrawleyPhaseStatus,
  type DecompositionPlane,
  type M5Phase1FormTaxonomyRow,
  type M5Phase2FunctionTaxonomyRow,
  type M5Phase3FormFunctionConceptRow,
  type M5Phase4SolutionNeutralConceptRow,
  type M5Phase5ConceptExpansionRow,
  type M3DecompositionPlaneRow,
  type M4DecisionNetworkFoundationsRow,
  type M4TradespaceParetoSensitivityRow,
  type M4OptimizationPatternsRow,
  type M2RequirementsCrawleyExtensionRow,
} from './schema/crawley';

/**
 * Common upsert payload for the uniform Crawley tables (every table EXCEPT
 * M3 decomposition-plane carries this shape).
 */
export interface CrawleyUpsertPayload {
  phaseStatus: CrawleyPhaseStatus;
  payload: Record<string, unknown>;
}

// ──────────────────────────────────────────────────────────────────────
// M5 — Form / Function tower
// ──────────────────────────────────────────────────────────────────────

export async function getCrawleyM5FormTaxonomy(
  projectId: number,
): Promise<M5Phase1FormTaxonomyRow | null> {
  const rows = await db
    .select()
    .from(m5Phase1FormTaxonomy)
    .where(eq(m5Phase1FormTaxonomy.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM5FormTaxonomy(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M5Phase1FormTaxonomyRow> {
  const existing = await getCrawleyM5FormTaxonomy(projectId);
  if (existing) {
    const [row] = await db
      .update(m5Phase1FormTaxonomy)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m5Phase1FormTaxonomy.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m5Phase1FormTaxonomy)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

export async function getCrawleyM5FunctionTaxonomy(
  projectId: number,
): Promise<M5Phase2FunctionTaxonomyRow | null> {
  const rows = await db
    .select()
    .from(m5Phase2FunctionTaxonomy)
    .where(eq(m5Phase2FunctionTaxonomy.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM5FunctionTaxonomy(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M5Phase2FunctionTaxonomyRow> {
  const existing = await getCrawleyM5FunctionTaxonomy(projectId);
  if (existing) {
    const [row] = await db
      .update(m5Phase2FunctionTaxonomy)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m5Phase2FunctionTaxonomy.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m5Phase2FunctionTaxonomy)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

export async function getCrawleyM5FormFunctionConcept(
  projectId: number,
): Promise<M5Phase3FormFunctionConceptRow | null> {
  const rows = await db
    .select()
    .from(m5Phase3FormFunctionConcept)
    .where(eq(m5Phase3FormFunctionConcept.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM5FormFunctionConcept(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M5Phase3FormFunctionConceptRow> {
  const existing = await getCrawleyM5FormFunctionConcept(projectId);
  if (existing) {
    const [row] = await db
      .update(m5Phase3FormFunctionConcept)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m5Phase3FormFunctionConcept.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m5Phase3FormFunctionConcept)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

export async function getCrawleyM5SolutionNeutralConcept(
  projectId: number,
): Promise<M5Phase4SolutionNeutralConceptRow | null> {
  const rows = await db
    .select()
    .from(m5Phase4SolutionNeutralConcept)
    .where(eq(m5Phase4SolutionNeutralConcept.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM5SolutionNeutralConcept(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M5Phase4SolutionNeutralConceptRow> {
  const existing = await getCrawleyM5SolutionNeutralConcept(projectId);
  if (existing) {
    const [row] = await db
      .update(m5Phase4SolutionNeutralConcept)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m5Phase4SolutionNeutralConcept.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m5Phase4SolutionNeutralConcept)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

export async function getCrawleyM5ConceptExpansion(
  projectId: number,
): Promise<M5Phase5ConceptExpansionRow | null> {
  const rows = await db
    .select()
    .from(m5Phase5ConceptExpansion)
    .where(eq(m5Phase5ConceptExpansion.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM5ConceptExpansion(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M5Phase5ConceptExpansionRow> {
  const existing = await getCrawleyM5ConceptExpansion(projectId);
  if (existing) {
    const [row] = await db
      .update(m5Phase5ConceptExpansion)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m5Phase5ConceptExpansion.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m5Phase5ConceptExpansion)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

// ──────────────────────────────────────────────────────────────────────
// M3 — Decomposition plane (carries hoisted decomposition_plane column)
// ──────────────────────────────────────────────────────────────────────

export interface CrawleyM3UpsertPayload extends CrawleyUpsertPayload {
  decompositionPlane: DecompositionPlane;
}

export async function getCrawleyM3DecompositionPlane(
  projectId: number,
): Promise<M3DecompositionPlaneRow | null> {
  const rows = await db
    .select()
    .from(m3DecompositionPlane)
    .where(eq(m3DecompositionPlane.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM3DecompositionPlane(
  projectId: number,
  payload: CrawleyM3UpsertPayload,
): Promise<M3DecompositionPlaneRow> {
  const existing = await getCrawleyM3DecompositionPlane(projectId);
  if (existing) {
    const [row] = await db
      .update(m3DecompositionPlane)
      .set({
        phaseStatus: payload.phaseStatus,
        decompositionPlane: payload.decompositionPlane,
        payload: payload.payload,
      })
      .where(eq(m3DecompositionPlane.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m3DecompositionPlane)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      decompositionPlane: payload.decompositionPlane,
      payload: payload.payload,
    })
    .returning();
  return row;
}

// ──────────────────────────────────────────────────────────────────────
// M4 — Decision network / tradespace / optimization
// ──────────────────────────────────────────────────────────────────────

export async function getCrawleyM4DecisionNetwork(
  projectId: number,
): Promise<M4DecisionNetworkFoundationsRow | null> {
  const rows = await db
    .select()
    .from(m4DecisionNetworkFoundations)
    .where(eq(m4DecisionNetworkFoundations.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM4DecisionNetwork(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M4DecisionNetworkFoundationsRow> {
  const existing = await getCrawleyM4DecisionNetwork(projectId);
  if (existing) {
    const [row] = await db
      .update(m4DecisionNetworkFoundations)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m4DecisionNetworkFoundations.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m4DecisionNetworkFoundations)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

export async function getCrawleyM4Tradespace(
  projectId: number,
): Promise<M4TradespaceParetoSensitivityRow | null> {
  const rows = await db
    .select()
    .from(m4TradespaceParetoSensitivity)
    .where(eq(m4TradespaceParetoSensitivity.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM4Tradespace(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M4TradespaceParetoSensitivityRow> {
  const existing = await getCrawleyM4Tradespace(projectId);
  if (existing) {
    const [row] = await db
      .update(m4TradespaceParetoSensitivity)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m4TradespaceParetoSensitivity.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m4TradespaceParetoSensitivity)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

export async function getCrawleyM4Optimization(
  projectId: number,
): Promise<M4OptimizationPatternsRow | null> {
  const rows = await db
    .select()
    .from(m4OptimizationPatterns)
    .where(eq(m4OptimizationPatterns.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM4Optimization(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M4OptimizationPatternsRow> {
  const existing = await getCrawleyM4Optimization(projectId);
  if (existing) {
    const [row] = await db
      .update(m4OptimizationPatterns)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m4OptimizationPatterns.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m4OptimizationPatterns)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}

// ──────────────────────────────────────────────────────────────────────
// M2 — Requirements Crawley extension
// ──────────────────────────────────────────────────────────────────────

export async function getCrawleyM2RequirementsExtension(
  projectId: number,
): Promise<M2RequirementsCrawleyExtensionRow | null> {
  const rows = await db
    .select()
    .from(m2RequirementsCrawleyExtension)
    .where(eq(m2RequirementsCrawleyExtension.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertCrawleyM2RequirementsExtension(
  projectId: number,
  payload: CrawleyUpsertPayload,
): Promise<M2RequirementsCrawleyExtensionRow> {
  const existing = await getCrawleyM2RequirementsExtension(projectId);
  if (existing) {
    const [row] = await db
      .update(m2RequirementsCrawleyExtension)
      .set({ phaseStatus: payload.phaseStatus, payload: payload.payload })
      .where(eq(m2RequirementsCrawleyExtension.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(m2RequirementsCrawleyExtension)
    .values({
      projectId,
      phaseStatus: payload.phaseStatus,
      payload: payload.payload,
    })
    .returning();
  return row;
}
