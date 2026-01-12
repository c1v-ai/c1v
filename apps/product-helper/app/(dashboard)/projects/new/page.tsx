import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects/project-form';
import { ArrowLeft } from 'lucide-react';

export default function NewProjectPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>

          <h1
            className="text-2xl lg:text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Create New Project
          </h1>
          <p
            className="text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Start a new PRD project by providing a name and vision statement
          </p>
        </div>

        <ProjectForm mode="create" />
      </div>
    </section>
  );
}
