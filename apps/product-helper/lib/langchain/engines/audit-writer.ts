/**
 * audit-writer — append-only writer for the `decision_audit` table.
 *
 * Row shape finalized with 'runtime' peer 2026-04-22. Writer consumes the
 * NFR-engine `EngineOutput` plus six caller-supplied fields (target_artifact,
 * story_id, engine_version, model_version, kb_chunk_ids, user_overrideable)
 * and produces one append-only row.
 *
 * Contract:
 *   writeAuditRow(input) → Promise<{ id, hashChainPrev, rowHash }>
 *
 * Every call:
 *   1. Zod-validates the input (rejects at the boundary — no garbage rows).
 *   2. Reads the most recent audit row for the same
 *      (project_id, target_field) stream and computes `hash_chain_prev` as
 *      the SHA-256 of that prior row's canonical bytes.
 *   3. INSERTs the new row. No UPDATE, no UPSERT — the DB revokes UPDATE
 *      and DELETE on this table; RLS has no UPDATE/DELETE policies.
 *
 * Canonical-byte form for hashing:
 *   JSON.stringify with sorted keys over a stable subset of columns — the
 *   immutable decision-identity, scoring-output, and provenance fields.
 *   `override_history` and `evaluated_at` are excluded so a later user
 *   override that appends a new audit row doesn't require re-hashing the past.
 *
 * Replay + tamper detection:
 *   - `verifyChain(projectId, targetField)` walks the stream and confirms
 *     every row's `hash_chain_prev` equals `canonicalHash(previous)`.
 *   - Hand-edit any row's hashed columns in the DB and the chain breaks.
 *
 * @module lib/langchain/engines/audit-writer
 */

import { createHash } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/db/drizzle';
import {
  decisionAudit,
  type DecisionAuditRow,
  type NewDecisionAuditRow,
} from '@/lib/db/schema/decision-audit';

// ──────────────────────────────────────────────────────────────────────────
// Input schema — the writer's boundary contract.
// ──────────────────────────────────────────────────────────────────────────

const confidenceSchema = z
  .number()
  .min(0, 'confidence must be >= 0')
  .max(1, 'confidence must be <= 1');

const uuidSchema = z.string().uuid('kb_chunk_ids entries must be UUIDs');

const overrideEventSchema = z
  .object({
    at: z.string().datetime().optional(),
    by: z.string().optional(),
    from: z.unknown().optional(),
    to: z.unknown().optional(),
    reason: z.string().optional(),
  })
  .passthrough();

const modifierAppliedSchema = z
  .object({
    modifier: z.string().optional(),
    delta: z.number().optional(),
    reason: z.string().optional(),
  })
  .passthrough();

const computedOptionSchema = z
  .object({
    value: z.unknown(),
    units: z.string().optional(),
    confidence: confidenceSchema.optional(),
    rationale: z.string().optional(),
  })
  .passthrough();

export const decisionAuditInputSchema = z
  .object({
    // Tenant + identity
    projectId: z.number().int().positive(),
    decisionId: z.string().min(1),
    targetField: z.string().min(1),
    targetArtifact: z.string().min(1),
    storyId: z.string().min(1),
    engineVersion: z.string().min(1),

    // EngineOutput 1:1
    value: z.unknown(),
    units: z.string().nullable().optional(),
    inputsUsed: z.record(z.unknown()).default({}),
    modifiersApplied: z.array(modifierAppliedSchema).default([]),
    baseConfidence: confidenceSchema,
    finalConfidence: confidenceSchema,
    matchedRuleId: z.string().nullable().optional(),
    autoFilled: z.boolean().default(false),
    needsUserInput: z.boolean().default(false),
    computedOptions: z.array(computedOptionSchema).nullable().optional(),
    mathTrace: z.string(),
    missingInputs: z.array(z.string()).default([]),

    // Caller-supplied reproducibility + policy
    modelVersion: z.string().min(1),
    ragAttempted: z.boolean().default(false),
    kbChunkIds: z.array(uuidSchema).default([]),
    userOverrideable: z.boolean().default(true),
    overrideHistory: z.array(overrideEventSchema).default([]),

    // Who
    agentId: z.string().min(1),
  })
  .superRefine((val, ctx) => {
    if (val.autoFilled && val.needsUserInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'auto_filled and needs_user_input are mutually exclusive',
        path: ['autoFilled'],
      });
    }
    // Invariant #3 from runtime: computed_options non-null iff needs_user_input.
    const hasOptions =
      val.computedOptions !== null && val.computedOptions !== undefined;
    if (val.needsUserInput && !hasOptions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'computed_options must be provided when needs_user_input=true',
        path: ['computedOptions'],
      });
    }
    if (!val.needsUserInput && hasOptions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'computed_options must be null when needs_user_input=false',
        path: ['computedOptions'],
      });
    }
    // RAG tri-state: if rag wasn't attempted, kb_chunk_ids must be empty.
    if (!val.ragAttempted && val.kbChunkIds.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'kb_chunk_ids must be empty when rag_attempted=false',
        path: ['kbChunkIds'],
      });
    }
  });

export type DecisionAuditInput = z.infer<typeof decisionAuditInputSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Canonicalization + hashing.
// ──────────────────────────────────────────────────────────────────────────

/**
 * Deterministic JSON stringify with lexically-sorted keys. Nested objects
 * and arrays are stringified recursively. Required so two writers produce
 * byte-identical canonical forms for the same row — the precondition for a
 * verifiable hash chain.
 */
export function canonicalJSON(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJSON).join(',') + ']';
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return (
    '{' +
    entries
      .map(([k, v]) => JSON.stringify(k) + ':' + canonicalJSON(v))
      .join(',') +
    '}'
  );
}

/**
 * Subset of `DecisionAuditRow` that participates in the hash chain. Everything
 * that makes the row identifiable, reproducible, and auditable is included;
 * `override_history` and `evaluated_at` are deliberately excluded because
 * they can evolve legitimately after write (overrides append later rows;
 * timestamp is DB-assigned).
 */
export type HashableRow = Pick<
  DecisionAuditRow,
  | 'id'
  | 'projectId'
  | 'decisionId'
  | 'targetField'
  | 'targetArtifact'
  | 'storyId'
  | 'engineVersion'
  | 'value'
  | 'units'
  | 'inputsUsed'
  | 'modifiersApplied'
  | 'baseConfidence'
  | 'finalConfidence'
  | 'matchedRuleId'
  | 'autoFilled'
  | 'needsUserInput'
  | 'computedOptions'
  | 'mathTrace'
  | 'missingInputs'
  | 'modelVersion'
  | 'ragAttempted'
  | 'kbChunkIds'
  | 'hashChainPrev'
  | 'userOverrideable'
  | 'agentId'
>;

export function canonicalRowBytes(row: HashableRow): string {
  return canonicalJSON({
    id: row.id,
    project_id: row.projectId,
    decision_id: row.decisionId,
    target_field: row.targetField,
    target_artifact: row.targetArtifact,
    story_id: row.storyId,
    engine_version: row.engineVersion,
    value: row.value,
    units: row.units,
    inputs_used: row.inputsUsed,
    modifiers_applied: row.modifiersApplied,
    base_confidence: row.baseConfidence,
    final_confidence: row.finalConfidence,
    matched_rule_id: row.matchedRuleId,
    auto_filled: row.autoFilled,
    needs_user_input: row.needsUserInput,
    computed_options: row.computedOptions,
    math_trace: row.mathTrace,
    missing_inputs: row.missingInputs,
    model_version: row.modelVersion,
    rag_attempted: row.ragAttempted,
    kb_chunk_ids: row.kbChunkIds,
    hash_chain_prev: row.hashChainPrev,
    user_overrideable: row.userOverrideable,
    agent_id: row.agentId,
  });
}

export function sha256Hex(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex');
}

export function canonicalHash(row: HashableRow): string {
  return sha256Hex(canonicalRowBytes(row));
}

// ──────────────────────────────────────────────────────────────────────────
// Writer.
// ──────────────────────────────────────────────────────────────────────────

export interface WriteAuditRowResult {
  id: string;
  hashChainPrev: string | null;
  rowHash: string;
}

/**
 * Selectable column list used for prev-row lookup + returning clause. Kept
 * explicit so both sites stay in sync with `HashableRow`.
 */
const HASHABLE_COLUMNS = {
  id: decisionAudit.id,
  projectId: decisionAudit.projectId,
  decisionId: decisionAudit.decisionId,
  targetField: decisionAudit.targetField,
  targetArtifact: decisionAudit.targetArtifact,
  storyId: decisionAudit.storyId,
  engineVersion: decisionAudit.engineVersion,
  value: decisionAudit.value,
  units: decisionAudit.units,
  inputsUsed: decisionAudit.inputsUsed,
  modifiersApplied: decisionAudit.modifiersApplied,
  baseConfidence: decisionAudit.baseConfidence,
  finalConfidence: decisionAudit.finalConfidence,
  matchedRuleId: decisionAudit.matchedRuleId,
  autoFilled: decisionAudit.autoFilled,
  needsUserInput: decisionAudit.needsUserInput,
  computedOptions: decisionAudit.computedOptions,
  mathTrace: decisionAudit.mathTrace,
  missingInputs: decisionAudit.missingInputs,
  modelVersion: decisionAudit.modelVersion,
  ragAttempted: decisionAudit.ragAttempted,
  kbChunkIds: decisionAudit.kbChunkIds,
  hashChainPrev: decisionAudit.hashChainPrev,
  userOverrideable: decisionAudit.userOverrideable,
  agentId: decisionAudit.agentId,
} as const;

/**
 * Append a new decision_audit row.
 *
 * Hash chain:
 *   - Chain stream key = (projectId, targetField). This matches runtime's
 *     `prevHash(db, out.target_field)` contract — a decision is uniquely
 *     identified within a project by the artifact field it writes.
 *   - `hash_chain_prev` = canonicalHash(most-recent row in stream) — or NULL
 *     if none exists.
 *
 * Concurrency note:
 *   Concurrent writers on the same stream may both pick the same "previous"
 *   row, producing a short branch. Acceptable for c1v's audit model; the
 *   verifier walks chronologically and accepts any row whose
 *   `hash_chain_prev` matches ONE of its predecessors. Serializable
 *   isolation on the stream would remove branching; defer until measured.
 */
export async function writeAuditRow(
  input: DecisionAuditInput,
  deps: { db?: typeof db } = {},
): Promise<WriteAuditRowResult> {
  const parsed = decisionAuditInputSchema.parse(input);
  const database = deps.db ?? db;

  const [prev] = await database
    .select(HASHABLE_COLUMNS)
    .from(decisionAudit)
    .where(
      and(
        eq(decisionAudit.projectId, parsed.projectId),
        eq(decisionAudit.targetField, parsed.targetField),
      ),
    )
    .orderBy(desc(decisionAudit.evaluatedAt), desc(decisionAudit.id))
    .limit(1);

  const hashChainPrev = prev ? canonicalHash(prev) : null;

  const insertRow: NewDecisionAuditRow = {
    projectId: parsed.projectId,
    decisionId: parsed.decisionId,
    targetField: parsed.targetField,
    targetArtifact: parsed.targetArtifact,
    storyId: parsed.storyId,
    engineVersion: parsed.engineVersion,
    value: parsed.value as NewDecisionAuditRow['value'],
    units: parsed.units ?? null,
    inputsUsed: parsed.inputsUsed as NewDecisionAuditRow['inputsUsed'],
    modifiersApplied:
      parsed.modifiersApplied as unknown as NewDecisionAuditRow['modifiersApplied'],
    // NUMERIC → string in postgres-js; Drizzle expects string for numeric.
    baseConfidence: parsed.baseConfidence.toFixed(3),
    finalConfidence: parsed.finalConfidence.toFixed(3),
    matchedRuleId: parsed.matchedRuleId ?? null,
    autoFilled: parsed.autoFilled,
    needsUserInput: parsed.needsUserInput,
    computedOptions:
      (parsed.computedOptions ??
        null) as NewDecisionAuditRow['computedOptions'],
    mathTrace: parsed.mathTrace,
    missingInputs: parsed.missingInputs,
    modelVersion: parsed.modelVersion,
    ragAttempted: parsed.ragAttempted,
    kbChunkIds: parsed.kbChunkIds,
    hashChainPrev,
    userOverrideable: parsed.userOverrideable,
    overrideHistory:
      parsed.overrideHistory as unknown as NewDecisionAuditRow['overrideHistory'],
    agentId: parsed.agentId,
  };

  const [inserted] = await database
    .insert(decisionAudit)
    .values(insertRow)
    .returning(HASHABLE_COLUMNS);

  if (!inserted) {
    throw new Error('decision_audit INSERT returned no row');
  }

  return {
    id: inserted.id,
    hashChainPrev,
    rowHash: canonicalHash(inserted),
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Chain verifier — replay/tamper harness (security-review A9/A10).
// ──────────────────────────────────────────────────────────────────────────

export interface ChainVerificationResult {
  valid: boolean;
  rowsChecked: number;
  brokenAt?: { id: string; expected: string | null; actual: string | null };
}

/**
 * Walks (projectId, targetField) chronologically and confirms every row's
 * `hash_chain_prev` equals canonicalHash(previous row). Returns
 * `{valid:true, rowsChecked}` on success, or the first break location.
 * See security-review A10.
 */
export async function verifyChain(
  projectId: number,
  targetField: string,
  deps: { db?: typeof db } = {},
): Promise<ChainVerificationResult> {
  const database = deps.db ?? db;
  const rows = await database
    .select()
    .from(decisionAudit)
    .where(
      and(
        eq(decisionAudit.projectId, projectId),
        eq(decisionAudit.targetField, targetField),
      ),
    )
    .orderBy(decisionAudit.evaluatedAt, decisionAudit.id);

  let prev: DecisionAuditRow | null = null;
  for (const row of rows) {
    const expected = prev ? canonicalHash(prev) : null;
    if (row.hashChainPrev !== expected) {
      return {
        valid: false,
        rowsChecked: rows.length,
        brokenAt: {
          id: row.id,
          expected,
          actual: row.hashChainPrev,
        },
      };
    }
    prev = row;
  }

  return { valid: true, rowsChecked: rows.length };
}

// ──────────────────────────────────────────────────────────────────────────
// EngineOutput → writer input mapper.
// ──────────────────────────────────────────────────────────────────────────

/**
 * Minimal structural type matching EngineOutput. Imported structurally so
 * the writer doesn't create a circular dep on the interpreter module.
 */
export interface EngineOutputShape {
  decision_id: string;
  target_field: string;
  value: number | string | null;
  units?: string;
  base_confidence: number;
  matched_rule_id: string | null;
  inputs_used: Record<string, unknown>;
  modifiers_applied: Array<Record<string, unknown>>;
  final_confidence: number;
  auto_filled: boolean;
  needs_user_input: boolean;
  computed_options?: Array<Record<string, unknown>>;
  math_trace: string;
  missing_inputs: string[];
}

/**
 * Convenience mapper: given an `EngineOutput` plus the caller-supplied
 * context (target artifact path, story id, engine version, agent id, model
 * version, RAG chunk ids, overrideability policy), produce the writer input.
 *
 * `model_version` defaults to `'deterministic-rule-tree'` for pure-engine
 * rows per runtime's finalized contract — passing a non-null `modelVersion`
 * override for llm_refine paths.
 */
export function auditInputFromEngineOutput(args: {
  projectId: number;
  agentId: string;
  targetArtifact: string;
  storyId: string;
  engineVersion: string;
  output: EngineOutputShape;
  modelVersion?: string;
  /** True iff ContextResolver invoked RAG for this decision. Pass false
   *  (default) on pure rule-tree paths — the CHECK constraint then forbids
   *  non-empty `kbChunkIds`. */
  ragAttempted?: boolean;
  kbChunkIds?: string[];
  userOverrideable?: boolean;
}): DecisionAuditInput {
  const needsUserInput = args.output.needs_user_input;
  const rawComputed = args.output.computed_options;
  // Invariant #3: computed_options non-null iff needs_user_input.
  const computedOptions = needsUserInput
    ? (rawComputed ?? [])
    : null;

  return {
    projectId: args.projectId,
    decisionId: args.output.decision_id,
    targetField: args.output.target_field,
    targetArtifact: args.targetArtifact,
    storyId: args.storyId,
    engineVersion: args.engineVersion,
    value: args.output.value,
    units: args.output.units ?? null,
    inputsUsed: args.output.inputs_used,
    modifiersApplied: args.output.modifiers_applied,
    baseConfidence: args.output.base_confidence,
    finalConfidence: args.output.final_confidence,
    matchedRuleId: args.output.matched_rule_id,
    autoFilled: args.output.auto_filled,
    needsUserInput,
    computedOptions,
    mathTrace: args.output.math_trace,
    missingInputs: args.output.missing_inputs,
    modelVersion: args.modelVersion ?? 'deterministic-rule-tree',
    ragAttempted: args.ragAttempted ?? false,
    kbChunkIds: args.kbChunkIds ?? [],
    userOverrideable: args.userOverrideable ?? true,
    overrideHistory: [],
    agentId: args.agentId,
  };
}
