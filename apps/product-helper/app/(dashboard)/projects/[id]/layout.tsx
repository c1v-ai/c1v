/**
 * Project Detail Layout
 *
 * Purpose: Provide explorer sidebar navigation for project sub-routes
 * Pattern: Server component layout that fetches explorer data and passes to client sidebar
 *
 * Replaces the previous flat tab navigation with a collapsible tree sidebar
 * matching Epic.dev's project explorer paradigm.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ExplorerSidebar, MobileExplorer } from '@/components/projects/explorer';
import { getExplorerData } from '@/lib/db/queries/explorer';

function ExplorerSkeleton() {
  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 h-full border-r animate-pulse"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="p-4 space-y-3">
        <div
          className="h-4 w-24 rounded"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
        <div
          className="h-6 w-40 rounded"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              marginLeft: i > 0 && i < 5 ? 16 : 0,
            }}
          />
        ))}
      </div>
    </aside>
  );
}

async function ExplorerLoader({
  projectId,
  children,
}: {
  projectId: number;
  children: React.ReactNode;
}) {
  const explorerData = await getExplorerData(projectId);

  if (!explorerData) {
    notFound();
  }

  return (
    <div
      className="flex-1 flex min-h-0"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <ExplorerSidebar projectId={projectId} data={explorerData} />
      <MobileExplorer projectId={projectId} data={explorerData} />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div
          className="flex-1 flex min-h-0"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <ExplorerSkeleton />
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      }
    >
      <ExplorerLoader projectId={projectId}>{children}</ExplorerLoader>
    </Suspense>
  );
}
