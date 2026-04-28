'use client';

import { useState } from 'react';
import type { Message } from 'ai';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { DiagramPopup } from './diagram-popup';
import { DecisionQuestionCard } from './decision-question-card';
import {
  decodeGapMarker,
  stripGapMarker,
} from '@/lib/langchain/engines/surface-gap';
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
  /**
   * Called when the user clicks an option in a G7 decision-question card.
   * Receives the slash-command string (e.g. `/option 2`); parent forwards
   * to the chat stream's `append()`. Optional — when omitted the card's
   * option buttons no-op.
   */
  onGapOptionSelect?: (command: string) => void;
  /**
   * When false, the decision-question card's buttons are disabled (e.g.
   * the parent detected that this gap was already answered in a later
   * message). Default true.
   */
  gapEnabled?: boolean;
}

export function ChatMessageBubble({
  message,
  aiEmoji,
  sources,
  isLoading = false,
  currentPhase,
  onGapOptionSelect,
  gapEnabled = true,
}: ChatMessageBubbleProps) {
  const [activeDiagram, setActiveDiagram] = useState<string | null>(null);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // G7: decode gap marker (if any) before rendering.
  const gapPayload = isAssistant ? decodeGapMarker(message.content) : null;

  // Strip stream status markers injected by LangGraph handler + the G7
  // gap marker so the option card is the sole affordance.
  const displayContent = gapPayload
    ? stripGapMarker(message.content).replace(/<!--status:.*?-->\n?/g, '')
    : message.content.replace(/<!--status:.*?-->\n?/g, '');

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
        <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card">
          {aiEmoji ? (
            <span className="text-lg">{aiEmoji}</span>
          ) : (
            <Bot className="h-4 w-4 text-primary" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-3',
          isUser
            ? 'rounded-br-sm bg-primary/10 text-foreground border border-primary/20 dark:bg-primary/15 dark:border-primary/25'
            : 'rounded-bl-sm bg-card text-foreground border border-border',
        )}
      >
        {/* Message Text */}
        <div className="break-words">
          {isUser ? (
            // User messages: plain text with white-space preserved
            <div className="whitespace-pre-wrap">{displayContent}</div>
          ) : (
            // Assistant messages: rendered markdown with diagram click handler
            <MarkdownRenderer
              content={displayContent}
              onDiagramClick={(syntax) => setActiveDiagram(syntax)}
              currentPhase={currentPhase}
            />
          )}
        </div>

        {/* G7: decision-question card (rendered when message carries a
            <!--c1v-gap:...--> marker) */}
        {gapPayload && (
          <DecisionQuestionCard
            payload={gapPayload}
            onSelect={onGapOptionSelect}
            enabled={gapEnabled}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && isAssistant && (
          <div className="mt-2 flex items-center gap-1">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}

        {/* Sources (if available) */}
        {sources && sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="mb-2 text-sm font-bold">
              Sources:
            </div>
            <div className="space-y-2 text-xs">
              {sources.map((source, i) => (
                <div
                  key={`source-${i}`}
                  className="rounded p-2 bg-background border border-border"
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
        <div className="ml-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
          <User className="h-4 w-4 text-primary-foreground" />
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
      <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card">
        {aiEmoji ? (
          <span className="text-lg">{aiEmoji}</span>
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Loading Message */}
      <div className="max-w-[80%] rounded-xl rounded-bl-sm px-4 py-3 bg-card border border-border">
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
