'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { createProject, updateProject } from '@/app/actions/projects';
import {
  type Project,
  PROJECT_TYPES,
  PROJECT_STAGES,
  USER_ROLES,
  BUDGET_RANGES,
} from '@/lib/db/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectFormProps {
  project?: Project;
  mode: 'create' | 'edit';
}

type ActionState = {
  error?: string;
  success?: string;
  projectId?: number;
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  saas: 'SaaS',
  'mobile-app': 'Mobile App',
  marketplace: 'Marketplace',
  'api-service': 'API Service',
  'e-commerce': 'E-Commerce',
  'internal-tool': 'Internal Tool',
  'open-source': 'Open Source',
  other: 'Other',
};

const PROJECT_STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  prototype: 'Prototype',
  mvp: 'MVP',
  growth: 'Growth',
  mature: 'Mature',
};

const USER_ROLE_LABELS: Record<string, string> = {
  founder: 'Founder',
  'product-manager': 'Product Manager',
  developer: 'Developer',
  designer: 'Designer',
  other: 'Other',
};

const BUDGET_LABELS: Record<string, string> = {
  bootstrap: 'Bootstrap ($0-10K)',
  seed: 'Seed ($10K-100K)',
  'series-a': 'Series A ($100K-1M)',
  enterprise: 'Enterprise ($1M+)',
  undecided: 'Undecided',
};

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const action = mode === 'create' ? createProject : updateProject;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  const [projectType, setProjectType] = useState(project?.projectType || '');
  const [projectStage, setProjectStage] = useState(project?.projectStage || '');
  const [userRole, setUserRole] = useState(project?.userRole || '');
  const [budget, setBudget] = useState(project?.budget || '');

  // Handle navigation after successful project creation
  useEffect(() => {
    if (state?.success && state?.projectId) {
      router.push(`/projects/${state.projectId}`);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
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
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters, maximum 5000 characters
            </p>
          </div>

          {/* Project Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <input type="hidden" name="projectType" value={projectType} />
              <Select
                value={projectType}
                onValueChange={setProjectType}
                disabled={isPending}
              >
                <SelectTrigger id="projectType" className="w-full">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PROJECT_TYPE_LABELS[type] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectStage">Project Stage</Label>
              <input type="hidden" name="projectStage" value={projectStage} />
              <Select
                value={projectStage}
                onValueChange={setProjectStage}
                disabled={isPending}
              >
                <SelectTrigger id="projectStage" className="w-full">
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {PROJECT_STAGE_LABELS[stage] || stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRole">Your Role</Label>
              <input type="hidden" name="userRole" value={userRole} />
              <Select
                value={userRole}
                onValueChange={setUserRole}
                disabled={isPending}
              >
                <SelectTrigger id="userRole" className="w-full">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {USER_ROLE_LABELS[role] || role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <input type="hidden" name="budget" value={budget} />
              <Select
                value={budget}
                onValueChange={setBudget}
                disabled={isPending}
              >
                <SelectTrigger id="budget" className="w-full">
                  <SelectValue placeholder="Select budget..." />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {BUDGET_LABELS[range] || range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              className="bg-accent text-accent-foreground hover:bg-accent/90"
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
