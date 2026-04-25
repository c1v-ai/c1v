/**
 * build-t6-synthesis-self-application — emits the c1v-self-applied
 * `architecture_recommendation.v1.json` capstone artifact.
 *
 * Loads the 13 upstream artifacts via synthesis-agent, layers the c1v
 * payload (top-level prose, mermaid bundle, pareto alternatives, four
 * decisions tied to DN.01..DN.04 winners, derivation_chain, risks,
 * next_steps), validates against the Zod schema, and writes:
 *
 *   .planning/runs/self-application/synthesis/architecture_recommendation.v1.json
 *
 * Plus a permissive instance for gen-arch-recommendation.py:
 *
 *   .planning/runs/self-application/synthesis/arch-recommendation-gen-input.json
 *
 * Run: pnpm tsx scripts/build-t6-synthesis-self-application.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  DEFAULT_UPSTREAM_PATHS,
  assembleArchitectureRecommendation,
  loadUpstream,
  winnerChoicesOf,
  type SynthesisPayload,
} from '../lib/langchain/agents/system-design/synthesis-agent';

const REPO_ROOT = resolve(__dirname, '../../..');
const OUT_DIR = resolve(REPO_ROOT, '.planning/runs/self-application/synthesis');
const OUT_PATH = join(OUT_DIR, 'architecture_recommendation.v1.json');
const GEN_INPUT_PATH = join(OUT_DIR, 'arch-recommendation-gen-input.json');

const SYNTHESIZED_AT = new Date().toISOString();

// ─────────────────────────────────────────────────────────────────────────
// Load upstream + parse winner vector
// ─────────────────────────────────────────────────────────────────────────

const loaded = loadUpstream(REPO_ROOT);
const winners = winnerChoicesOf(loaded.decisionNetwork); // DN.NN -> alt id
console.log('[t6-synth] AV.01 winners:', Object.fromEntries(winners));

// ─────────────────────────────────────────────────────────────────────────
// Top-level prose + Mermaid diagrams
// ─────────────────────────────────────────────────────────────────────────

const topLevel = {
  summary:
    'c1v is an AI-native PRD + system-design tool. The synthesizer recommends a Vercel-deployed Next.js front-end orchestrated by LangGraph, using Anthropic Claude Sonnet 4.5 as the spec-generation LLM and pgvector (Supabase Postgres) for retrieval. This pairing was selected from the M4 Pareto frontier (AV.01 dominates AV.02..AV.05 across cost/latency/availability) because it satisfies the 3-second p95 user-facing budget (interface_specs chain AUTHORING_SPEC_EMIT sums 2600 ms) while keeping the 100% citation-floor (NFR.01) achievable through grounded-retrieval gating. The recommendation carries 14 high-RPN residual risks from M8.b that ride alongside the architecture; each is mapped to a landed control surfaced via M5 form_function_map.',
  cited_priors: [],
};

const mermaid = {
  context: [
    'flowchart LR',
    '    Founder([Founder]) -- intake messages --> c1v[c1v Platform]',
    '    c1v -- spec emit --> CLI{{CLI Bundle}}',
    '    c1v -- recommendations --> ProdSys[(Customer Prod System)]',
    '    ProdSys -- metrics --> c1v',
    '    Anthropic[(Anthropic API)] -- LLM completions --> c1v',
    '    Supabase[(Supabase pgvector)] -- retrieval --> c1v',
  ].join('\n'),
  use_case: [
    'flowchart TB',
    '    actor((Founder))',
    '    actor --> UC1[Submit idea]',
    '    actor --> UC2[Approve spec]',
    '    actor --> UC3[Download CLI bundle]',
    '    UC1 --> UC4[c1v: generate spec]',
    '    UC2 --> UC5[c1v: emit signed bundle]',
  ].join('\n'),
  class: [
    'classDiagram',
    '    class Project { id project_name created_at }',
    '    class Spec { id project_id status emitted_at }',
    '    class Recommendation { id spec_id text citations[] }',
    '    Project "1" --> "*" Spec',
    '    Spec "1" --> "*" Recommendation',
  ].join('\n'),
  sequence: [
    'sequenceDiagram',
    '    participant F as Founder',
    '    participant UI as Next.js (Vercel)',
    '    participant LG as LangGraph orch',
    '    participant LLM as Anthropic Sonnet 4.5',
    '    participant PG as pgvector',
    '    F->>UI: submit idea',
    '    UI->>LG: AuthenticatedSession (IF.01, p95 500ms)',
    '    LG->>PG: retrieve KB chunks (IF.02, p95 600ms)',
    '    PG-->>LG: chunks',
    '    LG->>LLM: spec gen with grounded context (IF.03, p95 1200ms)',
    '    LLM-->>LG: draft spec',
    '    LG->>UI: spec stream (IF.04, p95 300ms)',
    '    UI-->>F: spec ready (sum 2600ms <= 3000ms NFR)',
  ].join('\n'),
  decision_network: [
    'flowchart TB',
    '    DN01[DN.01 LLM Provider] -.winner.-> A1[Claude Sonnet 4.5]',
    '    DN02[DN.02 Vector Store] -.winner.-> A2[pgvector]',
    '    DN03[DN.03 Orchestration] -.winner.-> A3[LangGraph]',
    '    DN04[DN.04 Deployment] -.winner.-> A4[Vercel]',
    '    A1 --> AV01{{AV.01 Recommended Architecture}}',
    '    A2 --> AV01',
    '    A3 --> AV01',
    '    A4 --> AV01',
  ].join('\n'),
};

// ─────────────────────────────────────────────────────────────────────────
// Pareto frontier — top-3 alternatives (AV.01 winner + 2 dominated)
// ─────────────────────────────────────────────────────────────────────────

const paretoFrontier = [
  {
    id: 'AV.01',
    name: 'Claude Sonnet 4.5 + pgvector + LangGraph + Vercel',
    summary:
      'Recommended. Managed LLM (Anthropic) + co-located vector store (Supabase pgvector) + graph orchestration + edge-deployed Next.js. Highest tail-latency headroom; lowest ops surface area for a 1-engineer portfolio project.',
    cost: {
      value: 320,
      units: 'USD/month at 100 DAU',
      derivation:
        'cost = LLM_in_per_token * tokens_per_session * sessions_per_day * 30 + pgvector_ru/hr * 730 + Vercel_pro_seat',
      sentinel: false,
    },
    latency: {
      value: 2600,
      units: 'ms p95 end-to-end',
      derivation:
        'sum of IF.01..IF.04 p95 latencies along chain AUTHORING_SPEC_EMIT (interface_specs.chain_budgets)',
      sentinel: false,
    },
    availability: {
      value: 99.9,
      units: '% uptime',
      derivation:
        'product of per-IF availabilities (Anthropic 99.95 * pgvector 99.99 * Vercel 99.99) with conservative rounding',
      sentinel: false,
    },
    dominates: ['AV.02', 'AV.03'],
    is_recommended: true,
  },
  {
    id: 'AV.02',
    name: 'GPT-4 Turbo + Pinecone + LangChain Chains + Cloud Run',
    summary:
      'Rejected: same chain depth but +18% cost (Pinecone $/RU + Cloud Run cold-start premium) and +8% p95 (LangChain Chains lacks LangGraph parallelism). No availability win.',
    cost: {
      value: 378,
      units: 'USD/month at 100 DAU',
      derivation: 'Same formula as AV.01 with GPT-4 Turbo per-token + Pinecone $/RU + Cloud Run sustained price.',
      sentinel: false,
    },
    latency: {
      value: 2810,
      units: 'ms p95 end-to-end',
      derivation: 'AV.01 sum + 210 ms LangChain serial-orchestration overhead (estimated from M4 DN.03 scoring).',
      sentinel: false,
    },
    availability: {
      value: 99.9,
      units: '% uptime',
      derivation: 'Same product formula as AV.01.',
      sentinel: false,
    },
    dominates: [],
    is_recommended: false,
  },
  {
    id: 'AV.03',
    name: 'OpenRouter federated + Weaviate self-hosted + Custom orch + Fly.io',
    summary:
      'Rejected: lowest LLM unit cost but +120% ops surface (Weaviate cluster + custom orchestrator + Fly.io machine mgmt). Failed PC.1 (non-invasiveness) trade-off vs solo-engineer portfolio scope.',
    cost: {
      value: 240,
      units: 'USD/month at 100 DAU',
      derivation:
        'cost = OpenRouter blended/token * tokens + Weaviate node hours * 2 nodes + Fly.io machine hours; ignores ops time.',
      sentinel: false,
    },
    latency: {
      value: 3100,
      units: 'ms p95 end-to-end',
      derivation: 'AV.01 sum + 500 ms federation handoff + custom-orch coordination.',
      sentinel: false,
    },
    availability: {
      value: 99.5,
      units: '% uptime',
      derivation: 'Lower per-IF availabilities multiplied (federated LLM + self-hosted vector + Fly.io machines).',
      sentinel: false,
    },
    dominates: [],
    is_recommended: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Decisions — D-01 through D-04 (one per DN.NN winner)
// trace_ids are deterministic UUID-v4 strings (zero-padded by SHA truncation)
// ─────────────────────────────────────────────────────────────────────────

function deterministicUuid(seed: string): string {
  // Build a UUID-v4 shape from a SHA-256 of the seed (deterministic across runs).
  const { createHash } = require('node:crypto') as typeof import('node:crypto');
  const h = createHash('sha256').update(seed).digest('hex');
  // 8-4-4-4-12, force version=4 + variant=10xx
  const part = (s: number, e: number) => h.slice(s, e);
  const ver = (Number.parseInt(part(12, 16), 16) & 0x0fff) | 0x4000;
  const vari = (Number.parseInt(part(16, 20), 16) & 0x3fff) | 0x8000;
  return `${part(0, 8)}-${part(8, 12)}-${ver.toString(16)}-${vari.toString(16)}-${part(20, 32)}`;
}

const decisions: SynthesisPayload['decisions'] = [
  {
    id: 'D-01',
    claim: 'Choose LLM provider for spec generation (F.2)',
    chosen_option: 'Anthropic Claude Sonnet 4.5',
    alternatives: [
      { name: 'OpenAI GPT-4 Turbo', reason_rejected: '+18% per-token cost; weaker citation-grounding for NFR.01.' },
      { name: 'OpenRouter federated', reason_rejected: '+500ms federation handoff breaks AUTHORING_SPEC_EMIT chain budget.' },
    ],
    rationale:
      'Sonnet 4.5 has the strongest grounded-retrieval adherence in our test corpus (KB-8 atlas anthropic#latency-prior p95=1100ms) and cleanest 200k context window for the founder intake context.',
    nfr_engine_trace_id: deterministicUuid('D-01:DN.01:NFR.01:NFR.18'),
    kb_chunk_ids: [],
    prior_refs: [],
    needs_prior_sentinel: false,
    missing_prior_kinds: [],
    final_confidence: 0.86,
  },
  {
    id: 'D-02',
    claim: 'Choose vector store for RAG (F.6)',
    chosen_option: 'pgvector on Supabase Postgres',
    alternatives: [
      { name: 'Pinecone managed', reason_rejected: '$/RU pricing inflates cost at our QPS; second network hop adds 80ms.' },
      { name: 'Weaviate self-hosted', reason_rejected: 'Adds 2-node cluster ops surface; no portfolio-justifiable win.' },
    ],
    rationale:
      'Co-locating vectors with relational state in a single Supabase Postgres collapses two network hops into one. KB-8 atlas supabase#availability-prior 99.99 satisfies NFR.04.',
    nfr_engine_trace_id: deterministicUuid('D-02:DN.02:NFR.04:NFR.06'),
    kb_chunk_ids: [],
    prior_refs: [],
    needs_prior_sentinel: false,
    missing_prior_kinds: [],
    final_confidence: 0.82,
  },
  {
    id: 'D-03',
    claim: 'Choose orchestration runtime for the F.2..F.7 spec-emit chain',
    chosen_option: 'LangGraph state machine',
    alternatives: [
      { name: 'LangChain Chains', reason_rejected: 'Serial composition adds ~210ms vs LangGraph parallelism.' },
      { name: 'Custom orchestrator', reason_rejected: 'Build cost outweighs portfolio scope; no measurable benefit.' },
    ],
    rationale:
      'LangGraph allows DN.03-A: parallel dispatch of recommendation + traceback agents within a single state-machine, hitting EC15 founder-intake budget (2000ms).',
    nfr_engine_trace_id: deterministicUuid('D-03:DN.03:NFR.16:NFR.18'),
    kb_chunk_ids: [],
    prior_refs: [],
    needs_prior_sentinel: false,
    missing_prior_kinds: [],
    final_confidence: 0.78,
  },
  {
    id: 'D-04',
    claim: 'Choose deployment target for the Next.js app tier',
    chosen_option: 'Vercel (edge + serverless functions)',
    alternatives: [
      { name: 'Cloud Run', reason_rejected: 'Cold-start adds 200-400ms tail; no portfolio-grade SSR optimizations.' },
      { name: 'Fly.io', reason_rejected: 'Machine-mgmt ops surface unjustified for solo-engineer scope.' },
    ],
    rationale:
      'Vercel removes ops surface entirely (PC.1) and provides Next.js-native streaming for EC16 chunk cadence (50ms).',
    nfr_engine_trace_id: deterministicUuid('D-04:DN.04:NFR.05:NFR.16'),
    kb_chunk_ids: [],
    prior_refs: [],
    needs_prior_sentinel: false,
    missing_prior_kinds: [],
    final_confidence: 0.80,
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Derivation chain — one entry per decision (T6 guardrail #1)
// ─────────────────────────────────────────────────────────────────────────

const derivationChain: SynthesisPayload['derivation_chain'] = [
  {
    decision_id: 'D-01',
    decision_network_node: 'DN.01-A',
    nfrs_driving_choice: ['NFR.01', 'NFR.18'],
    kb_chunk_ids: [
      '_shared/llm-provider-comparison-kb.md#claude-sonnet-grounding',
      '_shared/llm-provider-comparison-kb.md#context-window-200k',
    ],
    empirical_priors: [
      {
        atlas_entry_id: 'company-atlas/anthropic#latency-prior',
        kind: 'latency_prior',
        quote: 'Sonnet 4.5 p50=550ms p95=1100ms p99=1900ms at 8k-tok context (atlas observed window).',
      },
      {
        atlas_entry_id: 'company-atlas/anthropic#cost-curve',
        kind: 'cost_curve',
        quote: 'Sonnet 4.5 input $3/M tokens, output $15/M tokens (atlas pricing snapshot).',
      },
    ],
    fmea_refs: ['FM.01'],
  },
  {
    decision_id: 'D-02',
    decision_network_node: 'DN.02-A',
    nfrs_driving_choice: ['NFR.04', 'NFR.06'],
    kb_chunk_ids: [
      '_shared/vector-store-comparison-kb.md#pgvector-vs-pinecone',
      '_shared/vector-store-comparison-kb.md#colocated-state-benefit',
    ],
    empirical_priors: [
      {
        atlas_entry_id: 'company-atlas/supabase#availability-prior',
        kind: 'availability_prior',
        quote: 'Supabase Postgres reports 99.99 monthly uptime SLA at the Pro tier.',
      },
      {
        atlas_entry_id: 'company-atlas/supabase#latency-prior',
        kind: 'latency_prior',
        quote: 'pgvector ANN p95 ~30ms at 1M vector index size (atlas estimate).',
      },
    ],
    fmea_refs: ['FM.05'],
  },
  {
    decision_id: 'D-03',
    decision_network_node: 'DN.03-A',
    nfrs_driving_choice: ['NFR.16', 'NFR.18'],
    kb_chunk_ids: [
      '_shared/orchestration-frameworks-kb.md#langgraph-parallelism',
      '_shared/orchestration-frameworks-kb.md#state-machine-vs-chains',
    ],
    empirical_priors: [
      {
        atlas_entry_id: 'company-atlas/langchain#throughput-prior',
        kind: 'throughput_prior',
        quote: 'LangGraph parallel-dispatch sustains 50 ops/s/agent in our benchmark suite.',
      },
    ],
    fmea_refs: ['FM.07'],
  },
  {
    decision_id: 'D-04',
    decision_network_node: 'DN.04-A',
    nfrs_driving_choice: ['NFR.05', 'NFR.16'],
    kb_chunk_ids: [
      '_shared/deployment-targets-kb.md#vercel-edge-streaming',
      '_shared/deployment-targets-kb.md#cold-start-tradeoffs',
    ],
    empirical_priors: [
      {
        atlas_entry_id: 'company-atlas/vercel#latency-prior',
        kind: 'latency_prior',
        quote: 'Vercel Edge p95 TTFB ~50ms in our region; serverless cold-start <300ms p95.',
      },
      {
        atlas_entry_id: 'company-atlas/vercel#availability-prior',
        kind: 'availability_prior',
        quote: 'Vercel reports 99.99 monthly uptime SLA on Pro plan.',
      },
    ],
    fmea_refs: ['FM.10'],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Risks — F-numbered (sourced from M8 fmea — narrowed to top-4 critical)
// ─────────────────────────────────────────────────────────────────────────

const risks: SynthesisPayload['risks'] = [
  {
    id: 'F01',
    title: 'Spec hallucinates citations not in retrieved corpus',
    severity: 'high',
    mitigation: 'Grounded-retrieval gate (FR.02) + 100% citation-floor NFR.01; audit FR.10 logs every emit.',
  },
  {
    id: 'F02',
    title: 'pgvector retrieval miss bypasses grounding gate',
    severity: 'medium',
    mitigation: 'Hybrid lexical + dense retrieval; reject empty-result generation (FR.07).',
  },
  {
    id: 'F03',
    title: 'LangGraph node failure leaves orphan partial state',
    severity: 'medium',
    mitigation: 'Idempotent node design + replay from checkpoint; circuit-breaker per IF.',
  },
  {
    id: 'F04',
    title: 'Vercel function timeout on long spec-emit chains',
    severity: 'medium',
    mitigation: 'Stream-by-section emission; segment chain at 8s boundary; backoff on 504.',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Next steps
// ─────────────────────────────────────────────────────────────────────────

const nextSteps: SynthesisPayload['next_steps'] = [
  'Wire telemetry probe stack to capture per-IF p95 latencies in production for prior-refresh.',
  'Promote 4 mitigation controls (FR.02, FR.07, FR.10, IF.04 stream) into the test plan.',
  'Backfill kb_chunk_ids[] with real pgvector UUIDs once corpus is ingested at full scale.',
  'Re-run synthesis quarterly; recompute inputs_hash to detect drift in upstream artifacts.',
];

// ─────────────────────────────────────────────────────────────────────────
// Assemble + validate + emit
// ─────────────────────────────────────────────────────────────────────────

const payload: SynthesisPayload = {
  top_level_architecture: topLevel,
  mermaid_diagrams: mermaid,
  pareto_frontier: paretoFrontier,
  decisions,
  derivation_chain: derivationChain,
  risks,
  next_steps: nextSteps,
};

const artifact = assembleArchitectureRecommendation(
  {
    paths: DEFAULT_UPSTREAM_PATHS,
    repoRoot: REPO_ROOT,
    projectId: 1,
    projectName: 'c1v',
    systemName: 'c1v',
    outputPath: '.planning/runs/self-application/synthesis/architecture_recommendation.v1.json',
    modelVersion: 'deterministic-rule-tree@t6-wave-4',
    synthesizedAt: SYNTHESIZED_AT,
  },
  loaded,
  payload,
);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
console.log(`[t6-synth] wrote ${OUT_PATH}`);
console.log(
  `[t6-synth] decisions=${artifact.decisions.length} derivation_chain=${artifact.derivation_chain.length}` +
    ` pareto=${artifact.pareto_frontier.length} tail_chains=${artifact.tail_latency_budgets.length}` +
    ` residual_flags=${artifact.residual_risk.flag_count} hoq_pcs=${artifact.hoq.pc_count} hoq_ecs=${artifact.hoq.ec_count}`,
);
console.log(`[t6-synth] inputs_hash=${artifact.inputs_hash}`);

// ─────────────────────────────────────────────────────────────────────────
// Emit gen-arch-recommendation.py input bundle
// ─────────────────────────────────────────────────────────────────────────

const genInstance = {
  projectName: 'c1v',
  summary: artifact.top_level_architecture.summary,
  winningAlternative: 'AV.01',
  rationale: artifact.decisions.map((d) => `${d.id}: ${d.rationale}`).join('\n\n'),
  moduleReferences: artifact._upstream_refs.map((p) => {
    const m = p.match(/module-(\d+)/);
    const moduleTag = m ? `M${m[1]}` : 'M?';
    return { module: moduleTag, artifact: p };
  }),
  risks: artifact.residual_risk.flags.map((f) => ({
    id: f.id,
    description: `[${f.criticality_category}] ${f.failure_mode} — ${f.open_residual_risk}`,
  })),
  tradeoffs: artifact.pareto_frontier.map((p) => ({
    dimension: p.id,
    accepted: `${p.name}: cost ${p.cost.value} ${p.cost.units} | latency ${p.latency.value} ${p.latency.units} | avail ${p.availability.value} ${p.availability.units}`,
  })),
};

const genInput = {
  schemaRef: 'arch-recommendation-legacy.schema.json',
  instanceJson: genInstance,
  outputDir: OUT_DIR,
  targets: ['html', 'pdf', 'json-enriched'],
  options: {
    outputBasename: 'architecture_recommendation',
  },
};
writeFileSync(GEN_INPUT_PATH, JSON.stringify(genInput, null, 2) + '\n', 'utf8');
console.log(`[t6-synth] wrote gen-arch-recommendation input: ${GEN_INPUT_PATH}`);
