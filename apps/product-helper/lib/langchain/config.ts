import { ChatOpenAI } from '@langchain/openai';
import type { z } from 'zod';
import { LLM_DEFAULTS } from '@/lib/constants';

/**
 * LangChain LLM handles routed through OpenRouter.
 *
 * Per David's OpenRouter ruling (2026-04-24 03:55 EDT) and the 2026-04-30
 * migration: every LangChain LLM call now goes through OpenRouter via
 * `ChatOpenAI` with `baseURL` overridden. This drains OpenRouter credits
 * instead of the Anthropic API key.
 *
 * Why ChatOpenAI (not ChatAnthropic): OpenRouter exposes an OpenAI-compatible
 * `/chat/completions` endpoint. ChatOpenAI talks that schema natively;
 * OpenRouter translates to Anthropic's format on the backend. Tool calling
 * and `.withStructuredOutput()` keep working because LangChain treats the
 * endpoint as OpenAI-compatible.
 *
 * Model IDs aligned with `lib/langchain/engines/model-router.ts`. The
 * raw `openrouter-client.chat()` is still the preferred path for new code
 * (more cost observability + retry control); these handles exist for the
 * intake/extraction/quick-start agents that already speak LangChain.
 *
 * Note: Anthropic prompt-caching via OpenRouter requires `cache_control`
 * hints inside message content (not a top-level option). The legacy
 * `cacheControl: true` option from `@langchain/anthropic` is not portable;
 * callers that need caching should migrate to `openrouter-client.chat()`.
 */

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';

const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://prd.c1v.ai',
  'X-Title': 'c1v-MIT-Crawley-Cornell',
} as const;

// Model options — OpenRouter ids matching `engines/model-router.ts`.
export const CLAUDE_MODELS = {
  OPUS: 'anthropic/claude-opus-4-7',     // highest-stakes synthesis only
  SONNET: 'anthropic/claude-sonnet-4-6', // default balanced
  HAIKU: 'anthropic/claude-haiku-4-5',   // fast / cheap classification
} as const;

const DEFAULT_MODEL = CLAUDE_MODELS.SONNET;

/**
 * Primary LLM for conversational intake and general tasks.
 */
export const llm = new ChatOpenAI({
  model: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_CHAT,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_CHAT,
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: LLM_DEFAULTS.TIMEOUT_MS,
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: OPENROUTER_HEADERS,
  },
});

/**
 * Streaming LLM for real-time chat responses.
 */
export const streamingLLM = new ChatOpenAI({
  model: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_CHAT,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_CHAT,
  apiKey: process.env.OPENROUTER_API_KEY,
  streaming: true,
  timeout: LLM_DEFAULTS.TIMEOUT_MS,
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: OPENROUTER_HEADERS,
  },
});

/**
 * Deterministic LLM for structured data extraction. Temperature 0.2 for
 * consistent, repeatable outputs (Claude performs better at 0.2 than 0).
 */
export const extractionLLM = new ChatOpenAI({
  model: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_STRUCTURED,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_EXTRACTION,
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: LLM_DEFAULTS.TIMEOUT_MS,
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: OPENROUTER_HEADERS,
  },
});

/**
 * Standard LLM for structured output (agents).
 */
export const structuredLLM = new ChatOpenAI({
  model: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_STRUCTURED,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_EXTRACTION,
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: LLM_DEFAULTS.TIMEOUT_MS,
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: OPENROUTER_HEADERS,
  },
});

/**
 * Cost-effective LLM for simple tasks. Haiku for 60-70% savings on
 * classification, validation, simple Q&A, and response analysis.
 */
export const cheapLLM = new ChatOpenAI({
  model: CLAUDE_MODELS.HAIKU,
  temperature: LLM_DEFAULTS.TEMPERATURE_CHAT,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_CHEAP,
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: LLM_DEFAULTS.TIMEOUT_MS,
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: OPENROUTER_HEADERS,
  },
});

/**
 * Create a structured agent with Claude (via OpenRouter).
 */
export function createClaudeAgent<T extends z.ZodType>(
  schema: T,
  name: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: keyof typeof CLAUDE_MODELS;
  } = {},
) {
  const {
    temperature = 0.2,
    maxTokens = 4000,
    model = 'SONNET',
  } = options;

  const handle = new ChatOpenAI({
    model: CLAUDE_MODELS[model],
    temperature,
    maxTokens,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: OPENROUTER_HEADERS,
    },
  });

  return handle.withStructuredOutput(schema, { name });
}
