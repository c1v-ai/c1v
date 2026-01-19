'use client';

import React, { type FormEvent, type ReactNode, useEffect, useRef } from 'react';
import { type Message, useChat } from 'ai/react';
import { toast } from 'sonner';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { ChatMessageBubble, ChatLoadingBubble } from './chat-message-bubble';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export function ChatMessages({
  messages,
  emptyStateComponent,
  aiEmoji,
  isLoading,
  className,
}: ChatMessagesProps) {
  if (messages.length === 0) {
    return <div className="flex h-full items-center justify-center">{emptyStateComponent}</div>;
  }

  return (
    <div className={cn('flex w-full flex-col pb-4', className)}>
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          aiEmoji={aiEmoji}
        />
      ))}
      {isLoading && <ChatLoadingBubble aiEmoji={aiEmoji} />}
    </div>
  );
}

/**
 * Scroll to Bottom Button
 * Shows when user scrolls up, allows quick return to latest message
 */
function ScrollToBottomButton({ className }: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('gap-2', className)}
      onClick={() => scrollToBottom()}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <ArrowDown className="h-4 w-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

/**
 * Sticky to Bottom Content Wrapper
 * Manages scroll behavior to keep chat at bottom during new messages
 */
interface StickyToBottomContentProps {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

function StickyToBottomContent({
  content,
  footer,
  className,
  contentClassName,
}: StickyToBottomContentProps) {
  const context = useStickToBottomContext();

  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7246/ingest/17309ef6-212e-49ae-b11e-d63578000a1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat-window.tsx:93',message:'StickyToBottomContent render',data:{hasScrollRef:!!context.scrollRef,hasContentRef:!!context.contentRef,className,layoutType:'flex flex-col'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      
      // Log scrollRef dimensions after mount
      setTimeout(() => {
        const scrollEl = context.scrollRef?.current;
        const contentEl = context.contentRef?.current;
        if (scrollEl) {
          const scrollRect = scrollEl.getBoundingClientRect();
          const scrollStyle = window.getComputedStyle(scrollEl);
          fetch('http://127.0.0.1:7246/ingest/17309ef6-212e-49ae-b11e-d63578000a1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat-window.tsx:100',message:'scrollRef element dimensions',data:{scrollHeight:scrollEl.scrollHeight,clientHeight:scrollEl.clientHeight,offsetHeight:scrollEl.offsetHeight,width:scrollRect.width,height:scrollRect.height,display:scrollStyle.display,overflow:scrollStyle.overflow},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        if (contentEl) {
          const contentRect = contentEl.getBoundingClientRect();
          fetch('http://127.0.0.1:7246/ingest/17309ef6-212e-49ae-b11e-d63578000a1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat-window.tsx:103',message:'contentRef element dimensions',data:{scrollHeight:contentEl.scrollHeight,clientHeight:contentEl.clientHeight,offsetHeight:contentEl.offsetHeight,width:contentRect.width,height:contentRect.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
      }, 100);
    }
  }, [context.scrollRef, context.contentRef, className]);
  // #endregion

  return (
    <div
      ref={context.scrollRef as unknown as React.RefObject<HTMLDivElement>}
      style={{ width: '100%', height: '100%' }}
      className={cn('grid grid-rows-[1fr,auto]', className)}
    >
      <div
        ref={context.contentRef as unknown as React.RefObject<HTMLDivElement>}
        className={contentClassName}
      >
        {content}
      </div>
      {footer}
    </div>
  );
}

/**
 * Chat Layout
 * Provides the overall structure for the chat interface
 */
export interface ChatLayoutProps {
  content: ReactNode;
  footer: ReactNode;
}

export function ChatLayout({ content, footer }: ChatLayoutProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // #region agent log
  useEffect(() => {
    if (wrapperRef.current && typeof window !== 'undefined') {
      const el = wrapperRef.current;
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      fetch('http://127.0.0.1:7246/ingest/17309ef6-212e-49ae-b11e-d63578000a1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat-window.tsx:124',message:'ChatLayout wrapper dimensions',data:{width:rect.width,height:rect.height,top:rect.top,bottom:rect.bottom,position:computedStyle.position,display:computedStyle.display,viewportHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
    }
  });
  // #endregion

  return (
    <div 
      ref={wrapperRef}
      className="absolute inset-0 flex flex-col"
    >
      <StickToBottom resize="smooth" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <StickyToBottomContent
          contentClassName="py-4 px-4"
          content={content}
          footer={
            <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-[var(--bg-primary)]">
              <ScrollToBottomButton className="mx-auto mb-2" />
              {footer}
            </div>
          }
        />
      </StickToBottom>
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
  // Initialize chat with Vercel AI SDK
  const chat = useChat({
    api: endpoint,
    initialMessages: chatOptions.initialMessages,
    headers: chatOptions.headers,
    body: chatOptions.body,
    streamMode: 'text',
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

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chat.isLoading || !chat.input.trim()) return;
    chat.handleSubmit(e);
  };

  return (
    <ChatLayout
      content={
        <ChatMessages
          messages={chat.messages}
          emptyStateComponent={emptyStateComponent}
          aiEmoji={emoji}
          isLoading={chat.isLoading}
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
