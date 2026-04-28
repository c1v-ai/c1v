---
source_url: "https://medium.com/airbnb-engineering/recommending-travel-destinations-to-help-users-explore-5fa7a81654fb"
retrieved_at: "2026-04-23T23:53:00Z"
publish_date: "2026-03-12"
source_tier: "B_official_blog"
sha256: "35f4c47e26f6a75170f1b4d454f20b759c2c44b61d298e685056597158bde748"
bytes: 5744
filing_type: "blog"
author: "Weiwei Guo, Bin Xu, Sundara Rajan Srinivasavaradhan, Jie Tang, Xiaowei Liu, Bharathi Thangamani, Liwei He, Huiji Gao, Tracy Yu, Hui Gao, Stephanie Moyerman, Sanjeev Katariya"
is_ic: true
bytes_integrity: "CAPTCHA_WALL — curl returns Cloudflare Turnstile wall (5,744 bytes). SHA256 is of the wall bytes. Content via WebFetch extraction."
---

# Recommending travel destinations to help users explore (Airbnb)

## AI/ML stack (tier B + is_ic, FRESH 2026-03-12)

- **Model**: Transformer-based sequential modeling, language-modeling-inspired framework
- **Embeddings**: City / region embeddings combined with temporal features (days to today)
- **Multi-task**: Region-level + city-level prediction heads (geo hierarchy)
- **Training data**: 14 examples per booking (7 active + 7 dormant users)
- **Signals**: Booking, view, search history + contextual time-of-year seasonality

## Deployment

- Two live features: **autosuggest** + **abandoned-search email**
- "Significant booking gains in regions where English is not the primary language"
- Specific throughput + latency NOT disclosed

## Interpretation for priors

- **ai_stack (tier B + is_ic)**: Transformer-based geo recommender, custom in-house. gpu_exposure likely `owns_cluster` via AWS (Airbnb is AWS). Training-infra details absent.
- **Archetype hint**: `python-data-heavy` primary + `rails-majestic-monolith` for the serving integration layer. Multi-tag when #34 lands.
