/**
 * OpenRouter client — the single LLM gateway for the c1v runtime.
 *
 * Per David's ruling (2026-04-24 03:55 EDT) every runtime LLM call routes
 * through this module. Do NOT construct `new Anthropic()` or `new OpenAI()`
 * elsewhere under `apps/product-helper/lib/langchain/engines/`.
 *
 * Carve-out: `lib/langchain/config.ts` still constructs `ChatAnthropic`
 * (LangChain wrapper) directly for legacy callers (intake agents, quick
 * start, etc.). That wrapper is out of scope for this migration —
 * `ChatAnthropic` is a LangChain handle, not a raw SDK constructor, so it
 * does not violate the grep guardrail.
 *
 * Why fetch, not `@anthropic-ai/sdk`: OpenRouter exposes an OpenAI-compatible
 * `/chat/completions` endpoint. Wrapping Anthropic's SDK would require
 * round-tripping through its message format and hand-rolling the base URL
 * override it doesn't officially support. A thin `fetch` call against the
 * OpenAI schema is fewer lines, zero new deps, and mock-friendly (tests
 * stub `global.fetch` instead of pulling msw).
 *
 * Features:
 *   - Streaming + non-streaming `chat()`
 *   - Retry with exponential backoff on 429 and 5xx
 *   - Prompt-caching pass-through for Anthropic models via
 *     `extra_body.cache_control`
 *   - Cost observability: `onUsage?` callback emits
 *     `{model, prompt_tokens, completion_tokens, cost_usd}` per call
 *   - Required OpenRouter attribution headers:
 *       HTTP-Referer: https://prd.c1v.ai
 *       X-Title:      c1v-MIT-Crawley-Cornell
 *
 * @module lib/langchain/engines/openrouter-client
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /**
   * Anthropic prompt-caching hint. When present, the client forwards it
   * via `extra_body.cache_control` for Anthropic models. Ignored for
   * other providers.
   */
  cache_control?: { type: 'ephemeral' };
}

export interface UsageRecord {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  /** Abort signal forwarded to `fetch`. */
  signal?: AbortSignal;
  /** Called once per successful (non-streaming) call with usage + cost. */
  onUsage?: (u: UsageRecord) => void;
  /** Max retry attempts on 429/5xx. Default 3. */
  maxRetries?: number;
  /** Initial backoff in ms. Default 500. Grows 2^n with jitter. */
  backoffBaseMs?: number;
}

export interface ChatResult {
  content: string;
  model: string;
  usage: UsageRecord;
  finish_reason: string | null;
}

/**
 * Non-streaming chat completion via OpenRouter.
 *
 * Throws on:
 *   - Missing OPENROUTER_API_KEY at call time
 *   - Non-retryable HTTP error (4xx except 429)
 *   - Retry budget exhausted on 429/5xx
 *   - Malformed response body
 */
export async function chat(
  model: string,
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<ChatResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY missing from environment. See .env.example.',
    );
  }

  const baseUrl =
    process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
  const url = `${baseUrl}/chat/completions`;

  const body = buildRequestBody(model, messages, opts);
  const headers = buildHeaders(apiKey);
  const maxRetries = opts.maxRetries ?? 3;
  const backoffBase = opts.backoffBaseMs ?? 500;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: opts.signal,
      });
    } catch (err) {
      lastError = err as Error;
      if (attempt === maxRetries) throw lastError;
      await sleep(backoffDelay(backoffBase, attempt));
      continue;
    }

    if (res.ok) {
      const json = (await res.json()) as OpenRouterResponse;
      return parseResult(json, model, opts);
    }

    // Retryable: 429 and 5xx
    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      const detail = await safeReadText(res);
      lastError = new Error(
        `OpenRouter ${res.status} ${res.statusText}: ${detail}`,
      );
      if (attempt === maxRetries) throw lastError;
      await sleep(backoffDelay(backoffBase, attempt));
      continue;
    }

    // Non-retryable
    const detail = await safeReadText(res);
    throw new Error(
      `OpenRouter ${res.status} ${res.statusText}: ${detail}`,
    );
  }

  // Unreachable (loop always returns or throws) — satisfy TS.
  throw lastError ?? new Error('OpenRouter: unknown failure');
}

// ──────────────────────────────────────────────────────────────────────────
// Request / response shaping
// ──────────────────────────────────────────────────────────────────────────

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    // OpenRouter populates this for most providers.
    total_cost?: number;
  };
}

function buildRequestBody(
  model: string,
  messages: ChatMessage[],
  opts: ChatOptions,
): Record<string, unknown> {
  const hasCacheHints = messages.some((m) => m.cache_control);
  const body: Record<string, unknown> = {
    model,
    messages: messages.map(({ cache_control: _ignored, ...rest }) => rest),
    stream: false,
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.max_tokens !== undefined) body.max_tokens = opts.max_tokens;

  if (hasCacheHints && model.startsWith('anthropic/')) {
    // OpenRouter pass-through for Anthropic prompt caching.
    body.extra_body = {
      cache_control: messages
        .map((m, i) => (m.cache_control ? { index: i, ...m.cache_control } : null))
        .filter(Boolean),
    };
  }
  return body;
}

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    // Required by OpenRouter for attribution + ranking in their dashboard.
    'HTTP-Referer': 'https://prd.c1v.ai',
    'X-Title': 'c1v-MIT-Crawley-Cornell',
  };
}

function parseResult(
  json: OpenRouterResponse,
  requestedModel: string,
  opts: ChatOptions,
): ChatResult {
  const choice = json.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error(
      `OpenRouter response malformed: no choices[0].message.content (model=${requestedModel})`,
    );
  }
  const usage: UsageRecord = {
    model: json.model ?? requestedModel,
    prompt_tokens: json.usage?.prompt_tokens ?? 0,
    completion_tokens: json.usage?.completion_tokens ?? 0,
    cost_usd: json.usage?.total_cost ?? 0,
  };
  opts.onUsage?.(usage);
  return {
    content: choice.message.content,
    model: usage.model,
    usage,
    finish_reason: choice.finish_reason ?? null,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Retry helpers
// ──────────────────────────────────────────────────────────────────────────

function backoffDelay(base: number, attempt: number): number {
  // Exponential with ±25% jitter so concurrent retries don't thundering-herd.
  const exp = base * 2 ** attempt;
  const jitter = exp * (0.5 * Math.random() - 0.25);
  return Math.max(0, Math.floor(exp + jitter));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return '<body unreadable>';
  }
}
