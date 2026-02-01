'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

/**
 * TooltipTerm Component
 *
 * Renders an inline term with a dotted underline. On hover (or focus),
 * displays a concise definition in a tooltip. Designed for embedding
 * educational terminology within chat messages and educational content.
 */
export interface TooltipTermProps {
  /** The term to display inline. */
  term: string;
  /** A concise definition shown in the tooltip (15-word max target). */
  definition: string;
  /** Optional additional class names for the trigger span. */
  className?: string;
}

export function TooltipTerm({ term, definition, className }: TooltipTermProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span
            className={cn(
              'cursor-help border-b border-dotted',
              className,
            )}
            style={{
              borderColor: 'var(--accent)',
              color: 'inherit',
            }}
            tabIndex={0}
            role="term"
          >
            {term}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={cn(
              'z-50 max-w-xs rounded-md px-3 py-2 text-xs leading-relaxed shadow-md',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2',
            )}
            style={{
              backgroundColor: 'var(--bg-primary, hsl(var(--popover)))',
              color: 'var(--text-primary, hsl(var(--popover-foreground)))',
              border: '1px solid var(--border)',
            }}
            sideOffset={6}
          >
            {definition}
            <TooltipPrimitive.Arrow
              className="fill-current"
              style={{
                color: 'var(--border)',
              }}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
