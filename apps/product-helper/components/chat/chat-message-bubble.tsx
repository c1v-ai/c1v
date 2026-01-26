'use client';

import { useState } from 'react';
import type { Message } from 'ai';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { DiagramPopup } from './diagram-popup';
import { User, Bot } from 'lucide-react';
import type { ArtifactPhase } from '@/lib/langchain/graphs/types';

/**
 * Chat Message Bubble Component
 * Displays individual chat messages with role-based styling
 * Supports markdown rendering for AI responses
 */
export interface ChatMessageBubbleProps {
  message: Message;
  aiEmoji?: string;
  sources?: any[];
  isLoading?: boolean;
  currentPhase?: ArtifactPhase;
}

export function ChatMessageBubble({
  message,
  aiEmoji,
  sources,
  isLoading = false,
  currentPhase,
}: ChatMessageBubbleProps) {
  const [activeDiagram, setActiveDiagram] = useState<string | null>(null);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <>
    <div
      className={cn(
        'mb-6 flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* AI Avatar (left side for assistant) */}
      {isAssistant && (
        <div
          className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          {aiEmoji ? (
            <span className="text-lg">{aiEmoji}</span>
          ) : (
            <Bot className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'rounded-br-sm'
            : 'rounded-bl-sm',
        )}
        style={{
          backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
          color: isUser ? '#FFFFFF' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {/* Message Text */}
        <div className="break-words">
          {isUser ? (
            // User messages: plain text with white-space preserved
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // Assistant messages: rendered markdown with diagram click handler
            <MarkdownRenderer
              content={message.content}
              onDiagramClick={(syntax) => setActiveDiagram(syntax)}
              currentPhase={currentPhase}
            />
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && isAssistant && (
          <div className="mt-2 flex items-center gap-1">
            <div
              className="h-2 w-2 animate-bounce rounded-full"
              style={{
                backgroundColor: 'var(--accent)',
                animationDelay: '0ms',
              }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full"
              style={{
                backgroundColor: 'var(--accent)',
                animationDelay: '150ms',
              }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full"
              style={{
                backgroundColor: 'var(--accent)',
                animationDelay: '300ms',
              }}
            />
          </div>
        )}

        {/* Sources (if available) */}
        {sources && sources.length > 0 && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div
              className="mb-2 text-sm font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              🔍 Sources:
            </div>
            <div className="space-y-2 text-xs">
              {sources.map((source, i) => (
                <div
                  key={`source-${i}`}
                  className="rounded p-2"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="font-bold">
                    {i + 1}. {source.pageContent?.substring(0, 100)}...
                  </div>
                  {source.metadata?.loc?.lines && (
                    <div className="mt-1 text-muted-foreground">
                      Lines {source.metadata.loc.lines.from} to{' '}
                      {source.metadata.loc.lines.to}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar (right side for user) */}
      {isUser && (
        <div
          className="ml-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'var(--accent)',
          }}
        >
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>

    {/* Diagram Popup Modal */}
    {activeDiagram && (
      <DiagramPopup
        isOpen={!!activeDiagram}
        onClose={() => setActiveDiagram(null)}
        syntax={activeDiagram}
      />
    )}
    </>
  );
}

/**
 * Loading Message Component
 * Displays a loading state while waiting for AI response
 */
export function ChatLoadingBubble({ aiEmoji }: { aiEmoji?: string }) {
  return (
    <div className="mb-6 flex w-full justify-start">
      {/* AI Avatar */}
      <div
        className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {aiEmoji ? (
          <span className="text-lg">{aiEmoji}</span>
        ) : (
          <Bot className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        )}
      </div>

      {/* Loading Message */}
      <div
        className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 animate-bounce rounded-full"
            style={{
              backgroundColor: 'var(--accent)',
              animationDelay: '0ms',
            }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full"
            style={{
              backgroundColor: 'var(--accent)',
              animationDelay: '150ms',
            }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full"
            style={{
              backgroundColor: 'var(--accent)',
              animationDelay: '300ms',
            }}
          />
        </div>
      </div>
    </div>
  );
}
