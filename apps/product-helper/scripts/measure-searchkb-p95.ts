/**
 * measure-searchkb-p95 — bench `searchKB(...)` against ivfflat index.
 *
 * Brief: c1v v2.2 Wave E TE1 — engine-pgvector (EC-V21-E.6).
 *
 * EC-V21-E.6 latency target: p95 < 200ms. If ivfflat misses this on the
 * 7,670-row local corpus we ship the HNSW upgrade migration; if it hits
 * we document the skip decision.
 *
 * Methodology:
 *   - 50 production-shape queries (typical engine prompts about NFR
 *     extraction, FFBD decomposition, decision-network framing).
 *   - 5 warmup runs discarded (cold pgvector cache).
 *   - End-to-end latency = embedding RTT + pgvector cosine search +
 *     drizzle decode. Stub embedder when EMBEDDINGS_STUB=1 isolates
 *     the DB path from OpenAI network jitter.
 *
 * Usage:
 *   EMBEDDINGS_STUB=1 pnpm tsx scripts/measure-searchkb-p95.ts
 *
 * Output: prints {p50, p95, p99, max} in ms. Exit 0 always — caller
 * decides what to do with the numbers.
 */

import { searchKB } from '@/lib/langchain/engines/kb-search';

const QUERIES: string[] = [
  'How should non-functional requirements be quantified for performance?',
  'What latency target applies to user-facing SaaS endpoints?',
  'When does availability SLO drive infrastructure choice?',
  'How is throughput estimated for an LLM-backed service?',
  'What cost per request is acceptable at AV.01 architecture?',
  'How do I decompose a system function into sub-functions?',
  'What is a functional flow block diagram and when do I use it?',
  'How do I derive interface specs from FFBD blocks?',
  'What is the form-function map between physical and logical view?',
  'How does Crawley define a system goal versus a constraint?',
  'How are decision networks structured for tradespace exploration?',
  'What differentiates Pareto-optimal alternatives from dominated ones?',
  'When should I run a sensitivity analysis on a decision matrix?',
  'How is the House of Quality (HoQ) populated for an LLM product?',
  'What customer attributes belong in HoQ rows for a developer tool?',
  'How do engineering characteristics map to NFR targets?',
  'What is FMEA and when does it run in the methodology?',
  'How do I score severity, occurrence, detection for a failure mode?',
  'What is risk priority number (RPN) and what threshold flags it?',
  'How does residual FMEA differ from early FMEA?',
  'How do I model a context diagram for an external user?',
  'What is the boundary between system and environment in scope?',
  'When is a use case diagram appropriate?',
  'How do I model actors and goals for a developer-tooling SaaS?',
  'What is the Atlas approach to KB-9 stack priors?',
  'Which empirical priors apply to LLM platform availability?',
  'How is text-embedding-3-small typically deployed in production?',
  'What chunk size works best for technical documentation RAG?',
  'How do I measure retrieval relevance at scale?',
  'What is the trade-off between ivfflat and HNSW indexes?',
  'How does pgvector cosine distance compare to dot product?',
  'What is the canonical Drizzle schema pattern for vector columns?',
  'How do I structure an audit table for hash-chained tamper detection?',
  'When should RLS be tenant-scoped versus global-read?',
  'What pattern handles open questions surfaced from system reasoning?',
  'How does the chat bridge route system-emitted clarifications?',
  'What is the synthesis pipeline boundary between Vercel and Cloud Run?',
  'How are signed Supabase storage URLs cached per request?',
  'What is the contract for the artifacts manifest endpoint?',
  'How does drizzle-kit generate ivfflat indexes?',
  'What is the migration ordering between 0011a and 0011b?',
  'How do I roll back a Drizzle migration safely?',
  'What does the project_run_state table track?',
  'How is per-project artifact dedup keyed via inputs_hash?',
  'When should I use a feature flag for synthesis tier gating?',
  'How does credit deduction interact with synthesis kickoff?',
  'What is the LangGraph node ordering for the intake graph?',
  'How is a deterministic rule tree authored for an engine?',
  'What is the predicate DSL grammar for matching context conditions?',
  'How does the engine surface a fail-closed STOP-GAP signal to the user?',
];

interface Stats {
  p50: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
  mean: number;
  n: number;
}

function summarize(samples: number[]): Stats {
  const sorted = [...samples].sort((a, b) => a - b);
  const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return {
    n: sorted.length,
    min: sorted[0],
    p50: pick(0.5),
    p95: pick(0.95),
    p99: pick(0.99),
    max: sorted[sorted.length - 1],
    mean,
  };
}

async function main() {
  const useStub = process.env.EMBEDDINGS_STUB === '1';
  console.log(
    `[measure-searchkb-p95] embeddings: ${useStub ? 'STUB (deterministic)' : 'OpenAI text-embedding-3-small (live)'}`,
  );
  console.log(`[measure-searchkb-p95] queries: ${QUERIES.length}; warmup: 5; topK: 3`);

  // Warmup — first query primes pgvector + drizzle pool.
  for (let i = 0; i < 5; i++) {
    await searchKB(QUERIES[i % QUERIES.length], 3);
  }

  const samples: number[] = [];
  for (const q of QUERIES) {
    const t0 = process.hrtime.bigint();
    const rows = await searchKB(q, 3);
    const t1 = process.hrtime.bigint();
    const ms = Number(t1 - t0) / 1_000_000;
    samples.push(ms);
    if (rows.length === 0) {
      console.warn(
        `[measure-searchkb-p95] WARN: query "${q.slice(0, 40)}..." returned 0 hits`,
      );
    }
  }

  const s = summarize(samples);
  console.log('\n=== searchKB latency (end-to-end) ===');
  console.log(`  n      : ${s.n}`);
  console.log(`  min    : ${s.min.toFixed(1)} ms`);
  console.log(`  mean   : ${s.mean.toFixed(1)} ms`);
  console.log(`  p50    : ${s.p50.toFixed(1)} ms`);
  console.log(`  p95    : ${s.p95.toFixed(1)} ms`);
  console.log(`  p99    : ${s.p99.toFixed(1)} ms`);
  console.log(`  max    : ${s.max.toFixed(1)} ms`);
  console.log(`\nEC-V21-E.6 target: p95 < 200ms`);
  console.log(`  status: ${s.p95 < 200 ? 'PASS — skip HNSW upgrade' : 'FAIL — ship HNSW upgrade'}`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error('[measure-searchkb-p95] error:', err);
    process.exit(1);
  },
);
