'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProject } from '@/app/actions/projects';
import { useState } from 'react';

interface DeleteProjectButtonProps {
  projectId: number;
  projectName: string;
}

type ActionState = {
  error?: string;
  success?: string;
};

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    deleteProject,
    {}
  );

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-md bg-red-50 dark:bg-red-900/20">
        <p className="text-sm font-medium">
          Delete "{projectName}"?
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          This action cannot be undone. All conversations, data, and artifacts will be permanently deleted.
        </p>
        {state?.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-2">
            {state.error}
          </p>
        )}
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="id" value={projectId} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Confirm Delete
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Delete
    </Button>
  );
}
