import { ChatAnthropic } from '@langchain/anthropic';
import type { z } from 'zod';

// Model options
export const CLAUDE_MODELS = {
  OPUS: 'claude-opus-4-5-20251101',      // Most capable, highest cost
  SONNET: 'claude-sonnet-4-5-20250514',  // Balanced (recommended)
} as const;

// Default model for agents
const DEFAULT_MODEL = CLAUDE_MODELS.SONNET;

/**
 * Primary LLM for conversational intake and general tasks
 * Uses Claude Sonnet 4.5 for high-quality responses
 */
export const llm = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 2000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

/**
 * Streaming LLM for real-time chat responses
 * Same model but with streaming enabled
 */
export const streamingLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 2000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  streaming: true,
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

/**
 * Deterministic LLM for structured data extraction
 * Temperature 0.2 for consistent, repeatable outputs (Claude performs better with 0.2 than 0)
 */
export const extractionLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.2,
  maxTokens: 4000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

/**
 * Standard LLM for structured output (agents)
 */
export const structuredLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.2,
  maxTokens: 4000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

/**
 * Cost-effective LLM for simple tasks
 * Use for validation, simple Q&A, etc.
 * Note: Using Sonnet for all tasks as Claude doesn't have a cheaper tier like GPT-3.5
 */
export const cheapLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 1000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30000, // 30 second timeout to prevent hanging requests
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
