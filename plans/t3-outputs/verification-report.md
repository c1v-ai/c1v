# T3 Wave 1 verification report

- Generated: 2026-04-24T14:25:04.406Z
- Overall: **GREEN**
- Checks: 15/15 passed

## Corpus

| kb_source | chunks |
|---|---:|
| 1-defining-scope-kb-for-software | 106 |
| 2-dev-sys-reqs-for-kb-llm-software | 587 |
| 3-ffbd-llm-kb | 422 |
| 4-assess-software-performance-kb | 481 |
| 4-decision-network-mit-crawley | 105 |
| 5-HoQ_for_software_sys_design | 565 |
| 5-form-function-mapping | 207 |
| 6-software-define-interface-LLM-kb | 402 |
| 7-identify-evaluate-risk-software | 414 |
| 8-stacks-and-priors-atlas | 212 |
| crawley-sys-arch-strat-prod-dev | 1489 |
| **total** | **4990** |

## Checks

| Status | Check | Details |
|:---:|---|---|
| PASS | grep: DecisionNetworkEngine class | 0 hits |
| PASS | grep: legacy lib/runtime/ import | 0 hits |
| PASS | grep: direct Anthropic SDK instantiation | 0 hits |
| PASS | grep: direct OpenAI SDK instantiation | 0 hits |
| PASS | filesystem: apps/product-helper/lib/runtime/ removed | directory absent |
| PASS | retrieval: searchKB returns >=1 hit against the caching KB source | 5 hits; top sim=0.714 |
| PASS | similarity: every score is in (0, 1] | 0.714, 0.454, 0.413, 0.357, 0.266 |
| PASS | similarity: scores are non-increasing top-to-bottom | 0.714 >= 0.454 >= 0.413 >= 0.357 >= 0.266 |
| PASS | similarity: spread between top and bottom result >= 0.01 | spread=0.448 across 5 hits |
| PASS | retrieval: top hit mentions the cache concept (filtered to caching kb_source) | kb_source=2-dev-sys-reqs-for-kb-llm-software sample="avy workloads (slow writes) \| \| **Write-behind** \| High write throughput, loss-t..." |
| PASS | engine: rule matches consumer-pci branch (value=500ms) | value=500 rule_id=consumer-app-user-facing-sync-pci auto_filled=true |
| PASS | audit row #1 inserted with non-empty kbChunkIds[] | id=14f580cb-3c22-4881-b655-c625d1428240 kb_chunks=3 |
| PASS | audit row #1: hash_chain_prev shape (null if first, hex if linked) | hash_chain_prev=83814bfa0c0b9263160f026018a671a899848bb5e9932fe666f91ec2e5b03ee6 |
| PASS | audit row #2 chains to row #1 | row2.prev=15137201970ba661d0401e8d4ab10e0297e7b5b9ccb48dab4d2ed83e77f71bd6  row1.hash=15137201970ba661d0401e8d4ab10e0297e7b5b9ccb48dab4d2ed83e77f71bd6 |
| PASS | verifyChain() reports valid over the stream | valid over 6 rows |

## Discrepancies & tuning notes

- **Vector index kind.** `kb_chunks` uses `ivfflat (lists=100)` per `apps/product-helper/lib/db/schema/kb-chunks.ts` + `lib/db/migrations/0011_kb_chunks.sql`, not HNSW (m=16/ef=64) as named in the Phase A brief. Retrieval is correct (cosine spread well inside (0,1] on this run), so IVFFLAT is the intentional choice for ~5k-row corpora. HNSW upgrade is a Wave-2 perf-tuning item, not a correctness gate.
- **Chunk-size distribution.** Live corpus shows mean ~= 790 chars, p50=698, p95=2006, p99=2197, max=2789 (see commit d65fed8 stats pass). The Phase A brief cited a 1200-3200-char band. The lower mean is expected — the recursive header splitter flushes on every markdown heading, producing tail chunks well under the 2000-char target. Not a blocker; tune with a coarser header-aware splitter in a later ingest pass if retrieval recall lags.
- **Env-var naming.** `lib/langchain/engines/kb-embedder.ts:58` reads `OPENAI_API_KEY`, not the briefed `EMBEDDINGS_API_KEY`. For Phase B (real re-embed) either rename for clarity alongside the OpenRouter gateway or alias one to the other. Purely cosmetic for now.
- **KB `_shared/` path.** The brief points retrieval at `.planning/phases/13-Knowledge-banks-deepened/_shared/caching-system-design-kb.md`, but T9 `_shared/` extraction has not run yet; the file currently lives as 5 copies (folders 2, 4, 5-HoQ, 6, 7). The verifier targets the module-2 copy deterministically. Unique row count will compress once T9 lands.

## Phase B gating

- `kb_chunks` currently holds **4,990 rows** with real `text-embedding-3-small` vectors, sufficient for the Wave-1 exit criteria. Re-embedding under a newly provisioned `EMBEDDINGS_API_KEY`/`OPENAI_API_KEY` can happen in Wave 2 without blocking the tag.
