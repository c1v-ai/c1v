/**
 * Defensive Message Utilities
 *
 * Provides type checking and filtering for LangChain messages that works
 * even when module duplication breaks instanceof checks and static methods.
 *
 * This is a workaround for Turbopack ESM bundling issues where:
 * - AIMessage.isInstance() becomes undefined
 * - _getType() may not exist on duplicated module instances
 *
 * @module lib/langchain/message-utils
 */

import type { BaseMessage } from '@langchain/core/messages';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

export type MessageType = 'human' | 'ai' | 'system' | 'unknown';

/**
 * Defensive type checker that works even with module duplication.
 *
 * Tries multiple strategies in order of reliability:
 * 1. _getType() method (standard LangChain way)
 * 2. Constructor name inspection
 * 3. 'type' property fallback
 *
 * @param msg - BaseMessage to check
 * @returns The message type
 */
export function getMessageType(msg: BaseMessage | null | undefined): MessageType {
  if (!msg) return 'unknown';

  // Strategy 1: Try _getType() first (most reliable when it works)
  try {
    if (typeof msg._getType === 'function') {
      const type = msg._getType();
      if (type === 'human' || type === 'ai' || type === 'system') {
        return type;
      }
    }
  } catch {
    // Method doesn't exist or failed, continue to fallbacks
  }

  // Strategy 2: Check constructor name
  try {
    const constructorName = msg.constructor?.name?.toLowerCase() || '';
    if (constructorName.includes('human')) return 'human';
    if (constructorName.includes('ai') && !constructorName.includes('chain')) return 'ai';
    if (constructorName.includes('system')) return 'system';
  } catch {
    // Constructor access failed, continue to fallbacks
  }

  // Strategy 3: Check for 'type' property (some serialized messages have this)
  try {
    if ('type' in msg && typeof (msg as Record<string, unknown>).type === 'string') {
      const type = (msg as Record<string, unknown>).type as string;
      if (type === 'human' || type === 'ai' || type === 'system') {
        return type;
      }
    }
  } catch {
    // Property access failed
  }

  // Strategy 4: Check for lc_id (LangChain serialization metadata)
  try {
    const lcId = (msg as unknown as Record<string, unknown>).lc_id;
    if (Array.isArray(lcId)) {
      const idStr = lcId.join(',').toLowerCase();
      if (idStr.includes('human')) return 'human';
      if (idStr.includes('ai')) return 'ai';
      if (idStr.includes('system')) return 'system';
    }
  } catch {
    // lc_id access failed
  }

  return 'unknown';
}

/**
 * Check if a message is an AI message
 */
export function isAIMessage(msg: BaseMessage | null | undefined): boolean {
  return getMessageType(msg) === 'ai';
}

/**
 * Check if a message is a Human message
 */
export function isHumanMessage(msg: BaseMessage | null | undefined): boolean {
  return getMessageType(msg) === 'human';
}

/**
 * Check if a message is a System message
 */
export function isSystemMessage(msg: BaseMessage | null | undefined): boolean {
  return getMessageType(msg) === 'system';
}

/**
 * Filter messages to only AI messages
 */
export function filterAIMessages(messages: BaseMessage[]): BaseMessage[] {
  return messages.filter(m => isAIMessage(m));
}

/**
 * Filter messages to only Human messages
 */
export function filterHumanMessages(messages: BaseMessage[]): BaseMessage[] {
  return messages.filter(m => isHumanMessage(m));
}

/**
 * Filter messages to only System messages
 */
export function filterSystemMessages(messages: BaseMessage[]): BaseMessage[] {
  return messages.filter(m => isSystemMessage(m));
}

/**
 * Get the last AI message from a list
 */
export function getLastAIMessage(messages: BaseMessage[]): BaseMessage | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isAIMessage(messages[i])) {
      return messages[i];
    }
  }
  return null;
}

/**
 * Get the last Human message from a list
 */
export function getLastHumanMessage(messages: BaseMessage[]): BaseMessage | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isHumanMessage(messages[i])) {
      return messages[i];
    }
  }
  return null;
}

/**
 * Safely extract content from a message
 */
export function getMessageContent(msg: BaseMessage | null | undefined): string {
  if (!msg) return '';

  try {
    if (typeof msg.content === 'string') {
      return msg.content;
    }
    if (Array.isArray(msg.content)) {
      // Handle content array (multimodal messages)
      return msg.content
        .map(c => {
          if (typeof c === 'string') return c;
          if (typeof c === 'object' && c !== null && 'text' in c) {
            return (c as { text: string }).text;
          }
          return '';
        })
        .join('');
    }
    return JSON.stringify(msg.content);
  } catch {
    return '';
  }
}

/**
 * Debug utility: Get diagnostic info about a message
 * Useful for debugging bundling issues
 */
export function getMessageDiagnostics(msg: BaseMessage | null | undefined): Record<string, unknown> {
  if (!msg) {
    return { exists: false };
  }

  const diagnostics: Record<string, unknown> = {
    exists: true,
    hasGetType: typeof msg._getType === 'function',
    constructorName: msg.constructor?.name || 'unknown',
    contentType: typeof msg.content,
    contentLength: typeof msg.content === 'string' ? msg.content.length : 'N/A',
  };

  try {
    diagnostics.getTypeResult = typeof msg._getType === 'function' ? msg._getType() : 'method missing';
  } catch (e) {
    diagnostics.getTypeResult = `error: ${e}`;
  }

  // Check for isInstance on the class
  try {
    diagnostics.AIMessage_isInstance_exists = typeof (AIMessage as unknown as { isInstance?: unknown }).isInstance === 'function';
    diagnostics.HumanMessage_isInstance_exists = typeof (HumanMessage as unknown as { isInstance?: unknown }).isInstance === 'function';
  } catch {
    diagnostics.isInstance_check_failed = true;
  }

  return diagnostics;
}
