'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Database,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from '@/components/chat/collapsible-section';
import { useProjectChat } from './project-chat-provider';
import { getProjectNavItems, isNavItemActive, getDiagramLabel } from './nav-config';
import type { ParsedArtifact } from '@/lib/db/type-guards';

// ============================================================
// Sub-components
// ============================================================

function ItemRow({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {primary}
        </p>
        {secondary && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
}

function DiagramRow({ artifact, onClick }: { artifact: ParsedArtifact; onClick: () => void }) {
  const label = getDiagramLabel(artifact.type);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left',
        'transition-colors duration-150',
        'hover:bg-[var(--bg-secondary)] cursor-pointer'
      )}
    >
      <span
        className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
      >
        {label}
      </span>
      <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
        {label} Diagram
      </span>
    </button>
  );
}

function CompletenessBar({ percentage }: { percentage: number }) {
  return (
    <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
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

// ============================================================
// ExplorerSidebar
// ============================================================

export function ExplorerSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const {
    projectId,
    parsedProjectData,
    parsedArtifacts,
    explorerCollapsed,
    toggleExplorer,
    setSelectedDiagram,
  } = useProjectChat();

  const navItems = getProjectNavItems(projectId);
  const { actors, useCases, dataEntities, completeness } = parsedProjectData;
  const hasData =
    actors.length > 0 ||
    useCases.length > 0 ||
    dataEntities.length > 0 ||
    parsedArtifacts.length > 0;

  return (
    <aside
      className={cn(
        'relative flex-col h-full border-r transition-all duration-300 ease-in-out flex-shrink-0',
        explorerCollapsed ? 'w-14' : 'w-60',
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
            return (
              <Link
                key={item.name}
                href={item.href}
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
            );
          })}
          <div className="w-8 border-t my-1" style={{ borderColor: 'var(--border)' }} />
          <div className="flex flex-col items-center gap-1" title={`${actors.length} Actors`}>
            <Users className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{actors.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1" title={`${useCases.length} Use Cases`}>
            <FileText className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{useCases.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1" title={`${dataEntities.length} Data Entities`}>
            <Database className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dataEntities.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1" title={`${parsedArtifacts.length} Diagrams`}>
            <GitBranch className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{parsedArtifacts.length}</span>
          </div>
        </div>
      ) : (
        /* Expanded State */
        <div className="flex flex-col h-full overflow-hidden pt-2">
          {/* Section Navigation */}
          <nav className="px-2 pb-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(item, pathname);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--bg-secondary)]'
                      : 'hover:bg-[var(--bg-secondary)]'
                  )}
                  style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="border-t mx-3" style={{ borderColor: 'var(--border)' }} />

          {/* Completeness Bar */}
          <CompletenessBar percentage={completeness} />

          {/* Scrollable Data Content */}
          <div className="flex-1 overflow-y-auto">
            {hasData ? (
              <>
                <CollapsibleSection title="Actors" icon={Users} count={actors.length} defaultOpen={false}>
                  {actors.length > 0 ? (
                    <div className="space-y-1">
                      {actors.map((actor, i) => (
                        <ItemRow key={`actor-${i}`} primary={actor.name} secondary={actor.role} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No actors discovered yet
                    </p>
                  )}
                </CollapsibleSection>

                <CollapsibleSection title="Use Cases" icon={FileText} count={useCases.length} defaultOpen={false}>
                  {useCases.length > 0 ? (
                    <div className="space-y-1">
                      {useCases.map((uc, i) => (
                        <ItemRow key={`usecase-${i}`} primary={uc.name} secondary={uc.id} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No use cases discovered yet
                    </p>
                  )}
                </CollapsibleSection>

                <CollapsibleSection title="Data Entities" icon={Database} count={dataEntities.length} defaultOpen={false}>
                  {dataEntities.length > 0 ? (
                    <div className="space-y-1">
                      {dataEntities.map((entity, i) => (
                        <ItemRow key={`entity-${i}`} primary={entity.name} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No data entities discovered yet
                    </p>
                  )}
                </CollapsibleSection>

                <CollapsibleSection title="Diagrams" icon={GitBranch} count={parsedArtifacts.length} defaultOpen>
                  {parsedArtifacts.length > 0 ? (
                    <div className="space-y-1">
                      {parsedArtifacts.map((artifact) => (
                        <DiagramRow
                          key={`diagram-${artifact.id}`}
                          artifact={artifact}
                          onClick={() => setSelectedDiagram(artifact)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No diagrams generated yet
                    </p>
                  )}
                </CollapsibleSection>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <Sparkles className="h-8 w-8 mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Keep chatting to discover more data!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
