'use client';

import { useState, useActionState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BuildingInput } from './building-input';
import { QuickStartChips } from './quick-start-chips';
import { ValuePropsGrid } from './value-props-grid';
import { ScopeModeToggle, type ScopeMode } from './scope-mode-toggle';
import { createProject } from '@/app/actions/projects';

type ActionState = {
  error?: string;
  success?: string;
  projectId?: number;
};

interface WelcomeOnboardingProps {
  sidebar?: ReactNode;
}

export function WelcomeOnboarding({ sidebar }: WelcomeOnboardingProps) {
  const router = useRouter();
  const [scopeMode, setScopeMode] = useState<ScopeMode>('defined');
  const [inputValue, setInputValue] = useState('');

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createProject,
    {}
  );

  // Handle navigation after successful project creation - go directly to chat
  useEffect(() => {
    if (state?.success && state?.projectId) {
      router.push(`/projects/${state.projectId}/chat`);
    }
  }, [state, router]);

  const handleSubmit = (description: string) => {
    const formData = new FormData();

    // Create project with mode-specific initial context
    const projectName = description
      ? description.substring(0, 50) + (description.length > 50 ? '...' : '')
      : scopeMode === 'defined'
        ? 'New Project'
        : 'Discovery Project';

    const modePrefix = scopeMode === 'defined'
      ? '[Mode: Defined Scope]'
      : '[Mode: Guided Discovery]';

    const modeContext = scopeMode === 'defined'
      ? 'User has a defined scope. Ready to extract requirements from their existing product vision.'
      : 'User needs help scoping their product. Start with guided discovery to understand what they want to build.';

    const vision = description
      ? `${modePrefix}\n\n${description}\n\n---\n${modeContext}`
      : `${modePrefix}\n\n${modeContext}`;

    formData.append('name', projectName);
    formData.append('vision', vision);
    formAction(formData);
  };

  const handleChipSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - passed as slot for streaming */}
      {sidebar}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl lg:text-3xl font-bold mb-3"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)'
              }}
            >
              Start your product requirements
            </h1>
            <p
              className="text-base max-w-xl mx-auto"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--text-muted)'
              }}
            >
              Define the structure, decisions, and tradeoffs before you write code.
            </p>
          </div>

          {/* Scope Mode Toggle - THE USER'S REQUESTED FEATURE */}
          <div className="flex justify-center mb-8">
            <ScopeModeToggle
              mode={scopeMode}
              onChange={setScopeMode}
              disabled={isPending}
            />
          </div>

          {/* Error State */}
          {state?.error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 mb-6 max-w-xl mx-auto">
              <p className="text-sm text-red-800 dark:text-red-300">{state.error}</p>
            </div>
          )}

          {/* Building Input */}
          <div className="mb-6">
            <BuildingInput
              onSubmit={handleSubmit}
              isPending={isPending}
              value={inputValue}
              onChange={setInputValue}
              placeholder={
                scopeMode === 'defined'
                  ? "Describe your product vision. What problem does it solve? Who are the users?"
                  : "Tell me about your idea. I'll help you figure out what to build and what to skip."
              }
            />
          </div>

          {/* Quick Start Chips */}
          <div className="mb-10">
            <QuickStartChips
              onSelect={handleChipSelect}
              disabled={isPending}
            />
          </div>

          {/* Value Props */}
          <ValuePropsGrid />
        </div>
      </main>
    </div>
  );
}
