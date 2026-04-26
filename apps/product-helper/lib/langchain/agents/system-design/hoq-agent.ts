/**
 * hoq-agent (T6 Wave 4 — terminal synthesis).
 *
 * Orchestrates Module 6 House of Quality (QFD). Per v2 §0.3.4 M6 HoQ folds
 * into Wave-4 synthesis because EC enumeration depends on the M4 decision-
 * network winner (T4b Wave-3 close, tag `t4b-wave-3-complete`).
 *
 * Hard upstream dependencies (NO soft fallbacks):
 *   - m2/nfrs.v2.json                 (Front Porch traceback source)
 *   - m2/constants.v2.json            (EC + target traceback source)
 *   - m4/decision_network.v1.json     (EC derivation: winner's measurable properties)
 *   - generated/atlas/*.schema.json   (KB-8 archetypes for competitive bench)
 *
 * Portfolio-demo stance (matches T4b/T5 Wave-3 pattern): LLM adapter is
 * stubbed; the agent runs deterministically against hand-curated upstream
 * artifacts and emits a schema-valid `hoq.v1.json`. Real LLM wiring is a
 * future post-portfolio extension.
 *
 * @module lib/langchain/agents/system-design/hoq-agent
 */

import { withAgentMetricsSync } from '@/lib/observability/synthesis-metrics';
import {
  hoqV1Schema,
  customerRequirementsArtifactSchema,
  engineeringCharacteristicsArtifactSchema,
  relationshipMatrixArtifactSchema,
  roofCorrelationsArtifactSchema,
  targetValuesArtifactSchema,
  competitiveBenchmarksArtifactSchema,
  SYMBOL_TO_INT,
  type HoqV1,
  type CustomerRequirementsArtifact,
  type EngineeringCharacteristicsArtifact,
  type RelationshipMatrixArtifact,
  type RoofCorrelationsArtifact,
  type TargetValuesArtifact,
  type CompetitiveBenchmarksArtifact,
  type CorrelationSymbol,
} from '../../schemas/module-6-hoq';

export const HOQ_AGENT_VERSION = '1.0.0-t6';

import type { OpenQuestionEvent } from '@/lib/chat/system-question-bridge.types';

/**
 * Emitter contract — runtime caller supplies the bridge.surfaceOpenQuestion
 * binding. Agent calls `emit` for relationship-matrix or target-value
 * decisions that need user input. Partial QFD is acceptable: missing rows
 * surface in chat instead of throwing.
 */
export type HoqOpenQuestionEmitter = (
  ev: Omit<OpenQuestionEvent, 'source'>,
) => Promise<unknown>;

/** Confidence threshold for HoQ cell/target-value decisions. */
export const HOQ_OPEN_QUESTION_CONFIDENCE_THRESHOLD = 0.9;

/**
 * Decision-point hook for HoQ cells / target-values that fall below the
 * confidence threshold. Caller continues building the rest of the matrix
 * after a successful emission.
 */
export async function maybeSurfaceHoqOpenQuestion(args: {
  emit?: HoqOpenQuestionEmitter;
  project_id: number;
  final_confidence: number;
  question: string;
  computed_options?: unknown[];
  math_trace?: string;
  threshold?: number;
}): Promise<boolean> {
  const t = args.threshold ?? HOQ_OPEN_QUESTION_CONFIDENCE_THRESHOLD;
  if (!args.emit || args.final_confidence >= t) return false;
  await args.emit({
    project_id: args.project_id,
    question: args.question,
    computed_options: args.computed_options,
    math_trace: args.math_trace,
  });
  return true;
}

/**
 * Compute weights_check for Phase 1. Sums relative_importance and produces
 * the `passes` flag at given tolerance.
 */
export function computeWeightsCheck(
  rows: Array<{ relative_importance: number }>,
  tolerance = 1e-3,
): { sum: number; passes: boolean; tolerance: number } {
  const sum = rows.reduce((a, r) => a + r.relative_importance, 0);
  return {
    sum,
    passes: Math.abs(sum - 1.0) <= tolerance,
    tolerance,
  };
}

/**
 * Compute Phase-3 stats from the cells. Returns the stats block expected by
 * relationshipMatrixArtifactSchema.superRefine.
 */
export function computeRelationshipStats(args: {
  pc_order: string[];
  ec_order: number[];
  rows: Array<{ pc_id: string; cells: Record<string, number> }>;
  sparsity_floor_pct: number;
}): {
  total_cells: number;
  nonzero_cells: number;
  sparsity_pct: number;
  meets_sparsity_threshold: boolean;
  rows_without_nonzero: string[];
  cols_without_nonzero: number[];
} {
  let total = 0;
  let nonzero = 0;
  const rowsWithoutNonzero: string[] = [];
  const colsHit = new Set<number>();
  for (const row of args.rows) {
    let rowHas = false;
    for (const ec of args.ec_order) {
      total += 1;
      const v = row.cells[`EC${ec}`] ?? 0;
      if (v !== 0) {
        nonzero += 1;
        rowHas = true;
        colsHit.add(ec);
      }
    }
    if (!rowHas) rowsWithoutNonzero.push(row.pc_id);
  }
  const sparsity_pct = total === 0 ? 0 : (1 - nonzero / total) * 100;
  const meets =
    nonzero / Math.max(1, total) >= args.sparsity_floor_pct / 100;
  const cols_without_nonzero = args.ec_order.filter((e) => !colsHit.has(e));
  return {
    total_cells: total,
    nonzero_cells: nonzero,
    sparsity_pct: Math.round(sparsity_pct * 100) / 100,
    meets_sparsity_threshold: meets,
    rows_without_nonzero: rowsWithoutNonzero,
    cols_without_nonzero,
  };
}

/**
 * Compute Phase-4 roof stats given pairs and EC axis size.
 */
export function computeRoofStats(args: {
  ec_axis_size: number;
  pairs: Array<{ pair_key: string; integer_value: number }>;
  tradeoffs_flagged_for_design_targets?: string[];
}): {
  total_lower_triangle_pairs: number;
  nonzero_pairs: number;
  nonzero_pct: number;
  tradeoffs_flagged_for_design_targets: string[];
} {
  const n = args.ec_axis_size;
  const total = (n * (n - 1)) / 2;
  const nonzero = args.pairs.filter((p) => p.integer_value !== 0).length;
  const pct = total === 0 ? 0 : (nonzero / total) * 100;
  return {
    total_lower_triangle_pairs: total,
    nonzero_pairs: nonzero,
    nonzero_pct: Math.round(pct * 100) / 100,
    tradeoffs_flagged_for_design_targets:
      args.tradeoffs_flagged_for_design_targets ?? [],
  };
}

/** Map roof symbol -> integer using the canonical table. */
export function symbolToInt(s: CorrelationSymbol): number {
  return SYMBOL_TO_INT[s];
}

/**
 * Validate a fully-assembled hoq.v1 object via Zod parse. Throws on any
 * cross-phase referential or structural violation.
 */
export function validateHoqArtifact(raw: unknown): HoqV1 {
  return hoqV1Schema.parse(raw);
}

/**
 * Per-phase validation entry points (used by verify-t6 runner + unit tests).
 */
export const phaseValidators = {
  customerRequirements: (raw: unknown): CustomerRequirementsArtifact =>
    customerRequirementsArtifactSchema.parse(raw),
  engineeringCharacteristics: (raw: unknown): EngineeringCharacteristicsArtifact =>
    engineeringCharacteristicsArtifactSchema.parse(raw),
  relationshipMatrix: (raw: unknown): RelationshipMatrixArtifact =>
    relationshipMatrixArtifactSchema.parse(raw),
  roofCorrelations: (raw: unknown): RoofCorrelationsArtifact =>
    roofCorrelationsArtifactSchema.parse(raw),
  targetValues: (raw: unknown): TargetValuesArtifact =>
    targetValuesArtifactSchema.parse(raw),
  competitiveBenchmarks: (raw: unknown): CompetitiveBenchmarksArtifact =>
    competitiveBenchmarksArtifactSchema.parse(raw),
} as const;

/**
 * Cross-phase referential checks not enforceable inside individual Zod
 * schemas (they only see one phase). Asserts:
 *   - every PC in the relationship matrix has a row in customer_requirements
 *   - every EC referenced (in matrix, roof, targets, basement) exists in
 *     engineering_characteristics.rows
 *   - every back_porch row pc_id has a customer_requirements row
 *   - target_values + basement_competitors cover every EC
 */
export function crossPhaseReferentialCheck(art: HoqV1): void {
  const pcSet = new Set(art.customer_requirements.rows.map((r) => r.pc_id));
  const ecSet = new Set(
    art.engineering_characteristics.rows.map((r) => r.ec_id),
  );

  for (const pc of art.relationship_matrix.pc_order) {
    if (!pcSet.has(pc)) {
      throw new Error(`relationship_matrix references unknown PC ${pc}`);
    }
  }
  for (const ec of art.relationship_matrix.ec_order) {
    if (!ecSet.has(ec)) {
      throw new Error(`relationship_matrix references unknown EC ${ec}`);
    }
  }
  for (const ec of art.roof_correlations.ec_axis) {
    if (!ecSet.has(ec)) {
      throw new Error(`roof_correlations references unknown EC ${ec}`);
    }
  }
  for (const r of art.target_values.rows) {
    if (!ecSet.has(r.ec_id)) {
      throw new Error(`target_values references unknown EC ${r.ec_id}`);
    }
  }
  for (const r of art.competitive_benchmarks.basement_competitors) {
    if (!ecSet.has(r.ec_id)) {
      throw new Error(`basement_competitors references unknown EC ${r.ec_id}`);
    }
  }
  for (const r of art.competitive_benchmarks.back_porch) {
    if (!pcSet.has(r.pc_id)) {
      throw new Error(`back_porch references unknown PC ${r.pc_id}`);
    }
  }

  const targetEcSet = new Set(art.target_values.rows.map((r) => r.ec_id));
  for (const ec of ecSet) {
    if (!targetEcSet.has(ec)) {
      throw new Error(`target_values missing EC ${ec}`);
    }
  }
  const basementEcSet = new Set(
    art.competitive_benchmarks.basement_competitors.map((r) => r.ec_id),
  );
  for (const ec of ecSet) {
    if (!basementEcSet.has(ec)) {
      throw new Error(`basement_competitors missing EC ${ec}`);
    }
  }
}

/**
 * Full assembly + validation flow. Caller passes the six phase artifacts;
 * agent envelopes them into hoq.v1 and runs schema + referential checks.
 */
export function assembleHoqV1(args: {
  output_path: string;
  upstream_refs: HoqV1['_upstream_refs'];
  winning_concept: string;
  produced_at: string;
  produced_by: string;
  system_name: string;
  metadata: HoqV1['metadata'];
  customer_requirements: CustomerRequirementsArtifact;
  engineering_characteristics: EngineeringCharacteristicsArtifact;
  relationship_matrix: RelationshipMatrixArtifact;
  roof_correlations: RoofCorrelationsArtifact;
  target_values: TargetValuesArtifact;
  competitive_benchmarks: CompetitiveBenchmarksArtifact;
}): HoqV1 {
  return withAgentMetricsSync({ agent: 'hoq' }, () => assembleHoqV1Inner(args));
}

function assembleHoqV1Inner(args: {
  output_path: string;
  upstream_refs: HoqV1['_upstream_refs'];
  winning_concept: string;
  produced_at: string;
  produced_by: string;
  system_name: string;
  metadata: HoqV1['metadata'];
  customer_requirements: CustomerRequirementsArtifact;
  engineering_characteristics: EngineeringCharacteristicsArtifact;
  relationship_matrix: RelationshipMatrixArtifact;
  roof_correlations: RoofCorrelationsArtifact;
  target_values: TargetValuesArtifact;
  competitive_benchmarks: CompetitiveBenchmarksArtifact;
}): HoqV1 {
  const candidate: HoqV1 = {
    _schema: 'module-6.hoq.v1',
    _output_path: args.output_path,
    _upstream_refs: args.upstream_refs,
    _winning_concept: args.winning_concept,
    produced_at: args.produced_at,
    produced_by: args.produced_by,
    system_name: args.system_name,
    metadata: args.metadata,
    customer_requirements: args.customer_requirements,
    engineering_characteristics: args.engineering_characteristics,
    relationship_matrix: args.relationship_matrix,
    roof_correlations: args.roof_correlations,
    target_values: args.target_values,
    competitive_benchmarks: args.competitive_benchmarks,
  };
  const validated = validateHoqArtifact(candidate);
  crossPhaseReferentialCheck(validated);
  return validated;
}
