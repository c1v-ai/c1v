'use client';

import { type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Chat Input Component
 * Input field with send button for chat messages
 * Handles form submission and loading states
 */
export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  loading = false,
  disabled = false,
  placeholder = 'Type your message...',
  className,
  children,
  actions,
}: ChatInputProps) {
  const isDisabled = disabled || (loading && !onStop);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading && onStop) {
      onStop();
    } else if (!loading && value.trim()) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex w-full flex-col', className)}
    >
      <div
        className="mx-auto flex w-full max-w-[768px] flex-col gap-2 rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isDisabled}
          className="border-none bg-transparent p-4 outline-none"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
          }}
          autoFocus
        />

        {/* Actions Row */}
        <div className="mb-2 ml-4 mr-2 flex items-center justify-between">
          {/* Left side - Additional actions (e.g., file upload) */}
          <div className="flex items-center gap-3">{children}</div>

          {/* Right side - Custom actions + Send button */}
          <div className="flex items-center gap-2">
            {actions}
            <Button
              type="submit"
              disabled={isDisabled || (!loading && !value.trim())}
              size="sm"
              className="gap-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
