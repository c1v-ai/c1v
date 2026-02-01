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
    <div
      className="mt-3 rounded-md border p-3"
      style={{
        borderColor: 'var(--accent)',
        backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)',
      }}
    >
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {isRegenerate ? 'Confirm Regeneration' : 'Approval Required'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {isRegenerate
              ? `This will regenerate "${stageName}" using AI. The existing output will be replaced.`
              : `Generate "${stageName}" using AI? This will consume tokens and may take a moment.`}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onApprove}
              className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              {isRegenerate ? 'Regenerate' : 'Approve & Generate'}
            </button>
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
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
      return <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />;
    }
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success, #22c55e)' }} />;
      case 'ready':
        return <Circle className="w-5 h-5" style={{ color: 'var(--accent)' }} />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />;
      case 'locked':
        return <Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />;
      case 'error':
        return <AlertCircle className="w-5 h-5" style={{ color: 'var(--error, #ef4444)' }} />;
      default:
        return <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const isActionable = stage.status === 'ready' || stage.status === 'error';
  const isRegeneratable = stage.status === 'completed';

  return (
    <div
      className="rounded-lg border p-4 transition-colors"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: stage.status === 'ready' ? 'var(--accent)' : 'var(--border)',
        opacity: stage.status === 'locked' ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{statusIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-medium text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              {stage.name}
            </h3>
            {stage.status === 'completed' && stage.reviewStatus === 'approved' && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#dcfce7', color: '#166534' }}
              >
                Approved
              </span>
            )}
            {stage.status === 'completed' && stage.reviewStatus === 'awaiting-review' && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
              >
                Awaiting Review
              </span>
            )}
            {stage.status === 'completed' && (!stage.reviewStatus || stage.reviewStatus === 'draft') && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--success, #22c55e)',
                  color: 'white',
                }}
              >
                Done
              </span>
            )}
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {stage.description}
          </p>

          {error && (
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--error, #ef4444)' }}
            >
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
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  Generate
                </button>
              )}
              {isRegeneratable && !isLoading && (
                <button
                  onClick={() => handleRequestAction('regenerate')}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              )}
              {isRegeneratable && !isLoading && stage.reviewStatus !== 'approved' && onReviewStatusChange && (
                <button
                  onClick={() => onReviewStatusChange(stage.id, 'approved')}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Approve
                </button>
              )}
              {stage.status === 'locked' && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
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
