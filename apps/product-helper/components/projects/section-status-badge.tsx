'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SectionReviewStatus } from '@/lib/db/schema/v2-types';

interface SectionStatusBadgeProps {
  status: SectionReviewStatus | undefined;
  /** When true, renders a small colored dot instead of a full badge. */
  compact?: boolean;
}

const statusConfig: Record<
  SectionReviewStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  draft: {
    label: 'Draft',
    dotClass: 'bg-gray-400',
    badgeClass:
      'border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
  'awaiting-review': {
    label: 'Awaiting Review',
    dotClass: 'bg-amber-400',
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  approved: {
    label: 'Approved',
    dotClass: 'bg-green-500',
    badgeClass:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
};

export function SectionStatusBadge({ status, compact = false }: SectionStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];

  // Compact mode: draft shows nothing; others show a small dot
  if (compact) {
    if (status === 'draft') return null;
    return (
      <span
        className={cn('w-2 h-2 rounded-full shrink-0', config.dotClass)}
        aria-label={config.label}
      />
    );
  }

  return (
    <Badge
      className={cn(
        'text-[11px] font-medium px-2 py-0 h-5 pointer-events-none',
        config.badgeClass,
      )}
    >
      {config.label}
    </Badge>
  );
}
