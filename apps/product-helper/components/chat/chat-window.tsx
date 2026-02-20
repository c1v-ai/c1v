'use client';

import React, { type FormEvent, type ReactNode, useRef, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Message, useChat } from 'ai/react';
import { toast } from 'sonner';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingState } from '@/components/education/thinking-state';
import { generalThinkingMessages } from '@/lib/education/knowledge-bank';
import type { ArtifactPhase } from '@/lib/langchain/graphs/types';

/**
 * Chat Messages Container
 * Displays all messages in the conversation
 */
export interface ChatMessagesProps {
  messages: Message[];
  emptyStateComponent?: ReactNode;
  aiEmoji?: string;
  isLoading?: boolean;
  className?: string;
  currentPhase?: ArtifactPhase;
}

export function ChatMessages({
  messages,
  emptyStateComponent,
  aiEmoji,
  isLoading,
  className,
  currentPhase,
}: ChatMessagesProps) {
  if (messages.length === 0) {
    return <div className="flex h-full items-center justify-center">{emptyStateComponent}</div>;
  }

  return (
    <div className={cn(
      'flex w-full flex-col',
      'gap-3 pb-4', // Mobile-first: smaller gap
      'md:gap-4', // Desktop: larger spacing
      className
    )}>
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          aiEmoji={aiEmoji}
          currentPhase={currentPhase}
        />
      ))}
      {isLoading && (
        <ThinkingState messages={generalThinkingMessages} />
      )}
    </div>
  );
}

/**
 * Chat Layout
 * Provides the overall structure for the chat interface
 * Uses simple flex layout with auto-scroll to bottom
 */
export interface ChatLayoutProps {
  content: ReactNode;
  footer: ReactNode;
  /** Number of messages for auto-scroll tracking */
  messageCount?: number;
}

export function ChatLayout({ content, footer, messageCount = 0 }: ChatLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Auto-scroll only when new messages are added AND user is near bottom
  useEffect(() => {
    // Only auto-scroll when messages are added, not on every render
    if (messageCount > prevMessageCountRef.current) {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

        // Scroll if user was near bottom OR this is the first messages
        if (isNearBottom || prevMessageCountRef.current === 0) {
          scrollToBottom('instant');
        }
      }
      prevMessageCountRef.current = messageCount;
    }
  }, [messageCount, scrollToBottom]);

  // Handle virtual keyboard on iOS - scroll to bottom when keyboard appears
  useEffect(() => {
    if (typeof window !== 'undefined' && 'visualViewport' in window) {
      const viewport = window.visualViewport;
      const handleResize = () => {
        // Scroll to bottom when keyboard appears (viewport shrinks)
        scrollToBottom('instant');
      };
      viewport?.addEventListener('resize', handleResize);
      return () => viewport?.removeEventListener('resize', handleResize);
    }
  }, [scrollToBottom]);

  // Track scroll position to show/hide scroll button
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable messages area - mobile optimized */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto",
          "py-3 px-3", // Mobile-first: tighter padding
          "md:py-4 md:px-4", // Desktop: more padding
          "overscroll-contain" // Prevent scroll chaining on mobile
        )}
      >
        {content}
      </div>

      {/* Fixed footer with input - mobile optimized */}
      <div
        className={cn(
          "flex-shrink-0 border-t bg-[var(--bg-primary)]",
          "px-3 pt-2", // Horizontal and top padding
          "md:px-4", // Desktop: more horizontal padding
          "chat-footer-safe" // Combined: visual + BottomNav clearance + safe area
        )}
        style={{ borderColor: 'var(--border)' }}
      >
        {showScrollButton && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "mx-auto mb-2 gap-2 flex",
              "min-h-[44px]", // Touch target
              "tap-highlight-none"
            )}
            onClick={() => scrollToBottom('smooth')}
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <ArrowDown className="h-4 w-4" />
            <span>Scroll to bottom</span>
          </Button>
        )}
        {footer}
      </div>
    </div>
  );
}

/**
 * Chat Window Component
 * Main chat interface with message history and input
 * Integrates with Vercel AI SDK for streaming responses
 */
export interface ChatWindowProps {
  /** API endpoint for chat (e.g., '/api/chat') */
  endpoint: string;
  /** Component to show when there are no messages */
  emptyStateComponent: ReactNode;
  /** Placeholder text for input field */
  placeholder?: string;
  /** Emoji to display for AI messages */
  emoji?: string;
  /** Project ID for saving messages and triggering extraction */
  projectId?: number;
  /** Additional chat configuration */
  chatOptions?: {
    /** Initial messages to display */
    initialMessages?: Message[];
    /** Headers to include with requests */
    headers?: Record<string, string>;
    /** Additional body data to send with each request */
    body?: Record<string, any>;
  };
}

export function ChatWindow({
  endpoint,
  emptyStateComponent,
  placeholder = "Ask me anything about your PRD...",
  emoji = "🤖",
  projectId,
  chatOptions = {},
}: ChatWindowProps) {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState<ArtifactPhase | null>(null);
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  // Initialize chat with Vercel AI SDK
  const chat = useChat({
    api: endpoint,
    initialMessages: chatOptions.initialMessages,
    headers: chatOptions.headers,
    body: chatOptions.body,
    streamMode: 'text',
    onResponse: (response) => {
      if (response.status === 402) {
        toast.error('Free credits used up', {
          description: 'Upgrade your plan to continue using AI features.',
          action: { label: 'Upgrade', onClick: () => router.push('/pricing') },
        });
        return;
      }
      const phase = response.headers.get('X-Current-Phase') as ArtifactPhase | null;
      if (phase) setCurrentPhase(phase);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Error while processing your request', {
        description: error.message,
      });
    },
    onFinish: async (message) => {
      console.log('Message finished:', message);

      // Save assistant message and trigger extraction if projectId is provided
      if (projectId && message.role === 'assistant') {
        try {
          const response = await fetch(`/api/chat/projects/${projectId}/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: message.content,
              role: 'assistant',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save message');
          }

          const data = await response.json();

          // Show notification if data was extracted
          if (data.extracted) {
            toast.success('Data Extracted!', {
              description: `Project is now ${data.completeness}% complete`,
            });
          }
        } catch (error) {
          console.error('Error saving message:', error);
          // Don't show error toast - saving is background operation
        }
      }
    },
  });

  // Parse stream status markers from streaming content to drive ThinkingState
  useEffect(() => {
    if (!chat.isLoading) {
      setCurrentNode(null);
      return;
    }

    const lastMsg = chat.messages[chat.messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;

    const markers = [...lastMsg.content.matchAll(/<!--status:(.*?)-->/g)];
    if (markers.length > 0) {
      try {
        const latest = JSON.parse(markers[markers.length - 1][1]);
        setCurrentNode(latest.node);
        if (latest.phase) setCurrentPhase(latest.phase);
      } catch { /* malformed marker, skip */ }
    }
  }, [chat.messages, chat.isLoading]);

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chat.isLoading || !chat.input.trim()) return;
    chat.handleSubmit(e);
  };

  return (
    <ChatLayout
      messageCount={chat.messages.length}
      content={
        <ChatMessages
          messages={chat.messages}
          emptyStateComponent={emptyStateComponent}
          aiEmoji={emoji}
          isLoading={chat.isLoading}
          currentPhase={currentPhase ?? undefined}
        />
      }
      footer={
        <ChatInput
          value={chat.input}
          onChange={chat.handleInputChange}
          onSubmit={handleSubmit}
          onStop={chat.stop}
          loading={chat.isLoading}
          placeholder={placeholder}
        />
      }
    />
  );
}

/**
 * Empty State Component
 * Default empty state when no messages exist
 */
export function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div
        className="text-6xl"
        role="img"
        aria-label="Robot emoji"
      >
        🤖
      </div>
      <div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Start a conversation
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Ask me anything to get started!
        </p>
      </div>
    </div>
  );
}
