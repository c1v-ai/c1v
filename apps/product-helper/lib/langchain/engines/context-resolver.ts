/**
 * ContextResolver — compose the input set for one engine decision.
 *
 * Source of truth: `plans/kb-runtime-architecture.md` §2.2 + §4 step 3 +
 * G4. Consumes `DecisionRef` (from runtime's `nfr-engine-interpreter.ts`
 * types) — the resolver works per-decision, not per-story.
 *
 * Plumbing, NOT policy:
 *   1. walk `decision.inputs[]`, split into artifact-backed vs. other sources
 *   2. fetch + Zod-validate artifacts via ArtifactReader
 *   3. project typed artifacts down to the flat typed_inputs dict keyed by
 *      `inputs[i].name` (what the Predicate DSL reads)
 *   4. if required inputs still missing AND a RagFetcher is wired, ask RAG
 *   5. fold an optional chat-history summary
 *   6. return {typed_inputs, rag_chunks, chat_summary, missing_inputs,
 *      artifact_validation_errors} — caller decides what missing means
 *
 * Explicitly out of scope:
 *   - No LLM calls. LLMs fire only inside NFREngineInterpreter when the
 *     engine's configuration opts into refinement.
 *   - No business logic. Projection of artifacts → inputs is mechanical
 *     dot-path reads; value transformation lives in the engine rule tree.
 *   - No writes. Resolver is read-only.
 *
 * @module lib/langchain/engines/context-resolver
 */

import { desc, eq } from 'drizzle-orm';
import type { z } from 'zod';

import { db as defaultDb } from '@/lib/db/drizzle';
import { conversations } from '@/lib/db/schema';

import {
  ArtifactReader,
  type ArtifactFetchResult,
  type DrizzleClient,
} from './artifact-reader';
import {
  parseModuleRefString,
  type DecisionRef,
  type EngineInputSpec,
  type ModuleRef,
} from '../schemas/engines/engine';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export interface KbChunk {
  /**
   * kb_chunks row id (UUID). Flows directly into audit_row.kb_chunk_ids,
   * which is `uuid[]` with Zod uuid validation per element — synthetic or
   * composite ids will fail the audit Zod boundary. Adapters wrapping
   * non-kb_chunks sources must produce valid UUIDs.
   */
  chunk_id: string;
  module: string;
  phase: string;
  section?: string;
  content: string;
  score: number;
}

/**
 * Callback the resolver invokes to fill missing inputs from pgvector.
 *
 * Injected (not imported) so this module has zero coupling to the RAG
 * transport. `runtime` + `rag` peers wire a real implementation (e.g. the
 * shipped `searchKB` in `lib/langchain/engines/kb-search.ts`) once the
 * pgvector pipeline is fully live (G8/G9 in kb-runtime-architecture.md).
 *
 * Contract: return an empty array when the fetcher is unconfigured or the
 * corpus can't cover the query. Never throw — resolver treats all RAG
 * failures as "no chunks" and lets the engine fall through to user-surface.
 */
export type RagFetcher = (params: {
  query: string;
  topK: number;
  filter?: { module?: string; phase?: string };
}) => Promise<KbChunk[]>;

export interface ResolvedContext {
  typed_inputs: Record<string, unknown>;
  rag_chunks: KbChunk[];
  chat_summary?: string;
  missing_inputs: string[];
  artifact_validation_errors: ArtifactFetchResult['validation_errors'];
  /**
   * True iff the resolver invoked the RagFetcher at least once for this
   * decision. Passes straight into `auditInputFromEngineOutput.ragAttempted`
   * so the audit row's tri-state (not-attempted / attempted-zero-hits /
   * attempted-with-hits) survives into the audit log. Distinct from
   * `rag_chunks.length > 0` because RAG can legitimately return no chunks.
   */
  rag_attempted: boolean;
}

/**
 * Extra per-project signals the resolver can fold into typed_inputs when
 * the decision declares non-artifact `source` strings (e.g. "user_input",
 * "regulatory_refs", "chat_signal"). Absent = those inputs become
 * missing_inputs and either RAG fills them or the engine surfaces a gap.
 */
export type NonArtifactSignals = Record<string, unknown>;

export interface ContextResolverOptions {
  db?: DrizzleClient;
  artifactReader?: ArtifactReader;
  ragFetcher?: RagFetcher;
  /** Cap on chat-history messages folded into the summary. */
  chatHistoryLimit?: number;
  /** topK for each RAG fallback call. */
  ragTopK?: number;
}

export interface ResolveContextParams {
  decision: DecisionRef;
  projectId: number;
  signals?: NonArtifactSignals;
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function artifactKey(ref: ModuleRef): string {
  return `${ref.module}/${ref.phase_slug}`;
}

function readDotPath(root: unknown, path: string): unknown {
  if (!path) return root;
  const segments = path.split('.');
  let cursor: unknown = root;
  for (const seg of segments) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[seg];
  }
  return cursor;
}

interface InputRoute {
  spec: EngineInputSpec;
  artifact?: ModuleRef;
}

/**
 * Classify each `inputs[i]` by source. Artifact-backed inputs route through
 * ArtifactReader; non-artifact sources (e.g. "user_input", literal keys)
 * are looked up in the caller-supplied `signals` bag.
 */
function routeInputs(inputs: readonly EngineInputSpec[]): InputRoute[] {
  return inputs.map((spec) => ({
    spec,
    artifact: parseModuleRefString(spec.source) ?? undefined,
  }));
}

/**
 * Project artifact + signal bags down to a flat typed_inputs dict keyed by
 * `EngineInputSpec.name`. Each input's value is read from:
 *   1. the artifact at `spec.source` (dot-path = `spec.name`), if routed
 *   2. `signals[spec.name]`, if supplied
 *
 * First non-undefined hit wins. Missing values accumulate into `unresolved`.
 */
function projectInputs(
  routes: readonly InputRoute[],
  artifacts: Record<string, unknown>,
  signals: NonArtifactSignals,
): {
  typed_inputs: Record<string, unknown>;
  unresolved: string[];
} {
  const typed_inputs: Record<string, unknown> = {};
  const unresolved: string[] = [];

  for (const { spec, artifact } of routes) {
    let value: unknown = undefined;

    if (artifact) {
      const bag = artifacts[artifactKey(artifact)];
      if (bag !== undefined) {
        value = readDotPath(bag, spec.name);
      }
    }

    if (value === undefined) {
      value = signals[spec.name];
    }

    if (value === undefined) {
      unresolved.push(spec.name);
    } else {
      typed_inputs[spec.name] = value;
    }
  }

  return { typed_inputs, unresolved };
}

// ─────────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────────

export class ContextResolver {
  private readonly db: DrizzleClient;
  private readonly reader: ArtifactReader;
  private readonly ragFetcher?: RagFetcher;
  private readonly chatHistoryLimit: number;
  private readonly ragTopK: number;

  constructor(options: ContextResolverOptions = {}) {
    this.db = options.db ?? defaultDb;
    this.reader = options.artifactReader ?? new ArtifactReader({ db: this.db });
    this.ragFetcher = options.ragFetcher;
    this.chatHistoryLimit = options.chatHistoryLimit ?? 20;
    this.ragTopK = options.ragTopK ?? 3;
  }

  /**
   * Assemble the context bundle NFREngineInterpreter needs for one decision.
   *
   * Fails loud on ArtifactValidationError (data-integrity signal).
   * Degrades gracefully on missing artifacts, missing signals, RAG
   * failures, and chat-history read failures.
   */
  async resolveContext(params: ResolveContextParams): Promise<ResolvedContext> {
    const { decision, projectId, signals = {} } = params;

    const routes = routeInputs(decision.inputs);
    const refs = uniqueArtifactRefs(routes);

    const fetched = await this.reader.fetch(projectId, refs);

    const { typed_inputs, unresolved } = projectInputs(
      routes,
      fetched.artifacts,
      signals,
    );

    let rag_chunks: KbChunk[] = [];
    const rag_attempted = unresolved.length > 0 && this.ragFetcher != null;
    if (rag_attempted) {
      rag_chunks = await this.runRag(decision, unresolved, routes);
    }

    const chat_summary = await this.readChatSummary(projectId);

    return {
      typed_inputs,
      rag_chunks,
      chat_summary,
      missing_inputs: unresolved,
      artifact_validation_errors: fetched.validation_errors,
      rag_attempted,
    };
  }

  private async runRag(
    decision: DecisionRef,
    missingKeys: string[],
    routes: readonly InputRoute[],
  ): Promise<KbChunk[]> {
    if (!this.ragFetcher) return [];
    const chunks: KbChunk[] = [];
    const seen = new Set<string>();

    // Build a key → optional artifact filter map so RAG queries can be
    // scoped to the same module/phase the engine would have read from.
    const filterByKey = new Map<string, ModuleRef | undefined>();
    for (const r of routes) {
      filterByKey.set(r.spec.name, r.artifact);
    }

    for (const key of missingKeys) {
      const filter = filterByKey.get(key);
      const query = `${decision.decision_id} ${key}`;
      let batch: KbChunk[] = [];
      try {
        batch = await this.ragFetcher({
          query,
          topK: this.ragTopK,
          filter: filter
            ? { module: filter.module, phase: filter.phase_slug }
            : undefined,
        });
      } catch {
        // RAG is optional plumbing — swallow and continue. Resolver does
        // not decide how to react to RAG failures; interpreter's threshold
        // logic handles the downstream branching.
        batch = [];
      }
      for (const c of batch) {
        if (seen.has(c.chunk_id)) continue;
        seen.add(c.chunk_id);
        chunks.push(c);
      }
    }
    return chunks;
  }

  private async readChatSummary(projectId: number): Promise<string | undefined> {
    try {
      const rows = await this.db
        .select({ role: conversations.role, content: conversations.content })
        .from(conversations)
        .where(eq(conversations.projectId, projectId))
        .orderBy(desc(conversations.createdAt))
        .limit(this.chatHistoryLimit);
      if (rows.length === 0) return undefined;
      return rows
        .reverse()
        .map((r) => `[${r.role}] ${truncate(r.content, 400)}`)
        .join('\n');
    } catch {
      return undefined;
    }
  }
}

function uniqueArtifactRefs(routes: readonly InputRoute[]): ModuleRef[] {
  const seen = new Map<string, ModuleRef>();
  for (const r of routes) {
    if (!r.artifact) continue;
    seen.set(artifactKey(r.artifact), r.artifact);
  }
  return Array.from(seen.values());
}

function truncate(value: string | null | undefined, max: number): string {
  if (!value) return '';
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

// Keep z import bound to a type so tsc tree-shakes correctly
export type _KeepZ = z.ZodIssue;
