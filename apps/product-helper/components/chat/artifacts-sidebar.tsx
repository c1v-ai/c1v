'use client';

import * as React from 'react';
import {
  Users,
  FileText,
  Database,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from './collapsible-section';
import type { ParsedProjectData, ParsedArtifact, DiagramType } from '@/lib/db/type-guards';

/**
 * ArtifactsSidebar Component
 * Displays project data and generated artifacts in a collapsible sidebar
 *
 * Features:
 * - Completeness progress bar at top
 * - Collapsible sections for Actors, Use Cases, Data Entities, and Diagrams
 * - Collapse to icon-only mode (w-14)
 * - Smooth animations for expand/collapse
 */
export interface ArtifactsSidebarProps {
  /** Parsed project data containing actors, use cases, etc. */
  projectData: ParsedProjectData;
  /** Array of generated artifacts/diagrams */
  artifacts: ParsedArtifact[];
  /** Whether the sidebar is in collapsed (icon-only) mode */
  isCollapsed: boolean;
  /** Callback to toggle collapsed state */
  onToggleCollapse: () => void;
  /** Callback when a diagram artifact is clicked */
  onDiagramClick: (artifact: ParsedArtifact) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps diagram type to human-readable label
 */
function getDiagramLabel(type: DiagramType): string {
  switch (type) {
    case 'context_diagram':
      return 'Context';
    case 'use_case':
      return 'Use Case';
    case 'class_diagram':
      return 'Class';
    case 'sequence_diagram':
      return 'Sequence';
    case 'activity_diagram':
      return 'Activity';
    default:
      return 'Diagram';
  }
}

/**
 * Item row component for consistent styling
 */
interface ItemRowProps {
  primary: string;
  secondary?: string;
  onClick?: () => void;
}

function ItemRow({ primary, secondary, onClick }: ItemRowProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150',
        onClick && 'hover:bg-[var(--bg-secondary)] cursor-pointer'
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-medium truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {primary}
        </p>
        {secondary && (
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {secondary}
          </p>
        )}
      </div>
    </Component>
  );
}

/**
 * Diagram item with type badge
 */
interface DiagramRowProps {
  artifact: ParsedArtifact;
  onClick: () => void;
}

function DiagramRow({ artifact, onClick }: DiagramRowProps) {
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
      {/* Type Badge */}
      <span
        className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--bg-primary)',
        }}
      >
        {label}
      </span>

      {/* Title */}
      <span
        className="flex-1 text-sm truncate"
        style={{ color: 'var(--text-primary)' }}
      >
        {label} Diagram
      </span>
    </button>
  );
}

/**
 * Empty state component with encouragement message
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <Sparkles
        className="h-8 w-8 mb-3"
        style={{ color: 'var(--text-muted)' }}
      />
      <p
        className="text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Keep chatting to discover more data!
      </p>
    </div>
  );
}

/**
 * Completeness progress bar component
 */
interface CompletenessBarProps {
  percentage: number;
}

function CompletenessBar({ percentage }: CompletenessBarProps) {
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-medium uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Completeness
        </span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
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

export function ArtifactsSidebar({
  projectData,
  artifacts,
  isCollapsed,
  onToggleCollapse,
  onDiagramClick,
  className,
}: ArtifactsSidebarProps) {
  const { actors, useCases, dataEntities, completeness } = projectData;

  // Check if we have any data to display
  const hasData = actors.length > 0 || useCases.length > 0 || dataEntities.length > 0 || artifacts.length > 0;

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-14' : 'w-72',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full',
          'border shadow-sm transition-colors duration-150',
          'hover:bg-[var(--bg-secondary)]'
        )}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronLeft className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Collapsed State - Icon Only */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-4 pt-12 px-2">
          <div
            className="flex flex-col items-center gap-1"
            title={`${actors.length} Actors`}
          >
            <Users className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {actors.length}
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1"
            title={`${useCases.length} Use Cases`}
          >
            <FileText className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {useCases.length}
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1"
            title={`${dataEntities.length} Data Entities`}
          >
            <Database className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {dataEntities.length}
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1"
            title={`${artifacts.length} Diagrams`}
          >
            <GitBranch className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {artifacts.length}
            </span>
          </div>
        </div>
      ) : (
        /* Expanded State - Full Content */
        <div className="flex flex-col h-full overflow-hidden pt-2">
          {/* Completeness Bar */}
          <CompletenessBar percentage={completeness} />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {hasData ? (
              <>
                {/* Actors Section */}
                <CollapsibleSection
                  title="Actors"
                  icon={Users}
                  count={actors.length}
                  defaultOpen={false}
                >
                  {actors.length > 0 ? (
                    <div className="space-y-1">
                      {actors.map((actor, index) => (
                        <ItemRow
                          key={`actor-${index}`}
                          primary={actor.name}
                          secondary={actor.role}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No actors discovered yet
                    </p>
                  )}
                </CollapsibleSection>

                {/* Use Cases Section */}
                <CollapsibleSection
                  title="Use Cases"
                  icon={FileText}
                  count={useCases.length}
                  defaultOpen={false}
                >
                  {useCases.length > 0 ? (
                    <div className="space-y-1">
                      {useCases.map((useCase, index) => (
                        <ItemRow
                          key={`usecase-${index}`}
                          primary={useCase.name}
                          secondary={useCase.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No use cases discovered yet
                    </p>
                  )}
                </CollapsibleSection>

                {/* Data Entities Section */}
                <CollapsibleSection
                  title="Data Entities"
                  icon={Database}
                  count={dataEntities.length}
                  defaultOpen={false}
                >
                  {dataEntities.length > 0 ? (
                    <div className="space-y-1">
                      {dataEntities.map((entity, index) => (
                        <ItemRow
                          key={`entity-${index}`}
                          primary={entity.name}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No data entities discovered yet
                    </p>
                  )}
                </CollapsibleSection>

                {/* Diagrams Section */}
                <CollapsibleSection
                  title="Diagrams"
                  icon={GitBranch}
                  count={artifacts.length}
                  defaultOpen={true}
                >
                  {artifacts.length > 0 ? (
                    <div className="space-y-1">
                      {artifacts.map((artifact) => (
                        <DiagramRow
                          key={`diagram-${artifact.id}`}
                          artifact={artifact}
                          onClick={() => onDiagramClick(artifact)}
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
              <EmptyState />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export default ArtifactsSidebar;
