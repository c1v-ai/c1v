# GLOSSARY — KB-8 Stacks & Priors Atlas

> Canonical definitions for every abbreviation used in Atlas frontmatter,
> priors, or prose. Zod schemas reference these names directly (e.g.,
> `percentile: 'p50' | 'p95' | 'p99'`). When a term has multiple accepted
> meanings elsewhere in the industry, the Atlas definition is the one
> c1v agents consume.

---

## Scale

- **DAU — Daily Active Users.** Unique accounts that performed a core
  action in a 24-hour window (product-owner-defined action). For social,
  "active" ≠ "logged-in"; definitions vary, so every entry cites the
  company's own definition where available.
- **MAU — Monthly Active Users.** Same as DAU over a 30-day window.
  `DAU/MAU` ratio ≥ 0.2 is the common "sticky product" threshold.
- **RPS — Requests per Second.** Steady-state HTTP or RPC rate. Peak RPS
  is typically 3-5× sustained RPS for consumer apps.
- **QPS — Queries per Second.** Synonymous with RPS in most contexts;
  favored when the request is a database query.
- **TPS — Transactions per Second.** Reserved for ACID-style commits
  (fintech, OLTP); not interchangeable with RPS.
- **WAU — Weekly Active Users.** Rarely used in Atlas; cited when the
  company reports only WAU (e.g., Slack historically).

## Latency percentiles

- **p50 — median latency.** Half the requests complete faster.
- **p90 — 90th-percentile latency.** 10% of requests are slower.
- **p95 — 95th-percentile latency.** The c1v default for "tail" budgets.
  The Atlas `latency_priors[*]` convention: when a source reports only
  a mean, coerce to p95 only if p95 ≈ 2× mean can be justified.
- **p99 — 99th-percentile latency.** Used for SLA-grade tail budgets
  (payments, safety-critical).
- **mean — arithmetic average latency.** Accepted when source doesn't
  report percentiles; curator must flag `verification_status: partial`.

## Availability

- **SLA — Service Level Agreement.** Contractual uptime commitment to
  customers. Atlas records published SLAs (e.g., 99.9%) with the caveat
  that realized availability is usually higher.
- **SLO — Service Level Objective.** Internal target, often stricter
  than the public SLA. Rarely public; when known, curator records in
  prose §6 not in frontmatter.
- **SLI — Service Level Indicator.** The actual metric being measured
  (e.g., error rate, latency threshold). Reference term only.
- **Nine-count shorthand**:
  - 99% = "two nines" ≈ 3.65 days/year downtime
  - 99.9% = "three nines" ≈ 8.77 hours/year
  - 99.99% = "four nines" ≈ 52.6 minutes/year
  - 99.999% = "five nines" ≈ 5.26 minutes/year
- **Serial availability**: A = ∏Aᵢ. Used when N components must all be
  up for the system to be up.
- **Parallel availability**: A = 1 − ∏(1 − Aᵢ). Used when redundancy
  means any one of N needs to be up.

## Cost

- **TCO — Total Cost of Ownership.** All-in cost including compute,
  storage, network egress, support, and personnel. Rarely public;
  Atlas prefers per-unit published prices (e.g., $/1M tokens) over TCO.
- **Cost band** (`cost_band` enum in frontmatter): ordinal bucket for
  annual infra spend. Lets indexes sort without requiring disclosed
  absolute numbers.
- **Egress cost**: outbound network transfer fees (AWS/GCP/Azure all
  charge). Often 5-10% of cloud bill; sometimes the dominant term for
  streaming / CDN-style products.
- **Unit economics**: cost per unit of value (cost/DAU, cost/GB-served,
  cost/1K-tokens). When known, recorded in prose §1 and/or as a piecewise
  cost curve.

## Stack slots

- **OLTP — Online Transactional Processing.** Row-oriented, low-latency
  transactional databases (Postgres, MySQL, DynamoDB, Cassandra).
- **OLAP — Online Analytical Processing.** Column-oriented, aggregation-
  heavy databases (Snowflake, BigQuery, Redshift, ClickHouse). Recorded
  under `data.warehouse`.
- **CDN — Content Delivery Network.** Edge cache (Cloudflare, Fastly,
  Akamai, CloudFront).
- **Cache**: in-memory key-value store (Redis, Memcached, EVCache).
- **Vector DB**: embedding search (pgvector, Pinecone, Weaviate,
  Chroma, self-hosted).
- **Queue / Pub-sub**: async messaging (Kafka, SQS, PubSub, NATS).

## AI-specific

- **GPU fleet**: owned H100/A100/H200/TPU compute. `gpu_exposure: 'owns_cluster'`.
- **Rents long-term**: reserved instances from hyperscalers (1-3yr commit).
  `gpu_exposure: 'rents_long_term'`.
- **Rents spot**: on-demand / spot instances. `gpu_exposure: 'rents_spot'`.
- **Serverless inference**: Bedrock / Vertex Generative / Workers AI —
  no provisioned capacity. `gpu_exposure: 'serverless'`.
- **Training vs inference**: training = model weight update;
  inference = forward-pass serving. Atlas tracks them separately in
  `ai_stack.training_framework` vs `ai_stack.serving`.
- **Fine-tune**: adaptation of a pretrained model on customer data.
  Exposed to end users via `inference_pattern: 'fine_tune_service'`.
- **Context window**: maximum input tokens per call. Frontier AI companies
  publish this in model cards (tier G).
- **Eval suite**: `ai_stack.evals` — internal benchmarks (MMLU-style,
  custom internal). Treated as a stack slot, not a prior.

## Citation + provenance

- **Source tier** (A-H): see `SOURCES.md` for the full taxonomy.
- **Publish date**: when the source was published (not fetched). Drives
  the 18-month staleness gate.
- **Retrieved at**: ISO-8601 UTC timestamp of the fetch that produced
  the `sha256`.
- **SHA-256**: hex digest of the fetched source body. Mismatch on refetch
  flags the entry for review.
- **Corroboration**: for tier-C citations on priors, require ≥1 secondary
  citation from a different publisher.

## Verification status

- **verified**: curator confirmed via primary source AND at least one
  corroborating source within 18 months.
- **partial**: primary source exists but fields are estimates / ranges.
- **inferred**: no direct primary source; derived from archetype
  analogies. Use sparingly; flag in prose.

## Quality grade

- **Q1 / Q2 / Q3**: per-entry data-quality grade assigned by curator.
  See `README.md` §2.2. Not in Zod; tracked in `SOURCES.md` and the
  corpus counter.
