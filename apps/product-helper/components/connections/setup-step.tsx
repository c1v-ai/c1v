'use client';

import { cn } from '@/lib/utils';

interface SetupStepProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function SetupStep({ stepNumber, title, subtitle, children, className }: SetupStepProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-6 shadow-sm', className)}>
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold"
          aria-hidden="true"
        >
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Step {stepNumber}: {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="pl-12 mt-4">
        {children}
      </div>
    </div>
  );
}
