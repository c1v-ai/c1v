/**
 * engine-loader — Load and Zod-validate engine.json story files.
 *
 * Source of truth: `plans/kb-runtime-architecture.md` §2.4 + G2, and the
 * shipped types in `lib/langchain/engines/nfr-engine-interpreter.ts`.
 *
 * One engine.json on disk = one `EngineDoc` = one story holding N decisions.
 * Files live at `apps/product-helper/.planning/engines/{story_slug}.json`.
 * The loader is the ONLY component that parses raw engine JSON — once
 * loaded, everything downstream (NFREngineInterpreter, ContextResolver,
 * tests, tooling) consumes typed `EngineDoc` / `DecisionRef` objects.
 *
 * @module lib/langchain/engines/engine-loader
 */

import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { z } from 'zod';

import {
  engineDocSchema,
  type DecisionRef,
  type EngineDoc,
} from '../schemas/engines/engine';

// ─────────────────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────────────────

/**
 * Default on-disk home for engine.json files. Resolved lazily so tests and
 * alternate tooling can override with a custom `basePath`.
 */
export const DEFAULT_ENGINES_DIR = resolve(
  process.cwd(),
  '.planning/engines',
);

// ─────────────────────────────────────────────────────────────────────────
// Errors — typed so callers can branch cleanly
// ─────────────────────────────────────────────────────────────────────────

export class EngineLoadError extends Error {
  readonly slug: string;
  readonly cause?: unknown;

  constructor(slug: string, message: string, cause?: unknown) {
    super(`[engine:${slug}] ${message}`);
    this.name = 'EngineLoadError';
    this.slug = slug;
    this.cause = cause;
  }
}

export class EngineValidationError extends EngineLoadError {
  readonly issues: z.ZodIssue[];

  constructor(slug: string, issues: z.ZodIssue[]) {
    const summary = issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    super(slug, `engine.json failed Zod validation — ${summary}`);
    this.name = 'EngineValidationError';
    this.issues = issues;
  }
}

export class EngineNotFoundError extends EngineLoadError {
  constructor(slug: string, path: string) {
    super(slug, `engine.json not found at ${path}`);
    this.name = 'EngineNotFoundError';
  }
}

export class DecisionNotFoundError extends EngineLoadError {
  readonly decisionId: string;

  constructor(slug: string, decisionId: string) {
    super(slug, `no decision with decision_id="${decisionId}" in story "${slug}"`);
    this.name = 'DecisionNotFoundError';
    this.decisionId = decisionId;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Slug validation — defense-in-depth against path-traversal
// ─────────────────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,119}$/;

function assertSafeSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new EngineLoadError(
      slug,
      'slug must be lowercase-dash-kebab, 3-120 chars (prevents path traversal)',
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Loader
// ─────────────────────────────────────────────────────────────────────────

export interface LoadEngineOptions {
  /** Override the engines directory (tests + alternate tooling). */
  basePath?: string;
}

/**
 * Load an engine.json story file, parse JSON, and Zod-validate.
 *
 * Invariants:
 *   - returns a fully-validated `EngineDoc`, or throws
 *   - filename slug MUST match embedded `story_id` (catches rename drift)
 *   - malformed engines are a configuration bug — callers should NOT
 *     catch + swallow; fail loud
 */
export async function loadEngine(
  slug: string,
  options: LoadEngineOptions = {},
): Promise<EngineDoc> {
  assertSafeSlug(slug);

  const basePath = options.basePath ?? DEFAULT_ENGINES_DIR;
  const filePath = join(basePath, `${slug}.json`);

  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException | undefined)?.code;
    if (code === 'ENOENT') {
      throw new EngineNotFoundError(slug, filePath);
    }
    throw new EngineLoadError(slug, `failed to read ${filePath}`, err);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new EngineLoadError(slug, `invalid JSON in ${filePath}`, err);
  }

  const result = engineDocSchema.safeParse(parsed);
  if (!result.success) {
    throw new EngineValidationError(slug, result.error.issues);
  }

  if (result.data.story_id !== slug) {
    throw new EngineLoadError(
      slug,
      `story_id mismatch: file is "${slug}" but story_id="${result.data.story_id}"`,
    );
  }

  return result.data;
}

/**
 * Look up a single decision inside a loaded story. Throws
 * `DecisionNotFoundError` when the decision_id isn't present.
 */
export function getDecision(doc: EngineDoc, decisionId: string): DecisionRef {
  const match = doc.decisions.find((d) => d.decision_id === decisionId);
  if (!match) {
    throw new DecisionNotFoundError(doc.story_id, decisionId);
  }
  return match;
}

/**
 * Convenience: load a story + resolve a single decision in one call.
 * Matches the access pattern ContextResolver + NFREngineInterpreter use.
 */
export async function loadDecision(
  storySlug: string,
  decisionId: string,
  options: LoadEngineOptions = {},
): Promise<{ doc: EngineDoc; decision: DecisionRef }> {
  const doc = await loadEngine(storySlug, options);
  return { doc, decision: getDecision(doc, decisionId) };
}

/**
 * Batch-load several stories. Fails fast on the first validation error —
 * this is a config-load path, not a resilient hot path.
 */
export async function loadEngines(
  slugs: readonly string[],
  options: LoadEngineOptions = {},
): Promise<Record<string, EngineDoc>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => [slug, await loadEngine(slug, options)] as const),
  );
  return Object.fromEntries(entries);
}
