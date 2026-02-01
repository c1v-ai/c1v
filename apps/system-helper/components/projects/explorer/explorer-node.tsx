'use client';

import { type LucideIcon, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ExplorerNodeProps {
  /** Display label */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Navigation href -- if undefined, node is a group header */
  href?: string;
  /** Nesting depth (0 = root, 1 = child) */
  depth?: number;
  /** Whether the route is currently active */
  isActive?: boolean;
  /** Whether this node has children and is expandable */
  isExpandable?: boolean;
  /** Whether the children are currently visible */
  isExpanded?: boolean;
  /** Toggle expand callback for group nodes */
  onToggle?: () => void;
  /** Optional count badge (e.g. number of actors) */
  count?: number;
  /** Whether this section has data (true = green dot, false = gray dot) */
  hasData?: boolean;
  /** Per-section review status indicator */
  reviewStatus?: 'draft' | 'awaiting-review' | 'approved';
  /** Href for add button ('+' on group headers) */
  addHref?: string;
}

export function ExplorerNode({
  label,
  icon: Icon,
  href,
  depth = 0,
  isActive = false,
  isExpandable = false,
  isExpanded = false,
  onToggle,
  count,
  hasData,
  reviewStatus,
  addHref,
}: ExplorerNodeProps) {
  const paddingLeft = depth * 16 + 12;

  const content = (
    <div
      className={cn(
        'group flex items-center gap-2 h-8 pr-3 rounded-md text-sm cursor-pointer select-none transition-colors',
        isActive
          ? 'font-medium'
          : 'hover:opacity-100'
      )}
      style={{
        paddingLeft: `${paddingLeft}px`,
        backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : undefined,
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '';
        }
      }}
    >
      {/* Chevron for expandable nodes */}
      {isExpandable ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.();
          }}
          className="flex items-center justify-center w-4 h-4 shrink-0"
          aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-150',
              isExpanded && 'rotate-90'
            )}
            style={{ color: 'var(--text-muted)' }}
          />
        </button>
      ) : (
        <span className="w-4 shrink-0" />
      )}

      {/* Section icon */}
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
      />

      {/* Label */}
      <span className="truncate flex-1">{label}</span>

      {/* Add button for group headers */}
      {addHref && (
        <Link
          href={addHref}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label={`Add to ${label}`}
          title={`Add to ${label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </Link>
      )}

      {/* Review status indicator */}
      {reviewStatus === 'awaiting-review' && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
          aria-label="Awaiting review"
        />
      )}
      {reviewStatus === 'approved' && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"
          aria-label="Approved"
        />
      )}

      {/* Count badge */}
      {typeof count === 'number' && count > 0 && (
        <span
          className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-medium shrink-0"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
          }}
        >
          {count}
        </span>
      )}

      {/* Data status indicator dot */}
      {typeof hasData === 'boolean' && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: hasData
              ? '#22c55e'
              : 'color-mix(in srgb, var(--text-muted) 40%, transparent)',
          }}
          aria-label={hasData ? 'Has data' : 'No data'}
        />
      )}
    </div>
  );

  // If the node has an href and is a leaf, wrap it in a Link
  if (href && !isExpandable) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  // For group nodes, the entire row toggles expand
  if (isExpandable && !href) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="block w-full text-left"
      >
        {content}
      </button>
    );
  }

  // For group nodes that also link (e.g. group header is itself a page),
  // clicking the row navigates, clicking the chevron toggles
  if (href && isExpandable) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
