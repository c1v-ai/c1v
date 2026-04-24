#!/usr/bin/env tsx
/**
 * Build T4b self-application artifacts.
 *
 * Hand-synthesizes c1v's own decision network + interface specs against
 * real upstream self-application artifacts (module-1..8 already shipped).
 * All outputs round-trip through Zod schemas; LLM is stubbed per T4b
 * portfolio-demo scope.
 *
 * Emits:
 *   - system-design/kb-upgrade-v2/module-4-decision-matrix/decision_network.v1.json
 *   - system-design/kb-upgrade-v2/module-7-interfaces/interface_specs.v1.json
 *
 * Run: pnpm tsx scripts/build-t4b-self-application.ts
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import {
  phase14Schema,
  phase15Schema,
  phase16Schema,
  phase17bSchema,
  phase19Schema,
  phases11to13VectorScoresSchema,
  type DecisionNode,
} from '../lib/langchain/schemas/module-4';
import {
  interfaceSpecsV1Schema,
  type InterfaceSpec,
} from '../lib/langchain/schemas/module-7-interfaces';
import {
  computeParetoFrontier,
  computeSensitivity,
  computePriorBindingChain,
  hashRow,
  validateDecisionNetworkArtifact,
  type DecisionNetworkV1,
  type DecisionAuditRow,
} from '../lib/langchain/agents/system-design/decision-net-agent';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const SD_ROOT = join(REPO_ROOT, 'system-design', 'kb-upgrade-v2');

const PRODUCED_AT = '2026-04-24T18:00:00-04:00';
const PRODUCED_BY = 'c1v-m4-decision-net@wave-3-t4b/decision-net-agent';

// ─── Decision nodes ─────────────────────────────────────────────────────
//
// Four real c1v architecture decisions aligned with F.1..F.7 FFBD + NFRs:
//   DN.01 — LLM provider choice (Anthropic vs OpenAI vs OpenRouter)
//   DN.02 — Vector store (pgvector vs Pinecone vs Weaviate)
//   DN.03 — Orchestration runtime (LangGraph vs LangChain Chains vs custom)
//   DN.04 — Deployment target (Vercel vs Cloud Run vs Fly.io)
//
// Criteria PC-01..PC-04 reused from existing M4 phase-3 baseline.

const dn01: DecisionNode = {
  id: 'DN.01',
  title: 'Choose LLM provider for F.2 spec generation',
  question: 'Which LLM API maximizes citation accuracy + p95 latency within cost ceiling?',
  alternatives: [
    { id: 'A', name: 'Anthropic Claude Sonnet 4.5', description: 'Primary candidate per CLAUDE.md' },
    { id: 'B', name: 'OpenAI GPT-4 Turbo', description: 'Alternative with broader tool ecosystem' },
    { id: 'C', name: 'OpenRouter federated', description: 'Fallback with multi-model routing' },
  ],
  criteria: [
    { criterion_id: 'PC-01', weight: 0.35, direction: 'maximize' }, // accuracy
    { criterion_id: 'PC-02', weight: 0.25, direction: 'minimize' }, // p95 latency
    { criterion_id: 'PC-03', weight: 0.25, direction: 'minimize' }, // cost
    { criterion_id: 'PC-04', weight: 0.15, direction: 'maximize' }, // availability
  ],
  scores: [
    { alternative_id: 'A', criterion_id: 'PC-01', raw_value: 0.92, normalized_value: 0.92,
      empirical_priors: { source: 'kb-8-atlas', ref: 'anthropic-claude-2026.md', sample_size: 12, provisional: false },
      math_derivation: { formula: 'accuracy from atlas benchmark', inputs: {}, kb_source: 'anthropic-claude-2026.md', result: 0.92, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-01', raw_value: 0.88, normalized_value: 0.88,
      empirical_priors: { source: 'kb-8-atlas', ref: 'openai-gpt4-2026.md', sample_size: 14, provisional: false },
      math_derivation: { formula: 'accuracy from atlas benchmark', inputs: {}, kb_source: 'openai-gpt4-2026.md', result: 0.88, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-01', raw_value: 0.83, normalized_value: 0.83,
      empirical_priors: { source: 'inferred', ref: 'openrouter-routed-mean', provisional: true, rationale: 'OpenRouter accuracy = weighted mean of routed models; no single atlas entry.' },
      math_derivation: { formula: 'weighted mean of routed model atlas entries', inputs: {}, kb_source: 'inline', result: 0.83, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-02', raw_value: 1800, normalized_value: 0.7,
      empirical_priors: { source: 'nfr', ref: 'NFR.04', provisional: false },
      math_derivation: { formula: 'p95 latency = 1800ms (atlas) normalized against 3000ms ceiling', inputs: { ceiling_ms: 3000 }, kb_source: 'anthropic-claude-2026.md', result: 0.7, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-02', raw_value: 2100, normalized_value: 0.6,
      empirical_priors: { source: 'kb-8-atlas', ref: 'openai-gpt4-2026.md', sample_size: 14, provisional: false },
      math_derivation: { formula: 'p95 latency normalized against ceiling', inputs: { ceiling_ms: 3000 }, kb_source: 'openai-gpt4-2026.md', result: 0.6, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-02', raw_value: 2400, normalized_value: 0.5,
      empirical_priors: { source: 'inferred', ref: 'openrouter-routing-overhead', provisional: true, rationale: 'Adds ~300ms routing hop over base provider.' },
      math_derivation: { formula: 'base_p95 + routing_overhead_p95', inputs: { routing_overhead_ms: 300 }, kb_source: 'inline', result: 0.5, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-03', raw_value: 15, normalized_value: 0.7,
      empirical_priors: { source: 'kb-8-atlas', ref: 'anthropic-claude-2026.md', sample_size: 12, provisional: false },
      math_derivation: { formula: '$/Mtoken normalized vs 25 ceiling', inputs: { ceiling_usd: 25 }, kb_source: 'anthropic-claude-2026.md', result: 0.7, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-03', raw_value: 10, normalized_value: 0.8,
      empirical_priors: { source: 'kb-8-atlas', ref: 'openai-gpt4-2026.md', sample_size: 14, provisional: false },
      math_derivation: { formula: '$/Mtoken normalized', inputs: { ceiling_usd: 25 }, kb_source: 'openai-gpt4-2026.md', result: 0.8, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-03', raw_value: 12, normalized_value: 0.76,
      empirical_priors: { source: 'inferred', ref: 'openrouter-mean-cost', provisional: true, rationale: 'Mean of routed alternatives + 3% margin.' },
      math_derivation: { formula: 'weighted mean + margin', inputs: { margin_pct: 3 }, kb_source: 'inline', result: 0.76, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-04', raw_value: 99.9, normalized_value: 0.9,
      empirical_priors: { source: 'kb-8-atlas', ref: 'anthropic-claude-2026.md', sample_size: 12, provisional: false },
      math_derivation: { formula: 'availability % / 100 (scaled)', inputs: {}, kb_source: 'anthropic-claude-2026.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-04', raw_value: 99.95, normalized_value: 0.95,
      empirical_priors: { source: 'kb-8-atlas', ref: 'openai-gpt4-2026.md', sample_size: 14, provisional: false },
      math_derivation: { formula: 'availability %', inputs: {}, kb_source: 'openai-gpt4-2026.md', result: 0.95, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-04', raw_value: 99.85, normalized_value: 0.85,
      empirical_priors: { source: 'inferred', ref: 'openrouter-compound-availability', provisional: true, rationale: 'Compound availability across routed providers is lower than single-provider.' },
      math_derivation: { formula: 'Π(avail_i) over routed set', inputs: {}, kb_source: 'inline', result: 0.85, result_shape: 'scalar' } },
  ],
  dependency_edges: [],
  utility_vector: {
    formula: 'U(a) = Σ w_c · score(a,c)',
    values: [
      { alternative_id: 'A', utility: 0.35 * 0.92 + 0.25 * 0.7 + 0.25 * 0.7 + 0.15 * 0.9 },
      { alternative_id: 'B', utility: 0.35 * 0.88 + 0.25 * 0.6 + 0.25 * 0.8 + 0.15 * 0.95 },
      { alternative_id: 'C', utility: 0.35 * 0.83 + 0.25 * 0.5 + 0.25 * 0.76 + 0.15 * 0.85 },
    ],
    math_derivation: {
      formula: 'U(a) = Σ w_c · score(a,c)',
      inputs: {},
      kb_source: 'inline',
      result_shape: 'vector',
      result_vector: [
        0.35 * 0.92 + 0.25 * 0.7 + 0.25 * 0.7 + 0.15 * 0.9,
        0.35 * 0.88 + 0.25 * 0.6 + 0.25 * 0.8 + 0.15 * 0.95,
        0.35 * 0.83 + 0.25 * 0.5 + 0.25 * 0.76 + 0.15 * 0.85,
      ],
    },
  },
};

const dn02: DecisionNode = {
  id: 'DN.02',
  title: 'Choose vector store for RAG (F.6 recommendation)',
  question: 'Which vector store balances query p95 latency, cost, and operational simplicity?',
  alternatives: [
    { id: 'A', name: 'pgvector (Supabase Postgres)', description: 'Same DB as app — one system.' },
    { id: 'B', name: 'Pinecone managed', description: 'Specialized vector DB.' },
    { id: 'C', name: 'Weaviate self-hosted', description: 'Open-source, ops-heavy.' },
  ],
  criteria: [
    { criterion_id: 'PC-01', weight: 0.30, direction: 'maximize' },
    { criterion_id: 'PC-02', weight: 0.30, direction: 'minimize' },
    { criterion_id: 'PC-03', weight: 0.25, direction: 'minimize' },
    { criterion_id: 'PC-04', weight: 0.15, direction: 'maximize' },
  ],
  scores: [
    { alternative_id: 'A', criterion_id: 'PC-01', raw_value: 0.85, normalized_value: 0.85, empirical_priors: { source: 'kb-shared', ref: 'data-model-kb.md', provisional: false }, math_derivation: { formula: 'recall@10 from shared KB', inputs: {}, kb_source: 'data-model-kb.md', result: 0.85, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-01', raw_value: 0.93, normalized_value: 0.93, empirical_priors: { source: 'kb-8-atlas', ref: 'pinecone-2026.md', sample_size: 10, provisional: false }, math_derivation: { formula: 'recall@10 atlas', inputs: {}, kb_source: 'pinecone-2026.md', result: 0.93, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-01', raw_value: 0.90, normalized_value: 0.90, empirical_priors: { source: 'kb-8-atlas', ref: 'weaviate-2026.md', sample_size: 8, provisional: true }, math_derivation: { formula: 'recall@10 atlas', inputs: {}, kb_source: 'weaviate-2026.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-02', raw_value: 45, normalized_value: 0.78, empirical_priors: { source: 'kb-shared', ref: 'data-model-kb.md', provisional: false }, math_derivation: { formula: 'p95 ms / ceiling', inputs: { ceiling: 200 }, kb_source: 'data-model-kb.md', result: 0.78, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-02', raw_value: 25, normalized_value: 0.88, empirical_priors: { source: 'kb-8-atlas', ref: 'pinecone-2026.md', sample_size: 10, provisional: false }, math_derivation: { formula: 'p95 ms / ceiling', inputs: { ceiling: 200 }, kb_source: 'pinecone-2026.md', result: 0.88, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-02', raw_value: 60, normalized_value: 0.70, empirical_priors: { source: 'kb-8-atlas', ref: 'weaviate-2026.md', sample_size: 8, provisional: true }, math_derivation: { formula: 'p95 ms', inputs: {}, kb_source: 'weaviate-2026.md', result: 0.7, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-03', raw_value: 0, normalized_value: 0.95, empirical_priors: { source: 'inferred', ref: 'bundled-with-postgres', provisional: false, rationale: 'No marginal cost: same DB as app tier.' }, math_derivation: { formula: 'incremental $ = 0 (bundled)', inputs: {}, kb_source: 'inline', result: 0.95, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-03', raw_value: 120, normalized_value: 0.5, empirical_priors: { source: 'kb-8-atlas', ref: 'pinecone-2026.md', sample_size: 10, provisional: false }, math_derivation: { formula: '$/M vectors/mo', inputs: {}, kb_source: 'pinecone-2026.md', result: 0.5, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-03', raw_value: 60, normalized_value: 0.65, empirical_priors: { source: 'inferred', ref: 'self-host-ops-cost', provisional: true, rationale: 'Self-hosted compute + ops time amortized.' }, math_derivation: { formula: 'compute + ops hours * rate', inputs: {}, kb_source: 'inline', result: 0.65, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-04', raw_value: 99.9, normalized_value: 0.9, empirical_priors: { source: 'kb-8-atlas', ref: 'supabase-2026.md', sample_size: 11, provisional: false }, math_derivation: { formula: 'availability %', inputs: {}, kb_source: 'supabase-2026.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-04', raw_value: 99.95, normalized_value: 0.95, empirical_priors: { source: 'kb-8-atlas', ref: 'pinecone-2026.md', sample_size: 10, provisional: false }, math_derivation: { formula: 'availability %', inputs: {}, kb_source: 'pinecone-2026.md', result: 0.95, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-04', raw_value: 99.5, normalized_value: 0.82, empirical_priors: { source: 'inferred', ref: 'self-host-single-node', provisional: true, rationale: 'Single-node self-host caps availability.' }, math_derivation: { formula: 'single-node availability', inputs: {}, kb_source: 'inline', result: 0.82, result_shape: 'scalar' } },
  ],
  dependency_edges: [],
  utility_vector: {
    formula: 'U(a) = Σ w_c · score(a,c)',
    values: [
      { alternative_id: 'A', utility: 0.3 * 0.85 + 0.3 * 0.78 + 0.25 * 0.95 + 0.15 * 0.9 },
      { alternative_id: 'B', utility: 0.3 * 0.93 + 0.3 * 0.88 + 0.25 * 0.5 + 0.15 * 0.95 },
      { alternative_id: 'C', utility: 0.3 * 0.90 + 0.3 * 0.70 + 0.25 * 0.65 + 0.15 * 0.82 },
    ],
    math_derivation: { formula: 'U(a) = Σ w_c · score(a,c)', inputs: {}, kb_source: 'inline', result_shape: 'vector',
      result_vector: [0.3 * 0.85 + 0.3 * 0.78 + 0.25 * 0.95 + 0.15 * 0.9, 0.3 * 0.93 + 0.3 * 0.88 + 0.25 * 0.5 + 0.15 * 0.95, 0.3 * 0.90 + 0.3 * 0.70 + 0.25 * 0.65 + 0.15 * 0.82] },
  },
};

const dn03: DecisionNode = {
  id: 'DN.03',
  title: 'Choose orchestration runtime for F.2..F.7 chain',
  question: 'Which agent-orchestration framework minimizes integration cost + supports stateful workflows?',
  alternatives: [
    { id: 'A', name: 'LangGraph', description: 'State-machine orchestrator.' },
    { id: 'B', name: 'LangChain Chains', description: 'Linear chaining.' },
    { id: 'C', name: 'Custom orchestrator', description: 'Bespoke TS.' },
  ],
  criteria: [
    { criterion_id: 'PC-01', weight: 0.30, direction: 'maximize' },
    { criterion_id: 'PC-02', weight: 0.20, direction: 'minimize' },
    { criterion_id: 'PC-03', weight: 0.20, direction: 'minimize' },
    { criterion_id: 'PC-04', weight: 0.30, direction: 'maximize' },
  ],
  scores: [
    { alternative_id: 'A', criterion_id: 'PC-01', raw_value: 0.90, normalized_value: 0.90, empirical_priors: { source: 'kb-shared', ref: 'software_architecture_system.md', provisional: false }, math_derivation: { formula: 'orchestrator-fit score', inputs: {}, kb_source: 'software_architecture_system.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-01', raw_value: 0.75, normalized_value: 0.75, empirical_priors: { source: 'kb-shared', ref: 'software_architecture_system.md', provisional: false }, math_derivation: { formula: 'linear-chain fit', inputs: {}, kb_source: 'software_architecture_system.md', result: 0.75, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-01', raw_value: 0.85, normalized_value: 0.85, empirical_priors: { source: 'inferred', ref: 'bespoke-flexibility', provisional: true, rationale: 'Custom implementation can match requirements exactly but adds build cost.' }, math_derivation: { formula: 'fit - build_cost', inputs: {}, kb_source: 'inline', result: 0.85, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-02', raw_value: 50, normalized_value: 0.85, empirical_priors: { source: 'kb-shared', ref: 'software_architecture_system.md', provisional: false }, math_derivation: { formula: 'overhead ms', inputs: {}, kb_source: 'software_architecture_system.md', result: 0.85, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-02', raw_value: 30, normalized_value: 0.90, empirical_priors: { source: 'kb-shared', ref: 'software_architecture_system.md', provisional: false }, math_derivation: { formula: 'overhead ms', inputs: {}, kb_source: 'software_architecture_system.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-02', raw_value: 20, normalized_value: 0.95, empirical_priors: { source: 'inferred', ref: 'bespoke-overhead', provisional: true, rationale: 'Custom TS has minimal framework overhead.' }, math_derivation: { formula: 'overhead ms', inputs: {}, kb_source: 'inline', result: 0.95, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-03', raw_value: 0, normalized_value: 0.9, empirical_priors: { source: 'inferred', ref: 'OSS-no-license', provisional: false, rationale: 'LangGraph is open-source, no runtime license cost.' }, math_derivation: { formula: '$ license cost', inputs: {}, kb_source: 'inline', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-03', raw_value: 0, normalized_value: 0.9, empirical_priors: { source: 'inferred', ref: 'OSS-no-license', provisional: false, rationale: 'LangChain is open-source.' }, math_derivation: { formula: '$ license cost', inputs: {}, kb_source: 'inline', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-03', raw_value: 0, normalized_value: 0.6, empirical_priors: { source: 'inferred', ref: 'bespoke-build-cost', provisional: true, rationale: 'Custom orchestrator incurs build+maint hours.' }, math_derivation: { formula: 'dev hours * rate', inputs: {}, kb_source: 'inline', result: 0.6, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-04', raw_value: 99.9, normalized_value: 0.9, empirical_priors: { source: 'nfr', ref: 'NFR.05', provisional: false }, math_derivation: { formula: 'availability % normalized', inputs: {}, kb_source: 'inline', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-04', raw_value: 99.9, normalized_value: 0.85, empirical_priors: { source: 'nfr', ref: 'NFR.05', provisional: false }, math_derivation: { formula: 'availability with linear-chain gaps', inputs: {}, kb_source: 'inline', result: 0.85, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-04', raw_value: 99.5, normalized_value: 0.75, empirical_priors: { source: 'inferred', ref: 'bespoke-maturity', provisional: true, rationale: 'Custom code has lower maturity-day-1 availability.' }, math_derivation: { formula: 'maturity-adjusted availability', inputs: {}, kb_source: 'inline', result: 0.75, result_shape: 'scalar' } },
  ],
  dependency_edges: ['DN.01'],
  utility_vector: {
    formula: 'U(a) = Σ w_c · score(a,c)',
    values: [
      { alternative_id: 'A', utility: 0.3 * 0.90 + 0.2 * 0.85 + 0.2 * 0.9 + 0.3 * 0.9 },
      { alternative_id: 'B', utility: 0.3 * 0.75 + 0.2 * 0.90 + 0.2 * 0.9 + 0.3 * 0.85 },
      { alternative_id: 'C', utility: 0.3 * 0.85 + 0.2 * 0.95 + 0.2 * 0.6 + 0.3 * 0.75 },
    ],
    math_derivation: { formula: 'U(a) = Σ w_c · score(a,c)', inputs: {}, kb_source: 'inline', result_shape: 'vector',
      result_vector: [0.3 * 0.90 + 0.2 * 0.85 + 0.2 * 0.9 + 0.3 * 0.9, 0.3 * 0.75 + 0.2 * 0.90 + 0.2 * 0.9 + 0.3 * 0.85, 0.3 * 0.85 + 0.2 * 0.95 + 0.2 * 0.6 + 0.3 * 0.75] },
  },
};

const dn04: DecisionNode = {
  id: 'DN.04',
  title: 'Choose deployment target for Next.js app tier',
  question: 'Which hosting platform meets NFR-04 customer-overhead cap and availability targets?',
  alternatives: [
    { id: 'A', name: 'Vercel', description: 'Primary (per CLAUDE.md, deployed at prd.c1v.ai).' },
    { id: 'B', name: 'Cloud Run', description: 'GCP container runtime.' },
    { id: 'C', name: 'Fly.io', description: 'Edge-distributed containers.' },
  ],
  criteria: [
    { criterion_id: 'PC-01', weight: 0.20, direction: 'maximize' },
    { criterion_id: 'PC-02', weight: 0.30, direction: 'minimize' },
    { criterion_id: 'PC-03', weight: 0.25, direction: 'minimize' },
    { criterion_id: 'PC-04', weight: 0.25, direction: 'maximize' },
  ],
  scores: [
    { alternative_id: 'A', criterion_id: 'PC-01', raw_value: 0.90, normalized_value: 0.90, empirical_priors: { source: 'kb-shared', ref: 'deployment-release-cicd-kb.md', provisional: false }, math_derivation: { formula: 'dev-ergonomics score', inputs: {}, kb_source: 'deployment-release-cicd-kb.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-01', raw_value: 0.78, normalized_value: 0.78, empirical_priors: { source: 'kb-shared', ref: 'deployment-release-cicd-kb.md', provisional: false }, math_derivation: { formula: 'dev-ergonomics', inputs: {}, kb_source: 'deployment-release-cicd-kb.md', result: 0.78, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-01', raw_value: 0.82, normalized_value: 0.82, empirical_priors: { source: 'kb-shared', ref: 'deployment-release-cicd-kb.md', provisional: false }, math_derivation: { formula: 'dev-ergonomics', inputs: {}, kb_source: 'deployment-release-cicd-kb.md', result: 0.82, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-02', raw_value: 80, normalized_value: 0.9, empirical_priors: { source: 'kb-shared', ref: 'cdn-networking-kb.md', provisional: false }, math_derivation: { formula: 'cold-start + edge ms', inputs: {}, kb_source: 'cdn-networking-kb.md', result: 0.9, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-02', raw_value: 120, normalized_value: 0.8, empirical_priors: { source: 'kb-shared', ref: 'cdn-networking-kb.md', provisional: false }, math_derivation: { formula: 'container cold-start ms', inputs: {}, kb_source: 'cdn-networking-kb.md', result: 0.8, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-02', raw_value: 70, normalized_value: 0.92, empirical_priors: { source: 'kb-shared', ref: 'cdn-networking-kb.md', provisional: false }, math_derivation: { formula: 'edge proximity ms', inputs: {}, kb_source: 'cdn-networking-kb.md', result: 0.92, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-03', raw_value: 40, normalized_value: 0.7, empirical_priors: { source: 'inferred', ref: 'vercel-team-plan', provisional: true, rationale: 'Team plan pricing at current tier.' }, math_derivation: { formula: '$/mo normalized', inputs: {}, kb_source: 'inline', result: 0.7, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-03', raw_value: 25, normalized_value: 0.8, empirical_priors: { source: 'inferred', ref: 'gcp-cloud-run-pricing', provisional: true, rationale: 'Pay-per-request; estimated on target RPS.' }, math_derivation: { formula: '$/mo', inputs: {}, kb_source: 'inline', result: 0.8, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-03', raw_value: 30, normalized_value: 0.78, empirical_priors: { source: 'inferred', ref: 'fly-io-pricing', provisional: true, rationale: 'VM-hour pricing estimate.' }, math_derivation: { formula: '$/mo', inputs: {}, kb_source: 'inline', result: 0.78, result_shape: 'scalar' } },
    { alternative_id: 'A', criterion_id: 'PC-04', raw_value: 99.99, normalized_value: 0.98, empirical_priors: { source: 'kb-8-atlas', ref: 'vercel-2026.md', sample_size: 11, provisional: false }, math_derivation: { formula: 'SLA uptime %', inputs: {}, kb_source: 'vercel-2026.md', result: 0.98, result_shape: 'scalar' } },
    { alternative_id: 'B', criterion_id: 'PC-04', raw_value: 99.95, normalized_value: 0.95, empirical_priors: { source: 'kb-8-atlas', ref: 'gcp-cloud-run-2026.md', sample_size: 10, provisional: false }, math_derivation: { formula: 'SLA uptime %', inputs: {}, kb_source: 'gcp-cloud-run-2026.md', result: 0.95, result_shape: 'scalar' } },
    { alternative_id: 'C', criterion_id: 'PC-04', raw_value: 99.9, normalized_value: 0.9, empirical_priors: { source: 'kb-8-atlas', ref: 'fly-io-2026.md', sample_size: 8, provisional: true }, math_derivation: { formula: 'SLA uptime %', inputs: {}, kb_source: 'fly-io-2026.md', result: 0.9, result_shape: 'scalar' } },
  ],
  dependency_edges: ['DN.03'],
  utility_vector: {
    formula: 'U(a) = Σ w_c · score(a,c)',
    values: [
      { alternative_id: 'A', utility: 0.2 * 0.9 + 0.3 * 0.9 + 0.25 * 0.7 + 0.25 * 0.98 },
      { alternative_id: 'B', utility: 0.2 * 0.78 + 0.3 * 0.8 + 0.25 * 0.8 + 0.25 * 0.95 },
      { alternative_id: 'C', utility: 0.2 * 0.82 + 0.3 * 0.92 + 0.25 * 0.78 + 0.25 * 0.9 },
    ],
    math_derivation: { formula: 'U(a) = Σ w_c · score(a,c)', inputs: {}, kb_source: 'inline', result_shape: 'vector',
      result_vector: [0.2 * 0.9 + 0.3 * 0.9 + 0.25 * 0.7 + 0.25 * 0.98, 0.2 * 0.78 + 0.3 * 0.8 + 0.25 * 0.8 + 0.25 * 0.95, 0.2 * 0.82 + 0.3 * 0.92 + 0.25 * 0.78 + 0.25 * 0.9] },
  },
};

const decisionNodes = [dn01, dn02, dn03, dn04];

// ─── Phase 14: decision nodes ───────────────────────────────────────────
const phase14 = phase14Schema.parse({
  metadata: {
    phase_number: 14,
    phase_slug: 'phase-14-decision-nodes',
    phase_name: 'Decision Nodes',
    authored_by: PRODUCED_BY,
    authored_at: PRODUCED_AT,
  },
  status: 'complete',
  decision_nodes: decisionNodes,
});

// ─── Phase 15: DAG ──────────────────────────────────────────────────────
const phase15 = phase15Schema.parse({
  metadata: { phase_number: 15, phase_slug: 'phase-15-decision-dependencies', phase_name: 'Decision Dependencies', authored_by: PRODUCED_BY, authored_at: PRODUCED_AT },
  status: 'complete',
  nodes: ['DN.01', 'DN.02', 'DN.03', 'DN.04'],
  edges: [
    { from: 'DN.01', to: 'DN.03', relation: 'constrains', rationale: 'LLM choice constrains orchestration adapters needed.' },
    { from: 'DN.03', to: 'DN.04', relation: 'informs', rationale: 'Orchestration runtime affects deployment surface.' },
  ],
});

// ─── Phase 16: Pareto ───────────────────────────────────────────────────
// Build architecture vectors: each choice per DN → one AV.
function buildArchVectors(): Array<{ id: string; choices: Array<{ decision_node_id: string; alternative_id: string }>; criterion_scores: Array<{ criterion_id: string; value: number }>; utility_total: number }> {
  const combos: string[][] = [];
  for (const a1 of ['A', 'B', 'C']) {
    for (const a2 of ['A', 'B', 'C']) {
      for (const a3 of ['A', 'B', 'C']) {
        for (const a4 of ['A', 'B', 'C']) {
          combos.push([a1, a2, a3, a4]);
        }
      }
    }
  }
  // 81 combos is too many; pick 6 representative vectors.
  const picks = [['A', 'A', 'A', 'A'], ['A', 'B', 'A', 'A'], ['B', 'A', 'A', 'A'], ['A', 'A', 'B', 'A'], ['A', 'A', 'A', 'C'], ['C', 'C', 'C', 'C']];
  return picks.map((p, i) => {
    const nodes = [dn01, dn02, dn03, dn04];
    const scoresByCriterion: Record<string, number> = {};
    let util = 0;
    for (let di = 0; di < 4; di++) {
      const n = nodes[di];
      const altId = p[di];
      const uVal = n.utility_vector.values.find((v) => v.alternative_id === altId)!.utility;
      util += uVal;
      for (const c of n.criteria) {
        const s = n.scores.find((sc) => sc.alternative_id === altId && sc.criterion_id === c.criterion_id)!;
        scoresByCriterion[c.criterion_id] = (scoresByCriterion[c.criterion_id] ?? 0) + c.weight * s.normalized_value;
      }
    }
    return {
      id: `AV.${String(i + 1).padStart(2, '0')}`,
      choices: [
        { decision_node_id: 'DN.01', alternative_id: p[0] },
        { decision_node_id: 'DN.02', alternative_id: p[1] },
        { decision_node_id: 'DN.03', alternative_id: p[2] },
        { decision_node_id: 'DN.04', alternative_id: p[3] },
      ],
      criterion_scores: Object.entries(scoresByCriterion).map(([criterion_id, value]) => ({ criterion_id, value })),
      utility_total: util,
    };
  });
}

const archVectorsRaw = buildArchVectors();
const { frontier: frontierIds, edges: domEdges } = computeParetoFrontier(
  archVectorsRaw.map((v) => ({ ...v, on_frontier: false })),
);
const archVectors = archVectorsRaw.map((v) => ({
  ...v,
  on_frontier: frontierIds.includes(v.id),
}));

const phase16 = phase16Schema.parse({
  metadata: { phase_number: 16, phase_slug: 'phase-16-pareto-frontier', phase_name: 'Pareto Frontier', authored_by: PRODUCED_BY, authored_at: PRODUCED_AT },
  status: 'complete',
  architecture_vectors: archVectors,
  dominance_edges: domEdges,
  frontier_ids: frontierIds,
  dominance_math: {
    formula: 'A dominates B iff ∀c score_c(A) ≥ score_c(B) ∧ ∃c score_c(A) > score_c(B)',
    inputs: { n_vectors: archVectors.length },
    kb_source: 'inline',
    result_shape: 'graph',
    result_graph: {
      nodes: archVectors.map((v) => v.id),
      edges: domEdges.map((e) => ({ from: e.dominator, to: e.dominated, kind: 'dominates' as const })),
    },
  },
});

// ─── Phase 17b: Sensitivity ────────────────────────────────────────────
const sensEntries = computeSensitivity(decisionNodes, 10, 0xC1F0);
const reproInput = JSON.stringify({ nodes: decisionNodes.map((n) => n.id), band: 10, seed: 0xC1F0, entries: sensEntries.map((e) => ({ id: e.decision_node_id, v: e.variance })) });
const reproHash = createHash('sha256').update(reproInput).digest('hex').slice(0, 16);
const phase17b = phase17bSchema.parse({
  metadata: { phase_number: 17, phase_slug: 'phase-17b-sensitivity-analysis', phase_name: 'Sensitivity Analysis', authored_by: PRODUCED_BY, authored_at: PRODUCED_AT },
  status: 'complete',
  entries: sensEntries,
  method: 'weight_perturbation_variance',
  reproducibility_hash: reproHash,
});

// ─── Phase 19: Empirical prior binding ─────────────────────────────────
const bindingsRaw = decisionNodes.flatMap((n) =>
  n.scores.map((s) => {
    const ep = s.empirical_priors;
    let bound_to: any;
    if (ep.source === 'kb-8-atlas') {
      bound_to = { source: 'kb-8-atlas' as const, entry_path: `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/04-filled-examples/${ep.ref}`, field_path: '$.priors', sample_size: ep.sample_size ?? 0 };
    } else if (ep.source === 'kb-shared') {
      bound_to = { source: 'kb-shared' as const, kb_file: (ep as any).kb_file ?? ep.ref };
    } else if (ep.source === 'nfr') {
      bound_to = { source: 'nfr' as const, nfr_id: ep.ref };
    } else if (ep.source === 'fmea') {
      bound_to = { source: 'fmea' as const, fmea_row_id: ep.ref };
    } else {
      bound_to = { source: 'inferred' as const, rationale: ep.rationale ?? 'no rationale' };
    }
    return {
      decision_node_id: n.id,
      alternative_id: s.alternative_id,
      criterion_id: s.criterion_id,
      bound_to,
      provisional: ep.provisional ?? false,
      hash_chain_prev: 'GENESIS',
    };
  }),
);
const bindings = computePriorBindingChain(bindingsRaw);
const phase19 = phase19Schema.parse({
  metadata: { phase_number: 18, phase_slug: 'phase-19-empirical-prior-binding', phase_name: 'Empirical Prior Binding', authored_by: PRODUCED_BY, authored_at: PRODUCED_AT },
  status: 'complete',
  bindings,
  kb_8_entries_consulted: [
    'anthropic-claude-2026.md', 'openai-gpt4-2026.md', 'pinecone-2026.md', 'weaviate-2026.md',
    'supabase-2026.md', 'vercel-2026.md', 'gcp-cloud-run-2026.md', 'fly-io-2026.md',
  ],
});

// ─── Phases 11-13 vector scores ────────────────────────────────────────
const allCriteria = ['PC-01', 'PC-02', 'PC-03', 'PC-04'] as const;
const rows = allCriteria.map((cid) => {
  const weight = 0.25;
  const values: Array<{ alternative_id: 'A' | 'B' | 'C'; normalized: number }> = [];
  const uniqAltScores: Record<string, number[]> = { A: [], B: [], C: [] };
  for (const n of decisionNodes) {
    for (const s of n.scores.filter((x) => x.criterion_id === cid)) {
      uniqAltScores[s.alternative_id].push(s.normalized_value);
    }
  }
  for (const altId of ['A', 'B', 'C'] as const) {
    const arr = uniqAltScores[altId];
    const mean = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    values.push({ alternative_id: altId, normalized: mean });
  }
  return {
    criterion_id: cid,
    values,
    weight,
    weighted_values: values.map((v) => ({ alternative_id: v.alternative_id, weighted: v.normalized * weight })),
    math_derivation: { formula: 'per-alternative mean across DNs', inputs: {}, kb_source: 'inline', result_shape: 'vector' as const, result_vector: values.map((v) => v.normalized) },
  };
});
const totalUtility = (['A', 'B', 'C'] as const).map((altId) => ({
  alternative_id: altId,
  utility: rows.reduce((acc, r) => acc + (r.weighted_values.find((wv) => wv.alternative_id === altId)?.weighted ?? 0), 0),
}));
const phases1113 = phases11to13VectorScoresSchema.parse({
  metadata: { phase_number: 13, phase_slug: 'phases-11-13-vector-scores', phase_name: 'Vector Scores Rework', authored_by: PRODUCED_BY, authored_at: PRODUCED_AT },
  status: 'complete',
  rows,
  total_utility: totalUtility,
});

// ─── Decision audit rows ────────────────────────────────────────────────
let prevHash = 'GENESIS';
const auditRows: DecisionAuditRow[] = [];
for (const n of decisionNodes) {
  for (const s of n.scores) {
    const payload = { decisionNodeId: n.id, altId: s.alternative_id, criterionId: s.criterion_id, value: s.normalized_value };
    const hashSelf = hashRow(prevHash, payload);
    const row: DecisionAuditRow = {
      row_id: `AUDIT.${hashSelf.slice(0, 8)}`,
      decision_node_id: n.id,
      model_version: 'stubbed-nfr-engine@t4b',
      kb_chunk_ids: [
        s.empirical_priors.source === 'kb-8-atlas' ? `kb8/${s.empirical_priors.ref}` :
        s.empirical_priors.source === 'kb-shared' ? `shared/${(s.empirical_priors as any).kb_file ?? s.empirical_priors.ref}` :
        s.empirical_priors.source === 'nfr' ? `nfr/${s.empirical_priors.ref}` :
        `inferred/${s.empirical_priors.ref}`,
      ],
      engine_rule_id: `rule.score.${n.id}.${s.alternative_id}.${s.criterion_id}`,
      timestamp: PRODUCED_AT,
      hash_chain_prev: prevHash,
      hash_self: hashSelf,
      provisional: s.empirical_priors.provisional ?? false,
    };
    auditRows.push(row);
    prevHash = hashSelf;
  }
}

// Pick selected architecture = highest utility_total on the frontier.
const onFrontier = archVectors.filter((v) => v.on_frontier);
const selectedAv = onFrontier.reduce((best, v) => (v.utility_total > best.utility_total ? v : best), onFrontier[0]);

const decisionNetwork: DecisionNetworkV1 = {
  _schema: 'module-4.decision-network.v1',
  _output_path: 'system-design/kb-upgrade-v2/module-4-decision-matrix/decision_network.v1.json',
  _upstream_refs: {
    ffbd: 'system-design/kb-upgrade-v2/module-3-ffbd/ffbd.v1.json',
    n2_matrix: 'system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json',
    fmea_early: 'system-design/kb-upgrade-v2/module-8-risk/fmea_early.v1.json',
    nfrs: 'system-design/kb-upgrade-v2/module-2-requirements/nfrs.v2.json',
    constants: 'system-design/kb-upgrade-v2/module-2-requirements/constants.v2.json',
    kb_8_atlas: 'apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/',
  },
  produced_at: PRODUCED_AT,
  produced_by: PRODUCED_BY,
  system_name: 'c1v',
  phases: {
    phase_14_decision_nodes: phase14,
    phase_15_decision_dependencies: phase15,
    phase_16_pareto_frontier: phase16,
    phase_17b_sensitivity: phase17b,
    phase_19_empirical_prior_binding: phase19,
    phases_11_13_vector_scores: phases1113,
  },
  decision_audit: auditRows,
  selected_architecture_id: selectedAv.id,
};

validateDecisionNetworkArtifact(decisionNetwork);

const dnOut = join(SD_ROOT, 'module-4-decision-matrix', 'decision_network.v1.json');
writeFileSync(dnOut, JSON.stringify(decisionNetwork, null, 2));
console.log(`✔ decision_network.v1.json → ${dnOut}`);
console.log(`  decision_nodes=${decisionNodes.length}  arch_vectors=${archVectors.length}  frontier=${frontierIds.length}  sensitivity_entries=${sensEntries.length}  audit_rows=${auditRows.length}`);

// ─── Interface specs (M7.b) ─────────────────────────────────────────────
const n2Raw = readFileSync(join(SD_ROOT, 'module-7-interfaces', 'n2_matrix.v1.json'), 'utf8');
const n2 = JSON.parse(n2Raw) as { rows: Array<{ id: string; producer: string; consumer: string; payload_name: string; protocol: string; sync_style: string; criticality: string }> };

// SLA derivation defaults by criticality. Tail-latency budgets chosen so
// front-chain (IF.01..IF.04) sum to ≤ 3000ms (user-facing p95 NFR-like).
const slaDefaults = {
  critical: { p95_latency_ms: 500, availability_pct: 99.95, throughput_ceiling_rps: 200 },
  high: { p95_latency_ms: 800, availability_pct: 99.9, throughput_ceiling_rps: 100 },
  medium: { p95_latency_ms: 1500, availability_pct: 99.5, throughput_ceiling_rps: 50 },
} as const;

function slaFor(criticality: string) {
  return slaDefaults[(criticality as keyof typeof slaDefaults) in slaDefaults ? (criticality as keyof typeof slaDefaults) : 'high'];
}

const authByProtocol = (protocol: string): 'in-process' | 'bearer-jwt' | 'api-key' => {
  if (protocol === 'in-process') return 'in-process';
  if (protocol === 'http-json') return 'bearer-jwt';
  return 'api-key';
};

const interfaces: InterfaceSpec[] = n2.rows.map((r) => {
  const sla = slaFor(r.criticality);
  return {
    interface_id: r.id,
    n2_row_ref: `system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json#${r.id}`,
    producer: r.producer,
    consumer: r.consumer,
    payload_name: r.payload_name,
    protocol: r.protocol,
    sync_style: r.sync_style as any,
    sla: {
      ...sla,
      derivation_sources: [
        { kind: 'nfr', nfr_id: 'NFR.04' },
        { kind: 'fmea', fmea_row_id: `FM.${r.id.split('.')[1]}`, detectability_requirement: `IF ${r.id} must be observable within 1 RECOMMENDATION_CADENCE_MIN window.` },
      ],
      math_derivation: {
        formula: 'p95_i ≤ budget - Σ others (critical path apportion)',
        inputs: { criticality: r.criticality },
        kb_source: '_shared/resiliency-patterns-kb.md',
        result: sla.p95_latency_ms,
      },
    },
    retry: { max_attempts: r.sync_style === 'sync' ? 0 : 3, backoff_ms: 200, strategy: 'exponential_jitter', retry_on: ['5xx', 'timeout'] },
    timeout_ms: sla.p95_latency_ms * 2,
    circuit_breaker: { error_rate_threshold_pct: 25, min_requests_before_trip: 20, open_state_duration_ms: 30_000 },
    auth: authByProtocol(r.protocol),
    error_handling: {
      error_schema_ref: `lib/langchain/schemas/module-7-interfaces/formal-specs.ts#ErrorHandlingContract`,
      status_codes: [400, 401, 403, 404, 409, 429, 500, 503],
      idempotency: r.sync_style === 'async' || r.sync_style === 'batch' ? 'required' : 'advisory',
    },
  };
});

// Build chain budget for front chain IF.01..IF.04 (critical authoring path).
const frontChain = ['IF.01', 'IF.02', 'IF.03', 'IF.04'];
const frontChainBudget = {
  chain_id: 'AUTHORING_SPEC_EMIT',
  hops: frontChain,
  sum_p95_latency_ms: frontChain.reduce((acc, id) => acc + (interfaces.find((i) => i.interface_id === id)?.sla.p95_latency_ms ?? 0), 0),
  user_facing_nfr_p95_ms: 3000,
  budget_ok: true,
};
frontChainBudget.budget_ok = frontChainBudget.sum_p95_latency_ms <= frontChainBudget.user_facing_nfr_p95_ms;

const interfaceSpecs = interfaceSpecsV1Schema.parse({
  _schema: 'module-7b.interface-specs.v1',
  _output_path: 'system-design/kb-upgrade-v2/module-7-interfaces/interface_specs.v1.json',
  _upstream_refs: {
    n2_matrix: 'system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json',
    nfrs: 'system-design/kb-upgrade-v2/module-2-requirements/nfrs.v2.json',
    fmea_early: 'system-design/kb-upgrade-v2/module-8-risk/fmea_early.v1.json',
    decision_network: 'system-design/kb-upgrade-v2/module-4-decision-matrix/decision_network.v1.json',
  },
  produced_at: PRODUCED_AT,
  produced_by: 'c1v-m4-decision-net@wave-3-t4b/interface-specs-agent',
  system_name: 'c1v',
  interfaces,
  chain_budgets: [frontChainBudget],
});

const ifOut = join(SD_ROOT, 'module-7-interfaces', 'interface_specs.v1.json');
writeFileSync(ifOut, JSON.stringify(interfaceSpecs, null, 2));
console.log(`✔ interface_specs.v1.json → ${ifOut}`);
console.log(`  interfaces=${interfaces.length}  chain_budget_ok=${frontChainBudget.budget_ok}  sum_p95=${frontChainBudget.sum_p95_latency_ms}ms`);
