'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectChat } from './project-chat-provider';
import { getProjectNavItems, isNavItemActive, type NavItem } from './nav-config';

// ============================================================
// Types
// ============================================================

type HasDataMap = Record<string, boolean>;

// ============================================================
// Sub-components
// ============================================================

const fetcher = (url: string) => fetch(url).then(r => r.json());

function StatusIndicator({ hasData, isNew }: { hasData: boolean; isNew: boolean }) {
  if (hasData) {
    return (
      <CheckCircle2
        className={cn('h-3 w-3 ml-auto shrink-0', isNew && 'animate-pulse')}
        style={{ color: 'var(--success, #22c55e)' }}
      />
    );
  }
  return (
    <Circle
      className="h-3 w-3 ml-auto shrink-0"
      style={{ color: 'var(--text-muted)', opacity: 0.4 }}
    />
  );
}

function CompletenessBar({ percentage }: { percentage: number }) {
  return (
    <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
          Completeness
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {percentage}%
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage >= 75 ? 'var(--success, #22c55e)' : 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}

function NavItemComponent({
  item,
  pathname,
  depth = 0,
  hasDataMap,
  newlyCompleted,
}: {
  item: NavItem;
  pathname: string;
  depth?: number;
  hasDataMap?: HasDataMap;
  newlyCompleted?: Set<string>;
}) {
  const [expanded, setExpanded] = useState(true);
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const active = isNavItemActive(item, pathname);

  if (hasChildren) {
    return (
      <div>
        <div
          className={cn(
            'flex items-center w-full rounded-md text-sm font-medium transition-colors',
            'hover:bg-[var(--bg-secondary)]',
            active && !item.href ? 'bg-[var(--bg-secondary)]' : ''
          )}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {/* Name/Link area - clickable for navigation if href exists */}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-2 flex-1 py-1.5"
              style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span>{item.name}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 flex-1 py-1.5 text-left"
              style={{ color: 'var(--text-primary)' }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span>{item.name}</span>
            </button>
          )}
          {/* Chevron button for expand/collapse */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 mr-1 rounded hover:bg-[var(--bg-primary)]"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
        </div>
        {expanded && (
          <div className="mt-0.5">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.name}
                item={child}
                pathname={pathname}
                depth={depth + 1}
                hasDataMap={hasDataMap}
                newlyCompleted={newlyCompleted}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Leaf node - always a link
  const showStatus = item.dataKey && hasDataMap;
  const itemHasData = showStatus ? !!hasDataMap[item.dataKey!] : false;
  const isNew = showStatus && newlyCompleted ? newlyCompleted.has(item.dataKey!) : false;

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]'
      )}
      style={{
        paddingLeft: `${8 + depth * 12}px`,
        color: active ? 'var(--accent)' : 'var(--text-primary)'
      }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{item.name}</span>
      {showStatus && <StatusIndicator hasData={itemHasData} isNew={isNew} />}
    </Link>
  );
}

// ============================================================
// Pulse tracking hook
// ============================================================

function useNewlyCompleted(hasDataMap: HasDataMap | undefined) {
  const prevHasData = useRef<HasDataMap>({});
  const [newlyCompleted, setNewlyCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!hasDataMap) return;

    const newItems = new Set<string>();
    for (const [key, value] of Object.entries(hasDataMap)) {
      if (value && !prevHasData.current[key]) {
        newItems.add(key);
      }
    }

    prevHasData.current = { ...hasDataMap };

    if (newItems.size > 0) {
      setNewlyCompleted(newItems);
      const timer = setTimeout(() => setNewlyCompleted(new Set()), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasDataMap]);

  return newlyCompleted;
}

// ============================================================
// ExplorerSidebar
// ============================================================

export function ExplorerSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const {
    projectId,
    parsedProjectData,
    explorerCollapsed,
    toggleExplorer,
  } = useProjectChat();

  const { data: explorerData } = useSWR<{ hasData: HasDataMap; completeness: number }>(
    projectId ? `/api/projects/${projectId}/explorer` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const hasDataMap = explorerData?.hasData;
  const newlyCompleted = useNewlyCompleted(hasDataMap);

  const navItems = getProjectNavItems(projectId);
  const completeness = explorerData?.completeness ?? parsedProjectData.completeness;

  return (
    <aside
      className={cn(
        'relative flex-col h-full border-r transition-all duration-300 ease-in-out flex-shrink-0',
        explorerCollapsed ? 'w-14' : 'w-64',
        className
      )}
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={toggleExplorer}
        aria-label={explorerCollapsed ? 'Expand explorer' : 'Collapse explorer'}
        className={cn(
          'absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full',
          'border shadow-sm transition-colors duration-150',
          'hover:bg-[var(--bg-secondary)]'
        )}
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
      >
        {explorerCollapsed ? (
          <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronLeft className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Collapsed State */}
      {explorerCollapsed ? (
        <div className="flex flex-col items-center gap-3 pt-12 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(item, pathname);
            // For collapsed state, link to href if available, otherwise just show icon
            const href = item.href || (item.children?.[0]?.href);
            return href ? (
              <Link
                key={item.name}
                href={href}
                title={item.name}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  active ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]'
                )}
              >
                <Icon
                  className={cn('h-4 w-4', active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}
                />
              </Link>
            ) : (
              <div
                key={item.name}
                title={item.name}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md',
                  active ? 'bg-[var(--bg-secondary)]' : ''
                )}
              >
                <Icon
                  className={cn('h-4 w-4', active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Expanded State */
        <div className="flex flex-col h-full overflow-hidden pt-2">
          {/* Navigation Tree */}
          <nav className="px-2 pb-2 space-y-0.5 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                pathname={pathname}
                hasDataMap={hasDataMap}
                newlyCompleted={newlyCompleted}
              />
            ))}
          </nav>

          {/* Empty state message */}
          {completeness === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-4 text-center">
              <Sparkles className="h-6 w-6 mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Start chatting to build your PRD
              </p>
            </div>
          )}

          {/* Completeness Bar - always at bottom */}
          <CompletenessBar percentage={completeness} />
        </div>
      )}
    </aside>
  );
}
