/**
 * lib/langchain/schemas/engines/engine.ts
 *
 * Zod boundary schemas + type story for the kb-runtime engine layer
 * (G1–G11 per `plans/kb-runtime-architecture.md`). Anchors
 * `lib/langchain/engines/` — the runtime that consumes these schemas at
 * engine.json load time and at module-ref parse time.
 *
 * Runtime types live in `engines/nfr-engine-interpreter.ts` (authoritative
 * shape per the 2026-04-22 runtime-peer spec); they are re-exported here so
 * engine-loader / artifact-reader / context-resolver can import schema +
 * type from a single module without pulling in interpreter internals.
 *
 * @module lib/langchain/schemas/engines/engine
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// Runtime type re-exports
// ─────────────────────────────────────────────────────────────────────────

export type {
  ConfidenceModifier,
  DecisionRef,
  EngineDecisionFunction,
  EngineDoc,
  EngineInputSpec,
  EngineRule,
  EngineRuleDefault,
  EngineRuleMatch,
} from '../../engines/nfr-engine-interpreter';

// ─────────────────────────────────────────────────────────────────────────
// Module-ref story
//
// Module slugs use the dashed long form ("module-2") to match the artifact
// reader's registry keys (lib/langchain/engines/artifact-reader.ts) and the
// `apps/product-helper/lib/langchain/schemas/module-N` barrel naming.
// ─────────────────────────────────────────────────────────────────────────

export const MODULE_SLUGS = [
  'module-1',
  'module-2',
  'module-3',
  'module-4',
  'module-5',
  'module-6',
  'module-7',
  'module-8',
] as const;

export type ModuleSlug = (typeof MODULE_SLUGS)[number];

export const moduleRefSchema = z.object({
  module: z.enum(MODULE_SLUGS),
  phase_slug: z.string().min(1),
});

export type ModuleRef = z.infer<typeof moduleRefSchema>;

/**
 * Parse `"module-2/phase-0-ingest"` → typed `ModuleRef`. Returns `null`
 * for any string that doesn't match the module-ref shape, so callers can
 * use `?? undefined` to treat non-module sources (intake / rag / context)
 * gracefully (see context-resolver.ts:155).
 */
export function parseModuleRefString(s: string): ModuleRef | null {
  if (!s || typeof s !== 'string') return null;
  const idx = s.indexOf('/');
  if (idx < 0) return null;
  const module = s.slice(0, idx);
  const phase_slug = s.slice(idx + 1);
  const result = moduleRefSchema.safeParse({ module, phase_slug });
  return result.success ? result.data : null;
}

// ─────────────────────────────────────────────────────────────────────────
// Predicate boundary
//
// Predicates are authored as plain JSON in engine.json files. The runtime
// evaluator (lib/langchain/engines/predicate-dsl.ts) accepts a permissive
// `Record<string, unknown>` shape; the load-time Zod boundary mirrors that
// permissiveness — structural validation lives in the evaluator, not here.
// ─────────────────────────────────────────────────────────────────────────

const predicateSchema: z.ZodType<Record<string, unknown>> = z.record(z.unknown());

// ─────────────────────────────────────────────────────────────────────────
// Engine.json shape — Zod boundary for load-time validation
// ─────────────────────────────────────────────────────────────────────────

const ruleValueSchema = z.union([z.number(), z.string()]);

const engineInputSpecSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
});

const engineRuleMatchSchema = z.object({
  if: predicateSchema,
  value: ruleValueSchema,
  units: z.string().optional(),
  base_confidence: z.number().min(0).max(1),
  rule_id: z.string().optional(),
});

const engineRuleDefaultSchema = z.object({
  default: z.object({
    value: ruleValueSchema,
    units: z.string().optional(),
    base_confidence: z.number().min(0).max(1),
    rule_id: z.string().optional(),
  }),
});

const engineRuleSchema = z.union([engineRuleMatchSchema, engineRuleDefaultSchema]);

const engineDecisionFunctionSchema = z.object({
  type: z.literal('decision_tree'),
  rules: z.array(engineRuleSchema).min(1),
});

const confidenceModifierSchema = z.object({
  when: z.string().min(1),
  delta: z.number(),
  cap: z.number().optional(),
});

const decisionRefSchema = z.object({
  decision_id: z.string().min(1),
  target_field: z.string().min(1),
  inputs: z.array(engineInputSpecSchema),
  function: engineDecisionFunctionSchema,
  confidence_modifiers: z.array(confidenceModifierSchema).optional(),
  auto_fill_threshold: z.number().min(0).max(1).optional(),
  fallback: z
    .object({
      action: z.literal('surface_to_user'),
      question_id: z.string().min(1),
    })
    .optional(),
});

export const engineDocSchema = z.object({
  story_id: z.string().min(1),
  version: z.string().min(1),
  decisions: z.array(decisionRefSchema).min(1),
});
