'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export type PipelineStageStatus =
  | 'completed'
  | 'ready'
  | 'in_progress'
  | 'locked'
  | 'error';

export type ReviewStatus = 'draft' | 'awaiting-review' | 'approved';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: PipelineStageStatus;
  apiEndpoint: string;
  /** Stages that must be completed before this one can run */
  dependsOn: string[];
  /** Current review workflow status */
  reviewStatus?: ReviewStatus;
}

interface PipelineCardProps {
  stage: PipelineStage;
  projectId: number;
  onGenerate: (stageId: string) => Promise<void>;
  onRegenerate: (stageId: string) => Promise<void>;
  onReviewStatusChange?: (stageId: string, status: ReviewStatus) => void;
}

// ============================================================
// Approval Gate Dialog
// ============================================================

function ApprovalGate({
  stageName,
  isRegenerate,
  onApprove,
  onCancel,
}: {
  stageName: string;
  isRegenerate: boolean;
  onApprove: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-xs font-medium text-foreground">
            {isRegenerate ? 'Confirm Regeneration' : 'Approval Required'}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {isRegenerate
              ? `This will regenerate "${stageName}" using AI. The existing output will be replaced.`
              : `Generate "${stageName}" using AI? This will consume tokens and may take a moment.`}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onApprove}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors bg-primary text-primary-foreground"
            >
              {isRegenerate ? 'Regenerate' : 'Approve & Generate'}
            </button>
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 bg-transparent text-muted-foreground border border-border"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Component
// ============================================================

export function PipelineCard({
  stage,
  projectId,
  onGenerate,
  onRegenerate,
  onReviewStatusChange,
}: PipelineCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'generate' | 'regenerate' | null>(null);

  const handleRequestAction = (action: 'generate' | 'regenerate') => {
    setError(null);
    setPendingAction(action);
  };

  const handleApprove = async () => {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    setIsLoading(true);
    setError(null);
    try {
      if (action === 'generate') {
        await onGenerate(stage.id);
      } else {
        await onRegenerate(stage.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPendingAction(null);
  };

  const statusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
    }
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />;
      case 'ready':
        return <Circle className="w-5 h-5 text-primary" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const isActionable = stage.status === 'ready' || stage.status === 'error';
  const isRegeneratable = stage.status === 'completed';

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors bg-card",
        stage.status === 'ready' ? 'border-primary' : 'border-border',
        stage.status === 'locked' && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{statusIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm text-foreground">
              {stage.name}
            </h3>
            {stage.status === 'completed' && stage.reviewStatus === 'approved' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Approved
              </span>
            )}
            {stage.status === 'completed' && stage.reviewStatus === 'awaiting-review' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Awaiting Review
              </span>
            )}
            {stage.status === 'completed' && (!stage.reviewStatus || stage.reviewStatus === 'draft') && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                Done
              </span>
            )}
          </div>
          <p className="text-xs mt-1 text-muted-foreground">
            {stage.description}
          </p>

          {error && (
            <p className="text-xs mt-2 text-destructive">
              {error}
            </p>
          )}

          {/* Approval Gate */}
          {pendingAction && (
            <ApprovalGate
              stageName={stage.name}
              isRegenerate={pendingAction === 'regenerate'}
              onApprove={handleApprove}
              onCancel={handleCancel}
            />
          )}

          {/* Action Buttons */}
          {!pendingAction && (
            <div className="mt-3 flex gap-2">
              {isActionable && !isLoading && (
                <button
                  onClick={() => handleRequestAction('generate')}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors bg-primary text-primary-foreground"
                >
                  Generate
                </button>
              )}
              {isRegeneratable && !isLoading && (
                <button
                  onClick={() => handleRequestAction('regenerate')}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 bg-transparent text-muted-foreground border border-border"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              )}
              {isRegeneratable && !isLoading && stage.reviewStatus !== 'approved' && onReviewStatusChange && (
                <button
                  onClick={() => onReviewStatusChange(stage.id, 'approved')}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 bg-transparent text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Approve
                </button>
              )}
              {stage.status === 'locked' && (
                <span className="text-xs text-muted-foreground">
                  Complete {stage.dependsOn.join(', ')} first
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
