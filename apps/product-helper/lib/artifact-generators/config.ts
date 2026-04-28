/**
 * Per-generator runtime config.
 *
 * Sources:
 *   - plans/c1v-MIT-Crawley-Cornell.v2.md §15.6 (invoke runtime classes)
 *   - scripts/artifact-generators/types.ts (GeneratorName canonical list)
 *
 * runtimeClass:
 *   'inline' — awaited synchronously inside the calling request. Suitable for
 *     deterministic openpyxl/python-pptx/graphviz generators whose p95 is well
 *     below ~3s on dev/CI machines.
 *   'queue' — dispatched to BullMQ. Used for anything that touches an LLM or
 *     performs a multi-stage render pipeline where p95 can exceed 5s.
 *
 * maxElapsedMs is advisory: the invoke spawn wrapper uses it to decide the
 * inline timeout. It is NOT a strict SLO — generators that blow past it still
 * get a chance to finish within 2×, then are SIGKILLed.
 *
 * inputSchemaRef must match the generator's expected ``schemaRef`` input field
 * (see scripts/artifact-generators/common/schema_loader.py resolution roots).
 */

import type { GeneratorName } from '../../../../scripts/artifact-generators/types';

export type RuntimeClass = 'inline' | 'queue';

export interface GeneratorConfigEntry {
  runtimeClass: RuntimeClass;
  /** Advisory p95 target used as inline-timeout seed. */
  maxElapsedMs: number;
  /** schemaRef as passed to the generator in ArtifactGeneratorInput. */
  inputSchemaRef: string;
  /** Typical artifact targets (for UI prefetch hints; not enforced). */
  defaultTargets: Array<'xlsx' | 'pptx' | 'mmd' | 'svg' | 'pdf' | 'html' | 'json-enriched'>;
}

export const GENERATOR_CONFIG: Record<GeneratorName, GeneratorConfigEntry> = {
  'gen-ffbd': {
    runtimeClass: 'inline',
    maxElapsedMs: 3000,
    inputSchemaRef: 'ffbd.schema.json',
    defaultTargets: ['mmd', 'svg'],
  },
  'gen-qfd': {
    runtimeClass: 'inline',
    maxElapsedMs: 3000,
    inputSchemaRef: 'qfd.schema.json',
    defaultTargets: ['xlsx'],
  },
  'gen-n2': {
    runtimeClass: 'inline',
    maxElapsedMs: 2000,
    inputSchemaRef: 'n2-chart.schema.json',
    defaultTargets: ['xlsx', 'mmd'],
  },
  'gen-sequence': {
    runtimeClass: 'inline',
    maxElapsedMs: 2000,
    inputSchemaRef: 'sequence.schema.json',
    defaultTargets: ['mmd', 'svg'],
  },
  'gen-dfd': {
    runtimeClass: 'inline',
    maxElapsedMs: 2500,
    inputSchemaRef: 'dfd.schema.json',
    defaultTargets: ['mmd', 'svg'],
  },
  'gen-interfaces': {
    runtimeClass: 'inline',
    maxElapsedMs: 3000,
    inputSchemaRef: 'interfaces.schema.json',
    defaultTargets: ['xlsx', 'mmd'],
  },
  'gen-fmea': {
    runtimeClass: 'inline',
    maxElapsedMs: 3500,
    inputSchemaRef: 'fmea.schema.json',
    defaultTargets: ['xlsx', 'svg'],
  },
  'gen-ucbd': {
    runtimeClass: 'inline',
    maxElapsedMs: 2500,
    inputSchemaRef: 'ucbd.schema.json',
    defaultTargets: ['mmd', 'svg'],
  },
  'gen-decision-net': {
    runtimeClass: 'inline',
    maxElapsedMs: 3000,
    inputSchemaRef: 'decision-network.stub.schema.json',
    defaultTargets: ['mmd', 'svg', 'json-enriched'],
  },
  'gen-form-function': {
    runtimeClass: 'inline',
    maxElapsedMs: 3000,
    inputSchemaRef: 'form-function-map.stub.schema.json',
    defaultTargets: ['xlsx', 'json-enriched'],
  },
  'gen-cost-curves': {
    runtimeClass: 'inline',
    maxElapsedMs: 3500,
    inputSchemaRef: 'cost-curves.schema.json',
    defaultTargets: ['svg', 'json-enriched'],
  },
  'gen-latency-chain': {
    runtimeClass: 'inline',
    maxElapsedMs: 2500,
    inputSchemaRef: 'latency-chain.schema.json',
    defaultTargets: ['svg', 'json-enriched'],
  },
  'gen-arch-recommendation': {
    runtimeClass: 'queue',
    maxElapsedMs: 30000,
    inputSchemaRef: 'architecture-recommendation.schema.json',
    defaultTargets: ['pptx', 'pdf', 'json-enriched'],
  },
};

/** Threshold used by invoke.ts to auto-promote inline -> queue. */
export const INLINE_ELAPSED_THRESHOLD_MS = 5000;

export function getGeneratorConfig(name: GeneratorName): GeneratorConfigEntry {
  const entry = GENERATOR_CONFIG[name];
  if (!entry) {
    throw new Error(`[artifact-generators] unknown generator: ${name}`);
  }
  return entry;
}

export function shouldRunInline(name: GeneratorName): boolean {
  const cfg = getGeneratorConfig(name);
  return cfg.runtimeClass === 'inline' && cfg.maxElapsedMs <= INLINE_ELAPSED_THRESHOLD_MS;
}
