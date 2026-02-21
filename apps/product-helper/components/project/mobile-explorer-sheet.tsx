'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import {
  PanelLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
        className={cn('h-3 w-3 ml-auto shrink-0 text-green-500', isNew && 'animate-pulse')}
      />
    );
  }
  return (
    <Circle className="h-3 w-3 ml-auto shrink-0 text-muted-foreground opacity-40" />
  );
}

function MobileNavItem({
  item,
  pathname,
  depth = 0,
  onNavigate,
  hasDataMap,
  newlyCompleted,
}: {
  item: NavItem;
  pathname: string;
  depth?: number;
  onNavigate: () => void;
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
            'hover:bg-muted',
            active && !item.href ? 'bg-muted' : ''
          )}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {/* Name/Link area - clickable for navigation if href exists */}
          {item.href ? (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2 flex-1 py-2',
                active ? 'text-accent' : 'text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>{item.name}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 flex-1 py-2 text-left text-foreground"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>{item.name}</span>
            </button>
          )}
          {/* Chevron button for expand/collapse */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-2 mr-1 rounded hover:bg-background"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        {expanded && (
          <div className="mt-0.5">
            {item.children!.map((child) => (
              <MobileNavItem
                key={child.name}
                item={child}
                pathname={pathname}
                depth={depth + 1}
                onNavigate={onNavigate}
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
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
        active ? 'bg-muted text-accent' : 'hover:bg-muted text-foreground'
      )}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{item.name}</span>
      {showStatus && <StatusIndicator hasData={itemHasData} isNew={isNew} />}
    </Link>
  );
}

// ============================================================
// MobileExplorerSheet
// ============================================================

export function MobileExplorerSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {
    projectId,
    parsedProjectData,
  } = useProjectChat();

  const { data: explorerData } = useSWR<{ hasData: HasDataMap; completeness: number }>(
    projectId ? `/api/projects/${projectId}/explorer` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const hasDataMap = explorerData?.hasData;

  // Pulse tracking
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

  const completeness = explorerData?.completeness ?? parsedProjectData.completeness;
  const navItems = getProjectNavItems(projectId);

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-20 left-4 z-50 rounded-full shadow-lg border border-border bg-background"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
        {/* Navigation Tree */}
        <nav className="px-2 pt-4 pb-2 space-y-0.5">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.name}
              item={item}
              pathname={pathname}
              onNavigate={handleNavigate}
              hasDataMap={hasDataMap}
              newlyCompleted={newlyCompleted}
            />
          ))}
        </nav>

        {/* Separator */}
        <div className="border-t border-border mx-3" />

        {/* Empty state message */}
        {completeness === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-4 text-center">
            <Sparkles className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Start chatting to build your PRD
            </p>
          </div>
        )}

        {/* Completeness */}
        <div className="px-3 py-3 border-t border-border mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Completeness
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {completeness}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${completeness}%`,
                backgroundColor: completeness >= 75 ? '#22c55e' : 'hsl(var(--accent))',
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
