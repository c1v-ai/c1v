'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SectionReviewStatus } from '@/lib/db/schema/v2-types';

interface SectionStatusActionsProps {
  projectId: number;
  sectionKey: string;
  currentStatus: SectionReviewStatus | undefined;
  /** Only show actions when the section has content. */
  hasData: boolean;
}

export function SectionStatusActions({
  projectId,
  sectionKey,
  currentStatus,
  hasData,
}: SectionStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(
    async (newStatus: SectionReviewStatus) => {
      setIsUpdating(true);
      try {
        const response = await fetch(
          `/api/projects/${projectId}/sections/status`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sectionKey, status: newStatus }),
          },
        );
        if (response.ok) {
          router.refresh();
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [projectId, sectionKey, router],
  );

  if (!hasData) return null;

  const status = currentStatus ?? 'draft';

  // Draft / undefined: offer to submit for review
  if (status === 'draft') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        disabled={isUpdating}
        onClick={() => updateStatus('awaiting-review')}
      >
        Submit for Review
      </Button>
    );
  }

  // Awaiting review: offer approve or return to draft
  if (status === 'awaiting-review') {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={isUpdating}
          onClick={() => updateStatus('draft')}
        >
          Back to Draft
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
          disabled={isUpdating}
          onClick={() => updateStatus('approved')}
        >
          Approve
        </Button>
      </div>
    );
  }

  // Approved: show indicator with option to reopen
  if (status === 'approved') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3.5 w-3.5" />
          Approved
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          disabled={isUpdating}
          onClick={() => updateStatus('draft')}
        >
          Reopen
        </Button>
      </div>
    );
  }

  return null;
}
