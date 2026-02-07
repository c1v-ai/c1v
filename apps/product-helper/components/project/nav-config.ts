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
  Target,
  BarChart3,
  Shield,
} from 'lucide-react';
import type { DiagramType } from '@/lib/db/type-guards';

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: NavItem[];
  dataKey?: string;
}

export function getProjectNavItems(projectId: number): NavItem[] {
  return [
    { name: 'Overview', href: `/projects/${projectId}`, icon: LayoutDashboard, exact: true },
    {
      name: 'Product Requirements',
      href: `/projects/${projectId}/requirements`,
      icon: FileText,
      children: [
        { name: 'Problem Statement', href: `/projects/${projectId}/requirements/problem-statement`, icon: Target, dataKey: 'hasProblemStatement' },
        { name: 'Goals & Metrics', href: `/projects/${projectId}/requirements/goals-metrics`, icon: BarChart3, dataKey: 'hasGoalsMetrics' },
        { name: 'Architecture Diagram', href: `/projects/${projectId}/requirements/architecture`, icon: Layers, dataKey: 'hasArchitecture' },
        { name: 'Tech Stack', href: `/projects/${projectId}/requirements/tech-stack`, icon: Code, dataKey: 'hasTechStack' },
        { name: 'User Stories', href: `/projects/${projectId}/requirements/user-stories`, icon: BookOpen, dataKey: 'hasUserStories' },
        { name: 'System Overview', href: `/projects/${projectId}/requirements/system-overview`, icon: Users, dataKey: 'hasSystemOverview' },
        { name: 'Non-Functional Req.', href: `/projects/${projectId}/requirements/nfr`, icon: Shield, dataKey: 'hasNfr' },
      ],
    },
    {
      name: 'Backend',
      icon: Server,
      children: [
        { name: 'Database Schema', href: `/projects/${projectId}/backend/schema`, icon: Database, dataKey: 'hasSchema' },
        { name: 'API Specification', href: `/projects/${projectId}/backend/api-spec`, icon: Code, dataKey: 'hasApiSpec' },
        { name: 'Infrastructure', href: `/projects/${projectId}/backend/infrastructure`, icon: Cloud, dataKey: 'hasInfrastructure' },
        { name: 'Coding Guidelines', href: `/projects/${projectId}/backend/guidelines`, icon: FileText, dataKey: 'hasGuidelines' },
      ],
    },
    { name: 'Diagrams', href: `/projects/${projectId}/diagrams`, icon: GitBranch, dataKey: 'hasDiagrams' },
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
