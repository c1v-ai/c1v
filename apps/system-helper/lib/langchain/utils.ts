import { AIMessage, HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import type { Message } from 'ai';

/**
 * Convert Vercel AI SDK message format to LangChain message format
 * Used when passing messages from frontend to LangChain agents
 */
export function convertVercelMessageToLangChainMessage(message: Message): BaseMessage {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    return new SystemMessage(message.content);
  }
}

/**
 * Convert array of Vercel messages to LangChain messages
 */
export function convertVercelMessagesToLangChain(messages: Message[]): BaseMessage[] {
  return messages.map(convertVercelMessageToLangChainMessage);
}

/**
 * Convert LangChain message format to Vercel AI SDK message format
 * Used when returning LangChain agent responses to frontend
 */
export function convertLangChainMessageToVercelMessage(message: BaseMessage): Message {
  const messageType = message._getType();

  if (messageType === 'human') {
    return {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.content as string,
    };
  } else if (messageType === 'ai') {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: message.content as string,
    };
  } else {
    return {
      id: crypto.randomUUID(),
      role: 'system',
      content: message.content as string,
    };
  }
}

/**
 * Convert array of LangChain messages to Vercel messages
 */
export function convertLangChainMessagesToVercel(messages: BaseMessage[]): Message[] {
  return messages.map(convertLangChainMessageToVercelMessage);
}

/**
 * Extract conversation history as formatted string
 * Useful for including in prompts
 */
export function formatConversationHistory(messages: BaseMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg._getType() === 'human' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * Count approximate tokens in text
 * Simple heuristic: ~4 characters per token
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
