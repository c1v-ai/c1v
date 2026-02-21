import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects/project-form';
import { getProjectById } from '@/app/actions/projects';
import { ArrowLeft } from 'lucide-react';

function EditFormSkeleton() {
  return (
    <div className="h-96 bg-muted rounded-lg animate-pulse" />
  );
}

async function EditForm({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return <ProjectForm mode="edit" project={project} />;
}

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>

          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Edit Project
          </h1>
          <p className="text-muted-foreground">
            Update your project details
          </p>
        </div>

        <Suspense fallback={<EditFormSkeleton />}>
          <EditForm projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
