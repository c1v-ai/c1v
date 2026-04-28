/**
 * ArtifactReader — fetch typed upstream artifacts for a decision.
 *
 * Source of truth: plans/kb-runtime-architecture.md §2.1 (Read-only
 * Actions — SQL) + §2.2 (Context construction) + G4 (ArtifactReader +
 * ContextResolver).
 *
 * Reads `projects.project_data` JSONB via Drizzle, routes each requested
 * ModuleRef to its landing path + Zod validator, and returns a typed bag
 * plus a `missing_inputs[]` list. Never throws on missing artifacts —
 * resolver layer decides whether to fall through to RAG or surface a gap.
 *
 * Throws ONLY when:
 *   - Drizzle read fails (DB connectivity)
 *   - An artifact IS present but fails its Zod validation (data corruption)
 *
 * The Zod-validation-fails case is loud by design: silent drift in
 * upstream artifacts would poison downstream engine decisions.
 *
 * @module lib/langchain/engines/artifact-reader
 */

import { eq } from 'drizzle-orm';
import type { z } from 'zod';

import { db as defaultDb } from '@/lib/db/drizzle';
import { projectData } from '@/lib/db/schema';
import { MODULE_2_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-2';
import { MODULE_3_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-3';
import { MODULE_4_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-4';

import {
  moduleRefSchema,
  type ModuleRef,
  type ModuleSlug,
} from '../schemas/engines/engine';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

/**
 * Return shape for `ArtifactReader.fetch()`.
 *
 * `artifacts` is keyed by "{module}/{phase_slug}" so callers can index
 * without reconstructing the ModuleRef. `missing_inputs` preserves the
 * original ModuleRef objects so the resolver can forward them to RAG.
 */
export interface ArtifactFetchResult {
  artifacts: Record<string, unknown>;
  missing_inputs: ModuleRef[];
  validation_errors: Array<{ ref: ModuleRef; issues: z.ZodIssue[] }>;
}

export type DrizzleClient = typeof defaultDb;

export interface ArtifactReaderOptions {
  db?: DrizzleClient;
}

// ─────────────────────────────────────────────────────────────────────────
// Module registry — module slug → (phase_slug → Zod schema)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build lookup from the canonical module registries. Adding a new module
 * (m1/m5/m6/m7 when they ship) is a 2-line edit here plus one new registry
 * import — keeps ArtifactReader schema-aware without hard-coding slugs.
 */
function buildSchemaRegistry(): Partial<
  Record<ModuleSlug, ReadonlyMap<string, z.ZodType>>
> {
  const toMap = (
    entries: readonly { slug: string; zodSchema: z.ZodType }[],
  ): ReadonlyMap<string, z.ZodType> =>
    new Map(entries.map((e) => [e.slug, e.zodSchema]));

  return {
    'module-2': toMap(MODULE_2_PHASE_SCHEMAS),
    'module-3': toMap(MODULE_3_PHASE_SCHEMAS),
    'module-4': toMap(MODULE_4_PHASE_SCHEMAS),
  };
}

const SCHEMA_REGISTRY = buildSchemaRegistry();

// ─────────────────────────────────────────────────────────────────────────
// JSONB landing-path registry — module slug → (phase_slug → dot-path)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Where each artifact is stored inside the `project_data` row.
 *
 * M2 artifacts live in `intake_state.kbStepData.<phase>` (LangGraph intake
 * state — see lib/db/queries/explorer.ts). M3/M4 do not yet have shipped
 * landing paths; we register the intended paths so the reader can read
 * them once writer agents land them. Until then they return as
 * `missing_inputs[]` which is the expected dry-run behavior.
 *
 * Using a relative column-scoped dot-path (not absolute "project_data.X")
 * so the reader can swap storage backends without changing the registry.
 */
interface LandingPath {
  /** JSONB column on project_data. */
  column: keyof typeof projectData._.columns;
  /** Dot-path inside that column's JSON value. Empty = column root. */
  path: string;
}

const LANDING_PATHS: Partial<
  Record<ModuleSlug, ReadonlyMap<string, LandingPath>>
> = {
  'module-2': new Map<string, LandingPath>([
    [
      'phase-0-ingest',
      { column: 'intakeState', path: 'kbStepData.phase-0-ingest' },
    ],
    [
      'phase-1-use-case-priority',
      { column: 'intakeState', path: 'kbStepData.phase-1-use-case-priority' },
    ],
    [
      'phase-2-thinking-functionally',
      {
        column: 'intakeState',
        path: 'kbStepData.phase-2-thinking-functionally',
      },
    ],
    [
      'phase-3-ucbd-setup',
      { column: 'intakeState', path: 'kbStepData.phase-3-ucbd-setup' },
    ],
    [
      'phase-4-start-end-conditions',
      {
        column: 'intakeState',
        path: 'kbStepData.phase-4-start-end-conditions',
      },
    ],
    [
      'phase-5-ucbd-step-flow',
      { column: 'intakeState', path: 'kbStepData.phase-5-ucbd-step-flow' },
    ],
    [
      'phase-6-requirements-table',
      {
        column: 'intakeState',
        path: 'kbStepData.phase-6-requirements-table',
      },
    ],
    [
      'phase-7-rules-audit',
      { column: 'intakeState', path: 'kbStepData.phase-7-rules-audit' },
    ],
    [
      'phase-8-constants-table',
      { column: 'intakeState', path: 'kbStepData.phase-8-constants-table' },
    ],
    [
      'phase-9-delve-and-fix',
      { column: 'intakeState', path: 'kbStepData.phase-9-delve-and-fix' },
    ],
    [
      'phase-10-sysml-activity',
      { column: 'intakeState', path: 'kbStepData.phase-10-sysml-activity' },
    ],
    [
      'phase-11-multi-uc-expansion',
      {
        column: 'intakeState',
        path: 'kbStepData.phase-11-multi-uc-expansion',
      },
    ],
    [
      'phase-12-ffbd-handoff',
      { column: 'intakeState', path: 'kbStepData.phase-12-ffbd-handoff' },
    ],
    [
      'phase-12-final-review',
      { column: 'intakeState', path: 'kbStepData.phase-12-final-review' },
    ],
  ]),
  'module-3': new Map<string, LandingPath>([
    [
      'phase-0a-ingest-m2-handoff',
      {
        column: 'intakeState',
        path: 'm3StepData.phase-0a-ingest-m2-handoff',
      },
    ],
    [
      'phase-6-shortcuts-reference-blocks',
      {
        column: 'intakeState',
        path: 'm3StepData.phase-6-shortcuts-reference-blocks',
      },
    ],
    [
      'phase-11-ffbd-to-decision-matrix',
      {
        column: 'intakeState',
        path: 'm3StepData.phase-11-ffbd-to-decision-matrix',
      },
    ],
  ]),
  'module-4': new Map<string, LandingPath>(
    MODULE_4_PHASE_SCHEMAS.map((entry) => [
      entry.slug,
      {
        column: 'intakeState',
        path: `m4StepData.${entry.slug}`,
      },
    ]),
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function refKey(ref: ModuleRef): string {
  return `${ref.module}/${ref.phase_slug}`;
}

/**
 * Walk a dot-path against a JSONB-ish value. Empty path returns the value
 * itself. Returns `undefined` on any missing hop — the caller treats that
 * as "artifact not yet written" (missing_inputs), not an error.
 */
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

function lookupSchema(ref: ModuleRef): z.ZodType | undefined {
  return SCHEMA_REGISTRY[ref.module]?.get(ref.phase_slug);
}

function lookupLandingPath(ref: ModuleRef): LandingPath | undefined {
  return LANDING_PATHS[ref.module]?.get(ref.phase_slug);
}

// ─────────────────────────────────────────────────────────────────────────
// Reader
// ─────────────────────────────────────────────────────────────────────────

export class ArtifactReader {
  private readonly db: DrizzleClient;

  constructor(options: ArtifactReaderOptions = {}) {
    this.db = options.db ?? defaultDb;
  }

  /**
   * Fetch + validate the requested artifacts for a single project.
   *
   * Invariants:
   *   - never throws on missing artifact; records in `missing_inputs[]`
   *   - never throws on unknown ModuleRef slug; records as missing
   *   - ALWAYS throws on Zod-validation failure of a present artifact
   *     (data corruption — fail loud so caller doesn't act on drift)
   *
   * Behavior when the project has no project_data row at all: every
   * requested ref becomes a missing_input — treated as dry-run for new
   * projects, which is the expected onboarding state.
   */
  async fetch(
    projectId: number,
    refs: readonly ModuleRef[],
  ): Promise<ArtifactFetchResult> {
    // Validate inputs at boundary
    for (const ref of refs) {
      moduleRefSchema.parse(ref);
    }

    const artifacts: Record<string, unknown> = {};
    const missing: ModuleRef[] = [];
    const validationErrors: ArtifactFetchResult['validation_errors'] = [];

    if (refs.length === 0) {
      return { artifacts, missing_inputs: missing, validation_errors: validationErrors };
    }

    // One DB read per project — ArtifactReader is per-decision, not per-ref
    const row = await this.db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
    });

    for (const ref of refs) {
      const landing = lookupLandingPath(ref);
      const schema = lookupSchema(ref);

      if (!landing || !schema) {
        // Unknown ref — resolver will decide whether RAG can cover it
        missing.push(ref);
        continue;
      }

      if (!row) {
        missing.push(ref);
        continue;
      }

      const columnValue = row[landing.column as keyof typeof row];
      const raw = readDotPath(columnValue, landing.path);

      if (raw === undefined || raw === null) {
        missing.push(ref);
        continue;
      }

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        validationErrors.push({ ref, issues: parsed.error.issues });
        continue;
      }

      artifacts[refKey(ref)] = parsed.data;
    }

    if (validationErrors.length > 0) {
      const summary = validationErrors
        .map(
          (e) =>
            `${refKey(e.ref)} (${e.issues.length} issue${e.issues.length === 1 ? '' : 's'})`,
        )
        .join(', ');
      throw new ArtifactValidationError(
        `upstream artifacts failed schema validation for project ${projectId}: ${summary}`,
        validationErrors,
      );
    }

    return {
      artifacts,
      missing_inputs: missing,
      validation_errors: validationErrors,
    };
  }

  /**
   * Test hook — exposes the landing-path registry for fixture assertions.
   * Not part of the production contract; do not use from runtime code.
   */
  static _landingPaths(): typeof LANDING_PATHS {
    return LANDING_PATHS;
  }
}

export class ArtifactValidationError extends Error {
  readonly details: Array<{ ref: ModuleRef; issues: z.ZodIssue[] }>;

  constructor(
    message: string,
    details: Array<{ ref: ModuleRef; issues: z.ZodIssue[] }>,
  ) {
    super(message);
    this.name = 'ArtifactValidationError';
    this.details = details;
  }
}
