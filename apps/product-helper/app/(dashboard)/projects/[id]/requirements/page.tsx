import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { PRDOverview } from '@/components/projects/prd-overview';
import { Card, CardContent } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function PRDOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
        </div>
      </div>

      {/* Accordion skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

interface RequirementsPageProps {
  params: Promise<{ id: string }>;
}

async function RequirementsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Cast projectData to the expected type (DB returns unknown for JSONB fields)
  const projectData = project.projectData as Parameters<typeof PRDOverview>[0]['projectData'];

  return (
    <PRDOverview
      projectId={projectId}
      projectName={project.name}
      projectStatus={project.status}
      projectData={projectData}
      generatedAt={project.createdAt}
    />
  );
}

export default async function RequirementsPage({ params }: RequirementsPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <div className="p-4 pb-20 md:pb-8 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<PRDOverviewSkeleton />}>
          <RequirementsContent projectId={projectId} />
        </Suspense>
      </div>
    </div>
  );
}
