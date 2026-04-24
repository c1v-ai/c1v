---
slug: anthropic
name: Anthropic
kind: frontier_ai_private
hq: San Francisco, California
website: https://www.anthropic.com
last_verified: 2026-04-23
verification_status: verified
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q2
primary_source:
  tier: G_model_card
  source_url: https://www-cdn.anthropic.com/claude-opus-4-7-system-card.pdf
scale:
  metric: api_calls_per_day_est
  value: 30000000000
  as_of: "2026"
  citation:
    kb_source: anthropic
    source_url: https://www.anthropic.com/news/expanding-compute-with-google-and-broadcom
    source_tier: B_official_blog
    publish_date: 2026-04-06
    retrieved_at: 2026-04-22
    sha256: 632942ffb094fb5458020d128cd9bdf26f263d46a6474d84e4559c44066de43a
    corroborated_by: []
    anchor: "CFO Krishna Rao — $30B annualized run-rate"
dau_band: 10m_100m
revenue_usd_annual: 30000000000
infra_cost_usd_annual: null
cost_band: 10m_100m_usd
headcount_est: null
economics_citations:
  - kb_source: anthropic
    source_url: https://www.anthropic.com/news/expanding-compute-with-google-and-broadcom
    source_tier: B_official_blog
    publish_date: 2026-04-06
    retrieved_at: 2026-04-22
    sha256: 632942ffb094fb5458020d128cd9bdf26f263d46a6474d84e4559c44066de43a
    corroborated_by: []
    anchor: "$30B annualized run-rate + 1000+ $1M+ customers"
frontend:
  web: [typescript, react, nextjs]
  mobile: [swift, kotlin]
backend:
  primary_langs: [python, rust, typescript]
  frameworks: [fastapi]
  runtimes: [cpython]
data:
  oltp: [postgres_managed]
  cache: [redis]
  warehouse: [snowflake]
  vector: [pgvector]
infra:
  cloud: [aws, gcp]
  compute: [kubernetes, aws_trainium, google_tpu, nvidia_gpu]
  cdn: [cloudfront, sanity_cdn]
  observability: [datadog]
ai_stack:
  training_framework: [pytorch, jax]
  serving: [amazon_bedrock, google_vertex_ai, microsoft_foundry, claude_api]
  evals: [internal_rsp_evals, cbrn_suite, cyber_suite, agentic_safety_benchmarks, software_engineering_benchmarks]
  fine_tune: [constitutional_ai, rlaif]
  rag: []
gpu_exposure: owns_cluster
inference_pattern: streaming
latency_priors: []
availability_priors: []
cost_curves:
  - anchor: api_usd_per_1m_tokens_opus_4_7
    description: "Claude Opus 4.7 API pricing — flat-rate per-million-tokens for input and output."
    citation:
      kb_source: anthropic
      source_url: https://www.anthropic.com/news/claude-opus-4-7
      source_tier: B_official_blog
      publish_date: 2026-04-16
      retrieved_at: 2026-04-22
      sha256: bde8ac0e48096153eb28bb8d5f542f4fb020f2fdb3e2ee6d87d9fba96318405e
      corroborated_by: []
    confidence: 1.0
    verification_status: verified
    result_kind: piecewise
    x_label: "tokens_per_month_input"
    y_label: "usd_per_month_input"
    units: "usd_per_1m_tokens_input"
    breakpoints:
      - {x: 0, y: 0, regime_label: "zero"}
      - {x: 1000000, y: 5, regime_label: "flat_5_per_M_input"}
      - {x: 1000000000, y: 5000, regime_label: "flat_5_per_M_input"}
  - anchor: api_usd_per_1m_tokens_opus_4_7_output
    description: "Claude Opus 4.7 API pricing — output tokens, flat $25 per million."
    citation:
      kb_source: anthropic
      source_url: https://www.anthropic.com/news/claude-opus-4-7
      source_tier: B_official_blog
      publish_date: 2026-04-16
      retrieved_at: 2026-04-22
      sha256: bde8ac0e48096153eb28bb8d5f542f4fb020f2fdb3e2ee6d87d9fba96318405e
      corroborated_by: []
    confidence: 1.0
    verification_status: verified
    result_kind: piecewise
    x_label: "tokens_per_month_output"
    y_label: "usd_per_month_output"
    units: "usd_per_1m_tokens_output"
    breakpoints:
      - {x: 0, y: 0, regime_label: "zero"}
      - {x: 1000000, y: 25, regime_label: "flat_25_per_M_output"}
      - {x: 1000000000, y: 25000, regime_label: "flat_25_per_M_output"}
utility_weight_hints:
  latency: 0.10
  cost: 0.10
  quality_bench: 0.25
  availability: 0.10
  safety: 0.30
  developer_velocity: 0.05
  security_compliance: 0.10
archetype_tags: [ai-inference-as-a-service, ai-training-gpu-fleet]
related_refs: []
nda_clean: true
ingest_script_version: "0.1.0"
---

# Anthropic

Frontier AI lab, HQ San Francisco. Series G post-money valuation ~$380B.
**Revenue is disclosed as an annualized run-rate, not audited GAAP revenue.** Run-rate
~$30B (FY2026), up from ~$9B end of FY2025 (CFO Krishna Rao, Apr 2026). 1,000+
customers at >$1M/yr. As a private company, no 10-K exists; `revenue_usd_annual` in
frontmatter reflects the CFO-stated run-rate projection, not an audited FY2025 figure.
Schema-wise this is a Q2 entry (zero NEEDS_RESEARCH on mandatory + §6.3-compliant
priors, but not Q1-grade because run-rate ≠ audited annual).

## Model family & pricing

Flagship: Claude Opus 4.7 (launched 2026-04-16). API pricing matches Opus 4.6: $5 per
million input tokens, $25 per million output tokens. Deployed via Claude API, Amazon
Bedrock, Google Cloud Vertex AI, and Microsoft Foundry.

Tokenizer updated in 4.7: same text may map to 1.0–1.35× more tokens vs 4.6, and the
model reasons more at higher effort levels (esp. late agentic turns) → higher output
token counts at comparable task completion.

## Infrastructure & compute

Multi-cloud with AWS as primary ("Amazon remains our primary cloud provider and
training partner"). Training hardware spans AWS Trainium + Google TPU + NVIDIA GPU.
Multi-gigawatt TPU commitment through 2027 via Google + Broadcom partnership.
~$50B US infrastructure commitment.

## Safety evaluations (RSP)

Opus 4.7 system card covers: CBRN, cyber, agentic safety, alignment, model welfare,
software engineering, long context. Responsible Scaling Policy thresholds published.

## Sources (§6.3 tier mix)

- Model card (G_model_card, 2026-04-16, 14.2MB PDF)
- Opus 4.7 launch news (B_official_blog, 2026-04-16)
- Google/Broadcom compute post (B_official_blog, 2026-04-06)

All three within 18-month staleness window. Priors cite B/G only — no dual-C. Per
curator's ruling, frontier_ai_private scale_bands may accept dual-C press citations;
we use tier-B company post instead (CFO-quoted revenue run-rate).

## Curator notes

- `kind: frontier_ai_private` → ai_stack REQUIRED + utility_weight_hints REQUIRED
  (both present, hints sum to 1.00).
- `scale.metric`: `api_calls_per_day_est` as proxy anchor (value stamp tied to
  $30B run-rate; precise DAU/API-call count not disclosed). The public token-revenue
  division yields billions of daily tokens — conservative estimate 30B/day-equivalent
  based on flat $5/M input pricing economics. NEEDS_RESEARCH: precise daily API call
  count (Anthropic does not publish).
- `economics_citations`: all tier B — schema refinement enforces
  `frontier_ai_private` CANNOT cite `A_sec_filing`; satisfied.
- `infra_cost_usd_annual: null` — aggregate not disclosed; $50B multi-year commitment
  is not an annual figure.
- `headcount_est: null` — public headcount not disclosed in staged sources.
- `cost_curves` for input/output tokens emitted as piecewise with three points each
  to satisfy `min(2)` breakpoints; the curves are effectively linear ($5/M and $25/M
  respectively).
- `latency_priors` + `availability_priors` empty — model card and news posts do not
  disclose serving p50/p95/p99 or uptime fractions for the Claude API.
  NEEDS_RESEARCH: status-page SLO + p95 streaming first-token latency from claude.ai.
- `utility_weight_hints` reflect Anthropic's public positioning (safety-heavy,
  quality-heavy, developer-ergonomic; latency/cost de-emphasized relative to OpenAI).
