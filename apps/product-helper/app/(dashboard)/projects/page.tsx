import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { getProjects } from '@/app/actions/projects';
import { FolderPlus, Loader2 } from 'lucide-react';

function ProjectsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <FolderPlus className="w-8 h-8" style={{ color: 'var(--accent)' }} />
      </div>
      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        No Projects Yet
      </h2>
      <p
        className="text-center text-muted-foreground mb-6 max-w-md"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        Create your first PRD project to get started with conversational requirements gathering and AI-powered documentation.
      </p>
      <Button asChild style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}>
        <Link href="/projects/new">
          <FolderPlus className="mr-2 h-4 w-4" />
          Create First Project
        </Link>
      </Button>
    </div>
  );
}

async function ProjectsList() {
  const projects = await getProjects();

  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Projects
          </h1>
          <p
            className="text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Manage your Product Requirements Documents
          </p>
        </div>
        <Button
          asChild
          style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
          className="hover:opacity-90"
        >
          <Link href="/projects/new">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsList />
      </Suspense>
    </section>
  );
}
