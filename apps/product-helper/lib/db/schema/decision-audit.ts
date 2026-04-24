/**
 * decision_audit — append-only Scoring-decision audit sink.
 *
 * Shape finalized with 'runtime' (NFREngineInterpreter owner) — maps every
 * `EngineOutput` field 1:1 plus six caller-supplied columns for replay +
 * provenance. See `auditInputFromEngineOutput` in `audit-writer.ts` for the
 * mapping.
 *
 * Every NFR-engine Scoring pass writes one row. No UPDATE, no DELETE. Rows
 * form a per-(project_id, target_field) hash chain: each row's
 * `hash_chain_prev` is the SHA-256 of the previous row's canonical bytes for
 * the same stream. Tampering breaks the chain and is detectable by replay.
 *
 * Design contract:
 *   - Append-only enforced at DB level: RLS grants INSERT/SELECT only; no
 *     UPDATE/DELETE policies exist, and the GRANT set excludes UPDATE/DELETE
 *     from the app role (see migration 0011).
 *   - Tenant-isolated via `project_id → projects.team_id` RLS predicate
 *     (security-review F5). The app sets `app.current_team_id` per request.
 *   - Incident-response-complete per security-review F8: `model_version`,
 *     `kb_chunk_ids`, `agent_id`, `override_history` all present so a bad
 *     recommendation is reproducible and tamper-evident.
 *   - Zod-validated at write time via `decisionAuditInputSchema` in the
 *     writer (no prose → Drizzle type shape; writer re-parses before every
 *     INSERT).
 *
 * Migration: 0011_decision_audit.sql (manual SQL per CLAUDE.md drizzle-kit
 * broken note).
 *
 * @module lib/db/schema/decision-audit
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects } from '../schema';

export const decisionAudit = pgTable(
  'decision_audit',
  {
    /** Stable row identity. UUIDv4 so the writer can compute hash_chain_prev
     *  deterministically before INSERT without a round-trip. */
    id: uuid('id').primaryKey().defaultRandom(),

    // ─── Tenant scope ───────────────────────────────────────────────────
    /** FK to the project whose decision this row records. CASCADE so that
     *  when a project is hard-deleted the audit trail goes with it; audit
     *  retention lives at the project level, not per-row. */
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    // ─── Decision identity (from EngineOutput) ──────────────────────────
    /** Stable decision ref from engine.json, e.g. `RESPONSE_BUDGET_MS`. */
    decisionId: text('decision_id').notNull(),

    /** Dotted pointer into the target artifact, e.g.
     *  `constants_table.RESPONSE_BUDGET_MS`. Primary chain-stream key
     *  alongside `project_id`. */
    targetField: text('target_field').notNull(),

    /** Artifact the decision writes into, caller-supplied, e.g.
     *  `module_2_requirements/constants_table.json`. Not derivable from
     *  EngineOutput — the interpreter doesn't know where the answer lands. */
    targetArtifact: text('target_artifact').notNull(),

    /** Story id from EngineDoc.story_id, e.g. `story-03-latency-budget`. */
    storyId: text('story_id').notNull(),

    /** Engine.json version that produced this row (EngineDoc.version). */
    engineVersion: text('engine_version').notNull(),

    // ─── Scoring output (EngineOutput 1:1) ──────────────────────────────
    /** The value emitted by the engine (number | string | null). JSONB so
     *  any shape round-trips without schema churn. */
    value: jsonb('value'),

    /** Units tag if the decision carries one (e.g. 'ms', 'req/s'). */
    units: text('units'),

    /** Typed inputs the rule tree consumed — shape
     *  `{ inputName: { value, source } }`. Includes undefined inputs as
     *  `value: null` so replay can tell "declared but missing" from
     *  "not declared". */
    inputsUsed: jsonb('inputs_used')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    /** Modifier deltas applied (e.g. cross-story agreement +0.05). Array of
     *  `{modifier, delta, reason?}` objects. */
    modifiersApplied: jsonb('modifiers_applied')
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    /** Pre-modifier confidence from the matched rule. 0.000–1.000. */
    baseConfidence: numeric('base_confidence', {
      precision: 4,
      scale: 3,
    }).notNull(),

    /** Post-modifier, clamped confidence. 0.000–1.000. Interpreter clamps. */
    finalConfidence: numeric('final_confidence', {
      precision: 4,
      scale: 3,
    }).notNull(),

    /** Rule-tree branch id that matched (e.g. `consumer-app-user-facing-sync-pci`).
     *  Null iff no rule fired AND no default. */
    matchedRuleId: text('matched_rule_id'),

    // ─── Disposition flags ──────────────────────────────────────────────
    /** True iff the engine auto-filled (final_confidence ≥ auto_fill_threshold). */
    autoFilled: boolean('auto_filled').notNull().default(false),

    /** True iff the engine halted and surfaced a gap to the user. */
    needsUserInput: boolean('needs_user_input').notNull().default(false),

    /** Top-3 rule matches with confidences — populated only when below
     *  threshold (invariant: non-null iff needs_user_input=true). */
    computedOptions: jsonb('computed_options').$type<
      Array<Record<string, unknown>>
    >(),

    /** Human-readable breakdown for the "why this value?" UI. */
    mathTrace: text('math_trace').notNull(),

    /** Declared inputs that EngineInputs couldn't resolve. Empty array on
     *  clean runs. */
    missingInputs: text('missing_inputs')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    // ─── Reproducibility (security-review F8) ───────────────────────────
    /** LLM model version. `deterministic-rule-tree` for pure-engine rows,
     *  specific model id (e.g. `claude-sonnet-4-5-20250929`) on llm_refine
     *  paths. NOT NULL — every row declares its reproducibility substrate. */
    modelVersion: text('model_version').notNull(),

    /** Did the ContextResolver attempt RAG for this decision? Restores the
     *  tri-state that the NOT-NULL `kb_chunk_ids` array alone can't express:
     *    - rag_attempted=false                       → pure rule-tree; RAG skipped
     *    - rag_attempted=true,  kb_chunk_ids=[]      → RAG ran, zero hits
     *    - rag_attempted=true,  kb_chunk_ids=[…]     → RAG ran, hits fed the decision
     *  Observability: lets the replay harness tell "we could have enriched"
     *  from "we evaluated a strong rule without needing RAG". */
    ragAttempted: boolean('rag_attempted').notNull().default(false),

    /** KB chunk UUIDs that fed this decision (RAG provenance). Empty `[]`
     *  when `rag_attempted=false` OR when RAG ran with zero hits. References
     *  `kb_chunks.id` (UUID). */
    kbChunkIds: uuid('kb_chunk_ids')
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),

    /** SHA-256 (hex) of the previous row's canonical bytes for the same
     *  (project_id, target_field) stream. NULL iff this is the first row
     *  in the stream. Tamper-detection: any edit to a prior row breaks this. */
    hashChainPrev: varchar('hash_chain_prev', { length: 64 }),

    // ─── Policy + override lineage ──────────────────────────────────────
    /** Policy flag: whether the user is allowed to override this row's
     *  value. Not interpreter-derived; set by the caller based on the
     *  decision's `user_overrideable` metadata in engine.json. */
    userOverrideable: boolean('user_overrideable').notNull().default(true),

    /** Ordered list of override events `{at, by, from, to, reason}`. Empty
     *  on auto-fill; populated when the user accepts/rejects/edits the
     *  surfaced value. Append-only at the JSON level. */
    overrideHistory: jsonb('override_history')
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    // ─── When + who ─────────────────────────────────────────────────────
    /** When the decision was evaluated. DB-assigned unless the caller
     *  explicitly overrides (e.g. replay harness). */
    evaluatedAt: timestamp('evaluated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Peer/agent identity that wrote this row. `mcp:<api_key_id>` for MCP
     *  paths, `agent:<name>` for swarm peers, `user` for direct overrides. */
    agentId: text('agent_id').notNull(),
  },
  (table) => ({
    // Primary stream-order lookup: "show me this target_field's history".
    projectTargetTsIdx: index('decision_audit_project_target_ts_idx').on(
      table.projectId,
      table.targetField,
      table.evaluatedAt.desc(),
    ),
    // Project-wide timeline: "what happened in this project recently".
    projectTsIdx: index('decision_audit_project_ts_idx').on(
      table.projectId,
      table.evaluatedAt.desc(),
    ),
    // Story-scoped timeline: "what did story-03 decide".
    projectStoryTsIdx: index('decision_audit_project_story_ts_idx').on(
      table.projectId,
      table.storyId,
      table.evaluatedAt.desc(),
    ),
    // Hash-chain verification queries.
    hashChainIdx: index('decision_audit_hash_chain_prev_idx').on(
      table.hashChainPrev,
    ),
  }),
);

export type DecisionAuditRow = typeof decisionAudit.$inferSelect;
export type NewDecisionAuditRow = typeof decisionAudit.$inferInsert;
