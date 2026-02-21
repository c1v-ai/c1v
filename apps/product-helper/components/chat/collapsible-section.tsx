'use client';

import * as React from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CollapsibleSection Component
 * A collapsible container for grouping related items in sidebars
 *
 * Features:
 * - Animated chevron rotation on expand/collapse
 * - Count badge display
 * - Smooth height animation
 * - Accessible keyboard navigation
 */
export interface CollapsibleSectionProps {
  /** Section title */
  title: string;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Number of items in the section */
  count?: number;
  /** Whether the section is open by default */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Content to display when expanded */
  children: React.ReactNode;
  /** Additional CSS classes for the root element */
  className?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  count,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn('w-full', className)}
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={cn(
            'group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'hover:bg-muted text-foreground'
          )}
          aria-expanded={open}
        >
          {/* Icon */}
          <Icon
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
            aria-hidden="true"
          />

          {/* Title */}
          <span className="flex-1 text-sm font-medium text-foreground">
            {title}
          </span>

          {/* Count Badge */}
          {typeof count === 'number' && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium bg-muted text-muted-foreground border border-border">
              {count}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-transform duration-200 text-muted-foreground',
              'group-data-[state=open]:rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content
        className={cn(
          'overflow-hidden',
          'data-[state=open]:animate-collapsible-down',
          'data-[state=closed]:animate-collapsible-up'
        )}
      >
        <div className="py-1 pl-6">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default CollapsibleSection;
