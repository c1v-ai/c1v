'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectChat } from './project-chat-provider';
import { ThinkingState } from '@/components/education/thinking-state';
import { nodeThinkingMessages } from '@/lib/education/knowledge-bank';

// ============================================================
// Stage computation
// ============================================================

interface StageInfo {
  label: string;
  index: number;
  total: number;
  progress: number; // 0-100
}

/** Map LangGraph node names to user-facing stage info */
const NODE_STAGE: Record<string, { label: string; index: number; progress: number }> = {
  analyze_response: { label: 'Reading your response', index: 1, progress: 15 },
  extract_data: { label: 'Building requirements data', index: 2, progress: 35 },
  compute_next_question: { label: 'Preparing next question', index: 3, progress: 55 },
  check_prd_spec: { label: 'Checking quality gates', index: 4, progress: 70 },
  generate_artifact: { label: 'Building diagrams & artifacts', index: 5, progress: 85 },
  generate_response: { label: 'Writing response', index: 6, progress: 92 },
};

const TOTAL_STAGES = 6;

function computeStage(
  postPhase: 'idle' | 'saving' | 'complete',
  currentNode: string | null,
  hasDiagram: boolean,
  elapsedMs: number
): StageInfo {
  if (postPhase === 'complete') {
    return { label: 'Complete', index: TOTAL_STAGES, total: TOTAL_STAGES, progress: 100 };
  }
  if (postPhase === 'saving') {
    return { label: 'Saving & extracting data', index: TOTAL_STAGES, total: TOTAL_STAGES, progress: 95 };
  }

  // Use real node info from stream markers when available
  if (currentNode && NODE_STAGE[currentNode]) {
    const ns = NODE_STAGE[currentNode];
    return { label: ns.label, index: ns.index, total: TOTAL_STAGES, progress: ns.progress };
  }

  // Fallback: time-based guessing (before first marker arrives)
  if (hasDiagram) {
    return { label: 'Building diagrams & artifacts', index: 5, total: TOTAL_STAGES, progress: 85 };
  }
  if (elapsedMs > 8000) {
    return { label: 'Building requirements data', index: 3, total: TOTAL_STAGES, progress: 55 };
  }
  if (elapsedMs > 3000) {
    return { label: 'Reading your response', index: 2, total: TOTAL_STAGES, progress: 30 };
  }
  return { label: 'Starting...', index: 1, total: TOTAL_STAGES, progress: 10 };
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
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

export function GenerationProgressCard() {
  const {
    isLoading,
    generationStartedAt,
    postGenerationPhase,
    messages,
    currentNode,
  } = useProjectChat();

  const [elapsed, setElapsed] = useState(0);

  // Tick elapsed timer
  useEffect(() => {
    if (!generationStartedAt) {
      setElapsed(0);
      return;
    }
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

  const stage = computeStage(postGenerationPhase, currentNode, hasStreamingDiagram, elapsed);
  const isComplete = postGenerationPhase === 'complete';

  // Title based on phase — show what's actually happening
  const title = isComplete
    ? 'Generation Complete'
    : postGenerationPhase === 'saving'
      ? 'Saving artifacts...'
      : stage.label;

  return (
    <div
      className={cn(
        'mx-3 mt-2 rounded-lg border p-3 transition-all duration-300',
        isComplete ? 'opacity-80' : 'opacity-100'
      )}
      style={{
        backgroundColor: isComplete
          ? 'color-mix(in srgb, hsl(var(--primary)) 8%, hsl(var(--background)))'
          : 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--background)))',
        borderColor: isComplete
          ? 'color-mix(in srgb, hsl(var(--primary)) 20%, hsl(var(--border)))'
          : 'color-mix(in srgb, hsl(var(--primary)) 30%, hsl(var(--border)))',
      }}
    >
      {/* Top row: icon + title + badge */}
      <div className="flex items-center gap-2.5">
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
        ) : (
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-primary" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate text-foreground">
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
      <div className="mt-2 flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">
          Stage {stage.index}/{stage.total}: {stage.label}
        </span>
        {!isComplete && (
          <span className="flex items-center gap-1 tabular-nums shrink-0 text-primary">
            <Sparkles className="h-3 w-3" />
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>
      {!isComplete && (
        <p className="mt-0.5 text-right text-muted-foreground text-[10px]">
          may take 3 - 5 min
        </p>
      )}

      {/* Progress bar */}
      <div
        className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'color-mix(in srgb, hsl(var(--primary)) 15%, hsl(var(--muted)))' }}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            !isComplete && 'animate-pulse'
          )}
          style={{ width: `${stage.progress}%` }}
        />
      </div>

      {/* Node-specific thinking content (only when we know which node is active) */}
      {!isComplete && currentNode && nodeThinkingMessages[currentNode] && (
        <div className="mt-3">
          <ThinkingState messages={nodeThinkingMessages[currentNode]} className="border-0 px-0 py-0" />
        </div>
      )}
    </div>
  );
}
