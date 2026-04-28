---
source_url: "https://status.stripe.com"
retrieved_at: "2026-04-24T00:10:44Z"
publish_date: null
source_tier: "B_official_blog"
filing_type: "status_page"
author: "Stripe (operational telemetry)"
is_ic: false
bytes_integrity: "webfetch_spa_shell_only_loading_message — status.stripe.com is a Statuspage.io SPA; WebFetch returns only the pre-hydration 'Loading...' shell. Component-level statuses not recoverable without JS."
extracted_claims:
  - status_page_exists_at_status_stripe_com
---

# Stripe status page (captured shell only)

## Content captured (Tier B, 2026-04-24 retrieval)

- **Existence confirmed:** `status.stripe.com` is the public operational status page.
- **Body NOT recovered:** page is a Statuspage.io-style SPA; only a "Loading..." shell is returned to WebFetch.
- **Component list, uptime percentages, incident history:** NOT retrieved.

## Interpretation for priors

- Page existence is itself weak corroboration for an SRE-grade operational posture. Cannot be used as a numeric availability prior.
- To extract per-component SLAs, the curator should pair this with the Collison annual-letter TPV numbers and the 99.999% docdb claim.

## Provenance notes

- Recurrent SPA-shell pattern alongside the stripe.dev blog CSR wall. Recommend architect extend the in-flight `bytes_integrity` schema (#38) to include a distinct tag like `spa_shell_pre_hydration` if finer-grained distinction is wanted.
