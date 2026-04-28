---
company: anthropic
kind_hint: frontier_ai_private
has_10k: false
fetched_at: "2026-04-22T00:25:30Z"
scraper_version: "v0.1"
files:
  - path: "model-card-claude-opus-4-7-system-card.md"
    original: "_cache/model-card-claude-opus-4-7-system-card.pdf"
    docling_output: "model-card-claude-opus-4-7-system-card.md"
    tier: G_model_card
    sha256: "a7729a0e5eb61dc6818f553ae3c27ab774411cd5ab4ed7f414456d74a05c26d2"
    publish_date: "2026-04-16"
    author: "Anthropic (Responsible Scaling Policy team)"
    is_ic: false
    extracted_claims: [ai_stack_model_family, rsp_thresholds, cbrn_evaluations, cyber_evaluations, agentic_safety_benchmarks, alignment_evaluations, model_welfare_measurements, software_engineering_benchmarks, long_context_performance, context_window_size, modality_support]
  - path: "news-claude-opus-4-7.md"
    original: "_cache/news-claude-opus-4-7.html"
    docling_output: "news-claude-opus-4-7.md"
    tier: B_official_blog
    sha256: "bde8ac0e48096153eb28bb8d5f542f4fb020f2fdb3e2ee6d87d9fba96318405e"
    publish_date: "2026-04-16"
    author: "Anthropic (official news post)"
    is_ic: false
    extracted_claims: [pricing_5_per_Minput_25_per_Moutput, ai_stack_deployment_platforms_bedrock_vertex_foundry, claude_opus_4_7_launch_date, benchmark_93_task_coding_13pct_lift, cyber_verification_program_policy]
  - path: "news-google-broadcom-compute.md"
    original: "_cache/news-google-broadcom-compute.html"
    docling_output: "news-google-broadcom-compute.md"
    tier: B_official_blog
    sha256: "632942ffb094fb5458020d128cd9bdf26f263d46a6474d84e4559c44066de43a"
    publish_date: "2026-04-06"
    author: "Anthropic (quoted: Krishna Rao, CFO)"
    is_ic: false
    extracted_claims: [revenue_run_rate_30B_2026, revenue_run_rate_9B_2025_yearend, customers_over_1M_1000_plus_count, compute_multi_GW_tpu_commitment_2027, ai_stack_hardware_diversity_trainium_tpu_gpu, us_infrastructure_50B_commitment, series_g_valuation_380B, primary_cloud_provider_aws]
notes: |
  Frontier AI-private. No 10-K exists (expected; kind_hint=frontier_ai_private).
  Priors tier-mix per plan §6.3: B + G (NOT dual-C — matches curator's priors-only tightening stance).
  All 3 sources dated, fresh (Apr 2026). Dates extracted from rendered text, not meta tags
  (Anthropic's article:published_time meta is not populated).

  Source tier allocation:
  - Claude Opus 4.7 system card (tier G): THE canonical reference for ai_stack + alignment + safety priors.
    509 KB of MD post-docling. Rich content: RSP evals, CBRN, cyber, software engineering, long context.
  - Opus 4.7 news (tier B): pricing ($5/M input, $25/M output), deployment platforms, benchmark lift.
  - Broadcom partnership (tier B): infra/compute priors — multi-GW TPU, AWS Trainium + Google TPU + NVIDIA,
    AWS primary, $50B US infra commitment. Also surfaces Anthropic financial anchors from CFO quotes:
    $30B run-rate revenue (up from ~$9B end of 2025), 1000+ customers at >$1M/yr, $380B post-money Series G.

  NOTE ON REVENUE QUANT: Run-rate revenue figure is tier-B (CFO quoted in official Anthropic news post).
  NOT dual-C. Per curator's priors rule (B/E-IC/G only), this qualifies. Curator may still want to flag it
  as a financial projection rather than audited — AI-private revenue claims inherently lack 10-K rigor.

  PDF FETCH NOTE: model card is hosted on cdn.sanity.io (CDN for anthropic.com). First curl timed out at
  7.3MB of 14.2MB; retried with --max-time 180 and completed. SHA256 is on the full PDF (14,231,870 bytes).

  COMPUTE INFRA CALL-OUT: Broadcom post explicitly names AWS Trainium as Anthropic's training partner +
  "Amazon remains our primary cloud provider and training partner". Strong anchor for M4 decision-matrix
  priors on "where do I train large models" — Anthropic has both multi-cloud deploy (Bedrock/Vertex/Foundry)
  AND specific training-partner preference (AWS/Trainium).

  No tier-E conference talk or tier-F GitHub repo fetched. Anthropic's GitHub org has limited public infra
  repos. NeurIPS/ICML talks by Anthropic ICs exist (e.g., mech-interp team) but require transcript pipeline
  not built in this scraper version; flagging as a supplementary-batch opportunity.
