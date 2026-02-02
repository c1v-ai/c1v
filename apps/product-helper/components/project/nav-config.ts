import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Server,
  GitBranch,
  Settings,
  Plug,
  Sparkles,
  Users,
  Layers,
  Code,
  BookOpen,
  Database,
  Cloud,
} from 'lucide-react';
import type { DiagramType } from '@/lib/db/type-guards';

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: NavItem[];
}

export function getProjectNavItems(projectId: number): NavItem[] {
  return [
    { name: 'Overview', href: `/projects/${projectId}`, icon: LayoutDashboard, exact: true },
    {
      name: 'Product Requirements',
      href: `/projects/${projectId}/requirements`,
      icon: FileText,
      children: [
        { name: 'Architecture Diagram', href: `/projects/${projectId}/requirements/architecture`, icon: Layers },
        { name: 'Tech Stack', href: `/projects/${projectId}/requirements/tech-stack`, icon: Code },
        { name: 'User Stories', href: `/projects/${projectId}/requirements/user-stories`, icon: BookOpen },
        { name: 'System Overview', href: `/projects/${projectId}/requirements/system-overview`, icon: Users },
      ],
    },
    {
      name: 'Backend',
      icon: Server,
      children: [
        { name: 'Database Schema', href: `/projects/${projectId}/backend/schema`, icon: Database },
        { name: 'API Specification', href: `/projects/${projectId}/backend/api-spec`, icon: Code },
        { name: 'Infrastructure', href: `/projects/${projectId}/backend/infrastructure`, icon: Cloud },
        { name: 'Coding Guidelines', href: `/projects/${projectId}/backend/guidelines`, icon: FileText },
      ],
    },
    { name: 'Diagrams', href: `/projects/${projectId}/diagrams`, icon: GitBranch },
    { name: 'Generate', href: `/projects/${projectId}/generate`, icon: Sparkles },
    { name: 'Connections', href: `/projects/${projectId}/connections`, icon: Plug },
    { name: 'Settings', href: `/projects/${projectId}/settings`, icon: Settings },
  ];
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  if (item.href) {
    return pathname.startsWith(item.href);
  }
  // For parent items without href, check if any child is active
  if (item.children) {
    return item.children.some(child => isNavItemActive(child, pathname));
  }
  return false;
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
