'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GapMarkerPayload } from '@/lib/langchain/engines/surface-gap';

/**
 * DecisionQuestionCard — G7 gap-fill UI.
 *
 * Renders the three top-ranked engine-computed options as clickable
 * buttons plus a collapsible math-trace explainer. Mounted beneath the
 * assistant message body whenever ChatMessageBubble detects a
 * `<!--c1v-gap:...-->` marker in the message content.
 *
 * Behaviour: clicking an option button invokes `onSelect` which the
 * parent wires to the chat stream's `append()` — sending the encoded
 * option selection (e.g. `/option 2`) back into the thread. The chat API
 * route then parses that via `parseGapAnswer()` and resolves the pending
 * gap registered by `surfaceGap()`.
 *
 * Free-text answers need no special affordance here — the user just types
 * in the normal chat input.
 */
export interface DecisionQuestionCardProps {
  payload: GapMarkerPayload;
  /**
   * Called when the user selects an option. The string argument is the
   * one-indexed slash command (`/option 1`, `/option 2`, ...); the parent
   * sends it to the chat stream.
   */
  onSelect?: (command: string) => void;
  /**
   * When false, disables the buttons (e.g. this gap has already been
   * answered in a later message). Parent computes this by scanning
   * subsequent messages.
   */
  enabled?: boolean;
}

export function DecisionQuestionCard({
  payload,
  onSelect,
  enabled = true,
}: DecisionQuestionCardProps) {
  // Intentionally stateless — the math-trace explainer uses the native
  // <details>/<summary> element so the browser manages the open/close
  // affordance without a React hook. Keeping the component hook-free lets
  // us exercise it as a pure function in tests (see
  // __tests__/decision-question-card.test.tsx) without pulling in jsdom.
  return (
    <div
      className="mt-3 space-y-2 border-t border-border pt-3"
      data-testid="decision-question-card"
      data-decision-id={payload.decisionId}
    >
      {/* Computed-option buttons */}
      {payload.computedOptions.length > 0 ? (
        <div className="space-y-2">
          {payload.computedOptions.map((opt, i) => {
            const units = opt.units ? ` ${opt.units}` : '';
            const command = `/option ${i + 1}`;
            return (
              <button
                key={`opt-${i}`}
                type="button"
                disabled={!enabled}
                onClick={() => onSelect?.(command)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md border border-border bg-card px-3 py-2 text-left text-sm',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  enabled
                    ? 'hover:border-primary hover:bg-primary/5'
                    : 'opacity-60 cursor-not-allowed',
                )}
                aria-label={`Select option ${i + 1}: ${opt.value}${units}`}
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="font-medium text-foreground">
                    {opt.value}
                    {units}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    confidence {opt.confidence.toFixed(2)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {opt.rationale}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No computed options available — please provide a value.
        </p>
      )}

      {/* Math-trace explainer — native <details> for zero-state collapse */}
      <details
        className="group"
        aria-controls={`math-trace-${payload.decisionId}`}
      >
        <summary
          className={cn(
            'flex w-full cursor-pointer list-none items-center gap-1 rounded-md px-1 py-1 text-xs text-muted-foreground',
            'transition-colors duration-150 hover:text-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          )}
        >
          <ChevronDown
            className="h-3 w-3 transition-transform duration-200 group-open:rotate-180"
          />
          Why this value?
        </summary>
        <pre
          id={`math-trace-${payload.decisionId}`}
          data-testid="math-trace"
          className="mt-2 overflow-x-auto rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground"
        >
          {payload.mathTrace}
        </pre>
      </details>
    </div>
  );
}
