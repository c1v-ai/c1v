import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Database,
  GitBranch,
  Settings,
  Plug,
} from 'lucide-react';
import type { DiagramType } from '@/lib/db/type-guards';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function getProjectNavItems(projectId: number): NavItem[] {
  return [
    { name: 'Overview', href: `/projects/${projectId}`, icon: LayoutDashboard, exact: true },
    { name: 'Data', href: `/projects/${projectId}/data`, icon: Database },
    { name: 'Diagrams', href: `/projects/${projectId}/diagrams`, icon: GitBranch },
    { name: 'Connections', href: `/projects/${projectId}/connections`, icon: Plug },
    { name: 'Settings', href: `/projects/${projectId}/settings`, icon: Settings },
  ];
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname.startsWith(item.href);
}

export function getDiagramLabel(type: DiagramType): string {
  switch (type) {
    case 'context_diagram': return 'Context';
    case 'use_case': return 'Use Case';
    case 'class_diagram': return 'Class';
    case 'sequence_diagram': return 'Sequence';
    case 'activity_diagram': return 'Activity';
    default: return 'Diagram';
  }
}
