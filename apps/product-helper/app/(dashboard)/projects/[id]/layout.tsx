'use client';

/**
 * Project Detail Layout (Phase 12)
 *
 * Purpose: Provide tab navigation for project sub-routes
 * Pattern: Client component layout with URL-based active tab detection
 * Team: Frontend (Agent 2.1: UI Engineer)
 *
 * Tabs:
 * - Overview: Project detail page
 * - Chat: Conversational intake
 * - Data: Extracted PRD data view
 * - Diagrams: Generated Mermaid diagrams
 * - Settings: Project settings
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { use, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  LayoutDashboard,
  MessageSquare,
  Database,
  GitBranch,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Tab {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

function getTabsForProject(projectId: string): Tab[] {
  return [
    {
      name: 'Overview',
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Chat',
      href: `/projects/${projectId}/chat`,
      icon: MessageSquare,
    },
    {
      name: 'Data',
      href: `/projects/${projectId}/data`,
      icon: Database,
    },
    {
      name: 'Diagrams',
      href: `/projects/${projectId}/diagrams`,
      icon: GitBranch,
    },
    {
      name: 'Settings',
      href: `/projects/${projectId}/settings`,
      icon: Settings,
    },
  ];
}

function isTabActive(tab: Tab, pathname: string): boolean {
  if (tab.exact) {
    return pathname === tab.href;
  }
  return pathname.startsWith(tab.href);
}

interface ProjectHeaderProps {
  projectId: string;
}

function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const { data: project, isLoading, error } = useSWR(
    `/api/projects/${projectId}`,
    fetcher
  );
  const pathname = usePathname();
  const tabs = getTabsForProject(projectId);

  return (
    <div
      className="border-b"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Back button and project name */}
        <div className="py-4">
          <Button variant="ghost" asChild className="mb-3 -ml-2">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div
                className="h-8 w-48 rounded animate-pulse"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              />
            ) : error ? (
              <h1
                className="text-2xl font-bold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                }}
              >
                Project
              </h1>
            ) : (
              <>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {project?.name || 'Project'}
                </h1>
                {project?.status && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      project.status === 'completed' &&
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                      project.status === 'intake' &&
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                      project.status === 'in_progress' &&
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                      project.status === 'validation' &&
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                    )}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = isTabActive(tab, pathname);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-current'
                    : 'border-transparent hover:border-current/30'
                )}
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = use(params);

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Suspense
        fallback={
          <div
            className="h-32 animate-pulse"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        }
      >
        <ProjectHeader projectId={id} />
      </Suspense>
      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
    </div>
  );
}
