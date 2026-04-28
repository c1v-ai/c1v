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
  Target,
  BarChart3,
  Shield,
  Workflow,
  Scale,
  Grid3X3,
  Network,
  Trophy,
  Waves,
  HelpCircle,
  GitGraph,
  AlertTriangle,
} from 'lucide-react';
import type { DiagramType } from '@/lib/db/type-guards';

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: NavItem[];
  dataKey?: string;
  deprecated?: boolean;
}

export function getProjectNavItems(projectId: number): NavItem[] {
  return [
    { name: 'Overview', href: `/projects/${projectId}`, icon: LayoutDashboard, exact: true },

    // v2.1: synthesis keystone — top-level entry per D-V21.03
    { name: 'Recommendation', href: `/projects/${projectId}/synthesis`, icon: Trophy, dataKey: 'hasRecommendation' },

    // Steps 1-2: Scope & Requirements
    {
      name: 'Scope & Requirements',
      href: `/projects/${projectId}/requirements`,
      icon: FileText,
      children: [
        { name: 'Problem Statement', href: `/projects/${projectId}/requirements/problem-statement`, icon: Target, dataKey: 'hasProblemStatement' },
        { name: 'Goals & Metrics', href: `/projects/${projectId}/requirements/goals-metrics`, icon: BarChart3, dataKey: 'hasGoalsMetrics' },
        { name: 'User Stories', href: `/projects/${projectId}/requirements/user-stories`, icon: BookOpen, dataKey: 'hasUserStories' },
        { name: 'System Overview', href: `/projects/${projectId}/requirements/system-overview`, icon: Users, dataKey: 'hasSystemOverview' },
        { name: 'Non-Functional Req.', href: `/projects/${projectId}/requirements/nfr`, icon: Shield, dataKey: 'hasNfr' },
        { name: 'Data Flows', href: `/projects/${projectId}/requirements/data-flows`, icon: Waves, dataKey: 'hasDataFlows' },
        { name: 'Open Questions', href: `/projects/${projectId}/requirements/open-questions`, icon: HelpCircle, dataKey: 'hasOpenQuestions' },
      ],
    },

    // Steps 3-6: System Architecture
    {
      name: 'System Architecture',
      icon: Workflow,
      children: [
        { name: 'FFBD', href: `/projects/${projectId}/system-design/ffbd`, icon: Workflow, dataKey: 'hasFfbd' },
        { name: 'Decision Matrix', href: `/projects/${projectId}/system-design/decision-matrix`, icon: Scale, dataKey: 'hasDecisionMatrix' },
        // v2.1: Decision Network is a sibling to Decision Matrix (not a rename — both coexist per critique iter-1)
        { name: 'Decision Network', href: `/projects/${projectId}/system-design/decision-network`, icon: GitGraph, dataKey: 'hasDecisionNetwork' },
        { name: 'House of Quality', href: `/projects/${projectId}/system-design/qfd`, icon: Grid3X3, dataKey: 'hasQfd' },
        { name: 'Form-Function Map', href: `/projects/${projectId}/system-design/form-function-map`, icon: Layers, dataKey: 'hasFormFunctionMap' },
        { name: 'Interfaces', href: `/projects/${projectId}/system-design/interfaces`, icon: Network, dataKey: 'hasInterfaces' },
        // v2.1 (D-V21.15): FMEA promoted into nav
        { name: 'FMEA', href: `/projects/${projectId}/system-design/fmea`, icon: AlertTriangle, dataKey: 'hasFmea' },
      ],
    },

    // Diagrams: deprecated-not-deleted. Legacy projects with extractedData.diagrams.* still navigate here.
    { name: 'Diagrams', href: `/projects/${projectId}/diagrams`, icon: GitBranch, dataKey: 'hasDiagrams', deprecated: true },

    // Implementation: Generated AFTER interfaces are defined.
    // v2.1 P4: Infrastructure absorbed into Tech Stack as inline Mermaid.
    {
      name: 'Implementation',
      icon: Server,
      children: [
        { name: 'Architecture Diagram', href: `/projects/${projectId}/requirements/architecture`, icon: Layers, dataKey: 'hasArchitecture' },
        { name: 'Tech Stack', href: `/projects/${projectId}/requirements/tech-stack`, icon: Code, dataKey: 'hasTechStack' },
        { name: 'Database Schema', href: `/projects/${projectId}/backend/schema`, icon: Database, dataKey: 'hasSchema' },
        { name: 'API Specification', href: `/projects/${projectId}/backend/api-spec`, icon: Code, dataKey: 'hasApiSpec' },
        { name: 'Coding Guidelines', href: `/projects/${projectId}/backend/guidelines`, icon: FileText, dataKey: 'hasGuidelines' },
      ],
    },

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
