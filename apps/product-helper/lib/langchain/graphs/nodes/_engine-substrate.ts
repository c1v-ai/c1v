/**
 * Shared substrate-read helper for the 7 NEW v2.1 generate-* graph nodes.
 *
 * Implements the substrate-read pattern (D-V22.01 + HANDOFF-2026-04-27
 * Correction 1) consumed by the agent-greenfield-refactor closure of P10:
 *
 *   1. Load the engine.json story tree for this node's module
 *      (via `loadEngine(storyId)`).
 *   2. Walk every decision and call `evaluateWaveE()` — the wrapper handles
 *      the 2-band routing (≥0.90 ready / 0.60-0.89 llm-refine / else
 *      needs_user_input) + nfr_engine_contract_version envelope per
 *      master plan v2.1 lines 498-504.
 *   3. Optionally route inputs through `ContextResolver` so artifact-backed
 *      `module-X/phase-slug` sources resolve via ArtifactReader, with
 *      caller-supplied `signals` filling non-artifact inputs (`user_input`,
 *      literal keys, etc).
 *   4. Return aggregated decision results — each generate-* node maps
 *      these into a runtime envelope sized to its kind. The envelope is
 *      the deliverable that flips status pending → ready.
 *
 * Failure semantics: never throws on engine-load or decision evaluation —
 * surfaces failures in the returned `errors[]` so the caller can decide
 * (status='ready' with partial coverage vs. status='failed' on hard error).
 *
 * Substrate definition (per substrate-vs-feeder pattern in spawn prompt):
 *   - `state.messages`            — the intake conversation
 *   - `state.extractedData`       — what M0/M1 extraction surfaced from intake
 *   - upstream artifacts (G4)     — fetched lazily via ContextResolver
 *
 * This module is implementation-shared; the contract envelope exposed to
 * downstream consumers is owned per-node, not here.
 *
 * @module lib/langchain/graphs/nodes/_engine-substrate
 */

import type { BaseMessage } from '@langchain/core/messages';

import { loadEngine, EngineNotFoundError } from '../../engines/engine-loader';
import {
  evaluateWaveE,
  type EvaluateOptions,
  type WaveEEngineOutput,
} from '../../engines/wave-e-evaluator';
import {
  ContextResolver,
  type NonArtifactSignals,
} from '../../engines/context-resolver';
import type {
  DecisionRef,
  EngineDoc,
  EngineInputs,
  EvaluationSignals,
} from '../../engines/nfr-engine-interpreter';

/**
 * Forward-compatible mirror of audit-writer's `AuditContext`.
 *
 * `audit-writer` (commit `48108cc` on `wave-e/te1-audit-writer`) added
 * `EvaluateOptions.auditContext` and made it REQUIRED on production
 * callers (throws `WaveEAuditContextRequiredError` when `skipAudit !== true`
 * and `auditContext` is absent). At consolidation merge our 7 P10 nodes
 * MUST already supply this field — the substrate helper threads it through.
 *
 * Pre-merge this interface is local; post-merge it's structurally identical
 * to `audit-writer`'s exported type. The cast at the call site bridges
 * the narrower `EvaluateOptions` on this branch (no `auditContext` field
 * yet) to the post-merge widened shape — TypeScript's structural typing
 * makes this a no-op at runtime.
 *
 * Shape source: `git show 48108cc:apps/product-helper/lib/langchain/engines/wave-e-evaluator.ts`
 * (interface AuditContext, ~line 117).
 */
export interface AuditContext {
  projectId: number;
  agentId: string;
  targetArtifact: string;
  storyId: string;
  engineVersion: string;
  modelVersion?: string;
  ragAttempted?: boolean;
  kbChunkIds?: string[];
  userOverrideable?: boolean;
}

export interface SubstrateInputs {
  /** Project id flows directly into ContextResolver for tenant-scoped artifact reads. */
  projectId: number;
  /** Intake conversation. Folded into `chat_summary` by ContextResolver. */
  messages: BaseMessage[];
  /** Extraction-surfaced fields. Mapped to engine input names by the caller. */
  extractedData: Record<string, unknown> | undefined;
  /** Optional project-level metadata (project_name, project_vision) — not consumed by engine, surfaced for envelope assembly. */
  projectName?: string;
  projectVision?: string;
}

export interface DecisionEvaluation {
  decision_id: string;
  target_field: string;
  status: WaveEEngineOutput['status'];
  value: WaveEEngineOutput['value'];
  units?: string;
  base_confidence: number;
  final_confidence: number;
  matched_rule_id: string | null;
  modifiers_applied: WaveEEngineOutput['modifiers_applied'];
  missing_inputs: string[];
  math_trace: string;
  nfr_engine_contract_version: WaveEEngineOutput['nfr_engine_contract_version'];
}

export interface SubstrateEvaluation {
  story_id: string;
  story_version: string;
  decisions: DecisionEvaluation[];
  /**
   * Counts useful for the runtime-envelope `_meta` block + tests:
   *   ready_count        — final_confidence ≥ 0.90 (auto-fill carried)
   *   needs_input_count  — surfaced to user (engine couldn't commit)
   *   total              — story.decisions.length
   */
  ready_count: number;
  needs_input_count: number;
  total: number;
  errors: string[];
}

/**
 * Per-decision signal+input adapter.
 *
 * The 7 NEW v2.1 engine.json story trees use `inputs[i].source` strings like
 * `"module-0/intake-discriminators"` that the ContextResolver can resolve
 * via ArtifactReader, plus non-artifact strings like `"user_input"` /
 * `"chat_signal"` that the resolver looks up in the supplied `signals` bag.
 *
 * The substrate adapter folds `extractedData` into the signals bag with a
 * conservative shallow flattening so common substrate keys land at the
 * names engine.json decisions reference (e.g., `extractedData.userType` →
 * signals.user_type). Callers may pass per-node overrides.
 */
export type SignalAdapter = (substrate: SubstrateInputs) => NonArtifactSignals;

const defaultSignalAdapter: SignalAdapter = ({ extractedData }) => {
  if (!extractedData || typeof extractedData !== 'object') return {};
  // Pass-through: engine.json authors keyed inputs by snake_case substrate
  // names. We surface anything M0/M1 extraction has produced; the engine
  // ignores keys that don't match a declared input.
  const flat: NonArtifactSignals = {};
  for (const [k, v] of Object.entries(extractedData as Record<string, unknown>)) {
    flat[k] = v;
  }
  return flat;
};

export interface EvaluateStoryOptions {
  /** Override the engines directory (tests). */
  enginesBasePath?: string;
  /** Override which substrate keys flow to engine inputs. */
  signalAdapter?: SignalAdapter;
  /** Inject a real ContextResolver (tests + audit-writer wraps). */
  contextResolver?: ContextResolver;
  /** Per-decision evaluation signals (regulatory_override, user_explicit, etc). */
  evaluationSignals?: EvaluationSignals;
  /**
   * Audit-row provenance context. REQUIRED in production paths post-
   * audit-writer-merge (else evaluateWaveE throws WaveEAuditContextRequiredError).
   * The substrate helper accepts a base context per node; the per-decision
   * `targetArtifact` is overlaid from the engine output's `target_field`
   * inside the loop, so callers don't need to interpolate per decision.
   */
  auditContext?: AuditContext;
  /** Skip the synchronous writeAuditRow() call. Tests pass true; production omits. */
  skipAudit?: boolean;
}

/**
 * Evaluate every decision in an engine.json story against the substrate.
 *
 * Returns a `SubstrateEvaluation` even when the story file is missing
 * (errors[] carries the message; decisions[] is empty). Callers decide
 * whether an empty evaluation flips the artifact to status='failed'.
 */
export async function evaluateEngineStory(
  storyId: string,
  substrate: SubstrateInputs,
  options: EvaluateStoryOptions = {},
): Promise<SubstrateEvaluation> {
  const errors: string[] = [];
  let doc: EngineDoc | null = null;
  try {
    doc = await loadEngine(storyId, { basePath: options.enginesBasePath });
  } catch (err) {
    if (err instanceof EngineNotFoundError) {
      errors.push(`engine_story_not_found: ${storyId}`);
    } else {
      errors.push(`engine_story_load_failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    return { story_id: storyId, story_version: 'unknown', decisions: [], ready_count: 0, needs_input_count: 0, total: 0, errors };
  }

  const signals = (options.signalAdapter ?? defaultSignalAdapter)(substrate);
  const resolver = options.contextResolver;
  const evaluationSignals = options.evaluationSignals ?? {};

  const decisions: DecisionEvaluation[] = [];
  let ready = 0;
  let needsInput = 0;

  for (const decision of doc.decisions) {
    let inputs: EngineInputs = {};
    const evalSignals: EvaluationSignals = { ...evaluationSignals };

    if (resolver) {
      try {
        const ctx = await resolver.resolveContext({
          decision: decision as DecisionRef,
          projectId: substrate.projectId,
          signals,
        });
        inputs = ctx.typed_inputs;
        if (ctx.missing_inputs.length > 0) {
          evalSignals.missing_inputs = [...(evalSignals.missing_inputs ?? []), ...ctx.missing_inputs];
        }
      } catch (err) {
        errors.push(`resolve_context:${decision.decision_id}:${err instanceof Error ? err.message : 'unknown'}`);
      }
    } else {
      inputs = signals as EngineInputs;
    }

    // Compose per-decision EvaluateOptions. Pre-merge `EvaluateOptions` doesn't
    // declare `auditContext`; the cast widens the literal to the post-merge
    // shape so the field rides through unchanged. Runtime no-op on this branch
    // (current evaluator ignores excess fields); enforced post-merge.
    //
    // skipAudit defaults: tests (NODE_ENV=test or JEST_WORKER_ID set) opt out
    // of the synchronous writeAuditRow side-effect post-merge — there's no DB
    // available in the per-node mocked-persistArtifact pattern. Production
    // paths leave `options.skipAudit` undefined and audit fires.
    const isTestEnv = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;
    const skipAudit = options.skipAudit ?? isTestEnv;

    const perDecisionOptions: EvaluateOptions = {
      skipAudit,
      ...(options.auditContext
        ? {
            auditContext: {
              ...options.auditContext,
              targetArtifact: decision.target_field || options.auditContext.targetArtifact,
              storyId: options.auditContext.storyId || doc.story_id,
              engineVersion: options.auditContext.engineVersion || doc.version,
            },
          }
        : {}),
    } as EvaluateOptions;

    let out: WaveEEngineOutput;
    try {
      out = await evaluateWaveE(decision as DecisionRef, inputs, evalSignals, perDecisionOptions);
    } catch (err) {
      errors.push(`evaluate:${decision.decision_id}:${err instanceof Error ? err.message : 'unknown'}`);
      continue;
    }

    if (out.status === 'ready') ready += 1;
    if (out.status === 'needs_user_input') needsInput += 1;

    decisions.push({
      decision_id: out.decision_id,
      target_field: out.target_field,
      status: out.status,
      value: out.value,
      units: out.units,
      base_confidence: out.base_confidence,
      final_confidence: out.final_confidence,
      matched_rule_id: out.matched_rule_id,
      modifiers_applied: out.modifiers_applied,
      missing_inputs: out.missing_inputs,
      math_trace: out.math_trace,
      nfr_engine_contract_version: out.nfr_engine_contract_version,
    });
  }

  return {
    story_id: doc.story_id,
    story_version: doc.version,
    decisions,
    ready_count: ready,
    needs_input_count: needsInput,
    total: doc.decisions.length,
    errors,
  };
}

/**
 * Build a runtime envelope shape used by all 7 generate-* nodes.
 *
 * Schema slug pattern: `<kind>.runtime-envelope.v1` — distinct from the
 * full v1 artifact schema (`<kind>.v1`) which the offline self-application
 * synthesis-agent emits. The runtime envelope is the v2.1 contract that
 * flips project_artifacts.status pending → ready; downstream consumers
 * (download manifest, recommendation-viewer) read shared fields.
 */
export interface RuntimeEnvelope<TKind extends string = string> {
  _schema: `${TKind}.runtime-envelope.v1`;
  _output_path: string;
  /** Always carries the Wave A↔E pin. */
  nfr_engine_contract_version: 'v1';
  project_id: number;
  project_name: string;
  synthesized_at: string;
  inputs_hash: string;
  /** Engine evaluation summary the recommendation-viewer renders inline. */
  engine_evaluation: SubstrateEvaluation;
  /** Optional per-node payload — schema-shape valid where the node opts to assemble it. */
  payload?: unknown;
}
