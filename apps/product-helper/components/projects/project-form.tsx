'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { createProject, updateProject } from '@/app/actions/projects';
import { type Project } from '@/lib/db/schema';

interface ProjectFormProps {
  project?: Project;
  mode: 'create' | 'edit';
}

type ActionState = {
  error?: string;
  success?: string;
};

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const action = mode === 'create' ? createProject : updateProject;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
          {mode === 'create' ? 'Create New Project' : 'Edit Project'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {mode === 'edit' && project && (
            <input type="hidden" name="id" value={project.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Task Management App"
              defaultValue={project?.name || ''}
              required
              maxLength={255}
              disabled={isPending}
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <p className="text-xs text-muted-foreground">
              A clear, concise name for your product
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">
              Product Vision <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="vision"
              name="vision"
              placeholder="Describe your product vision in detail. What problem does it solve? Who is it for? What are the key goals?"
              defaultValue={project?.vision || ''}
              required
              minLength={10}
              maxLength={5000}
              disabled={isPending}
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters, maximum 5000 characters
            </p>
          </div>

          {state?.error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-300">
                {state.error}
              </p>
            </div>
          )}

          {state?.success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                {state.success}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
              className="hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Create Project' : 'Save Changes'}</>
              )}
            </Button>

            {mode === 'edit' && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
