'use client';

import { CheckCircle2, Clock, FileEdit } from 'lucide-react';

// ============================================================
// Types
// ============================================================

export type ReviewStatus = 'draft' | 'awaiting-review' | 'approved';

export interface ReviewStatusMap {
  [sectionKey: string]: ReviewStatus;
}

// ============================================================
// Component
// ============================================================

const STATUS_CONFIG: Record<ReviewStatus, {
  label: string;
  icon: typeof CheckCircle2;
  bgColor: string;
  textColor: string;
}> = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    bgColor: 'var(--bg-secondary)',
    textColor: 'var(--text-muted)',
  },
  'awaiting-review': {
    label: 'Awaiting Review',
    icon: Clock,
    bgColor: '#fef3c7',
    textColor: '#92400e',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    bgColor: '#dcfce7',
    textColor: '#166534',
  },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
