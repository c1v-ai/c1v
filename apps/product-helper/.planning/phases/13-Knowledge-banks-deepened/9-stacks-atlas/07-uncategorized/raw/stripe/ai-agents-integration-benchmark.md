---
source_url: "https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations"
retrieved_at: "2026-04-24T00:10:44Z"
publish_date: "2026-03-02"
source_tier: "B_official_blog"
filing_type: "blog"
author: "Carol Liang, Kevin Ho (Stripe API Standards)"
is_ic: true
bytes_integrity: "webfetch_rendered_text — unusually complete body recovered for this post; SHA not captured at rest"
extracted_claims:
  - benchmark_size_11_environments
  - avg_agent_turns_63
  - models_tested_claude_opus_4_5_gpt_5_2
  - claude_opus_4_5_avg_score_92pct_on_4_full_stack_tasks
  - gpt_5_2_avg_score_73pct_on_2_gym_tasks
  - harness_goose_based
  - tool_layer_mcp_server_terminal_browser_stripe_search
  - graders_deterministic_api_and_ui_tests
  - categories_backend_fullstack_gym
---

# Can AI agents build real Stripe integrations? (benchmark)

## Content captured (Tier B + is_ic, 2026-03-02)

- **Authors:** Carol Liang, Kevin Ho (Stripe API Standards team).
- **Benchmark design:** 11 diverse environments with Stripe integration tasks, across 3 categories: backend-only, full-stack, and "gym" problem sets.
- **Agent-turn budget:** best-performing runs averaged **63 turns** of agent interaction.
- **Models tested:** Claude Opus 4.5, OpenAI GPT-5.2.
- **Results:**
  - Claude Opus 4.5: **92% avg across 4 full-stack tasks**
  - GPT-5.2: **73% avg across 2 gym tasks**
- **Evaluation harness:**
  - **Goose**-based harness (Block's open agent runner) for consistent execution.
  - **MCP server** providing terminal, browser, and Stripe-specific search tools.
  - **Deterministic graders** via API calls + automated UI tests.
- **Frameworks:** no explicit LangChain/LangGraph mention; custom harness around Goose + MCP.

## Interpretation for priors

- **Agent-evaluation prior (agent-platform archetype):** 11-environment benchmark with 63-turn budget and API+UI graders is a credible shape for LLM-integration-benchmark priors. Use for "agent-harness design" and "grader cost" priors when c1v scopes its own eval harness.
- **Tooling signal:** Goose + MCP is a real-world pattern at a payments-grade engineering org as of 2026-Q1.

## Provenance notes

- Unlike the other stripe.dev posts, body was retrievable — likely because this post's content is partially included in the server-rendered shell or was pre-rendered differently. Still no byte-exact SHA recorded (WebFetch rendered text only).
