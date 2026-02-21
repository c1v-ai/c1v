'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight } from 'lucide-react';
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
            'w-full resize-none rounded-xl p-3 outline-none',
            'text-base text-foreground', // 16px prevents iOS zoom
            'bg-black/5 dark:bg-white/15',
            'border border-[rgba(13,13,13,0.15)] dark:border-[rgba(255,255,255,0.2)]',
            'placeholder:text-[rgba(13,13,13,0.6)] dark:placeholder:text-[rgba(255,255,255,0.6)]',
            'focus:ring-2 focus:ring-offset-1',
            'transition-shadow'
          )}
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
              charCount === 0 && 'text-muted-foreground',
              charCount > 0 && charCount < MIN_LENGTH && 'text-amber-500',
              charCount > MAX_LENGTH && 'text-red-500'
            )}
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

      <div className="rounded-xl border border-border p-4 bg-card">
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

      <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Completeness
          </span>
          <span className="ml-auto text-sm font-bold text-green-600 dark:text-green-500">
            {result.completeness}%
          </span>
        </div>

        {result.artifactsGenerated.length > 0 && (
          <div>
            <p className="text-xs mb-1 text-muted-foreground">
              Artifacts generated
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.artifactsGenerated.map((artifact) => (
                <span
                  key={artifact}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
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
  return (
    <>
      <DialogHeader>
        <DialogTitle>Generation Failed</DialogTitle>
        <DialogDescription>
          Something went wrong while generating your PRD. You can try again or
          adjust your description.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-xl border border-destructive/20 p-4 bg-destructive/5">
        <p className="text-sm text-destructive">
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
