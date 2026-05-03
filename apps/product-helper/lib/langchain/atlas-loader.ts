/**
 * KB-9 Atlas — runtime loader + prompt-block renderer.
 *
 * Plan §6.2 (intake-prompt-redesign): the intake prompt redesign needs a
 * single entry point for "load empirical priors for archetype X and render
 * them into the prompt." v1 ships a stub: `getPriorsForArchetype` returns
 * `{provisional: true, entryCount: 0}` with empty arrays, and the renderer
 * emits an honest "no peer evidence available" line — NOT the legacy
 * "industry-standard" boilerplate.
 *
 * Real wiring (deferred):
 *   - Atlas data lives at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/02-data/*.json`
 *     and is also ingested into `kb_chunks` with `kb_source='atlas'`.
 *   - When wired, `getPriorsForArchetype` will (a) filter Atlas entries by
 *     archetype tag, (b) collect the per-entry priors (cost/latency/avail/
 *     throughput), (c) flip `provisional` to `false` once `entryCount >= 7`
 *     per v1 R2 ruling 2026-04-23.
 *
 * The v1 stub keeps the call site honest: the renderer always emits a
 * truthful "no peer evidence available for archetype <tag> yet" instead of
 * fabricated priors — see plan §9 acceptance test #5.
 *
 * @module lib/langchain/atlas-loader
 */

import type { z } from 'zod';
import {
  latencyPriorSchema,
  availabilityPriorSchema,
  throughputPriorSchema,
  costCurveSchema,
  citationSchema,
} from './schemas/atlas/priors';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export type LatencyPrior = z.infer<typeof latencyPriorSchema>;
export type AvailabilityPrior = z.infer<typeof availabilityPriorSchema>;
export type ThroughputPrior = z.infer<typeof throughputPriorSchema>;
export type CostCurve = z.infer<typeof costCurveSchema>;
export type Citation = z.infer<typeof citationSchema>;

export type PriorKind = 'latency' | 'availability' | 'throughput' | 'cost';

export interface AtlasPriors {
  latency: LatencyPrior[];
  availability: AvailabilityPrior[];
  throughput: ThroughputPrior[];
  cost: CostCurve[];
  citations: Citation[];
  /**
   * `true` when the corpus does not contain enough entries for this archetype
   * to produce a non-misleading prior. Per v1 R2 ruling 2026-04-23:
   * provisional iff `entryCount < 7`.
   */
  provisional: boolean;
  /**
   * Number of Atlas entries that contributed to this prior bundle (0 in the
   * v1 stub).
   */
  entryCount: number;
}

export interface RenderedAtlasPriors {
  text: string;
  provisional: boolean;
  entryCount: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Loader (v1 stub)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Load empirical priors for a project archetype from the KB-9 Atlas.
 *
 * v1 stub — always returns `{provisional: true, entryCount: 0}` with empty
 * arrays. Real implementation (deferred) reads from KB-9 atlas data at
 * `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/02-data/*.json`
 * OR from the `kb_chunks` table filtered by `kb_source='atlas'`.
 *
 * Per v1 R2 ruling 2026-04-23: `provisional` is `true` whenever the matched
 * corpus is `< 7` entries — at v1 that's always.
 *
 * @param tag archetype tag (e.g., `'saas'`, `'marketplace'`, `'ecommerce'`)
 */
export async function getPriorsForArchetype(
  tag: string,
): Promise<AtlasPriors> {
  // v1 stub — no atlas data wired into runtime yet.
  void tag;
  return {
    latency: [],
    availability: [],
    throughput: [],
    cost: [],
    citations: [],
    provisional: true,
    entryCount: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────────────────────────────────

/**
 * Format an arbitrary prior row as a flat one-line markdown table cell.
 * Pulls human-relevant fields off the row (description / value / units /
 * citation host) without leaking provenance hashes into the prompt.
 */
function renderRow(row: Record<string, unknown>): string {
  const description = (row.description as string | undefined) ?? '—';
  const value = row.value;
  const units = (row.units as string | undefined) ?? '';
  const citation = row.citation as { kb_source?: string; source_url?: string } | undefined;
  const cite = citation?.kb_source ?? citation?.source_url ?? '—';
  const valueStr =
    value === undefined || value === null
      ? '—'
      : typeof value === 'number'
        ? `${value}${units ? ` ${units}` : ''}`
        : JSON.stringify(value);
  return `| ${description} | ${valueStr} | ${cite} |`;
}

function renderRowsAsTable(kind: PriorKind, rows: Array<Record<string, unknown>>): string {
  const header = '| Description | Value | Source |';
  const sep = '|---|---|---|';
  const limited = rows.slice(0, 10);
  const body = limited.map((r) => renderRow(r)).join('\n');
  return `### ${kind}\n\n${header}\n${sep}\n${body}`;
}

/**
 * Render atlas priors as a prompt-ready text block. When `priors` is missing
 * or `provisional`, emits an honest:
 *
 *   `No peer evidence available for archetype "<tag>" yet (KB-9 Atlas
 *   corpus not wired into runtime).`
 *
 * The legacy "industry-standard" / "industry typical" boilerplate is
 * deliberately NEVER emitted — see plan §9 acceptance test #5 and the
 * regression test in `__tests__/atlas-loader.test.ts`.
 *
 * @param archetypeTag the same tag passed to `getPriorsForArchetype`
 * @param kinds        which prior categories to include (latency, availability, ...)
 * @param priors       the loaded priors (omit or pass a provisional bundle to get the honest fallback)
 */
export function renderAtlasPriors(
  archetypeTag: string,
  kinds: PriorKind[],
  priors?: AtlasPriors,
): RenderedAtlasPriors {
  const provisional = !priors || priors.provisional || priors.entryCount === 0;
  if (provisional) {
    return {
      text: `## Empirical priors\nNo peer evidence available for archetype "${archetypeTag}" yet (KB-9 Atlas corpus not wired into runtime).`,
      provisional: true,
      entryCount: priors?.entryCount ?? 0,
    };
  }

  const sections: string[] = [`## Empirical priors (archetype: ${archetypeTag})`];
  for (const kind of kinds) {
    const rows = priors[kind] as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) continue;
    sections.push(renderRowsAsTable(kind, rows));
  }
  // Edge: kinds were requested but no matching priors had data.
  if (sections.length === 1) {
    return {
      text: `## Empirical priors\nNo peer evidence available for archetype "${archetypeTag}" yet (KB-9 Atlas corpus not wired into runtime).`,
      provisional: true,
      entryCount: priors.entryCount,
    };
  }
  return {
    text: sections.join('\n\n'),
    provisional: false,
    entryCount: priors.entryCount,
  };
}
