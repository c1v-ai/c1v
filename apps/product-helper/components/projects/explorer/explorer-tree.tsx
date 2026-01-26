'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Building2,
  Cpu,
  BookOpen,
  Server,
  Database,
  Code2,
  Cloud,
  GitBranch,
  Plug,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { ExplorerNode } from './explorer-node';
import type { ExplorerData } from '@/lib/db/queries/explorer';

interface TreeSection {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  count?: number;
  hasData?: boolean;
  children?: TreeSection[];
}

interface ExplorerTreeProps {
  projectId: number;
  data: ExplorerData;
  filter: string;
}

const STORAGE_KEY_PREFIX = 'explorer-';

function getStorageKey(projectId: number): string {
  return `${STORAGE_KEY_PREFIX}${projectId}`;
}

function loadExpandedState(projectId: number): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(getStorageKey(projectId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  // Default: all groups expanded
  return { requirements: true, backend: true };
}

function saveExpandedState(
  projectId: number,
  state: Record<string, boolean>
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function ExplorerTree({ projectId, data, filter }: ExplorerTreeProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    requirements: true,
    backend: true,
  });

  // Load persisted expansion state on mount
  useEffect(() => {
    setExpanded(loadExpandedState(projectId));
  }, [projectId]);

  const toggleExpand = useCallback(
    (sectionId: string) => {
      setExpanded((prev) => {
        const next = { ...prev, [sectionId]: !prev[sectionId] };
        saveExpandedState(projectId, next);
        return next;
      });
    },
    [projectId]
  );

  const basePath = `/projects/${projectId}`;

  const sections: TreeSection[] = useMemo(
    () => [
      {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        href: basePath,
      },
      {
        id: 'requirements',
        label: 'Product Requirements',
        icon: FileText,
        children: [
          {
            id: 'system-overview',
            label: 'System Overview',
            icon: Globe,
            href: `${basePath}/requirements/system-overview`,
            count:
              (data.counts.actors || 0) + (data.counts.useCases || 0),
            hasData: data.hasData.hasSystemOverview,
          },
          {
            id: 'architecture',
            label: 'Architecture',
            icon: Building2,
            href: `${basePath}/requirements/architecture`,
            count: data.counts.entities || 0,
            hasData: data.hasData.hasArchitecture,
          },
          {
            id: 'tech-stack',
            label: 'Tech Stack',
            icon: Cpu,
            href: `${basePath}/requirements/tech-stack`,
            hasData: data.hasData.hasTechStack,
          },
          {
            id: 'user-stories',
            label: 'User Stories',
            icon: BookOpen,
            href: `${basePath}/requirements/user-stories`,
            count: data.counts.stories || 0,
            hasData: data.hasData.hasUserStories,
          },
        ],
      },
      {
        id: 'backend',
        label: 'Backend',
        icon: Server,
        children: [
          {
            id: 'schema',
            label: 'Database Schema',
            icon: Database,
            href: `${basePath}/backend/schema`,
            hasData: data.hasData.hasSchema,
          },
          {
            id: 'api-spec',
            label: 'API Specification',
            icon: Code2,
            href: `${basePath}/backend/api-spec`,
            hasData: data.hasData.hasApiSpec,
          },
          {
            id: 'infrastructure',
            label: 'Infrastructure',
            icon: Cloud,
            href: `${basePath}/backend/infrastructure`,
            hasData: data.hasData.hasInfrastructure,
          },
        ],
      },
      {
        id: 'diagrams',
        label: 'Diagrams',
        icon: GitBranch,
        href: `${basePath}/diagrams`,
        count: data.counts.artifacts || 0,
        hasData: data.hasData.hasDiagrams,
      },
      {
        id: 'connections',
        label: 'Connections',
        icon: Plug,
        href: `${basePath}/connections`,
      },
      {
        id: 'chat',
        label: 'Chat',
        icon: MessageSquare,
        href: `${basePath}/chat`,
        count: data.counts.conversations || 0,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: `${basePath}/settings`,
      },
    ],
    [basePath, data]
  );

  // Filter logic: show sections whose label matches, and auto-expand matching groups
  const filterLower = filter.toLowerCase().trim();

  const matchesFilter = (section: TreeSection): boolean => {
    if (!filterLower) return true;
    if (section.label.toLowerCase().includes(filterLower)) return true;
    if (section.children) {
      return section.children.some((child) =>
        child.label.toLowerCase().includes(filterLower)
      );
    }
    return false;
  };

  const childMatchesFilter = (child: TreeSection): boolean => {
    if (!filterLower) return true;
    return child.label.toLowerCase().includes(filterLower);
  };

  function isRouteActive(href: string): boolean {
    if (href === basePath) {
      // Exact match for overview
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-1.5" aria-label="Project sections">
      <div className="space-y-0.5">
        {sections.filter(matchesFilter).map((section) => {
          const hasChildren = section.children && section.children.length > 0;
          const isGroupExpanded =
            filterLower.length > 0 ? true : expanded[section.id] ?? false;

          return (
            <div key={section.id}>
              <ExplorerNode
                label={section.label}
                icon={section.icon}
                href={section.href}
                depth={0}
                isActive={section.href ? isRouteActive(section.href) : false}
                isExpandable={!!hasChildren}
                isExpanded={isGroupExpanded}
                onToggle={() => toggleExpand(section.id)}
                count={!hasChildren ? section.count : undefined}
                hasData={!hasChildren ? section.hasData : undefined}
              />

              {/* Children */}
              {hasChildren && isGroupExpanded && (
                <div className="space-y-0.5">
                  {section
                    .children!.filter(childMatchesFilter)
                    .map((child) => (
                      <ExplorerNode
                        key={child.id}
                        label={child.label}
                        icon={child.icon}
                        href={child.href}
                        depth={1}
                        isActive={
                          child.href ? isRouteActive(child.href) : false
                        }
                        count={child.count}
                        hasData={child.hasData}
                      />
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
