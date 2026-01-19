'use client';

import * as React from 'react';
import {
  GitBranch,
  Users,
  Box,
  ArrowRightLeft,
  Activity,
  ChevronRight,
  FileCode
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Diagram Link Card Component
 * Displays a clickable card that shows diagram type info and opens a viewer popup
 */
export interface DiagramLinkCardProps {
  syntax: string;
  onViewClick: () => void;
  className?: string;
}

type DiagramType = 'context' | 'useCase' | 'class' | 'sequence' | 'activity' | 'unknown';

interface DiagramInfo {
  type: DiagramType;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

/**
 * Detects the diagram type from mermaid syntax
 */
function detectDiagramType(syntax: string): DiagramInfo {
  const normalizedSyntax = syntax.toLowerCase().trim();

  // Check for C4 context diagram
  if (normalizedSyntax.includes('c4context') || normalizedSyntax.includes('system_boundary')) {
    return {
      type: 'context',
      title: 'View Context Diagram',
      icon: GitBranch,
    };
  }

  // Check for use case diagram (PlantUML style or custom)
  if (normalizedSyntax.includes('usecase') || normalizedSyntax.includes('use case')) {
    return {
      type: 'useCase',
      title: 'View Use Case Diagram',
      icon: Users,
    };
  }

  // Check for class diagram
  if (normalizedSyntax.includes('classdiagram') || normalizedSyntax.startsWith('class ') || normalizedSyntax.includes('\nclass ')) {
    return {
      type: 'class',
      title: 'View Class Diagram',
      icon: Box,
    };
  }

  // Check for sequence diagram
  if (normalizedSyntax.includes('sequencediagram') || normalizedSyntax.includes('participant') || normalizedSyntax.includes('actor')) {
    return {
      type: 'sequence',
      title: 'View Sequence Diagram',
      icon: ArrowRightLeft,
    };
  }

  // Check for activity/flowchart diagram
  if (normalizedSyntax.includes('flowchart') || normalizedSyntax.includes('graph ') || normalizedSyntax.includes('statediagram')) {
    return {
      type: 'activity',
      title: 'View Activity Diagram',
      icon: Activity,
    };
  }

  // Default fallback
  return {
    type: 'unknown',
    title: 'View Diagram',
    icon: FileCode,
  };
}

export function DiagramLinkCard({
  syntax,
  onViewClick,
  className,
}: DiagramLinkCardProps) {
  // Note: Primary syntax cleanup happens on save (conversations.ts)
  // and as a safety net on render (diagram-viewer.tsx)
  const diagramInfo = detectDiagramType(syntax);
  const IconComponent = diagramInfo.icon;

  return (
    <button
      type="button"
      onClick={onViewClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200',
        'hover:scale-[1.01] active:scale-[0.99]',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 53, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon Container */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <IconComponent
          className="h-5 w-5 transition-colors duration-200 group-hover:scale-110"
          style={{ color: 'var(--accent)' }}
        />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {diagramInfo.title}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Click to open diagram viewer
        </div>
      </div>

      {/* Arrow Icon */}
      <div
        className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronRight className="h-5 w-5" />
      </div>
    </button>
  );
}

/**
 * Export the diagram type detection for use elsewhere
 */
export { detectDiagramType };
export type { DiagramInfo, DiagramType };
