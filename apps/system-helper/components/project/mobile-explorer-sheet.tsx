'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Database,
  GitBranch,
  Users,
  FileText,
  PanelLeft,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from '@/components/chat/collapsible-section';
import { useProjectChat } from './project-chat-provider';
import { getProjectNavItems, isNavItemActive, getDiagramLabel } from './nav-config';

export function MobileExplorerSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {
    projectId,
    parsedProjectData,
    parsedArtifacts,
    setSelectedDiagram,
  } = useProjectChat();

  const { actors, useCases, dataEntities, completeness } = parsedProjectData;
  const navItems = getProjectNavItems(projectId);

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
        {/* Section Nav */}
        <nav className="px-2 pt-4 pb-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(item, pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]'
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

        {/* Completeness */}
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
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

        {/* Project data */}
        <div className="pb-4">
          <CollapsibleSection title="Actors" icon={Users} count={actors.length} defaultOpen={false}>
            {actors.length > 0 ? (
              <div className="space-y-1">
                {actors.map((actor, i) => (
                  <div key={`actor-${i}`} className="px-2 py-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{actor.name}</p>
                    {actor.role && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{actor.role}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No actors discovered yet</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Use Cases" icon={FileText} count={useCases.length} defaultOpen={false}>
            {useCases.length > 0 ? (
              <div className="space-y-1">
                {useCases.map((uc, i) => (
                  <div key={`usecase-${i}`} className="px-2 py-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{uc.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No use cases discovered yet</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Data Entities" icon={Database} count={dataEntities.length} defaultOpen={false}>
            {dataEntities.length > 0 ? (
              <div className="space-y-1">
                {dataEntities.map((entity, i) => (
                  <div key={`entity-${i}`} className="px-2 py-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{entity.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No data entities discovered yet</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Diagrams" icon={GitBranch} count={parsedArtifacts.length} defaultOpen>
            {parsedArtifacts.length > 0 ? (
              <div className="space-y-1">
                {parsedArtifacts.map((artifact) => {
                  const label = getDiagramLabel(artifact.type);
                  return (
                    <button
                      key={`diagram-${artifact.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedDiagram(artifact);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[var(--bg-secondary)] cursor-pointer"
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
                })}
              </div>
            ) : (
              <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No diagrams generated yet</p>
            )}
          </CollapsibleSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
