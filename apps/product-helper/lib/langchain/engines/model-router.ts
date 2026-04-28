/**
 * Model router — deterministic mapping of a decision's rule path to an
 * OpenRouter model id (or null for no-LLM heuristic paths).
 *
 * Per `plans/kb-runtime-architecture.md` §2.4 (Routing) and gap G11, plus
 * David's OpenRouter ruling (2026-04-24 03:55 EDT). Every runtime LLM call
 * routes through `openrouter-client.chat()` with the model id this router
 * picks.
 *
 * Model roles → OpenRouter model ids:
 *   classify        → anthropic/claude-haiku-4-5         (fast + cheap)
 *   extract         → anthropic/claude-sonnet-4-6        (default)
 *   synthesize      → anthropic/claude-opus-4-7          (highest-stakes only)
 *   cheap_classify  → google/gemini-2.5-flash            (non-Claude fallback)
 *
 * Rule path → role mapping:
 *   heuristic    → null (rule tree is pure; no LLM call)
 *   llm_refine   → classify (sub-threshold refinement)
 *   user_surface → extract  (user-visible question generation)
 *
 * CHEAP_MODE=true downgrades non-synthesize calls to `cheap_classify`.
 * `synthesize` is reserved for explicit per-decision overrides (via
 * `model_role_override`) — the router never defaults a rule-path decision
 * to Opus.
 *
 * @module lib/langchain/engines/model-router
 */

import { cheapLLM, streamingLLM } from '../config';

export type RulePath = 'heuristic' | 'llm_refine' | 'user_surface';

export type ModelRole =
  | 'classify'
  | 'extract'
  | 'synthesize'
  | 'cheap_classify';

/**
 * OpenRouter model-id registry. Update here; callers never hard-code ids.
 * Defaults chosen per David's spec 2026-04-24.
 */
export const OPENROUTER_MODELS: Record<ModelRole, string> = {
  classify: 'anthropic/claude-haiku-4-5',
  extract: 'anthropic/claude-sonnet-4-6',
  synthesize: 'anthropic/claude-opus-4-7',
  cheap_classify: 'google/gemini-2.5-flash',
} as const;

/**
 * Reference to a decision being routed. Kept minimal — the router only
 * needs identity + opt-in overrides.
 */
export interface DecisionRef {
  decision_id: string;
  /**
   * Per-decision override. When set, bypasses the rule-path mapping.
   * 'none' forces a null return (no LLM call).
   */
  model_role_override?: ModelRole | 'none';
}

/**
 * Per-model input-token budgets. Claude/Gemini families all support ≥ 200k
 * context; we reserve ~20k for output + system + tool schemas and cap
 * prompt input at 180k tokens.
 */
export const MODEL_CONTEXT_BUDGETS: Record<ModelRole, number> = {
  classify: 180_000,
  extract: 180_000,
  synthesize: 180_000,
  cheap_classify: 180_000,
} as const;

/** Conservative chars→tokens estimate (Claude tokenizer averages ~3.5–4). */
const CHARS_PER_TOKEN = 4;

export type GuardResult =
  | { ok: true; estimatedTokens: number; budget: number }
  | { ok: false; reason: string; estimatedTokens: number; budget: number };

/**
 * Picks the OpenRouter model id for a decision's rule path.
 *
 * Returns `null` for `heuristic` (caller MUST NOT invoke an LLM).
 * Returns a model id (string) for `llm_refine` / `user_surface`.
 * A per-decision `model_role_override` wins if present.
 *
 * CHEAP_MODE=true downgrades {classify, extract} paths to `cheap_classify`.
 * `synthesize` is never auto-downgraded — if the caller explicitly chose
 * Opus via override, they meant it.
 */
export function pickModel(
  decision: DecisionRef,
  rulePath: RulePath,
): string | null {
  const cheapMode = process.env.CHEAP_MODE === 'true';

  if (decision.model_role_override) {
    if (decision.model_role_override === 'none') return null;
    return OPENROUTER_MODELS[decision.model_role_override];
  }

  switch (rulePath) {
    case 'heuristic':
      return null;
    case 'llm_refine':
      return cheapMode
        ? OPENROUTER_MODELS.cheap_classify
        : OPENROUTER_MODELS.classify;
    case 'user_surface':
      return cheapMode
        ? OPENROUTER_MODELS.cheap_classify
        : OPENROUTER_MODELS.extract;
    default: {
      const _exhaustive: never = rulePath;
      void _exhaustive;
      throw new Error(`Unknown rule path: ${String(rulePath)}`);
    }
  }
}

/**
 * Infers the role of a model id (for budget lookup). Returns `extract` if
 * the id is not in the registry — a safe default since all roles share the
 * same budget today.
 */
export function roleOfModel(modelId: string | null): ModelRole | null {
  if (modelId === null) return null;
  for (const [role, id] of Object.entries(OPENROUTER_MODELS) as Array<
    [ModelRole, string]
  >) {
    if (id === modelId) return role;
  }
  return 'extract';
}

/**
 * G11 context-size guard — rejects prompts that would exceed the model's
 * input-token budget. Returns `ok: true` for heuristic (null) paths.
 * Callers MUST short-circuit the LLM call on `ok: false`.
 */
export function guardContextSize(
  modelId: string | null,
  promptChars: number,
): GuardResult {
  const role = roleOfModel(modelId);
  const budget =
    role === null
      ? Number.POSITIVE_INFINITY
      : MODEL_CONTEXT_BUDGETS[role];
  const estimatedTokens = Math.ceil(Math.max(0, promptChars) / CHARS_PER_TOKEN);
  if (estimatedTokens > budget) {
    return {
      ok: false,
      reason: `prompt ~${estimatedTokens} tokens exceeds budget ${budget}`,
      estimatedTokens,
      budget,
    };
  }
  return { ok: true, estimatedTokens, budget };
}

// ──────────────────────────────────────────────────────────────────────────
// Legacy LangChain-handle export (DEPRECATED — will be removed once all
// engine callers migrate to openrouter-client.chat()). Re-exports the
// ChatAnthropic handles from config.ts so existing consumers keep working
// during the migration window. NEW code must call openrouter-client.chat()
// with pickModel()'s return value.
// ──────────────────────────────────────────────────────────────────────────
export const LEGACY_LLM_HANDLES = {
  cheap: cheapLLM,
  streaming: streamingLLM,
} as const;
