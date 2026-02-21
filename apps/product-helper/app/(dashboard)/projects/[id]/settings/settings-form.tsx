'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Save, Trash2, Archive, AlertTriangle, CheckCircle } from 'lucide-react';
import { updateProject, deleteProject } from '@/app/actions/projects';
import { type Project } from '@/lib/db/schema';

interface ProjectSettingsFormProps {
  project: Project;
}

type ActionState = {
  error?: string;
  success?: string;
};

const statusOptions = [
  { value: 'intake', label: 'Intake', description: 'Initial requirements gathering phase' },
  { value: 'in_progress', label: 'In Progress', description: 'Active development and refinement' },
  { value: 'validation', label: 'Validation', description: 'Requirements verification phase' },
  { value: 'completed', label: 'Completed', description: 'Project requirements finalized' },
  { value: 'archived', label: 'Archived', description: 'Project is archived and read-only' },
] as const;

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(project.status);

  const [updateState, updateFormAction, isUpdating] = useActionState<ActionState, FormData>(
    updateProject,
    {}
  );

  const [deleteState, deleteFormAction, isDeleting] = useActionState<ActionState, FormData>(
    deleteProject,
    {}
  );

  const handleArchive = async () => {
    const formData = new FormData();
    formData.append('id', project.id.toString());
    formData.append('name', project.name);
    formData.append('vision', project.vision);
    formData.append('status', 'archived');
    updateFormAction(formData);
    setShowArchiveConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Project Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Project Information
          </CardTitle>
          <CardDescription>
            Update your project details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateFormAction} className="space-y-6">
            <input type="hidden" name="id" value={project.id} />

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Task Management App"
                defaultValue={project.name}
                required
                maxLength={255}
                disabled={isUpdating}
                              />
            </div>

            {/* Vision Statement */}
            <div className="space-y-2">
              <Label htmlFor="vision">
                Vision Statement <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="vision"
                name="vision"
                placeholder="Describe your product vision..."
                defaultValue={project.vision}
                required
                minLength={10}
                maxLength={5000}
                disabled={isUpdating}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters, maximum 5000 characters
              </p>
            </div>

            {/* Project Status */}
            <div className="space-y-3">
              <Label>Project Status</Label>
              <RadioGroup
                name="status"
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={isUpdating}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStatus === option.value
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => !isUpdating && setSelectedStatus(option.value)}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`status-${option.value}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`status-${option.value}`}
                        className="cursor-pointer font-medium"
                                              >
                        {option.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Success/Error Messages */}
            {updateState?.error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-300">
                    {updateState.error}
                  </p>
                </div>
              </div>
            )}

            {updateState?.success && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-300">
                    {updateState.success}
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle
              className="text-red-600 dark:text-red-400"
                          >
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Archive Project */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-muted">
            <div className="flex-1">
              <h4
                className="font-medium mb-1"
                              >
                Archive Project
              </h4>
              <p className="text-sm text-muted-foreground">
                Mark this project as archived. You can unarchive it later by changing the status.
              </p>
            </div>

            {!showArchiveConfirm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowArchiveConfirm(true)}
                disabled={project.status === 'archived' || isUpdating}
                className="shrink-0"
              >
                <Archive className="mr-2 h-4 w-4" />
                {project.status === 'archived' ? 'Already Archived' : 'Archive'}
              </Button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleArchive}
                  disabled={isUpdating}
                  className="border-yellow-500 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirm Archive'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowArchiveConfirm(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Delete Project */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="flex-1">
              <h4
                className="font-medium mb-1 text-red-700 dark:text-red-400"
                              >
                Delete Project
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all associated data. This action cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="shrink-0"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            ) : (
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                    Are you sure you want to delete &quot;{project.name}&quot;?
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    All conversations, extracted data, and artifacts will be permanently deleted.
                  </p>
                </div>

                {deleteState?.error && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {deleteState.error}
                  </p>
                )}

                <form action={deleteFormAction} className="flex gap-2">
                  <input type="hidden" name="id" value={project.id} />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isDeleting}
                    className="flex-1 sm:flex-none"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Yes, Delete
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
