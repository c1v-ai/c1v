'use client';

import { type FormEvent, type ReactNode, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Chat Input Component
 * Auto-expanding textarea with send button for chat messages
 * Handles form submission, loading states, and keyboard shortcuts
 * - Enter to submit, Shift+Enter for newline
 */
export interface ChatInputProps {
  value: string;
  // Compatible with Vercel AI SDK's handleInputChange which returns handler for both element types
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading && onStop) {
      onStop();
    } else if (!loading && value.trim()) {
      onSubmit(e);
    }
  };

  // Handle Enter key to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isDisabled && !loading) {
        formRef.current?.requestSubmit();
      } else if (loading && onStop) {
        onStop();
      }
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn('flex w-full flex-col', 'safe-bottom', className)}
    >
      <div
        className="mx-auto flex w-full max-w-4xl flex-col gap-2 rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Textarea Field - Mobile optimized */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          inputMode="text"
          enterKeyHint="send"
          className={cn(
            "border-none bg-transparent p-4 outline-none",
            "text-base", // 16px - prevents iOS zoom on focus
            "min-h-[44px]", // Touch target minimum
            "resize-none" // Prevent resize handle on mobile
          )}
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            fontSize: '16px', // Explicit to prevent iOS zoom
            maxHeight: '200px',
            overflow: 'auto',
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
              className={cn(
                "gap-2",
                "min-h-[44px] min-w-[44px]", // Touch target minimum
                "tap-highlight-none" // Remove tap highlight on mobile
              )}
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
