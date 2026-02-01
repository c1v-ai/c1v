'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ThinkingMessage } from '@/lib/education/knowledge-bank';

/**
 * ThinkingState Component
 *
 * Displays animated thinking messages during AI processing. Cycles through
 * an array of educational messages, showing a prominent headline with a
 * secondary educational tip. A pulsing dot animation indicates activity.
 */
export interface ThinkingStateProps {
  /** Array of messages to cycle through. */
  messages: ThinkingMessage[];
  /** Optional additional class names. */
  className?: string;
}

export function ThinkingState({ messages, className }: ThinkingStateProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const currentMessage = messages[activeIndex];

  const advanceMessage = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % messages.length);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setTimeout(advanceMessage, currentMessage.duration);
    return () => clearTimeout(timer);
  }, [activeIndex, advanceMessage, currentMessage, messages.length]);

  if (messages.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3',
        className,
      )}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
      role="status"
      aria-live="polite"
      aria-label="AI is processing"
    >
      {/* Pulsing dot indicator */}
      <span
        className="mt-1.5 block h-2.5 w-2.5 flex-shrink-0 rounded-full animate-pulse"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        {/* Headline */}
        <p
          className="text-sm font-medium leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentMessage.headline}
        </p>

        {/* Educational tip */}
        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: 'var(--text-secondary, var(--muted-foreground))' }}
        >
          {currentMessage.tip}
        </p>
      </div>
    </div>
  );
}
