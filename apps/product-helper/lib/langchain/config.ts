import { ChatOpenAI } from '@langchain/openai';

/**
 * Primary LLM for conversational intake and general tasks
 * Uses GPT-4 Turbo for high-quality responses
 */
export const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Streaming LLM for real-time chat responses
 * Same model but with streaming enabled
 */
export const streamingLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Deterministic LLM for structured data extraction
 * Temperature 0 for consistent, repeatable outputs
 */
export const extractionLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0,
  maxTokens: 3000,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Cost-effective LLM for simple tasks
 * Use for validation, simple Q&A, etc.
 */
export const cheapLLM = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  openAIApiKey: process.env.OPENAI_API_KEY,
});
