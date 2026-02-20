'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Result returned by the Quick Start SSE endpoint on completion. */
export interface QuickStartResult {
  projectId: number;
  completeness: number;
  artifactsGenerated: string[];
}

/** Props for the ProgressCards component. */
export interface ProgressCardsProps {
  /** The project ID to generate a PRD for. */
  projectId: number;
  /** The user's one-sentence project description. */
  userInput: string;
  /** Called when all generation steps have completed successfully. */
  onComplete?: (result: QuickStartResult) => void;
  /** Called when an unrecoverable error occurs during generation. */
  onError?: (error: string) => void;
}

type StepStatus = 'pending' | 'running' | 'complete' | 'error';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  message?: string;
}

const INITIAL_STEPS: Omit<ProgressStep, 'status'>[] = [
  { id: 'synthesis', title: 'Analyzing Project', description: 'Expanding description into requirements' },
  { id: 'extraction', title: 'Extracting PRD Data', description: 'Identifying actors, use cases, entities' },
  { id: 'tech-stack', title: 'Tech Stack', description: 'Recommending technologies' },
  { id: 'user-stories', title: 'User Stories', description: 'Generating development stories' },
  { id: 'db-schema', title: 'Database Schema', description: 'Designing data model' },
  { id: 'api-spec', title: 'API Specification', description: 'Creating REST endpoints' },
  { id: 'validation', title: 'Quality Check', description: 'Validating PRD completeness' },
  { id: 'artifacts', title: 'Diagrams', description: 'Generating architecture diagrams' },
  { id: 'persistence', title: 'Saving', description: 'Persisting PRD data' },
];

/**
 * ProgressCards displays real-time progress during Quick Start PRD generation.
 *
 * Connects to the Quick Start SSE streaming endpoint and renders each generation
 * step as a compact row with an animated status icon. Steps transition through
 * pending -> running -> complete/error as SSE events arrive.
 */
export function ProgressCards({
  projectId,
  userInput,
  onComplete,
  onError,
}: ProgressCardsProps) {
  const [steps, setSteps] = useState<ProgressStep[]>(
    INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' as StepStatus }))
  );
  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);

  const updateStep = useCallback(
    (stepId: string, status: StepStatus, message?: string) => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === stepId ? { ...step, status, message } : step
        )
      );
    },
    []
  );

  useEffect(() => {
    // Prevent double-invocation in React StrictMode
    if (startedRef.current) return;
    startedRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    async function startGeneration() {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/quick-start`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 402) {
            onError?.('credit_limit_reached');
            return;
          }
          const errorText = await response.text().catch(() => 'Unknown error');
          onError?.(errorText || `Server error: ${response.status}`);
          return;
        }

        if (!response.body) {
          onError?.('No response body received');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE lines from the buffer
          const lines = buffer.split('\n');
          // Keep incomplete last line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const event = JSON.parse(data);
                handleSSEEvent(event);
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data !== '[DONE]') {
              try {
                const event = JSON.parse(data);
                handleSSEEvent(event);
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Connection failed';
        onError?.(message);
      }
    }

    function handleSSEEvent(event: Record<string, unknown>) {
      const { type, step, status, message, result } = event as {
        type?: string;
        step?: string;
        status?: StepStatus;
        message?: string;
        result?: QuickStartResult;
      };

      if (type === 'step' && step && status) {
        updateStep(step, status, message);
      }

      if (type === 'complete' && result) {
        onComplete?.(result);
      }

      if (type === 'error') {
        const errorMsg =
          typeof message === 'string' ? message : 'Generation failed';
        onError?.(errorMsg);
      }
    }

    startGeneration();

    return () => {
      controller.abort();
    };
    // Dependencies are stable refs / primitives; callbacks are memoized or stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, userInput]);

  return (
    <ul
      className="flex flex-col gap-1"
      role="list"
      aria-label="PRD generation progress"
      aria-live="polite"
    >
      {steps.map((step) => (
        <li key={step.id} className="flex items-start gap-3 py-2 px-1">
          <StepIcon status={step.status} />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium leading-tight',
                step.status === 'pending' && 'opacity-50'
              )}
              style={{
                color:
                  step.status === 'error'
                    ? 'hsl(var(--destructive))'
                    : 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {step.title}
            </p>
            <p
              className={cn(
                'text-xs leading-snug mt-0.5',
                step.status === 'pending' && 'opacity-40'
              )}
              style={{ color: 'var(--text-muted)' }}
            >
              {step.message || step.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders the appropriate icon for a step's current status.
 * Uses animated transitions for a polished feel.
 */
function StepIcon({ status }: { status: StepStatus }) {
  const baseClass = 'mt-0.5 shrink-0';

  switch (status) {
    case 'running':
      return (
        <Loader2
          className={cn(baseClass, 'h-4 w-4 animate-spin')}
          style={{ color: 'hsl(var(--primary))' }}
          aria-hidden="true"
        />
      );
    case 'complete':
      return (
        <CheckCircle
          className={cn(baseClass, 'h-4 w-4')}
          style={{ color: 'hsl(var(--chart-2))' }}
          aria-hidden="true"
        />
      );
    case 'error':
      return (
        <AlertCircle
          className={cn(baseClass, 'h-4 w-4')}
          style={{ color: 'hsl(var(--destructive))' }}
          aria-hidden="true"
        />
      );
    case 'pending':
    default:
      return (
        <Circle
          className={cn(baseClass, 'h-4 w-4 opacity-30')}
          style={{ color: 'var(--text-muted)' }}
          aria-hidden="true"
        />
      );
  }
}
