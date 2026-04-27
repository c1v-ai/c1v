/**
 * synthesis-mocks.ts — Optional LLM API mocks for the synthesis e2e.
 *
 * Why mocks (and why optional):
 *   - The P9 mitigation gate is the **click-through wire**, not LLM
 *     correctness. Burning real Anthropic tokens on every CI run is
 *     wasteful and brittle (rate limits, network jitter, 90s budget).
 *   - The Vercel-side LangGraph kickoff fires inside Next.js `after()`,
 *     so mocking `api.anthropic.com` at the route layer would require a
 *     server-side mock — not Playwright's strong suit.
 *   - In practice, the 7 NEW v2.1 nodes hit the **no-stub branch** and
 *     persist `pending` immediately *before* any LLM call (per P10).
 *     The legacy nodes (FFBD/decision-matrix) do call the LLM, but they
 *     update `state.extractedData` only — they don't gate the
 *     `project_artifacts` rows the test asserts on.
 *
 * Conclusion: the e2e does NOT actually need LLM mocks to satisfy the P9
 * gate, because every assertion the spec makes is on `project_artifacts`
 * row state, and the 7 stuck-pending rows are written by code paths that
 * short-circuit *before* the LLM is reached.
 *
 * This file is kept as a v2.2 reuse seam — when v2.2 closes P10 and the 7
 * NEW nodes start actually invoking their agents, the spec will need LLM
 * determinism. Wire mocks via the pattern below at that time.
 *
 * Pattern (recommended for v2.2):
 *   1. Use `playwright.test.beforeAll` to start an in-process MSW server
 *      with handlers for `https://api.anthropic.com/v1/messages`.
 *   2. Pin every handler response to a deterministic JSON shape that
 *      matches the agent's output schema (look at the agents under
 *      `lib/langchain/agents/system-design/` for the contracts).
 *   3. Set `ANTHROPIC_API_BASE_URL` in the dev-server env so requests
 *      route to the mock host.
 *
 * For v2.1.1 the `installSynthesisMocks` export is a no-op that documents
 * the seam — calling it from the spec records intent without changing
 * runtime behavior.
 *
 * @module tests/e2e/fixtures/synthesis-mocks
 */

import type { Page } from '@playwright/test';

export interface SynthesisMockOptions {
  /** Whether to enable the LLM mock layer. Default: false (v2.1.1 no-op). */
  enable?: boolean;
}

/**
 * No-op for v2.1.1. v2.2 wires real handlers here once P10 is closed and
 * the 7 NEW nodes actually invoke their LangChain agents.
 */
export async function installSynthesisMocks(
  page: Page,
  opts: SynthesisMockOptions = {},
): Promise<void> {
  if (!opts.enable) return;

  // v2.2 PLACEHOLDER — when P10 closes, replace this with real handlers.
  // For now we route api.anthropic.com to a 503 so the failure surface is
  // explicit ("you enabled mocks but didn't wire them") rather than
  // burning real tokens silently.
  await page.route('**/api.anthropic.com/**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          type: 'service_unavailable_error',
          message:
            'synthesis-mocks v2.1.1: handler not implemented. ' +
            'Wire real responses in v2.2 once P10 closes.',
        },
      }),
    });
  });
}

/** v2.2 — record the agent kinds the mock layer should return canned data for. */
export const MOCKED_AGENT_KINDS = [
  // The 7 NEW v2.1 nodes (per P10) — these will start firing once stubs
  // are populated upstream.
  'data_flows_v1',
  'form_function_map_v1',
  'decision_network_v1',
  'n2_matrix_v1',
  'fmea_early_v1',
  'fmea_residual_v1',
  'recommendation_json',
] as const;
