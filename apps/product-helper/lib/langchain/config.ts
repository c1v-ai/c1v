import { ChatAnthropic } from '@langchain/anthropic';
import type { z } from 'zod';
import { LLM_DEFAULTS } from '@/lib/constants';

// Model options - Use correct Anthropic API model identifiers
export const CLAUDE_MODELS = {
  OPUS: 'claude-opus-4-20250514',           // Claude Opus 4 - most capable
  SONNET: 'claude-sonnet-4-20250514',       // Claude Sonnet 4 - balanced
  HAIKU: 'claude-3-5-haiku-20241022',       // Claude 3.5 Haiku - fast, cost-effective
} as const;

// Default model for agents
const DEFAULT_MODEL = CLAUDE_MODELS.SONNET;

/**
 * Primary LLM for conversational intake and general tasks
 * Uses Claude Sonnet 4.5 for high-quality responses
 */
export const llm = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_CHAT,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_CHAT,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  clientOptions: { timeout: LLM_DEFAULTS.TIMEOUT_MS },
  // @ts-expect-error - cacheControl is a valid Anthropic option but not in LangChain types yet
  cacheControl: true, // Enable prompt caching for cost savings
});

/**
 * Streaming LLM for real-time chat responses
 * Same model but with streaming enabled
 */
export const streamingLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_CHAT,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_CHAT,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  streaming: true,
  clientOptions: { timeout: LLM_DEFAULTS.TIMEOUT_MS },
  // @ts-expect-error - cacheControl is a valid Anthropic option but not in LangChain types yet
  cacheControl: true, // Enable prompt caching for cost savings
});

/**
 * Deterministic LLM for structured data extraction
 * Temperature 0.2 for consistent, repeatable outputs (Claude performs better with 0.2 than 0)
 */
export const extractionLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_STRUCTURED,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_EXTRACTION,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  clientOptions: { timeout: LLM_DEFAULTS.TIMEOUT_MS },
  // @ts-expect-error - cacheControl is a valid Anthropic option but not in LangChain types yet
  cacheControl: true, // Enable prompt caching for cost savings
});

/**
 * Standard LLM for structured output (agents)
 */
export const structuredLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: LLM_DEFAULTS.TEMPERATURE_STRUCTURED,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_EXTRACTION,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  clientOptions: { timeout: LLM_DEFAULTS.TIMEOUT_MS },
  // @ts-expect-error - cacheControl is a valid Anthropic option but not in LangChain types yet
  cacheControl: true, // Enable prompt caching for cost savings
});

/**
 * Cost-effective LLM for simple tasks
 * Uses Claude 3.5 Haiku for 60-70% cost savings on classification,
 * validation, simple Q&A, and response analysis tasks.
 */
export const cheapLLM = new ChatAnthropic({
  modelName: CLAUDE_MODELS.HAIKU,
  temperature: LLM_DEFAULTS.TEMPERATURE_CHAT,
  maxTokens: LLM_DEFAULTS.MAX_TOKENS_CHEAP,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  clientOptions: { timeout: LLM_DEFAULTS.TIMEOUT_MS },
  // @ts-expect-error - cacheControl is a valid Anthropic option but not in LangChain types yet
  cacheControl: true, // Enable prompt caching for cost savings
});

/**
 * Create a structured agent with Claude
 */
export function createClaudeAgent<T extends z.ZodType>(
  schema: T,
  name: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: keyof typeof CLAUDE_MODELS;
  } = {}
) {
  const {
    temperature = 0.2,
    maxTokens = 4000,
    model = 'SONNET',
  } = options;

  const llm = new ChatAnthropic({
    modelName: CLAUDE_MODELS[model],
    temperature,
    maxTokens,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  return llm.withStructuredOutput(schema, { name });
}
