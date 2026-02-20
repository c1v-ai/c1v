'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ProgressCards, type QuickStartResult } from './progress-cards';

/** Props for the QuickStartButton component. */
export interface QuickStartButtonProps {
  /** The project ID to generate a PRD for. */
  projectId: number;
  /** The project name, displayed in the completion summary. */
  projectName: string;
}

type DialogPhase = 'input' | 'generating' | 'complete' | 'error';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

/**
 * QuickStartButton is the entry point for one-click PRD generation.
 *
 * Renders a prominent "Quick Start" button that opens a dialog where the user
 * describes their project in one sentence. On submit, it streams the generation
 * progress via ProgressCards and shows a summary with a link to the generated PRD.
 */
export function QuickStartButton({
  projectId,
  projectName,
}: QuickStartButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<DialogPhase>('input');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<QuickStartResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const charCount = inputValue.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Prevent closing during generation
      if (!nextOpen && phase === 'generating') return;
      setOpen(nextOpen);
      // Reset state when closing
      if (!nextOpen) {
        setPhase('input');
        setInputValue('');
        setResult(null);
        setErrorMessage('');
      }
    },
    [phase]
  );

  const handleGenerate = useCallback(() => {
    if (!isValid) return;
    setPhase('generating');
  }, [isValid]);

  const handleComplete = useCallback((res: QuickStartResult) => {
    setResult(res);
    setPhase('complete');
  }, []);

  const handleError = useCallback((error: string) => {
    setErrorMessage(error);
    setPhase('error');
  }, []);

  const handleViewPRD = useCallback(() => {
    setOpen(false);
    router.push(`/projects/${projectId}`);
  }, [router, projectId]);

  const handleRetry = useCallback(() => {
    setErrorMessage('');
    setPhase('input');
  }, []);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="gap-2"
        style={{
          backgroundColor: 'hsl(var(--primary))',
          color: '#FFFFFF',
        }}
      >
        <Zap className="h-4 w-4" />
        Quick Start
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            'sm:max-w-md',
            phase === 'generating' && 'sm:max-w-lg'
          )}
          onPointerDownOutside={(e) => {
            // Prevent closing during generation
            if (phase === 'generating') e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (phase === 'generating') e.preventDefault();
          }}
        >
          {phase === 'input' && (
            <InputPhase
              inputValue={inputValue}
              charCount={charCount}
              isValid={isValid}
              onInputChange={setInputValue}
              onGenerate={handleGenerate}
            />
          )}

          {phase === 'generating' && (
            <GeneratingPhase
              projectId={projectId}
              userInput={inputValue}
              onComplete={handleComplete}
              onError={handleError}
            />
          )}

          {phase === 'complete' && result && (
            <CompletePhase
              projectName={projectName}
              result={result}
              onViewPRD={handleViewPRD}
            />
          )}

          {phase === 'error' && (
            <ErrorPhase
              errorMessage={errorMessage}
              onRetry={handleRetry}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dialog phase sub-components                                               */
/* -------------------------------------------------------------------------- */

function InputPhase({
  inputValue,
  charCount,
  isValid,
  onInputChange,
  onGenerate,
}: {
  inputValue: string;
  charCount: number;
  isValid: boolean;
  onInputChange: (value: string) => void;
  onGenerate: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Generate PRD in seconds</DialogTitle>
        <DialogDescription>
          Describe your project in one sentence. We'll generate a complete PRD
          with tech stack, user stories, and architecture.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="I want to build..."
          rows={3}
          maxLength={MAX_LENGTH}
          className={cn(
            'w-full resize-none rounded-md border p-3 outline-none',
            'text-base', // 16px prevents iOS zoom
            'focus:ring-2 focus:ring-offset-1',
            'transition-shadow'
          )}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && isValid) {
              e.preventDefault();
              onGenerate();
            }
          }}
          autoFocus
        />

        <div className="flex items-center justify-between">
          <p
            className={cn(
              'text-xs',
              charCount > 0 && charCount < MIN_LENGTH && 'text-amber-500',
              charCount > MAX_LENGTH && 'text-red-500'
            )}
            style={{ color: charCount === 0 ? 'var(--text-muted)' : undefined }}
          >
            {charCount}/{MAX_LENGTH}
            {charCount > 0 && charCount < MIN_LENGTH && (
              <span className="ml-1">
                (min {MIN_LENGTH} characters)
              </span>
            )}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={onGenerate}
          disabled={!isValid}
          className="gap-2"
          style={{
            backgroundColor: isValid ? 'hsl(var(--primary))' : undefined,
            color: isValid ? '#FFFFFF' : undefined,
          }}
        >
          <Zap className="h-4 w-4" />
          Generate
        </Button>
      </DialogFooter>
    </>
  );
}

function GeneratingPhase({
  projectId,
  userInput,
  onComplete,
  onError,
}: {
  projectId: number;
  userInput: string;
  onComplete: (result: QuickStartResult) => void;
  onError: (error: string) => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Generating your PRD</DialogTitle>
        <DialogDescription>
          This typically takes 30-60 seconds. Please don't close this dialog.
        </DialogDescription>
      </DialogHeader>

      <div
        className="rounded-md border p-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <ProgressCards
          projectId={projectId}
          userInput={userInput}
          onComplete={onComplete}
          onError={onError}
        />
      </div>
    </>
  );
}

function CompletePhase({
  projectName,
  result,
  onViewPRD,
}: {
  projectName: string;
  result: QuickStartResult;
  onViewPRD: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>PRD Generated</DialogTitle>
        <DialogDescription>
          Your PRD for <strong>{projectName}</strong> is ready.
        </DialogDescription>
      </DialogHeader>

      <div
        className="rounded-md border p-4 space-y-3"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Completeness
          </span>
          <span
            className="ml-auto text-sm font-bold"
            style={{ color: 'hsl(var(--chart-2))' }}
          >
            {result.completeness}%
          </span>
        </div>

        {result.artifactsGenerated.length > 0 && (
          <div>
            <p
              className="text-xs mb-1"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Artifacts generated
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.artifactsGenerated.map((artifact) => (
                <span
                  key={artifact}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    color: 'hsl(var(--primary))',
                  }}
                >
                  {artifact}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={onViewPRD}
          className="gap-2"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: '#FFFFFF',
          }}
        >
          View PRD
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );
}

function ErrorPhase({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  const router = useRouter();
  const isCreditLimit = errorMessage === 'credit_limit_reached';

  if (isCreditLimit) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Free Credits Used Up</DialogTitle>
          <DialogDescription>
            You&apos;ve used all your free credits. Upgrade your plan to
            continue generating PRDs.
          </DialogDescription>
        </DialogHeader>

        <div
          className="rounded-md border p-4"
          style={{
            backgroundColor: 'hsl(var(--primary) / 0.05)',
            borderColor: 'hsl(var(--primary) / 0.2)',
          }}
        >
          <p
            className="text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            Upgrade to get unlimited AI generation, priority support, and more.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={() => router.push('/pricing')}
            className="gap-2"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: '#FFFFFF',
            }}
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Generation Failed</DialogTitle>
        <DialogDescription>
          Something went wrong while generating your PRD. You can try again or
          adjust your description.
        </DialogDescription>
      </DialogHeader>

      <div
        className="rounded-md border p-4"
        style={{
          backgroundColor: 'hsl(var(--destructive) / 0.05)',
          borderColor: 'hsl(var(--destructive) / 0.2)',
        }}
      >
        <p
          className="text-sm"
          style={{ color: 'hsl(var(--destructive))' }}
        >
          {errorMessage}
        </p>
      </div>

      <DialogFooter>
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2"
        >
          Try Again
        </Button>
      </DialogFooter>
    </>
  );
}
