/**
 * NFR Engine — type contract
 *
 * Wave E (v2.2) deterministic-rule-tree-first engine. Type shapes are
 * 1:1 with the `decision_audit` table (migration `0011b_decision_audit.sql`)
 * — that table is the source-of-truth for EngineOutput. Do not drift.
 *
 * Contract pin (v2.1 lines 498–504, FROZEN):
 *  - `nfr_engine_contract_version: 'v1'` on every EngineOutput envelope.
 *    Bump only via a new ADR + Wave A re-thread.
 *  - failure semantics: `final_confidence < 0.90` AND `decision.llm_assist === false`
 *    AND no fallback rule matched → emit `{ status: 'needs_user_input', ... }`.
 *    NEVER throw.
 *
 * @module langchain/engine/types
 */

import { z } from 'zod';

// ─── Predicate DSL ──────────────────────────────────────────────────────
//
// JSON-shaped predicates so engine.json story trees consume the DSL as data.
// JS-closure predicates DEFEAT the purpose of authoring rules in JSON.

/** Operators supported by the predicate DSL evaluator (G3). */
export const PREDICATE_OPS = [
  '_contains',
  '_in',
  '_range',
  '_gt',
  '_lt',
  '_eq',
  '_and',
  '_or',
  '_not',
] as const;

export type PredicateOp = (typeof PREDICATE_OPS)[number];

/**
 * Predicate AST node.
 *
 * `args` shape varies by op:
 *  - `_contains`: [needle, haystack]            (haystack: string | unknown[])
 *  - `_in`:       [value, list]                  (list: unknown[])
 *  - `_range`:    [value, lo, hi]                (inclusive)
 *  - `_gt|_lt`:   [a, b]                         (numeric)
 *  - `_eq`:       [a, b]                         (deep-equal scalar/array)
 *  - `_and|_or`:  Predicate[]                    (variadic; min 1)
 *  - `_not`:      [Predicate]                    (single child)
 *
 * Bare leaves (`{op:'_eq', args:[...]}`) are the only way to compose.
 */
export const PredicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.object({
    op: z.enum(PREDICATE_OPS),
    args: z.array(z.unknown()).min(1),
  })
);

export interface Predicate {
  op: PredicateOp;
  args: unknown[];
}

// ─── EngineDecision (input) ─────────────────────────────────────────────
//
// One node from an engine.json story tree. The interpreter walks
// `predicates` in order; on first match emits `value` from the matched
// rule's branch (carried by the predicate match shape — see interpreter).

/**
 * Modifier — adjustment applied to confidence after rule match.
 * `applies_when` predicate gates the modifier; if absent, always applied.
 */
export const ModifierSchema = z.object({
  id: z.string(),
  delta: z.number(),
  applies_when: PredicateSchema.optional(),
  reason: z.string().optional(),
});

export type Modifier = z.infer<typeof ModifierSchema>;

/**
 * Rule — predicate + value the rule emits on match.
 * `base_confidence` is the rule's intrinsic confidence; modifiers stack on top.
 */
export const RuleSchema = z.object({
  rule_id: z.string(),
  predicate: PredicateSchema,
  value: z.unknown(),
  units: z.string().optional(),
  base_confidence: z.number().min(0).max(1),
  math_trace: z.string(),
});

export type Rule = z.infer<typeof RuleSchema>;

/**
 * Fallback — emitted when no rule predicate matches.
 * `computed_options` surface to the user via `system-question-bridge.ts`
 * when the engine needs user input.
 */
export const FallbackSchema = z.object({
  reason: z.string(),
  computed_options: z.array(z.unknown()).optional(),
  default_value: z.unknown().optional(),
  base_confidence: z.number().min(0).max(1).default(0),
  math_trace: z.string(),
});

export type Fallback = z.infer<typeof FallbackSchema>;

export const EngineDecisionSchema = z.object({
  /** Stable id — written to decision_audit.decision_id. */
  decision_id: z.string(),
  /** Field this decision populates (e.g. `nfrs[NFR-001].target_value`). */
  target_field: z.string(),
  /** Artifact this decision contributes to (e.g. `module-2/nfrs`). */
  target_artifact: z.string(),
  /** Story tree id (e.g. `story-03-latency-budget`). */
  story_id: z.string(),
  /** Author-pinned semver of the engine.json that produced this decision. */
  engine_version: z.string(),
  /** Whether the LLM-refine fallback is allowed for this decision. */
  llm_assist: z.boolean().default(true),
  /** Whether the user can override the auto-filled value. */
  user_overrideable: z.boolean().default(true),
  /** Ordered rule list — first match wins. */
  rules: z.array(RuleSchema).min(1),
  /** Confidence-adjusting modifiers applied post-match. */
  modifiers: z.array(ModifierSchema).default([]),
  /** Surface when no rule matches (or all matched rules fail). */
  fallback: FallbackSchema,
});

export type EngineDecision = z.infer<typeof EngineDecisionSchema>;

// ─── EvalContext (input) ────────────────────────────────────────────────
//
// What the predicate DSL evaluates against. Free-form on purpose —
// G4 (ContextResolver / ArtifactReader) is the producer; G1 only needs
// to read scalar/array fields by dot-path.

export const EvalContextSchema = z.object({
  /** Project id (foreign key to projects.id). */
  project_id: z.number().int().positive(),
  /** Intake-stage extracted data (M0–M2). */
  intake: z.record(z.string(), z.unknown()).default({}),
  /** Upstream artifacts already produced (M3+). */
  upstream: z.record(z.string(), z.unknown()).default({}),
  /** RAG hits from `kb_chunks`. Empty until G4 wires ContextResolver. */
  kb_chunks: z
    .array(
      z.object({
        id: z.string().uuid(),
        kb_source: z.string(),
        text: z.string(),
        score: z.number().min(0).max(1),
      })
    )
    .default([]),
  /** Whether RAG was attempted for this evaluation. */
  rag_attempted: z.boolean().default(false),
  /** Free-form scratch for ContextResolver-derived signals. */
  derived: z.record(z.string(), z.unknown()).default({}),
});

export type EvalContext = z.infer<typeof EvalContextSchema>;

// ─── EngineOutput (output) ──────────────────────────────────────────────
//
// 1:1 with `decision_audit` columns. See migration 0011b_decision_audit.sql
// header for the column ↔ field mapping. NEVER drift this shape.
//
// Disposition flags are mutually exclusive (DB CHECK enforces):
//  - status='ready'             → auto_filled=true,  needs_user_input=false
//  - status='needs_user_input'  → auto_filled=false, needs_user_input=true,
//                                  computed_options non-null
//  - status='failed'            → auto_filled=false, needs_user_input=false
//                                  (writer surfaces this as a hard rejection)
//
// `final_confidence < 0.90` AND `llm_assist=false` → status='needs_user_input'
// (see contract pin above).

export const ENGINE_CONTRACT_VERSION = 'v1' as const;

export const EngineStatusSchema = z.enum(['ready', 'needs_user_input', 'failed']);
export type EngineStatus = z.infer<typeof EngineStatusSchema>;

export const ModifierAppliedSchema = z.object({
  id: z.string(),
  delta: z.number(),
  reason: z.string().optional(),
});

export type ModifierApplied = z.infer<typeof ModifierAppliedSchema>;

export const EngineOutputSchema = z
  .object({
    /** Frozen contract version. Bump triggers Wave A re-thread. */
    nfr_engine_contract_version: z.literal(ENGINE_CONTRACT_VERSION),
    /** Disposition. */
    status: EngineStatusSchema,
    /** Echoed from EngineDecision. */
    decision_id: z.string(),
    target_field: z.string(),
    target_artifact: z.string(),
    story_id: z.string(),
    engine_version: z.string(),
    /** Resolved value. NULL on `needs_user_input` / `failed`. */
    value: z.unknown().nullable(),
    units: z.string().nullable(),
    /** Inputs read from EvalContext (path → value). */
    inputs_used: z.record(z.string(), z.unknown()),
    /** Modifiers that fired (id + delta + reason). */
    modifiers_applied: z.array(ModifierAppliedSchema),
    /** Rule's intrinsic confidence pre-modifier. */
    base_confidence: z.number().min(0).max(1),
    /** base_confidence + Σ modifier.delta, clamped [0, 1]. */
    final_confidence: z.number().min(0).max(1),
    /** Rule that matched. NULL when no rule matched (fallback path). */
    matched_rule_id: z.string().nullable(),
    /** Mirrors status='ready'. */
    auto_filled: z.boolean(),
    /** Mirrors status='needs_user_input'. */
    needs_user_input: z.boolean(),
    /** Options surfaced when needs_user_input=true; NULL otherwise. */
    computed_options: z.array(z.unknown()).nullable(),
    /** Human-readable derivation (rule id + modifiers + RAG note). */
    math_trace: z.string(),
    /** Inputs the predicate referenced but EvalContext didn't provide. */
    missing_inputs: z.array(z.string()),
    /** Whether RAG was attempted. */
    rag_attempted: z.boolean(),
    /** RAG chunk ids that fed the decision (empty if rag_attempted=false). */
    kb_chunk_ids: z.array(z.string().uuid()),
    /** Whether the user can override. Echoed from EngineDecision. */
    user_overrideable: z.boolean(),
  })
  .superRefine((o, ctx) => {
    if (o.auto_filled && o.needs_user_input) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'auto_filled and needs_user_input are mutually exclusive',
      });
    }
    if (o.status === 'ready' && !o.auto_filled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "status='ready' requires auto_filled=true",
      });
    }
    if (o.status === 'needs_user_input') {
      if (!o.needs_user_input) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "status='needs_user_input' requires needs_user_input=true",
        });
      }
      if (o.computed_options === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "status='needs_user_input' requires non-null computed_options",
        });
      }
    }
    if (o.status !== 'needs_user_input' && o.computed_options !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'computed_options must be null unless status=needs_user_input',
      });
    }
    if (!o.rag_attempted && o.kb_chunk_ids.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'kb_chunk_ids must be empty when rag_attempted=false',
      });
    }
  });

export type EngineOutput = z.infer<typeof EngineOutputSchema>;
