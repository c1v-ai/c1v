'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  PanelLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProjectChat } from './project-chat-provider';
import { getProjectNavItems, isNavItemActive, type NavItem } from './nav-config';

// ============================================================
// Sub-components
// ============================================================

function MobileNavItem({
  item,
  pathname,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  depth?: number;
  onNavigate: () => void;
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
              onClick={onNavigate}
              className="flex items-center gap-2 flex-1 py-2"
              style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span>{item.name}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 flex-1 py-2 text-left"
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
            className="p-2 mr-1 rounded hover:bg-[var(--bg-primary)]"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
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
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Leaf node - always a link
  return (
    <Link
      href={item.href!}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
        active ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]'
      )}
      style={{
        paddingLeft: `${8 + depth * 12}px`,
        color: active ? 'var(--accent)' : 'var(--text-primary)'
      }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {item.name}
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

  const { completeness } = parsedProjectData;
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
          className="fixed bottom-20 left-4 z-50 rounded-full shadow-lg border"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
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
            />
          ))}
        </nav>

        {/* Separator */}
        <div className="border-t mx-3" style={{ borderColor: 'var(--border)' }} />

        {/* Empty state message */}
        {completeness === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-4 text-center">
            <Sparkles className="h-6 w-6 mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Start chatting to build your PRD
            </p>
          </div>
        )}

        {/* Completeness */}
        <div className="px-3 py-3 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
              Completeness
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {completeness}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${completeness}%`,
                backgroundColor: completeness >= 75 ? 'var(--success, #22c55e)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
