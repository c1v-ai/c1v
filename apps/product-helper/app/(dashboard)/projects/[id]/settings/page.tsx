import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getProjectById } from '@/app/actions/projects';
import { ArrowLeft, Settings } from 'lucide-react';
import { ProjectSettingsForm } from './settings-form';

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}

async function SettingsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return <ProjectSettingsForm project={project} />;
}

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectSettingsPage({ params }: SettingsPageProps) {
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

          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-accent" />
            <h1 className="text-2xl lg:text-3xl font-bold">
              Project Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your project configuration and settings
          </p>
        </div>

        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
