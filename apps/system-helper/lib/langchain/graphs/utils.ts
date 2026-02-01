import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

/**
 * LangGraph Utility Functions for Product-Helper Intake System
 *
 * This module provides utility functions for message handling, token estimation,
 * and history management in the LangGraph-based intake workflow.
 *
 * @module graphs/utils
 */

// ============================================================
// Constants
// ============================================================

/**
 * Default maximum tokens for context window management
 * Based on GPT-4 Turbo's context window
 */
export const DEFAULT_MAX_TOKENS = 8000;

/**
 * Average characters per token (rough estimate)
 * Used for quick token estimation without calling tokenizer
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Maximum turns before forcing conversation end
 * Prevents infinite conversation loops
 */
export const MAX_CONVERSATION_TURNS = 50;

// ============================================================
// Message Formatting Functions
// ============================================================

/**
 * Format messages as text for extraction prompts
 * Converts LangChain message objects to a readable string format
 *
 * @param messages - Array of LangChain messages
 * @returns Formatted string with role prefixes
 *
 * @example
 * ```typescript
 * const text = formatMessagesAsText(messages);
 * // Output:
 * // User: What does the app do?
 * //
 * // Assistant: It's a task management tool.
 * ```
 */
export function formatMessagesAsText(messages: BaseMessage[]): string {
  return messages
    .map(m => {
      const role = getMessageRole(m);
      const content = getMessageContent(m);
      return `${role}: ${content}`;
    })
    .join('\n\n');
}

/**
 * Format messages as markdown for display
 * Includes styling hints for different message types
 *
 * @param messages - Array of LangChain messages
 * @returns Markdown-formatted string
 */
export function formatMessagesAsMarkdown(messages: BaseMessage[]): string {
  return messages
    .map(m => {
      const role = getMessageRole(m);
      const content = getMessageContent(m);
      const prefix = role === 'User' ? '**User:**' : '_Assistant:_';
      return `${prefix} ${content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Get the role label for a message
 *
 * @param message - LangChain message
 * @returns Role label string
 */
export function getMessageRole(message: BaseMessage): string {
  const type = message._getType();
  switch (type) {
    case 'human':
      return 'User';
    case 'ai':
      return 'Assistant';
    case 'system':
      return 'System';
    default:
      return 'Unknown';
  }
}

/**
 * Get the content from a message safely
 * Handles cases where content might be an array of content parts
 *
 * @param message - LangChain message
 * @returns String content
 */
export function getMessageContent(message: BaseMessage): string {
  const content = message.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') {
          return part;
        }
        if (typeof part === 'object' && 'text' in part) {
          return part.text;
        }
        return '';
      })
      .join('');
  }

  return String(content);
}

// ============================================================
// Message Selection Functions
// ============================================================

/**
 * Get last N messages from history
 * Useful for providing context without exceeding token limits
 *
 * @param messages - Full message array
 * @param n - Number of recent messages to return
 * @returns Array of last N messages
 *
 * @example
 * ```typescript
 * const recentMessages = getRecentMessages(messages, 10);
 * // Returns up to 10 most recent messages
 * ```
 */
export function getRecentMessages(messages: BaseMessage[], n: number): BaseMessage[] {
  if (n <= 0) {
    return [];
  }
  return messages.slice(-n);
}

/**
 * Get messages from a specific role
 *
 * @param messages - Full message array
 * @param role - The role to filter by ('human', 'ai', 'system')
 * @returns Filtered message array
 */
export function getMessagesByRole(
  messages: BaseMessage[],
  role: 'human' | 'ai' | 'system'
): BaseMessage[] {
  return messages.filter(m => m._getType() === role);
}

/**
 * Get the last message from the conversation
 *
 * @param messages - Full message array
 * @returns The last message or undefined if empty
 */
export function getLastMessage(messages: BaseMessage[]): BaseMessage | undefined {
  return messages[messages.length - 1];
}

/**
 * Get the last user (human) message
 *
 * @param messages - Full message array
 * @returns The last human message or undefined
 */
export function getLastUserMessage(messages: BaseMessage[]): BaseMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]._getType() === 'human') {
      return messages[i];
    }
  }
  return undefined;
}

/**
 * Get the last assistant (AI) message
 *
 * @param messages - Full message array
 * @returns The last AI message or undefined
 */
export function getLastAssistantMessage(messages: BaseMessage[]): BaseMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]._getType() === 'ai') {
      return messages[i];
    }
  }
  return undefined;
}

// ============================================================
// Token Estimation Functions
// ============================================================

/**
 * Estimate tokens in a text string
 * Uses character count heuristic (roughly 4 chars per token)
 *
 * @param text - The text to estimate
 * @returns Estimated token count
 *
 * @example
 * ```typescript
 * const tokens = estimateTokens("Hello world!");
 * // Returns approximately 3
 * ```
 */
export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens in a message
 * Includes overhead for message structure
 *
 * @param message - LangChain message
 * @returns Estimated token count
 */
export function estimateMessageTokens(message: BaseMessage): number {
  const content = getMessageContent(message);
  // Add overhead for message structure (role, formatting)
  const structureOverhead = 4;
  return estimateTokens(content) + structureOverhead;
}

/**
 * Estimate total tokens for an array of messages
 *
 * @param messages - Array of messages
 * @returns Total estimated token count
 */
export function estimateTotalTokens(messages: BaseMessage[]): number {
  return messages.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
}

// ============================================================
// History Truncation Functions
// ============================================================

/**
 * Truncate message history to fit within token limit
 * Keeps most recent messages, preserving conversation flow
 *
 * @param messages - Full message array
 * @param maxTokens - Maximum tokens allowed (default: 8000)
 * @returns Truncated message array
 *
 * @example
 * ```typescript
 * const truncated = truncateHistory(messages, 4000);
 * // Returns messages that fit within 4000 tokens
 * ```
 */
export function truncateHistory(
  messages: BaseMessage[],
  maxTokens: number = DEFAULT_MAX_TOKENS
): BaseMessage[] {
  if (messages.length === 0) {
    return [];
  }

  let totalTokens = 0;
  const result: BaseMessage[] = [];

  // Keep most recent messages that fit
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const tokens = estimateMessageTokens(msg);

    if (totalTokens + tokens > maxTokens) {
      break;
    }

    result.unshift(msg);
    totalTokens += tokens;
  }

  return result;
}

/**
 * Truncate history but always keep the first (system) message
 *
 * @param messages - Full message array
 * @param maxTokens - Maximum tokens allowed
 * @returns Truncated array with system message preserved
 */
export function truncateHistoryKeepSystem(
  messages: BaseMessage[],
  maxTokens: number = DEFAULT_MAX_TOKENS
): BaseMessage[] {
  if (messages.length === 0) {
    return [];
  }

  // Check if first message is a system message
  const firstMessage = messages[0];
  const isSystemFirst = firstMessage._getType() === 'system';

  if (!isSystemFirst) {
    return truncateHistory(messages, maxTokens);
  }

  // Reserve tokens for system message
  const systemTokens = estimateMessageTokens(firstMessage);
  const remainingTokens = maxTokens - systemTokens;

  if (remainingTokens <= 0) {
    return [firstMessage];
  }

  // Truncate the rest
  const restMessages = messages.slice(1);
  const truncatedRest = truncateHistory(restMessages, remainingTokens);

  return [firstMessage, ...truncatedRest];
}

/**
 * Smart truncation that preserves conversation coherence
 * Removes messages in pairs (user + assistant) to maintain context
 *
 * @param messages - Full message array
 * @param maxTokens - Maximum tokens allowed
 * @returns Truncated array with conversation pairs intact
 */
export function truncateHistoryPreservePairs(
  messages: BaseMessage[],
  maxTokens: number = DEFAULT_MAX_TOKENS
): BaseMessage[] {
  if (messages.length === 0) {
    return [];
  }

  // Start from the end and work backwards in pairs
  let totalTokens = 0;
  const result: BaseMessage[] = [];

  let i = messages.length - 1;
  while (i >= 0) {
    // Try to add a pair (or single if at start)
    const current = messages[i];
    const currentTokens = estimateMessageTokens(current);

    // Check if we have a preceding message for a pair
    const hasPreceding = i > 0;
    const preceding = hasPreceding ? messages[i - 1] : null;
    const precedingTokens = preceding ? estimateMessageTokens(preceding) : 0;

    // Calculate tokens for this pair (or single)
    const pairTokens = hasPreceding ? currentTokens + precedingTokens : currentTokens;

    if (totalTokens + pairTokens > maxTokens) {
      break;
    }

    // Add pair or single
    if (hasPreceding && preceding) {
      result.unshift(current);
      result.unshift(preceding);
      i -= 2;
    } else {
      result.unshift(current);
      i -= 1;
    }

    totalTokens += pairTokens;
  }

  return result;
}

// ============================================================
// Message Creation Helpers
// ============================================================

/**
 * Create a human message from text
 *
 * @param content - The message content
 * @returns HumanMessage instance
 */
export function createHumanMessage(content: string): HumanMessage {
  return new HumanMessage(content);
}

/**
 * Create an AI message from text
 *
 * @param content - The message content
 * @returns AIMessage instance
 */
export function createAIMessage(content: string): AIMessage {
  return new AIMessage(content);
}

/**
 * Create a system message from text
 *
 * @param content - The message content
 * @returns SystemMessage instance
 */
export function createSystemMessage(content: string): SystemMessage {
  return new SystemMessage(content);
}

// ============================================================
// Conversation Analysis Functions
// ============================================================

/**
 * Count the number of conversation turns
 * A turn is defined as a user message followed by an assistant response
 *
 * @param messages - Full message array
 * @returns Number of complete turns
 */
export function countConversationTurns(messages: BaseMessage[]): number {
  let turns = 0;
  let lastType: string | null = null;

  for (const message of messages) {
    const currentType = message._getType();

    // Count a turn when we see human -> ai transition
    if (lastType === 'human' && currentType === 'ai') {
      turns++;
    }

    lastType = currentType;
  }

  return turns;
}

/**
 * Check if conversation has reached maximum turns
 *
 * @param messages - Full message array
 * @param maxTurns - Maximum allowed turns (default: 50)
 * @returns True if max turns reached
 */
export function hasReachedMaxTurns(
  messages: BaseMessage[],
  maxTurns: number = MAX_CONVERSATION_TURNS
): boolean {
  return countConversationTurns(messages) >= maxTurns;
}

/**
 * Extract all mentioned entities from messages
 * Simple keyword extraction for context analysis
 *
 * @param messages - Full message array
 * @returns Array of potential entity mentions
 */
export function extractMentionedEntities(messages: BaseMessage[]): string[] {
  const text = formatMessagesAsText(messages);
  const entities: Set<string> = new Set();

  // Extract capitalized words that might be entities
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(capitalizedPattern);

  if (matches) {
    matches.forEach(match => {
      // Filter out common words
      const commonWords = ['User', 'Assistant', 'System', 'The', 'This', 'That', 'Here'];
      if (!commonWords.includes(match)) {
        entities.add(match);
      }
    });
  }

  return Array.from(entities);
}

// ============================================================
// Serialization Functions
// ============================================================

/**
 * Serialize messages for database storage
 * Converts LangChain messages to a storable format
 *
 * @param messages - Array of LangChain messages
 * @returns JSON-serializable array
 */
export function serializeMessages(
  messages: BaseMessage[]
): Array<{ type: string; content: string }> {
  return messages.map(m => ({
    type: m._getType(),
    content: getMessageContent(m),
  }));
}

/**
 * Deserialize messages from database storage
 * Reconstructs LangChain messages from stored format
 *
 * @param serialized - Array of serialized messages
 * @returns Array of LangChain messages
 */
export function deserializeMessages(
  serialized: Array<{ type: string; content: string }>
): BaseMessage[] {
  return serialized.map(m => {
    switch (m.type) {
      case 'human':
        return new HumanMessage(m.content);
      case 'ai':
        return new AIMessage(m.content);
      case 'system':
        return new SystemMessage(m.content);
      default:
        return new HumanMessage(m.content);
    }
  });
}

// ============================================================
// Debug Functions
// ============================================================

/**
 * Create a debug summary of messages
 * Useful for logging and debugging
 *
 * @param messages - Full message array
 * @returns Debug summary string
 */
export function createMessagesSummary(messages: BaseMessage[]): string {
  const totalMessages = messages.length;
  const humanCount = messages.filter(m => m._getType() === 'human').length;
  const aiCount = messages.filter(m => m._getType() === 'ai').length;
  const systemCount = messages.filter(m => m._getType() === 'system').length;
  const totalTokens = estimateTotalTokens(messages);

  return [
    `Messages: ${totalMessages} total`,
    `  Human: ${humanCount}`,
    `  AI: ${aiCount}`,
    `  System: ${systemCount}`,
    `  Est. Tokens: ${totalTokens}`,
    `  Turns: ${countConversationTurns(messages)}`,
  ].join('\n');
}
