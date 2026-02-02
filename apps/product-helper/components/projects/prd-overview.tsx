'use client';

/**
 * PRD Overview Component
 *
 * Displays all PRD sections as expandable accordions.
 * Matches the Epic.dev pattern where parent nav shows summary with expandable sections.
 */

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertCircle,
  Users,
  Target,
  Layers,
  Settings,
  Calendar,
  CheckCircle,
} from 'lucide-react';

import { ProblemStatementSection } from './sections/problem-statement-section';
import { ActorsSection } from './sections/actors-section';
import { GoalsMetricsSection } from './sections/goals-metrics-section';
import { ScopeSection } from './sections/scope-section';
import { NfrSection } from './sections/nfr-section';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Actor {
  name: string;
  role: string;
  description: string;
  demographics?: string;
  goals?: string[];
  painPoints?: string[];
  technicalProficiency?: 'low' | 'medium' | 'high';
  usageContext?: string;
}

interface GoalMetric {
  goal: string;
  metric: string;
  target?: string;
}

interface UseCase {
  id?: string;
  name: string;
  actor?: string;
  description?: string;
  priority?: 'must' | 'should' | 'could' | 'wont';
}

interface SystemBoundaries {
  internal?: string[];
  external?: string[];
  inScope?: string[];
  outOfScope?: string[];
}

interface NonFunctionalRequirement {
  category: 'performance' | 'security' | 'scalability' | 'reliability' | 'usability' | 'maintainability' | 'compliance';
  requirement: string;
  metric?: string;
  target?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ProblemStatementData {
  summary: string;
  context: string;
  impact: string;
  goals: string[];
}

interface ReviewStatus {
  approved?: boolean;
  approvedAt?: string;
  approvedBy?: number;
}

interface ProjectData {
  problemStatement?: ProblemStatementData | null;
  actors?: Actor[] | null;
  goalsMetrics?: GoalMetric[] | null;
  useCases?: UseCase[] | null;
  systemBoundaries?: SystemBoundaries | null;
  nonFunctionalRequirements?: NonFunctionalRequirement[] | null;
  completeness?: number;
  reviewStatus?: ReviewStatus | null;
}

interface PRDOverviewProps {
  projectId: number;
  projectName: string;
  projectStatus: string;
  projectData?: ProjectData | null;
  generatedAt?: Date | null;
}

// ---------------------------------------------------------------------------
// Section Configuration
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'problem', title: 'Problem Statement', icon: AlertCircle },
  { id: 'users', title: 'Target Users', icon: Users },
  { id: 'goals', title: 'Goals & Success Metrics', icon: Target },
  { id: 'scope', title: 'Scope', icon: Layers },
  { id: 'nfr', title: 'Non-Functional Requirements', icon: Settings },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Not available';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSectionCount(sectionId: SectionId, projectData?: ProjectData | null): number | null {
  if (!projectData) return null;

  switch (sectionId) {
    case 'problem':
      return projectData.problemStatement ? 1 : 0;
    case 'users':
      return projectData.actors?.length ?? 0;
    case 'goals':
      return projectData.goalsMetrics?.length ?? 0;
    case 'scope':
      return projectData.useCases?.length ?? 0;
    case 'nfr':
      return projectData.nonFunctionalRequirements?.length ?? 0;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Section Content Renderer
// ---------------------------------------------------------------------------

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData?: ProjectData | null;
}

function renderSectionContent(sectionId: SectionId, project: ProjectForSection): React.ReactNode {
  switch (sectionId) {
    case 'problem':
      return <ProblemStatementSection project={project} />;
    case 'users':
      return <ActorsSection project={project} compact />;
    case 'goals':
      return <GoalsMetricsSection project={project} />;
    case 'scope':
      return <ScopeSection project={project} compact />;
    case 'nfr':
      return <NfrSection project={project} />;
    default:
      return <p className="text-sm text-muted-foreground">Section not found</p>;
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PRDOverview({
  projectId,
  projectName,
  projectStatus,
  projectData,
  generatedAt,
}: PRDOverviewProps) {
  const completeness = projectData?.completeness ?? 0;
  const isApproved = projectData?.reviewStatus?.approved ?? false;

  // Create project object for section components
  const project: ProjectForSection = {
    id: projectId,
    name: projectName,
    status: projectStatus,
    projectData,
  };

  // Determine which sections have content to show expanded by default
  const sectionsWithContent = SECTIONS.filter(
    (section) => getSectionCount(section.id, projectData) && getSectionCount(section.id, projectData)! > 0
  ).map((section) => section.id);

  // Default to first section with content, or 'problem' if none
  const defaultExpanded = sectionsWithContent.length > 0 ? [sectionsWithContent[0]] : ['problem'];

  return (
    <div className="space-y-6">
      {/* Header with status badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Product Requirements
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Requirements overview for {projectName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isApproved && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )}
          <Badge variant="secondary">
            AI Generated
          </Badge>
          <Badge variant="outline">
            {completeness}% Complete
          </Badge>
        </div>
      </div>

      {/* Accordion sections */}
      <Accordion type="multiple" defaultValue={defaultExpanded}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const count = getSectionCount(section.id, projectData);

          return (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  <span
                    className="font-medium"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                  >
                    {section.title}
                  </span>
                  {count !== null && count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {count}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  {renderSectionContent(section.id, project)}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Footer with metadata */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t text-sm"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Generated: {formatDate(generatedAt)}</span>
        </div>
        <div>
          Completeness: {completeness}%
        </div>
      </div>
    </div>
  );
}
