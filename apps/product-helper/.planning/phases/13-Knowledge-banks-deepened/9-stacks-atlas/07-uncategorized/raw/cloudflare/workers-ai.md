---
source_url: "https://blog.cloudflare.com/workers-ai/"
retrieved_at: "2026-04-23T04:05:30Z"
publish_date: "2023-09-27"
source_tier: "B_official_blog"
sha256: "8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93"
bytes: 414697
filing_type: "blog"
author: "Phil Wittig, Rita Kozlov, Rebecca Weekly, Celso Martinho, Meaghan Choi"
is_ic: false
---

# Workers AI — serverless GPU-powered inference on Cloudflare's global network

Raw bytes at `_sources/workers-ai.html`. Content extracted via WebFetch 2026-04-23.

## GPU deployment rollout schedule (at launch)

- **7 sites** at GA launch (2023-09-27)
- **~100 sites by end of 2023**
- **"Nearly everywhere"** by end of 2024
- Direct quote: "launching with seven sites today, roughly 100 by the end of 2023, and nearly everywhere by the end of 2024"

## Models hosted at launch

| Task | Model |
|---|---|
| Text generation | `meta/llama-2-7b-chat-int8` |
| Automatic speech recognition | `openai/whisper` |
| Translation | `meta/m2m100-1.2` |
| Text classification | `huggingface/distilbert-sst-2-int8` |
| Image classification | `microsoft/resnet-50` |
| Embeddings | `baai/bge-base-en-v1.5` |

## Pricing (Neurons, canonical cost anchor)

- **Regular Twitch Neurons**: $0.01 per 1,000 neurons
- **Fast Twitch Neurons**: $0.125 per 1,000 neurons
- **Zero-output = zero-charge** (output-scaled billing)
- **Reference conversion**: 1,000 neurons = **130 LLM responses** OR 830 image classifications OR 1,250 embeddings

## Platform integration

- **Delivery**: Serverless GPU platform via REST API and Workers/Pages integration
- **Binding model**: Environment bindings in Workers, direct invocation from Pages

## Interpretation for priors

- **ai_stack.cost**: Neurons pricing is a clean tier-B citation for inference-as-a-service cost_curve. Maps to the M4 decision-matrix "where do I host inference" node. Compare against OpenAI per-M-token, Together serverless, Replicate per-call.
- **ai_stack.models**: The 6-model launch roster documents Cloudflare's serving positioning (open-weight + select Hugging Face). Not a training claim — Cloudflare is serving-only, not pretraining.
- **GPU exposure (gpu_exposure enum)**: `owns_cluster` — Cloudflare operates GPU nodes at its own PoPs, not a GPU tenant.
- **Inference pattern**: `edge` + `serverless` (both apply).

## Staleness

Published 2023-09-27 — outside 18-month window. Retained because this is the canonical Workers AI GA announcement; pricing has remained stable per Cloudflare's live pricing page. For a freshness anchor on Workers AI scale, would need a 2025 performance / expansion blog post — not in this batch.

## Is_ic assessment

Authors are VP + Directors + Product Managers (Phil Wittig is infra VP, Rita Kozlov is Workers VP, Rebecca Weekly is VP Infrastructure, Celso Martinho is PM, Meaghan Choi is PM). All management, no IC engineer byline. is_ic=false.