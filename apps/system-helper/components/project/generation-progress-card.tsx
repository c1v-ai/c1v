'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectChat } from './project-chat-provider';

// ============================================================
// Stage computation
// ============================================================

interface StageInfo {
  label: string;
  index: number;
  total: number;
  progress: number; // 0-100
}

function computeStage(
  isLoading: boolean,
  postPhase: 'idle' | 'saving' | 'complete',
  hasDiagram: boolean,
  elapsedMs: number
): StageInfo {
  const total = 4;

  if (postPhase === 'complete') {
    return { label: 'Complete', index: total, total, progress: 100 };
  }
  if (postPhase === 'saving') {
    return { label: 'Saving & extracting data', index: total, total, progress: 90 };
  }

  // During streaming
  if (hasDiagram) {
    return { label: 'Creating diagrams', index: 3, total, progress: 75 };
  }
  if (elapsedMs > 8000) {
    return { label: 'Generating response', index: 3, total, progress: 65 };
  }
  if (elapsedMs > 3000) {
    return { label: 'Processing requirements', index: 2, total, progress: 40 };
  }
  return { label: 'Analyzing your message', index: 1, total, progress: 15 };
}

function formatRemaining(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  return `${seconds}s`;
}

// ============================================================
// Component
// ============================================================

const ESTIMATED_TOTAL_MS = 15000; // average generation cycle

export function GenerationProgressCard() {
  const {
    isLoading,
    generationStartedAt,
    postGenerationPhase,
    messages,
  } = useProjectChat();

  const [elapsed, setElapsed] = useState(0);

  // Tick elapsed timer
  useEffect(() => {
    if (!generationStartedAt) {
      setElapsed(0);
      return;
    }
    // Set immediately to avoid flicker
    setElapsed(Date.now() - generationStartedAt);
    const interval = setInterval(() => {
      setElapsed(Date.now() - generationStartedAt);
    }, 200);
    return () => clearInterval(interval);
  }, [generationStartedAt]);

  // Detect mermaid diagrams in the streaming response
  const hasStreamingDiagram = useMemo(() => {
    if (!isLoading) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg?.role === 'assistant' && lastMsg.content.includes('```mermaid');
  }, [messages, isLoading]);

  // Visibility
  const isActive = isLoading || postGenerationPhase !== 'idle';
  if (!isActive || !generationStartedAt) return null;

  const stage = computeStage(isLoading, postGenerationPhase, hasStreamingDiagram, elapsed);
  const isComplete = postGenerationPhase === 'complete';
  const estimatedRemaining = Math.max(0, ESTIMATED_TOTAL_MS - elapsed);

  // Title based on phase
  const title = isComplete
    ? 'Generation Complete'
    : postGenerationPhase === 'saving'
      ? 'Processing Data...'
      : 'Generating Response...';

  return (
    <div
      className={cn(
        'mx-3 mt-2 rounded-lg border p-3 transition-all duration-300',
        isComplete ? 'opacity-80' : 'opacity-100'
      )}
      style={{
        backgroundColor: isComplete
          ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-primary))'
          : 'color-mix(in srgb, var(--accent) 12%, var(--bg-primary))',
        borderColor: isComplete
          ? 'color-mix(in srgb, var(--accent) 20%, var(--border))'
          : 'color-mix(in srgb, var(--accent) 30%, var(--border))',
      }}
    >
      {/* Top row: icon + title + badge */}
      <div className="flex items-center gap-2.5">
        {isComplete ? (
          <CheckCircle2
            className="h-5 w-5 flex-shrink-0"
            style={{ color: 'var(--accent)' }}
          />
        ) : (
          <Loader2
            className="h-5 w-5 flex-shrink-0 animate-spin"
            style={{ color: 'var(--accent)' }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              {title}
            </span>
            <span
              className={cn(
                'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                isComplete
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
              )}
            >
              {isComplete ? 'Done' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Stage + time estimate */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>
          Stage {stage.index}/{stage.total}: {stage.label}
        </span>
        {!isComplete && (
          <span
            className="flex items-center gap-1 tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            <Sparkles className="h-3 w-3" />
            ~{formatRemaining(estimatedRemaining)} remaining
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div
        className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--bg-secondary))' }}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            !isComplete && 'animate-pulse'
          )}
          style={{
            width: `${stage.progress}%`,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
